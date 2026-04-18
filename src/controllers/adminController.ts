import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as adminService from '../services/adminService';

// ── Admin Registration (secret-protected) ──

export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const providedSecret = req.headers['x-admin-secret'] as string;
    const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

    if (!expectedSecret) {
      res.status(500).json({ error: 'Admin registration is disabled (secret not configured)' });
      return;
    }
    if (providedSecret !== expectedSecret) {
      res.status(403).json({ error: 'Invalid admin secret' });
      return;
    }

    const { email, password, fullName } = req.body;
    const result = await adminService.registerAdmin(email, password, fullName);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// ── KYC ──

export const getPendingKYC = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await adminService.getPendingKYC();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const approveKYC = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.approveKYC(req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const rejectKYC = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.rejectKYC(req.params.userId, req.body.reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// ── Campaigns ──

export const getAllCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await adminService.getAllCampaignsAdmin(req.query.status as string);
    res.json(campaigns);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const approveCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.approveCampaign(req.params.campaignId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const rejectCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.rejectCampaign(req.params.campaignId, req.body.reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// ── Users ──

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await adminService.getUserById(req.params.userId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// ── Analytics ──

export const getPlatformStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getPlatformStats();
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// ── Donations ──

export const getAllDonations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const donations = await adminService.getAllDonations(req.query.status as string);
    res.json(donations);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
