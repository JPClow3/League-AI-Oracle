
import React from 'react';
import { ChampionSlot, DDragonChampionInfo, Team, RoleSwapPayload, TeamDisplayProps, ChampionStaticInfo } from '../types'; 
import { LOL_ROLES, MAX_BANS_PER_TEAM } from '../constants';
import {
  BanIcon, 
  IconProps,
  ArrowsRightLeftIcon,
  TopLaneIcon, 
  JungleLaneIcon, 
  MidLaneIcon, 
  ADCCarryIcon, 
  SupportLaneIcon, 
  ShatteredGlassIcon, 
  WarningIcon,
  TargetIcon, 
  GoldenLaurelIcon, // Added for Draft Health
} from './icons/index';
import { getChampionImageURL } from '../services/ddragonService';
import { MetaTierBadge } from './MetaTierBadge'; 

const RoleIconComponent: React.FC<{ role: string, className?: string }> = ({ role, className = "w-6 h-6" }) => { // Increased default size
  const iconSizeClass = className;

  switch (role) {
    case 'Top':
      return <TopLaneIcon className={iconSizeClass} />;
    case 'Jungle':
      return <JungleLaneIcon className={iconSizeClass} />;
    case 'Mid':
      return <MidLaneIcon className={iconSizeClass} />;
    case 'ADC':
      return <ADCCarryIcon className={iconSizeClass} />;
    case 'Support':
      return <SupportLaneIcon className={iconSizeClass} />;
    default:
      return <div className={`w-6 h-6 flex items-center justify-center text-sm font-bold text-white bg-slate-600 rounded-sm ${iconSizeClass}`}>{role.substring(0,1)}</div>; // Increased default size
  }
};
const RoleIcon = React.memo(RoleIconComponent);

const TeamDisplayComponent: React.FC<TeamDisplayProps> = ({
  title,
  teamPicks,
  teamBans,
  icon, 
  ddragonVersion,
  allChampionsData,
  activeRoleForPick,
  isTeamTurnForPick,
  roleSwapState,
  onInitiateRoleSwap,
  onCompleteRoleSwap,
  onCancelRoleSwap,
  draftPhaseForDisplay, 
  anyLoading,
  isTeamTurnForBan,
  activeBanSlotIndex,
  mode = 'draft', 
  onLabPickSlotClick,
  onLabBanSlotClick,
  onLabFilledPickClick,
  onLabFilledBanClick,
  onLabChampionDropOnPick,
  onLabChampionDropOnBan,
  getChampionStaticInfoById,
  isPuzzleRoleActive,      
  onPuzzleChampionSlotClick, 
  isThreatAssessmentModeActive, 
  targetedThreatChampionName,   
  onSelectTargetThreat,
  analysisSentiment, // New prop for Draft Health
}) => {

  const [dragOverState, setDragOverState] = React.useState<{type: 'pick' | 'ban', team: Team, id: string | number, active: boolean} | null>(null);

  const getChampionDDragonInfo = React.useCallback((identifier: string): DDragonChampionInfo | undefined => {
    if (!allChampionsData || !identifier) return undefined;
    const lowerIdentifier = identifier.toLowerCase();
    return allChampionsData.find(c => c.id.toLowerCase() === lowerIdentifier) ||
           allChampionsData.find(c => c.name.toLowerCase() === lowerIdentifier);
  }, [allChampionsData]);

  const currentTeamType = title === "Your Forces" || title === "Your Team" ? Team.YourTeam : Team.EnemyTeam;
  const isEnemyTeam = currentTeamType === Team.EnemyTeam;
  
  const displayIcon = isEnemyTeam ? <ShatteredGlassIcon className="w-8 h-8 text-purple-400" /> : React.cloneElement(icon, { className: `w-8 h-8 text-sky-400` }); // Increased icon size


  const handlePickInteraction = React.useCallback((championName: string, role: string, championSlot?: ChampionSlot, championKey?: string) => {
    if (anyLoading && mode === 'draft') return; 

    if (isThreatAssessmentModeActive && isEnemyTeam && onSelectTargetThreat && championName) {
        onSelectTargetThreat(championName, championKey);
        return;
    }

    if (mode === 'lab' && onLabFilledPickClick) {
      onLabFilledPickClick(currentTeamType, role, championName);
      return;
    }
    if (mode === 'puzzle' && onPuzzleChampionSlotClick && championSlot && currentTeamType === Team.YourTeam) {
      onPuzzleChampionSlotClick(championSlot);
      return;
    }

    if (mode === 'draft' && roleSwapState) {
      if (roleSwapState.team === currentTeamType) {
        if (roleSwapState.originChampionName === championName && roleSwapState.originRole === role) {
          onCancelRoleSwap();
        } else {
          onCompleteRoleSwap({ team: currentTeamType, championName, role });
        }
      } else {
        onCancelRoleSwap(); // Cancel if trying to swap with other team's champ
      }
    }
  }, [mode, onLabFilledPickClick, roleSwapState, onCancelRoleSwap, onCompleteRoleSwap, currentTeamType, anyLoading, onPuzzleChampionSlotClick, isThreatAssessmentModeActive, isEnemyTeam, onSelectTargetThreat]);

  const handleSwapButtonClick = React.useCallback((e: React.MouseEvent, championName: string, role: string) => {
    e.stopPropagation();
    if (anyLoading && mode === 'draft') return;

    if (mode === 'draft') {
        if (roleSwapState && roleSwapState.team === currentTeamType && roleSwapState.originChampionName === championName && roleSwapState.originRole === role) {
            onCancelRoleSwap();
        } else {
            onInitiateRoleSwap({ team: currentTeamType, championName, role });
        }
    }
  }, [mode, roleSwapState, onCancelRoleSwap, onInitiateRoleSwap, currentTeamType, anyLoading]);


  const handleDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
  }, []);

  const handleDragEnter = React.useCallback((type: 'pick' | 'ban', id: string | number) => {
    setDragOverState({ type, team: currentTeamType, id, active: true });
  }, [currentTeamType]);

  const handleDragLeave = React.useCallback(() => {
    setDragOverState(null);
  }, []);

  const handleDropOnPick = React.useCallback((event: React.DragEvent<HTMLDivElement>, role: string) => {
    event.preventDefault();
    setDragOverState(null);
    if (onLabChampionDropOnPick) {
      try {
        const championDataString = event.dataTransfer.getData("text/plain");
        if (championDataString) {
          const champion = JSON.parse(championDataString) as DDragonChampionInfo;
          onLabChampionDropOnPick(currentTeamType, role, champion);
        }
      } catch (e) {
        console.error("Error parsing dropped champion data:", e);
      }
    }
  }, [onLabChampionDropOnPick, currentTeamType]);
  
  const handleDropOnBan = React.useCallback((event: React.DragEvent<HTMLDivElement>, banIndex: number) => {
    event.preventDefault();
    setDragOverState(null);
    if (onLabChampionDropOnBan) {
      try {
        const championDataString = event.dataTransfer.getData("text/plain");
        if (championDataString) {
          const champion = JSON.parse(championDataString) as DDragonChampionInfo;
          onLabChampionDropOnBan(currentTeamType, banIndex, champion);
        }
      } catch (e) {
        console.error("Error parsing dropped champion data:", e);
      }
    }
  }, [onLabChampionDropOnBan, currentTeamType]);

  const isSlotDragOverActive = React.useCallback((type: 'pick' | 'ban', id: string | number) => {
    return dragOverState?.type === type && dragOverState?.team === currentTeamType && dragOverState?.id === id && dragOverState?.active;
  }, [dragOverState, currentTeamType]);

  const renderDraftHealthIcon = () => {
    if (isEnemyTeam || !analysisSentiment || analysisSentiment === 'neutral') return null;
    if (analysisSentiment === 'positive') {
      return <GoldenLaurelIcon className="w-6 h-6 ml-2.5 draft-health-icon draft-health-positive" title="Favorable Draft" />; // Increased size
    }
    if (analysisSentiment === 'critical_flaw') {
      return <WarningIcon className="w-6 h-6 ml-2.5 draft-health-icon draft-health-flaw" title="Critical Draft Flaw Detected" />; // Increased size
    }
    return null;
  };


  return (
    <div className="lol-panel p-5 sm:p-6 h-full flex flex-col"> {/* Increased padding */}
      <h3 className={`text-2xl sm:text-3xl font-semibold mb-5 text-center flex items-center justify-center ${isEnemyTeam ? 'text-purple-300' : 'text-slate-100'}`}> {/* Increased font size & mb */}
        {displayIcon}
        <span className="ml-2.5">{title}</span> {/* Increased ml */}
        {renderDraftHealthIcon()}
      </h3>

      <div className="mb-5"> {/* Increased mb */}
        <h4 className={`text-base font-semibold ${isEnemyTeam ? 'text-purple-400' : 'text-slate-300'} mb-2.5 flex items-center`}> {/* Increased font size & mb */}
          <BanIcon className={`w-5 h-5 mr-2 ${isEnemyTeam ? "text-purple-400" : "text-red-400"}`} /> {/* Increased icon size */}
          Bans:
        </h4>
        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-2"> {/* Increased gap */}
          {Array.from({ length: MAX_BANS_PER_TEAM }).map((_, index) => {
            const banIdentifier = teamBans[index];
            const championInfo = banIdentifier ? getChampionDDragonInfo(banIdentifier) : undefined;
            const isEmpty = !banIdentifier;
            const championName = championInfo ? championInfo.name : (banIdentifier || 'Empty Ban');
            const isCurrentActiveBanSlot = mode === 'draft' && isTeamTurnForBan && activeBanSlotIndex === index && isEmpty && !roleSwapState;
            const isPuzzleBan = mode === 'puzzle';
            const isDeemphasizedForThreat = isThreatAssessmentModeActive && isEnemyTeam;


            return (
              <div
                key={`${title}-ban-${index}`}
                className={`w-12 h-12 sm:w-14 sm:h-14 aspect-square rounded-lg text-center champion-card flex items-center justify-center relative overflow-hidden animate-popIn
                            ${isEmpty ? 'bg-slate-800 border-2 border-dashed border-slate-700 opacity-70 hover:border-slate-600 hover:bg-slate-700/60' :
                                       'bg-slate-700 shadow-md border border-slate-600'}
                            ${isCurrentActiveBanSlot ? 'active-pick-slot-highlight' : ''}
                            ${mode === 'lab' && isEmpty && onLabBanSlotClick && 'cursor-pointer'}
                            ${mode === 'lab' && !isEmpty && onLabFilledBanClick && 'cursor-pointer'}
                            ${isSlotDragOverActive('ban', index) ? 'drag-over-active' : ''}
                            ${isPuzzleBan ? 'opacity-80 cursor-default' : ''}
                            ${isDeemphasizedForThreat ? 'opacity-50 filter grayscale-[50%]' : ''}
                            `}
                aria-label={`Ban ${index + 1}: ${championName}`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  if (mode === 'lab' && isEmpty && onLabBanSlotClick) onLabBanSlotClick(currentTeamType, index);
                  if (mode === 'lab' && !isEmpty && onLabFilledBanClick) onLabFilledBanClick(currentTeamType, index, championName);
                }}
                onDragOver={mode === 'lab' && isEmpty && onLabChampionDropOnBan ? handleDragOver : undefined}
                onDrop={mode === 'lab' && isEmpty && onLabChampionDropOnBan ? (e) => handleDropOnBan(e, index) : undefined}
                onDragEnter={mode === 'lab' && isEmpty && onLabChampionDropOnBan ? () => handleDragEnter('ban', index) : undefined}
                onDragLeave={mode === 'lab' && isEmpty && onLabChampionDropOnBan ? handleDragLeave : undefined}
              >
                {championInfo && ddragonVersion ? (
                  <>
                    <img
                        src={getChampionImageURL(ddragonVersion, championInfo.id)}
                        alt={championName}
                        className="absolute inset-0 w-full h-full object-cover banned-champion-img"
                        loading="lazy" 
                    />
                    <div className="absolute inset-0 banned-champion-img-overlay"></div>
                    <BanIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white absolute inset-0 m-auto opacity-80 z-20 p-2 sm:p-2.5" /> {/* Adjusted BanIcon size and padding */}
                  </>
                ) : banIdentifier ? (
                   <>
                    <span className={`font-medium text-xs sm:text-sm truncate ${isEnemyTeam ? "text-purple-300" : "text-red-300"} z-10 relative`}>{championName}</span> {/* Increased font size */}
                    <div className="absolute inset-0 bg-black/50"></div>
                    <BanIcon className="w-3/4 h-3/4 text-white absolute inset-0 m-auto opacity-60 z-20 p-2 sm:p-2.5" /> {/* Adjusted BanIcon padding */}
                   </>
                ) : (
                  <BanIcon className="w-7 h-7 text-slate-600" /> /* Increased empty slot icon size */
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-3.5 flex-grow"> {/* Increased spacing */}
        <h4 className={`text-base font-semibold ${isEnemyTeam ? 'text-purple-400' : 'text-slate-300'} mb-2.5`}>Picks:</h4> {/* Increased font size & mb */}
        {LOL_ROLES.map((role, index) => {
          const pick = teamPicks.find(p => p.role === role);
          const championDDragonInfo = pick ? getChampionDDragonInfo(pick.ddragonKey || pick.champion) : undefined;
          const championStaticInfoData = pick ? getChampionStaticInfoById(championDDragonInfo?.id || pick.champion) : undefined;
          const isEmpty = !pick || !pick.champion; 
          const championName = championDDragonInfo ? championDDragonInfo.name : (pick?.champion || 'Empty');
          const isCurrentActivePickSlot = mode === 'draft' && isTeamTurnForPick && activeRoleForPick === role && isEmpty;
          
          const isPuzzleWeakLinkIdentifySlot = mode === 'puzzle' && 
                                               currentTeamType === Team.YourTeam && 
                                               !isEmpty && 
                                               isPuzzleRoleActive; 

          let slotSpecificClass = '';
          let isSwapOrigin = false;
          let isSwapTargetCandidate = false;

          if (mode === 'draft' && roleSwapState && roleSwapState.team === currentTeamType) {
            if (pick && roleSwapState.originChampionName === pick.champion && roleSwapState.originRole === pick.role) {
              isSwapOrigin = true;
              slotSpecificClass = 'border-yellow-400 active-pick-slot-highlight';
            } else if (pick && !isEmpty) {
              isSwapTargetCandidate = true;
              slotSpecificClass = 'border-sky-500 hover:border-sky-400';
            }
          }
          
          const canClickForPuzzle = mode === 'puzzle' && onPuzzleChampionSlotClick && pick && !isEmpty && currentTeamType === Team.YourTeam;
          
          let isTargetedThreat = false;
          let isDeemphasizedForThreat = false;
          if (isThreatAssessmentModeActive && isEnemyTeam && !isEmpty) {
            if (targetedThreatChampionName && (pick?.champion === targetedThreatChampionName || pick?.ddragonKey === targetedThreatChampionName)) {
                isTargetedThreat = true;
                slotSpecificClass += ' border-4 border-red-500 shadow-red-500/50 shadow-lg';
            } else {
                isDeemphasizedForThreat = true;
                slotSpecificClass += ' opacity-50 filter grayscale-[70%]';
            }
          }
          if (isThreatAssessmentModeActive && isEnemyTeam && isEmpty) {
            isDeemphasizedForThreat = true; // Also deemphasize empty slots on enemy team during threat assessment
            slotSpecificClass += ' opacity-40 filter grayscale-[50%]';
          }


          return (
            <div
              key={`${title}-role-${index}`}
              className={`
                rounded-2xl champion-card relative overflow-hidden animate-popIn h-20 sm:h-24 md:h-28 group {/* Increased height */}
                ${isEmpty ? 'bg-slate-800 border-2 border-dashed border-slate-700 opacity-70 hover:border-slate-600 hover:bg-slate-700/60' :
                           'bg-slate-900 shadow-md border border-slate-700'}
                ${(isCurrentActivePickSlot && !roleSwapState && !isTargetedThreat) ? 'active-pick-slot-highlight' : ''}
                ${slotSpecificClass}
                ${mode === 'draft' && roleSwapState && pick && !isSwapOrigin && isSwapTargetCandidate ? 'cursor-pointer' : ''}
                ${mode === 'draft' && roleSwapState && isEmpty ? 'opacity-50 cursor-not-allowed' : ''}
                ${mode === 'lab' && isEmpty && onLabPickSlotClick && !isThreatAssessmentModeActive && 'cursor-pointer'}
                ${mode === 'lab' && !isEmpty && (onLabFilledPickClick || (isThreatAssessmentModeActive && isEnemyTeam && onSelectTargetThreat)) && 'cursor-pointer'}
                ${canClickForPuzzle ? 'cursor-pointer hover:border-yellow-400' : ''}
                ${mode === 'puzzle' && (currentTeamType === Team.EnemyTeam || !canClickForPuzzle) && !isEmpty ? 'opacity-80 cursor-default' : ''}
                ${mode === 'puzzle' && isEmpty ? 'opacity-60 cursor-default' : ''}
                ${isSlotDragOverActive('pick', role) ? 'drag-over-active' : ''}
              `}
              aria-label={`${role} champion: ${championName}`}
              style={{ animationDelay: `${index * 70 + 250}ms` }}
              onClick={() => {
                if (mode === 'lab' && isEmpty && onLabPickSlotClick && !isThreatAssessmentModeActive) onLabPickSlotClick(currentTeamType, role);
                else if (mode === 'lab' && pick && !isEmpty && !isDeemphasizedForThreat) handlePickInteraction(pick.champion, pick.role, pick, pick.ddragonKey); // Allow click on target or for clearing
                else if (mode === 'draft' && pick && !isEmpty) handlePickInteraction(pick.champion, pick.role, pick, pick.ddragonKey);
                else if (canClickForPuzzle && onPuzzleChampionSlotClick && pick) onPuzzleChampionSlotClick(pick);
              }}
              onDragOver={mode === 'lab' && isEmpty && onLabChampionDropOnPick && !isThreatAssessmentModeActive ? handleDragOver : undefined}
              onDrop={mode === 'lab' && isEmpty && onLabChampionDropOnPick && !isThreatAssessmentModeActive ? (e) => handleDropOnPick(e, role) : undefined}
              onDragEnter={mode === 'lab' && isEmpty && onLabChampionDropOnPick && !isThreatAssessmentModeActive ? () => handleDragEnter('pick', role) : undefined}
              onDragLeave={mode === 'lab' && isEmpty && onLabChampionDropOnPick && !isThreatAssessmentModeActive ? handleDragLeave : undefined}
            >
              {championDDragonInfo && ddragonVersion && !isEmpty && (
                <img
                  src={getChampionImageURL(ddragonVersion, championDDragonInfo.id, 'splash')}
                  alt={`${championName} splash art`}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300 ease-in-out group-hover:scale-110"
                  aria-hidden="true"
                  loading="lazy" 
                />
              )}
              {!isEmpty && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent group-hover:from-black/90 group-hover:via-black/60 transition-all duration-300 ease-in-out"></div>
              )}
               {isTargetedThreat && (
                  <TargetIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-red-400 opacity-80 pointer-events-none z-20" /> /* Increased size */
              )}
              <div className="relative z-10 flex flex-col justify-between h-full p-2 sm:p-2.5 md:p-3"> {/* Increased padding */}
                <div className="flex items-center">
                  <RoleIcon role={role} className={`w-5 h-5 sm:w-6 sm:h-6 ${isEmpty ? 'text-slate-600' : (isEnemyTeam ? 'text-purple-300' : 'text-slate-300 group-hover:text-sky-300')}`} /> {/* Increased icon size */}
                  <span className={`ml-2 text-sm sm:text-base font-medium ${isEmpty ? 'text-slate-500 italic' : (isEnemyTeam ? 'text-purple-200' : 'text-slate-200')}`}> {/* Increased font size */}
                    {role}
                  </span>
                </div>
                {pick && championDDragonInfo && !isEmpty ? (
                  <div className="flex items-center min-w-0 self-start mt-auto">
                    {ddragonVersion && (
                      <img
                        src={getChampionImageURL(ddragonVersion, championDDragonInfo.id)}
                        alt={championName}
                        className="w-10 h-10 sm:w-12 md:w-14 rounded-lg mr-2 sm:mr-2.5 border-2 border-slate-500 shadow-sm flex-shrink-0" /* Increased image size */
                        loading="lazy" 
                      />
                    )}
                    <div className="flex flex-col items-start">
                        <span
                        className={`text-base sm:text-lg md:text-xl font-bold truncate transition-all duration-300 ease-in-out ${isEnemyTeam ? 'text-purple-300 group-hover:text-purple-200 group-hover:[text-shadow:0_0_8px_theme(colors.purple.400),_0_0_16px_theme(colors.purple.500)]' : 'text-sky-300 group-hover:text-sky-200 group-hover:[text-shadow:0_0_8px_theme(colors.sky.400),_0_0_16px_theme(colors.sky.500)]'}`} /* Increased font size */
                        title={championName}
                        >
                        {championName}
                        </span>
                        {championStaticInfoData?.metaTier && (
                            <MetaTierBadge tier={championStaticInfoData.metaTier} className="mt-1" />
                        )}
                    </div>
                  </div>
                ) : pick && !isEmpty ? ( 
                    <div className="flex items-center min-w-0 self-start mt-auto">
                         <span
                            className={`text-base sm:text-lg md:text-xl font-bold truncate transition-all duration-300 ease-in-out ${isEnemyTeam ? 'text-purple-300 group-hover:text-purple-200 group-hover:[text-shadow:0_0_8px_theme(colors.purple.400),_0_0_16px_theme(colors.purple.500)]' : 'text-sky-300 group-hover:text-sky-200 group-hover:[text-shadow:0_0_8px_theme(colors.sky.400),_0_0_16px_theme(colors.sky.500)]'}`} /* Increased font size */
                            title={championName}
                          >
                            {championName}
                        </span>
                    </div>
                ) : null}
              </div>
              {isEmpty && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-2">
                  <RoleIcon role={role} className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600 mb-1.5" /> {/* Increased icon size */}
                  <span className="text-sm sm:text-base italic">{role} - Empty</span> {/* Increased font size */}
                </div>
              )}
              {mode === 'draft' && !isEmpty && pick && (draftPhaseForDisplay?.startsWith('Pick') || draftPhaseForDisplay === 'COMPLETE' || draftPhaseForDisplay === 'Pick Phase') && !isThreatAssessmentModeActive && (
                <button
                  title={isSwapOrigin ? "Cancel Role Swap" : "Initiate Role Swap"}
                  onClick={(e) => handleSwapButtonClick(e, pick.champion, pick.role)}
                  disabled={anyLoading || (roleSwapState && roleSwapState.team !== currentTeamType) || (roleSwapState && roleSwapState.team === currentTeamType && !isSwapOrigin && !isSwapTargetCandidate)}
                  className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 sm:p-2 rounded-full z-20
                              ${isSwapOrigin ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-slate-700 hover:bg-slate-600'}
                              text-white opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 ease-in-out
                              disabled:opacity-20 disabled:cursor-not-allowed`} /* Increased padding */
                  aria-label={isSwapOrigin ? `Cancel swapping ${pick.champion}` : `Swap role for ${pick.champion}`}
                >
                  <ArrowsRightLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {/* Increased icon size */}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TeamDisplay = React.memo(TeamDisplayComponent);