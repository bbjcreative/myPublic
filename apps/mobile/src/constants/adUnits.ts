import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const IS_DEV = __DEV__;

const ANDROID_IDS = {
  banner: process.env.ADMOB_BANNER_ANDROID ?? '',
  interstitial: process.env.ADMOB_INTERSTITIAL_ANDROID ?? '',
  rewarded: process.env.ADMOB_REWARDED_ANDROID ?? '',
};

const IOS_IDS = {
  banner: process.env.ADMOB_BANNER_IOS ?? '',
  interstitial: process.env.ADMOB_INTERSTITIAL_IOS ?? '',
  rewarded: process.env.ADMOB_REWARDED_IOS ?? '',
};

const platformIds = Platform.OS === 'ios' ? IOS_IDS : ANDROID_IDS;

export const AdUnits = {
  banner: IS_DEV ? TestIds.ADAPTIVE_BANNER : platformIds.banner,
  interstitial: IS_DEV ? TestIds.INTERSTITIAL : platformIds.interstitial,
  rewarded: IS_DEV ? TestIds.REWARDED : platformIds.rewarded,
};
