import { Response } from 'express';
import { AuthRequest } from '../types';
import * as campaignService from '../services/campaignService';
import { uploadBase64ImageToCloudinary, uploadCampaignFileToCloudinary } from '../middleware/upload';
import { sendError, sendSuccess } from '../utils/apiResponse';

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

    if (req.file) {
      requestBody.image = await uploadCampaignFileToCloudinary(req.file);
    } else if (requestBody.image && !isValidUrl(requestBody.image)) {
      requestBody.image = await uploadBase64ImageToCloudinary(requestBody.image);
    }

    const campaign = await campaignService.createCampaign(req.user!.userId, requestBody);
    sendSuccess(res, campaign, 201, 'Campaign created and submitted for review');
  } catch (error) {
    sendError(res, error);
  }
};

export const getAllCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, sort } = req.query;
    const filters = category ? { category } : {};
    const campaigns = await campaignService.getAllCampaigns(filters, sort as string);
    sendSuccess(res, campaigns, 200, 'Active campaigns retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    sendSuccess(res, campaign, 200, 'Campaign retrieved successfully');
  } catch (error) {
    sendError(res, error, 404);
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      updates.image = await uploadCampaignFileToCloudinary(req.file);
    } else if (updates.image && !isValidUrl(updates.image)) {
      updates.image = await uploadBase64ImageToCloudinary(updates.image);
    }

    const campaign = await campaignService.updateCampaign(req.params.id, req.user!.userId, updates);
    sendSuccess(res, campaign, 200, 'Campaign updated successfully');
  } catch (error) {
    sendError(res, error);
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await campaignService.deleteCampaign(req.params.id, req.user!.userId);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

export const getMyCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await campaignService.getMyCampaigns(req.user!.userId);
    sendSuccess(res, campaigns, 200, 'Campaigns retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};
