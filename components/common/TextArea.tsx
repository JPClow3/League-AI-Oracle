import React from 'react';

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  // No custom props needed yet, but structure is here for future expansion
};

export const TextArea = ({ className = '', ...props }: TextAreaProps) => {
  const baseClasses = 'w-full px-3 py-2 bg-[hsl(var(--surface-secondary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <textarea className={`${baseClasses} ${className}`} {...props} />
  );
};