// apps/web/src/router.tsx

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Composants d'authentification
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';

// Pages protégées (placeholders — seront remplacées par les vrais composants)
// TODO: Remplacer par les vrais imports quand les pages seront créées
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

/**
 * Configuration des routes WI-LO.
 * 
 * Structure :
 * - Routes publiques (accessibles sans authentification) :
 *   /login, /register, /auth/callback
 * - Routes protégées (nécessitent une authentification) :
 *   / (accueil), /profile, /quiz, /leaderboard, etc.
 * - Route fallback : 404
 */

// Loader suspense pour les pages en lazy loading
function SuspenseFallback(): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-10 h-10 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );
}

function withSuspense(Component: React.LazyExoticComponent<React.ComponentType<Record<string, never>>>): React.ReactElement {
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <Component />
    </React.Suspense>
  );
}

export const router = createBrowserRouter([
  // =========================================================================
  // Routes publiques (redirigées vers / si déjà authentifié)
  // =========================================================================
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },

  // =========================================================================
  // Callback OAuth (ni public ni privé — gère son propre état)
  // =========================================================================
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },

  // =========================================================================
  // Routes protégées (redirigées vers /login si non authentifié)
  // =========================================================================
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: withSuspense(HomePage),
      },
      {
        path: '/profile',
        element: withSuspense(ProfilePage),
      },
      // Placeholders pour les futurs sprints
      {
        path: '/quiz',
        element: withSuspense(
          React.lazy(() => import('./pages/QuizPage'))
        ),
      },
      {
        path: '/leaderboard',
        element: withSuspense(
          React.lazy(() => import('./pages/LeaderboardPage'))
        ),
      },
      {
        path: '/friends',
        element: withSuspense(
          React.lazy(() => import('./pages/FriendsPage'))
        ),
      },
      {
        path: '/collection',
        element: withSuspense(
          React.lazy(() => import('./pages/CollectionPage'))
        ),
      },
      {
        path: '/wallet',
        element: withSuspense(
          React.lazy(() => import('./pages/WalletPage'))
        ),
      },
    ],
  },

  // =========================================================================
  // Route 404 — catch-all
  // =========================================================================
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
]);