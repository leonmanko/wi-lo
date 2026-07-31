// apps/web/src/pages/admin/__tests__/AdminQuestionsPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import AdminQuestionsPage from '../AdminQuestionsPage';
import React from 'react';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../hooks/useQuestions', () => ({
  useQuestions: vi.fn(() => ({
    questions: [
      {
        id: 'q1',
        categoryId: 'cat1',
        questionText: 'Qui a gagné la LDC 2023 ?',
        difficultyLevel: 'medium',
        freshnessExpiresAt: '2026-12-31T00:00:00Z',
        createdBy: 'admin',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        answers: [],
        media: [],
        sourceFactId: null,
      },
    ],
    sports: [{ id: 'football', name: 'Football', description: '', iconUrl: null, accentColor: '#4A90FF' }],
    categories: [{ id: 'cat1', sportId: 'football', name: 'Histoire', description: '' }],
    loading: false,
    error: null,
    fetchQuestions: vi.fn(),
    createQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
  })),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminQuestionsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AdminQuestionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAdmin: true,
      isLoading: false,
    });
  });

  it('doit afficher la liste des questions pour un admin', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Qui a gagné la LDC 2023 ?')).toBeDefined();
    });
  });

  it('doit rediriger si non admin', () => {
    mockUseAuth.mockReturnValue({
      isAdmin: false,
      isLoading: false,
    });
    renderPage();
    // La page ne doit pas montrer le titre admin
    expect(screen.queryByText('Gestion des questions')).toBeNull();
  });

  it('doit afficher le formulaire de création quand on clique sur Nouvelle question', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Gestion des questions')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Nouvelle question'));
    await waitFor(() => {
      expect(screen.getByText('Nouvelle question')).toBeDefined(); // titre du formulaire
      expect(screen.getByPlaceholderText('Réponse 1')).toBeDefined();
    });
  });

  it('doit afficher un message quand la liste est vide', async () => {
    const { useQuestions } = await import('../../../hooks/useQuestions');
    (useQuestions as ReturnType<typeof vi.fn>).mockReturnValue({
      ...useQuestions(),
      questions: [],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Aucune question trouvée')).toBeDefined();
    });
  });
});