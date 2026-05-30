import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack } from './HomeStack';
import { PlanStack } from './PlanStack';
import { AlertsScreen } from '../screens/AlertsScreen';
import { JPJStack } from './JPJStack';
import { SavedRoutesScreen } from '../screens/SavedRoutesScreen';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { t } from '../constants/i18n';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  const lang = usePrefsStore(s => s.lang);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
            HomeTab: focused ? 'map' : 'map-outline',
            PlanTab: focused ? 'navigate' : 'navigate-outline',
            AlertsTab: focused ? 'notifications' : 'notifications-outline',
            JPJTab: focused ? 'car' : 'car-outline',
            ProfileTab: focused ? 'bookmark' : 'bookmark-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { borderTopColor: Colors.border },
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: t(lang, 'home') }} />
      <Tab.Screen name="PlanTab" component={PlanStack} options={{ title: t(lang, 'plan') }} />
      <Tab.Screen name="AlertsTab" component={AlertsScreen} options={{ title: t(lang, 'alerts'), headerShown: true, headerTitle: t(lang, 'alerts') }} />
      <Tab.Screen name="JPJTab" component={JPJStack} options={{ title: t(lang, 'jpj') }} />
      <Tab.Screen name="ProfileTab" component={SavedRoutesScreen} options={{ title: t(lang, 'savedRoutes'), headerShown: true }} />
    </Tab.Navigator>
  );
}
