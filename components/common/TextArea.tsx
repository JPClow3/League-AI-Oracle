import React from 'react';

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  // No custom props needed yet, but structure is here for future expansion
};

export const TextArea = ({ className = '', ...props }: TextAreaProps) => {
  const baseClasses = 'w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed focus:ring-opacity-75';

  return (
    <textarea className={`${baseClasses} ${className}`} {...props} />
  );
};