// apps/web/src/pages/admin/__tests__/AdminCategoriesPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import AdminCategoriesPage from '../AdminCategoriesPage';
import React from 'react';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({
    categories: [
      { id: 'cat1', sportId: 'football', name: 'Histoire', description: 'Moments historiques' },
      { id: 'cat2', sportId: 'basketball', name: 'NBA', description: 'Actualité NBA' },
    ],
    sports: [
      { id: 'football', name: 'Football', description: '', iconUrl: null, accentColor: '#4A90FF' },
      { id: 'basketball', name: 'Basketball', description: '', iconUrl: null, accentColor: '#FF6B35' },
    ],
    loading: false,
    error: null,
    fetchCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  })),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminCategoriesPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAdmin: true, isLoading: false });
  });

  it('doit afficher la liste des catégories pour un admin', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Histoire')).toBeDefined();
      expect(screen.getByText('NBA')).toBeDefined();
    });
  });

  it('doit rediriger si non admin', () => {
    mockUseAuth.mockReturnValue({ isAdmin: false, isLoading: false });
    renderPage();
    expect(screen.queryByText('Gestion des catégories')).toBeNull();
  });

  it('doit afficher le formulaire de création', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Gestion des catégories'));
    fireEvent.click(screen.getByText('Nouvelle catégorie'));
    await waitFor(() => {
      expect(screen.getByText('Nouvelle catégorie')).toBeDefined(); // titre du form
      expect(screen.getByPlaceholderText('Ex: Histoire, Joueurs...')).toBeDefined();
    });
  });

  it('doit pouvoir filtrer par sport', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Histoire'));
    const select = screen.getByDisplayValue('Tous les sports');
    fireEvent.change(select, { target: { value: 'basketball' } });
    await waitFor(() => {
      expect(screen.getByText('NBA')).toBeDefined();
      expect(screen.queryByText('Histoire')).toBeNull();
    });
  });
});