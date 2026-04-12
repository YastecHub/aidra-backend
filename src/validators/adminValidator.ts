import { param, body, query } from 'express-validator';

export const userIdValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID')
];

export const campaignIdValidator = [
  param('campaignId').isMongoId().withMessage('Invalid campaign ID')
];

export const rejectValidator = [
  body('reason').trim().notEmpty().withMessage('Reason is required')
];

export const statusFilterValidator = [
  query('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status filter')
];

export const campaignStatusFilterValidator = [
  query('status').optional().isIn(['draft', 'active', 'underReview', 'completed', 'rejected']).withMessage('Invalid status filter')
];
