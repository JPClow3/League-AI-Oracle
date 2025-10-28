import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
    label?: string;
    className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
    tags,
    onTagsChange,
    placeholder = 'Type and press Enter',
    maxTags,
    label,
    className = '',
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();

            if (maxTags && tags.length >= maxTags) {
                return;
            }

            const newTag = inputValue.trim();
            if (!tags.includes(newTag)) {
                onTagsChange([...tags, newTag]);
            }
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            onTagsChange(tags.slice(0, -1));
        }
    };

    const removeTag = (indexToRemove: number) => {
        onTagsChange(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-text-primary mb-2">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2 p-3 bg-secondary border border-border rounded-lg focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:text-accent-hover focus:outline-none"
                            aria-label={`Remove ${tag}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-text-primary placeholder-text-secondary"
                    disabled={maxTags !== undefined && tags.length >= maxTags}
                />
            </div>
            {maxTags && (
                <p className="mt-1 text-xs text-text-secondary">
                    {tags.length} / {maxTags} tags
                </p>
            )}
        </div>
    );
};

