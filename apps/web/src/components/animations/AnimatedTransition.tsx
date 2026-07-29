// apps/web/src/components/animations/AnimatedTransition.tsx

import React, { useEffect, useState } from 'react';

/**
 * Wrapper de transition animée entre étapes.
 * 
 * Gère l'animation d'entrée et de sortie d'un composant
 * en utilisant les courbes et durées du design system.
 * 
 * Utilisation :
 * ```tsx
 * <AnimatedTransition isVisible={currentStep === 'sport'} direction="forward">
 *   <SportSelectStep />
 * </AnimatedTransition>
 * ```
 */

interface AnimatedTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'forward' | 'backward';
  animation?: 'slide' | 'fade' | 'scale' | 'spring';
  duration?: number;
  className?: string;
}

export default function AnimatedTransition({
  children,
  isVisible,
  direction = 'forward',
  animation = 'slide',
  duration = 300,
  className = '',
}: AnimatedTransitionProps): React.ReactElement | null {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Entrée
      const enterClass = getEnterClass(animation, direction);
      setAnimClass(enterClass);
    } else if (shouldRender) {
      // Sortie
      const exitClass = getExitClass(animation, direction);
      setAnimClass(exitClass);
      // Démontage après l'animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, direction, animation, duration, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${animClass} ${className}`}
      style={{
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

function getEnterClass(animation: string, direction: string): string {
  if (animation === 'spring') return 'anim-spring-in';
  if (animation === 'scale') return 'anim-scale-in';
  if (animation === 'fade') return 'anim-fade-in-up';

  // Slide
  return direction === 'forward' ? 'anim-fade-in-left' : 'anim-fade-in-right';
}

function getExitClass(animation: string, direction: string): string {
  if (animation === 'spring') return 'anim-scale-in';
  return direction === 'forward' ? 'anim-fade-out-down' : 'anim-fade-out-down';
}