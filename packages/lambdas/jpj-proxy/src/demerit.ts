import axios from 'axios';
import { ApiError } from '@transit-my/lambda-shared/errors';

const JPJ_BASE = 'https://www.mygdx.gov.my/api';

export interface DemeritResponse {
  ic: string;
  points_used: number;
  points_remaining: number;
  licence_status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';
}

export async function getDemerit(ic: string): Promise<DemeritResponse> {
  try {
    const response = await axios.post(
      `${JPJ_BASE}/demerit`,
      { ic_no: ic },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15_000,
      }
    );

    const data = response.data as {
      data?: {
        points_used?: number;
        licence_status?: string;
      };
    };
    const item = data?.data ?? {};
    const pointsUsed = Number(item.points_used ?? 0);
    const MAX_POINTS = 20;

    const statusRaw = (item.licence_status ?? 'ACTIVE').toUpperCase();
    const licenceStatus: DemeritResponse['licence_status'] =
      ['ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED'].includes(statusRaw)
        ? (statusRaw as DemeritResponse['licence_status'])
        : 'ACTIVE';

    return {
      ic,
      points_used: pointsUsed,
      points_remaining: Math.max(0, MAX_POINTS - pointsUsed),
      licence_status: licenceStatus,
    };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return { ic, points_used: 0, points_remaining: 20, licence_status: 'ACTIVE' };
    }
    throw new ApiError('JPJ_DEMERIT_ERROR', 'Failed to retrieve demerit points from JPJ', 502);
  }
}
