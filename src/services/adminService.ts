import bcrypt from 'bcryptjs';
import User from '../models/User';
import Campaign from '../models/Campaign';
import Donation from '../models/Donation';
import logger from '../config/logger';
import {
  ApiErrorCode,
  ClientException,
  ConflictClientException,
  NotFoundClientException
} from '../utils/clientError';
import { assertStrongPassword } from '../utils/passwordPolicy';

// ── Admin Registration ──

export const registerAdmin = async (email: string, password: string, fullName: string) => {
  assertStrongPassword(password);
  const existing = await User.findOne({ email }).select('_id').lean();
  if (existing) throw new ConflictClientException('Email already registered', ApiErrorCode.DUPLICATE_EMAIL);

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await User.create({
    email,
    password: hashedPassword,
    fullName,
    role: 'admin',
    isVerified: true,
    isKYCCompleted: true,
    kycStatus: 'approved'
  });

  logger.info(`Admin account created: ${admin._id} (${email})`);
  return {
    message: 'Admin registered successfully',
    user: { _id: admin._id, email: admin.email, fullName: admin.fullName, role: admin.role }
  };
};

// ── KYC Management ──

export const getPendingKYC = async () => {
  return await User.find({ kycStatus: 'pending' })
    .select('fullName email kycStatus kycDocuments createdAt')
    .lean();
};

export const approveKYC = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);
  if (user.kycStatus !== 'pending') throw new ClientException('KYC is not pending', ApiErrorCode.KYC_NOT_PENDING);

  user.kycStatus = 'approved';
  user.isKYCCompleted = true;
  await user.save();

  logger.info(`KYC approved for user: ${userId}`);
  return { message: 'KYC approved successfully' };
};

export const rejectKYC = async (userId: string, reason: string) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);
  if (user.kycStatus !== 'pending') throw new ClientException('KYC is not pending', ApiErrorCode.KYC_NOT_PENDING);

  user.kycStatus = 'rejected';
  user.isKYCCompleted = false;
  await user.save();

  logger.info(`KYC rejected for user: ${userId}, reason: ${reason}`);
  return { message: 'KYC rejected', reason };
};

// ── Campaign Management ──

export const getAllCampaignsAdmin = async (status?: string) => {
  const query = status ? { status } : {};
  return await Campaign.find(query)
    .select('title description goalAmount raisedAmount image owner status category endDate walletAddress createdAt updatedAt')
    .populate('owner', 'fullName email')
    .sort('-createdAt')
    .lean();
};

export const approveCampaign = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new NotFoundClientException('Campaign not found', ApiErrorCode.CAMPAIGN_NOT_FOUND);
  if (campaign.status === 'active') throw new ConflictClientException('Campaign is already active', ApiErrorCode.CAMPAIGN_ALREADY_ACTIVE);

  campaign.status = 'active';
  await campaign.save();

  logger.info(`Campaign approved: ${campaignId}`);
  return { message: 'Campaign activated successfully' };
};

export const rejectCampaign = async (campaignId: string, reason: string) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new NotFoundClientException('Campaign not found', ApiErrorCode.CAMPAIGN_NOT_FOUND);

  campaign.status = 'rejected';
  await campaign.save();

  logger.info(`Campaign rejected: ${campaignId}, reason: ${reason}`);
  return { message: 'Campaign rejected', reason };
};

// ── User Management ──

export const getAllUsers = async () => {
  return await User.find()
    .select('fullName email role isVerified isKYCCompleted kycStatus createdAt')
    .sort('-createdAt')
    .lean();
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId)
    .select('fullName email role isVerified isKYCCompleted kycStatus kycDocuments createdAt')
    .lean();
  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);
  return user;
};

// ── Platform Analytics ──

export const getPlatformStats = async () => {
  const [
    totalUsers,
    verifiedUsers,
    pendingKYC,
    totalCampaigns,
    activeCampaigns,
    draftCampaigns,
    underReviewCampaigns,
    totalDonations,
    pendingDonations,
    donationTotals
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ kycStatus: 'pending' }),
    Campaign.countDocuments(),
    Campaign.countDocuments({ status: 'active' }),
    Campaign.countDocuments({ status: 'draft' }),
    Campaign.countDocuments({ status: 'underReview' }),
    Donation.countDocuments({ status: 'completed' }),
    Donation.countDocuments({ status: 'pending' }),
    Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRaised: { $sum: '$amount' }, totalFees: { $sum: '$platformFee' } } },
      { $project: { _id: 0, totalRaised: 1, totalFees: 1 } }
    ])
  ]);

  const totals = donationTotals[0] ?? { totalRaised: 0, totalFees: 0 };

  return {
    users: { totalUsers, verifiedUsers, pendingKYC },
    campaigns: { totalCampaigns, activeCampaigns, draftCampaigns, underReviewCampaigns },
    donations: { totalDonations, pendingDonations, totalRaised: totals.totalRaised, totalFees: totals.totalFees }
  };
};

// ── Donation Management ──

export const getAllDonations = async (status?: string) => {
  const query = status ? { status } : {};
  return await Donation.find(query)
    .select('campaign amount cryptoAmount cryptoCurrency donorEmail paymentStatus status platformFee netAmount createdAt updatedAt')
    .populate('campaign', 'title')
    .sort('-createdAt')
    .lean();
};
