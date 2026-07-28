// apps/web/src/pages/auth/LoginPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type FormErrors = Partial<Record<keyof LoginFormData, string>>;

/**
 * Page de connexion WI-LO.
 * 
 * Offre trois méthodes de connexion :
 * 1. Email + mot de passe (loginWithEmail)
 * 2. Google OAuth (login('google'))
 * 3. Apple OAuth (login('apple'))
 * 
 * États couverts :
 * - Formulaire vide (état initial)
 * - Validation côté client (champs vides, email invalide)
 * - Chargement (soumission email OU redirection OAuth en cours)
 * - Erreur (credentials invalides, OAuth échoué)
 * - Succès (redirection vers accueil)
 * 
 * Accessibilité :
 * - Labels associés aux champs
 * - Navigation au clavier complète
 * - Messages d'erreur liés aux champs (aria-describedby)
 * - Focus automatique sur le premier champ
 */
export default function LoginPage(): React.ReactElement {
  const navigate = useNavigate();
  const { login, loginWithEmail, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  function validateField(name: keyof LoginFormData, value: string | boolean): string {
    if (typeof value === 'boolean') return '';

    switch (name) {
      case 'email':
        if (!value.trim()) return "L'email est requis";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Format d'email invalide";
        }
        return '';
      case 'password':
        if (!value) return 'Le mot de passe est requis';
        return '';
      default:
        return '';
    }
  }

  function validateForm(): FormErrors {
    const errors: FormErrors = {};
    const emailError = validateField('email', formData.email);
    if (emailError) errors.email = emailError;
    const passwordError = validateField('password', formData.password);
    if (passwordError) errors.password = passwordError;
    return errors;
  }

  // ---------------------------------------------------------------------------
  // Handlers — Email/Password
  // ---------------------------------------------------------------------------

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (touched.has(name) && typeof newValue === 'string') {
      const fieldError = validateField(name as keyof LoginFormData, newValue);
      setFormErrors((prev) => ({ ...prev, [name]: fieldError || undefined }));
    }

    if (serverError) setServerError(null);
    if (error) clearError();
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));

    if (typeof value === 'string') {
      const fieldError = validateField(name as keyof LoginFormData, value);
      setFormErrors((prev) => ({ ...prev, [name]: fieldError || undefined }));
    }
  }

  async function handleEmailSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);
    setTouched(new Set(['email', 'password']));

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await loginWithEmail(formData.email.trim(), formData.password);
      navigate('/', { replace: true });
    } catch (err) {
      const authError = err as { message?: string };
      setServerError(authError.message ?? 'Erreur de connexion');
      setFormErrors({});
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Handlers — OAuth
  // ---------------------------------------------------------------------------

  async function handleOAuthLogin(provider: 'google' | 'apple'): Promise<void> {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // login() pour OAuth déclenche la redirection vers le fournisseur
      // Pas besoin de navigate() ici, Supabase gère la redirection
      await login(provider);
      // Si on arrive ici, c'est que la redirection n'a pas eu lieu (popup bloqué ?)
      // La redirection normale interrompt l'exécution
    } catch (err) {
      const authError = err as { message?: string };
      setServerError(
        authError.message ??
          `Erreur de connexion avec ${provider === 'google' ? 'Google' : 'Apple'}`
      );
      setIsSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // États dérivés
  // ---------------------------------------------------------------------------

  const isSubmitDisabled = isSubmitting || isLoading;
  const submitButtonLabel = isSubmitDisabled ? 'Connexion en cours...' : 'Se connecter';
  const globalError = serverError || error?.message || null;

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Marque */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            WI<span className="text-yellow-400">-</span>LO
          </h1>
          <p className="mt-2 text-gray-400 text-sm">Le quiz sportif nouvelle génération</p>
        </div>

        {/* Carte du formulaire */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Connexion</h2>

          {/* Erreur globale */}
          {globalError && (
            <div
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              role="alert"
            >
              <p className="text-red-400 text-sm font-medium">{globalError}</p>
              {error?.code === 'popup_closed_by_user' && (
                <p className="text-red-400/70 text-xs mt-1">
                  La fenêtre de connexion a été fermée. Veuillez réessayer.
                </p>
              )}
            </div>
          )}

          {/* -------------------- OAuth : Google et Apple -------------------- */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isSubmitDisabled}
              className={`
                w-full py-3 px-4 rounded-lg font-medium
                flex items-center justify-center gap-3
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-gray-900
                ${isSubmitDisabled
                  ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 active:scale-[0.98]'
                }
              `}
              aria-label="Se connecter avec Google"
            >
              {isSubmitDisabled ? (
                <span className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continuer avec Google
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('apple')}
              disabled={isSubmitDisabled}
              className={`
                w-full py-3 px-4 rounded-lg font-medium
                flex items-center justify-center gap-3
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-gray-900
                ${isSubmitDisabled
                  ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-900 text-white border border-gray-700 active:scale-[0.98]'
                }
              `}
              aria-label="Se connecter avec Apple"
            >
              {isSubmitDisabled ? (
                <span className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <AppleIcon />
              )}
              Continuer avec Apple
            </button>
          </div>

          {/* -------------------- Séparateur -------------------- */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gray-900 text-gray-500">
                ou avec votre email
              </span>
            </div>
          </div>

          {/* -------------------- Formulaire Email/Password -------------------- */}
          <form onSubmit={handleEmailSubmit} noValidate className="space-y-5">
            {/* Champ Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
                autoFocus
                disabled={isSubmitDisabled}
                aria-describedby={
                  formErrors.email && touched.has('email') ? 'email-error' : undefined
                }
                aria-invalid={
                  !!(formErrors.email && touched.has('email')) ? true : undefined
                }
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                  formErrors.email && touched.has('email')
                    ? 'border-red-500'
                    : 'border-gray-700'
                }`}
                placeholder="vous@exemple.com"
              />
              {formErrors.email && touched.has('email') && (
                <p id="email-error" className="mt-1.5 text-red-400 text-sm" role="alert">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="current-password"
                disabled={isSubmitDisabled}
                aria-describedby={
                  formErrors.password && touched.has('password')
                    ? 'password-error'
                    : undefined
                }
                aria-invalid={
                  !!(formErrors.password && touched.has('password')) ? true : undefined
                }
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                  formErrors.password && touched.has('password')
                    ? 'border-red-500'
                    : 'border-gray-700'
                }`}
                placeholder="••••••••"
              />
              {formErrors.password && touched.has('password') && (
                <p id="password-error" className="mt-1.5 text-red-400 text-sm" role="alert">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isSubmitDisabled}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-400 focus:ring-yellow-400/50 disabled:opacity-50"
                />
                <span className="text-sm text-gray-400">Se souvenir de moi</span>
              </label>

              <button
                type="button"
                className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                onClick={() => {
                  // TODO: Page mot de passe oublié (Sprint 2 — tâche future)
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-gray-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                isSubmitDisabled
                  ? 'bg-yellow-600 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98]'
              }`}
            >
              {isSubmitDisabled && (
                <span className="inline-block w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin mr-2 align-middle" />
              )}
              {submitButtonLabel}
            </button>
          </form>
        </div>

        {/* Lien d'inscription */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icônes OAuth
// ---------------------------------------------------------------------------

function GoogleIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}