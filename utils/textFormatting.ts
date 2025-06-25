import React, { useState, useEffect } from 'react';

export const formatMarkdownString = (text: string): React.ReactNode[] => {
  if (!text) return [];

  // Split into lines first
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (line.trim() === '') {
      elements.push(React.createElement('br', { key: `br-${lineIndex}` }));
      return;
    }

    // Check for headings first for the whole line
    const headingMatch = line.match(/^(#{1,3})\s(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      let headingElement;
      if (level === 1) headingElement = React.createElement('h2', { key: `h1-${lineIndex}`, className: "text-2xl font-semibold text-sky-400 mt-4 mb-2" }, content);
      else if (level === 2) headingElement = React.createElement('h3', { key: `h2-${lineIndex}`, className: "text-xl font-semibold text-sky-300 mt-3 mb-1" }, content);
      else headingElement = React.createElement('h4', { key: `h3-${lineIndex}`, className: "text-lg font-medium text-sky-200 mt-2 mb-1" }, content);
      elements.push(headingElement);
      return;
    }

    // If not a heading, process for inline elements like bold
    // Split by **bold** pattern, keeping delimiters
    const parts = line.split(/(\*\*.*?\*\*)/g); 
    const paragraphChildren = parts.map((part, partIndex) => {
      if (!part) return null; // Skip empty strings from split
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.substring(2, part.length - 2);
        return React.createElement('strong', { key: `bold-${lineIndex}-${partIndex}`, className: "font-semibold text-sky-300" }, content);
      }
      return part; // Return plain text part
    }).filter(Boolean); // Filter out null parts

    elements.push(React.createElement('p', { key: `para-${lineIndex}`, className: "mb-3 leading-relaxed" }, ...paragraphChildren));
  });

  return elements;
};

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
