import React, { memo } from 'react';
import type { ChampionLite } from '../../types';
import { getMetaChampions } from '../../lib/metaChampions';
import { motion } from 'framer-motion';
import { Tooltip } from '../common/Tooltip';

interface ChampionQuickPickProps {
  champions: ChampionLite[];
  onSelect: (champion: ChampionLite) => void;
  onQuickLook: (champion: ChampionLite) => void;
  onDragStart: (event: React.DragEvent, champion: ChampionLite) => void;
}

/**
 * Quick Pick component showing top 20 meta champions
 * Provides quick access to the most commonly selected champions
 */
export const ChampionQuickPick = memo(({ champions, onSelect, onQuickLook, onDragStart }: ChampionQuickPickProps) => {
  const metaChampions = getMetaChampions(champions);

  if (metaChampions.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2">
          <span className="w-2 h-2 bg-[hsl(var(--accent))] rounded-full animate-pulse" />
          Quick Pick - Meta Champions
        </h3>
        <span className="text-xs text-[hsl(var(--text-secondary))]">{metaChampions.length} champions</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
        {metaChampions.map(champ => (
          <Tooltip key={champ.id} content={champ.name}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(champ)}
              onContextMenu={e => {
                e.preventDefault();
                onQuickLook(champ);
              }}
              draggable="true"
              onDragStart={e => onDragStart(e, champ)}
              aria-label={`Quick pick ${champ.name}`}
              className="w-full aspect-square min-h-[48px] bg-[hsl(var(--surface-inset))] border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent hover:border-accent transition-colors"
            >
              <img
                src={champ.image}
                alt={champ.name}
                className="w-full h-full object-cover rounded-md"
                loading="lazy"
              />
            </motion.button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
});

ChampionQuickPick.displayName = 'ChampionQuickPick';
