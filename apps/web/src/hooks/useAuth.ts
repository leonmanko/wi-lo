// apps/web/src/hooks/useAuth.ts

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type {
  AuthContext,
  AuthProvider,
  RegisterParams,
  UserProfile,
  AuthError,
  UserRole,
} from '../types/auth';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Hook d'authentification principal pour WI-LO.
 * Point d'entrée unique pour toutes les opérations d'authentification.
 */
export function useAuth(): AuthContext {
  const store = useAuthStore();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // apps/web/src/hooks/useAuth.ts
  // Juste après les useState, ajouter :
  // ⚠️ Simulation DEV — à retirer quand le backend est connecté
  const isDev = import.meta.env.DEV;

  if (isDev) {
    // Simuler un utilisateur authentifié en développement
    const devUser: UserProfile = {
      id: 'dev-user-123',
      email: 'dev@wilo.app',
      name: 'Développeur',
      role: 'admin',
      birthDate: '1995-01-01',
      lastSignedIn: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      profile: {
        bio: 'Mode développement',
        avatarUrl: null,
        level: 15,
        xp: 7500,
        totalCoins: 12500,
        totalDiamonds: 340,
        favoriteSport: null,
        favoriteTeam: null,
      },
    };

    // Exposer les mêmes propriétés que le vrai hook
    return {
      status: 'authenticated' as const,
      user: devUser,
      error: null,
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      login: async () => {},
      loginWithEmail: async () => {},
      register: async () => {},
      logout: async () => {},
      refreshSession: async () => {},
      enableMfa: async () => 'https://placeholder-qr-code.com',
      verifyMfa: async () => {},
      updateUser: () => {},
      hasConsent: () => true,
      clearError: () => {},
    };
  }

  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function initializeAuth(): Promise<void> {
      store.setLoading();

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (data.session?.user && !cancelled) {
          try {
            const profile = await fetchUserProfile();
            store.setAuthenticated(profile);
          } catch {
            const minimalProfile = buildMinimalProfile(data.session.user);
            store.setAuthenticated(minimalProfile);
          }
        } else if (!cancelled) {
          store.setUnauthenticated();
        }
      } catch (err) {
        if (!cancelled) {
          store.setError(mapAuthError(err));
        }
      } finally {
        if (!cancelled) {
          setIsInitialized(true);
        }
      }
    }

    const { data } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await fetchUserProfile();
            store.setAuthenticated(profile);
          } catch {
            const minimalProfile = buildMinimalProfile(session.user);
            store.setAuthenticated(minimalProfile);
          }
        } else if (event === 'SIGNED_OUT') {
          store.setUnauthenticated();
          queryClient.clear();
        } else if (event === 'TOKEN_REFRESHED') {
          // Rafraîchissement silencieux, rien à faire côté UI
        } else if (event === 'USER_UPDATED' && session?.user) {
          store.updateUser({
            email: session.user.email ?? undefined,
          });
        }
      }
    );

    const subscription = data.subscription;
    initializeAuth();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const login = useCallback(async (provider: AuthProvider) => {
    if (provider === 'email') {
      throw new Error('Utilisez loginWithEmail pour la connexion par email/mot de passe');
    }

    store.setLoading();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams:
            provider === 'google'
              ? { access_type: 'offline', prompt: 'consent' }
              : undefined,
        },
      });

      if (error) throw error;
    } catch (err) {
      store.setError(mapAuthError(err));
      throw err;
    }
  }, [store]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      const validationError: AuthError = {
        code: 'VALIDATION_ERROR',
        message: 'Email et mot de passe sont requis',
      };
      store.setError(validationError);
      throw validationError;
    }

    store.setLoading();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.user) {
        try {
          const profile = await fetchUserProfile();
          store.setAuthenticated(profile);
        } catch {
          const minimalProfile = buildMinimalProfile(data.user);
          store.setAuthenticated(minimalProfile);
        }
      }
    } catch (err) {
      store.setError(mapAuthError(err));
      throw err;
    }
  }, [store]);

  const register = useCallback(async (params: RegisterParams) => {
    const validationError = validateRegisterParams(params);
    if (validationError) {
      store.setError(validationError);
      throw validationError;
    }

    store.setLoading();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            name: params.name,
            birth_date: params.birthDate,
            favorite_sport: params.favoriteSport ?? null,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Inscription échouée : aucun utilisateur retourné');

      const profile = buildMinimalProfile(data.user);
      store.setAuthenticated(profile);
    } catch (err) {
      store.setError(mapAuthError(err));
      throw err;
    }
  }, [store]);

  const logout = useCallback(async () => {
    store.setLoading();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      store.setError(mapAuthError(err));
    } finally {
      store.reset();
      queryClient.clear();
    }
  }, [store, queryClient]);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const profile = await fetchUserProfile();
        store.setAuthenticated(profile);
      }
    } catch (err) {
      store.setError(mapAuthError(err));
      throw err;
    }
  }, [store]);

  const enableMfa = useCallback(async (): Promise<string> => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      if (!data?.totp?.qr_code) throw new Error('QR code MFA non disponible');
      return data.totp.qr_code;
    } catch (err) {
      store.setError(mapAuthError(err));
      throw err;
    }
  }, [store]);

  const verifyMfa = useCallback(async (code: string) => {
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: '',
        code,
      });
      if (error) throw error;
    } catch (err) {
      store.setError(mapAuthError(err));
      throw err;
    }
  }, [store]);

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    store.updateUser(data);
  }, [store]);

  const hasConsent = useCallback((_consentType: string): boolean => {
    // Note: les consentements RGPD sont gérés côté backend.
    // Cette méthode existe pour la compatibilité future.
    return true;
  }, []);

  // ---------------------------------------------------------------------------
  // Contexte
  // ---------------------------------------------------------------------------

  return {
    status: store.status,
    user: store.user,
    error: store.error,
    isAuthenticated: store.status === 'authenticated',
    isAdmin: store.user?.role === 'admin',
    isLoading: store.status === 'loading' || !isInitialized,

    login,
    loginWithEmail,
    register,
    logout,
    refreshSession,
    enableMfa,
    verifyMfa,
    updateUser,
    hasConsent,
    clearError: store.clearError,  // ← Ajouté
  };
}

// ===========================================================================
// Utilitaires privés
// ===========================================================================

async function fetchUserProfile(): Promise<UserProfile> {
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    throw new Error('Utilisateur non trouvé');
  }

  return buildMinimalProfile(data.user);
}

function buildMinimalProfile(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
  last_sign_in_at?: string;
}): UserProfile {
  const metadata = user.user_metadata ?? {};

  // apps/web/src/hooks/useAuth.ts — Dans buildMinimalProfile, ajouter :

  return {
  id: user.id,
  email: user.email ?? '',
  name: (metadata.name as string) ?? user.email?.split('@')[0] ?? 'Joueur',
    role: (metadata.role as UserRole) ?? (import.meta.env.DEV ? 'admin' : 'user'),
  birthDate: (metadata.birth_date as string) ?? '',
  lastSignedIn: user.last_sign_in_at ?? null,
  createdAt: user.created_at ?? new Date().toISOString(),  // ← Ajouté
  profile: {
    bio: null,
    avatarUrl: null,
    level: 1,
    xp: 0,
    totalCoins: 0,
    totalDiamonds: 0,
    favoriteSport: (metadata.favorite_sport as string) ?? null,
    favoriteTeam: null,
  },
};
}

function validateRegisterParams(params: RegisterParams): AuthError | null {
  const errors: string[] = [];

  if (!params.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
    errors.push('Email invalide');
  }

  if (!params.password || params.password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!params.name || params.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (!params.birthDate) {
    errors.push('La date de naissance est requise');
  } else {
    const birthDate = new Date(params.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 13) {
      errors.push('Vous devez avoir au moins 13 ans pour vous inscrire');
    }
  }

  if (errors.length > 0) {
    return { code: 'VALIDATION_ERROR', message: errors.join('. ') };
  }

  return null;
}

function mapAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    const supabaseErr = error as Error & { status?: number; code?: string };

    if (supabaseErr.status !== undefined) {
      return {
        code: supabaseErr.code ?? 'AUTH_ERROR',
        message: mapSupabaseErrorMessage(supabaseErr),
        statusCode: supabaseErr.status,
      };
    }

    return { code: 'UNKNOWN_ERROR', message: error.message };
  }

  return { code: 'UNKNOWN_ERROR', message: 'Une erreur inattendue est survenue' };
}

function mapSupabaseErrorMessage(error: Error & { code?: string }): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'Email ou mot de passe incorrect';
    case 'email_not_confirmed':
      return 'Veuillez confirmer votre adresse email avant de vous connecter';
    case 'user_not_found':
      return 'Aucun compte trouvé avec cet email';
    case 'email_taken':
    case 'user_already_exists':
      return 'Un compte existe déjà avec cet email';
    case 'weak_password':
      return 'Le mot de passe est trop faible';
    case 'over_email_send_rate_limit':
      return 'Trop de tentatives. Veuillez réessayer dans quelques minutes';
    case 'over_request_rate_limit':
      return 'Trop de requêtes. Veuillez patienter';
    case 'session_expired':
      return 'Votre session a expiré. Veuillez vous reconnecter';
    default:
      return error.message || 'Une erreur est survenue lors de l\'authentification';
  }
}