export const FEATURE_FLAGS = { 
  ENABLE_DUELS: true, 
  ENABLE_LEADERBOARDS: true, 
  ENABLE_CARD_COLLECTION: false, 
  ENABLE_CLUBS: false, 
  ENABLE_LIVE_EVENTS: false, 
} as const; 
 
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean { 
  return FEATURE_FLAGS[feature]; 
} 
