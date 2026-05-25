import { body, param, query } from 'express-validator';
import validator from 'validator';

const isBase64ImageString = (value: string): boolean => {
  const trimmed = value.trim();
  const dataUriMatch = trimmed.match(/^data:(image\/(jpeg|png|gif));base64,[A-Za-z0-9+/=]+$/);
  if (dataUriMatch) return true;

  if (!validator.isBase64(trimmed)) return false;
  return ['/9j/', 'iVBORw0KGgo', 'R0lGODdh', 'R0lGODlh'].some((prefix) => trimmed.startsWith(prefix));
};

const imageValidator = (value: unknown): boolean => {
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
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('goalAmount').isFloat({ min: 1 }).withMessage('Goal amount must be greater than 0'),
  body('image').custom(imageValidator),
  body('category').optional().trim(),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('walletAddress').optional().trim().notEmpty().withMessage('Wallet address cannot be empty')
];

export const updateCampaignValidator = [
  param('id').isMongoId().withMessage('Invalid campaign ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('goalAmount').optional().isFloat({ min: 1 }).withMessage('Goal amount must be greater than 0'),
  body('image').optional().custom((value) => {
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
  body('walletAddress').optional().trim().notEmpty().withMessage('Wallet address cannot be empty')
];

export const campaignIdValidator = [
  param('id').isMongoId().withMessage('Invalid campaign ID')
];

export const getCampaignsValidator = [
  query('category').optional().trim(),
  query('sort').optional().isIn(['createdAt', '-createdAt', 'title', '-title']).withMessage('Invalid sort parameter')
];
