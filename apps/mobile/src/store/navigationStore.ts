import { create } from 'zustand';
import { TripLeg, TripOption } from '../types/gtfs';

interface NavigationState {
  activeTrip: TripOption | null;
  currentLegIndex: number;
  getOffStopId: string | null;
  getOffAlertFired: boolean;
  startNavigation: (trip: TripOption) => void;
  advanceLeg: () => void;
  setGetOffStop: (stopId: string) => void;
  fireGetOffAlert: () => void;
  stopNavigation: () => void;
  currentLeg: () => TripLeg | null;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  activeTrip: null,
  currentLegIndex: 0,
  getOffStopId: null,
  getOffAlertFired: false,

  startNavigation: (trip) => {
    const firstTransitLeg = trip.legs.findIndex(l => l.mode !== 'walk');
    const getOffStop = firstTransitLeg !== -1 ? trip.legs[firstTransitLeg].to_stop_id ?? null : null;
    set({ activeTrip: trip, currentLegIndex: 0, getOffStopId: getOffStop, getOffAlertFired: false });
  },

  advanceLeg: () => {
    const { activeTrip, currentLegIndex } = get();
    if (!activeTrip) return;
    const nextIndex = currentLegIndex + 1;
    if (nextIndex >= activeTrip.legs.length) {
      set({ currentLegIndex: nextIndex });
      return;
    }
    const nextLeg = activeTrip.legs[nextIndex];
    set({
      currentLegIndex: nextIndex,
      getOffStopId: nextLeg.mode !== 'walk' ? nextLeg.to_stop_id ?? null : null,
      getOffAlertFired: false,
    });
  },

  setGetOffStop: (stopId) => set({ getOffStopId: stopId, getOffAlertFired: false }),

  fireGetOffAlert: () => set({ getOffAlertFired: true }),

  stopNavigation: () => set({ activeTrip: null, currentLegIndex: 0, getOffStopId: null, getOffAlertFired: false }),

  currentLeg: () => {
    const { activeTrip, currentLegIndex } = get();
    return activeTrip?.legs[currentLegIndex] ?? null;
  },
}));
