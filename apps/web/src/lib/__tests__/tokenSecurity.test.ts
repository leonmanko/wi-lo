// apps/web/src/lib/__tests__/tokenSecurity.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  verifyTokenStorage,
  sanitizeTokenStorage,
  checkUrlForTokenLeak,
  stripSensitiveData,
  SENSITIVE_KEYS,
} from '../tokenSecurity';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('tokenSecurity', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // verifyTokenStorage
  // -------------------------------------------------------------------------

  describe('verifyTokenStorage', () => {
    it('doit retourner valid=true quand aucun token dans localStorage', () => {
      const result = verifyTokenStorage();
      expect(result.valid).toBe(true);
    });

    it('doit détecter un token Supabase dans localStorage', () => {
      localStorage.setItem('supabase.auth.token', 'fake-token');

      const result = verifyTokenStorage();

      expect(result.valid).toBe(false);
      expect(result.storageType).toBe('localStorage (nettoyé)');
      // Le token doit avoir été supprimé
      expect(localStorage.getItem('supabase.auth.token')).toBeNull();
    });

    it('doit détecter un token avec le préfixe sb-', () => {
      localStorage.setItem('sb-access-token', 'fake-token');

      const result = verifyTokenStorage();

      expect(result.valid).toBe(false);
      expect(localStorage.getItem('sb-access-token')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // sanitizeTokenStorage
  // -------------------------------------------------------------------------

  describe('sanitizeTokenStorage', () => {
    it('doit supprimer toutes les entrées sensibles du localStorage', () => {
      localStorage.setItem('user_preference', 'dark');
      localStorage.setItem('supabase.auth.token', 'secret');
      localStorage.setItem('sb-refresh-token', 'secret2');
      localStorage.setItem('theme', 'dark');

      sanitizeTokenStorage();

      expect(localStorage.getItem('user_preference')).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
      expect(localStorage.getItem('supabase.auth.token')).toBeNull();
      expect(localStorage.getItem('sb-refresh-token')).toBeNull();
    });

    it('ne doit pas supprimer les entrées sessionStorage', () => {
      sessionStorage.setItem('app_data', 'value');

      sanitizeTokenStorage();

      expect(sessionStorage.getItem('app_data')).toBe('value');
    });
  });

  // -------------------------------------------------------------------------
  // checkUrlForTokenLeak
  // -------------------------------------------------------------------------

  describe('checkUrlForTokenLeak', () => {
    it('doit retourner true pour une URL propre', () => {
      // Simuler une URL propre
      vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

      const result = checkUrlForTokenLeak();

      expect(result).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // stripSensitiveData
  // -------------------------------------------------------------------------

  describe('stripSensitiveData', () => {
    it('doit retirer les clés sensibles connues', () => {
      const data = {
        status: 'authenticated',
        user: { id: '123', name: 'Test' },
        accessToken: 'secret-token',
        refresh_token: 'secret-refresh',
        password: 'password123',
      };

      const safe = stripSensitiveData(data);

      expect(safe.status).toBe('authenticated');
      expect(safe.user).toEqual({ id: '123', name: 'Test' });
      expect(safe).not.toHaveProperty('accessToken');
      expect(safe).not.toHaveProperty('refresh_token');
      expect(safe).not.toHaveProperty('password');
    });

    it('doit retirer les clés contenant "token"', () => {
      const data = {
        id: '123',
        my_custom_token: 'secret',
        normalField: 'ok',
      };

      const safe = stripSensitiveData(data);

      expect(safe.id).toBe('123');
      expect(safe.normalField).toBe('ok');
      expect(safe).not.toHaveProperty('my_custom_token');
    });

    it('doit gérer un objet vide', () => {
      const safe = stripSensitiveData({});
      expect(safe).toEqual({});
    });

    it('doit retirer les clés additionnelles spécifiées', () => {
      const data = {
        id: '123',
        customSecret: 'secret',
      };

      const safe = stripSensitiveData(data, ['customSecret']);

      expect(safe.id).toBe('123');
      expect(safe).not.toHaveProperty('customSecret');
    });
  });

  // -------------------------------------------------------------------------
  // SENSITIVE_KEYS
  // -------------------------------------------------------------------------

  describe('SENSITIVE_KEYS', () => {
    it('doit contenir les clés de tokens standards', () => {
      expect(SENSITIVE_KEYS).toContain('accessToken');
      expect(SENSITIVE_KEYS).toContain('access_token');
      expect(SENSITIVE_KEYS).toContain('refreshToken');
      expect(SENSITIVE_KEYS).toContain('refresh_token');
      expect(SENSITIVE_KEYS).toContain('token');
      expect(SENSITIVE_KEYS).toContain('jwt');
      expect(SENSITIVE_KEYS).toContain('password');
    });
  });
});