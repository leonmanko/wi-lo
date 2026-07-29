// apps/web/src/pages/onboarding/steps/WelcomeStep.tsx — REMPLACER

import React, { useEffect, useState } from 'react';
import ParticleBurst from '../../../components/animations/ParticleBurst';

interface WelcomeStepProps {
  onComplete: () => void;
}

/**
 * ONB1 — Écran de bienvenue avec logo animé.
 * 
 * Séquence d'animation :
 * 0ms-500ms   : Fond fondu + Logo scale-in (ease-spring)
 * 500ms-800ms : Sous-titre fade-in-up + halo lumineux pulse
 * 800ms-1800ms: Particules dorées en arrière-plan
 * 1800ms-2200ms: Logo brille intensément
 * 2200ms-2500ms: Transition sortie → étape suivante
 */

export default function WelcomeStep({ onComplete }: WelcomeStepProps): React.ReactElement {
  const [phase, setPhase] = useState<'loading' | 'logo' | 'subtitle' | 'particles' | 'glow' | 'exiting'>('loading');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase('logo'), 100));
    timers.push(setTimeout(() => setPhase('subtitle'), 600));
    timers.push(setTimeout(() => setPhase('particles'), 900));
    timers.push(setTimeout(() => setPhase('glow'), 1800));
    timers.push(setTimeout(() => {
      setPhase('exiting');
      setTimeout(onComplete, 400);
    }, 2300));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="relative text-center">
      {/* Particules en arrière-plan */}
      {phase === 'particles' || phase === 'glow' ? (
        <ParticleBurst count={30} color="var(--wilo-gold-500)" duration={2000} size={8} />
      ) : null}

      {/* Logo */}
      <div
        className="transition-all duration-700"
        style={{
          transform: phase === 'logo' || phase === 'subtitle' || phase === 'particles'
            ? 'scale(1)'
            : phase === 'glow'
              ? 'scale(1.08)'
              : phase === 'exiting'
                ? 'scale(1.15)'
                : 'scale(0.3)',
          opacity: phase === 'exiting' ? 0 : 1,
          transitionTimingFunction: phase === 'logo'
            ? 'var(--ease-spring)'
            : phase === 'glow'
              ? 'var(--ease-bounce)'
              : 'var(--ease-out)',
          filter: phase === 'glow'
            ? 'drop-shadow(0 0 30px rgba(245, 166, 35, 0.6))'
            : 'none',
        }}
      >
        <h1
          className="font-display text-6xl font-bold tracking-wider select-none"
          style={{
            color: 'var(--wilo-blue-500)',
          }}
        >
          WI<span style={{ color: 'var(--wilo-gold-500)' }}>-</span>LO
        </h1>
      </div>

      {/* Sous-titre */}
      <div
        className="transition-all duration-500"
        style={{
          opacity: phase === 'subtitle' || phase === 'particles' || phase === 'glow' ? 1 : 0,
          transform: phase === 'subtitle' || phase === 'particles' || phase === 'glow'
            ? 'translateY(0)'
            : 'translateY(10px)',
          transitionTimingFunction: 'var(--ease-out)',
          transitionDelay: phase === 'subtitle' ? '0ms' : '0ms',
        }}
      >
        <p
          className="mt-3 text-lg"
          style={{
            color: 'var(--wilo-blue-200)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Le quiz sportif nouvelle génération
        </p>
      </div>

      {/* Indicateur de chargement */}
      <div className="mt-12 flex justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'var(--wilo-blue-800)',
            borderTopColor: 'var(--wilo-gold-500)',
            opacity: phase === 'exiting' ? 0 : 1,
            transition: 'opacity 300ms var(--ease-in)',
          }}
        />
      </div>

      {/* Indice */}
      <p
        className="mt-8 text-sm transition-all duration-300"
        style={{
          color: 'var(--wilo-blue-700)',
          fontFamily: 'var(--font-body)',
          opacity: phase === 'subtitle' || phase === 'particles' ? 1 : 0,
          transitionDelay: '1200ms',
        }}
      >
        Préparez-vous...
      </p>
    </div>
  );
}