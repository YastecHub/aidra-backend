import Donation from '../models/Donation';
import Campaign from '../models/Campaign';
import * as nowPaymentsService from './nowPaymentsService';
import logger from '../config/logger';
import {
  ApiErrorCode,
  ClientException,
  ForbiddenClientException,
  NotFoundClientException,
  ValidationClientException
} from '../utils/clientError';

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '5');

export const createDonation = async (data: {
  campaignId: string;
  amount: number;
  payCurrency: string;
  donorEmail?: string;
}) => {
  validateDonationInput(data.amount, data.payCurrency);

  const campaign = await Campaign.findById(data.campaignId).select('title status').lean();
  if (!campaign || campaign.status !== 'active') {
    throw new ClientException('Campaign not found or not active', ApiErrorCode.CAMPAIGN_NOT_ACTIVE);
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

export const createDonationCheckout = async (data: {
  campaignId: string;
  amount: number;
  donorEmail?: string;
  payCurrency?: string;
  successUrl?: string;
  cancelUrl?: string;
}) => {
  validateDonationInput(data.amount, data.payCurrency);

  const campaign = await Campaign.findById(data.campaignId).select('title status').lean();
  if (!campaign || campaign.status !== 'active') {
    throw new ClientException('Campaign not found or not active', ApiErrorCode.CAMPAIGN_NOT_ACTIVE);
  }

  const platformFee = data.amount * (PLATFORM_FEE_PERCENT / 100);
  const netAmount = data.amount - platformFee;

  const donation = await Donation.create({
    campaign: data.campaignId,
    amount: data.amount,
    cryptoCurrency: data.payCurrency || null,
    paymentMethod: 'crypto',
    donorEmail: data.donorEmail || null,
    paymentStatus: 'waiting',
    status: 'pending',
    platformFee,
    netAmount
  });

  const invoice = await nowPaymentsService.createInvoice({
    price_amount: data.amount,
    price_currency: 'usd',
    order_id: donation._id.toString(),
    order_description: `Donation to ${campaign.title}`,
    ipn_callback_url: `${process.env.BASE_URL}/api/payments/ipn`,
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    pay_currency: data.payCurrency
  });

  donation.nowPaymentId = invoice.id;
  await donation.save();

  return {
    donationId: donation._id,
    invoiceId: invoice.id,
    invoiceUrl: invoice.invoice_url,
    amount: data.amount,
    currency: 'usd'
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
  const donation = await Donation.findById(donationId)
    .select('campaign amount cryptoAmount cryptoCurrency nowPaymentId payAddress paymentStatus status createdAt updatedAt')
    .lean();
  if (!donation) throw new NotFoundClientException('Donation not found');

  if (donation.nowPaymentId) {
    const liveStatus = await nowPaymentsService.getPaymentStatus(donation.nowPaymentId);
    return { donation, liveStatus };
  }
  return { donation, liveStatus: null };
};

export const getCampaignDonations = async (campaignId: string, userId: string) => {
  const campaign = await Campaign.findOne({ _id: campaignId, owner: userId }).select('_id').lean();
  if (!campaign) throw new ForbiddenClientException('Unauthorized');

  return await Donation.find({ campaign: campaignId })
    .select('donorEmail amount cryptoAmount cryptoCurrency paymentStatus status platformFee netAmount createdAt updatedAt')
    .sort('-createdAt')
    .lean();
};

const validateDonationInput = (amount: number, payCurrency?: string): void => {
  if (!Number.isFinite(Number(amount)) || Number(amount) < 1 || Number(amount) > 1000000) {
    throw new ValidationClientException('Amount must be between $1 and $1,000,000');
  }

  if (payCurrency !== undefined && !/^[a-z0-9]{2,20}$/i.test(payCurrency)) {
    throw new ValidationClientException('Crypto currency must be alphanumeric and 2-20 characters');
  }
};
