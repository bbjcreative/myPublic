import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SummonsRecord } from '../../types/jpj';
import { Colors } from '../../constants/colors';
import { usePrefsStore } from '../../store/prefsStore';
import { t } from '../../constants/i18n';

interface Props {
  summons: SummonsRecord;
}

export function SummonsCard({ summons }: Props) {
  const lang = usePrefsStore(s => s.lang);
  const isPaid = summons.status === 'PAID';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.compound}>{summons.compound_no || summons.id}</Text>
        <View style={[styles.badge, isPaid ? styles.paid : styles.unpaid]}>
          <Text style={styles.badgeText}>{isPaid ? t(lang, 'paid') : t(lang, 'unpaid')}</Text>
        </View>
      </View>
      <Text style={styles.offence}>{summons.offence}</Text>
      <View style={styles.footer}>
        <Text style={styles.date}>{summons.date}</Text>
        <Text style={[styles.amount, !isPaid && styles.unpaidAmount]}>
          RM {summons.amount_myr.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  compound: { fontSize: 13, color: Colors.textSecondary },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  paid: { backgroundColor: Colors.success + '22' },
  unpaid: { backgroundColor: Colors.error + '22' },
  badgeText: { fontSize: 12, fontWeight: '600', color: Colors.text },
  offence: { fontSize: 14, color: Colors.text, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 13, color: Colors.textSecondary },
  amount: { fontSize: 15, fontWeight: '700', color: Colors.text },
  unpaidAmount: { color: Colors.error },
});
