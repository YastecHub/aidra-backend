import { body, param, query } from 'express-validator';
import validator from 'validator';

const isBase64ImageString = (value: string): boolean => {
  const trimmed = value.trim();
  const dataUriMatch = trimmed.match(/^data:(image\/(jpeg|png|gif));base64,[A-Za-z0-9+/=]+$/);
  if (dataUriMatch) return true;

  if (!validator.isBase64(trimmed)) return false;
  return ['/9j/', 'iVBORw0KGgo', 'R0lGODdh', 'R0lGODlh'].some((prefix) => trimmed.startsWith(prefix));
};

const imageValidator = (value: unknown, { req }: any): boolean => {
  if (req.file) {
    return true;
  }

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Image is required');
  }

  if (validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true })) {
    return true;
  }

  if (isBase64ImageString(value)) {
    return true;
  }

  throw new Error('Image must be a valid URL or base64 image string');
};

export const createCampaignValidator = [
  body('title').trim().isLength({ min: 1, max: 120 }).withMessage('Title must be between 1 and 120 characters'),
  body('description').trim().isLength({ min: 1, max: 5000 }).withMessage('Description must be between 1 and 5000 characters'),
  body('goalAmount').isFloat({ min: 1, max: 100000000 }).withMessage('Goal amount must be between 1 and 100,000,000'),
  body('image').custom(imageValidator),
  body('category').optional().trim().isLength({ max: 80 }).withMessage('Category must be 80 characters or fewer'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('walletAddress').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Wallet address must be between 1 and 200 characters')
];

export const updateCampaignValidator = [
  param('id').isMongoId().withMessage('Invalid campaign ID'),
  body('title').optional().trim().isLength({ min: 1, max: 120 }).withMessage('Title must be between 1 and 120 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 5000 }).withMessage('Description must be between 1 and 5000 characters'),
  body('goalAmount').optional().isFloat({ min: 1, max: 100000000 }).withMessage('Goal amount must be between 1 and 100,000,000'),
  body('image').optional().custom((value, { req }) => {
    if (req.file) {
      return true;
    }

    if (typeof value !== 'string' || !value.trim()) {
      throw new Error('Image must be a non-empty string');
    }

    if (validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true })) {
      return true;
    }

    if (isBase64ImageString(value)) {
      return true;
    }

    throw new Error('Image must be a valid URL or base64 image string');
  }),
  body('category').optional().trim().isLength({ max: 80 }).withMessage('Category must be 80 characters or fewer'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('walletAddress').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Wallet address must be between 1 and 200 characters')
];

export const campaignIdValidator = [
  param('id').isMongoId().withMessage('Invalid campaign ID')
];

export const getCampaignsValidator = [
  query('category').optional().trim(),
  query('sort').optional().isIn(['createdAt', '-createdAt', 'title', '-title']).withMessage('Invalid sort parameter')
];
