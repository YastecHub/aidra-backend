import { body, param } from 'express-validator';

export const createDonationValidator = [
  body('campaignId').isMongoId().withMessage('Invalid campaign ID'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('payCurrency').trim().notEmpty().withMessage('Crypto currency is required'),
  body('donorEmail').optional().isEmail().withMessage('Invalid email format')
];

export const campaignIdValidator = [
  param('id').isMongoId().withMessage('Invalid campaign ID')
];
