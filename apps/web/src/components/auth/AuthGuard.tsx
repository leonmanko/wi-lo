// apps/web/src/components/auth/AuthGuard.tsx

import React from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * AuthGuard — Wrapper conditionnel pour masquer/afficher du contenu
 * selon l'état d'authentification.
 * 
 * Plus souple que PrivateRoute : s'utilise à l'intérieur d'une page
 * pour conditionner l'affichage d'une partie de l'interface.
 * 
 * Utilisation :
 * ```tsx
 * <AuthGuard>
 *   <BoutonAdmin />
 * </AuthGuard>
 * 
 * <AuthGuard fallback={<InviteMessage />}>
 *   <ContenuPremium />
 * </AuthGuard>
 * 
 * <AuthGuard requireAdmin>
 *   <PanneauAdministration />
 * </AuthGuard>
 * ```
 */

interface AuthGuardProps {
  /** Contenu à afficher si l'utilisateur n'est pas authentifié */
  fallback?: React.ReactNode;
  /** Exiger le rôle admin en plus de l'authentification */
  requireAdmin?: boolean;
  /** Afficher un loader pendant la vérification */
  loadingComponent?: React.ReactNode;
  /** Contenu protégé */
  children: React.ReactNode;
}

export default function AuthGuard({
  fallback = null,
  requireAdmin = false,
  loadingComponent,
  children,
}: AuthGuardProps): React.ReactElement {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // ---------------------------------------------------------------------------
  // État 1 : Chargement
  // ---------------------------------------------------------------------------
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // État 2 : Non authentifié (ou non admin si requireAdmin)
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  // ---------------------------------------------------------------------------
  // État 3 : Authentifié (et admin si requis)
  // ---------------------------------------------------------------------------
  return <>{children}</>;
}