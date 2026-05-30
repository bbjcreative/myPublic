import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoutePlannerScreen } from '../screens/RoutePlannerScreen';
import { RouteResultsScreen } from '../screens/RouteResultsScreen';
import { RouteDetailScreen } from '../screens/RouteDetailScreen';
import { TripOption } from '../types/gtfs';
import { Colors } from '../constants/colors';

export type PlanStackParamList = {
  RoutePlanner: undefined;
  RouteResults: { options: TripOption[] };
  RouteDetail: { option: TripOption };
};

const Stack = createNativeStackNavigator<PlanStackParamList>();

export function PlanStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} options={{ title: 'Plan Trip' }} />
      <Stack.Screen name="RouteResults" component={RouteResultsScreen} options={{ title: 'Route Options' }} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Route Detail' }} />
    </Stack.Navigator>
  );
}
