// apps/web/src/__tests__/auth-flow.integration.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Hooks et stores
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';

// Composants
import PrivateRoute from '../components/auth/PrivateRoute';
import PublicRoute from '../components/auth/PublicRoute';
import LogoutButton from '../components/auth/LogoutButton';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Types
import type { UserProfile } from '../types/auth';

// ---------------------------------------------------------------------------
// Mocks globaux
// ---------------------------------------------------------------------------

// Mock du client Supabase
vi.mock('../lib/supabase', () => ({
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

import { supabase } from '../lib/supabase';

// Mock du module tokenSecurity
vi.mock('../lib/tokenSecurity', () => ({
  verifyTokenStorage: vi.fn().mockReturnValue({ valid: true, storageType: 'sessionStorage' }),
  sanitizeTokenStorage: vi.fn(),
  checkUrlForTokenLeak: vi.fn().mockReturnValue(true),
  debugTokenSecurity: vi.fn(),
  stripSensitiveData: vi.fn((data) => data),
  SENSITIVE_KEYS: ['accessToken', 'refreshToken', 'password'],
}));

// ---------------------------------------------------------------------------
// Données de test
// ---------------------------------------------------------------------------

const mockUser: UserProfile = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  birthDate: '2000-01-01',
  lastSignedIn: '2024-06-01T00:00:00Z',
  profile: {
    bio: null,
    avatarUrl: null,
    level: 1,
    xp: 0,
    totalCoins: 0,
    totalDiamonds: 0,
    favoriteSport: 'football',
    favoriteTeam: null,
  },
};

function mockSupabaseUser(overrides = {}) {
  return {
    id: mockUser.id,
    email: mockUser.email,
    user_metadata: {
      name: mockUser.name,
      birth_date: mockUser.birthDate,
      favorite_sport: mockUser.profile?.favoriteSport,
    },
    created_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: mockUser.lastSignedIn,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface TestAppProps {
  initialRoute?: string;
}

/**
 * Application de test avec toutes les routes nécessaires
 * pour tester le flux d'authentification complet.
 */
function TestApp({ initialRoute = '/login' }: TestAppProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {/* Routes publiques */}
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Routes protégées */}
          <Route element={<PrivateRoute />}>
            <Route
              path="/"
              element={
                <div>
                  <h1>Accueil WI-LO</h1>
                  <p>Bienvenue, {mockUser.name}</p>
                  <LogoutButton />
                </div>
              }
            />
            <Route
              path="/profile"
              element={
                <div>
                  <h1>Profil</h1>
                  <LogoutButton variant="fullWidth" />
                </div>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// Import nécessaire pour le JSX
import { Routes, Route } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Helper : configurer l'état d'authentification
// ---------------------------------------------------------------------------

function mockUnauthenticated() {
  (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: { session: null },
    error: null,
  });
  (supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
    data: {
      subscription: { unsubscribe: vi.fn() },
    },
  });
}

function mockAuthenticated() {
  (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: {
      session: {
        user: mockSupabaseUser(),
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000,
      },
    },
    error: null,
  });
  (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: { user: mockSupabaseUser() },
    error: null,
  });
  (supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
    data: {
      subscription: { unsubscribe: vi.fn() },
    },
  });
}

// ---------------------------------------------------------------------------
// Tests du flux complet
// ---------------------------------------------------------------------------

describe('Flux d\'authentification complet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    useAuthStore.getState().reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    useAuthStore.getState().reset();
  });

  // =========================================================================
  // SCÉNARIO 1 : Inscription → Connexion → Accueil → Déconnexion
  // =========================================================================

  describe('Scénario nominal : Inscription → Connexion → Déconnexion', () => {
    it('doit permettre à un utilisateur de s\'inscrire, se connecter et se déconnecter', async () => {
      // -------------------------------------------------------------------
      // ÉTAPE 1 : L'utilisateur arrive sur la page de connexion
      // -------------------------------------------------------------------
      mockUnauthenticated();

      render(<TestApp initialRoute="/login" />);

      await waitFor(() => {
        expect(screen.getByText('Connexion')).toBeDefined();
      });

      // Il voit le lien vers l'inscription
      expect(screen.getByText('Créer un compte')).toBeDefined();

      // -------------------------------------------------------------------
      // ÉTAPE 2 : Il clique sur "Créer un compte"
      // -------------------------------------------------------------------
      fireEvent.click(screen.getByText('Créer un compte'));

      await waitFor(() => {
        expect(screen.getByText('Votre profil')).toBeDefined();
      });

      // -------------------------------------------------------------------
      // ÉTAPE 3 : Il remplit le formulaire d'inscription
      // -------------------------------------------------------------------
      fireEvent.change(screen.getByLabelText('Nom complet'), {
        target: { value: 'Jean Dupont' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'jean@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Mot de passe'), {
        target: { value: 'Azerty123' },
      });
      fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
        target: { value: 'Azerty123' },
      });
      fireEvent.change(screen.getByLabelText('Date de naissance'), {
        target: { value: '1995-06-15' },
      });

      // -------------------------------------------------------------------
      // ÉTAPE 4 : Il clique sur Continuer
      // -------------------------------------------------------------------
      (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          user: mockSupabaseUser({
            email: 'jean@example.com',
            user_metadata: { name: 'Jean Dupont', birth_date: '1995-06-15' },
          }),
        },
        error: null,
      });

      fireEvent.click(screen.getByText('Continuer'));

      await waitFor(() => {
        expect(screen.getByText('Presque terminé !')).toBeDefined();
      });

      // -------------------------------------------------------------------
      // ÉTAPE 5 : Il accepte les conditions et crée son compte
      // -------------------------------------------------------------------
      const acceptTermsCheckbox = screen.getByLabelText(/J'accepte les/);
      fireEvent.click(acceptTermsCheckbox);

      fireEvent.click(screen.getByText('Créer mon compte'));

      // -------------------------------------------------------------------
      // ÉTAPE 6 : Après inscription, il est redirigé vers /onboarding
      // (simulé ici par l'appel à navigate('/onboarding') dans RegisterPage)
      // -------------------------------------------------------------------
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalled();
      });

      // -------------------------------------------------------------------
      // ÉTAPE 7 : Il revient plus tard, arrive sur /login
      // -------------------------------------------------------------------
      mockUnauthenticated();
      render(<TestApp initialRoute="/login" />);

      await waitFor(() => {
        expect(screen.getByText('Connexion')).toBeDefined();
      });

      // -------------------------------------------------------------------
      // ÉTAPE 8 : Il se connecte avec son email et mot de passe
      // -------------------------------------------------------------------
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'jean@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Mot de passe'), {
        target: { value: 'Azerty123' },
      });

      (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          user: mockSupabaseUser({
            email: 'jean@example.com',
            user_metadata: { name: 'Jean Dupont' },
          }),
        },
        error: null,
      });

      fireEvent.click(screen.getByText('Se connecter'));

      // -------------------------------------------------------------------
      // ÉTAPE 9 : Après connexion, il accède à la page d'accueil protégée
      // -------------------------------------------------------------------
      mockAuthenticated();
      render(<TestApp initialRoute="/" />);

      await waitFor(() => {
        expect(screen.getByText('Accueil WI-LO')).toBeDefined();
      });

      // -------------------------------------------------------------------
      // ÉTAPE 10 : Il se déconnecte
      // -------------------------------------------------------------------
      (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: null,
      });

      const logoutButton = screen.getByText('Se déconnecter');
      fireEvent.click(logoutButton);

      // Confirmation dans la modale
      await waitFor(() => {
        expect(screen.getByText('Se déconnecter ?')).toBeDefined();
      });

      // Clic sur "Se déconnecter" dans la modale
      const confirmButtons = screen.getAllByText('Se déconnecter');
      const confirmButton = confirmButtons.find(
        (btn) => btn.parentElement?.tagName === 'BUTTON' && 
                 !btn.parentElement?.getAttribute('aria-label')
      );
      
      if (confirmButton) {
        fireEvent.click(confirmButton);
      }

      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalled();
      });
    });
  });

  // =========================================================================
  // SCÉNARIO 2 : Tentative d'accès à une page protégée sans authentification
  // =========================================================================

  describe('Protection des routes', () => {
    it('doit rediriger vers /login si l\'utilisateur tente d\'accéder à une page protégée', async () => {
      mockUnauthenticated();

      render(<TestApp initialRoute="/profile" />);

      // Doit être redirigé vers /login
      await waitFor(() => {
        expect(screen.getByText('Connexion')).toBeDefined();
      });

      // La page profil ne doit pas être visible
      expect(screen.queryByText('Profil')).toBeNull();
    });

    it('doit rediriger vers l\'accueil si l\'utilisateur connecté tente d\'accéder à /login', async () => {
      mockAuthenticated();

      render(<TestApp initialRoute="/login" />);

      // Doit être redirigé vers l'accueil
      await waitFor(() => {
        expect(screen.getByText('Accueil WI-LO')).toBeDefined();
      });

      // La page login ne doit pas être visible
      expect(screen.queryByText('Connexion')).toBeNull();
    });
  });

  // =========================================================================
  // SCÉNARIO 3 : Gestion des erreurs de connexion
  // =========================================================================

  describe('Gestion des erreurs', () => {
    it('doit afficher une erreur si les identifiants sont invalides', async () => {
      mockUnauthenticated();

      render(<TestApp initialRoute="/login" />);

      await waitFor(() => {
        expect(screen.getByText('Connexion')).toBeDefined();
      });

      // Remplir avec des identifiants invalides
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'inconnu@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Mot de passe'), {
        target: { value: 'mauvais' },
      });

      // Simuler une erreur Supabase
      (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid login credentials'),
      });

      fireEvent.click(screen.getByText('Se connecter'));

      // Vérifier que l'erreur est affichée
      await waitFor(() => {
        expect(screen.getByText('Email ou mot de passe incorrect')).toBeDefined();
      });
    });

    it('doit afficher une erreur si l\'email est déjà utilisé à l\'inscription', async () => {
      mockUnauthenticated();

      render(<TestApp initialRoute="/register" />);

      await waitFor(() => {
        expect(screen.getByText('Votre profil')).toBeDefined();
      });

      // Remplir le formulaire
      fireEvent.change(screen.getByLabelText('Nom complet'), {
        target: { value: 'Jean Dupont' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'existant@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Mot de passe'), {
        target: { value: 'Azerty123' },
      });
      fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
        target: { value: 'Azerty123' },
      });
      fireEvent.change(screen.getByLabelText('Date de naissance'), {
        target: { value: '1995-06-15' },
      });

      // Simuler une erreur "email déjà utilisé"
      (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: null },
        error: new Error('User already registered'),
      });

      fireEvent.click(screen.getByText('Continuer'));

      await waitFor(() => {
        expect(screen.getByText('Un compte existe déjà avec cet email')).toBeDefined();
      });
    });
  });

  // =========================================================================
  // SCÉNARIO 4 : Validation de l'âge à l'inscription
  // =========================================================================

  describe('Validation de l\'âge', () => {
    it('doit bloquer l\'inscription si l\'utilisateur a moins de 13 ans', async () => {
      mockUnauthenticated();

      render(<TestApp initialRoute="/register" />);

      await waitFor(() => {
        expect(screen.getByText('Votre profil')).toBeDefined();
      });

      // Remplir le formulaire avec une date trop récente
      fireEvent.change(screen.getByLabelText('Nom complet'), {
        target: { value: 'Petit Jean' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'jeune@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Mot de passe'), {
        target: { value: 'Azerty123' },
      });
      fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
        target: { value: 'Azerty123' },
      });

      // Date correspondant à un enfant de 10 ans
      const today = new Date();
      const tenYearsAgo = new Date(
        today.getFullYear() - 10,
        today.getMonth(),
        today.getDate()
      );
      const dateString = tenYearsAgo.toISOString().split('T')[0];

      fireEvent.change(screen.getByLabelText('Date de naissance'), {
        target: { value: dateString },
      });

      fireEvent.click(screen.getByText('Continuer'));

      // Vérifier que l'erreur d'âge est affichée
      await waitFor(() => {
        expect(screen.getByText(/13 ans/)).toBeDefined();
      });

      // Vérifier que l'inscription n'a pas été appelée
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // SCÉNARIO 5 : Restauration de session
  // =========================================================================

  describe('Restauration de session', () => {
    it('doit restaurer la session si l\'utilisateur a déjà un token valide', async () => {
      mockAuthenticated();

      render(<TestApp initialRoute="/" />);

      // Doit afficher directement l'accueil sans passer par login
      await waitFor(() => {
        expect(screen.getByText('Accueil WI-LO')).toBeDefined();
      });

      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });
});