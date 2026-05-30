import { api } from './api';
import { NearbyStopsResponse, VehiclePositionsResponse, TripPlanRequest, TripPlanResponse } from '../types/api';

export async function fetchNearbyStops(lat: number, lon: number, radius = 500): Promise<NearbyStopsResponse> {
  const { data } = await api.get<NearbyStopsResponse>('/stops/nearby', {
    params: { lat, lon, radius },
  });
  return data;
}

export async function fetchVehiclePositions(agency: string, routeId?: string): Promise<VehiclePositionsResponse> {
  const { data } = await api.get<VehiclePositionsResponse>('/realtime/vehicles', {
    params: { agency, ...(routeId ? { route_id: routeId } : {}) },
  });
  return data;
}

export async function planTrip(request: TripPlanRequest): Promise<TripPlanResponse> {
  const { data } = await api.post<TripPlanResponse>('/trip/plan', request);
  return data;
}
