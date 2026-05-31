import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { NavigationScreen } from '../screens/NavigationScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TripOption } from '../types/gtfs';
import { usePrefsStore } from '../store/prefsStore';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  NavigationModal: { option: TripOption };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const onboardingDone = usePrefsStore(s => s.onboardingDone);

  return (
    <Stack.Navigator initialRouteName={onboardingDone ? 'Main' : 'Onboarding'}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="NavigationModal"
        component={NavigationScreen}
        options={{ presentation: 'fullScreenModal', headerShown: false }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}
