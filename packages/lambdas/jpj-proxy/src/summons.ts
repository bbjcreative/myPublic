import axios from 'axios';
import { ApiError } from '@transit-my/lambda-shared/errors';

const JPJ_BASE = 'https://www.mygdx.gov.my/api';

export interface SummonsRecord {
  id: string;
  date: string;
  offence: string;
  amount_myr: number;
  status: 'PAID' | 'UNPAID';
  compound_no: string;
}

export interface SummonsResponse {
  plate: string;
  summons: SummonsRecord[];
  total_outstanding_myr: number;
}

export async function getSummons(plate: string): Promise<SummonsResponse> {
  try {
    const response = await axios.post(
      `${JPJ_BASE}/summons`,
      { vehicle_no: plate },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15_000,
      }
    );

    const data = response.data as {
      data?: Array<{
        compound_no?: string;
        offence_date?: string;
        offence_description?: string;
        amount?: number;
        status?: string;
      }>;
    };
    const items = data?.data ?? [];

    const summons: SummonsRecord[] = items.map((item, idx) => ({
      id: item.compound_no ?? `SUM-${idx}`,
      compound_no: item.compound_no ?? '',
      date: item.offence_date ?? '',
      offence: item.offence_description ?? 'Traffic offence',
      amount_myr: Number(item.amount ?? 0),
      status: item.status === 'PAID' ? 'PAID' : 'UNPAID',
    }));

    const total = summons
      .filter(s => s.status === 'UNPAID')
      .reduce((sum, s) => sum + s.amount_myr, 0);

    return { plate, summons, total_outstanding_myr: total };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return { plate, summons: [], total_outstanding_myr: 0 };
    }
    throw new ApiError('JPJ_SUMMONS_ERROR', 'Failed to retrieve summons from JPJ', 502);
  }
}
