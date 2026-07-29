// apps/web/src/lib/validation.ts — REMPLACER

/**
 * Module de validation centralisé pour WI-LO.
 */

// ===========================================================================
// Types
// ===========================================================================

export type ValidationRule = (value: string) => string | null;

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ===========================================================================
// Règles génériques
// ===========================================================================

export function required(message = 'Ce champ est requis'): ValidationRule {
  return (value: string) => {
    if (!value || !value.trim()) return message;
    return null;
  };
}

export function minLength(min: number, message?: string): ValidationRule {
  return (value: string) => {
    if (value.trim().length < min) {
      return message ?? `Minimum ${min} caractères`;
    }
    return null;
  };
}

export function maxLength(max: number, message?: string): ValidationRule {
  return (value: string) => {
    if (value.trim().length > max) {
      return message ?? `Maximum ${max} caractères`;
    }
    return null;
  };
}

export function pattern(regex: RegExp, message: string): ValidationRule {
  return (value: string) => {
    if (!regex.test(value)) return message;
    return null;
  };
}

// ===========================================================================
// Règles métier WI-LO
// ===========================================================================

export function validEmail(message = "Format d'email invalide"): ValidationRule {
  return pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message);
}

export function strongPassword(): ValidationRule {
  return (value: string) => {
    if (value.length < 8) return 'Minimum 8 caractères';
    if (value.length > 128) return 'Maximum 128 caractères';
    if (!/[A-Z]/.test(value)) return 'Doit contenir au moins une majuscule';
    if (!/[a-z]/.test(value)) return 'Doit contenir au moins une minuscule';
    if (!/[0-9]/.test(value)) return 'Doit contenir au moins un chiffre';
    return null;
  };
}

export function matchPassword(password: string, message = 'Les mots de passe ne correspondent pas'): ValidationRule {
  return (value: string) => {
    if (value !== password) return message;
    return null;
  };
}

export function minAge(minYears: number): ValidationRule {
  return (value: string) => {
    if (!value) return 'La date de naissance est requise';

    const birth = new Date(value);
    if (isNaN(birth.getTime())) return 'Date invalide';

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < minYears) return `Vous devez avoir au moins ${minYears} ans`;
    if (age > 120) return 'Date de naissance invalide';
    return null;
  };
}

export function validName(): ValidationRule {
  return (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Le nom est requis';
    if (trimmed.length < 2) return 'Minimum 2 caractères';
    if (trimmed.length > 50) return 'Maximum 50 caractères';
    return null;
  };
}

export function validBio(): ValidationRule {
  return (value: string) => {
    if (value.length > 200) return 'Maximum 200 caractères';
    return null;
  };
}

export function validTeam(): ValidationRule {
  return (value: string) => {
    if (value.length > 50) return 'Maximum 50 caractères';
    return null;
  };
}

// ===========================================================================
// Validation d'un booléen (case à cocher)
// ===========================================================================

export function mustBeChecked(message = 'Vous devez accepter pour continuer'): (value: boolean) => string | null {
  return (value: boolean) => {
    if (!value) return message;
    return null;
  };
}

// ===========================================================================
// Utilitaires
// ===========================================================================

interface FieldConfig {
  name: string;
  value: string;
  rules: ValidationRule[];
}

export function validateFields(fields: FieldConfig[]): ValidationResult {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    for (const rule of field.rules) {
      const error = rule(field.value);
      if (error) {
        errors[field.name] = error;
        break;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

// ===========================================================================
// Règles préconfigurées par formulaire
// ===========================================================================

export const loginValidationRules: Record<string, ValidationRule[]> = {
  email: [required("L'email est requis"), validEmail()],
  password: [required('Le mot de passe est requis')],
};

export const registerValidationRules: Record<string, ValidationRule[]> = {
  name: [validName()],
  email: [required("L'email est requis"), validEmail()],
  password: [required('Le mot de passe est requis'), strongPassword()],
  confirmPassword: [required('Confirmez votre mot de passe')],
  birthDate: [minAge(13)],
};

export const profileValidationRules: Record<string, ValidationRule[]> = {
  name: [required('Le nom est requis'), minLength(2), maxLength(50)],
  bio: [maxLength(200)],
  favoriteTeam: [maxLength(50)],
};