import { useEffect, useRef, useCallback } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { AdUnits } from '../constants/adUnits';
import { usePrefsStore } from '../store/prefsStore';

const AD_FREE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export function useRewardedAd() {
  const adRef = useRef<RewardedAd | null>(null);
  const loadedRef = useRef(false);
  const grantAdFree = usePrefsStore(s => s.grantAdFree);

  const loadAd = useCallback(() => {
    const ad = RewardedAd.createForAdRequest(AdUnits.rewarded, { requestNonPersonalizedAdsOnly: false });
    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => { loadedRef.current = true; });
    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      grantAdFree(AD_FREE_DURATION_MS);
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      loadAd();
    });
    ad.load();
    adRef.current = ad;
  }, [grantAdFree]);

  useEffect(() => {
    loadAd();
    return () => { adRef.current = null; };
  }, [loadAd]);

  const showAd = useCallback(() => {
    if (loadedRef.current) adRef.current?.show();
  }, []);

  return { showAd, isLoaded: loadedRef.current };
}
