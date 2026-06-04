export enum ApiErrorCode {
  ACCESS_DENIED = 'ACCESS_DENIED',
  ADMIN_REGISTRATION_DISABLED = 'ADMIN_REGISTRATION_DISABLED',
  CAMPAIGN_ALREADY_ACTIVE = 'CAMPAIGN_ALREADY_ACTIVE',
  CAMPAIGN_NOT_FOUND = 'CAMPAIGN_NOT_FOUND',
  CAMPAIGN_NOT_ACTIVE = 'CAMPAIGN_NOT_ACTIVE',
  CAMPAIGN_UNAUTHORIZED = 'CAMPAIGN_UNAUTHORIZED',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_ADMIN_SECRET = 'INVALID_ADMIN_SECRET',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  INVALID_TOKEN = 'INVALID_TOKEN',
  IPN_PROCESSING_FAILED = 'IPN_PROCESSING_FAILED',
  KYC_NOT_PENDING = 'KYC_NOT_PENDING',
  KYC_REQUIRED = 'KYC_REQUIRED',
  NOT_FOUND = 'NOT_FOUND',
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_SEND_FAILED = 'OTP_SEND_FAILED',
  PAYMENT_PROVIDER_ERROR = 'PAYMENT_PROVIDER_ERROR',
  TOKEN_REQUIRED = 'TOKEN_REQUIRED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export class ClientException extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode,
    public readonly statusCode = 400,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationClientException extends ClientException {
  constructor(message: string, details?: unknown) {
    super(message, ApiErrorCode.VALIDATION_ERROR, 400, details);
  }
}

export class NotFoundClientException extends ClientException {
  constructor(message: string, code: ApiErrorCode = ApiErrorCode.NOT_FOUND) {
    super(message, code, 404);
  }
}

export class ConflictClientException extends ClientException {
  constructor(message: string, code: ApiErrorCode) {
    super(message, code, 409);
  }
}

export class ForbiddenClientException extends ClientException {
  constructor(message: string, code: ApiErrorCode = ApiErrorCode.ACCESS_DENIED) {
    super(message, code, 403);
  }
}

export class UnauthorizedClientException extends ClientException {
  constructor(message: string, code: ApiErrorCode = ApiErrorCode.INVALID_TOKEN) {
    super(message, code, 401);
  }
}
