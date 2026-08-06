// apps/web/src/pages/__tests__/QuizResultsPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import QuizResultsPage from '../QuizResultsPage';
import React from 'react';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

const mockData = {
  score: 28,
  totalQuestions: 5,
  questions: [
    {
      id: 'q1',
      questionText: 'Qui a gagné la Coupe du Monde 2018 ?',
      answers: [
        { text: 'France', isCorrect: true },
        { text: 'Croatie', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      questionText: 'Qui détient le record de Ballons d\'Or ?',
      answers: [
        { text: 'Lionel Messi', isCorrect: true },
        { text: 'Cristiano Ronaldo', isCorrect: false },
      ],
    },
  ],
  userAnswers: ['France', 'Cristiano Ronaldo'],
};

function renderPage(state = mockData) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: '/quiz/results', state }]}>
        <Routes>
          <Route path="/quiz/results" element={<QuizResultsPage />} />
          <Route path="/quiz" element={<div>Quiz Setup</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('QuizResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
  });

  it('doit afficher le score', () => {
    renderPage();
    expect(screen.getByText('28')).toBeDefined();
  });

  it('doit afficher le nombre de bonnes réponses', () => {
    renderPage();
    expect(screen.getByText('1/2')).toBeDefined();
  });

  it('doit afficher le détail des réponses', () => {
    renderPage();
    expect(screen.getByText('Ta réponse : France')).toBeDefined();
    expect(screen.getByText('Ta réponse : Cristiano Ronaldo')).toBeDefined();
  });

  it('doit avoir un bouton Rejouer', () => {
    renderPage();
    expect(screen.getByText('🔄 Rejouer')).toBeDefined();
  });

  it('doit avoir un bouton Partager', () => {
    renderPage();
    expect(screen.getByText('📤 Partager')).toBeDefined();
  });

  it('doit afficher un message si aucun résultat', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/quiz/results']}>
          <Routes>
            <Route path="/quiz/results" element={<QuizResultsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Aucun résultat disponible.')).toBeDefined();
  });
});