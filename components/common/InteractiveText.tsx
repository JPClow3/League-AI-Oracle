
import React from 'react';
import { KEYWORD_MAP } from '../../data/keywordMapping';
import KeywordPopover from './KeywordPopover';

interface InteractiveTextProps {
  children: string;
  onKeywordClick: (lessonId: string) => void;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({ children, onKeywordClick }) => {
  const [popover, setPopover] = React.useState<{ lessonId: string; summary: string; position: { top: number; left: number } } | null>(null);

  const handleKeywordClick = (event: React.MouseEvent<HTMLSpanElement>, lessonId: string, summary: string) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setPopover({
      lessonId,
      summary,
      position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
    });
  };

  const closePopover = () => setPopover(null);
  
  const handleMoreInfo = () => {
      if (popover) {
        onKeywordClick(popover.lessonId);
        closePopover();
      }
  };

  const renderContent = (text: string): React.ReactNode => {
    if (!text) return text;

    // Sort keywords by length descending to match longer phrases first
    const keywords = Array.from(KEYWORD_MAP.keys()).sort((a, b) => b.length - a.length);
    const keywordsRegex = `\\b(${keywords.join('|')})\\b`;
    const boldRegex = `\\*\\*(.*?)\\*\\*`;
    const combinedRegex = new RegExp(`(${boldRegex})|(${keywordsRegex})`, 'gi');

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    const matches = Array.from(text.matchAll(combinedRegex));

    matches.forEach((match, i) => {
      // Deconstruct the match array
      const fullMatch = match[0];
      const isBold = match[1] !== undefined;
      const boldContent = match[2];
      const keyword = match[3];
      const index = match.index!;

      // Add text before the match
      if (index > lastIndex) {
        nodes.push(text.substring(lastIndex, index));
      }

      if (isBold) {
        // It's a bold match, recursively render content inside
        nodes.push(<strong key={`b-${i}`}>{renderContent(boldContent)}</strong>);
      } else if (keyword) {
        // It's a keyword match
        const keywordInfo = KEYWORD_MAP.get(keyword.toLowerCase());
        if (keywordInfo) {
          nodes.push(
            <span
              key={`k-${i}`}
              className="text-indigo-400 font-semibold cursor-pointer hover:underline"
              onClick={(e) => handleKeywordClick(e, keywordInfo.lessonId, keywordInfo.summary)}
            >
              {keyword}
            </span>
          );
        } else {
            nodes.push(keyword); // Fallback
        }
      }
      
      lastIndex = index + fullMatch.length;
    });

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      nodes.push(text.substring(lastIndex));
    }

    return nodes;
  };

  return (
    <span className="whitespace-pre-wrap font-sans leading-relaxed">
      {renderContent(children)}
      {popover && (
        <KeywordPopover
          summary={popover.summary}
          onMoreInfoClick={handleMoreInfo}
          position={popover.position}
          onClose={closePopover}
        />
      )}
    </span>
  );
};

export default InteractiveText;
