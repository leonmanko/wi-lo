// apps/web/src/components/auth/PublicRoute.tsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * PublicRoute — Pour les pages accessibles uniquement aux utilisateurs
 * NON authentifiés (login, register, mot de passe oublié).
 * 
 * Comportement :
 * - Si l'utilisateur est authentifié → redirige vers l'accueil (ou la page demandée)
 * - Si l'utilisateur n'est pas authentifié → affiche le contenu (Outlet)
 * - Si l'authentification est en cours → affiche un loader
 * 
 * Utilisation :
 * ```tsx
 * <Route element={<PublicRoute />}>
 *   <Route path="/login" element={<LoginPage />} />
 *   <Route path="/register" element={<RegisterPage />} />
 * </Route>
 * ```
 */

interface PublicRouteProps {
  /** Composant de chargement personnalisé (optionnel) */
  loadingComponent?: React.ReactNode;
  /** Page de redirection si déjà authentifié (défaut: /) */
  redirectTo?: string;
}

export default function PublicRoute({
  loadingComponent,
  redirectTo = '/',
}: PublicRouteProps): React.ReactElement {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ---------------------------------------------------------------------------
  // État 1 : Chargement
  // ---------------------------------------------------------------------------
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // État 2 : Déjà authentifié — redirection
  // ---------------------------------------------------------------------------
  if (isAuthenticated) {
    // Si l'utilisateur vient d'une page protégée, l'y renvoyer
    const from = (location.state as { from?: string })?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  // ---------------------------------------------------------------------------
  // État 3 : Non authentifié — afficher la page publique
  // ---------------------------------------------------------------------------
  return <Outlet />;
}