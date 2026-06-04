import { body } from 'express-validator';

export const updateProfileValidator = [
  body('fullName').optional().trim().isLength({ min: 1, max: 120 }).withMessage('Full name must be between 1 and 120 characters'),
  body('profileImage').optional().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Profile image must be a valid HTTP(S) URL')
];

export const changePasswordValidator = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 6, max: 128 }).withMessage('New password must be between 6 and 128 characters')
];

export const submitKYCValidator = [
  body('documents').optional().isArray().withMessage('documents must be an array of base64 data URIs')
];
