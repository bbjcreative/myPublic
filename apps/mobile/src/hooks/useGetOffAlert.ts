import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useNavigationStore } from '../store/navigationStore';

const ALERT_RADIUS_M = 300;

export function useGetOffAlert() {
  const { getOffStopId, getOffAlertFired, fireGetOffAlert, advanceLeg } = useNavigationStore();
  const stopPositionRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!getOffStopId || getOffAlertFired) return;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (loc) => {
          if (!stopPositionRef.current || getOffAlertFired) return;
          const dist = haversineMeters(
            loc.coords.latitude, loc.coords.longitude,
            stopPositionRef.current.lat, stopPositionRef.current.lon
          );
          if (dist <= ALERT_RADIUS_M) {
            fireGetOffAlert();
            advanceLeg();
            ReactNativeHapticFeedback.trigger('notificationWarning', {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false,
            });
          }
        }
      );
    })();

    return () => { subscription?.remove(); };
  }, [getOffStopId, getOffAlertFired]);

  return { setStopPosition: (lat: number, lon: number) => { stopPositionRef.current = { lat, lon }; } };
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
