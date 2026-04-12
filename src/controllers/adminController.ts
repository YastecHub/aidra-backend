import { Response } from 'express';
import { AuthRequest } from '../types';
import * as adminService from '../services/adminService';

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
