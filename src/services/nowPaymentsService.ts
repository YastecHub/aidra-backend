import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import logger from '../config/logger';

const SANDBOX_BASE = 'https://api-sandbox.nowpayments.io/v1';
const PRODUCTION_BASE = 'https://api.nowpayments.io/v1';

let apiClient: AxiosInstance;

const getClient = (): AxiosInstance => {
  if (!apiClient) {
    const isSandbox = process.env.NOWPAYMENTS_SANDBOX === 'true';
    const baseURL = isSandbox ? SANDBOX_BASE : PRODUCTION_BASE;

    apiClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOWPAYMENTS_API_KEY || ''
      }
    });

    logger.info(`NOWPayments client initialized (${isSandbox ? 'sandbox' : 'production'})`);
  }
  return apiClient;
};

interface CreatePaymentParams {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
}

interface CreatePaymentResponse {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description: string;
  expiration_estimate_date?: string;
}

interface PaymentStatusResponse {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  outcome_amount?: number;
  outcome_currency?: string;
}

export const createPayment = async (params: CreatePaymentParams): Promise<CreatePaymentResponse> => {
  try {
    const response = await getClient().post<CreatePaymentResponse>('/payment', params);
    logger.info(`NOWPayments payment created: ${response.data.payment_id}`);
    return response.data;
  } catch (error: any) {
    logger.error('NOWPayments createPayment error:', error.response?.data || error.message);
    throw new Error('Failed to create payment with NOWPayments');
  }
};

export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
  try {
    const response = await getClient().get<PaymentStatusResponse>(`/payment/${paymentId}`);
    return response.data;
  } catch (error: any) {
    logger.error('NOWPayments getPaymentStatus error:', error.response?.data || error.message);
    throw new Error('Failed to get payment status');
  }
};

export const verifyIPNSignature = (body: Record<string, any>, signature: string): boolean => {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) {
    logger.error('NOWPAYMENTS_IPN_SECRET not configured');
    return false;
  }

  const sortedBody = Object.keys(body).sort().reduce((result: Record<string, any>, key) => {
    result[key] = body[key];
    return result;
  }, {});

  const hmac = crypto.createHmac('sha512', ipnSecret);
  hmac.update(JSON.stringify(sortedBody));
  const digest = hmac.digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
};

export const getAvailableCurrencies = async (): Promise<string[]> => {
  try {
    const response = await getClient().get<{ currencies: string[] }>('/currencies');
    return response.data.currencies;
  } catch (error: any) {
    logger.error('NOWPayments getCurrencies error:', error.response?.data || error.message);
    throw new Error('Failed to get available currencies');
  }
};

interface CreateInvoiceParams {
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  success_url?: string;
  cancel_url?: string;
  pay_currency?: string;
}

interface CreateInvoiceResponse {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: string;
  price_currency: string;
  pay_currency: string | null;
  ipn_callback_url: string;
  invoice_url: string;
  success_url: string | null;
  cancel_url: string | null;
  created_at: string;
  updated_at: string;
}

export const createInvoice = async (params: CreateInvoiceParams): Promise<CreateInvoiceResponse> => {
  try {
    const response = await getClient().post<CreateInvoiceResponse>('/invoice', params);
    logger.info(`NOWPayments invoice created: ${response.data.id}`);
    return response.data;
  } catch (error: any) {
    logger.error('NOWPayments createInvoice error:', error.response?.data || error.message);
    throw new Error('Failed to create invoice with NOWPayments');
  }
};

export const getEstimatedPrice = async (
  amount: number,
  currencyFrom: string,
  currencyTo: string
): Promise<{ estimated_amount: number }> => {
  try {
    const response = await getClient().get('/estimate', {
      params: { amount, currency_from: currencyFrom, currency_to: currencyTo }
    });
    return response.data;
  } catch (error: any) {
    logger.error('NOWPayments getEstimate error:', error.response?.data || error.message);
    throw new Error('Failed to get estimated price');
  }
};
