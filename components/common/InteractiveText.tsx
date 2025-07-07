import React, { useState, useRef, useCallback } from 'react';
import { KEYWORD_MAP } from '../../data/keywordMapping';
import KeywordPopover from './KeywordPopover';
import { useFloatingElementPosition } from '../../hooks/useFloatingElementPosition';

interface InteractiveTextProps {
  children: string;
  onKeywordClick: (lessonId: string) => void;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({ children, onKeywordClick }) => {
  const [activeKeyword, setActiveKeyword] = useState<{ lessonId: string; summary: string } | null>(null);
  
  // A ref that can be dynamically pointed to the currently active keyword span
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const { position, isVisible, show, hide } = useFloatingElementPosition(triggerRef, popoverRef);

  const handleKeywordClick = (event: React.MouseEvent<HTMLSpanElement>, lessonId: string, summary: string) => {
    event.stopPropagation();
    
    if (activeKeyword?.lessonId === lessonId && isVisible) {
        hide();
        setActiveKeyword(null);
        return;
    }

    // Set the current span as the trigger for the popover hook
    triggerRef.current = event.currentTarget;
    setActiveKeyword({ lessonId, summary });
    // This will cause useLayoutEffect in the hook to recalculate position based on the new triggerRef
    show(); 
  };
  
  const handleMoreInfo = () => {
      if (activeKeyword) {
        onKeywordClick(activeKeyword.lessonId);
        hide();
        setActiveKeyword(null);
      }
  };

  const renderContent = (text: string): React.ReactNode[] => {
    if (!text) return [text];

    const keywords = Array.from(KEYWORD_MAP.keys()).sort((a, b) => b.length - a.length);
    const keywordsRegex = `\\b(${keywords.join('|')})\\b`;
    const boldRegex = `\\*\\*(.*?)\\*\\*`;
    const combinedRegex = new RegExp(`(${boldRegex})|(${keywordsRegex})`, 'gi');

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    const matches = Array.from(text.matchAll(combinedRegex));

    matches.forEach((match, i) => {
      const fullMatch = match[0];
      const isBold = match[1] !== undefined;
      const boldContent = match[2];
      const keyword = match[3];
      const index = match.index!;

      if (index > lastIndex) {
        nodes.push(text.substring(lastIndex, index));
      }

      if (isBold) {
        nodes.push(<strong key={`b-${i}`}>{renderContent(boldContent)}</strong>);
      } else if (keyword) {
        const keywordInfo = KEYWORD_MAP.get(keyword.toLowerCase());
        if (keywordInfo) {
          nodes.push(
            <span
              key={`k-${i}`}
              className="text-indigo-400 font-semibold cursor-pointer hover:underline"
              data-keyword="true"
              onClick={(e) => handleKeywordClick(e, keywordInfo.lessonId, keywordInfo.summary)}
            >
              {keyword}
            </span>
          );
        } else {
            nodes.push(keyword);
        }
      }
      
      lastIndex = index + fullMatch.length;
    });

    if (lastIndex < text.length) {
      nodes.push(text.substring(lastIndex));
    }

    return nodes;
  };

  return (
    <span className="whitespace-pre-wrap font-sans leading-relaxed">
      {renderContent(children)}
      {isVisible && activeKeyword && (
        <KeywordPopover
          ref={popoverRef}
          summary={activeKeyword.summary}
          onMoreInfoClick={handleMoreInfo}
          onClose={() => { hide(); setActiveKeyword(null); }}
          style={{ top: position.top, left: position.left }}
        />
      )}
    </span>
  );
};

export default InteractiveText;
