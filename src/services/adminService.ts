import User from '../models/User';
import Campaign from '../models/Campaign';
import Donation from '../models/Donation';
import logger from '../config/logger';

// ── KYC Management ──

export const getPendingKYC = async () => {
  return await User.find({ kycStatus: 'pending' }).select('fullName email kycStatus kycDocuments createdAt');
};

export const approveKYC = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.kycStatus !== 'pending') throw new Error('KYC is not pending');

  user.kycStatus = 'approved';
  user.isKYCCompleted = true;
  await user.save();

  logger.info(`KYC approved for user: ${userId}`);
  return { message: 'KYC approved successfully' };
};

export const rejectKYC = async (userId: string, reason: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.kycStatus !== 'pending') throw new Error('KYC is not pending');

  user.kycStatus = 'rejected';
  user.isKYCCompleted = false;
  await user.save();

  logger.info(`KYC rejected for user: ${userId}, reason: ${reason}`);
  return { message: 'KYC rejected', reason };
};

// ── Campaign Management ──

export const getAllCampaignsAdmin = async (status?: string) => {
  const query = status ? { status } : {};
  return await Campaign.find(query).populate('owner', 'fullName email').sort('-createdAt');
};

export const approveCampaign = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  if (campaign.status === 'active') throw new Error('Campaign is already active');

  campaign.status = 'active';
  await campaign.save();

  logger.info(`Campaign approved: ${campaignId}`);
  return { message: 'Campaign activated successfully' };
};

export const rejectCampaign = async (campaignId: string, reason: string) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  campaign.status = 'rejected';
  await campaign.save();

  logger.info(`Campaign rejected: ${campaignId}, reason: ${reason}`);
  return { message: 'Campaign rejected', reason };
};

// ── User Management ──

export const getAllUsers = async () => {
  return await User.find().select('fullName email role isVerified isKYCCompleted kycStatus createdAt').sort('-createdAt');
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('fullName email role isVerified isKYCCompleted kycStatus kycDocuments createdAt');
  if (!user) throw new Error('User not found');
  return user;
};

// ── Platform Analytics ──

export const getPlatformStats = async () => {
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  const pendingKYC = await User.countDocuments({ kycStatus: 'pending' });

  const totalCampaigns = await Campaign.countDocuments();
  const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
  const draftCampaigns = await Campaign.countDocuments({ status: 'draft' });
  const underReviewCampaigns = await Campaign.countDocuments({ status: 'underReview' });

  const totalDonations = await Donation.countDocuments({ status: 'completed' });
  const pendingDonations = await Donation.countDocuments({ status: 'pending' });

  const completedDonations = await Donation.find({ status: 'completed' });
  const totalRaised = completedDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalFees = completedDonations.reduce((sum, d) => sum + (d.platformFee || 0), 0);

  return {
    users: { totalUsers, verifiedUsers, pendingKYC },
    campaigns: { totalCampaigns, activeCampaigns, draftCampaigns, underReviewCampaigns },
    donations: { totalDonations, pendingDonations, totalRaised, totalFees }
  };
};

// ── Donation Management ──

export const getAllDonations = async (status?: string) => {
  const query = status ? { status } : {};
  return await Donation.find(query)
    .populate('campaign', 'title')
    .sort('-createdAt');
};
