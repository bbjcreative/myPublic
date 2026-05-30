import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang } from '../constants/i18n';

interface SavedRoute {
  id: string;
  label: string;
  origin_stop_id: string;
  dest_stop_id: string;
  origin_name: string;
  dest_name: string;
}

interface PrefsState {
  lang: Lang;
  savedRoutes: SavedRoute[];
  adFreeUntil: number;
  notificationsEnabled: boolean;
  setLang: (lang: Lang) => void;
  addSavedRoute: (route: SavedRoute) => void;
  removeSavedRoute: (id: string) => void;
  grantAdFree: (durationMs: number) => void;
  isAdFree: () => boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      savedRoutes: [],
      adFreeUntil: 0,
      notificationsEnabled: true,
      setLang: (lang) => set({ lang }),
      addSavedRoute: (route) => set(s => ({
        savedRoutes: [...s.savedRoutes.filter(r => r.id !== route.id), route].slice(-10),
      })),
      removeSavedRoute: (id) => set(s => ({ savedRoutes: s.savedRoutes.filter(r => r.id !== id) })),
      grantAdFree: (durationMs) => set({ adFreeUntil: Date.now() + durationMs }),
      isAdFree: () => Date.now() < get().adFreeUntil,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'transit-my-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
