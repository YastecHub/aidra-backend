import Donation from '../models/Donation';
import Campaign from '../models/Campaign';

export const createDonation = async (userId: string, data: any) => {
  const donation = await Donation.create({ ...data, donor: userId });
  
  if (donation.status === 'completed') {
    await Campaign.findByIdAndUpdate(data.campaign, { $inc: { raisedAmount: data.amount } });
  }

  return donation;
};

export const getMyDonations = async (userId: string) => {
  return await Donation.find({ donor: userId }).populate('campaign', 'title image');
};

export const getCampaignDonations = async (campaignId: string, userId: string) => {
  const campaign = await Campaign.findOne({ _id: campaignId, owner: userId });
  if (!campaign) throw new Error('Unauthorized');

  return await Donation.find({ campaign: campaignId }).populate('donor', 'fullName email');
};
