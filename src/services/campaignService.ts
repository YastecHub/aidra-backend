import Campaign from '../models/Campaign';
import { ApiErrorCode, ForbiddenClientException, NotFoundClientException } from '../utils/clientError';

export const createCampaign = async (userId: string, data: any) => {
  const campaign = await Campaign.create({
    ...getCampaignPayload(data),
    owner: userId,
    status: 'underReview'
  });
  return campaign;
};

export const getAllCampaigns = async (filters: any = {}, sort: string = 'createdAt') => {
  const query = { status: 'active', ...filters };
  return await Campaign.find(query)
    .select('title description goalAmount raisedAmount image owner status category endDate walletAddress createdAt updatedAt')
    .populate('owner', 'fullName profileImage')
    .sort(sort)
    .lean();
};

export const getCampaignById = async (id: string) => {
  const campaign = await Campaign.findById(id)
    .select('title description goalAmount raisedAmount image owner status category endDate walletAddress createdAt updatedAt')
    .populate('owner', 'fullName profileImage email')
    .lean();

  if (!campaign) throw new NotFoundClientException('Campaign not found', ApiErrorCode.CAMPAIGN_NOT_FOUND);
  return campaign;
};

export const updateCampaign = async (id: string, userId: string, updates: any) => {
  const campaign = await Campaign.findOne({ _id: id, owner: userId });
  if (!campaign) {
    throw new ForbiddenClientException('Campaign not found or unauthorized', ApiErrorCode.CAMPAIGN_UNAUTHORIZED);
  }

  Object.assign(campaign, getCampaignPayload(updates));
  await campaign.save();
  return campaign;
};

export const deleteCampaign = async (id: string, userId: string) => {
  const campaign = await Campaign.findOneAndDelete({ _id: id, owner: userId });
  if (!campaign) {
    throw new ForbiddenClientException('Campaign not found or unauthorized', ApiErrorCode.CAMPAIGN_UNAUTHORIZED);
  }
  return { message: 'Campaign deleted' };
};

export const getMyCampaigns = async (userId: string) => {
  return await Campaign.find({ owner: userId })
    .select('title description goalAmount raisedAmount image owner status category endDate walletAddress createdAt updatedAt')
    .sort('-createdAt')
    .lean();
};

const getCampaignPayload = (data: any) => {
  const allowedFields = ['title', 'description', 'goalAmount', 'image', 'category', 'endDate', 'walletAddress'];
  return allowedFields.reduce((payload: Record<string, unknown>, field) => {
    if (data[field] !== undefined) {
      payload[field] = data[field];
    }
    return payload;
  }, {});
};
