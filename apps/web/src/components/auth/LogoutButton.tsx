// apps/web/src/components/auth/LogoutButton.tsx

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { sanitizeTokenStorage } from '../../lib/tokenSecurity';

/**
 * Bouton de déconnexion WI-LO.
 * 
 * Comportement :
 * 1. Clic → demande de confirmation (modale)
 * 2. Confirmation → déconnexion complète :
 *    - Appel Supabase signOut()
 *    - Nettoyage sessionStorage (via Supabase)
 *    - Nettoyage localStorage (via sanitizeTokenStorage)
 *    - Reset du store Zustand
 *    - Invalidation du cache React Query
 *    - Redirection vers /login
 * 3. Annulation → fermeture de la modale
 * 
 * Variantes d'affichage :
 * - fullWidth : bouton pleine largeur (pour page profil)
 * - iconOnly : juste l'icône (pour navbar)
 * - default : bouton standard avec texte
 * 
 * États couverts :
 * - Repos (bouton normal)
 * - Chargement (déconnexion en cours)
 * - Erreur (échec de la déconnexion)
 * - Modale de confirmation (ouverte/fermée)
 */

type LogoutVariant = 'default' | 'fullWidth' | 'iconOnly' | 'textOnly';

interface LogoutButtonProps {
  /** Variante d'affichage */
  variant?: LogoutVariant;
  /** Texte du bouton (défaut: "Se déconnecter") */
  label?: string;
  /** Afficher la confirmation avant déconnexion (défaut: true) */
  confirmBeforeLogout?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
  /** Callback après déconnexion réussie */
  onLogoutSuccess?: () => void;
  /** Callback après erreur de déconnexion */
  onLogoutError?: (error: Error) => void;
}

export default function LogoutButton({
  variant = 'default',
  label = 'Se déconnecter',
  confirmBeforeLogout = true,
  className = '',
  onLogoutSuccess,
  onLogoutError,
}: LogoutButtonProps): React.ReactElement {
  const navigate = useNavigate();
  const { logout, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Déconnexion complète
  // ---------------------------------------------------------------------------

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      // 1. Déconnexion Supabase (nettoie sessionStorage)
      await logout();

      // 2. Nettoyage additionnel localStorage
      sanitizeTokenStorage();

      // 3. Nettoyage React Query (déjà fait dans logout, mais double sécurité)
      queryClient.clear();

      // 4. Callback utilisateur
      onLogoutSuccess?.();

      // 5. Redirection vers login
      navigate('/login', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la déconnexion';
      setError(message);
      onLogoutError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setIsLoggingOut(false);
      setShowConfirm(false);
    }
  }, [logout, queryClient, navigate, onLogoutSuccess, onLogoutError]);

  // ---------------------------------------------------------------------------
  // Gestion du clic
  // ---------------------------------------------------------------------------

  function handleClick(): void {
    setError(null);
    
    if (confirmBeforeLogout) {
      setShowConfirm(true);
    } else {
      handleLogout();
    }
  }

  function handleCancel(): void {
    setShowConfirm(false);
    setError(null);
  }

  // ---------------------------------------------------------------------------
  // Classes CSS par variante
  // ---------------------------------------------------------------------------

  const isDisabled = isLoggingOut || isLoading;

  const variantClasses: Record<LogoutVariant, string> = {
    default:
      'py-2 px-4 bg-gray-800 hover:bg-red-900/30 border border-gray-700 hover:border-red-500/50 rounded-lg text-gray-400 hover:text-red-400 transition-all duration-200',
    fullWidth:
      'w-full py-3 px-4 bg-gray-800 hover:bg-red-900/30 border border-gray-700 hover:border-red-500/50 rounded-lg text-gray-400 hover:text-red-400 transition-all duration-200',
    iconOnly:
      'p-2 bg-gray-800 hover:bg-red-900/30 border border-gray-700 hover:border-red-500/50 rounded-lg text-gray-400 hover:text-red-400 transition-all duration-200',
    textOnly:
      'text-gray-400 hover:text-red-400 transition-colors duration-200 underline-offset-2 hover:underline',
  };

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* -------------------- Bouton principal -------------------- */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        aria-label={variant === 'iconOnly' ? label : undefined}
        title={variant === 'iconOnly' ? label : undefined}
      >
        {isLoggingOut || isLoading ? (
          <span className="w-4 h-4 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin" />
        ) : variant === 'iconOnly' ? (
          <LogoutIcon />
        ) : (
          <>
            <LogoutIcon />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* -------------------- Modale de confirmation -------------------- */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icône */}
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>

            {/* Titre */}
            <h3 id="logout-dialog-title" className="text-lg font-semibold text-white text-center mb-2">
              Se déconnecter ?
            </h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              Vous devrez vous reconnecter pour accéder à votre compte.
              Vos données sont sauvegardées.
            </p>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 bg-gray-800 border border-gray-700 rounded-lg font-medium text-gray-300 hover:bg-gray-750 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Déconnexion...
                  </>
                ) : (
                  'Se déconnecter'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Icône
// ---------------------------------------------------------------------------

function LogoutIcon(): React.ReactElement {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}