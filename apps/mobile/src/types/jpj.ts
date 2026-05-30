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

export type LicenceStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';

export interface DemeritResponse {
  ic: string;
  points_used: number;
  points_remaining: number;
  licence_status: LicenceStatus;
}
