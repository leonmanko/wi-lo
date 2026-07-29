// apps/web/src/components/ui/Input.tsx

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  id,
  ...props
}: InputProps): React.ReactElement {
  const inputId = id || props.name;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-wi-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-wi-text-muted">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-3 bg-wi-card border rounded-lg text-white
            placeholder-wi-text-disabled
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-wi-yellow/50 focus:border-wi-yellow/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'border-wi-error' : 'border-wi-border'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-wi-error text-sm" role="alert">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-wi-text-muted text-xs">{helperText}</p>
      )}
    </div>
  );
}