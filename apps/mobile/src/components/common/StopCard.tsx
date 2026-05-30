import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stop } from '../../types/gtfs';
import { Colors } from '../../constants/colors';

interface Props {
  stop: Stop;
  onPress?: () => void;
}

export function StopCard({ stop, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.icon}>
        <Ionicons name="location" size={20} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{stop.stop_name}</Text>
        <Text style={styles.meta}>{stop.agency.toUpperCase()} · {stop.distance_m}m</Text>
        {stop.next_departures.length > 0 && (
          <View style={styles.departures}>
            {stop.next_departures.slice(0, 2).map((d, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{d.route} · {d.eta_min}min</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: { marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  departures: { flexDirection: 'row', gap: 6, marginTop: 6 },
  chip: { backgroundColor: Colors.primary + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
});
