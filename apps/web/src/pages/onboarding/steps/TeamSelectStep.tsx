// apps/web/src/pages/onboarding/steps/TeamSelectStep.tsx

import React, { useState } from 'react';

interface TeamSelectStepProps {
  selectedTeam: string | null;
  selectedSport: string | null;
  onSelect: (team: string | null) => void;
  onSkip: () => void;
}

/**
 * ONB3 — Choix de l'équipe favorite (optionnel).
 * 
 * Champ texte libre (pas de liste déroulante d'équipes réelles —
 * règle WI-LO : pas de marques/clubs sous licence).
 * L'utilisateur peut :
 * - Saisir le nom de son équipe
 * - Passer cette étape (skip)
 */

export default function TeamSelectStep({
  selectedTeam,
  selectedSport,
  onSelect,
  onSkip,
}: TeamSelectStepProps): React.ReactElement {
  const [teamName, setTeamName] = useState(selectedTeam ?? '');

  const sportEmoji = getSportEmoji(selectedSport);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const trimmed = teamName.trim();
    onSelect(trimmed || null);
  }

  return (
    <div className="text-center">
      {/* Titre */}
      <h2
        className="font-display text-3xl font-bold mb-2"
        style={{ color: '#FFFFFF' }}
      >
        Ton équipe préférée
      </h2>
      <p
        className="text-base mb-8"
        style={{ color: 'var(--wilo-blue-200)', fontFamily: 'var(--font-body)' }}
      >
        {sportEmoji} Pour les Derby Days et les classements par équipe
      </p>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="team-name"
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--wilo-blue-300)', fontFamily: 'var(--font-body)' }}
          >
            Nom de l&apos;équipe
          </label>
          <input
            type="text"
            id="team-name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Ex: Les Aigles, Les Lions..."
            maxLength={30}
            autoFocus
            className="w-full px-4 py-3 rounded-lg text-white text-center text-lg font-body transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--wilo-blue-500)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--bg-tertiary)';
            }}
          />
          <p
            className="mt-2 text-xs"
            style={{ color: 'var(--wilo-blue-700)', fontFamily: 'var(--font-body)' }}
          >
            Nom 100% fictif — pas de marque réelle
          </p>
        </div>

        {/* Bouton Valider */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-display text-xl font-bold transition-all duration-200 active:scale-[0.98]"
          style={{
            backgroundColor: 'var(--wilo-gold-500)',
            color: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            height: '56px',
            boxShadow: 'var(--shadow-glow-gold)',
          }}
        >
          {teamName.trim() ? 'Continuer' : 'Plus tard'}
        </button>
      </form>

      {/* Skip */}
      <button
        onClick={onSkip}
        className="mt-4 text-sm font-medium transition-colors"
        style={{ color: 'var(--wilo-blue-600)', fontFamily: 'var(--font-body)' }}
      >
        Passer cette étape
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utilitaire
// ---------------------------------------------------------------------------

function getSportEmoji(sport: string | null): string {
  const emojis: Record<string, string> = {
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
    rugby: '🏉',
    f1: '🏎️',
    combat: '🥋',
  };
  return sport ? (emojis[sport] ?? '🏆') : '🏆';
}