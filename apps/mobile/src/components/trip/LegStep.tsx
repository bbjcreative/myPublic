import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TripLeg } from '../../types/gtfs';
import { Colors, getModeColor } from '../../constants/colors';
import { usePrefsStore } from '../../store/prefsStore';
import { t } from '../../constants/i18n';
import { Ionicons } from '@expo/vector-icons';

const MODE_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  walk: 'walk',
  LRT: 'train',
  MRT: 'train',
  KTM: 'train',
  BUS: 'bus',
  MONORAIL: 'train',
};

interface Props {
  leg: TripLeg;
  isLast?: boolean;
}

export function LegStep({ leg, isLast = false }: Props) {
  const lang = usePrefsStore(s => s.lang);
  const color = getModeColor(leg.mode);
  const icon = MODE_ICONS[leg.mode] ?? 'ellipse';

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.dot, { backgroundColor: color }]}>
          <Ionicons name={icon} size={12} color="#fff" />
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: color }]} />}
      </View>

      <View style={styles.content}>
        <Text style={styles.from}>{leg.from}</Text>
        {leg.mode !== 'walk' && leg.line && (
          <View style={[styles.routeBadge, { backgroundColor: color }]}>
            <Text style={styles.routeText}>{leg.line}</Text>
          </View>
        )}
        <View style={styles.meta}>
          {leg.depart && <Text style={styles.time}>{leg.depart}</Text>}
          <Text style={styles.duration}>{leg.duration_min} {t(lang, 'min')}</Text>
          {leg.stops != null && leg.stops > 0 && (
            <Text style={styles.stops}>{leg.stops} {t(lang, 'stops')}</Text>
          )}
        </View>
        {leg.alert && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>{leg.alert}</Text>
          </View>
        )}
        {isLast && <Text style={styles.from}>{leg.to}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 16 },
  timeline: { alignItems: 'center', width: 32, marginRight: 12 },
  dot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  line: { width: 2, flex: 1, minHeight: 24, marginVertical: 4 },
  content: { flex: 1, paddingVertical: 4, paddingBottom: 16 },
  from: { fontSize: 15, fontWeight: '600', color: Colors.text },
  routeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginTop: 4 },
  routeText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  meta: { flexDirection: 'row', gap: 10, marginTop: 4 },
  time: { fontSize: 13, color: Colors.textSecondary },
  duration: { fontSize: 13, color: Colors.textSecondary },
  stops: { fontSize: 13, color: Colors.textSecondary },
  alertBadge: { backgroundColor: Colors.warning + '22', padding: 6, borderRadius: 6, marginTop: 4 },
  alertText: { fontSize: 12, color: Colors.warning },
});
