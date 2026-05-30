import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdProvider } from '../components/ads/AdContext';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { t } from '../constants/i18n';
import { useRewardedAd } from '../hooks/useRewardedAd';

export function SettingsScreen() {
  const lang = usePrefsStore(s => s.lang);
  const { notificationsEnabled, setNotificationsEnabled, adFreeUntil } = usePrefsStore();
  const { showAd } = useRewardedAd();

  const isAdFreeNow = Date.now() < adFreeUntil;
  const adFreeMinutes = isAdFreeNow ? Math.ceil((adFreeUntil - Date.now()) / 60_000) : 0;

  return (
    <AdProvider visibility="REWARDED_ELIGIBLE">
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>{t(lang, 'language')}</Text>
          <View style={styles.card}>
            <LanguageToggle />
          </View>

          <Text style={styles.sectionTitle}>{t(lang, 'notifications')}</Text>
          <View style={styles.cardRow}>
            <Text style={styles.settingLabel}>{t(lang, 'notifications')}</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: Colors.primary }}
            />
          </View>

          <Text style={styles.sectionTitle}>Ad-Free</Text>
          {isAdFreeNow ? (
            <View style={styles.card}>
              <Text style={styles.adFreeActive}>Ad-free active: {adFreeMinutes} min remaining</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.rewardedBtn} onPress={showAd} activeOpacity={0.85}>
              <Text style={styles.rewardedText}>{t(lang, 'adFreeHour')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </AdProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 8, marginTop: 20 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLabel: { fontSize: 15, color: Colors.text },
  rewardedBtn: { backgroundColor: Colors.secondary, padding: 16, borderRadius: 12, alignItems: 'center' },
  rewardedText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  adFreeActive: { fontSize: 14, color: Colors.success, fontWeight: '600' },
});
