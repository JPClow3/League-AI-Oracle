import React, { useState, useRef, useCallback } from 'react';
import { Champion, ContextMenuItem, ContextMenuItemAction } from '../../types';
import ChampionPopover from './ChampionPopover';
import ContextMenu from './ContextMenu';
import { useProfile } from '../../contexts/ProfileContext';
import { Icon } from './Icon';

interface ChampionIconProps {
  champion: Champion | null;
  version: string;
  onClick?: (champion: Champion) => void;
  className?: string;
  isClickable?: boolean;
  onContextMenuAction?: (action: ContextMenuItemAction, championId: string) => void;
  showName?: boolean;
}

export const ChampionIcon: React.FC<ChampionIconProps> = React.memo(({ 
    champion, 
    version, 
    onClick, 
    className = 'w-16 h-16', 
    isClickable = true,
    onContextMenuAction,
    showName = true
}) => {
  const { activeProfile, toggleChampionInPool } = useProfile();

  const [popover, setPopover] = useState<{ visible: boolean; position: { top: number; left: number } }>({ visible: false, position: { top: 0, left: 0 } });
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; position: { top: number; left: number } }>({ visible: false, position: { top: 0, left: 0 } });
  
  const iconRef = useRef<HTMLDivElement>(null);
  const popoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    popoverTimeoutRef.current = window.setTimeout(() => {
        if (iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            setPopover({ visible: true, position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX } });
        }
    }, 500); // 0.5 second delay
  };

  const handleMouseLeave = () => {
    if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    setPopover(prev => ({ ...prev, visible: false }));
  };
  
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        className={`relative group ${className} ${isClickable ? 'cursor-pointer' : ''} transition-transform duration-200 hover:scale-110`}
        title={champion.name}
      >
        <img
          src={imageUrl}
          alt={champion.name}
          className="w-full h-full object-cover border-2 border-slate-400 dark:border-slate-600 group-hover:border-indigo-500 transition-all duration-200 rounded-md"
        />
        {showName && (
          <div className="absolute bottom-0 w-full bg-black bg-opacity-70 text-white text-xs text-center p-0.5 rounded-b-md truncate">
            {champion.name}
          </div>
        )}
      </div>

      {popover.visible && champion && (
          <ChampionPopover champion={champion} position={popover.position} />
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