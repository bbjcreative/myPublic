import React, { createContext, useContext } from 'react';

export type AdVisibility = 'NEVER' | 'BANNER' | 'INTERSTITIAL_ELIGIBLE' | 'REWARDED_ELIGIBLE';

const AdContext = createContext<AdVisibility>('NEVER');

export function AdProvider({ visibility, children }: { visibility: AdVisibility; children: React.ReactNode }) {
  return <AdContext.Provider value={visibility}>{children}</AdContext.Provider>;
}

export function useAdVisibility(): AdVisibility {
  return useContext(AdContext);
}
