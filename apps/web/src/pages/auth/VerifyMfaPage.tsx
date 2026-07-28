// apps/web/src/pages/auth/VerifyMfaPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Page de vérification MFA lors de la connexion.
 * 
 * Affichée après une connexion email/password réussie quand
 * l'utilisateur a activé la MFA. Demande le code TOTP avant
 * d'accorder l'accès complet.
 * 
 * États couverts :
 * - Saisie du code
 * - Chargement (vérification en cours)
 * - Erreur (code invalide)
 * - Succès (redirection vers l'accueil)
 */

export default function VerifyMfaPage(): React.ReactElement {
  const navigate = useNavigate();
  const { verifyMfa, isAuthenticated, isLoading } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  // Si déjà authentifié, rediriger vers l'accueil
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code)) {
      setError('Le code doit contenir exactement 6 chiffres');
      return;
    }

    setIsVerifying(true);

    try {
      await verifyMfa(code);
      navigate('/', { replace: true });
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setError(
          'Trop de tentatives. Veuillez vous reconnecter.'
        );
      } else {
        setError(
          `Code invalide. ${MAX_ATTEMPTS - newAttempts} tentative(s) restante(s).`
        );
      }
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Vérification en deux étapes
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            Entrez le code à 6 chiffres de votre application d&apos;authentification
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
          {error && (
            <div
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              role="alert"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label
              htmlFor="mfa-code"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Code d&apos;authentification
            </label>
            <input
              type="text"
              id="mfa-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                if (error) setError(null);
              }}
              disabled={isVerifying}
              autoFocus
              autoComplete="one-time-code"
              placeholder="000000"
              className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={code.length !== 6 || isVerifying}
              className="w-full mt-6 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 rounded-lg font-semibold text-gray-950 transition-all disabled:bg-yellow-600 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Vérification...' : 'Vérifier'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}