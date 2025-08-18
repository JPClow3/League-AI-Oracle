import React, { useMemo, useEffect } from 'react';
import type { TeamState, TeamSide } from '../../types';
import { PickSlot } from './PickSlot';
import { BanSlot } from './BanSlot';
import { TeamAnalytics } from './TeamAnalytics';
import { ROLES, DATA_DRAGON_SPLASH_URL_BASE } from '../../constants';

interface TeamPanelProps {
  side: TeamSide;
  state: TeamState;
  onSlotClick: (team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  activeSlot?: { type: 'pick' | 'ban'; index: number } | null;
  onTeamUpdate?: (isUnbalanced: boolean) => void;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({ side, state, onSlotClick, activeSlot, onTeamUpdate }) => {
  const isBlue = side === 'blue';
  const borderColor = isBlue ? 'border-blue-500/30' : 'border-red-500/30';
  const textColor = isBlue ? 'text-blue-300' : 'text-red-300';
  const teamName = isBlue ? 'Blue Team' : 'Red Team';

  const isUnbalanced = useMemo(() => {
    const pickedChampions = state.picks.map(p => p.champion).filter(c => c);
    if (pickedChampions.length < 4) return false;
    const damage = pickedChampions.reduce((acc, champ) => {
        if (champ!.damageType === 'AD') acc.ad++;
        else if (champ!.damageType === 'AP') acc.ap++;
        return acc;
    }, { ad: 0, ap: 0 });
    return (damage.ad >= 4 && damage.ap === 0) || (damage.ap >= 4 && damage.ad === 0);
  }, [state.picks]);
  
  const backgroundChampion = useMemo(() => state.picks.find(p => p.champion)?.champion, [state.picks]);
  const splashUrl = backgroundChampion ? `${DATA_DRAGON_SPLASH_URL_BASE}${backgroundChampion.id}_0.jpg` : '';
  
  useEffect(() => {
    if (onTeamUpdate) {
        onTeamUpdate(isUnbalanced);
    }
  }, [isUnbalanced, onTeamUpdate]);

  return (
    <div className={`relative bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border ${borderColor} overflow-hidden shadow-[inset_0_1px_1px_#ffffff0d]`}>
       <div 
        style={{ backgroundImage: `url(${splashUrl})` }}
        className="absolute inset-0 bg-cover bg-center opacity-10 transition-all duration-500 ease-in-out transform scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/70 to-transparent"></div>

      <div className="relative z-10">
        <h2 className={`text-2xl font-bold mb-4 text-center ${textColor}`}>{teamName}</h2>
        
        <div className="space-y-4">
          <TeamAnalytics picks={state.picks} />
          
          {/* Picks Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-400 mb-2 text-center">Picks</h3>
            <div className="space-y-2">
              {state.picks.map((pick, index) => (
                <PickSlot 
                  key={index} 
                  champion={pick.champion}
                  role={ROLES[index]}
                  onClick={() => onSlotClick(side, 'pick', index)}
                  isActive={activeSlot?.type === 'pick' && activeSlot?.index === index}
                />
              ))}
            </div>
          </div>

          {/* Bans Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-400 mb-2 text-center">Bans</h3>
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {state.bans.map((ban, index) => (
                <BanSlot 
                  key={index} 
                  champion={ban.champion} 
                  onClick={() => onSlotClick(side, 'ban', index)}
                  isActive={activeSlot?.type === 'ban' && activeSlot?.index === index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};