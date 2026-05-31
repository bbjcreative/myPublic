import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import mobileAds from 'react-native-google-mobile-ads';
import analytics from '@react-native-firebase/analytics';
import auth from '@react-native-firebase/auth';
import * as Application from 'expo-application';
import { RootNavigator } from './navigation/RootNavigator';
import type { RootStackParamList } from './navigation/RootNavigator';
import { Colors } from './constants/colors';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ForceUpdateModal } from './components/common/ForceUpdateModal';
import { MaintenanceScreen } from './components/common/MaintenanceScreen';
import { initialiseRemoteConfig, getRemoteConfig } from './services/remoteConfig';
import { configureGoogleSignIn } from './services/googleSignIn';
import { usePrefsStore } from './store/prefsStore';
import { useAuthStore } from './store/authStore';

let requestTrackingPermission: (() => Promise<string>) | null = null;
try {
  const att = require('expo-tracking-transparency');
  requestTrackingPermission = att.requestTrackingPermissionsAsync;
} catch {
  // ATT module not available in dev — safe to ignore
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const navigationRef = createNavigationContainerRef<RootStackParamList>();

function isVersionBelow(current: string, minimum: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const [cMaj, cMin, cPatch] = parse(current);
  const [mMaj, mMin, mPatch] = parse(minimum);
  if (cMaj !== mMaj) return cMaj < mMaj;
  if (cMin !== mMin) return cMin < mMin;
  return cPatch < mPatch;
}

export default function App() {
  const routeNameRef = useRef<string | undefined>();
  const [forceUpdate, setForceUpdate] = useState({ enabled: false, message: '' });
  const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });
  const [storeReady, setStoreReady] = useState(usePrefsStore.persist.hasHydrated());
  const lang = usePrefsStore(s => s.lang);
  const setUser = useAuthStore(s => s.setUser);
  const setAuthLoading = useAuthStore(s => s.setLoading);

  // Wait for AsyncStorage to hydrate preferences before rendering navigator
  useEffect(() => {
    if (storeReady) return;
    const unsub = usePrefsStore.persist.onFinishHydration(() => setStoreReady(true));
    return unsub;
  }, []);

  // Firebase Auth state listener
  useEffect(() => {
    configureGoogleSignIn();
    const unsub = auth().onAuthStateChanged(user => {
      setUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      // iOS 14+: MUST request ATT before AdMob init or Apple will reject the app
      if (requestTrackingPermission) {
        await requestTrackingPermission();
      }

      await initialiseRemoteConfig();
      const cfg = getRemoteConfig();

      if (cfg.maintenance_mode) {
        const msg = lang === 'ms' ? cfg.maintenance_message_ms : cfg.maintenance_message_en;
        setMaintenance({ enabled: true, message: msg });
        return;
      }

      if (cfg.force_update_enabled) {
        const current = Application.nativeApplicationVersion ?? '1.0.0';
        if (isVersionBelow(current, cfg.force_update_min_version)) {
          const msg = lang === 'ms' ? cfg.force_update_message_ms : cfg.force_update_message_en;
          setForceUpdate({ enabled: true, message: msg });
          return;
        }
      }

      await mobileAds().initialize();
    })();
  }, []);

  const onNavigationReady = () => {
    routeNameRef.current = navigationRef.getCurrentRoute()?.name;
  };

  const onNavigationStateChange = async () => {
    const current = navigationRef.getCurrentRoute();
    if (current && routeNameRef.current !== current.name) {
      await analytics().logScreenView({
        screen_name: current.name,
        screen_class: current.name,
      });
    }
    routeNameRef.current = current?.name;
  };

  if (maintenance.enabled) {
    return <MaintenanceScreen message={maintenance.message} />;
  }

  if (!storeReady) {
    return <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <NavigationContainer
              ref={navigationRef}
              onReady={onNavigationReady}
              onStateChange={onNavigationStateChange}
            >
              <RootNavigator />
            </NavigationContainer>
            <ForceUpdateModal visible={forceUpdate.enabled} message={forceUpdate.message} />
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
