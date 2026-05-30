import { ApiErrorResponse } from './types';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorResponse(err: unknown): { statusCode: number; body: string; headers: Record<string, string> } {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
  };

  if (err instanceof ApiError) {
    const body: ApiErrorResponse = { error: err.code, message: err.message, status: err.status };
    return { statusCode: err.status, body: JSON.stringify(body), headers };
  }

  console.error('Unhandled error:', err);
  const body: ApiErrorResponse = {
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    status: 500,
  };
  return { statusCode: 500, body: JSON.stringify(body), headers };
}

export function jsonResponse(data: unknown, status = 200) {
  return {
    statusCode: status,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  };
}
