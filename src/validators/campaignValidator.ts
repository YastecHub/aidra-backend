import { body, param, query } from 'express-validator';

export const createCampaignValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('goalAmount').isFloat({ min: 1 }).withMessage('Goal amount must be greater than 0'),
  body('image').isURL().withMessage('Image must be a valid URL'),
  body('category').optional().trim(),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date')
];

export const updateCampaignValidator = [
  param('id').isMongoId().withMessage('Invalid campaign ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('goalAmount').optional().isFloat({ min: 1 }).withMessage('Goal amount must be greater than 0'),
  body('image').optional().isURL().withMessage('Image must be a valid URL')
];

export const campaignIdValidator = [
  param('id').isMongoId().withMessage('Invalid campaign ID')
];

export const getCampaignsValidator = [
  query('category').optional().trim(),
  query('sort').optional().isIn(['createdAt', '-createdAt', 'title', '-title']).withMessage('Invalid sort parameter')
];
