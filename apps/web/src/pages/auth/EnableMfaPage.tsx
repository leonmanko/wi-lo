// apps/web/src/pages/auth/EnableMfaPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Page d'activation de l'authentification à deux facteurs (MFA).
 * 
 * Flux en 3 étapes :
 * 1. Chargement du QR code via enableMfa()
 * 2. Affichage du QR code + champ de saisie du code TOTP
 * 3. Vérification du code via verifyMfa() → succès ou erreur
 * 
 * États couverts :
 * - Chargement (génération du QR code)
 * - Erreur de génération (API indisponible)
 * - QR code affiché + saisie du code
 * - Erreur de vérification (code invalide)
 * - Succès (MFA activée)
 * - Annulation (retour au profil)
 */

type MfaStep = 'loading' | 'qrcode' | 'verifying' | 'success' | 'error';

export default function EnableMfaPage(): React.ReactElement {
  const navigate = useNavigate();
  const { enableMfa, verifyMfa, isAuthenticated, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState<MfaStep>('loading');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  // ---------------------------------------------------------------------------
  // Chargement du QR code au montage
  // ---------------------------------------------------------------------------

  const loadQrCode = useCallback(async () => {
    setStep('loading');
    setError(null);

    try {
      const qrCode = await enableMfa();
      
      // Extraire la clé secrète de l'URL du QR code (format otpauth://)
      const secretMatch = qrCode.match(/secret=([^&]+)/);
      const secret = secretMatch ? secretMatch[1] : null;
      
      setQrCodeUrl(qrCode);
      setSecretKey(secret);
      setStep('qrcode');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la génération du QR code';
      setError(message);
      setStep('error');
    }
  }, [enableMfa]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadQrCode();
    }
  }, [authLoading, isAuthenticated, loadQrCode]);

  // ---------------------------------------------------------------------------
  // Vérification du code TOTP
  // ---------------------------------------------------------------------------

  async function handleVerify(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    // Validation du code (6 chiffres)
    if (!/^\d{6}$/.test(verificationCode)) {
      setError('Le code doit contenir exactement 6 chiffres');
      return;
    }

    setStep('verifying');

    try {
      await verifyMfa(verificationCode);
      setStep('success');
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setError(
          'Trop de tentatives échouées. Veuillez réessayer depuis le début.'
        );
        setStep('error');
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setError(
          `Code invalide. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`
        );
        setStep('qrcode');
        setVerificationCode('');
      }
    }
  }

  function handleRetry(): void {
    setAttempts(0);
    setVerificationCode('');
    setError(null);
    loadQrCode();
  }

  function handleCancel(): void {
    navigate('/profile');
  }

  // ---------------------------------------------------------------------------
  // Protection : rediriger si non authentifié
  // ---------------------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-10 h-10 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return <></>;
  }

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto mb-4">
            <ShieldIcon />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Authentification à deux facteurs
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            Protégez votre compte avec une couche de sécurité supplémentaire
          </p>
        </div>

        {/* Carte */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
          {/* -------------------- État : Chargement -------------------- */}
          {step === 'loading' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Génération du QR code...</p>
            </div>
          )}

          {/* -------------------- État : QR Code + Saisie -------------------- */}
          {(step === 'qrcode' || step === 'verifying') && (
            <>
              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm font-medium mb-2">
                  📱 Configurez votre application d&apos;authentification
                </p>
                <ol className="text-blue-200/80 text-sm space-y-1 list-decimal list-inside">
                  <li>Ouvrez votre application (Google Authenticator, Authy, etc.)</li>
                  <li>Scannez le QR code ci-dessous</li>
                  <li>Entrez le code à 6 chiffres affiché dans l&apos;application</li>
                </ol>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-xl">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code pour l'authentification à deux facteurs"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {/* Clé secrète manuelle */}
              {secretKey && (
                <div className="mb-6 p-3 bg-gray-800 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">
                    Ou entrez cette clé manuellement :
                  </p>
                  <code className="text-yellow-400 font-mono text-sm break-all select-all">
                    {secretKey}
                  </code>
                </div>
              )}

              {/* Erreur */}
              {error && (
                <div
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  role="alert"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Formulaire de vérification */}
              <form onSubmit={handleVerify} noValidate>
                <label
                  htmlFor="mfa-code"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Code de vérification
                </label>
                <input
                  type="text"
                  id="mfa-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                    setVerificationCode(val);
                    if (error) setError(null);
                  }}
                  disabled={step === 'verifying'}
                  autoFocus
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 disabled:opacity-50"
                />

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={step === 'verifying'}
                    className="flex-1 py-3 px-4 bg-gray-800 border border-gray-700 rounded-lg font-medium text-gray-300 hover:bg-gray-750 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={verificationCode.length !== 6 || step === 'verifying'}
                    className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 rounded-lg font-semibold text-gray-950 transition-all disabled:bg-yellow-600 disabled:cursor-not-allowed"
                  >
                    {step === 'verifying' ? 'Vérification...' : 'Vérifier'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* -------------------- État : Succès -------------------- */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                MFA activée avec succès !
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Votre compte est maintenant protégé par l&apos;authentification à deux facteurs.
                Vous devrez entrer un code à chaque nouvelle connexion.
              </p>
              <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg mb-6">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Conservez votre application d&apos;authentification. Sans elle, vous
                  pourriez perdre l&apos;accès à votre compte.
                </p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-300 rounded-lg font-semibold text-gray-950 transition-all"
              >
                Retour au profil
              </button>
            </div>
          )}

          {/* -------------------- État : Erreur -------------------- */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Échec de l&apos;activation
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {error ?? 'Une erreur est survenue lors de l\'activation de la MFA.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 bg-gray-800 border border-gray-700 rounded-lg font-medium text-gray-300 hover:bg-gray-750 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 rounded-lg font-semibold text-gray-950 transition-all"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lien retour */}
        <p className="mt-6 text-center">
          <Link
            to="/profile"
            className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            ← Retour au profil
          </Link>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icône
// ---------------------------------------------------------------------------

function ShieldIcon(): React.ReactElement {
  return (
    <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}