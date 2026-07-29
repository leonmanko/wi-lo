// apps/web/src/components/ui/WiLoLogo.tsx

import React from 'react';

interface WiLoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

export default function WiLoLogo({ size = 'md', className = '' }: WiLoLogoProps): React.ReactElement {
  return (
    <h1 className={`wi-logo ${sizeClasses[size]} ${className}`}>
      WI<span className="wi-logo-accent">-</span>LO
    </h1>
  );
}