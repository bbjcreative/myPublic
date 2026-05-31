import remoteConfig from '@react-native-firebase/remote-config';

export type AppRemoteConfig = {
  force_update_enabled: boolean;
  force_update_min_version: string;
  force_update_message_en: string;
  force_update_message_ms: string;
  maintenance_mode: boolean;
  maintenance_message_en: string;
  maintenance_message_ms: string;
  ads_enabled: boolean;
  interstitial_cooldown_ms: number;
};

const DEFAULTS: AppRemoteConfig = {
  force_update_enabled: false,
  force_update_min_version: '1.0.0',
  force_update_message_en: 'A critical update is available. Please update myPublic to continue.',
  force_update_message_ms: 'Kemas kini kritikal tersedia. Sila kemas kini myPublic untuk meneruskan.',
  maintenance_mode: false,
  maintenance_message_en: 'myPublic is currently under maintenance. Please try again shortly.',
  maintenance_message_ms: 'myPublic sedang dalam penyelenggaraan. Sila cuba sebentar lagi.',
  ads_enabled: true,
  interstitial_cooldown_ms: 180_000,
};

export async function initialiseRemoteConfig(): Promise<void> {
  const rc = remoteConfig();
  await rc.setDefaults(DEFAULTS as unknown as Record<string, string | number | boolean>);
  await rc.setConfigSettings({ minimumFetchIntervalMillis: __DEV__ ? 0 : 3_600_000 });
  try {
    await rc.fetchAndActivate();
  } catch {
    // Network failure — defaults remain active, safe to continue
  }
}

export function getRemoteConfig(): AppRemoteConfig {
  const rc = remoteConfig();
  return {
    force_update_enabled: rc.getValue('force_update_enabled').asBoolean(),
    force_update_min_version: rc.getValue('force_update_min_version').asString(),
    force_update_message_en: rc.getValue('force_update_message_en').asString(),
    force_update_message_ms: rc.getValue('force_update_message_ms').asString(),
    maintenance_mode: rc.getValue('maintenance_mode').asBoolean(),
    maintenance_message_en: rc.getValue('maintenance_message_en').asString(),
    maintenance_message_ms: rc.getValue('maintenance_message_ms').asString(),
    ads_enabled: rc.getValue('ads_enabled').asBoolean(),
    interstitial_cooldown_ms: rc.getValue('interstitial_cooldown_ms').asNumber(),
  };
}
