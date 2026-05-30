import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TransitMap } from '../components/map/TransitMap';
import { AdBanner } from '../components/ads/AdBanner';
import { AdProvider } from '../components/ads/AdContext';
import { useLocation } from '../hooks/useLocation';
import { useVehiclePositions } from '../hooks/useVehiclePositions';
import { useNearbyStops } from '../hooks/useNearbyStops';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { t } from '../constants/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Stop } from '../types/gtfs';
import { PlanStackParamList } from '../navigation/PlanStack';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PlanStackParamList>>();
  const lang = usePrefsStore(s => s.lang);
  const { lat, lon } = useLocation();
  const { data: vehicleData } = useVehiclePositions('prasarana', undefined, true);
  const { data: stopsData } = useNearbyStops();

  const handleStopPress = (stop: Stop) => {
    // Navigate to nearby stops with this stop highlighted
  };

  return (
    <AdProvider visibility="BANNER">
      <View style={styles.container}>
        <TransitMap
          vehicles={vehicleData?.vehicles ?? []}
          stops={stopsData?.stops ?? []}
          onStopPress={handleStopPress}
        />

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TouchableOpacity
            style={styles.searchInput}
            onPress={() => navigation.navigate('RoutePlanner')}
            activeOpacity={0.8}
          >
            <Text style={styles.searchPlaceholder}>{t(lang, 'searchPlaceholder')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adContainer}>
          <AdBanner />
        </View>
      </View>
    </AdProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1 },
  searchPlaceholder: { fontSize: 15, color: Colors.textSecondary },
  adContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
