import { Response } from 'express';
import { AuthRequest } from '../types';
import * as dashboardService from '../services/dashboardService';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await dashboardService.getDashboardStats(req.user!.userId);
    sendSuccess(res, data, 200, 'Dashboard data retrieved successfully');
  } catch (error) {
    sendError(res, error);
  }
};
