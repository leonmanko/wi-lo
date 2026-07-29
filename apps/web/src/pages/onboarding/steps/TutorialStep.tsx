// apps/web/src/pages/onboarding/steps/TutorialStep.tsx

import React, { useState } from 'react';

interface TutorialStepProps {
  favoriteSport: string | null;
  onComplete: () => void;
}

/**
 * ONB4 — Didacticiel 3 slides + Mascotte.
 * 
 * Slides :
 * 1. Quiz en direct — Des questions fraîches générées par IA
 * 2. Collection — Ouvre des packs et collectionne des personnages
 * 3. Compétition — Défie tes amis et grimpe le classement
 */

const SLIDES = [
  {
    emoji: '⚡',
    title: 'Quiz en direct',
    description:
      'Des questions générées en temps réel sur l\'actualité sportive. Chaque quiz est unique.',
    color: 'var(--wilo-blue-500)',
  },
  {
    emoji: '🃏',
    title: 'Collectionne',
    description:
      'Ouvre des packs et découvre des personnages WI-LO Legends. 5 niveaux de rareté à collectionner.',
    color: 'var(--wilo-gold-500)',
  },
  {
    emoji: '🏆',
    title: 'Compétition',
    description:
      'Défie tes amis en duel 1v1, grimpe le classement et deviens une légende WI-LO.',
    color: 'var(--wilo-green-500)',
  },
];

export default function TutorialStep({
  favoriteSport,
  onComplete,
}: TutorialStepProps): React.ReactElement {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;

  function handleNext(): void {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  }

  return (
    <div className="text-center">
      {/* Icône de la slide */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300"
        style={{
          backgroundColor: slide.color + '1A',
          border: `2px solid ${slide.color}30`,
          transform: 'scale(1)',
          animation: 'cta-pulse 3s ease-in-out infinite',
        }}
      >
        <span className="text-4xl">{slide.emoji}</span>
      </div>

      {/* Titre */}
      <h2
        className="font-display text-3xl font-bold mb-3"
        style={{ color: '#FFFFFF' }}
      >
        {slide.title}
      </h2>

      {/* Description */}
      <p
        className="text-base mb-8 px-4"
        style={{ color: 'var(--wilo-blue-200)', fontFamily: 'var(--font-body)', lineHeight: '1.6' }}
      >
        {slide.description}
      </p>

      {/* Points d'indication */}
      <div className="flex justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === currentSlide ? slide.color : 'var(--bg-tertiary)',
              transform: i === currentSlide ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Bouton */}
      <button
        onClick={handleNext}
        className="w-full font-display font-bold transition-all duration-200 active:scale-[0.98]"
        style={{
          backgroundColor: isLastSlide ? 'var(--wilo-gold-500)' : 'var(--wilo-blue-500)',
          color: isLastSlide ? 'var(--bg-primary)' : '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          height: isLastSlide ? '72px' : '56px',
          fontSize: isLastSlide ? 'var(--text-2xl)' : 'var(--text-lg)',
          boxShadow: isLastSlide ? 'var(--shadow-glow-gold)' : 'none',
        }}
      >
        {isLastSlide ? "C'est parti !" : 'Suivant'}
      </button>

      {/* Skip */}
      {!isLastSlide && (
        <button
          onClick={onComplete}
          className="mt-4 text-sm font-medium transition-colors"
          style={{ color: 'var(--wilo-blue-600)', fontFamily: 'var(--font-body)' }}
        >
          Passer le didacticiel
        </button>
      )}
    </div>
  );
}