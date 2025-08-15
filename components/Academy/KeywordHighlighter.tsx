import React from 'react';
import { KEYWORDS } from './lessons';
import { Tooltip } from '../common/Tooltip';

interface KeywordHighlighterProps {
  text: string;
}

export const KeywordHighlighter: React.FC<KeywordHighlighterProps> = ({ text }) => {
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
          return (
            <Tooltip key={index} content={keywordData.definition}>
              <span
                className="inline p-0 m-0 border-b border-dotted border-blue-400 text-blue-300 font-semibold cursor-help"
              >
                {part}
              </span>
            </Tooltip>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};