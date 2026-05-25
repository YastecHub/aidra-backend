import { Response } from 'express';
import { AuthRequest } from '../types';
import * as campaignService from '../services/campaignService';
import { uploadBase64ImageToCloudinary } from '../middleware/upload';

const isValidUrl = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export const createCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestBody = { ...req.body };

    if (requestBody.image && !isValidUrl(requestBody.image)) {
      requestBody.image = await uploadBase64ImageToCloudinary(requestBody.image);
    }

    const campaign = await campaignService.createCampaign(req.user!.userId, requestBody);
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
    const updates = { ...req.body };

    if (updates.image && !isValidUrl(updates.image)) {
      updates.image = await uploadBase64ImageToCloudinary(updates.image);
    }

    const campaign = await campaignService.updateCampaign(req.params.id, req.user!.userId, updates);
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
