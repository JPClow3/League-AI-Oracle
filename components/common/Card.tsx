import React from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ variant = 'default', children, className = '', ...props }: CardProps) => {
  const baseClasses = 'rounded-md border transition-all';
  
  const variantClasses = {
    default: 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] shadow-sm',
    elevated: 'bg-[hsl(var(--surface))] border-[hsl(var(--border))] shadow-lg',
    outlined: 'bg-transparent border-[hsl(var(--border))]',
    interactive: 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] shadow-sm hover:shadow-md hover:border-[hsl(var(--accent))] cursor-pointer',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
