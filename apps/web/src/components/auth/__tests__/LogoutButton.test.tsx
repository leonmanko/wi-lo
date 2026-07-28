// apps/web/src/components/auth/__tests__/LogoutButton.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import LogoutButton from '../LogoutButton';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../lib/tokenSecurity', () => ({
  sanitizeTokenStorage: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderButton(props = {}) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LogoutButton {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      logout: vi.fn().mockResolvedValue(undefined),
      isLoading: false,
    });
  });

  // -------------------------------------------------------------------------
  // Rendu par défaut
  // -------------------------------------------------------------------------

  it('doit afficher le bouton avec le label par défaut', () => {
    renderButton();
    expect(screen.getByText('Se déconnecter')).toBeDefined();
  });

  it('doit afficher un label personnalisé', () => {
    renderButton({ label: 'Déco' });
    expect(screen.getByText('Déco')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Variante iconOnly
  // -------------------------------------------------------------------------

  it('doit afficher seulement l\'icône en variante iconOnly', () => {
    renderButton({ variant: 'iconOnly', label: 'Déconnexion' });
    expect(screen.queryByText('Déconnexion')).toBeNull();
    // Le bouton doit avoir un aria-label
    expect(screen.getByLabelText('Déconnexion')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Clic → modale de confirmation
  // -------------------------------------------------------------------------

  it('doit afficher la modale de confirmation au clic', () => {
    renderButton();
    
    fireEvent.click(screen.getByText('Se déconnecter'));
    
    expect(screen.getByText('Se déconnecter ?')).toBeDefined();
    expect(screen.getByText('Annuler')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Annulation
  // -------------------------------------------------------------------------

  it('doit fermer la modale sur Annuler', () => {
    renderButton();
    
    fireEvent.click(screen.getByText('Se déconnecter'));
    expect(screen.getByText('Se déconnecter ?')).toBeDefined();
    
    fireEvent.click(screen.getByText('Annuler'));
    expect(screen.queryByText('Se déconnecter ?')).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Confirmation → déconnexion
  // -------------------------------------------------------------------------

  it('doit appeler logout après confirmation', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
      isLoading: false,
    });

    renderButton();
    
    fireEvent.click(screen.getByText('Se déconnecter'));
    fireEvent.click(screen.getByText('Se déconnecter'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Déconnexion sans confirmation
  // -------------------------------------------------------------------------

  it('doit appeler logout directement si confirmBeforeLogout=false', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
      isLoading: false,
    });

    renderButton({ confirmBeforeLogout: false });
    
    fireEvent.click(screen.getByText('Se déconnecter'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // État chargement
  // -------------------------------------------------------------------------

  it('doit désactiver le bouton pendant la déconnexion', () => {
    mockUseAuth.mockReturnValue({
      logout: vi.fn(),
      isLoading: true,
    });

    renderButton();
    
    const button = screen.getByRole('button', { name: 'Se déconnecter' });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Erreur
  // -------------------------------------------------------------------------

  it('doit afficher l\'erreur si la déconnexion échoue', async () => {
    const mockLogout = vi.fn().mockRejectedValue(new Error('Réseau indisponible'));
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
      isLoading: false,
    });

    renderButton();
    
    fireEvent.click(screen.getByText('Se déconnecter'));
    fireEvent.click(screen.getByText('Se déconnecter'));

    await waitFor(() => {
      expect(screen.getByText('Réseau indisponible')).toBeDefined();
    });
  });
});