import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';
import { ApiErrorCode, UnauthorizedClientException } from '../utils/clientError';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      sendError(res, new UnauthorizedClientException('No token provided', ApiErrorCode.TOKEN_REQUIRED));
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, new UnauthorizedClientException('Invalid or expired token', ApiErrorCode.INVALID_TOKEN));
  }
};
