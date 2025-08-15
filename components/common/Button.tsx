import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'primary-glow';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-97';

  // Using CSS variables for theme-aware colors
  const variantClasses = {
    primary: 'bg-[rgb(var(--color-accent-bg))] text-white hover:bg-[rgb(var(--color-accent-bg-hover))] focus:ring-[rgb(var(--color-accent-bg))]',
    'primary-glow': 'bg-[rgb(var(--color-accent-bg))] text-white hover:bg-[rgb(var(--color-accent-bg-hover))] focus:ring-[rgb(var(--color-accent-bg))] shadow-lg shadow-[rgb(var(--color-accent-bg))]/30 hover:shadow-[rgb(var(--color-accent-bg))]/50',
    secondary: 'bg-slate-700 text-gray-200 hover:bg-slate-600 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
