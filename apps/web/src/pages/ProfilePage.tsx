// apps/web/src/pages/ProfilePage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from '../components/auth/LogoutButton';
import StatsTab from '../components/profile/StatsTab';

/**
 * Page de profil utilisateur WI-LO.
 * 
 * Affiche :
 * - Avatar (avec fallback si non défini)
 * - Nom, email, rôle
 * - Statistiques (niveau, XP, Coins, Diamonds)
 * - Sport et équipe favoris
 * - Onglets : Aperçu (liens rapides) et Statistiques (StatsTab)
 * - Bouton de déconnexion
 * 
 * États couverts :
 * - Chargement : squelette animé
 * - Erreur : message + bouton réessayer
 * - Vide : profil sans données (nouvel utilisateur)
 * - Partiel : profil avec données de base
 * - Complet : profil avec toutes les stats
 */

type ProfileTab = 'overview' | 'stats' | 'achievements';

export default function ProfilePage(): React.ReactElement {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, refreshSession } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ---------------------------------------------------------------------------
  // Rafraîchissement du profil
  // ---------------------------------------------------------------------------

  async function handleRefresh(): Promise<void> {
    setIsRefreshing(true);
    try {
      await refreshSession();
    } catch {
      // L'erreur est déjà gérée par useAuth
    } finally {
      setIsRefreshing(false);
    }
  }

  // ---------------------------------------------------------------------------
  // États de chargement et d'erreur
  // ---------------------------------------------------------------------------

  // État 1 : Chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  // État 2 : Non authentifié (ne devrait pas arriver avec PrivateRoute, mais sécurité)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Vous devez être connecté pour voir votre profil.</p>
          <button
            onClick={() => navigate('/login')}
            className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // État 3 : Erreur de chargement
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Impossible de charger le profil
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {error.message || 'Une erreur est survenue lors du chargement de votre profil.'}
          </p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg font-semibold text-gray-950 transition-all disabled:opacity-50"
          >
            {isRefreshing ? 'Chargement...' : 'Réessayer'}
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Données dérivées
  // ---------------------------------------------------------------------------

  const profile = user.profile;
  const hasProfile = profile !== null;
  const avatarUrl = profile?.avatarUrl;
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Progression XP (simulée — sera remplacée par la vraie logique)
  const xpForCurrentLevel = (profile?.level ?? 1) * 1000;
  const xpProgress = profile ? Math.min((profile.xp / xpForCurrentLevel) * 100, 100) : 0;

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* -------------------- En-tête du profil -------------------- */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Bannière décorative */}
          <div className="h-24 bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent" />

          {/* Section avatar + infos */}
          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Avatar de ${user.name}`}
                    className="w-20 h-20 rounded-full border-4 border-gray-900 object-cover bg-gray-800"
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.querySelector('.avatar-fallback')!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div
                  className={`w-20 h-20 rounded-full border-4 border-gray-900 bg-gray-700 flex items-center justify-center avatar-fallback ${avatarUrl ? 'hidden' : ''}`}
                  aria-hidden={!!avatarUrl}
                >
                  <span className="text-2xl font-bold text-gray-300">{initials}</span>
                </div>
              </div>

              {/* Nom et email */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white truncate">{user.name}</h1>
                <p className="text-gray-400 text-sm truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-xs text-yellow-400 font-medium">
                    Niveau {profile?.level ?? 1}
                  </span>
                  {user.role !== 'user' && (
                    <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400 font-medium">
                      {user.role === 'admin' ? 'Admin' : 'Modérateur'}
                    </span>
                  )}
                </div>
              </div>

              {/* Bouton édition */}
              <Link
                to="/profile/edit"
                className="shrink-0 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-750 transition-colors text-center"
              >
                Modifier
              </Link>
            </div>
          </div>
        </div>

        {/* -------------------- Barre XP -------------------- */}
        {hasProfile && (
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progression niveau {profile.level}</span>
              <span className="text-sm text-gray-500">
                {profile.xp} / {xpForCurrentLevel} XP
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* -------------------- Statistiques -------------------- */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<CoinIcon />}
            label="Coins"
            value={profile?.totalCoins ?? 0}
            color="yellow"
          />
          <StatCard
            icon={<DiamondIcon />}
            label="Diamonds"
            value={profile?.totalDiamonds ?? 0}
            color="blue"
          />
          <StatCard
            icon={<TrophyIcon />}
            label="Niveau"
            value={profile?.level ?? 1}
            color="green"
          />
          <StatCard
            icon={<StarIcon />}
            label="XP Total"
            value={profile?.xp ?? 0}
            color="purple"
          />
        </div>

        {/* -------------------- Sports favoris -------------------- */}
        {(profile?.favoriteSport || profile?.favoriteTeam) && (
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Préférences</h3>
            <div className="flex flex-wrap gap-3">
              {profile.favoriteSport && (
                <span className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300">
                  {getSportEmoji(profile.favoriteSport)} {getSportLabel(profile.favoriteSport)}
                </span>
              )}
              {profile.favoriteTeam && (
                <span className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300">
                  🏟️ {profile.favoriteTeam}
                </span>
              )}
            </div>
          </div>
        )}

        {/* -------------------- Onglets -------------------- */}
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Barre d'onglets */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              Aperçu
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              Statistiques
            </button>
          </div>

          {/* Contenu de l'onglet */}
          <div className="p-4">
            {activeTab === 'overview' ? (
              /* -------------------- Aperçu : liens rapides -------------------- */
              <div className="space-y-0">
                <ProfileLink
                  to="/collection"
                  icon={<CollectionIcon />}
                  label="Ma collection"
                  description={`${profile?.totalCoins ?? 0} Coins disponibles`}
                />
                <ProfileLink
                  to="/wallet"
                  icon={<WalletIcon />}
                  label="Portefeuille"
                  description="Historique des transactions"
                />
                <ProfileLink
                  to="/profile/security"
                  icon={<ShieldIcon />}
                  label="Sécurité"
                  description="Mot de passe et MFA"
                />
                <ProfileLink
                  to="/settings"
                  icon={<SettingsIcon />}
                  label="Paramètres"
                  description="Préférences et notifications"
                />
              </div>
            ) : (
              /* -------------------- Statistiques -------------------- */
              <StatsTab user={user} />
            )}
          </div>
        </div>

        {/* -------------------- Déconnexion -------------------- */}
        <div className="mt-4">
          <LogoutButton variant="fullWidth" />
        </div>

        {/* -------------------- Footer -------------------- */}
        <p className="mt-6 text-center text-gray-600 text-xs">
          Membre depuis {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
          })}
        </p>
      </div>
    </div>
  );
}

// ===========================================================================
// Composants internes
// ===========================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'yellow' | 'blue' | 'green' | 'purple';
}

function StatCard({ icon, label, value, color }: StatCardProps): React.ReactElement {
  const colorClasses = {
    yellow: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
    blue: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
    green: 'bg-green-400/10 border-green-400/20 text-green-400',
    purple: 'bg-purple-400/10 border-purple-400/20 text-purple-400',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{formatNumber(value)}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

interface ProfileLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

function ProfileLink({ to, icon, label, description }: ProfileLinkProps): React.ReactElement {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800 last:border-b-0"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 text-gray-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Squelette de chargement
// ---------------------------------------------------------------------------

function ProfileSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse">
      {/* Bannière */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="h-24 bg-gray-800" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-700 border-4 border-gray-900" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-40 bg-gray-700 rounded" />
              <div className="h-4 w-56 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="h-4 w-4 bg-gray-700 rounded mb-2" />
            <div className="h-6 w-16 bg-gray-700 rounded" />
            <div className="h-3 w-12 bg-gray-700 rounded mt-1" />
          </div>
        ))}
      </div>

      {/* Liens */}
      <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-700" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 bg-gray-700 rounded" />
              <div className="h-3 w-36 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Utilitaires
// ===========================================================================

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
  return num.toString();
}

function getSportEmoji(sport: string): string {
  const emojis: Record<string, string> = {
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
    rugby: '🏉',
    formula1: '🏎️',
    cycling: '🚴',
    mma: '🥋',
    esports: '🎮',
  };
  return emojis[sport] ?? '🏆';
}

function getSportLabel(sport: string): string {
  const labels: Record<string, string> = {
    football: 'Football',
    basketball: 'Basketball',
    tennis: 'Tennis',
    rugby: 'Rugby',
    formula1: 'Formule 1',
    cycling: 'Cyclisme',
    mma: 'MMA',
    esports: 'Esports',
  };
  return labels[sport] ?? sport;
}

// ===========================================================================
// Icônes
// ===========================================================================

function CoinIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DiamondIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function TrophyIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3h14M5 3v4a4 4 0 004 4h2m-6-8v4m0 0a4 4 0 004 4h2m0 0v6m0 0H9m4 0h2m-2 0v4m0-4H9" />
    </svg>
  );
}

function StarIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function CollectionIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function WalletIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function ShieldIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function SettingsIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}