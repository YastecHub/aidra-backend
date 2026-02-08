import { body, param } from 'express-validator';

export const createDonationValidator = [
  body('campaign').isMongoId().withMessage('Invalid campaign ID'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').isIn(['card', 'crypto', 'bank']).withMessage('Invalid payment method'),
  body('transactionId').optional().trim(),
  body('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status')
];

export const campaignIdValidator = [
  param('id').isMongoId().withMessage('Invalid campaign ID')
];
