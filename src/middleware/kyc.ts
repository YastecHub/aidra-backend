import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/apiResponse';
import { ApiErrorCode, ForbiddenClientException } from '../utils/clientError';

export const requireKYC = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.isKYCCompleted) {
    sendError(res, new ForbiddenClientException('KYC verification required', ApiErrorCode.KYC_REQUIRED));
    return;
  }
  next();
};
