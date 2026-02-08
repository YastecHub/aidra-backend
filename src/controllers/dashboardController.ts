import { Response } from 'express';
import { AuthRequest } from '../types';
import * as dashboardService from '../services/dashboardService';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await dashboardService.getDashboardStats(req.user!.userId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
