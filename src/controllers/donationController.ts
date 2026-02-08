import { Response } from 'express';
import { AuthRequest } from '../types';
import * as donationService from '../services/donationService';

export const createDonation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const donation = await donationService.createDonation(req.user!.userId, req.body);
    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getMyDonations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const donations = await donationService.getMyDonations(req.user!.userId);
    res.json(donations);
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
