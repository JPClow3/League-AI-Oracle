import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    error,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-text-primary mb-2">
                    {label}
                </label>
            )}
            <textarea
                className={`
                    w-full px-4 py-3 
                    bg-secondary border border-border rounded-lg
                    text-text-primary placeholder-text-secondary
                    focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                    transition-all duration-200
                    resize-vertical min-h-[100px]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error ? 'border-error focus:ring-error' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-error">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-text-secondary">{helperText}</p>
            )}
        </div>
    );
};

