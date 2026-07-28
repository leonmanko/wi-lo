// apps/web/src/components/auth/__tests__/PrivateRoute.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import PrivateRoute from '../PrivateRoute';
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

function renderWithRouter(initialRoute = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Page de connexion</div>} />
        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<div>Contenu protégé</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // État chargement
  // -------------------------------------------------------------------------

  it('doit afficher le loader pendant la vérification de session', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithRouter();

    expect(screen.getByText('Vérification de votre session...')).toBeDefined();
  });

  it('doit afficher un loader personnalisé si fourni', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            element={
              <PrivateRoute loadingComponent={<div>Loader custom</div>} />
            }
          >
            <Route path="/protected" element={<div>Protégé</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loader custom')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // État non authentifié
  // -------------------------------------------------------------------------

  it('doit rediriger vers /login si non authentifié', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter();

    expect(screen.getByText('Page de connexion')).toBeDefined();
    expect(screen.queryByText('Contenu protégé')).toBeNull();
  });

  // -------------------------------------------------------------------------
  // État authentifié
  // -------------------------------------------------------------------------

  it('doit afficher le contenu protégé si authentifié', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter();

    expect(screen.getByText('Contenu protégé')).toBeDefined();
  });
});