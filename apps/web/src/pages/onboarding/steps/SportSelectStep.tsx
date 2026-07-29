// apps/web/src/pages/onboarding/steps/SportSelectStep.tsx

import React from 'react';
import { useSportTheme } from '../../../hooks/useSportTheme';

interface SportSelectStepProps {
  selectedSport: string | null;
  onSelect: (sport: string) => void;
}

/**
 * ONB2 — Choix du sport favori.
 * 
 * Affiche une grille de 6 sports.
 * L'utilisateur doit en choisir un pour continuer.
 * 
 * Sports disponibles (selon maquette) :
 * ⚽ Football, 🏀 Basketball, 🎾 Tennis, 🏉 Rugby, 🏎️ F1, 🥋 MMA/Combat
 */

const SPORTS = [
  {
    id: 'football',
    label: 'Football',
    emoji: '⚽',
    color: 'var(--sport-football)',
  },
  {
    id: 'basketball',
    label: 'Basketball',
    emoji: '🏀',
    color: 'var(--sport-basketball)',
  },
  {
    id: 'tennis',
    label: 'Tennis',
    emoji: '🎾',
    color: 'var(--sport-tennis)',
  },
  {
    id: 'rugby',
    label: 'Rugby',
    emoji: '🏉',
    color: 'var(--sport-rugby)',
  },
  {
    id: 'f1',
    label: 'Formule 1',
    emoji: '🏎️',
    color: 'var(--sport-f1)',
  },
  {
    id: 'combat',
    label: 'MMA / Combat',
    emoji: '🥋',
    color: 'var(--sport-combat)',
  },
];

export default function SportSelectStep({
  selectedSport,
  onSelect,
}: SportSelectStepProps): React.ReactElement {
  const { applySportTheme } = useSportTheme();

  const handleSelect = (sport: string) => {
    applySportTheme(sport); // Preview immédiate
    onSelect(sport);
  };

  return (
    <div className="text-center">
      {/* Titre */}
      <h2
        className="font-display text-3xl font-bold mb-2"
        style={{ color: '#FFFFFF' }}
      >
        Choisis ton sport
      </h2>
      <p
        className="text-base mb-8"
        style={{ color: 'var(--wilo-blue-200)', fontFamily: 'var(--font-body)' }}
      >
        Ton expérience sera personnalisée selon ton sport favori
      </p>

      {/* Grille 2 colonnes × 3 lignes */}
      <div className="grid grid-cols-2 gap-3">
        {SPORTS.map((sport) => {
          const isSelected = selectedSport === sport.id;

          return (
            <button
              key={sport.id}
              onClick={() => handleSelect(sport.id)}
              className="relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-200"
              style={{
                backgroundColor: isSelected ? sport.color + '1A' : 'var(--bg-secondary)',
                borderColor: isSelected ? sport.color : 'var(--bg-tertiary)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? `0 0 20px ${sport.color}30` : 'none',
              }}
            >
              {/* Emoji */}
              <span className="text-4xl">{sport.emoji}</span>

              {/* Label */}
              <span
                className="text-sm font-medium"
                style={{
                  color: isSelected ? sport.color : 'var(--wilo-blue-200)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {sport.label}
              </span>

              {/* Checkmark si sélectionné */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: sport.color }}
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Indication */}
      <p
        className="mt-8 text-sm"
        style={{ color: 'var(--wilo-blue-700)', fontFamily: 'var(--font-body)' }}
      >
        Tu pourras changer à tout moment dans les paramètres
      </p>
    </div>
  );
}