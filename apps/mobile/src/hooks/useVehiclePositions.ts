import { useQuery } from '@tanstack/react-query';
import { fetchVehiclePositions } from '../services/gtfs';

export function useVehiclePositions(agency: string, routeId?: string, enabled = true) {
  return useQuery({
    queryKey: ['vehiclePositions', agency, routeId],
    queryFn: () => fetchVehiclePositions(agency, routeId),
    enabled,
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: 1,
  });
}
