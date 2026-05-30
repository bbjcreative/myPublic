import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdProvider } from '../components/ads/AdContext';
import { AdBanner } from '../components/ads/AdBanner';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { t } from '../constants/i18n';
import { Ionicons } from '@expo/vector-icons';

export function SavedRoutesScreen() {
  const lang = usePrefsStore(s => s.lang);
  const { savedRoutes, removeSavedRoute } = usePrefsStore();

  return (
    <AdProvider visibility="BANNER">
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList
          data={savedRoutes}
          keyExtractor={r => r.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <View style={styles.route}>
                  <Ionicons name="radio-button-on" size={14} color={Colors.success} />
                  <Text style={styles.stopName} numberOfLines={1}>{item.origin_name}</Text>
                </View>
                <View style={styles.route}>
                  <Ionicons name="location" size={14} color={Colors.error} />
                  <Text style={styles.stopName} numberOfLines={1}>{item.dest_name}</Text>
                </View>
                {item.label ? <Text style={styles.label}>{item.label}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => removeSavedRoute(item.id)} style={styles.delete}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={48} color={Colors.border} />
              <Text style={styles.empty}>No saved routes yet</Text>
            </View>
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
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardInfo: { flex: 1 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  stopName: { fontSize: 14, color: Colors.text, flex: 1 },
  label: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  delete: { padding: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  empty: { color: Colors.textSecondary, fontSize: 15, marginTop: 12 },
});
