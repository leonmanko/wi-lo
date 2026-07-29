// apps/web/src/pages/onboarding/__tests__/OnboardingPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import OnboardingPage from '../OnboardingPage';
import React from 'react';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@test.com',
  role: 'user' as const,
  profile: {
    bio: null,
    avatarUrl: null,
    level: 1,
    xp: 0,
    totalCoins: 0,
    totalDiamonds: 0,
    favoriteSport: null,
    favoriteTeam: null,
  },
};

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      updateUser: vi.fn(),
    });
  });

  it('doit afficher le logo au démarrage', () => {
    renderPage();
    expect(screen.getByText('WI')).toBeDefined();
    expect(screen.getByText('LO')).toBeDefined();
  });

  it('doit passer à l\'étape sport après le logo', async () => {
    renderPage();

    await waitFor(
      () => {
        expect(screen.getByText('Choisis ton sport')).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it('doit afficher 6 sports dans la grille', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Choisis ton sport')).toBeDefined();
    });

    expect(screen.getByText('Football')).toBeDefined();
    expect(screen.getByText('Basketball')).toBeDefined();
    expect(screen.getByText('Tennis')).toBeDefined();
    expect(screen.getByText('Rugby')).toBeDefined();
    expect(screen.getByText('Formule 1')).toBeDefined();
    expect(screen.getByText('MMA / Combat')).toBeDefined();
  });

  it('doit passer à l\'étape équipe après sélection d\'un sport', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Choisis ton sport')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Football'));

    await waitFor(() => {
      expect(screen.getByText('Ton équipe préférée')).toBeDefined();
    });
  });

  it('doit permettre de passer l\'étape équipe', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Choisis ton sport')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Basketball'));

    await waitFor(() => {
      expect(screen.getByText('Passer cette étape')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Passer cette étape'));

    await waitFor(() => {
      expect(screen.getByText('Quiz en direct')).toBeDefined();
    });
  });

  it('doit afficher les 3 slides du didacticiel', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Choisis ton sport')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Tennis'));
    fireEvent.click(screen.getByText('Passer cette étape'));

    await waitFor(() => {
      expect(screen.getByText('Quiz en direct')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Suivant'));
    await waitFor(() => {
      expect(screen.getByText('Collectionne')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Suivant'));
    await waitFor(() => {
      expect(screen.getByText('Compétition')).toBeDefined();
    });
  });
});