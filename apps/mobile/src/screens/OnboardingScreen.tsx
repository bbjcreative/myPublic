import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { usePrefsStore } from '../store/prefsStore';
import { Lang, t } from '../constants/i18n';
import type { RootStackParamList } from '../navigation/RootNavigator';

const SLIDES = [
  { icon: 'bus' as const, color: Colors.modeBUS, titleKey: 'onboard1Title', descKey: 'onboard1Desc' },
  { icon: 'navigate' as const, color: Colors.primary, titleKey: 'onboard2Title', descKey: 'onboard2Desc' },
  { icon: 'car' as const, color: Colors.success, titleKey: 'onboard3Title', descKey: 'onboard3Desc' },
] as const;

type Slide = typeof SLIDES[number];
type Step = 'slides' | 'language' | 'location';

export function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const lang = usePrefsStore(s => s.lang);
  const setLang = usePrefsStore(s => s.setLang);
  const setOnboardingDone = usePrefsStore(s => s.setOnboardingDone);

  const [step, setStep] = useState<Step>('slides');
  const [slideIndex, setSlideIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const handleViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const idx = viewableItems[0]?.index;
    if (idx != null) setSlideIndex(idx);
  }).current;

  const finish = () => {
    setOnboardingDone(true);
    navigation.replace('Main');
  };

  const handleNext = () => {
    if (step === 'slides') {
      if (slideIndex < SLIDES.length - 1) {
        const next = slideIndex + 1;
        listRef.current?.scrollToIndex({ index: next, animated: true });
      } else {
        setStep('language');
      }
    } else if (step === 'language') {
      setStep('location');
    }
  };

  const handleLocationAllow = async () => {
    await ExpoLocation.requestForegroundPermissionsAsync();
    finish();
  };

  if (step === 'language') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.brand}>myPublic</Text>
          <Text style={styles.langHeading}>Choose your language</Text>
          <Text style={styles.langHeadingMs}>Pilih bahasa anda</Text>
          <TouchableOpacity
            style={[styles.langButton, lang === 'en' && styles.langButtonActive]}
            onPress={() => setLang('en')}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langButton, lang === 'ms' && styles.langButtonActive]}
            onPress={() => setLang('ms')}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, lang === 'ms' && styles.langTextActive]}>Bahasa Malaysia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>{t(lang, 'onboardContinue')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'location') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View style={[styles.iconBox, { backgroundColor: Colors.primary + '1A' }]}>
            <Ionicons name="location" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.slideTitle}>{t(lang, 'onboardLocationTitle')}</Text>
          <Text style={styles.slideDesc}>{t(lang, 'onboardLocationDesc')}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleLocationAllow} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>{t(lang, 'onboardAllowLocation')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={finish} activeOpacity={0.7}>
            <Text style={styles.ghostButtonText}>{t(lang, 'onboardSkipLocation')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>myPublic</Text>
        <TouchableOpacity onPress={() => setStep('language')} activeOpacity={0.7}>
          <Text style={styles.skipTop}>{t(lang, 'onboardSkip')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES as unknown as Slide[]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={handleViewable}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '1A' }]}>
              <Ionicons name={item.icon} size={52} color={item.color} />
            </View>
            <Text style={styles.slideTitle}>{t(lang, item.titleKey as any)}</Text>
            <Text style={styles.slideDesc}>{t(lang, item.descKey as any)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === slideIndex && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>
            {slideIndex < SLIDES.length - 1 ? t(lang, 'onboardNext') : t(lang, 'onboardContinue')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  skipTop: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDesc: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ghostButton: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  ghostButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  langHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  langHeadingMs: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 8,
  },
  langButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  langButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '0D',
  },
  langText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  langTextActive: {
    color: Colors.primary,
  },
});
