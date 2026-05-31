import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePrefsStore } from '../store/prefsStore';
import {
  CloudSavedRoute,
  subscribeToSavedRoutes,
  addRouteToCloud,
  removeRouteFromCloud,
  bulkUploadRoutes,
} from '../services/firestoreRoutes';

export function useSavedRoutes() {
  const user = useAuthStore(s => s.user);
  const localRoutes = usePrefsStore(s => s.savedRoutes);
  const addLocal = usePrefsStore(s => s.addSavedRoute);
  const removeLocal = usePrefsStore(s => s.removeSavedRoute);
  const [cloudRoutes, setCloudRoutes] = useState<CloudSavedRoute[]>([]);

  useEffect(() => {
    if (!user) {
      setCloudRoutes([]);
      return;
    }
    // Upload existing local routes to cloud on first sign-in
    if (localRoutes.length > 0) {
      bulkUploadRoutes(
        user.uid,
        localRoutes.map(r => ({ ...r, savedAt: Date.now() })),
      ).catch(() => {});
    }
    const unsub = subscribeToSavedRoutes(user.uid, setCloudRoutes);
    return unsub;
  }, [user?.uid]);

  const routes = user ? cloudRoutes : localRoutes;

  const add = async (route: Omit<CloudSavedRoute, 'savedAt'>) => {
    addLocal(route);
    if (user) {
      await addRouteToCloud(user.uid, { ...route, savedAt: Date.now() }).catch(() => {});
    }
  };

  const remove = async (id: string) => {
    removeLocal(id);
    if (user) {
      await removeRouteFromCloud(user.uid, id).catch(() => {});
    }
  };

  return { routes, add, remove, isCloud: !!user };
}
