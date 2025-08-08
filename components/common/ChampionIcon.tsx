import React, { useState, useRef, useCallback } from 'react';
import { Champion, ContextMenuItem, ContextMenuItemAction } from '../../types';
import ChampionPopover from './ChampionPopover';
import ContextMenu from './ContextMenu';
import { useProfile } from '../../contexts/ProfileContext';
import { Icon } from './Icon';
import { useFloatingElementPosition } from '../../hooks/useFloatingElementPosition';

interface ChampionIconProps {
  champion: Champion | null;
  version: string;
  onClick?: (champion: Champion) => void;
  className?: string;
  isClickable?: boolean;
  onContextMenuAction?: (action: ContextMenuItemAction, championId: string) => void;
  showName?: boolean;
  isHighlighted?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>, champion: Champion) => void;
}

export const ChampionIcon: React.FC<ChampionIconProps> = React.memo(({ 
    champion, 
    version, 
    onClick, 
    className = 'w-16 h-16', 
    isClickable = true,
    onContextMenuAction,
    showName = true,
    isHighlighted = false,
    onDragStart,
}) => {
  const { activeProfile, toggleChampionInPool } = useProfile();

  const iconRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const { position: popoverPosition, isVisible: isPopoverVisible, show: showPopover, hide: hidePopover } = useFloatingElementPosition(iconRef, popoverRef);

  const [contextMenu, setContextMenu] = useState<{ visible: boolean; position: { top: number; left: number } }>({ visible: false, position: { top: 0, left: 0 } });
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if(!champion) return;
    setContextMenu({ visible: true, position: { top: e.clientY, left: e.clientX } });
  };
  
  const closeContextMenu = useCallback(() => {
      setContextMenu({ visible: false, position: { top: 0, left: 0 } });
  }, []);
  
  const handleContextMenuSelect = (action: ContextMenuItemAction) => {
    if (champion) {
      if (action === 'ADD_TO_POOL' || action === 'REMOVE_FROM_POOL') {
          toggleChampionInPool(champion.id);
      }
      onContextMenuAction?.(action, champion.id);
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      if (onDragStart && champion) {
          onDragStart(e, champion);
      }
  }

  if (!champion) return <div className={`bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />;

  const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`;
  
  const contextMenuItems: ContextMenuItem[] = activeProfile?.settings.championPool.includes(champion.id)
    ? [
        { label: 'Remove from Pool', action: 'REMOVE_FROM_POOL', icon: <Icon name="x" className="w-4 h-4 text-rose-500" /> },
      ]
    : [
        { label: 'Add to Pool', action: 'ADD_TO_POOL', icon: <Icon name="plus" className="w-4 h-4 text-teal-500" /> },
      ];

  return (
    <>
      <div
        ref={iconRef}
        onClick={isClickable && onClick ? () => onClick(champion) : undefined}
        onMouseEnter={showPopover}
        onMouseLeave={hidePopover}
        onContextMenu={handleContextMenu}
        draggable={!!onDragStart}
        onDragStart={handleDragStart}
        className={`relative group ${className} ${isClickable ? 'cursor-pointer' : ''} ${onDragStart ? 'cursor-grab' : ''} transition-transform duration-200 hover:scale-110`}
        title={champion.name}
      >
        <img
          src={imageUrl}
          alt={champion.name}
          className={`w-full h-full object-cover border-2 transition-all duration-200 rounded-md 
            ${isHighlighted ? 'border-teal-400 ring-2 ring-teal-400' : 'border-slate-400 dark:border-slate-600 group-hover:border-indigo-500'}
        `}
          loading="lazy"
          decoding="async"
          width="120"
          height="120"
        />
        {showName && (
          <div className="absolute bottom-0 w-full bg-black bg-opacity-70 text-white text-xs text-center p-0.5 rounded-b-md truncate">
            {champion.name}
          </div>
        )}
        {isHighlighted && (
          <div className="absolute inset-0 bg-teal-500/30 rounded-md pointer-events-none animate-pulse" style={{ animationDuration: '2s' }} />
        )}
      </div>

      {isPopoverVisible && champion && (
          <ChampionPopover
              ref={popoverRef}
              champion={champion}
              style={{ top: popoverPosition.top, left: popoverPosition.left }}
          />
      )}
      
      {contextMenu.visible && champion && (
          <ContextMenu
              items={contextMenuItems}
              position={contextMenu.position}
              onClose={closeContextMenu}
              onSelect={handleContextMenuSelect}
          />
      )}
    </>
  );
});