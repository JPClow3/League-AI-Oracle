import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // No custom props needed yet, but structure is here for future expansion
}

export const TextArea: React.FC<TextAreaProps> = ({ className = '', ...props }) => {
  const baseClasses = 'w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-bg))] disabled:opacity-50 disabled:cursor-not-allowed focus:ring-opacity-75';

  return (
    <textarea className={`${baseClasses} ${className}`} {...props} />
  );
};