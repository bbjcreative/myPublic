import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../store/locationStore';

export function useLocation() {
  const { lat, lon, permissionGranted, setLocation, setPermission } = useLocationStore();

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermission(granted);
      if (!granted) return;

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(current.coords.latitude, current.coords.longitude);

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
        (loc) => setLocation(loc.coords.latitude, loc.coords.longitude)
      );
    })();

    return () => { subscription?.remove(); };
  }, []);

  return { lat, lon, permissionGranted };
}
