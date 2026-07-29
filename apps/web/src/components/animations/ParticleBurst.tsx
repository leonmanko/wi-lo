// apps/web/src/components/animations/ParticleBurst.tsx

import React, { useMemo } from 'react';

/**
 * Explosion de particules pour les célébrations.
 * 
 * Utilise les tokens d'animation du design system.
 * 
 * Utilisation :
 * ```tsx
 * <ParticleBurst count={20} color="var(--sport-accent)" />
 * ```
 */

interface ParticleBurstProps {
  /** Nombre de particules */
  count?: number;
  /** Couleur des particules */
  color?: string;
  /** Durée de l'animation en ms */
  duration?: number;
  /** Taille des particules en px */
  size?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  delay: number;
  size: number;
  rotation: number;
}

export default function ParticleBurst({
  count = 20,
  color = 'var(--wilo-gold-500)',
  duration = 1500,
  size = 6,
}: ParticleBurstProps): React.ReactElement {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50,
      y: 50,
      driftX: (Math.random() - 0.5) * 200,
      driftY: (Math.random() - 0.5) * 200 - 50,
      delay: Math.random() * 200,
      size: Math.random() * size + 4,
      rotation: Math.random() * 360,
    }));
  }, [count, size]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: color,
            animation: `particleFloat ${duration}ms var(--ease-out) ${p.delay}ms both`,
            '--drift-x': `${p.driftX}px`,
            '--drift-y': `${p.driftY}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}