import { create } from 'zustand';

interface LocationState {
  lat: number | null;
  lon: number | null;
  permissionGranted: boolean;
  setLocation: (lat: number, lon: number) => void;
  setPermission: (granted: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: null,
  lon: null,
  permissionGranted: false,
  setLocation: (lat, lon) => set({ lat, lon }),
  setPermission: (granted) => set({ permissionGranted: granted }),
}));
