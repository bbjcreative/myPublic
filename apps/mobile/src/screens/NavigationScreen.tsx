import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TransitMap } from '../components/map/TransitMap';
import { GetOffAlert } from '../components/trip/GetOffAlert';
import { Colors, getModeColor } from '../constants/colors';
import { useNavigationStore } from '../store/navigationStore';
import { useGetOffAlert } from '../hooks/useGetOffAlert';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';

// NO ADS on this screen — safety + Play Store policy
type NavRoute = RouteProp<RootStackParamList, 'NavigationModal'>;

export function NavigationScreen() {
  const navigation = useNavigation();
  const route = useRoute<NavRoute>();
  const { option } = route.params;
  const { currentLeg, activeTrip, stopNavigation, currentLegIndex } = useNavigationStore();
  useGetOffAlert();

  const leg = currentLeg();
  const totalLegs = activeTrip?.legs.length ?? 0;
  const progress = totalLegs > 0 ? (currentLegIndex + 1) / totalLegs : 0;
  const color = leg ? getModeColor(leg.mode) : Colors.primary;

  const handleStop = () => {
    stopNavigation();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TransitMap />

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
          </View>
        </View>

        {leg && (
          <View style={[styles.legCard, { borderLeftColor: color }]}>
            <Text style={styles.legMode}>{leg.mode}</Text>
            <Text style={styles.legTo} numberOfLines={2}>{leg.to}</Text>
            {leg.depart && <Text style={styles.legTime}>{leg.depart}</Text>}
            <Text style={styles.legDuration}>{leg.duration_min} min</Text>
          </View>
        )}
      </SafeAreaView>

      <GetOffAlert />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  stopBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  legCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  legMode: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 },
  legTo: { fontSize: 20, fontWeight: '800', color: Colors.text },
  legTime: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  legDuration: { fontSize: 15, fontWeight: '600', color: Colors.primary, marginTop: 4 },
});
