// apps/web/src/pages/__tests__/QuizSetupPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useQuestions } from '../../hooks/useQuestions';
import QuizSetupPage from '../QuizSetupPage';
import React from 'react';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../hooks/useQuestions', () => ({ useQuestions: vi.fn() }));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseQuestions = useQuestions as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <QuizSetupPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const sports = [
  { id: 'football', name: 'Football', description: '', iconUrl: null, accentColor: '#4A90FF' },
  { id: 'basketball', name: 'Basketball', description: '', iconUrl: null, accentColor: '#FF6B35' },
];
const categories = [
  { id: 'cat1', sportId: 'football', name: 'Histoire', description: '' },
  { id: 'cat2', sportId: 'football', name: 'Joueurs', description: '' },
  { id: 'cat3', sportId: 'basketball', name: 'NBA', description: '' },
];

describe('QuizSetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseQuestions.mockReturnValue({
      sports,
      categories,
      loading: false,
      error: null,
      questions: [],
      fetchQuestions: vi.fn(),
      createQuestion: vi.fn(),
      updateQuestion: vi.fn(),
      deleteQuestion: vi.fn(),
    });
  });

  it('doit afficher le formulaire de configuration', () => {
    renderPage();
    expect(screen.getByText('Configurer le quiz')).toBeDefined();
    expect(screen.getByText('Sport')).toBeDefined();
    expect(screen.getByText('Catégorie')).toBeDefined();
    expect(screen.getByText('Difficulté')).toBeDefined();
    expect(screen.getByText('Nombre de questions')).toBeDefined();
  });

  it('doit avoir le bouton désactivé tant que les sélections sont incomplètes', () => {
    renderPage();
    const button = screen.getByText('⚡ Lancer le quiz');
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('doit activer le bouton quand sport et catégorie sont sélectionnés', async () => {
    renderPage();

    // Sélectionner un sport
    const sportSelect = screen.getByDisplayValue('Sélectionner un sport');
    fireEvent.change(sportSelect, { target: { value: 'football' } });

    // Sélectionner une catégorie
    const catSelect = screen.getByDisplayValue("Choisissez d'abord un sport");
    fireEvent.change(catSelect, { target: { value: 'cat1' } });

    const button = screen.getByText('⚡ Lancer le quiz');
    expect((button as HTMLButtonElement).disabled).toBe(false);
  });

  it('doit filtrer les catégories selon le sport choisi', async () => {
    renderPage();

    const sportSelect = screen.getByDisplayValue('Sélectionner un sport');
    fireEvent.change(sportSelect, { target: { value: 'football' } });

    const catSelect = screen.getByDisplayValue('Sélectionner une catégorie');
    expect(catSelect).toBeDefined();
  });

  it('doit afficher un message de chargement si loading', () => {
    mockUseQuestions.mockReturnValue({
      sports: [],
      categories: [],
      loading: true,
      error: null,
      questions: [],
      fetchQuestions: vi.fn(),
      createQuestion: vi.fn(),
      updateQuestion: vi.fn(),
      deleteQuestion: vi.fn(),
    });
    renderPage();
    // Des squelettes devraient apparaître
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});