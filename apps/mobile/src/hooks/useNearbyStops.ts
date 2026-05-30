import { useQuery } from '@tanstack/react-query';
import { fetchNearbyStops } from '../services/gtfs';
import { useLocationStore } from '../store/locationStore';

export function useNearbyStops(radius = 500) {
  const { lat, lon } = useLocationStore();

  return useQuery({
    queryKey: ['nearbyStops', lat, lon, radius],
    queryFn: () => fetchNearbyStops(lat!, lon!, radius),
    enabled: lat !== null && lon !== null,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}
