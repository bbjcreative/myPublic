import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { jsonResponse, errorResponse, ApiError } from '@transit-my/lambda-shared/errors';
import { requireQueryParam, sanitizePlate, sanitizeIC } from '@transit-my/lambda-shared/validation';
import { getSummons } from './summons';
import { getDemerit } from './demerit';

// Primitive in-memory rate limit per Lambda instance: max 10 JPJ calls per 60s window
const requestLog: number[] = [];
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(): void {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  while (requestLog.length > 0 && requestLog[0] < windowStart) requestLog.shift();
  if (requestLog.length >= RATE_LIMIT) {
    throw new ApiError('RATE_LIMIT_EXCEEDED', 'Too many JPJ requests. Please wait before retrying.', 429);
  }
  requestLog.push(now);
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    checkRateLimit();

    const path = event.rawPath ?? '';
    const params = event.queryStringParameters ?? {};

    if (path.endsWith('/jpj/summons')) {
      const plate = sanitizePlate(requireQueryParam(params, 'plate'));
      const result = await getSummons(plate);
      return jsonResponse(result);
    }

    if (path.endsWith('/jpj/demerit')) {
      const ic = sanitizeIC(requireQueryParam(params, 'ic'));
      const result = await getDemerit(ic);
      return jsonResponse(result);
    }

    throw new ApiError('NOT_FOUND', `Unknown path: ${path}`, 404);
  } catch (err) {
    return errorResponse(err) as APIGatewayProxyResultV2;
  }
}
