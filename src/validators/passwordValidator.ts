import { body, ValidationChain } from 'express-validator';
import { getPasswordPolicyErrors } from '../utils/passwordPolicy';

export const strongPasswordValidator = (field: string): ValidationChain =>
  body(field).custom((password) => {
    const errors = getPasswordPolicyErrors(password);
    if (errors.length > 0) {
      throw new Error(errors.join('. '));
    }
    return true;
  });

export const optionalPasswordConfirmationValidator = (
  passwordField: string,
  confirmationField = 'confirmPassword'
): ValidationChain =>
  body(confirmationField)
    .optional()
    .custom((confirmation, { req }) => confirmation === req.body[passwordField])
    .withMessage('Passwords do not match');
