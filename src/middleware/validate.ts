import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse';
import { ValidationClientException } from '../utils/clientError';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, new ValidationClientException('Validation failed', errors.array()));
    return;
  }
  next();
};
