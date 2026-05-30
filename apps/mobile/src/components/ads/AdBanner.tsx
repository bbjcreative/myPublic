import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AdUnits } from '../../constants/adUnits';
import { useAdVisibility } from './AdContext';
import { usePrefsStore } from '../../store/prefsStore';

export function AdBanner() {
  const visibility = useAdVisibility();
  const isAdFree = usePrefsStore(s => s.isAdFree);

  if (visibility !== 'BANNER' || isAdFree()) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AdUnits.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});
