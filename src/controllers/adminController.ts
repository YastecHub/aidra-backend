import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as adminService from '../services/adminService';
import { sendError, sendSuccess } from '../utils/apiResponse';
import { ApiErrorCode, ClientException, ForbiddenClientException } from '../utils/clientError';

// ── Admin Registration (secret-protected) ──

export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const providedSecret = req.headers['x-admin-secret'] as string;
    const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

    if (!expectedSecret) {
      sendError(res, new ClientException('Admin registration is disabled (secret not configured)', ApiErrorCode.ADMIN_REGISTRATION_DISABLED, 500));
      return;
    }
    if (providedSecret !== expectedSecret) {
      sendError(res, new ForbiddenClientException('Invalid admin secret', ApiErrorCode.INVALID_ADMIN_SECRET));
      return;
    }

    const { email, password, fullName } = req.body;
    const result = await adminService.registerAdmin(email, password, fullName);
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error);
  }
};

// ── KYC ──

export const getPendingKYC = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await adminService.getPendingKYC();
    sendSuccess(res, users, 200, 'Pending KYC users retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};

export const approveKYC = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.approveKYC(req.params.userId);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

export const rejectKYC = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.rejectKYC(req.params.userId, req.body.reason);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

// ── Campaigns ──

export const getAllCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await adminService.getAllCampaignsAdmin(req.query.status as string);
    sendSuccess(res, campaigns, 200, 'Campaigns retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};

export const approveCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.approveCampaign(req.params.campaignId);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

export const rejectCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.rejectCampaign(req.params.campaignId, req.body.reason);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

// ── Users ──

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await adminService.getAllUsers();
    sendSuccess(res, users, 200, 'Users retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await adminService.getUserById(req.params.userId);
    sendSuccess(res, user, 200, 'User retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};

// ── Analytics ──

export const getPlatformStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getPlatformStats();
    sendSuccess(res, stats, 200, 'Platform stats retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};

// ── Donations ──

export const getAllDonations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const donations = await adminService.getAllDonations(req.query.status as string);
    sendSuccess(res, donations, 200, 'Donations retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};
