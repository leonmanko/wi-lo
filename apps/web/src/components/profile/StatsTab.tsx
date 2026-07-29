// apps/web/src/components/profile/StatsTab.tsx

import React from 'react';
import type { UserProfile } from '../../types/auth';

/**
 * Onglet Statistiques du profil utilisateur.
 * 
 * Affiche les statistiques détaillées du joueur :
 * - Win rate et ratio victoires/défaites
 * - Série de victoires actuelle et record
 * - Total de parties jouées
 * - Graphique de progression (simplifié)
 * - Historique des 10 derniers matchs
 * - Répartition par sport
 * 
 * États couverts :
 * - Complet : toutes les stats disponibles
 * - Partiel : certaines stats à zéro (nouveau joueur)
 * - Vide : aucune partie jouée
 */

interface StatsTabProps {
  user: UserProfile;
}

// Types pour les stats (seront enrichis avec le backend)
interface PlayerStats {
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalMatches: number;
  currentStreak: number;
  bestStreak: number;
  totalCoinsEarned: number;
  totalDiamondsEarned: number;
  last10Matches: MatchResult[];
  sportDistribution: SportStat[];
  weeklyProgress: number[];
}

interface MatchResult {
  date: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  sport: string;
}

interface SportStat {
  sport: string;
  matches: number;
  wins: number;
  winRate: number;
}

// Données mockées (seront remplacées par l'appel backend)
function getMockStats(user: UserProfile): PlayerStats {
  return {
    totalWins: 142,
    totalLosses: 98,
    totalDraws: 12,
    totalMatches: 252,
    currentStreak: 7,
    bestStreak: 15,
    totalCoinsEarned: user.profile?.totalCoins ?? 0,
    totalDiamondsEarned: user.profile?.totalDiamonds ?? 0,
    last10Matches: [
      { date: '2024-06-15', opponent: 'JoueurPro99', result: 'win', score: '8-5', sport: 'football' },
      { date: '2024-06-14', opponent: 'SportFan42', result: 'win', score: '10-7', sport: 'football' },
      { date: '2024-06-14', opponent: 'QuizMaster', result: 'win', score: '9-6', sport: 'basketball' },
      { date: '2024-06-13', opponent: 'GoalKing', result: 'win', score: '7-4', sport: 'football' },
      { date: '2024-06-12', opponent: 'AceTennis', result: 'loss', score: '5-8', sport: 'tennis' },
      { date: '2024-06-11', opponent: 'RugbyFan', result: 'win', score: '6-3', sport: 'rugby' },
      { date: '2024-06-10', opponent: 'SpeedQuiz', result: 'win', score: '11-9', sport: 'formula1' },
      { date: '2024-06-09', opponent: 'MMAFighter', result: 'loss', score: '4-7', sport: 'mma' },
      { date: '2024-06-08', opponent: 'CycloPro', result: 'win', score: '8-6', sport: 'cycling' },
      { date: '2024-06-07', opponent: 'EsportsKing', result: 'draw', score: '6-6', sport: 'esports' },
    ],
    sportDistribution: [
      { sport: 'football', matches: 89, wins: 58, winRate: 65 },
      { sport: 'basketball', matches: 52, wins: 31, winRate: 60 },
      { sport: 'tennis', matches: 38, wins: 20, winRate: 53 },
      { sport: 'rugby', matches: 28, wins: 15, winRate: 54 },
      { sport: 'formula1', matches: 20, wins: 9, winRate: 45 },
      { sport: 'mma', matches: 15, wins: 5, winRate: 33 },
      { sport: 'cycling', matches: 7, wins: 3, winRate: 43 },
      { sport: 'esports', matches: 3, wins: 1, winRate: 33 },
    ],
    weeklyProgress: [12, 18, 8, 22, 15, 25, 10],
  };
}

export default function StatsTab({ user }: StatsTabProps): React.ReactElement {
  const stats = getMockStats(user);
  const winRate = stats.totalMatches > 0
    ? Math.round((stats.totalWins / stats.totalMatches) * 100)
    : 0;

  const hasMatches = stats.totalMatches > 0;

  // ---------------------------------------------------------------------------
  // État vide : aucune partie jouée
  // ---------------------------------------------------------------------------

  if (!hasMatches) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucune statistique</h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Jouez votre première partie pour débloquer vos statistiques !
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Rendu complet
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* -------------------- Résumé -------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStatCard
          label="Parties"
          value={stats.totalMatches.toString()}
          color="gray"
        />
        <MiniStatCard
          label="Victoires"
          value={stats.totalWins.toString()}
          color="green"
        />
        <MiniStatCard
          label="Win Rate"
          value={`${winRate}%`}
          color="yellow"
        />
        <MiniStatCard
          label="Série actuelle"
          value={`🔥 ${stats.currentStreak}`}
          color="orange"
        />
      </div>

      {/* -------------------- Barre de win rate -------------------- */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">
            Ratio victoires / défaites
          </span>
          <span className="text-sm text-gray-500">
            {stats.totalWins}V - {stats.totalLosses}D
            {stats.totalDraws > 0 && ` - ${stats.totalDraws}N`}
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
          {stats.totalWins > 0 && (
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(stats.totalWins / stats.totalMatches) * 100}%` }}
            />
          )}
          {stats.totalDraws > 0 && (
            <div
              className="h-full bg-yellow-500 transition-all"
              style={{ width: `${(stats.totalDraws / stats.totalMatches) * 100}%` }}
            />
          )}
          {stats.totalLosses > 0 && (
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(stats.totalLosses / stats.totalMatches) * 100}%` }}
            />
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Victoires
          </span>
          {stats.totalDraws > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Nuls
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Défaites
          </span>
        </div>
      </div>

      {/* -------------------- Records -------------------- */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Meilleure série</p>
          <p className="text-2xl font-bold text-white">🔥 {stats.bestStreak}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Série actuelle</p>
          <p className="text-2xl font-bold text-white">
            {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : '—'}
          </p>
        </div>
      </div>

      {/* -------------------- Graphique hebdomadaire -------------------- */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-4">Parties cette semaine</p>
        <div className="flex items-end justify-between gap-1 h-24">
          {stats.weeklyProgress.map((value, index) => {
            const maxValue = Math.max(...stats.weeklyProgress, 1);
            const height = (value / maxValue) * 100;
            const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
            const isToday = index === stats.weeklyProgress.length - 1;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{value}</span>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isToday ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className={`text-xs ${isToday ? 'text-yellow-400 font-medium' : 'text-gray-600'}`}>
                  {days[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------- Répartition par sport -------------------- */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-4">Par sport</p>
        <div className="space-y-3">
          {stats.sportDistribution
            .filter((s) => s.matches > 0)
            .sort((a, b) => b.matches - a.matches)
            .slice(0, 5)
            .map((sport) => (
              <div key={sport.sport} className="flex items-center gap-3">
                <span className="text-sm w-20 truncate text-gray-300">
                  {getSportEmoji(sport.sport)} {getSportLabel(sport.sport)}
                </span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${Math.min(sport.winRate, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {sport.winRate}%
                </span>
                <span className="text-xs text-gray-600 w-14 text-right">
                  {sport.matches} parties
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* -------------------- Derniers matchs -------------------- */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-4">Derniers matchs</p>
        <div className="space-y-1">
          {stats.last10Matches.map((match, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {/* Résultat */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  match.result === 'win'
                    ? 'bg-green-500'
                    : match.result === 'loss'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                }`}
              />

              {/* Détails */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  vs {match.opponent}
                </p>
                <p className="text-xs text-gray-500">
                  {getSportEmoji(match.sport)} {getSportLabel(match.sport)}
                </p>
              </div>

              {/* Score */}
              <span
                className={`text-sm font-mono font-bold ${
                  match.result === 'win'
                    ? 'text-green-400'
                    : match.result === 'loss'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                }`}
              >
                {match.score}
              </span>

              {/* Date */}
              <span className="text-xs text-gray-600 w-20 text-right">
                {new Date(match.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Composants internes
// ===========================================================================

interface MiniStatCardProps {
  label: string;
  value: string;
  color: 'gray' | 'green' | 'yellow' | 'orange';
}

function MiniStatCard({ label, value, color }: MiniStatCardProps): React.ReactElement {
  const colorClasses = {
    gray: 'bg-gray-800/50 border-gray-700',
    green: 'bg-green-500/5 border-green-500/20',
    yellow: 'bg-yellow-400/5 border-yellow-400/20',
    orange: 'bg-orange-400/5 border-orange-400/20',
  };

  return (
    <div className={`rounded-xl border p-3 ${colorClasses[color]}`}>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ===========================================================================
// Utilitaires (partagés avec ProfilePage)
// ===========================================================================

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
    formula1: 'F1',
    cycling: 'Cyclisme',
    mma: 'MMA',
    esports: 'Esports',
  };
  return labels[sport] ?? sport;
}