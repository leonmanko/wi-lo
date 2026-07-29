// apps/web/src/components/animations/SportReveal.tsx

import React from 'react';

/**
 * Animation de révélation du sport choisi.
 * 
 * Affiche un halo coloré qui pulse avec la couleur du sport sélectionné.
 * 
 * Utilisation :
 * ```tsx
 * <SportReveal sportColor="#4A90FF" sportEmoji="⚽" sportName="Football" />
 * ```
 */

interface SportRevealProps {
  sportColor: string;
  sportEmoji: string;
  sportName: string;
  isVisible: boolean;
}

export default function SportReveal({
  sportColor,
  sportEmoji,
  sportName,
  isVisible,
}: SportRevealProps): React.ReactElement | null {
  if (!isVisible) return null;

  return (
    <div className="text-center anim-spring-in" style={{ animationDuration: '600ms' }}>
      {/* Halo lumineux */}
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 anim-glow-pulse"
        style={{
          backgroundColor: `${sportColor}15`,
          border: `3px solid ${sportColor}40`,
        }}
      >
        <span className="text-6xl anim-bounce-in">{sportEmoji}</span>
      </div>

      {/* Nom du sport */}
      <p
        className="font-display text-2xl font-bold anim-fade-in-up"
        style={{
          color: sportColor,
          animationDelay: '200ms',
          animationDuration: '400ms',
        }}
      >
        {sportName}
      </p>

      <p
        className="text-sm mt-2 anim-fade-in"
        style={{
          color: 'var(--wilo-blue-300)',
          fontFamily: 'var(--font-body)',
          animationDelay: '400ms',
        }}
      >
        Interface personnalisée !
      </p>
    </div>
  );
}