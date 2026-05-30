import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTripPlan } from '../hooks/useTripPlan';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { useLocationStore } from '../store/locationStore';
import { t } from '../constants/i18n';
import { Ionicons } from '@expo/vector-icons';
import { PlanStackParamList } from '../navigation/PlanStack';

// KL Sentral as hardcoded origin for MVP (full address search is Phase 2)
const KL_SENTRAL = { lat: 3.1338, lon: 101.6861, name: 'KL Sentral' };
const PUTRAJAYA = { lat: 2.9264, lon: 101.6964, name: 'Putrajaya Sentral' };

export function RoutePlannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PlanStackParamList>>();
  const lang = usePrefsStore(s => s.lang);
  const { lat, lon } = useLocationStore();
  const { mutate: planTrip, isPending, isError, error } = useTripPlan();

  const origin = lat && lon ? { lat, lon } : { lat: KL_SENTRAL.lat, lon: KL_SENTRAL.lon };

  const handlePlan = () => {
    planTrip(
      { origin, destination: { lat: PUTRAJAYA.lat, lon: PUTRAJAYA.lon } },
      {
        onSuccess: (data) => {
          navigation.navigate('RouteResults', { options: data.options });
        },
      }
    );
  };

  if (isPending) return <LoadingOverlay />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.field}>
          <Ionicons name="radio-button-on" size={20} color={Colors.success} style={styles.icon} />
          <Text style={styles.label}>{lat ? `${lat.toFixed(4)}, ${lon?.toFixed(4)}` : KL_SENTRAL.name}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.field}>
          <Ionicons name="location" size={20} color={Colors.error} style={styles.icon} />
          <Text style={styles.label}>{PUTRAJAYA.name}</Text>
        </View>

        {isError && <ErrorBanner message={(error as Error).message} />}

        <TouchableOpacity style={styles.button} onPress={handlePlan} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{t(lang, 'plan')}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, padding: 20 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  icon: { marginRight: 12 },
  label: { fontSize: 15, color: Colors.text, flex: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 32, marginBottom: 8 },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
