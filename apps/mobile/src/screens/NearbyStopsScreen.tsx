import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdProvider } from '../components/ads/AdContext';
import { AdBanner } from '../components/ads/AdBanner';
import { StopCard } from '../components/common/StopCard';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { useNearbyStops } from '../hooks/useNearbyStops';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { t } from '../constants/i18n';
import { Stop } from '../types/gtfs';

export function NearbyStopsScreen() {
  const lang = usePrefsStore(s => s.lang);
  const { data, isLoading, isError, refetch } = useNearbyStops(500);

  if (isLoading) return <LoadingOverlay />;
  if (isError) return <ErrorBanner onRetry={refetch} />;

  return (
    <AdProvider visibility="BANNER">
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList<Stop>
          data={data?.stops ?? []}
          keyExtractor={s => s.stop_id}
          renderItem={({ item }) => <StopCard stop={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>{t(lang, 'noStopsNearby')}</Text>
          }
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
});
