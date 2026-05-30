import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TripOption } from '../../types/gtfs';
import { Colors, getModeColor } from '../../constants/colors';
import { usePrefsStore } from '../../store/prefsStore';
import { t } from '../../constants/i18n';

const LABEL_MAP = {
  fastest: 'fastest',
  least_walking: 'leastWalking',
  cheapest: 'cheapest',
} as const;

interface Props {
  option: TripOption;
  onPress: (option: TripOption) => void;
  selected?: boolean;
}

export function TradeoffCard({ option, onPress, selected = false }: Props) {
  const lang = usePrefsStore(s => s.lang);
  const modes = [...new Set(option.legs.map(l => l.mode).filter(m => m !== 'walk'))];

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={() => onPress(option)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{t(lang, LABEL_MAP[option.label])}</Text>
        <View style={styles.modes}>
          {modes.map(mode => (
            <View key={mode} style={[styles.modeChip, { backgroundColor: getModeColor(mode) }]}>
              <Text style={styles.modeText}>{mode}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{option.duration_min}</Text>
          <Text style={styles.statLabel}>{t(lang, 'min')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{option.walk_min}</Text>
          <Text style={styles.statLabel}>{t(lang, 'walk')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>RM {option.fare_myr.toFixed(2)}</Text>
          <Text style={styles.statLabel}>{t(lang, 'fare')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: { borderColor: Colors.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 15, fontWeight: '700', color: Colors.text },
  modes: { flexDirection: 'row', gap: 4 },
  modeChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  modeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  divider: { width: 1, backgroundColor: Colors.border },
});
