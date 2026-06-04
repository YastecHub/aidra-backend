import { param, body, query } from 'express-validator';

export const registerAdminValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Admin password must be between 8 and 128 characters'),
  body('fullName').trim().isLength({ min: 1, max: 120 }).withMessage('Full name must be between 1 and 120 characters')
];

export const userIdValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID')
];

export const campaignIdValidator = [
  param('campaignId').isMongoId().withMessage('Invalid campaign ID')
];

export const rejectValidator = [
  body('reason').trim().isLength({ min: 1, max: 1000 }).withMessage('Reason must be between 1 and 1000 characters')
];

export const statusFilterValidator = [
  query('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status filter')
];

export const campaignStatusFilterValidator = [
  query('status').optional().isIn(['draft', 'active', 'underReview', 'completed', 'rejected']).withMessage('Invalid status filter')
];
