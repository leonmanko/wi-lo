// apps/web/src/lib/__tests__/validation.test.ts — Remplacer

import { describe, it, expect } from 'vitest';
import {
  required,
  minLength,
  maxLength,
  validEmail,
  strongPassword,
  matchPassword,
  minAge,
  validName,
  mustBeChecked,
  validateFields,
} from '../validation';

describe('validation', () => {
  describe('required', () => {
    it('doit retourner une erreur pour une chaîne vide', () => {
      expect(required()('')).toBe('Ce champ est requis');
    });

    it('doit retourner null pour une valeur valide', () => {
      expect(required()('test')).toBeNull();
    });
  });

  describe('minLength', () => {
    it('doit retourner une erreur si trop court', () => {
      expect(minLength(3)('ab')).toBe('Minimum 3 caractères');
    });

    it('doit retourner null si assez long', () => {
      expect(minLength(3)('abc')).toBeNull();
    });
  });

  describe('maxLength', () => {
    it('doit retourner une erreur si trop long', () => {
      expect(maxLength(5)('abcdef')).toBe('Maximum 5 caractères');
    });

    it('doit retourner null si dans la limite', () => {
      expect(maxLength(5)('abc')).toBeNull();
    });
  });

  describe('validEmail', () => {
    it('doit valider un email correct', () => {
      expect(validEmail()('test@example.com')).toBeNull();
    });

    it('doit rejeter un email sans @', () => {
      expect(validEmail()('test')).toBe("Format d'email invalide");
    });
  });

  describe('strongPassword', () => {
    it('doit valider un mot de passe fort', () => {
      expect(strongPassword()('Azerty123')).toBeNull();
    });

    it('doit rejeter un mot de passe trop court', () => {
      expect(strongPassword()('Ab1')).toBe('Minimum 8 caractères');
    });

    it('doit rejeter sans majuscule', () => {
      expect(strongPassword()('azerty123')).toBe('Doit contenir au moins une majuscule');
    });

    it('doit rejeter sans chiffre', () => {
      expect(strongPassword()('Azertyuiop')).toBe('Doit contenir au moins un chiffre');
    });
  });

  describe('matchPassword', () => {
    it('doit valider si correspond', () => {
      expect(matchPassword('Azerty123')('Azerty123')).toBeNull();
    });

    it('doit rejeter si différent', () => {
      expect(matchPassword('Azerty123')('Different')).toBe('Les mots de passe ne correspondent pas');
    });
  });

  describe('minAge', () => {
    it('doit valider une date de naissance valide', () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 20);
      expect(minAge(13)(date.toISOString().split('T')[0])).toBeNull();
    });

    it('doit rejeter un mineur', () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 10);
      expect(minAge(13)(date.toISOString().split('T')[0])).toBe('Vous devez avoir au moins 13 ans');
    });
  });

  describe('mustBeChecked', () => {
    it('doit rejeter si false', () => {
      expect(mustBeChecked()(false)).toBe('Vous devez accepter pour continuer');
    });

    it('doit valider si true', () => {
      expect(mustBeChecked()(true)).toBeNull();
    });
  });

  describe('validateFields', () => {
    it('doit retourner les erreurs pour champs invalides', () => {
      const result = validateFields([
        { name: 'email', value: '', rules: [required(), validEmail()] },
        { name: 'password', value: 'abc', rules: [required(), strongPassword()] },
      ]);

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });

    it('doit retourner valid=true si tout bon', () => {
      const result = validateFields([
        { name: 'email', value: 'test@test.com', rules: [required(), validEmail()] },
        { name: 'password', value: 'Azerty123', rules: [required(), strongPassword()] },
      ]);

      expect(result.valid).toBe(true);
    });
  });
});