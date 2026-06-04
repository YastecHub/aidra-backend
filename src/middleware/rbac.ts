import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/apiResponse';
import { ForbiddenClientException } from '../utils/clientError';

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, new ForbiddenClientException('Access denied'));
      return;
    }
    next();
  };
};
