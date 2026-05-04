import { body } from 'express-validator';

export const updateProfileValidator = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('profileImage').optional().isURL().withMessage('Profile image must be a valid URL')
];

export const changePasswordValidator = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

export const submitKYCValidator = [
  // No body validation needed for file uploads
  // File validation is handled by multer middleware
];
