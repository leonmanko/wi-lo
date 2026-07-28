// apps/web/src/components/auth/__tests__/PublicRoute.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import PublicRoute from '../PublicRoute';
import React from 'react';

// ---------------------------------------------------------------------------
// Mock du hook useAuth
// ---------------------------------------------------------------------------

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithRouter(initialRoute = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<div>Accueil</div>} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<div>Page login</div>} />
          <Route path="/register" element={<div>Page register</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PublicRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // État chargement
  // -------------------------------------------------------------------------

  it('doit afficher le loader pendant la vérification', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithRouter();

    expect(screen.getByText('Chargement...')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // État non authentifié
  // -------------------------------------------------------------------------

  it('doit afficher la page publique si non authentifié', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter();

    expect(screen.getByText('Page login')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // État déjà authentifié
  // -------------------------------------------------------------------------

  it('doit rediriger vers l\'accueil si déjà authentifié', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter();

    expect(screen.getByText('Accueil')).toBeDefined();
    expect(screen.queryByText('Page login')).toBeNull();
  });
});