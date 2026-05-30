import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { NavigationScreen } from '../screens/NavigationScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TripOption } from '../types/gtfs';

export type RootStackParamList = {
  Main: undefined;
  NavigationModal: { option: TripOption };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator>
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
