import { TripOption } from '@transit-my/lambda-shared/types';
import { RouteResult } from './dijkstra';

export function formatTripOptions(
  fastest: RouteResult | null,
  leastWalking: RouteResult | null,
  cheapest: RouteResult | null
): TripOption[] {
  const options: TripOption[] = [];

  if (fastest) {
    options.push({
      label: 'fastest',
      duration_min: fastest.duration_min,
      walk_min: fastest.walk_min,
      fare_myr: parseFloat(fastest.fare_myr.toFixed(2)),
      legs: fastest.legs,
    });
  }

  if (leastWalking && leastWalking !== fastest) {
    options.push({
      label: 'least_walking',
      duration_min: leastWalking.duration_min,
      walk_min: leastWalking.walk_min,
      fare_myr: parseFloat(leastWalking.fare_myr.toFixed(2)),
      legs: leastWalking.legs,
    });
  }

  if (cheapest && cheapest !== fastest && cheapest !== leastWalking) {
    options.push({
      label: 'cheapest',
      duration_min: cheapest.duration_min,
      walk_min: cheapest.walk_min,
      fare_myr: parseFloat(cheapest.fare_myr.toFixed(2)),
      legs: cheapest.legs,
    });
  }

  // Deduplicate by duration+fare fingerprint
  const seen = new Set<string>();
  return options.filter(o => {
    const key = `${o.duration_min}-${o.fare_myr}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
