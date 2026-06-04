import { param, query } from 'express-validator';

export const donationIdValidator = [
  param('donationId').isMongoId().withMessage('Invalid donation ID')
];

export const estimateValidator = [
  query('amount').isFloat({ min: 1, max: 1000000 }).withMessage('Amount must be between 1 and 1,000,000'),
  query('currencyFrom').trim().isLength({ min: 2, max: 20 }).isAlphanumeric().withMessage('currencyFrom must be alphanumeric and 2-20 characters'),
  query('currencyTo').trim().isLength({ min: 2, max: 20 }).isAlphanumeric().withMessage('currencyTo must be alphanumeric and 2-20 characters')
];
