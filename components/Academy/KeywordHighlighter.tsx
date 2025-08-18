import React from 'react';
import { KEYWORDS } from './lessons';
import { Tooltip } from '../common/Tooltip';

interface KeywordHighlighterProps {
  text: string;
  onKeywordClick?: (lessonId: string) => void;
}

export const KeywordHighlighter: React.FC<KeywordHighlighterProps> = ({ text, onKeywordClick }) => {
  const keywordMap = React.useMemo(() => {
    const map = new Map<string, { definition: string; lessonId: string }>();
    KEYWORDS.forEach(kw => map.set(kw.term.toLowerCase(), { definition: kw.definition, lessonId: kw.lessonId }));
    return map;
  }, []);

  const regex = React.useMemo(() => {
    // Use word boundaries (\b) to ensure only whole words are matched.
    const pattern = `\\b(${KEYWORDS.map(k => k.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`;
    return new RegExp(pattern, 'gi');
  }, []);

  const parts = React.useMemo(() => {
    if (!text) return [];
    return text.split(regex);
  }, [text, regex]);

  return (
    <>
      {parts.map((part, index) => {
        const keywordData = keywordMap.get(part.toLowerCase());
        if (keywordData) {
          const content = (
            <div>
              <p>{keywordData.definition}</p>
              {onKeywordClick && <p className="mt-2 text-xs text-cyan-300">Click to learn more</p>}
            </div>
          );
          return (
            <Tooltip key={index} content={content}>
              <button
                onClick={() => onKeywordClick?.(keywordData.lessonId)}
                className="inline p-0 m-0 border-b border-dotted border-blue-400 text-blue-300 font-semibold cursor-pointer text-left bg-transparent hover:text-blue-200"
              >
                {part}
              </button>
            </Tooltip>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
