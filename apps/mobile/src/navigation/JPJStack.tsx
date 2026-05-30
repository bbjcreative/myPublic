import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JPJCheckerScreen } from '../screens/JPJCheckerScreen';
import { Colors } from '../constants/colors';

export type JPJStackParamList = {
  JPJChecker: undefined;
};

const Stack = createNativeStackNavigator<JPJStackParamList>();

export function JPJStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="JPJChecker" component={JPJCheckerScreen} options={{ title: 'JPJ Checker' }} />
    </Stack.Navigator>
  );
}
