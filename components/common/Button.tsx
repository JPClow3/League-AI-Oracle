import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
  loading?: boolean;
  ariaLabel?: string;
};

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled,
  ariaLabel,
  ...props
}: ButtonProps) => {
  const baseClasses = 'font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-[hsl(var(--bg-primary))] disabled:cursor-not-allowed active:translate-y-0 transform hover:-translate-y-0.5';

  const variantClasses = {
    primary: 'px-4 py-2 bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] font-bold hover:brightness-110 shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/30 disabled:bg-[hsl(var(--surface-tertiary))] disabled:text-[hsl(var(--text-muted))] disabled:shadow-none disabled:saturate-50',
    secondary: 'px-4 py-2 bg-transparent text-[hsl(var(--accent))] border border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)_/_0.1)] disabled:bg-transparent disabled:border-[hsl(var(--border))] disabled:text-[hsl(var(--text-muted))]',
    danger: 'px-4 py-2 bg-[hsl(var(--error))] text-white hover:bg-[hsl(var(--error)_/_0.9)] disabled:bg-[hsl(var(--error)_/_0.5)]',
    ghost: 'p-2 bg-transparent text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--text-primary))] disabled:bg-transparent disabled:text-[hsl(var(--text-muted))]',
  };

  const isDisabled = disabled || loading;

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : children}
    </button>
  );
};