// apps/web/src/pages/auth/__tests__/EnableMfaPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import EnableMfaPage from '../EnableMfaPage';
import React from 'react';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

function renderPage() {
  return render(
    <MemoryRouter>
      <EnableMfaPage />
    </MemoryRouter>
  );
}

describe('EnableMfaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // État chargement
  // -------------------------------------------------------------------------

  it('doit afficher le loader pendant la génération du QR code', () => {
    mockUseAuth.mockReturnValue({
      enableMfa: vi.fn(() => new Promise(() => {})), // Promise infinie
      verifyMfa: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    renderPage();

    expect(screen.getByText('Génération du QR code...')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // État QR code affiché
  // -------------------------------------------------------------------------

  it('doit afficher le QR code et le champ de saisie', async () => {
    mockUseAuth.mockReturnValue({
      enableMfa: vi.fn().mockResolvedValue('otpauth://totp/WI-LO:test@test.com?secret=ABCDEFGH&issuer=WI-LO'),
      verifyMfa: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Code de vérification')).toBeDefined();
    });

    expect(screen.getByText('ABCDEFGH')).toBeDefined();
    expect(screen.getByPlaceholderText('000000')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // État erreur de génération
  // -------------------------------------------------------------------------

  it('doit afficher une erreur si la génération échoue', async () => {
    mockUseAuth.mockReturnValue({
      enableMfa: vi.fn().mockRejectedValue(new Error('API indisponible')),
      verifyMfa: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('API indisponible')).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Validation du code
  // -------------------------------------------------------------------------

  it('doit afficher une erreur si le code ne fait pas 6 chiffres', async () => {
    mockUseAuth.mockReturnValue({
      enableMfa: vi.fn().mockResolvedValue('otpauth://totp/WI-LO:test@test.com?secret=ABCDEFGH&issuer=WI-LO'),
      verifyMfa: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '123' } });
    
    const button = screen.getByText('Vérifier');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/6 chiffres/)).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Succès
  // -------------------------------------------------------------------------

  it('doit afficher le message de succès après vérification', async () => {
    mockUseAuth.mockReturnValue({
      enableMfa: vi.fn().mockResolvedValue('otpauth://totp/WI-LO:test@test.com?secret=ABCDEFGH&issuer=WI-LO'),
      verifyMfa: vi.fn().mockResolvedValue(undefined),
      isAuthenticated: true,
      isLoading: false,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeDefined();
    });

    fireEvent.change(screen.getByPlaceholderText('000000'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByText('Vérifier'));

    await waitFor(() => {
      expect(screen.getByText('MFA activée avec succès !')).toBeDefined();
    });
  });
});