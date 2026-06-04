import Campaign from '../models/Campaign';
import Donation from '../models/Donation';
import User from '../models/User';
import { ApiErrorCode, NotFoundClientException } from '../utils/clientError';

export const getDashboardStats = async (userId: string) => {
  const campaigns = await Campaign.find({ owner: userId })
    .select('title description goalAmount raisedAmount image status category endDate createdAt updatedAt')
    .sort('-createdAt')
    .lean();
  const campaignIds = campaigns.map(c => c._id);

  const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const activeCampaignsList = campaigns.filter(c => c.status === 'active').slice(0, 2);
  const [donationStats, recentDonations, user] = await Promise.all([
    Donation.aggregate([
      { $match: { campaign: { $in: campaignIds } } },
      {
        $group: {
          _id: null,
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
          },
          totalDonations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $project: { _id: 0, pendingPayments: 1, totalDonations: 1 } }
    ]),
    Donation.find({ campaign: { $in: campaignIds } })
      .select('campaign donorEmail amount cryptoAmount cryptoCurrency paymentStatus status createdAt')
      .populate('campaign', 'title')
      .sort('-createdAt')
      .limit(5)
      .lean(),
    User.findById(userId).select('isKYCCompleted').lean()
  ]);

  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);

  const notifications = [];
  if (!user.isKYCCompleted) notifications.push({ type: 'kyc', message: 'Complete KYC to receive payments' });
  const underReview = campaigns.filter(c => c.status === 'underReview');
  if (underReview.length) notifications.push({ type: 'review', message: 'A campaign is under review' });
  const totals = donationStats[0] ?? { pendingPayments: 0, totalDonations: 0 };

  return {
    stats: {
      totalRaised,
      activeCampaigns,
      pendingPayments: totals.pendingPayments,
      totalDonations: totals.totalDonations
    },
    activeCampaigns: activeCampaignsList,
    recentDonations,
    notifications
  };
};
