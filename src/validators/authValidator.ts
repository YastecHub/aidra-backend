import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('role').optional().isIn(['donor', 'campaignOwner']).withMessage('Invalid role')
];

export const verifyEmailValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const forgotPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
];

export const resetPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const resendOTPValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('type').isIn(['emailVerification', 'passwordReset']).withMessage('Invalid OTP type')
];

export const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];
