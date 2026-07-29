// apps/web/src/hooks/__tests__/useSportTheme.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSportTheme } from '../useSportTheme';
import { useAuth } from '../useAuth';

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe('useSportTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doit retourner le thème par défaut si pas de sport', () => {
    mockUseAuth.mockReturnValue({
      user: { profile: { favoriteSport: null } },
    });

    const { result } = renderHook(() => useSportTheme());

    expect(result.current.sportName).toBe('WI-LO');
  });

  it('doit retourner la couleur du football', () => {
    mockUseAuth.mockReturnValue({
      user: { profile: { favoriteSport: 'football' } },
    });

    const { result } = renderHook(() => useSportTheme());

    expect(result.current.accentColor).toBe('#4A90FF');
    expect(result.current.sportName).toBe('Football');
    expect(result.current.sportEmoji).toBe('⚽');
  });

  it('doit retourner la couleur du basketball', () => {
    mockUseAuth.mockReturnValue({
      user: { profile: { favoriteSport: 'basketball' } },
    });

    const { result } = renderHook(() => useSportTheme());

    expect(result.current.accentColor).toBe('#FF6B35');
    expect(result.current.sportName).toBe('Basketball');
  });

  it('doit retourner le thème par défaut pour un sport inconnu', () => {
    mockUseAuth.mockReturnValue({
      user: { profile: { favoriteSport: 'hockey' } },
    });

    const { result } = renderHook(() => useSportTheme());

    expect(result.current.sportName).toBe('WI-LO');
  });

  it('doit appliquer un thème manuellement via applySportTheme', () => {
    mockUseAuth.mockReturnValue({
      user: { profile: { favoriteSport: null } },
    });

    const { result } = renderHook(() => useSportTheme());

    result.current.applySportTheme('tennis');

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--sport-accent')).toBe('#FFD700');
  });
});