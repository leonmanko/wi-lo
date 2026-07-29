// apps/web/src/components/ui/FormField.tsx

import React, { useState } from 'react';
import { validateField, type ValidationRule } from '../../lib/validation';

/**
 * Champ de formulaire avec validation intégrée.
 * 
 * Remplace les champs manuels dans tous les formulaires.
 * Gère automatiquement :
 * - La validation en temps réel (après blur)
 * - L'affichage du message d'erreur
 * - Les attributs aria pour l'accessibilité
 * - Le compteur de caractères
 * - L'état disabled
 * 
 * Utilisation :
 * ```tsx
 * <FormField
 *   name="email"
 *   label="Email"
 *   type="email"
 *   value={formData.email}
 *   onChange={handleChange}
 *   rules={[required(), validEmail()]}
 * />
 * ```
 */

interface FormFieldProps {
  /** Nom du champ (utilisé pour id, name, aria) */
  name: string;
  /** Label affiché au-dessus du champ */
  label: string;
  /** Type HTML (text, email, password, date, etc.) */
  type?: string;
  /** Valeur actuelle */
  value: string;
  /** Handler onChange */
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Règles de validation */
  rules?: ValidationRule[];
  /** Placeholder */
  placeholder?: string;
  /** Autocomplete */
  autoComplete?: string;
  /** AutoFocus */
  autoFocus?: boolean;
  /** Désactivé */
  disabled?: boolean;
  /** Longueur maximale (affiche un compteur) */
  maxLength?: number;
  /** Texte d'aide sous le champ */
  helperText?: string;
  /** Le champ est-il de type textarea ? */
  textarea?: boolean;
  /** Nombre de lignes (si textarea) */
  rows?: number;
  /** Classes CSS additionnelles */
  className?: string;
}

export default function FormField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  rules = [],
  placeholder,
  autoComplete,
  autoFocus = false,
  disabled = false,
  maxLength,
  helperText,
  textarea = false,
  rows = 3,
  className = '',
}: FormFieldProps): React.ReactElement {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const showError = touched && error !== null;
  const showCharCount = maxLength !== undefined && value.length > 0;

  // Validation au blur
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setTouched(true);
    const validationError = validateField(e.target.value, rules);
    setError(validationError);
  }

  // Validation en temps réel après la première erreur
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    onChange(e);
    if (touched) {
      const validationError = validateField(e.target.value, rules);
      setError(validationError);
    }
  }

  const inputClasses = `
    w-full px-4 py-3 bg-wi-card border rounded-lg text-white
    placeholder-wi-text-disabled
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-wi-yellow/50 focus:border-wi-yellow/50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${showError ? 'border-wi-error' : 'border-wi-border'}
    ${textarea ? 'resize-none' : ''}
    ${className}
  `.trim();

  return (
    <div>
      {/* Label */}
      <label htmlFor={inputId} className="block text-sm font-medium text-wi-text-secondary mb-1.5">
        {label}
      </label>

      {/* Input ou Textarea */}
      {textarea ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          aria-describedby={showError ? errorId : undefined}
          aria-invalid={showError ? true : undefined}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          maxLength={maxLength}
          aria-describedby={showError ? errorId : undefined}
          aria-invalid={showError ? true : undefined}
          className={inputClasses}
        />
      )}

      {/* Footer : erreur, compteur, aide */}
      <div className="flex items-center justify-between mt-1.5 min-h-[1.25rem]">
        {showError ? (
          <p id={errorId} className="text-wi-error text-sm" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-wi-text-muted text-xs">{helperText}</p>
        ) : (
          <span />
        )}

        {showCharCount && (
          <span className={`text-xs ${value.length >= maxLength! ? 'text-wi-error' : 'text-wi-text-muted'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}