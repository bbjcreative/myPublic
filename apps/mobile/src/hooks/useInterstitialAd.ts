import { useEffect, useRef, useCallback } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AdUnits } from '../constants/adUnits';
import { usePrefsStore } from '../store/prefsStore';

const MIN_INTERVAL_MS = 3 * 60_000;

export function useInterstitialAd() {
  const adRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);
  const lastShownRef = useRef(0);
  const isAdFree = usePrefsStore(s => s.isAdFree);

  const loadAd = useCallback(() => {
    const ad = InterstitialAd.createForAdRequest(AdUnits.interstitial, { requestNonPersonalizedAdsOnly: false });
    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => { loadedRef.current = true; });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      unsubLoaded();
      unsubClosed();
      loadAd();
    });
    ad.load();
    adRef.current = ad;
  }, []);

  useEffect(() => {
    loadAd();
    return () => { adRef.current = null; };
  }, [loadAd]);

  const showAd = useCallback(() => {
    if (isAdFree()) return;
    const now = Date.now();
    if (!loadedRef.current) return;
    if (now - lastShownRef.current < MIN_INTERVAL_MS) return;
    lastShownRef.current = now;
    adRef.current?.show();
  }, [isAdFree]);

  return { showAd };
}
