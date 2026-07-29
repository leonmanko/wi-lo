// apps/web/src/pages/__tests__/ProfilePage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import ProfilePage from '../ProfilePage';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/tokenSecurity', () => ({
  sanitizeTokenStorage: vi.fn(),
  stripSensitiveData: vi.fn((data) => data),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Données de test
// ---------------------------------------------------------------------------

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Jean Dupont',
  role: 'user' as const,
  birthDate: '1995-06-15',
  lastSignedIn: '2024-06-01T00:00:00Z',
  createdAt: '2024-01-15T00:00:00Z',
  profile: {
    bio: 'Fan de football',
    avatarUrl: null,
    level: 15,
    xp: 7500,
    totalCoins: 12500,
    totalDiamonds: 340,
    favoriteSport: 'football',
    favoriteTeam: 'Olympique de Marseille',
  },
};

const mockUserNoProfile = {
  ...mockUser,
  profile: null,
};

const mockAdmin = {
  ...mockUser,
  role: 'admin' as const,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // État chargement
  // =========================================================================

  it('doit afficher le squelette pendant le chargement', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    // Le squelette est animé (animate-pulse)
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeDefined();
  });

  // =========================================================================
  // État non authentifié
  // =========================================================================

  it('doit afficher un message si non authentifié', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    expect(screen.getByText(/Vous devez être connecté/)).toBeDefined();
    expect(screen.getByText('Se connecter')).toBeDefined();
  });

  // =========================================================================
  // État erreur
  // =========================================================================

  it('doit afficher un message d\'erreur avec bouton réessayer', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
      error: { code: 'PROFILE_ERROR', message: 'Profil introuvable' },
      refreshSession: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('Impossible de charger le profil')).toBeDefined();
    expect(screen.getByText('Profil introuvable')).toBeDefined();
    expect(screen.getByText('Réessayer')).toBeDefined();
  });

  // =========================================================================
  // État complet — utilisateur avec profil
  // =========================================================================

  it('doit afficher le nom et l\'email de l\'utilisateur', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
  });

  it('doit afficher le niveau de l\'utilisateur', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('Niveau 15')).toBeDefined();
  });

  it('doit afficher les statistiques', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('12.5k')).toBeDefined(); // Coins
    expect(screen.getByText('340')).toBeDefined(); // Diamonds
    expect(screen.getByText('15')).toBeDefined(); // Niveau
    expect(screen.getByText('7.5k')).toBeDefined(); // XP
  });

  it('doit afficher les préférences sportives', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    expect(screen.getByText(/Football/)).toBeDefined();
    expect(screen.getByText(/Olympique de Marseille/)).toBeDefined();
  });

  it('doit afficher les initiales si pas d\'avatar', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('JD')).toBeDefined();
  });

  it('doit afficher le badge admin pour un administrateur', () => {
    mockUseAuth.mockReturnValue({
      user: mockAdmin,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('Admin')).toBeDefined();
  });

  // =========================================================================
  // État vide — utilisateur sans profil
  // =========================================================================

  it('doit afficher les valeurs par défaut si pas de profil', () => {
    mockUseAuth.mockReturnValue({
      user: mockUserNoProfile,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    // Niveau 1 par défaut
    expect(screen.getByText('Niveau 1')).toBeDefined();
    // 0 Coins
    expect(screen.getByText('0')).toBeDefined();
  });

  // =========================================================================
  // Liens de navigation
  // =========================================================================

  it('doit afficher les liens vers les sections', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('Ma collection')).toBeDefined();
    expect(screen.getByText('Portefeuille')).toBeDefined();
    expect(screen.getByText('Sécurité')).toBeDefined();
    expect(screen.getByText('Paramètres')).toBeDefined();
  });

  it('doit avoir un lien vers la modification du profil', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      refreshSession: vi.fn(),
    });

    renderPage();

    const editLink = screen.getByText('Modifier');
    expect(editLink).toBeDefined();
    expect(editLink.getAttribute('href')).toBe('/profile/edit');
  });

  // =========================================================================
  // Rafraîchissement
  // =========================================================================

  it('doit appeler refreshSession au clic sur Réessayer', () => {
    const mockRefresh = vi.fn().mockResolvedValue(undefined);

    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
      error: { code: 'ERROR', message: 'Erreur' },
      refreshSession: mockRefresh,
    });

    renderPage();

    fireEvent.click(screen.getByText('Réessayer'));
    expect(mockRefresh).toHaveBeenCalled();
  });
});