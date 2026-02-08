import { Response } from 'express';
import { AuthRequest } from '../types';
import * as campaignService from '../services/campaignService';

export const createCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await campaignService.createCampaign(req.user!.userId, req.body);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAllCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, sort } = req.query;
    const filters = category ? { category } : {};
    const campaigns = await campaignService.getAllCampaigns(filters, sort as string);
    res.json(campaigns);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    res.json(campaign);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await campaignService.updateCampaign(req.params.id, req.user!.userId, req.body);
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await campaignService.deleteCampaign(req.params.id, req.user!.userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getMyCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await campaignService.getMyCampaigns(req.user!.userId);
    res.json(campaigns);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
