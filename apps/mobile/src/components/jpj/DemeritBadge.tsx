import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DemeritResponse } from '../../types/jpj';
import { Colors } from '../../constants/colors';
import { usePrefsStore } from '../../store/prefsStore';
import { t } from '../../constants/i18n';

const MAX_POINTS = 20;

interface Props {
  demerit: DemeritResponse;
}

export function DemeritBadge({ demerit }: Props) {
  const lang = usePrefsStore(s => s.lang);
  const ratio = demerit.points_used / MAX_POINTS;
  const barColor = ratio > 0.75 ? Colors.error : ratio > 0.5 ? Colors.warning : Colors.success;

  const statusLabels: Record<string, string> = {
    ACTIVE: t(lang, 'active'),
    SUSPENDED: t(lang, 'suspended'),
    REVOKED: t(lang, 'revoked'),
    EXPIRED: t(lang, 'expired'),
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t(lang, 'demerit')}</Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: barColor }]} />
      </View>
      <View style={styles.row}>
        <Text style={styles.used}>{demerit.points_used} / {MAX_POINTS} {t(lang, 'demerit')}</Text>
        <View style={[styles.statusBadge, { backgroundColor: demerit.licence_status === 'ACTIVE' ? Colors.success + '22' : Colors.error + '22' }]}>
          <Text style={styles.statusText}>{statusLabels[demerit.licence_status]}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  bar: { height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  fill: { height: '100%', borderRadius: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  used: { fontSize: 14, color: Colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 13, fontWeight: '600', color: Colors.text },
});
