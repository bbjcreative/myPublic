import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdProvider } from '../components/ads/AdContext';
import { AdBanner } from '../components/ads/AdBanner';
import { SummonsCard } from '../components/jpj/SummonsCard';
import { DemeritBadge } from '../components/jpj/DemeritBadge';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { fetchSummons, fetchDemerit } from '../services/jpj';
import { SummonsResponse, DemeritResponse } from '../types/jpj';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { t } from '../constants/i18n';

type Tab = 'summons' | 'demerit';

export function JPJCheckerScreen() {
  const lang = usePrefsStore(s => s.lang);
  const [tab, setTab] = useState<Tab>('summons');
  const [plate, setPlate] = useState('');
  const [ic, setIC] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summonsData, setSummonsData] = useState<SummonsResponse | null>(null);
  const [demeritData, setDemeritData] = useState<DemeritResponse | null>(null);

  const handleCheck = async () => {
    setError(null);
    setLoading(true);
    try {
      if (tab === 'summons') {
        const data = await fetchSummons(plate.trim().toUpperCase());
        setSummonsData(data);
      } else {
        const data = await fetchDemerit(ic.replace(/[^0-9]/g, ''));
        setDemeritData(data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <AdProvider visibility="BANNER">
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.tabs}>
              {(['summons', 'demerit'] as Tab[]).map(t_ => (
                <TouchableOpacity
                  key={t_}
                  style={[styles.tab, tab === t_ && styles.activeTab]}
                  onPress={() => { setTab(t_); setError(null); }}
                >
                  <Text style={[styles.tabText, tab === t_ && styles.activeTabText]}>
                    {t_ === 'summons' ? t(lang, 'summons') : t(lang, 'demerit')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={tab === 'summons' ? t(lang, 'jpjPlate') : t(lang, 'jpjIC')}
                placeholderTextColor={Colors.textSecondary}
                value={tab === 'summons' ? plate : ic}
                onChangeText={tab === 'summons' ? setPlate : setIC}
                autoCapitalize={tab === 'summons' ? 'characters' : 'none'}
                keyboardType={tab === 'demerit' ? 'numeric' : 'default'}
              />
              <TouchableOpacity style={styles.checkBtn} onPress={handleCheck}>
                <Text style={styles.checkText}>{t(lang, 'jpjCheck')}</Text>
              </TouchableOpacity>
            </View>

            {error && <ErrorBanner message={error} />}

            {tab === 'summons' && summonsData && (
              <View style={styles.results}>
                {summonsData.summons.length > 0 ? (
                  <>
                    {summonsData.summons.map(s => <SummonsCard key={s.id} summons={s} />)}
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>{t(lang, 'outstanding')}</Text>
                      <Text style={styles.totalAmount}>RM {summonsData.total_outstanding_myr.toFixed(2)}</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.empty}>{t(lang, 'noSummons')}</Text>
                )}
              </View>
            )}

            {tab === 'demerit' && demeritData && (
              <View style={styles.results}>
                <DemeritBadge demerit={demeritData} />
              </View>
            )}
          </ScrollView>
          <AdBanner />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AdProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 40 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.border, borderRadius: 10, padding: 3, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: Colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 14, color: Colors.textSecondary },
  activeTabText: { color: Colors.text, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
  checkText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  results: { marginTop: 8 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 32, fontSize: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: Colors.error + '18', borderRadius: 10, marginTop: 8 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: Colors.error },
  totalAmount: { fontSize: 16, fontWeight: '800', color: Colors.error },
});
