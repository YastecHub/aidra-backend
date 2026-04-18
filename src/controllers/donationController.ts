import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as donationService from '../services/donationService';

export const createDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await donationService.createDonation(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const createDonationCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await donationService.createDonationCheckout(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getCampaignDonations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const donations = await donationService.getCampaignDonations(req.params.id, req.user!.userId);
    res.json(donations);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
