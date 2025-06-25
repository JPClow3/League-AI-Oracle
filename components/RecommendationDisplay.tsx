
import React from 'react';
import { 
  DraftAnalysis, 
  GroundingChunk, 
  DDragonChampionInfo, 
  MvpData, 
  RecommendationDisplayProps, 
  DDragonItemsData, 
  DDragonItemInfo,
  AnalysisType,
  AnalysisDataType,
  StructuredDraftRec,
  StructuredExplorerRec,
  StructuredArmoryRec,
  StructuredThreatRec,
  StructuredDraftRecChampionArmory,
  StructuredDraftRecItemAdvice,
  StructuredThreatRecItem
} from '../types';
import { SourceLinkIcon, TrophyIcon } from './icons/index';
import { getChampionImageURL, getItemImageURL } from '../services/ddragonService';
import { formatMarkdownString } from '../utils/textFormatting'; 
import { LoadingSpinner } from './LoadingSpinner';

const RecommendationDisplayComponent: React.FC<RecommendationDisplayProps> = ({ 
  analysis, 
  title = "Oracle's Analysis", 
  ddragonVersion,
  allChampionsData,
  allItemsData, 
  mvpAnalysis,
  isLoadingMvp,
  overallSentiment, // This might now be directly part of analysis.overallSentiment
}) => {

  const findChampion = (nameOrKey: string): DDragonChampionInfo | undefined => {
    if (!allChampionsData || !nameOrKey) return undefined;
    const lowerIdentifier = nameOrKey.toLowerCase().trim();
    return allChampionsData.find(c => c.id.toLowerCase() === lowerIdentifier || c.key?.toLowerCase() === lowerIdentifier) || 
           allChampionsData.find(c => c.name.toLowerCase() === lowerIdentifier);
  };

  const findItemData = (itemName: string): DDragonItemInfo | undefined => {
    if (!allItemsData || !allItemsData.data || !itemName) return undefined;
    const lowerItemName = itemName.toLowerCase().trim();
    for (const itemId in allItemsData.data) {
      if (allItemsData.data[itemId].name.toLowerCase() === lowerItemName) {
        return allItemsData.data[itemId];
      }
    }
     for (const itemId in allItemsData.data) {
      if (allItemsData.data[itemId].name.toLowerCase().includes(lowerItemName) || 
          (allItemsData.data[itemId].colloq && allItemsData.data[itemId].colloq.toLowerCase().includes(lowerItemName)) ) {
        return allItemsData.data[itemId];
      }
    }
    return undefined;
  };

  const formatTextWithChampionsAndItems = (text: string | undefined): React.ReactNode[] => {
    if (!text) return [null];
    const baseFormattedNodes = formatMarkdownString(text); 

    const transformNode = (node: React.ReactNode, keyPrefix: string): React.ReactNode => {
      if (typeof node === 'string') {
        const parts = node.split(/(\{\{.*?\}\}|\*\*.*?\*\*)/g);
        
        return parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) { 
            const championName = part.substring(2, part.length - 2);
            const championInfo = findChampion(championName);
            if (championInfo && ddragonVersion) {
              return (
                <React.Fragment key={`${keyPrefix}-champ-${index}`}>
                  <img
                    src={getChampionImageURL(ddragonVersion, championInfo.id)}
                    alt={championName}
                    className="w-5 h-5 mr-1.5 inline-block rounded-sm align-middle"
                    aria-hidden="true"
                    loading="lazy" 
                  />
                  <span className="font-semibold text-sky-300 align-middle">{championName}</span>
                </React.Fragment>
              );
            }
            return <strong className="font-semibold text-sky-300 align-middle">{championName}</strong>; 
          } else if (part.startsWith('{{') && part.endsWith('}}')) { 
            const itemName = part.substring(2, part.length - 2);
            const itemInfo = findItemData(itemName);
            if (itemInfo && ddragonVersion) {
              return (
                <React.Fragment key={`${keyPrefix}-item-${index}`}>
                  <img
                    src={getItemImageURL(ddragonVersion, itemInfo.image.full)}
                    alt={itemName}
                    className="w-5 h-5 mx-0.5 inline-block rounded-sm align-middle border border-slate-600"
                    aria-hidden="true"
                    loading="lazy"
                  />
                  <span className="font-semibold text-yellow-300 align-middle">{itemName}</span>
                </React.Fragment>
              );
            }
             return <span className="font-semibold text-yellow-300 align-middle">{itemName}</span>; 
          }
          return part; 
        });
      }

      if (React.isValidElement(node)) {
        const props = node.props as { children?: React.ReactNode; [key: string]: any };
        let newChildren: React.ReactNode = undefined;
        if (props.children) {
          newChildren = React.Children.map(props.children, (child, index) =>
            transformNode(child, `${keyPrefix}-child-${index}`)
          );
        }
        if (Array.isArray(newChildren) && newChildren.length === 1 && !Array.isArray(props.children)) {
            newChildren = newChildren[0];
        }
        return React.cloneElement(node, { ...props, key: keyPrefix }, newChildren);
      }
      return node;
    };

    return baseFormattedNodes.map((node, index) => transformNode(node, `root-${index}`));
  };


  const renderSource = (chunk: GroundingChunk, index: number): React.ReactNode => {
    const source = chunk.web || chunk.retrievedContext;
    if (source && source.uri) {
      return (
        <li key={index} className="mb-1">
          <a
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-sky-400 hover:text-sky-300 hover:underline transition-colors"
            title={source.title || source.uri}
          >
            <SourceLinkIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{source.title || source.uri}</span>
          </a>
        </li>
      );
    }
    return null;
  };

  const renderMvpPanel = () => {
    if (isLoadingMvp) {
      return (
        <div className="lol-panel p-4 mb-6 bg-yellow-800/30 border-yellow-700/50 animate-fadeIn flex flex-col items-center">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2 flex items-center font-['Inter']">
            <TrophyIcon className="w-6 h-6 mr-2 text-yellow-400 animate-pulse" />
            Identifying Oracle's MVP...
          </h3>
          <LoadingSpinner />
        </div>
      );
    }

    if (!mvpAnalysis || !mvpAnalysis.championName) return null;

    const mvpChampionInfo = findChampion(mvpAnalysis.ddragonKey || mvpAnalysis.championName);
    const mvpPanelClass = `lol-panel p-4 mb-6 bg-gradient-to-br from-yellow-700/50 via-yellow-800/40 to-amber-700/50 border-2 border-yellow-500/70 shadow-xl animate-popIn animate-subtle-pulse-glow`;


    return (
      <div className={mvpPanelClass}>
        <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center font-['Inter']">
          <TrophyIcon className="w-7 h-7 mr-2.5 text-yellow-400" />
          Oracle's MVP
        </h3>
        <div className="flex items-center space-x-4">
          {mvpChampionInfo && ddragonVersion && (
            <img
              src={getChampionImageURL(ddragonVersion, mvpChampionInfo.id)}
              alt={mvpAnalysis.championName}
              className="w-16 h-16 rounded-md border-2 border-yellow-400 shadow-lg"
            />
          )}
          <div>
            <p className="text-lg font-semibold text-yellow-200 font-['Inter']">{mvpAnalysis.championName}</p>
            <p className="text-sm text-yellow-100 leading-snug font-['Inter']">{formatTextWithChampionsAndItems(mvpAnalysis.reason)}</p>
          </div>
        </div>
      </div>
    );
  };
  
  const renderItemAdvice = (itemAdvice: StructuredDraftRecItemAdvice[], type: 'Core' | 'Situational') => (
    <ul className="list-disc list-inside ml-4 space-y-1">
      {itemAdvice.map((item, idx) => (
        <li key={`${type}-${idx}`} className="text-sm text-slate-300">
          {formatTextWithChampionsAndItems(item.name)}: <span className="text-slate-400 italic">{formatTextWithChampionsAndItems(item.reason)}</span>
        </li>
      ))}
    </ul>
  );

  const renderArmoryRecommendations = (recs: StructuredDraftRecChampionArmory[]) => (
    <>
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Oracle's Armory: Recommended Builds</h3>
      {recs.map((rec, idx) => (
        <div key={`armory-${idx}`} className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
          <h4 className="text-lg font-medium text-sky-200 mb-2 flex items-center">
            {findChampion(rec.champion) && ddragonVersion && (
              <img src={getChampionImageURL(ddragonVersion, findChampion(rec.champion)!.id)} alt={rec.champion} className="w-6 h-6 mr-2 rounded-sm" />
            )}
            {rec.champion}
          </h4>
          <h5 className="text-md font-semibold text-yellow-400 my-1 font-['Inter']">Core Items (Foundation):</h5>
          {renderItemAdvice(rec.coreItems, 'Core')}
          {rec.situationalItems.map((sitItem, sitIdx) => (
            <div key={`sit-${sitIdx}`} className="mt-2">
              <h5 className="text-md font-semibold text-amber-400 my-1 font-['Inter']">Situational - {formatTextWithChampionsAndItems(sitItem.condition)}:</h5>
              {renderItemAdvice(sitItem.items, 'Situational')}
            </div>
          ))}
        </div>
      ))}
    </>
  );

  const renderStructuredDraft = (data: StructuredDraftRec) => (
    <>
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Overall Synopsis</h3>
      <p><strong>Your Team Identity:</strong> {formatTextWithChampionsAndItems(data.overallSynopsis.yourTeamIdentity)}</p>
      <p><strong>Enemy Team Identity:</strong> {formatTextWithChampionsAndItems(data.overallSynopsis.enemyTeamIdentity)}</p>
      <p><strong>Expected Tempo:</strong> {formatTextWithChampionsAndItems(data.overallSynopsis.expectedTempo)}</p>

      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Team Composition Snapshot</h3>
      <p><strong>Your Damage Profile:</strong> {formatTextWithChampionsAndItems(data.teamCompositionSnapshot.yourTeamDamageProfile)}</p>
      <p><strong>Enemy Damage Profile:</strong> {formatTextWithChampionsAndItems(data.teamCompositionSnapshot.enemyTeamDamageProfile)}</p>

      {renderArmoryRecommendations(data.oracleArmoryRecommendations)}

      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Strategic Focus (Your Team)</h3>
      <p><strong>Laning Phase:</strong> {formatTextWithChampionsAndItems(data.strategicFocus.laningPhase)}</p>
      <p><strong>Key Power Spikes:</strong> {formatTextWithChampionsAndItems(data.strategicFocus.keyPowerSpikes)}</p>
      <p><strong>Mid-Game Objectives:</strong> {formatTextWithChampionsAndItems(data.strategicFocus.midGameObjectivePriority)}</p>
      <p><strong>Teamfight Execution:</strong> {formatTextWithChampionsAndItems(data.strategicFocus.teamfightExecution)}</p>
      
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Enemy Team Threats & Counterplay</h3>
      <p><strong>Primary Threats:</strong> {formatTextWithChampionsAndItems(data.enemyTeamThreats.primaryThreats)}</p>
      <p><strong>Counterplay Strategy:</strong> {formatTextWithChampionsAndItems(data.enemyTeamThreats.counterplayStrategy)}</p>

      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Impact of Bans</h3>
      <p>{formatTextWithChampionsAndItems(data.impactOfBans)}</p>

      {data.userPreferenceAlignment && (
        <>
          <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">User Preference Alignment</h3>
          <p>{formatTextWithChampionsAndItems(data.userPreferenceAlignment)}</p>
        </>
      )}
      <h3 className="text-xl font-semibold text-yellow-400 mt-6 mb-3 font-['Inter'] underline decoration-yellow-500 decoration-2 underline-offset-4">Key In-Game Reminders (Cheat Sheet)</h3>
      <ul className="list-disc list-inside space-y-1 text-amber-200">
        <li><strong>Our Top Win Condition:</strong> {formatTextWithChampionsAndItems(data.keyInGameReminders.ourTopWinCondition)}</li>
        <li><strong>Enemy's Top Win Condition:</strong> {formatTextWithChampionsAndItems(data.keyInGameReminders.enemyTopWinCondition)}</li>
        <li><strong>Key Threats Summary:</strong> {formatTextWithChampionsAndItems(data.keyInGameReminders.keyThreatsSummary)}</li>
        <li><strong>Target Priority in Fights:</strong> {formatTextWithChampionsAndItems(data.keyInGameReminders.targetPriorityInFights)}</li>
        <li><strong>Crucial Itemization Note:</strong> {formatTextWithChampionsAndItems(data.keyInGameReminders.crucialItemizationNote)}</li>
      </ul>
    </>
  );
  
  const renderStructuredExplorer = (data: StructuredExplorerRec) => (
    <>
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Direct Answer to Query</h3>
      <p>{formatTextWithChampionsAndItems(data.directAnswer)}</p>

      {data.championInsights && Object.entries(data.championInsights).map(([champName, insights], idx) => (
        <div key={`explorer-champ-${idx}`} className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
          <h4 className="text-lg font-medium text-sky-200 mb-2 flex items-center">
            {findChampion(champName) && ddragonVersion && (
              <img src={getChampionImageURL(ddragonVersion, findChampion(champName)!.id)} alt={champName} className="w-6 h-6 mr-2 rounded-sm" />
            )}
            Insights for {champName}
          </h4>
          {insights.strengths && <p><strong>Strengths:</strong> {formatTextWithChampionsAndItems(insights.strengths)}</p>}
          {insights.weaknesses && <p><strong>Weaknesses:</strong> {formatTextWithChampionsAndItems(insights.weaknesses)}</p>}
          {insights.strategicUse && <p><strong>Strategic Use:</strong> {formatTextWithChampionsAndItems(insights.strategicUse)}</p>}
          {insights.counters && insights.counters.length > 0 && <p><strong>Counters:</strong> {insights.counters.map(c => formatTextWithChampionsAndItems(c)).join(', ')}</p>}
          {insights.synergies && insights.synergies.length > 0 && <p><strong>Synergies:</strong> {insights.synergies.map(s => formatTextWithChampionsAndItems(s)).join(', ')}</p>}
          {insights.itemBuilds && <p><strong>Item Builds:</strong> {formatTextWithChampionsAndItems(insights.itemBuilds)}</p>}
        </div>
      ))}
      
      {data.generalStrategicPoints && data.generalStrategicPoints.length > 0 && (
        <>
          <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">General Strategic Points</h3>
          <ul className="list-disc list-inside ml-4 space-y-1">
            {data.generalStrategicPoints.map((point, idx) => <li key={`gen-strat-${idx}`}>{formatTextWithChampionsAndItems(point)}</li>)}
          </ul>
        </>
      )}
      {data.keyTakeaways && data.keyTakeaways.length > 0 && (
        <>
          <h3 className="text-xl font-semibold text-yellow-400 mt-6 mb-3 font-['Inter'] underline decoration-yellow-500 decoration-2 underline-offset-4">Key Takeaways</h3>
          <ul className="list-disc list-inside ml-4 space-y-1 text-amber-200">
            {data.keyTakeaways.map((takeaway, idx) => <li key={`takeaway-${idx}`}>{formatTextWithChampionsAndItems(takeaway)}</li>)}
          </ul>
        </>
      )}
    </>
  );

  const renderStructuredArmory = (data: StructuredArmoryRec) => (
    <>
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Strategic Niche & Core Functionality</h3>
      <p>{formatTextWithChampionsAndItems(data.strategicNiche)}</p>
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Ideal Users & Synergies</h3>
      <p>{formatTextWithChampionsAndItems(data.idealUsers)}</p>
      {data.synergisticItems && data.synergisticItems.length > 0 &&
        <p><strong>Synergistic Items:</strong> {data.synergisticItems.map(item => formatTextWithChampionsAndItems(item)).reduce((prev, curr) => [prev, ', ', curr] as any)}</p>}
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Key Scenarios & Counter-Play</h3>
      <p>{formatTextWithChampionsAndItems(data.keyScenarios)}</p>
      {data.counterItems && data.counterItems.length > 0 &&
        <p><strong>Counter Items (to it or with it):</strong> {data.counterItems.map(item => formatTextWithChampionsAndItems(item)).reduce((prev, curr) => [prev, ', ', curr] as any)}</p>}
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Build Timing & Priority</h3>
      <p>{formatTextWithChampionsAndItems(data.buildTiming)}</p>
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Common Mistakes & Pro Tips</h3>
      <p>{formatTextWithChampionsAndItems(data.commonMistakes)}</p>
      <h3 className="text-xl font-semibold text-sky-300 mt-4 mb-2 font-['Inter']">Gold Efficiency & Power Spike</h3>
      <p>{formatTextWithChampionsAndItems(data.goldEfficiencySummary)}</p>
    </>
  );
  
  const renderThreatItemization = (items: StructuredThreatRecItem[]) => (
    items.map((champItems, idx) => (
        <div key={`threat-item-${idx}`} className="mb-2">
            <h5 className="text-md font-semibold text-yellow-400 my-1 font-['Inter']">For {champItems.champion}:</h5>
            {renderItemAdvice(champItems.items, 'Situational')}
        </div>
    ))
  );

  const renderStructuredThreat = (data: StructuredThreatRec) => (
    <>
        <h3 className="text-xl font-semibold text-red-400 mt-4 mb-2 font-['Inter']">Threat Profile: {title.split(':').pop()?.trim()}</h3>
        <p><strong>Key Strengths:</strong> {formatTextWithChampionsAndItems(data.threatProfile.keyStrengths)}</p>
        <p><strong>Typical Build Path:</strong> {formatTextWithChampionsAndItems(data.threatProfile.typicalBuildPath)}</p>
        <p><strong>Primary Threat Vectors:</strong> {formatTextWithChampionsAndItems(data.threatProfile.primaryThreatVectors)}</p>

        <h3 className="text-xl font-semibold text-sky-300 mt-6 mb-2 font-['Inter']">Counter-Strategy</h3>
        <h4 className="text-lg font-medium text-sky-200 mb-1 font-['Inter']">Critical Itemization Choices (Your Team):</h4>
        {renderThreatItemization(data.counterStrategy.itemizationChoices)}

        <h4 className="text-lg font-medium text-sky-200 mt-3 mb-1 font-['Inter']">Strategic Adjustments (Your Team):</h4>
        <p><strong>Laning Phase:</strong> {formatTextWithChampionsAndItems(data.counterStrategy.strategicAdjustments.laningPhase)}</p>
        <p><strong>Teamfights & Skirmishes:</strong> {formatTextWithChampionsAndItems(data.counterStrategy.strategicAdjustments.teamfights)}</p>
        <p><strong>Objective Control:</strong> {formatTextWithChampionsAndItems(data.counterStrategy.strategicAdjustments.objectiveControl)}</p>
        <p><strong>Vision & Ganking:</strong> {formatTextWithChampionsAndItems(data.counterStrategy.strategicAdjustments.visionAndGanking)}</p>
    </>
  );

  const renderContent = () => {
    if (typeof analysis.analysisData === 'string') {
      // This covers 'text_direct' and 'error' types, assuming their data is always string.
      return formatTextWithChampionsAndItems(analysis.analysisData);
    }

    // If we reach here, analysis.analysisData is expected to be a structured type.
    // And analysis.analysisType should match one of the structured cases.
    switch (analysis.analysisType) {
      case 'draft':
        return renderStructuredDraft(analysis.analysisData as StructuredDraftRec);
      case 'explorer':
        return renderStructuredExplorer(analysis.analysisData as StructuredExplorerRec);
      case 'armory':
        return renderStructuredArmory(analysis.analysisData as StructuredArmoryRec);
      case 'threat':
        return renderStructuredThreat(analysis.analysisData as StructuredThreatRec);
      // No 'text_direct' or 'error' cases here as they are handled by the `if` block above.
      // If analysis.analysisType was 'text_direct' or 'error' but analysis.analysisData was NOT a string,
      // it would fall through to default, which is correct behavior for malformed data.
      default:
        // This case means analysis.analysisType is not one of the recognized structured types,
        // OR it's 'text_direct'/'error' but data wasn't string (which is a data integrity issue).
        // The `_exhaustiveCheck` line would cause a TypeScript error if a new AnalysisType was added and not handled.
        // const _exhaustiveCheck: never = analysis.analysisType; 
        console.warn(`Unsupported or malformed analysis type in RecommendationDisplay: ${analysis.analysisType} with non-string data.`);
        return <p>Unsupported or malformed analysis format.</p>;
    }
  };


  let currentOverallSentiment = overallSentiment || analysis.overallSentiment || 'neutral';
  let sentimentClass = '';
  if (currentOverallSentiment === 'positive') {
    sentimentClass = 'animate-subtle-pulse-glow';
  } else if (currentOverallSentiment === 'critical_flaw') {
    sentimentClass = 'lol-panel-warning-border';
  }

  return (
    <div className={`lol-panel p-4 sm:p-6 mt-6 animate-popIn ${sentimentClass}`}>
      {renderMvpPanel()} 
      
      <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 mb-4 sm:mb-6 pb-2 border-b-2 border-slate-700">
        {title}
      </h2>
      
      <div className="prose prose-sm sm:prose-base max-w-none text-slate-100 leading-relaxed selection:bg-sky-500 selection:text-white">
        {renderContent()}
      </div>

      {analysis.sources && analysis.sources.length > 0 && (
        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-700">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-3 font-['Inter']">Sources:</h3>
          <ul className="list-none space-y-1 pl-0">
            {analysis.sources.map(renderSource)}
          </ul>
        </div>
      )}
    </div>
  );
};

export const RecommendationDisplay = React.memo(RecommendationDisplayComponent);
