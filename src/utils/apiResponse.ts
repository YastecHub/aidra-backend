import { Response } from 'express';
import { ClientException } from './clientError';

type ResponseBody<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  code?: string;
  error?: string;
  errors?: unknown;
  timestamp: string;
};

const DEFAULT_SUCCESS_MESSAGE = 'Request completed successfully';
const DEFAULT_ERROR_MESSAGE = 'Request failed';

const extractPayload = <T>(payload?: T, fallbackMessage = DEFAULT_SUCCESS_MESSAGE) => {
  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    'message' in payload &&
    typeof (payload as { message?: unknown }).message === 'string'
  ) {
    const { message, ...data } = payload as { message: string; [key: string]: unknown };
    return {
      message,
      data: Object.keys(data).length ? (data as T) : null
    };
  }

  return {
    message: fallbackMessage,
    data: payload ?? null
  };
};

export const sendSuccess = <T>(
  res: Response,
  payload?: T,
  statusCode = 200,
  fallbackMessage = DEFAULT_SUCCESS_MESSAGE
): void => {
  const { message, data } = extractPayload(payload, fallbackMessage);

  const body: ResponseBody<typeof data> = {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  error: unknown,
  statusCode = 400,
  details?: unknown
): void => {
  const isClientError = error instanceof ClientException;
  const resolvedStatusCode = isClientError ? error.statusCode : statusCode;
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : DEFAULT_ERROR_MESSAGE;

  const body: ResponseBody<null> = {
    success: false,
    statusCode: resolvedStatusCode,
    message,
    data: null,
    error: message,
    timestamp: new Date().toISOString()
  };

  if (isClientError) {
    body.code = error.code;
  }

  const errorDetails = isClientError ? error.details : details;
  if (errorDetails !== undefined) {
    body.errors = errorDetails;
  }

  res.status(resolvedStatusCode).json(body);
};
