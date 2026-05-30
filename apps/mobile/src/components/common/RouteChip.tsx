import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getModeColor } from '../../constants/colors';
import { TransitMode } from '../../types/gtfs';

interface Props {
  mode: TransitMode;
  label: string;
}

export function RouteChip({ mode, label }: Props) {
  return (
    <View style={[styles.chip, { backgroundColor: getModeColor(mode) }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  text: { fontSize: 12, color: '#fff', fontWeight: '700' },
});
