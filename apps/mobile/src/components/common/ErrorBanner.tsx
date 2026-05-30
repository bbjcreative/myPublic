import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { usePrefsStore } from '../../store/prefsStore';
import { t } from '../../constants/i18n';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: Props) {
  const lang = usePrefsStore(s => s.lang);
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{message ?? t(lang, 'error')}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.retry}>{t(lang, 'retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.error + '18',
    padding: 14,
    margin: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: { fontSize: 14, color: Colors.error, flex: 1 },
  retry: { fontSize: 14, color: Colors.primary, fontWeight: '600', marginLeft: 12 },
});
