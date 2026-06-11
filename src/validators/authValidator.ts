import { body } from 'express-validator';
import { optionalPasswordConfirmationValidator, strongPasswordValidator } from './passwordValidator';

export const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  strongPasswordValidator('password'),
  optionalPasswordConfirmationValidator('password'),
  body('fullName').trim().isLength({ min: 1, max: 120 }).withMessage('Full name must be between 1 and 120 characters'),
  body('role').optional().isIn(['campaignOwner']).withMessage('Invalid role')
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
  strongPasswordValidator('newPassword'),
  optionalPasswordConfirmationValidator('newPassword')
];

export const resendOTPValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('type').isIn(['emailVerification', 'passwordReset']).withMessage('Invalid OTP type')
];

export const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];
