// apps/web/src/components/auth/PrivateRoute.tsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * PrivateRoute — Protège les routes qui nécessitent une authentification.
 * 
 * Comportement :
 * - Si l'utilisateur est authentifié → affiche le contenu enfant (Outlet)
 * - Si l'utilisateur n'est pas authentifié → redirige vers /login
 * - Si l'authentification est en cours de vérification → affiche un loader
 * 
 * La route d'origine est sauvegardée dans le state de navigation,
 * permettant de rediriger l'utilisateur vers sa destination après connexion.
 * 
 * Utilisation avec react-router-dom v6 :
 * ```tsx
 * <Route element={<PrivateRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 *   <Route path="/profile" element={<Profile />} />
 * </Route>
 * ```
 */

interface PrivateRouteProps {
  /** Composant de chargement personnalisé (optionnel) */
  loadingComponent?: React.ReactNode;
  /** Page de redirection si non authentifié (défaut: /login) */
  redirectTo?: string;
}

export default function PrivateRoute({
  loadingComponent,
  redirectTo = '/login',
}: PrivateRouteProps): React.ReactElement {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ---------------------------------------------------------------------------
  // État 1 : Chargement — vérification de la session en cours
  // ---------------------------------------------------------------------------
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // État 2 : Non authentifié — redirection vers login
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    // Sauvegarder la route demandée pour y revenir après connexion
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // ---------------------------------------------------------------------------
  // État 3 : Authentifié — afficher le contenu protégé
  // ---------------------------------------------------------------------------
  return <Outlet />;
}