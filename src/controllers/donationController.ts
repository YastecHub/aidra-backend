import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as donationService from '../services/donationService';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const createDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await donationService.createDonation(req.body);
    sendSuccess(res, result, 201, 'Donation payment created successfully');
  } catch (error) {
    sendError(res, error);
  }
};

export const createDonationCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await donationService.createDonationCheckout(req.body);
    sendSuccess(res, result, 201, 'Donation checkout created successfully');
  } catch (error) {
    sendError(res, error);
  }
};

export const getCampaignDonations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const donations = await donationService.getCampaignDonations(req.params.id, req.user!.userId);
    sendSuccess(res, donations, 200, 'Donations retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};
