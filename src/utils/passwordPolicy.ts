import { ValidationClientException } from './clientError';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const getPasswordPolicyErrors = (password: unknown): string[] => {
  if (typeof password !== 'string') {
    return ['Password is required'];
  }

  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain a special character (!@#$%^&*)');
  }

  return errors;
};

export const assertStrongPassword = (password: unknown): void => {
  const errors = getPasswordPolicyErrors(password);
  if (errors.length > 0) {
    throw new ValidationClientException('Password does not meet security requirements', errors);
  }
};
