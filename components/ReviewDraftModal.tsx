
import React from 'react';
import { ArchivedDraft, ReviewDraftModalProps, ChampionSlot, DDragonChampionInfo, MvpData, DDragonItemsData } from '../types';
import { Modal } from './Modal';
import { RecommendationDisplay } from './RecommendationDisplay';
import { getChampionImageURL } from '../services/ddragonService';
import { BanIcon, SwordIcon, WarningIcon, StrategyTomeIcon, TrophyIcon } from './icons/index'; 


export const ReviewDraftModal: React.FC<ReviewDraftModalProps> = ({
  isOpen,
  onClose,
  archivedDraft,
  ddragonVersion,
  allChampionsData,
  allItemsData, 
}) => {
  if (!isOpen || !archivedDraft) return null;

  const getChampionByKeyOrName = (identifier: string): DDragonChampionInfo | undefined => {
    if (!allChampionsData || !identifier) return undefined;
    const lowerIdentifier = identifier.toLowerCase();
    return allChampionsData.find(c => c.id.toLowerCase() === lowerIdentifier) || 
           allChampionsData.find(c => c.name.toLowerCase() === lowerIdentifier);
  };

  const renderChampionList = (champions: ChampionSlot[] | string[], type: 'pick' | 'ban') => {
    if (!champions || champions.length === 0) {
      return <p className="text-xs text-slate-500 italic">No {type}s.</p>;
    }
    return (
      <div className={`grid gap-2 ${type === 'pick' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'}`}>
        {champions.map((item, index) => {
          const isPick = typeof item !== 'string';
          const championName = isPick ? item.champion : item;
          const role = isPick ? item.role : undefined;
          const ddragonKey = isPick ? item.ddragonKey : undefined;
          const championInfo = getChampionByKeyOrName(ddragonKey || championName);

          return (
            <div key={`${championName}-${index}`} className="bg-slate-700 p-1.5 rounded-xl text-center shadow">
              {championInfo && ddragonVersion ? (
                <img
                  src={getChampionImageURL(ddragonVersion, championInfo.id)}
                  alt={championName}
                  title={role ? `${championName} (${role})` : championName}
                  className="w-10 h-10 rounded-lg mx-auto mb-1 border-2 border-slate-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-600 mx-auto mb-1 flex items-center justify-center border-2 border-slate-500">
                  <BanIcon className="w-6 h-6 text-slate-400" /> 
                </div>
              )}
              <p className="text-xs text-slate-200 truncate" title={championName}>{championName}</p>
              {role && <p className="text-[10px] text-sky-400">{role}</p>}
            </div>
          );
        })}
      </div>
    );
  };
  
  const formattedTimestamp = new Date(archivedDraft.timestamp).toLocaleString();

  const renderMvpSection = (mvpData: MvpData | null | undefined) => {
    if (!mvpData || !mvpData.championName) return null;
    const mvpChampionInfo = getChampionByKeyOrName(mvpData.ddragonKey || mvpData.championName);
    return (
        <div className="lol-panel p-3 sm:p-4 mt-4 bg-gradient-to-br from-yellow-700/40 via-yellow-800/30 to-amber-700/40 border border-yellow-500/60">
            <h3 className="text-md font-semibold text-yellow-300 mb-2 flex items-center">
                <TrophyIcon className="w-5 h-5 mr-2 text-yellow-400" />
                Oracle's MVP
            </h3>
            <div className="flex items-center space-x-3">
                {mvpChampionInfo && ddragonVersion && (
                <img
                    src={getChampionImageURL(ddragonVersion, mvpChampionInfo.id)}
                    alt={mvpData.championName}
                    className="w-12 h-12 rounded-lg border-2 border-yellow-400"
                />
                )}
                <div>
                    <p className="text-sm font-medium text-yellow-200">{mvpData.championName}</p>
                    <p className="text-xs text-yellow-100">{mvpData.reason}</p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reviewing Draft: ${formattedTimestamp}`}
      titleIcon={<StrategyTomeIcon className="w-5 h-5 text-sky-400" />}
      size="xl"
      modalId={`review-draft-modal-${archivedDraft.id}`}
      footerContent={<button onClick={onClose} className="lol-button lol-button-secondary">Close</button>}
    >
      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="lol-panel p-3 sm:p-4">
            <h3 className="text-lg font-semibold text-sky-300 mb-3 flex items-center">
              <SwordIcon className="w-5 h-5 mr-2 text-sky-400" /> Your Team
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1.5">Picks:</h4>
                {renderChampionList(archivedDraft.yourTeamPicks, 'pick')}
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1.5">Bans:</h4>
                {renderChampionList(archivedDraft.yourTeamBans, 'ban')}
              </div>
            </div>
          </div>

          <div className="lol-panel p-3 sm:p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
              <WarningIcon className="w-5 h-5 mr-2 text-purple-400" /> Enemy Team
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1.5">Picks:</h4>
                {renderChampionList(archivedDraft.enemyTeamPicks, 'pick')}
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1.5">Bans:</h4>
                {renderChampionList(archivedDraft.enemyTeamBans, 'ban')}
              </div>
            </div>
          </div>
        </div>
        
        {(archivedDraft.preferredRoles || archivedDraft.championPool) && (
          <div className="lol-panel p-3 sm:p-4">
             <h3 className="text-md font-semibold text-slate-300 mb-2">Preferences for this Draft:</h3>
             <p className="text-xs text-slate-400">
                <span className="font-medium">Preferred Roles:</span> {(archivedDraft.preferredRoles || []).join(', ') || 'None specified'}
             </p>
             <div className="text-xs text-slate-400 mt-1">
                <span className="font-medium">Champion Pool:</span>
                {Object.entries(archivedDraft.championPool || {}).map(([role, champs]) => 
                    champs.length > 0 ? <span key={role} className="block ml-2">{role}: {champs.join(', ')}</span> : null
                ).filter(Boolean).length > 0 ? '' : ' None defined'}
             </div>
          </div>
        )}

        {renderMvpSection(archivedDraft.mvpAnalysis)}

        {archivedDraft.analysis ? (
          <RecommendationDisplay
            analysis={archivedDraft.analysis}
            title="Oracle's Full Analysis"
            ddragonVersion={ddragonVersion}
            allChampionsData={allChampionsData}
            allItemsData={allItemsData}
          />
        ) : (
          <p className="text-center text-slate-400 py-4">No full analysis was recorded for this draft.</p>
        )}
      </div>
    </Modal>
  );
};