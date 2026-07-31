// apps/web/src/hooks/__tests__/useOnboardingPersistence.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingPersistence } from '../useOnboardingPersistence';

describe('useOnboardingPersistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('doit retourner null si pas de données stockées', () => {
    const { result } = renderHook(() => useOnboardingPersistence());

    expect(result.current.restoredState).toBeNull();
    expect(result.current.hasIncompleteOnboarding).toBe(false);
  });

  it('doit restaurer les données stockées', () => {
    sessionStorage.setItem(
      'wi-lo-onboarding',
      JSON.stringify({
        favoriteSport: 'football',
        favoriteTeam: null,
        lastCompletedStep: 'sport',
        startedAt: new Date().toISOString(),
      })
    );

    const { result } = renderHook(() => useOnboardingPersistence());

    expect(result.current.restoredState?.favoriteSport).toBe('football');
    expect(result.current.restoredState?.lastCompletedStep).toBe('sport');
    expect(result.current.hasIncompleteOnboarding).toBe(true);
  });

  it('doit ignorer les données périmées (>1 heure)', () => {
    sessionStorage.setItem(
      'wi-lo-onboarding',
      JSON.stringify({
        favoriteSport: 'football',
        favoriteTeam: null,
        lastCompletedStep: 'sport',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      })
    );

    const { result } = renderHook(() => useOnboardingPersistence());

    expect(result.current.restoredState).toBeNull();
    expect(result.current.hasIncompleteOnboarding).toBe(false);
    expect(sessionStorage.getItem('wi-lo-onboarding')).toBeNull();
  });

  it('doit sauvegarder la progression', () => {
    const { result } = renderHook(() => useOnboardingPersistence());

    act(() => {
      result.current.saveProgress({
        favoriteSport: 'basketball',
        lastCompletedStep: 'sport',
      });
    });

    const stored = JSON.parse(sessionStorage.getItem('wi-lo-onboarding')!);
    expect(stored.favoriteSport).toBe('basketball');
    expect(stored.lastCompletedStep).toBe('sport');
  });

  it('doit nettoyer la progression', () => {
    sessionStorage.setItem(
      'wi-lo-onboarding',
      JSON.stringify({
        favoriteSport: 'tennis',
        favoriteTeam: null,
        lastCompletedStep: 'sport',
        startedAt: new Date().toISOString(),
      })
    );

    const { result } = renderHook(() => useOnboardingPersistence());

    act(() => {
      result.current.clearProgress();
    });

    expect(sessionStorage.getItem('wi-lo-onboarding')).toBeNull();
  });

  it('doit gérer un sessionStorage corrompu', () => {
    sessionStorage.setItem('wi-lo-onboarding', '{json invalide}');

    const { result } = renderHook(() => useOnboardingPersistence());

    expect(result.current.restoredState).toBeNull();
    expect(sessionStorage.getItem('wi-lo-onboarding')).toBeNull();
  });
});