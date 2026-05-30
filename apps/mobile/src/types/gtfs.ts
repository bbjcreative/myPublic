export type Agency = 'prasarana' | 'ktmb' | 'bas_my';
export type TransitMode = 'walk' | 'LRT' | 'MRT' | 'KTM' | 'BUS' | 'MONORAIL';
export type TripLabel = 'fastest' | 'least_walking' | 'cheapest';
export type Occupancy = 'EMPTY' | 'MANY_SEATS_AVAILABLE' | 'FEW_SEATS_AVAILABLE' | 'STANDING_ROOM_ONLY' | 'FULL';

export interface Stop {
  stop_id: string;
  stop_name: string;
  lat: number;
  lon: number;
  agency: Agency;
  distance_m: number;
  next_departures: Departure[];
}

export interface Departure {
  route: string;
  eta_min: number;
}

export interface TripLeg {
  mode: TransitMode;
  from: string;
  to: string;
  from_stop_id?: string;
  to_stop_id?: string;
  duration_min: number;
  depart?: string;
  arrive?: string;
  stops?: number;
  line?: string;
  route_id?: string;
  alert?: string | null;
  shape_encoded?: string;
}

export interface TripOption {
  label: TripLabel;
  duration_min: number;
  walk_min: number;
  fare_myr: number;
  legs: TripLeg[];
}

export interface VehiclePosition {
  vehicle_id: string;
  route_id: string;
  lat: number;
  lon: number;
  bearing: number;
  speed_kmh: number;
  occupancy: Occupancy;
  updated_at: number;
}

export interface ServiceAlert {
  alert_id: string;
  affected_routes: string[];
  header_text: string;
  description_text: string;
  severity: 'INFO' | 'WARNING' | 'SEVERE';
  start_time: number;
  end_time: number;
}
