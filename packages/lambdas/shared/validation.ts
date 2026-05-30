import { ApiError } from './errors';

export function requireQueryParam(params: Record<string, string | undefined>, key: string): string {
  const val = params[key];
  if (!val || val.trim() === '') {
    throw new ApiError('MISSING_PARAM', `Required query parameter '${key}' is missing`, 400);
  }
  return val.trim();
}

export function parseFloat_(params: Record<string, string | undefined>, key: string): number {
  const raw = requireQueryParam(params, key);
  const n = parseFloat(raw);
  if (isNaN(n)) {
    throw new ApiError('INVALID_PARAM', `Parameter '${key}' must be a number`, 400);
  }
  return n;
}

export function parseInt_(params: Record<string, string | undefined>, key: string, defaultVal?: number): number {
  const raw = params[key];
  if (!raw && defaultVal !== undefined) return defaultVal;
  if (!raw) throw new ApiError('MISSING_PARAM', `Required query parameter '${key}' is missing`, 400);
  const n = parseInt(raw, 10);
  if (isNaN(n)) throw new ApiError('INVALID_PARAM', `Parameter '${key}' must be an integer`, 400);
  return n;
}

export function sanitizePlate(plate: string): string {
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length < 3 || clean.length > 10) {
    throw new ApiError('INVALID_PLATE', 'Vehicle plate must be 3-10 alphanumeric characters', 400);
  }
  return clean;
}

export function sanitizeIC(ic: string): string {
  const clean = ic.replace(/[^0-9]/g, '');
  if (clean.length !== 12) {
    throw new ApiError('INVALID_IC', 'IC number must be exactly 12 digits', 400);
  }
  return clean;
}

export function clampRadius(radius: number): number {
  return Math.min(Math.max(radius, 100), 5000);
}

export function validateLatLon(lat: number, lon: number): void {
  if (lat < 0.8 || lat > 7.5 || lon < 99.5 || lon > 119.5) {
    throw new ApiError('OUT_OF_BOUNDS', 'Coordinates are outside Malaysia', 400);
  }
}
