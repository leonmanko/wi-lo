// apps/web/src/components/ui/Badge.tsx

import React from 'react';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'rarity-bronze' | 'rarity-silver' | 'rarity-gold' | 'rarity-icon' | 'rarity-legend';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-wi-card border-wi-border text-wi-text-secondary',
  success: 'bg-wi-success/10 border-wi-success/20 text-wi-success',
  error: 'bg-wi-error/10 border-wi-error/20 text-wi-error',
  warning: 'bg-wi-warning/10 border-wi-warning/20 text-wi-warning',
  info: 'bg-wi-info/10 border-wi-info/20 text-wi-info',
  'rarity-bronze': 'bg-wi-rarity-bronze/10 border-wi-rarity-bronze/30 text-wi-rarity-bronze',
  'rarity-silver': 'bg-wi-rarity-silver/10 border-wi-rarity-silver/30 text-wi-rarity-silver',
  'rarity-gold': 'bg-wi-rarity-gold/10 border-wi-rarity-gold/30 text-wi-rarity-gold',
  'rarity-icon': 'bg-wi-rarity-icon/10 border-wi-rarity-icon/30 text-wi-rarity-icon',
  'rarity-legend': 'bg-wi-rarity-legend/10 border-wi-rarity-legend/30 text-wi-rarity-legend',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps): React.ReactElement {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border transition-colors
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}