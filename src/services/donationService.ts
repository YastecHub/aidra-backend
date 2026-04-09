import Donation from '../models/Donation';
import Campaign from '../models/Campaign';
import * as nowPaymentsService from './nowPaymentsService';
import logger from '../config/logger';

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '5');

export const createDonation = async (data: {
  campaignId: string;
  amount: number;
  payCurrency: string;
  donorEmail?: string;
}) => {
  const campaign = await Campaign.findById(data.campaignId);
  if (!campaign || campaign.status !== 'active') {
    throw new Error('Campaign not found or not active');
  }

  const platformFee = data.amount * (PLATFORM_FEE_PERCENT / 100);
  const netAmount = data.amount - platformFee;

  const donation = await Donation.create({
    campaign: data.campaignId,
    amount: data.amount,
    cryptoCurrency: data.payCurrency,
    paymentMethod: 'crypto',
    donorEmail: data.donorEmail || null,
    paymentStatus: 'waiting',
    status: 'pending',
    platformFee,
    netAmount
  });

  const payment = await nowPaymentsService.createPayment({
    price_amount: data.amount,
    price_currency: 'usd',
    pay_currency: data.payCurrency,
    order_id: donation._id.toString(),
    order_description: `Donation to ${campaign.title}`,
    ipn_callback_url: `${process.env.BASE_URL}/api/payments/ipn`
  });

  donation.nowPaymentId = payment.payment_id.toString();
  donation.payAddress = payment.pay_address;
  donation.cryptoAmount = payment.pay_amount;
  await donation.save();

  return {
    donationId: donation._id,
    nowPaymentId: payment.payment_id,
    payAddress: payment.pay_address,
    payAmount: payment.pay_amount,
    payCurrency: payment.pay_currency,
    expiresAt: payment.expiration_estimate_date || null
  };
};

export const processIPN = async (ipnData: any) => {
  const { order_id, payment_status } = ipnData;

  const donation = await Donation.findById(order_id);
  if (!donation) {
    logger.warn(`IPN for unknown donation: ${order_id}`);
    return;
  }

  if (donation.status === 'completed' && ['finished', 'confirmed'].includes(payment_status)) {
    logger.info(`Duplicate IPN for already completed donation: ${order_id}`);
    return;
  }

  donation.paymentStatus = payment_status;
  donation.ipnData = ipnData;

  if (ipnData.txid) {
    donation.txHash = ipnData.txid;
  }

  if (['finished', 'confirmed'].includes(payment_status)) {
    donation.status = 'completed';
    await Campaign.findByIdAndUpdate(donation.campaign, {
      $inc: { raisedAmount: donation.netAmount }
    });
  } else if (['failed', 'refunded', 'expired'].includes(payment_status)) {
    donation.status = 'failed';
  }

  await donation.save();
  logger.info(`IPN processed for donation ${order_id}: ${payment_status}`);
};

export const getPaymentStatus = async (donationId: string) => {
  const donation = await Donation.findById(donationId);
  if (!donation) throw new Error('Donation not found');

  if (donation.nowPaymentId) {
    const liveStatus = await nowPaymentsService.getPaymentStatus(donation.nowPaymentId);
    return { donation, liveStatus };
  }
  return { donation, liveStatus: null };
};

export const getCampaignDonations = async (campaignId: string, userId: string) => {
  const campaign = await Campaign.findOne({ _id: campaignId, owner: userId });
  if (!campaign) throw new Error('Unauthorized');

  return await Donation.find({ campaign: campaignId }).sort('-createdAt');
};
