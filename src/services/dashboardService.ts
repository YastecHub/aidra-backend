import Campaign from '../models/Campaign';
import Donation from '../models/Donation';
import User from '../models/User';

export const getDashboardStats = async (userId: string) => {
  const campaigns = await Campaign.find({ owner: userId });
  const campaignIds = campaigns.map(c => c._id);

  const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const donations = await Donation.find({ campaign: { $in: campaignIds } });
  const pendingPayments = donations.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
  const totalDonors = new Set(donations.map(d => d.donor.toString())).size;

  const activeCampaignsList = campaigns.filter(c => c.status === 'active').slice(0, 2);
  const recentDonations = await Donation.find({ campaign: { $in: campaignIds } })
    .populate('donor', 'fullName')
    .populate('campaign', 'title')
    .sort('-createdAt')
    .limit(5);

  const notifications = [];
  const user = await User.findById(userId);
  if (user && !user.isKYCCompleted) notifications.push({ type: 'kyc', message: 'Complete KYC to receive payments' });
  const underReview = campaigns.filter(c => c.status === 'underReview');
  if (underReview.length) notifications.push({ type: 'review', message: 'A campaign is under review' });

  return {
    stats: { totalRaised, activeCampaigns, pendingPayments, totalDonors },
    activeCampaigns: activeCampaignsList,
    recentDonations,
    notifications
  };
};
