export interface Stop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  agency: 'prasarana' | 'ktmb' | 'bas_my';
  routes: string[];
  geohash4: string;
}

export interface StopDeparture {
  route_id: string;
  route_short_name: string;
  eta_min: number;
}

export interface StopWithDepartures extends Stop {
  distance_m: number;
  next_departures: StopDeparture[];
}

export interface StopSequenceEntry {
  stop_id: string;
  arrival_time: string;
  departure_time: string;
  stop_sequence: number;
}

export interface Route {
  route_id: string;
  trip_id: string;
  service_id: string;
  route_short_name: string;
  route_long_name: string;
  agency: string;
  stop_sequence: StopSequenceEntry[];
  shape_encoded: string;
}

export interface TripLeg {
  mode: 'walk' | 'LRT' | 'MRT' | 'KTM' | 'BUS' | 'MONORAIL';
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
  label: 'fastest' | 'least_walking' | 'cheapest';
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
  occupancy: 'EMPTY' | 'MANY_SEATS_AVAILABLE' | 'FEW_SEATS_AVAILABLE' | 'STANDING_ROOM_ONLY' | 'FULL';
  updated_at: number;
}

export interface AlertRecord {
  alert_id: string;
  affected_routes: string[];
  header_text: string;
  description_text: string;
  severity: 'INFO' | 'WARNING' | 'SEVERE';
  start_time: number;
  end_time: number;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
}
