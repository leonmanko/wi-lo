// apps/web/src/components/profile/__tests__/AvatarUpload.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import AvatarUpload from '../AvatarUpload';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/avatars/test.jpg' },
        }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  },
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Données de test
// ---------------------------------------------------------------------------

const mockUserWithAvatar = {
  id: 'user-123',
  name: 'Jean Dupont',
  email: 'test@example.com',
  profile: {
    bio: null,
    avatarUrl: 'https://example.com/avatars/old.jpg',
    level: 1,
    xp: 0,
    totalCoins: 0,
    totalDiamonds: 0,
    favoriteSport: null,
    favoriteTeam: null,
  },
};

const mockUserNoAvatar = {
  id: 'user-456',
  name: 'Marie Martin',
  email: 'marie@example.com',
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

const defaultMock = {
  updateUser: vi.fn(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderComponent(user = mockUserWithAvatar) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AvatarUpload />
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AvatarUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // Avatar existant
  // =========================================================================

  it('doit afficher l\'avatar existant', () => {
    mockUseAuth.mockReturnValue({
      ...defaultMock,
      user: mockUserWithAvatar,
    });

    renderComponent();

    const img = screen.getByAltText('Avatar de Jean Dupont') as HTMLImageElement;
    expect(img.src).toBe('https://example.com/avatars/old.jpg');
  });

  // =========================================================================
  // Pas d'avatar → initiales
  // =========================================================================

  it('doit afficher les initiales si pas d\'avatar', () => {
    mockUseAuth.mockReturnValue({
      ...defaultMock,
      user: mockUserNoAvatar,
    });

    renderComponent();

    expect(screen.getByText('MM')).toBeDefined();
    expect(screen.getByText('Ajouter une photo')).toBeDefined();
    expect(screen.queryByText('Supprimer')).toBeNull();
  });

  // =========================================================================
  // Boutons changer/supprimer
  // =========================================================================

  it('doit afficher les boutons Changer et Supprimer si avatar existant', () => {
    mockUseAuth.mockReturnValue({
      ...defaultMock,
      user: mockUserWithAvatar,
    });

    renderComponent();

    expect(screen.getByText('Changer')).toBeDefined();
    expect(screen.getByText('Supprimer')).toBeDefined();
  });

  // =========================================================================
  // Indication des formats
  // =========================================================================

  it('doit afficher l\'indication des formats acceptés', () => {
    mockUseAuth.mockReturnValue({
      ...defaultMock,
      user: mockUserWithAvatar,
    });

    renderComponent();

    expect(screen.getByText('JPEG, PNG ou WebP. Max 5 Mo.')).toBeDefined();
  });

  // =========================================================================
  // Sélection de fichier invalide (type)
  // =========================================================================

  it('doit afficher une erreur pour un type de fichier non supporté', async () => {
    mockUseAuth.mockReturnValue({
      ...defaultMock,
      user: mockUserNoAvatar,
    });

    renderComponent();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['test'], 'test.gif', { type: 'image/gif' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Format non supporté/)).toBeDefined();
    });
  });
});