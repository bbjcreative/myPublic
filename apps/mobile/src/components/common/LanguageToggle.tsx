import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { usePrefsStore } from '../../store/prefsStore';
import { Lang } from '../../constants/i18n';

export function LanguageToggle() {
  const { lang, setLang } = usePrefsStore();

  return (
    <View style={styles.container}>
      {(['en', 'ms'] as Lang[]).map(l => (
        <TouchableOpacity
          key={l}
          style={[styles.btn, lang === l && styles.active]}
          onPress={() => setLang(l)}
        >
          <Text style={[styles.text, lang === l && styles.activeText]}>
            {l === 'en' ? 'English' : 'BM'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: Colors.border, borderRadius: 10, padding: 3 },
  btn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  active: { backgroundColor: Colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  text: { fontSize: 14, color: Colors.textSecondary },
  activeText: { color: Colors.text, fontWeight: '600' },
});
