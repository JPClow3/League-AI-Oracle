
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArmoryScreenProps,
  MergedItemInfo,
  ArmoryItemWisdom,
  DDragonItemsData, 
} from '../types';
import { getItemImageURL } from '../services/ddragonService';
import { getArmoryItemWisdom } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Modal } from './Modal';
import { AISparkleIcon, ArrowUturnLeftIcon, BookOpenIcon as ArmoryIcon, FlaskConicalIcon } from './icons/index';
import { RecommendationDisplay } from './RecommendationDisplay';
import { ErrorDisplay } from './ErrorDisplay';
import { useDebounce } from '../utils/textFormatting'; 

type ItemCategoryFilter = "All" | "Legendary" | "Epic" | "Basic" | "Boots" | "Consumables";

const itemCategoryFilters: ItemCategoryFilter[] = ["All", "Legendary", "Epic", "Basic", "Boots", "Consumables"];

// Helper to map DDragon stat keys to readable names
const mapStatName = (statKey: string): string => {
  const nameMap: Record<string, string> = {
    FlatHPPoolMod: "Health",
    FlatMPPoolMod: "Mana",
    FlatArmorMod: "Armor",
    FlatSpellBlockMod: "Magic Resist",
    FlatCritChanceMod: "Critical Strike Chance",
    FlatMagicDamageMod: "Ability Power",
    FlatPhysicalDamageMod: "Attack Damage",
    PercentAttackSpeedMod: "Attack Speed (%)",
    PercentLifeStealMod: "Life Steal (%)",
    FlatMoveSpeedMod: "Movement Speed",
    PercentCooldownMod: "Ability Haste (CDR %)", // Note: DDragon might use old CDR term internally
    FlatHPPoolRegenMod: "Health Regen",
    FlatMPPoolRegenMod: "Mana Regen",
    PercentMovementSpeedMod: "Movement Speed (%)",
    // Add more mappings as needed based on DDragon data
  };
  return nameMap[statKey] || statKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Fallback formatting
};


export const ArmoryScreen: React.FC<ArmoryScreenProps> = ({
  onGoHome,
  ddragonVersion,
  allItemsData,
  itemStaticData,
  oraclePersonality,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allSummonersRiftItems, setAllSummonersRiftItems] = useState<MergedItemInfo[]>([]);
  const [filteredItems, setFilteredItems] = useState<MergedItemInfo[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ItemCategoryFilter>("All");
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MergedItemInfo | null>(null);
  
  const [itemWisdom, setItemWisdom] = useState<ArmoryItemWisdom | null>(null);
  const [isLoadingWisdom, setIsLoadingWisdom] = useState<boolean>(false);
  const [wisdomError, setWisdomError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300); 

  const [wisdomCache, setWisdomCache] = useState<Record<string, ArmoryItemWisdom>>({});


  useEffect(() => {
    if (allItemsData && itemStaticData) {
      const merged: MergedItemInfo[] = [];
      for (const ddragonItemIdStr in allItemsData.data) {
        const ddragonItem = allItemsData.data[ddragonItemIdStr];

        if (ddragonItem.gold && ddragonItem.gold.purchasable && ddragonItem.maps && ddragonItem.maps['11']) {
          const staticData = itemStaticData.find(sItem => sItem.id === ddragonItemIdStr);

          merged.push({
            // Core DDragon fields
            description: ddragonItem.description,
            colloq: ddragonItem.colloq,
            plaintext: ddragonItem.plaintext,
            into: ddragonItem.into,
            from: ddragonItem.from,
            image: ddragonItem.image,
            gold: ddragonItem.gold,
            maps: ddragonItem.maps,
            depth: ddragonItem.depth,
            id: ddragonItemIdStr, 
            name: ddragonItem.name, 
            ddragonStats: ddragonItem.stats,
            ddragonTags: ddragonItem.tags,   
            
            // Static data fields (primarily for AI context and some UI classification)
            staticCost: staticData?.cost, // Will be overridden by DDragon in UI
            staticStats: staticData?.stats, // Descriptive, AI context
            staticStrategicSummary: staticData?.strategicSummary,
            staticPassiveName: staticData?.passiveName,
            staticPassiveDescription: staticData?.passiveDescription,
            staticActiveName: staticData?.activeName,
            staticActiveDescription: staticData?.activeDescription,
            staticPurposeAndSynergies: staticData?.purposeAndSynergies,
            staticSituationalApplication: staticData?.situationalApplication,
            staticPrimaryUsers: staticData?.primaryUsers,
            staticCountersInfo: staticData?.countersInfo,
            staticBuildPathNotes: staticData?.buildPathNotes,
            staticGoldEfficiencyNotes: staticData?.goldEfficiencyNotes,
            staticKeywords: staticData?.keywords,
            itemType: staticData?.type, // Important for filtering
          });
        }
      }
      merged.sort((a, b) => a.name.localeCompare(b.name));
      setAllSummonersRiftItems(merged);
    }
  }, [allItemsData, itemStaticData]);

  useEffect(() => {
    let itemsToDisplay = allSummonersRiftItems;

    if (activeCategoryFilter !== "All") {
      itemsToDisplay = itemsToDisplay.filter(item => {
        switch (activeCategoryFilter) {
          case "Legendary": // Simplistic: items that don't build into anything and are purchasable, not consumables/trinkets
             return (!item.into || item.into.length === 0) && 
                   !item.ddragonTags.includes('Consumable') && 
                   !item.ddragonTags.includes('Trinket') &&
                   item.gold.purchasable;
          case "Epic": // Simplistic: items that build from something and into something
            return item.from && item.from.length > 0 && item.into && item.into.length > 0;
          case "Basic": // Simplistic: items that don't build from anything but build into something, not consumable/trinket
             return (!item.from || item.from.length === 0) && 
                   item.into && item.into.length > 0 &&
                   !item.ddragonTags.includes('Consumable') && 
                   !item.ddragonTags.includes('Trinket');
          case "Boots":
            return item.ddragonTags.includes('Boots');
          case "Consumables":
            return item.ddragonTags.includes('Consumable');
          default:
            return true;
        }
      });
    }

    if (debouncedSearchTerm.trim() !== '') { 
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      itemsToDisplay = itemsToDisplay.filter(item =>
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        (item.plaintext && item.plaintext.toLowerCase().includes(lowerSearchTerm)) ||
        (item.staticKeywords && item.staticKeywords.some(kw => kw.toLowerCase().includes(lowerSearchTerm))) ||
        (item.description && item.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredItems(itemsToDisplay);
  }, [debouncedSearchTerm, allSummonersRiftItems, activeCategoryFilter]); 

  const handleItemClick = (item: MergedItemInfo) => {
    setSelectedItemForDetail(item);
    const cacheKey = `${item.id}_${oraclePersonality}`;
    if (wisdomCache[cacheKey]) {
        setItemWisdom(wisdomCache[cacheKey]);
        setIsLoadingWisdom(false);
        setWisdomError(null);
    } else {
        setItemWisdom(null); 
        setWisdomError(null);
    }
    setIsDetailModalOpen(true);
  };

  const handleSeekWisdom = useCallback(async () => {
    if (!selectedItemForDetail) return;

    const cacheKey = `${selectedItemForDetail.id}_${oraclePersonality}`;
    if (wisdomCache[cacheKey]) {
        setItemWisdom(wisdomCache[cacheKey]);
        setIsLoadingWisdom(false);
        setWisdomError(null);
        return;
    }

    setIsLoadingWisdom(true);
    setWisdomError(null);
    setItemWisdom(null);
    try {
      const wisdom = await getArmoryItemWisdom(selectedItemForDetail, oraclePersonality);
      setItemWisdom(wisdom);
      setWisdomCache(prevCache => ({...prevCache, [cacheKey]: wisdom }));
    } catch (err) {
      console.error("Error seeking wisdom:", err);
      setWisdomError(err instanceof Error ? err.message : "The Oracle's vision for this item is clouded.");
    } finally {
      setIsLoadingWisdom(false);
    }
  }, [selectedItemForDetail, oraclePersonality, wisdomCache]);
  
  const renderBuildPathComponent = (itemId: string, allItems: DDragonItemsData | null, ddragonVersion: string) => {
    if (!allItems || !allItems.data[itemId]) return null;
    const item = allItems.data[itemId];
    return (
      <div key={item.name} className="flex flex-col items-center text-center p-1 bg-slate-700/50 rounded-lg" title={item.name}>
        <img
          src={getItemImageURL(ddragonVersion, item.image.full)}
          alt={item.name}
          className="w-8 h-8 rounded-md border border-slate-600"
        />
        <span className="text-[9px] text-slate-300 mt-0.5 truncate w-full">{item.name}</span>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-yellow-300 flex items-center">
          <ArmoryIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-400" />
          Oracle's Armory
        </h2>
        <button onClick={onGoHome} className="lol-button lol-button-secondary text-sm px-3 py-1.5 sm:px-4 sm:py-2">
          <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5" /> Home
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search items by name, description, or keyword..."
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full lol-input text-sm sm:text-base mb-3"
          aria-label="Search for an item"
        />
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            {itemCategoryFilters.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategoryFilter(category)}
                aria-pressed={activeCategoryFilter === category}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md font-medium transition-all duration-150 border-2
                  ${activeCategoryFilter === category
                    ? 'bg-yellow-600 border-yellow-500 text-white shadow-sm'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500 text-slate-300'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-1">
        {filteredItems.length === 0 && !allItemsData && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <LoadingSpinner />
            <p className="mt-2 font-['Inter']">Forging the Armory...</p>
          </div>
        )}
        {filteredItems.length === 0 && allItemsData && debouncedSearchTerm && ( 
          <p className="text-center text-slate-400 py-8 font-['Inter'] leading-relaxed">No items found matching "{debouncedSearchTerm}" for category "{activeCategoryFilter}".</p>
        )}
         {filteredItems.length === 0 && allItemsData && !debouncedSearchTerm && allSummonersRiftItems.length === 0 && (
          <p className="text-center text-slate-400 py-8 font-['Inter'] leading-relaxed">No Summoner's Rift items available or Armory is empty. Data might be loading or missing.</p>
        )}
         {filteredItems.length === 0 && allItemsData && !debouncedSearchTerm && allSummonersRiftItems.length > 0 && activeCategoryFilter !== "All" && (
           <p className="text-center text-slate-400 py-8 font-['Inter'] leading-relaxed">No items found in the "{activeCategoryFilter}" category.</p>
         )}
        <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-3">
          {ddragonVersion && filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="lol-panel bg-slate-800/60 p-1.5 rounded-xl aspect-square flex flex-col items-center justify-center text-center hover:bg-slate-700/80 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              title={item.name}
            >
              <img
                src={getItemImageURL(ddragonVersion, item.image.full)}
                alt={item.name}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg border border-slate-600 group-hover:border-yellow-500 transition-colors"
                loading="lazy"
              />
              <span className="mt-1 text-[9px] sm:text-[10px] text-slate-300 group-hover:text-yellow-300 transition-colors truncate w-full font-['Inter']">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedItemForDetail && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedItemForDetail.name}
          titleIcon={ddragonVersion ? <img src={getItemImageURL(ddragonVersion, selectedItemForDetail.image.full)} alt="" className="w-7 h-7 mr-2 rounded-lg border border-slate-500" /> : <FlaskConicalIcon className="w-6 h-6 mr-2 text-yellow-400" />}
          size="lg"
          modalId={`item-detail-modal-${selectedItemForDetail.id}`}
        >
          <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* DDragon Core Info Section */}
            <div className="lol-panel bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
              <div className="flex items-center space-x-4 mb-3">
                {ddragonVersion && (
                  <img
                    src={getItemImageURL(ddragonVersion, selectedItemForDetail.image.full)}
                    alt={selectedItemForDetail.name}
                    className="w-16 h-16 rounded-xl border-2 border-slate-600 flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-yellow-300 font-['Inter']">{selectedItemForDetail.name}</h3>
                  <p className="text-sm text-slate-400 font-['Inter']">Cost: {selectedItemForDetail.gold.total}g</p>
                  {selectedItemForDetail.ddragonTags && selectedItemForDetail.ddragonTags.length > 0 && (
                    <p className="text-xs text-slate-500 capitalize font-['Inter']">Tags: {selectedItemForDetail.ddragonTags.join(', ')}</p>
                  )}
                </div>
              </div>

              <h4 className="text-md font-semibold text-sky-400 mb-1 font-['Inter'] opacity-80">Official Description (from Riot Data):</h4>
              <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed mb-2 text-sm font-['Inter']"
                   dangerouslySetInnerHTML={{ __html: selectedItemForDetail.description }} />
              
              {selectedItemForDetail.plaintext && <p className="text-xs italic text-slate-500 mt-1 font-['Inter']">Keywords: {selectedItemForDetail.plaintext}</p>}
              
              {selectedItemForDetail.ddragonStats && Object.keys(selectedItemForDetail.ddragonStats).length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-semibold text-sky-300 mb-1 font-['Inter'] opacity-90">Stats:</h5>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-0.5 font-['Inter'] leading-relaxed">
                    {Object.entries(selectedItemForDetail.ddragonStats).map(([statKey, value]) => (
                      <li key={statKey}>{mapStatName(statKey)}: +{value % 1 !== 0 ? (value * 100).toFixed(0) + '%' : value}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Build Path Section */}
            {(selectedItemForDetail.from && selectedItemForDetail.from.length > 0 || selectedItemForDetail.into && selectedItemForDetail.into.length > 0) && (
              <div className="lol-panel bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
                <h4 className="text-md font-semibold text-sky-400 mb-2 font-['Inter'] opacity-80">Build Path (from Riot Data)</h4>
                {selectedItemForDetail.from && selectedItemForDetail.from.length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-sm font-semibold text-sky-300 mb-1 font-['Inter'] opacity-90">Builds From:</h5>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {selectedItemForDetail.from.map(itemId => renderBuildPathComponent(itemId, allItemsData, ddragonVersion))}
                    </div>
                  </div>
                )}
                {selectedItemForDetail.into && selectedItemForDetail.into.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-sky-300 mb-1 font-['Inter'] opacity-90">Builds Into:</h5>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {selectedItemForDetail.into.map(itemId => renderBuildPathComponent(itemId, allItemsData, ddragonVersion))}
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Strategic Insights Section (from itemStaticData.ts) */}
            {(selectedItemForDetail.staticStrategicSummary || selectedItemForDetail.staticPassiveName || selectedItemForDetail.staticActiveName || selectedItemForDetail.staticPurposeAndSynergies) && (
              <div className="lol-panel bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
                  <h4 className="text-md font-semibold text-amber-400 mb-2 font-['Inter'] opacity-80">Strategic Insights (Oracle's Knowledge Base)</h4>
                  {selectedItemForDetail.itemType && <p className="text-xs text-slate-500 capitalize font-['Inter'] mb-2">Category: {selectedItemForDetail.itemType}</p>}
                  {selectedItemForDetail.staticStrategicSummary && (
                      <div className="mb-2">
                          <h5 className="text-sm font-semibold text-amber-300 mb-0.5 font-['Inter'] opacity-90">Strategic Summary:</h5>
                          <p className="text-sm text-slate-300 font-['Inter'] leading-relaxed">{selectedItemForDetail.staticStrategicSummary}</p>
                      </div>
                  )}
                  {selectedItemForDetail.staticPassiveName && (
                      <div className="mb-2">
                          <h5 className="text-sm font-semibold text-amber-300 mb-0.5 font-['Inter'] opacity-90">Passive: {selectedItemForDetail.staticPassiveName}</h5>
                          <p className="text-sm text-slate-300 font-['Inter'] leading-relaxed">{selectedItemForDetail.staticPassiveDescription}</p>
                      </div>
                  )}
                  {selectedItemForDetail.staticActiveName && (
                      <div className="mb-2">
                          <h5 className="text-sm font-semibold text-amber-300 mb-0.5 font-['Inter'] opacity-90">Active: {selectedItemForDetail.staticActiveName}</h5>
                          <p className="text-sm text-slate-300 font-['Inter'] leading-relaxed">{selectedItemForDetail.staticActiveDescription}</p>
                      </div>
                  )}
                  {selectedItemForDetail.staticPurposeAndSynergies && (
                      <div className="mb-2">
                          <h5 className="text-sm font-semibold text-amber-300 mb-0.5 font-['Inter'] opacity-90">Purpose & Synergies:</h5>
                          <p className="text-sm text-slate-300 font-['Inter'] leading-relaxed">{selectedItemForDetail.staticPurposeAndSynergies}</p>
                      </div>
                  )}
                  {selectedItemForDetail.staticSituationalApplication && (
                      <div className="mb-2">
                          <h5 className="text-sm font-semibold text-amber-300 mb-0.5 font-['Inter'] opacity-90">Situational Application:</h5>
                          <p className="text-sm text-slate-300 font-['Inter'] leading-relaxed">{selectedItemForDetail.staticSituationalApplication}</p>
                      </div>
                  )}
                   {selectedItemForDetail.staticPrimaryUsers && selectedItemForDetail.staticPrimaryUsers.length > 0 && (
                      <div className="mb-2">
                           <h5 className="text-sm font-semibold text-amber-300 mb-0.5 font-['Inter'] opacity-90">Primary Users:</h5>
                           <p className="text-sm text-slate-300 font-['Inter'] leading-relaxed">{selectedItemForDetail.staticPrimaryUsers.join(', ')}</p>
                      </div>
                  )}
                  {selectedItemForDetail.staticBuildPathNotes && (
                      <div className="mb-2">
                          <h5 className="text-sm font-semibold text-amber-300 mb-0.5 font-['Inter'] opacity-90">Build Path Notes:</h5>
                          <p className="text-sm text-slate-300 font-['Inter'] leading-relaxed">{selectedItemForDetail.staticBuildPathNotes}</p>
                      </div>
                  )}
                  {selectedItemForDetail.staticGoldEfficiencyNotes && (
                      <div className="mb-2">
                          <h5 className="text-sm font-semibold text-amber-300 mb-0.5 font-['Inter'] opacity-90">Gold Efficiency Notes:</h5>
                          <p className="text-sm text-slate-300 font-['Inter'] leading-relaxed">{selectedItemForDetail.staticGoldEfficiencyNotes}</p>
                      </div>
                  )}
                  {selectedItemForDetail.staticKeywords && selectedItemForDetail.staticKeywords.length > 0 && (
                      <div className="mb-2">
                          <h5 className="text-sm font-semibold text-amber-300 mb-0.5 font-['Inter'] opacity-90">Keywords:</h5>
                          <div className="flex flex-wrap gap-1.5">
                              {selectedItemForDetail.staticKeywords.map(kw => (
                                  <span key={kw} className="px-2 py-0.5 text-[10px] bg-slate-600 text-slate-300 rounded-full font-['Inter']">{kw}</span>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
            )}

            <button
              onClick={handleSeekWisdom}
              disabled={isLoadingWisdom}
              className="w-full lol-button lol-button-primary mt-4 py-2.5 text-sm flex items-center justify-center"
            >
              <AISparkleIcon className="w-5 h-5 mr-2" />
              {isLoadingWisdom ? "Oracle is Meditating..." : "Seek Wisdom on this Artifact"}
            </button>

            {isLoadingWisdom && <div className="mt-4 text-center"><LoadingSpinner /></div>}
            {wisdomError && <ErrorDisplay errorMessage={wisdomError} title="Oracle's Vision Clouded" onClear={() => setWisdomError(null)} />}
            
            {itemWisdom && !isLoadingWisdom && (
              <div className="mt-4 animate-fadeInUp">
                <RecommendationDisplay
                  analysis={itemWisdom}
                  title={`Oracle's Wisdom: ${selectedItemForDetail.name}`}
                  ddragonVersion={ddragonVersion}
                  allChampionsData={[]} 
                  allItemsData={allItemsData}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};