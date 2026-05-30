import { Stop, TripOption, VehiclePosition, ServiceAlert } from './gtfs';

export interface NearbyStopsResponse {
  stops: Stop[];
}

export interface TripPlanRequest {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  depart_at?: number;
}

export interface TripPlanResponse {
  options: TripOption[];
}

export interface VehiclePositionsResponse {
  vehicles: VehiclePosition[];
  count: number;
}

export interface AlertsResponse {
  alerts: ServiceAlert[];
}

export interface SubscribeRequest {
  device_id: string;
  route_ids: string[];
  fcm_token: string;
}

export interface SubscribeResponse {
  subscription_id: string;
  subscribed_routes: string[];
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
}
