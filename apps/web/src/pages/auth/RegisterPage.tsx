// apps/web/src/pages/auth/RegisterPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterParams } from '../../types/auth';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  favoriteSport: string;
  acceptTerms: boolean;
  consentPersonalizedAds: boolean;
  consentAnalytics: boolean;
  consentCookies: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const SPORTS = [
  { value: '', label: 'Aucun pour l\'instant' },
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'rugby', label: 'Rugby' },
  { value: 'formula1', label: 'Formule 1' },
  { value: 'mma', label: 'MMA' },
];

export default function RegisterPage(): React.ReactElement {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    favoriteSport: '',
    acceptTerms: false,
    consentPersonalizedAds: false,
    consentAnalytics: false,
    consentCookies: false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  function calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  function validateField(name: keyof FormData, value: string | boolean): string {
    if (typeof value === 'boolean') {
      if (name === 'acceptTerms' && !value) return 'Vous devez accepter les conditions d\'utilisation';
      return '';
    }

    switch (name) {
      case 'name':
        if (!value.trim()) return 'Le nom est requis';
        if (value.trim().length < 2) return 'Minimum 2 caractères';
        return '';
      case 'email':
        if (!value.trim()) return 'L\'email est requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Format d\'email invalide';
        return '';
      case 'password':
        if (!value) return 'Le mot de passe est requis';
        if (value.length < 8) return 'Minimum 8 caractères';
        return '';
      case 'confirmPassword':
        if (!value) return 'Confirmez votre mot de passe';
        if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
        return '';
      case 'birthDate':
        if (!value) return 'La date de naissance est requise';
        const age = calculateAge(value);
        if (age < 13) return 'Vous devez avoir au moins 13 ans';
        return '';
      default:
        return '';
    }
  }

  function validateStep(stepNumber: 1 | 2): FormErrors {
    const errors: FormErrors = {};
    if (stepNumber === 1) {
      (['name', 'email', 'password', 'confirmPassword', 'birthDate'] as const).forEach((field) => {
        const err = validateField(field, formData[field]);
        if (err) errors[field] = err;
      });
    } else {
      const err = validateField('acceptTerms', formData.acceptTerms);
      if (err) errors.acceptTerms = err;
    }
    return errors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (touched.has(name)) {
      const err = validateField(name as keyof FormData, newValue);
      setFormErrors((prev) => ({ ...prev, [name]: err || undefined }));
    }

    if (serverError) setServerError(null);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));
    const err = validateField(name as keyof FormData, value);
    setFormErrors((prev) => ({ ...prev, [name]: err || undefined }));
  }

  function handleNextStep(e: React.FormEvent): void {
    e.preventDefault();
    const errors = validateStep(1);
    setFormErrors(errors);
    setTouched(new Set([...touched, 'name', 'email', 'password', 'confirmPassword', 'birthDate']));

    if (Object.keys(errors).length === 0) {
      setStep(2);
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const errors = validateStep(2);
    setFormErrors(errors);
    setTouched(new Set([...touched, 'acceptTerms']));

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setServerError(null);

    const registerParams: RegisterParams = {
      email: formData.email.trim(),
      password: formData.password,
      name: formData.name.trim(),
      birthDate: formData.birthDate,
      favoriteSport: formData.favoriteSport || undefined,
      consents: {
        personalized_ads: formData.consentPersonalizedAds,
        analytics: formData.consentAnalytics,
        cookies: formData.consentCookies,
      },
    };

    try {
      await register(registerParams);
      navigate('/onboarding');
    } catch (err) {
      const authError = err as { message?: string };
      setServerError(authError.message ?? 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || isLoading;
  const globalError = serverError || error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            WI<span className="text-yellow-400">-</span>LO
          </h1>
          <p className="mt-2 text-gray-400 text-sm">Créez votre compte et rejoignez la compétition</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step === 1 ? 'bg-yellow-400 text-gray-950' : step === 2 ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'
          }`}>
            {step === 2 ? '✓' : '1'}
          </div>
          <div className="w-8 h-px bg-gray-700" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step === 2 ? 'bg-yellow-400 text-gray-950' : 'bg-gray-800 text-gray-500'
          }`}>
            2
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
          {globalError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg" role="alert">
              <p className="text-red-400 text-sm font-medium">{globalError}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} noValidate className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Votre profil</h2>

              <Field name="name" label="Nom complet" type="text" value={formData.name} onChange={handleChange} onBlur={handleBlur} error={formErrors.name} touched={touched.has('name')} disabled={isDisabled} placeholder="Votre nom" autoComplete="name" autoFocus />
              <Field name="email" label="Email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={formErrors.email} touched={touched.has('email')} disabled={isDisabled} placeholder="vous@exemple.com" autoComplete="email" />
              <Field name="password" label="Mot de passe" type="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} error={formErrors.password} touched={touched.has('password')} disabled={isDisabled} placeholder="Minimum 8 caractères" autoComplete="new-password" />
              <Field name="confirmPassword" label="Confirmer le mot de passe" type="password" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} error={formErrors.confirmPassword} touched={touched.has('confirmPassword')} disabled={isDisabled} placeholder="Répétez votre mot de passe" autoComplete="new-password" />
              <Field name="birthDate" label="Date de naissance" type="date" value={formData.birthDate} onChange={handleChange} onBlur={handleBlur} error={formErrors.birthDate} touched={touched.has('birthDate')} disabled={isDisabled} />
              <p className="text-xs text-gray-500 -mt-2">Vous devez avoir au moins 13 ans pour jouer</p>

              <div>
                <label htmlFor="favoriteSport" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Sport favori (optionnel)
                </label>
                <select
                  id="favoriteSport"
                  name="favoriteSport"
                  value={formData.favoriteSport}
                  onChange={handleChange}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:opacity-50"
                >
                  {SPORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isDisabled}
                className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-300 rounded-lg font-semibold text-gray-950 transition-all disabled:bg-yellow-600 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <h2 className="text-xl font-semibold text-white mb-4">Presque terminé !</h2>
              <p className="text-sm text-gray-400">Veuillez accepter les conditions et choisir vos préférences.</p>

              <Checkbox name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} onBlur={handleBlur} error={formErrors.acceptTerms} touched={touched.has('acceptTerms')} disabled={isDisabled}>
                J&apos;accepte les{' '}
                <a href="/terms" target="_blank" className="text-yellow-400 hover:text-yellow-300 underline">Conditions d&apos;Utilisation</a>
                {' '}et la{' '}
                <a href="/privacy" target="_blank" className="text-yellow-400 hover:text-yellow-300 underline">Politique de Confidentialité</a>
              </Checkbox>

              <div className="border-t border-gray-800 pt-4 space-y-3">
                <Checkbox name="consentPersonalizedAds" checked={formData.consentPersonalizedAds} onChange={handleChange} disabled={isDisabled}>
                  Publicités personnalisées
                </Checkbox>
                <Checkbox name="consentAnalytics" checked={formData.consentAnalytics} onChange={handleChange} disabled={isDisabled}>
                  Données d&apos;analyse pour améliorer le jeu
                </Checkbox>
                <Checkbox name="consentCookies" checked={formData.consentCookies} onChange={handleChange} disabled={isDisabled}>
                  Cookies fonctionnels
                </Checkbox>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} disabled={isDisabled} className="flex-1 py-3 px-4 bg-gray-800 border border-gray-700 rounded-lg font-medium text-gray-300 disabled:opacity-50">
                  Retour
                </button>
                <button type="submit" disabled={isDisabled} className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 rounded-lg font-semibold text-gray-950 transition-all disabled:bg-yellow-600 disabled:cursor-not-allowed">
                  {isDisabled ? 'Création...' : 'Créer mon compte'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composants internes
// ---------------------------------------------------------------------------

interface FieldProps {
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched: boolean;
  disabled: boolean;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

function Field({
  name,
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled,
  placeholder,
  autoComplete,
  autoFocus,
}: FieldProps): React.ReactElement {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const showError = error && touched ? true : false;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-describedby={showError ? errorId : undefined}
        aria-invalid={showError || undefined}
        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed ${
          showError ? 'border-red-500' : 'border-gray-700'
        }`}
        placeholder={placeholder}
      />
      {showError && error && (
        <p id={errorId} className="mt-1.5 text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  disabled: boolean;
  children: React.ReactNode;
}

function Checkbox({ name, checked, onChange, onBlur, error, touched, disabled, children }: CheckboxProps): React.ReactElement {
  const inputId = `field-${name}`;
  const showError = error && touched;

  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          id={inputId}
          name={name}
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-800 text-yellow-400 focus:ring-yellow-400/50 disabled:opacity-50"
        />
        <span className="text-sm text-gray-300">{children}</span>
      </label>
      {showError && <p className="mt-1.5 text-red-400 text-sm ml-7" role="alert">{error}</p>}
    </div>
  );
}