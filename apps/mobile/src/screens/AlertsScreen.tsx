import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { AlertsResponse } from '../types/api';
import { ServiceAlert } from '../types/gtfs';
import { AdProvider } from '../components/ads/AdContext';
import { AdBanner } from '../components/ads/AdBanner';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { t } from '../constants/i18n';

function AlertCard({ alert }: { alert: ServiceAlert }) {
  const severityColor = {
    INFO: Colors.severityInfo,
    WARNING: Colors.severityWarning,
    SEVERE: Colors.severitySevere,
  }[alert.severity];

  return (
    <View style={[styles.card, { borderLeftColor: severityColor }]}>
      <Text style={[styles.severity, { color: severityColor }]}>{alert.severity}</Text>
      <Text style={styles.header}>{alert.header_text}</Text>
      <Text style={styles.desc}>{alert.description_text}</Text>
      <Text style={styles.routes}>{alert.affected_routes.join(' · ')}</Text>
    </View>
  );
}

export function AlertsScreen() {
  const lang = usePrefsStore(s => s.lang);
  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<AlertsResponse>('/alerts').then(r => r.data),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingOverlay />;

  return (
    <AdProvider visibility="BANNER">
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList<ServiceAlert>
          data={data?.alerts ?? []}
          keyExtractor={a => a.alert_id}
          renderItem={({ item }) => <AlertCard alert={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>{t(lang, 'noAlerts')}</Text>}
          ListFooterComponent={<AdBanner />}
        />
      </SafeAreaView>
    </AdProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 48, fontSize: 15 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  severity: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  header: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  desc: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  routes: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
});
