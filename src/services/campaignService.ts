import Campaign from '../models/Campaign';

export const createCampaign = async (userId: string, data: any) => {
  const campaign = await Campaign.create({ ...data, owner: userId });
  return campaign;
};

export const getAllCampaigns = async (filters: any = {}, sort: string = 'createdAt') => {
  const query = { status: 'active', ...filters };
  return await Campaign.find(query).populate('owner', 'fullName profileImage').sort(sort);
};

export const getCampaignById = async (id: string) => {
  return await Campaign.findById(id).populate('owner', 'fullName profileImage email');
};

export const updateCampaign = async (id: string, userId: string, updates: any) => {
  const campaign = await Campaign.findOne({ _id: id, owner: userId });
  if (!campaign) throw new Error('Campaign not found or unauthorized');

  Object.assign(campaign, updates);
  await campaign.save();
  return campaign;
};

export const deleteCampaign = async (id: string, userId: string) => {
  const campaign = await Campaign.findOneAndDelete({ _id: id, owner: userId });
  if (!campaign) throw new Error('Campaign not found or unauthorized');
  return { message: 'Campaign deleted' };
};

export const getMyCampaigns = async (userId: string) => {
  return await Campaign.find({ owner: userId });
};
