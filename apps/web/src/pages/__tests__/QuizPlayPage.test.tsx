// apps/web/src/pages/__tests__/QuizPlayPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import QuizPlayPage from '../QuizPlayPage';
import React from 'react';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

function renderPage(initialRoute = '/quiz/play?sport=football&count=3') {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/quiz/play" element={<QuizPlayPage />} />
          <Route path="/quiz/results" element={<div>Résultats</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('QuizPlayPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
  });

  it('doit afficher la question et les options', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Qui a remporté/)).toBeDefined();
    });
    expect(screen.getByText('France')).toBeDefined();
    expect(screen.getByText('Croatie')).toBeDefined();
  });

  it('doit permettre de sélectionner une réponse', async () => {
    renderPage();
    await waitFor(() => screen.getByText('France'));
    fireEvent.click(screen.getByText('France'));
    await waitFor(() => {
      expect(screen.getByText(/\+[0-9]+ points !/)).toBeDefined();
    });
  });

  it('doit afficher le bouton Suivant après réponse', async () => {
    renderPage();
    await waitFor(() => screen.getByText('France'));
    fireEvent.click(screen.getByText('France'));
    expect(screen.getByText('Suivant')).toBeDefined();
  });

  it('doit rediriger vers login si non authentifié', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderPage();
    expect(screen.getByText('Login')).toBeDefined();
  });
});