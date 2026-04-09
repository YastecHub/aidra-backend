import { param, query } from 'express-validator';

export const donationIdValidator = [
  param('donationId').isMongoId().withMessage('Invalid donation ID')
];

export const estimateValidator = [
  query('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  query('currencyFrom').trim().notEmpty().withMessage('currencyFrom is required'),
  query('currencyTo').trim().notEmpty().withMessage('currencyTo is required')
];
