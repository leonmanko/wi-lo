// apps/web/src/components/theme/SportThemeProvider.tsx

import React, { useEffect } from 'react';
import { useSportTheme } from '../../hooks/useSportTheme';

/**
 * SportThemeProvider — Applique automatiquement la couleur du sport
 * favori de l'utilisateur aux variables CSS globales.
 * 
 * À wrapper autour de l'application (dans App.tsx ou main.tsx).
 * 
 * Utilisation :
 * ```tsx
 * <SportThemeProvider>
 *   <App />
 * </SportThemeProvider>
 * ```
 */

interface SportThemeProviderProps {
  children: React.ReactNode;
}

export default function SportThemeProvider({
  children,
}: SportThemeProviderProps): React.ReactElement {
  const { sportTheme } = useSportTheme();

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--sport-accent', sportTheme.primary);
    root.style.setProperty('--sport-accent-light', sportTheme.light);
    root.style.setProperty('--sport-accent-glow', sportTheme.glow);

    // Transition fluide lors du changement de sport
    root.style.setProperty('--sport-transition', 'background-color 400ms ease, color 400ms ease, border-color 400ms ease, box-shadow 400ms ease');
  }, [sportTheme]);

  return <>{children}</>;
}