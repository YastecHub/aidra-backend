import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const requireKYC = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.isKYCCompleted) {
    res.status(403).json({ error: 'KYC verification required' });
    return;
  }
  next();
};
