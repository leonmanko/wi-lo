// apps/web/src/components/ui/Button.tsx

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-wi-yellow hover:bg-yellow-400 text-wi-black font-semibold active:scale-[0.98]',
  secondary:
    'bg-wi-card border border-wi-border text-wi-text-secondary hover:bg-wi-card-hover hover:text-white',
  outline:
    'border border-wi-border-light text-wi-text-secondary hover:border-wi-yellow hover:text-wi-yellow',
  ghost:
    'text-wi-text-muted hover:text-white hover:bg-wi-card',
  danger:
    'bg-wi-error/10 border border-wi-error/30 text-wi-error hover:bg-wi-error/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-3 text-sm rounded-lg',
  md: 'py-2.5 px-5 text-sm rounded-lg',
  lg: 'py-3 px-6 text-base rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-wi-yellow/50 focus:ring-offset-2 focus:ring-offset-wi-black
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      )}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}