import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { NearbyStopsScreen } from '../screens/NearbyStopsScreen';
import { Colors } from '../constants/colors';

export type HomeStackParamList = {
  Home: undefined;
  NearbyStops: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NearbyStops" component={NearbyStopsScreen} options={{ title: 'Nearby Stops' }} />
    </Stack.Navigator>
  );
}
