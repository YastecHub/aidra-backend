import { Request, Response } from 'express';
import * as donationService from '../services/donationService';
import * as nowPaymentsService from '../services/nowPaymentsService';
import logger from '../config/logger';

export const handleIPN = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-nowpayments-sig'] as string;
    if (!signature || !nowPaymentsService.verifyIPNSignature(req.body, signature)) {
      logger.warn('IPN signature verification failed');
      res.status(403).json({ error: 'Invalid signature' });
      return;
    }

    await donationService.processIPN(req.body);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('IPN processing error:', error);
    res.status(500).json({ error: 'IPN processing failed' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await donationService.getPaymentStatus(req.params.donationId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAvailableCurrencies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const currencies = await nowPaymentsService.getAvailableCurrencies();
    res.json({ currencies });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
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
    res.json(estimate);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
