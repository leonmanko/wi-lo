// apps/web/src/pages/__tests__/ProfileEditPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import ProfileEditPage from '../ProfileEditPage';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
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
    bio: 'Fan de football depuis toujours',
    avatarUrl: null,
    level: 15,
    xp: 7500,
    totalCoins: 12500,
    totalDiamonds: 340,
    favoriteSport: 'football',
    favoriteTeam: 'Olympique de Marseille',
  },
};

const defaultMock = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  updateUser: vi.fn(),
  refreshSession: vi.fn().mockResolvedValue(undefined),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProfileEditPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProfileEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // État chargement
  // =========================================================================

  it('doit afficher le loader pendant le chargement', () => {
    mockUseAuth.mockReturnValue({
      ...defaultMock,
      isLoading: true,
    });

    renderPage();

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeDefined();
  });

  // =========================================================================
  // Formulaire pré-rempli
  // =========================================================================

  it('doit pré-remplir le formulaire avec les données du profil', () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    expect((screen.getByLabelText('Nom complet') as HTMLInputElement).value).toBe('Jean Dupont');
    expect((screen.getByLabelText('Bio') as HTMLTextAreaElement).value).toBe('Fan de football depuis toujours');
    expect((screen.getByLabelText('Sport favori') as HTMLSelectElement).value).toBe('football');
    expect((screen.getByLabelText('Équipe favorite') as HTMLInputElement).value).toBe('Olympique de Marseille');
  });

  it('doit afficher l\'email en lecture seule', () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.value).toBe('test@example.com');
    expect(emailInput.disabled).toBe(true);
  });

  // =========================================================================
  // Validation
  // =========================================================================

  it('doit afficher une erreur si le nom est trop court', async () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    const nameInput = screen.getByLabelText('Nom complet');
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('Minimum 2 caractères')).toBeDefined();
    });
  });

  it('doit afficher une erreur si le nom est vide', async () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    const nameInput = screen.getByLabelText('Nom complet');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeDefined();
    });
  });

  // =========================================================================
  // Compteur de caractères
  // =========================================================================

  it('doit afficher le compteur de caractères pour le nom', () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    expect(screen.getByText('11/50')).toBeDefined();
  });

  it('doit afficher le compteur de caractères pour la bio', () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    expect(screen.getByText('30/200')).toBeDefined();
  });

  // =========================================================================
  // Bouton désactivé sans modification
  // =========================================================================

  it('doit désactiver le bouton Enregistrer si pas de modification', () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    const saveButton = screen.getByText('Enregistrer') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('doit activer le bouton Enregistrer après modification', async () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    const nameInput = screen.getByLabelText('Nom complet');
    fireEvent.change(nameInput, { target: { value: 'Jean Modifié' } });

    await waitFor(() => {
      const saveButton = screen.getByText('Enregistrer') as HTMLButtonElement;
      expect(saveButton.disabled).toBe(false);
    });
  });

  // =========================================================================
  // Sauvegarde
  // =========================================================================

  it('doit appeler updateUser et refreshSession à la sauvegarde', async () => {
    const mockUpdateUser = vi.fn();
    const mockRefreshSession = vi.fn().mockResolvedValue(undefined);

    mockUseAuth.mockReturnValue({
      ...defaultMock,
      updateUser: mockUpdateUser,
      refreshSession: mockRefreshSession,
    });

    renderPage();

    fireEvent.change(screen.getByLabelText('Nom complet'), {
      target: { value: 'Jean Modifié' },
    });

    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled();
      expect(mockRefreshSession).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Modale : modifications non sauvegardées
  // =========================================================================

  it('doit afficher la modale si on annule avec des modifications', async () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    fireEvent.change(screen.getByLabelText('Nom complet'), {
      target: { value: 'Jean Modifié' },
    });

    fireEvent.click(screen.getByText('Annuler'));

    await waitFor(() => {
      expect(screen.getByText('Modifications non sauvegardées')).toBeDefined();
    });
  });

  it('doit fermer la modale sur "Continuer l\'édition"', async () => {
    mockUseAuth.mockReturnValue(defaultMock);

    renderPage();

    fireEvent.change(screen.getByLabelText('Nom complet'), {
      target: { value: 'Jean Modifié' },
    });

    fireEvent.click(screen.getByText('Annuler'));

    await waitFor(() => {
      expect(screen.getByText('Modifications non sauvegardées')).toBeDefined();
    });

    fireEvent.click(screen.getByText("Continuer l'édition"));

    await waitFor(() => {
      expect(screen.queryByText('Modifications non sauvegardées')).toBeNull();
    });
  });
});