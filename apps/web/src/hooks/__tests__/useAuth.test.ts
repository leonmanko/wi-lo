// apps/web/src/hooks/__tests__/useAuth.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { supabase } from '../../lib/supabase';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      mfa: {
        enroll: vi.fn(),
        challengeAndVerify: vi.fn(),
      },
    },
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function mockSupabaseUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
      birth_date: '2000-01-01',
      favorite_sport: 'football',
    },
    created_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-06-01T00:00:00Z',
    ...overrides,
  };
}

function mockSession(overrides: Record<string, unknown> = {}) {
  return {
    user: mockSupabaseUser(),
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-123',
    expires_at: Date.now() + 3600 * 1000,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    (supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Cas nominal : initialisation avec session existante
  // -------------------------------------------------------------------------

  it('doit restaurer la session existante au montage', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: mockSession() },
      error: null,
    });
    (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockSupabaseUser() },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.status).toBe('loading');
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.status).toBe('authenticated');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe('user-123');
    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.user?.name).toBe('Test User');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Cas nominal : pas de session existante
  // -------------------------------------------------------------------------

  it('doit détecter l\'absence de session au montage', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('unauthenticated');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Cas nominal : login avec email/mot de passe
  // -------------------------------------------------------------------------

  it('doit connecter l\'utilisateur avec email et mot de passe', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('unauthenticated');
    });

    (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockSupabaseUser() },
      error: null,
    });

    await act(async () => {
      await result.current.loginWithEmail('test@example.com', 'password123');
    });

    expect(result.current.status).toBe('authenticated');
    expect(result.current.isAuthenticated).toBe(true);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  // -------------------------------------------------------------------------
  // Cas d'erreur : login avec credentials invalides
  // -------------------------------------------------------------------------

  it('doit gérer l\'erreur de credentials invalides', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('unauthenticated');
    });

    (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid login credentials'),
    });

    await act(async () => {
      try {
        await result.current.loginWithEmail('wrong@example.com', 'wrongpass');
      } catch {
        // Erreur attendue
      }
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).not.toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Cas d'erreur : login avec champs vides
  // -------------------------------------------------------------------------

  it('doit valider les champs email et mot de passe avant soumission', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('unauthenticated');
    });

    await act(async () => {
      try {
        await result.current.loginWithEmail('', '');
      } catch {
        // Erreur attendue
      }
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.code).toBe('VALIDATION_ERROR');
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Cas nominal : inscription
  // -------------------------------------------------------------------------

  it('doit inscrire un nouvel utilisateur', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('unauthenticated');
    });

    (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockSupabaseUser({ email: 'new@example.com' }) },
      error: null,
    });

    const registerParams = {
      email: 'new@example.com',
      password: 'securePassword123',
      name: 'New User',
      birthDate: '2000-01-01',
      consents: {
        personalized_ads: true,
        analytics: true,
        cookies: true,
      },
      favoriteSport: 'football',
    };

    await act(async () => {
      await result.current.register(registerParams);
    });

    expect(result.current.status).toBe('authenticated');
    expect(result.current.user?.email).toBe('new@example.com');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'securePassword123',
      options: {
        data: {
          name: 'New User',
          birth_date: '2000-01-01',
          favorite_sport: 'football',
        },
      },
    });
  });

  // -------------------------------------------------------------------------
  // Cas d'erreur : inscription avec âge insuffisant
  // -------------------------------------------------------------------------

  it('doit rejeter l\'inscription d\'un mineur de moins de 13 ans', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('unauthenticated');
    });

    const today = new Date();
    const tooYoung = new Date(
      today.getFullYear() - 10,
      today.getMonth(),
      today.getDate()
    );

    await act(async () => {
      try {
        await result.current.register({
          email: 'kid@example.com',
          password: 'securePassword123',
          name: 'Kid',
          birthDate: tooYoung.toISOString().split('T')[0],
          consents: { personalized_ads: false, analytics: false, cookies: false },
        });
      } catch {
        // Erreur attendue
      }
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toContain('13 ans');
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Cas nominal : déconnexion
  // -------------------------------------------------------------------------

  it('doit déconnecter l\'utilisateur et nettoyer le cache', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: mockSession() },
      error: null,
    });
    (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockSupabaseUser() },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('authenticated');
    });

    (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: null,
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Cas d'erreur : déconnexion avec erreur Supabase
  // -------------------------------------------------------------------------

  it('doit nettoyer l\'état local même si la déconnexion Supabase échoue', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: mockSession() },
      error: null,
    });
    (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockSupabaseUser() },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('authenticated');
    });

    (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: new Error('Network error'),
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Cas nominal : MFA
  // -------------------------------------------------------------------------

  it('doit retourner l\'URL du QR code pour l\'activation MFA', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: mockSession() },
      error: null,
    });
    (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockSupabaseUser() },
      error: null,
    });

    (supabase.auth.mfa.enroll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        totp: {
          qr_code: 'https://example.com/qr-code',
        },
      },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('authenticated');
    });

    let qrCodeUrl: string | undefined;
    await act(async () => {
      qrCodeUrl = await result.current.enableMfa();
    });

    expect(qrCodeUrl).toBe('https://example.com/qr-code');
    expect(supabase.auth.mfa.enroll).toHaveBeenCalledWith({ factorType: 'totp' });
  });

  // -------------------------------------------------------------------------
  // Cas nominal : updateUser (anciennement updateProfile)
  // -------------------------------------------------------------------------

  it('doit mettre à jour le profil utilisateur localement', async () => {
    const userWithProfile = mockSupabaseUser();
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: mockSession() },
      error: null,
    });
    (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: userWithProfile },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe('authenticated');
    });

    // Mise à jour du nom via updateUser (la méthode exposée par le hook)
    act(() => {
      result.current.updateUser({
        name: 'Nouveau Nom',
      });
    });

    expect(result.current.user?.name).toBe('Nouveau Nom');
  });
});