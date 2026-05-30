import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LegStep } from '../components/trip/LegStep';
import { Colors } from '../constants/colors';
import { PlanStackParamList } from '../navigation/PlanStack';
import { useNavigationStore } from '../store/navigationStore';
import { usePrefsStore } from '../store/prefsStore';
import { t } from '../constants/i18n';
import { RootStackParamList } from '../navigation/RootNavigator';

type DetailRoute = RouteProp<PlanStackParamList, 'RouteDetail'>;

export function RouteDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<DetailRoute>();
  const { option } = route.params;
  const lang = usePrefsStore(s => s.lang);
  const startNavigation = useNavigationStore(s => s.startNavigation);
  const [alertEnabled, setAlertEnabled] = React.useState(true);

  const handleStartNav = () => {
    startNavigation(option);
    navigation.navigate('NavigationModal', { option });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.summary}>
          <Text style={styles.duration}>{option.duration_min} min</Text>
          <Text style={styles.meta}>
            {t(lang, 'walk')} {option.walk_min}min · RM {option.fare_myr.toFixed(2)}
          </Text>
        </View>

        <View style={styles.alertRow}>
          <Text style={styles.alertLabel}>{t(lang, 'getOffAlert')}</Text>
          <Switch
            value={alertEnabled}
            onValueChange={setAlertEnabled}
            trackColor={{ true: Colors.primary }}
          />
        </View>

        <View style={styles.legs}>
          {option.legs.map((leg, idx) => (
            <LegStep key={idx} leg={leg} isLast={idx === option.legs.length - 1} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.navButton} onPress={handleStartNav} activeOpacity={0.85}>
          <Text style={styles.navButtonText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 100 },
  summary: { padding: 20, backgroundColor: Colors.surface, marginBottom: 8 },
  duration: { fontSize: 32, fontWeight: '800', color: Colors.text },
  meta: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  alertLabel: { fontSize: 15, color: Colors.text },
  legs: { paddingTop: 12 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  navButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
