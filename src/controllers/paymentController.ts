import { Request, Response } from 'express';
import * as donationService from '../services/donationService';
import * as nowPaymentsService from '../services/nowPaymentsService';
import logger from '../config/logger';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const handleIPN = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-nowpayments-sig'] as string;
    if (!signature || !nowPaymentsService.verifyIPNSignature(req.body, signature)) {
      logger.warn('IPN signature verification failed');
      sendError(res, 'Invalid signature', 403);
      return;
    }

    await donationService.processIPN(req.body);
    sendSuccess(res, { status: 'ok' }, 200, 'IPN processed successfully');
  } catch (error) {
    logger.error('IPN processing error:', error);
    sendError(res, 'IPN processing failed', 500);
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await donationService.getPaymentStatus(req.params.donationId);
    sendSuccess(res, result, 200, 'Payment status retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};

export const getAvailableCurrencies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const currencies = await nowPaymentsService.getAvailableCurrencies();
    sendSuccess(res, { currencies }, 200, 'Available currencies retrieved successfully');
  } catch (error) {
    sendError(res, error, 500);
  }
};

export const getEstimatedPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currencyFrom, currencyTo } = req.query;
    const estimate = await nowPaymentsService.getEstimatedPrice(
      parseFloat(amount as string),
      currencyFrom as string,
      currencyTo as string
    );
    sendSuccess(res, estimate, 200, 'Estimated price retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};
