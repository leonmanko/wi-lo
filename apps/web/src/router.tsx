// apps/web/src/router.tsx — MODIFIER

import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Composants d'authentification
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import OnboardingPage from './pages/onboarding/OnboardingPage'; // ← Ajouté

// Pages protégées (lazy loading)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const ProfileEditPage = React.lazy(() => import('./pages/ProfileEditPage')); // ← Ajouté
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const QuizPage = React.lazy(() => import('./pages/QuizPage'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));
const FriendsPage = React.lazy(() => import('./pages/FriendsPage'));
const CollectionPage = React.lazy(() => import('./pages/CollectionPage'));
const WalletPage = React.lazy(() => import('./pages/WalletPage'));

function SuspenseFallback(): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-wilo-bg-primary">
      <div className="w-10 h-10 border-4 border-wilo-blue-500/30 border-t-wilo-blue-500 rounded-full animate-spin" />
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
  // Routes publiques
  // =========================================================================
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // =========================================================================
  // Callback OAuth
  // =========================================================================
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },

  // =========================================================================
  // Onboarding (protégé mais accessible uniquement si pas encore onboardé)
  // =========================================================================
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },

  // =========================================================================
  // Routes protégées
  // =========================================================================
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: withSuspense(HomePage) },
      { path: '/profile', element: withSuspense(ProfilePage) },
      { path: '/profile/edit', element: withSuspense(ProfileEditPage) },
      { path: '/quiz', element: withSuspense(QuizPage) },
      { path: '/leaderboard', element: withSuspense(LeaderboardPage) },
      { path: '/friends', element: withSuspense(FriendsPage) },
      { path: '/collection', element: withSuspense(CollectionPage) },
      { path: '/wallet', element: withSuspense(WalletPage) },
    ],
  },

  // =========================================================================
  // 404
  // =========================================================================
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
]);