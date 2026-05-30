import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import mobileAds from 'react-native-google-mobile-ads';
import { RootNavigator } from './navigation/RootNavigator';
import { Colors } from './constants/colors';

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

export default function App() {
  useEffect(() => {
    (async () => {
      // iOS 14+: MUST request ATT before AdMob init or Apple will reject the app
      if (requestTrackingPermission) {
        await requestTrackingPermission();
      }
      await mobileAds().initialize();
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
