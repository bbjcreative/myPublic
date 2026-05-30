import { useMutation } from '@tanstack/react-query';
import { planTrip } from '../services/gtfs';
import { TripPlanRequest } from '../types/api';

export function useTripPlan() {
  return useMutation({
    mutationFn: (request: TripPlanRequest) => planTrip(request),
    retry: 1,
  });
}
