// apps/web/src/hooks/useOnboardingPersistence.ts

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook de persistance des données d'onboarding.
 * 
 * Sauvegarde la progression dans sessionStorage pour résister
 * à une fermeture accidentelle de l'onglet ou un rechargement.
 * 
 * Si l'utilisateur ferme l'onglet au milieu de l'onboarding,
 * il reprend là où il s'était arrêté (sauf Welcome qui recommence).
 */

const STORAGE_KEY = 'wi-lo-onboarding';

interface OnboardingState {
  favoriteSport: string | null;
  favoriteTeam: string | null;
  lastCompletedStep: string | null;
  startedAt: string;
}

export function useOnboardingPersistence() {
  const [isRestored, setIsRestored] = useState(false);

  // Restaurer l'état au montage
  const restoredState = ((): OnboardingState | null => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingState;
        // Si l'onboarding a commencé il y a plus d'une heure, on recommence
        const age = Date.now() - new Date(parsed.startedAt).getTime();
        if (age > 60 * 60 * 1000) {
          sessionStorage.removeItem(STORAGE_KEY);
          return null;
        }
        return parsed;
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    return null;
  })();

  useEffect(() => {
    setIsRestored(true);
  }, []);

  const saveProgress = useCallback((data: Partial<OnboardingState>) => {
    try {
      const current = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) || '{}'
      ) as Partial<OnboardingState>;
      const updated = {
        ...current,
        ...data,
        startedAt: current.startedAt || new Date().toISOString(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silencieux — la persistance est un bonus, pas un bloquant
    }
  }, []);

  const clearProgress = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasIncompleteOnboarding = ((): boolean => {
    if (!restoredState) return false;
    return restoredState.lastCompletedStep !== 'tutorial';
  })();

  return {
    restoredState,
    isRestored,
    hasIncompleteOnboarding,
    saveProgress,
    clearProgress,
  };
}