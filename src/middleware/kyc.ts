import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/apiResponse';

export const requireKYC = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.isKYCCompleted) {
    sendError(res, 'KYC verification required', 403);
    return;
  }
  next();
};
