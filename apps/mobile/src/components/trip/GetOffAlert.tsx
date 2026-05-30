import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigationStore } from '../../store/navigationStore';
import { usePrefsStore } from '../../store/prefsStore';
import { t } from '../../constants/i18n';

export function GetOffAlert() {
  const { getOffAlertFired, activeTrip, currentLegIndex } = useNavigationStore();
  const lang = usePrefsStore(s => s.lang);
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    if (getOffAlertFired) setVisible(true);
  }, [getOffAlertFired]);

  if (!visible) return null;

  const leg = activeTrip?.legs[currentLegIndex];
  const stopName = leg?.to ?? '';

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={36} color={Colors.surface} />
          </View>
          <Text style={styles.title}>{t(lang, 'getOffAlert')}</Text>
          <Text style={styles.body}>{t(lang, 'getOffAlertBody')}</Text>
          {stopName ? <Text style={styles.stopName}>{stopName}</Text> : null}
          <Pressable style={styles.button} onPress={() => setVisible(false)}>
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: Colors.warning,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  body: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 8 },
  stopName: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 20 },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
