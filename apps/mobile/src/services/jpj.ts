import { api } from './api';
import { SummonsResponse, DemeritResponse } from '../types/jpj';

export async function fetchSummons(plate: string): Promise<SummonsResponse> {
  const { data } = await api.get<SummonsResponse>('/jpj/summons', { params: { plate } });
  return data;
}

export async function fetchDemerit(ic: string): Promise<DemeritResponse> {
  const { data } = await api.get<DemeritResponse>('/jpj/demerit', { params: { ic } });
  return data;
}
