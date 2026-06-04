import { body, param } from 'express-validator';

export const createDonationValidator = [
  body('campaignId').isMongoId().withMessage('Invalid campaign ID'),
  body('amount').isFloat({ min: 1, max: 1000000 }).withMessage('Amount must be between $1 and $1,000,000'),
  body('payCurrency').trim().isLength({ min: 2, max: 20 }).isAlphanumeric().withMessage('Crypto currency must be alphanumeric and 2-20 characters'),
  body('donorEmail').optional().isEmail().normalizeEmail().withMessage('Invalid email format')
];

export const createCheckoutValidator = [
  body('campaignId').isMongoId().withMessage('Invalid campaign ID'),
  body('amount').isFloat({ min: 1, max: 1000000 }).withMessage('Amount must be between $1 and $1,000,000'),
  body('donorEmail').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('payCurrency').optional().trim().isLength({ min: 2, max: 20 }).isAlphanumeric().withMessage('Crypto currency must be alphanumeric and 2-20 characters'),
  body('successUrl').optional().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('successUrl must be a valid HTTP(S) URL'),
  body('cancelUrl').optional().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('cancelUrl must be a valid HTTP(S) URL')
];

export const campaignIdValidator = [
  param('id').isMongoId().withMessage('Invalid campaign ID')
];
