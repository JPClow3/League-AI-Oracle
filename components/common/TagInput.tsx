import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ tags, setTags, placeholder = "Add a tag and press Enter..." }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 p-2 bg-surface-secondary border border-border rounded-md">
        {tags.map(tag => (
          <div key={tag} className="flex items-center gap-1 bg-accent/20 text-accent text-sm font-semibold px-2 py-1 rounded">
            <span>{tag}</span>
            <button onClick={() => removeTag(tag)} className="text-accent/70 hover:text-accent" aria-label={`Remove tag ${tag}`}>
              <X size={14} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
             const newTag = inputValue.trim();
              if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
              }
              setInputValue('');
          }}
          placeholder={placeholder}
          className="bg-transparent focus:outline-none flex-grow min-w-[120px]"
        />
      </div>
    </div>
  );
};
