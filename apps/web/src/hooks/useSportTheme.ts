// apps/web/src/hooks/useSportTheme.ts

import { useMemo } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook de personnalisation des couleurs par sport.
 * 
 * Retourne la couleur d'accent correspondant au sport favori
 * de l'utilisateur, et applique cette couleur aux variables CSS
 * globales pour que toute l'interface s'adapte.
 * 
 * Utilisation :
 * ```tsx
 * const { accentColor, sportColor, applySportTheme } = useSportTheme();
 * 
 * // Appliquer à un élément
 * <div style={{ backgroundColor: accentColor }}>Contenu</div>
 * ```
 */

interface SportThemeColors {
  primary: string;
  light: string;
  glow: string;
  name: string;
  emoji: string;
}

const SPORT_THEMES: Record<string, SportThemeColors> = {
  football: {
    primary: '#4A90FF',
    light: '#4A90FF1A',
    glow: 'rgba(74, 144, 255, 0.30)',
    name: 'Football',
    emoji: '⚽',
  },
  basketball: {
    primary: '#FF6B35',
    light: '#FF6B351A',
    glow: 'rgba(255, 107, 53, 0.30)',
    name: 'Basketball',
    emoji: '🏀',
  },
  tennis: {
    primary: '#FFD700',
    light: '#FFD7001A',
    glow: 'rgba(255, 215, 0, 0.30)',
    name: 'Tennis',
    emoji: '🎾',
  },
  rugby: {
    primary: '#2EC4B6',
    light: '#2EC4B61A',
    glow: 'rgba(46, 196, 182, 0.30)',
    name: 'Rugby',
    emoji: '🏉',
  },
  f1: {
    primary: '#E63946',
    light: '#E639461A',
    glow: 'rgba(230, 57, 70, 0.30)',
    name: 'Formule 1',
    emoji: '🏎️',
  },
  combat: {
    primary: '#FF4500',
    light: '#FF45001A',
    glow: 'rgba(255, 69, 0, 0.30)',
    name: 'MMA / Combat',
    emoji: '🥋',
  },
};

const DEFAULT_THEME: SportThemeColors = {
  primary: 'var(--wilo-blue-500)',
  light: 'rgba(37, 99, 235, 0.10)',
  glow: 'rgba(37, 99, 235, 0.30)',
  name: 'WI-LO',
  emoji: '🏆',
};

/**
 * Applique la couleur du sport aux variables CSS globales.
 * Modifie --sport-accent, --sport-accent-light, --sport-accent-glow
 * dans :root pour que toute l'interface s'adapte.
 */
function applyCSSVariables(theme: SportThemeColors): void {
  const root = document.documentElement;

  root.style.setProperty('--sport-accent', theme.primary);
  root.style.setProperty('--sport-accent-light', theme.light);
  root.style.setProperty('--sport-accent-glow', theme.glow);
  root.style.setProperty('--sport-accent-name', `"${theme.name}"`);
}

export function useSportTheme() {
  const { user } = useAuth();

  const sportTheme = useMemo(() => {
    const sport = user?.profile?.favoriteSport;
    if (!sport) return DEFAULT_THEME;
    return SPORT_THEMES[sport] ?? DEFAULT_THEME;
  }, [user?.profile?.favoriteSport]);

  /**
   * Applique manuellement un thème de sport.
   * Utile dans l'onboarding pour prévisualiser avant sauvegarde.
   */
  function applySportTheme(sport: string | null): void {
    const theme = sport ? (SPORT_THEMES[sport] ?? DEFAULT_THEME) : DEFAULT_THEME;
    applyCSSVariables(theme);
  }

  /**
   * Couleur d'accent actuelle (valeur CSS brute).
   * Ex: '#4A90FF' pour football
   */
  const accentColor = sportTheme.primary;

  /**
   * Nom du sport affiché.
   */
  const sportName = sportTheme.name;

  /**
   * Emoji du sport.
   */
  const sportEmoji = sportTheme.emoji;

  /**
   * Couleur glow pour les ombres.
   */
  const accentGlow = sportTheme.glow;

  return {
    accentColor,
    sportName,
    sportEmoji,
    accentGlow,
    sportTheme,
    applySportTheme,
    availableSports: Object.keys(SPORT_THEMES),
  };
}