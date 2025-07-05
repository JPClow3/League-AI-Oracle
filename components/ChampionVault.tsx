import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DDragonData, Champion, ChampionVaultData, Role, Item } from '../types';
import { geminiService } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import { useProfile } from '../contexts/ProfileContext';
import { useDebounce } from '../hooks/useDebounce';
import { ChampionIcon } from './common/ChampionIcon';
import { Icon } from './common/Icon';
import { staticChampionInfoList } from '../data/gameData';

const ROLES: Role[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];
const DAMAGE_TYPES = ['Physical', 'Magic', 'Mixed'];
const CHAMPION_CLASSES = Array.from(new Set(staticChampionInfoList.map(c => c.championClass).filter(Boolean))) as string[];

interface ChampionVaultProps {
    ddragonData: DDragonData;
    initialChampion?: Champion | null;
    onInitialChampionConsumed?: () => void;
}

const ChampionVault: React.FC<ChampionVaultProps> = ({ ddragonData, initialChampion, onInitialChampionConsumed }) => {
    const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

    const handleSelectChampion = (champion: Champion) => {
        setSelectedChampion(champion);
        window.scrollTo(0, 0);
    };

    const handleClearChampion = () => {
        setSelectedChampion(null);
    };

    useEffect(() => {
        if (initialChampion && onInitialChampionConsumed) {
            handleSelectChampion(initialChampion);
            onInitialChampionConsumed();
        }
    }, [initialChampion, onInitialChampionConsumed]);
    
    return (
        <div className="animate-slide-fade-in">
            {!selectedChampion ? (
                <ChampionGrid ddragonData={ddragonData} onChampionSelect={handleSelectChampion} />
            ) : (
                <ChampionDetailView champion={selectedChampion} ddragonData={ddragonData} onBack={handleClearChampion} />
            )}
        </div>
    );
};

// #region Champion Grid View
const ChampionGrid: React.FC<{
    ddragonData: DDragonData;
    onChampionSelect: (champion: Champion) => void;
}> = ({ ddragonData, onChampionSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ role: Role | 'ALL', class: string | 'ALL', damageType: string | 'ALL' }>({
        role: 'ALL', class: 'ALL', damageType: 'ALL'
    });
    const debouncedSearchTerm = useDebounce(searchTerm, 250);

    const allChampions = useMemo(() => Object.values(ddragonData.champions).sort((a,b) => a.name.localeCompare(b.name)), [ddragonData.champions]);

    const filteredChampions = useMemo(() => {
        return allChampions.filter(champ => {
            const champInfo = staticChampionInfoList.find(c => c.ddragonKey === champ.id);
            const nameMatch = champ.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const roleMatch = filters.role === 'ALL' || champInfo?.primaryRole === filters.role;
            const classMatch = filters.class === 'ALL' || champInfo?.championClass === filters.class;
            const damageMatch = filters.damageType === 'ALL' || champInfo?.damageType === filters.damageType;
            return nameMatch && roleMatch && classMatch && damageMatch;
        });
    }, [allChampions, debouncedSearchTerm, filters]);

    const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-6xl font-display font-bold text-gradient-primary">Champion Vault</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Explore strategic data for every champion in the league.</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mb-8 sticky top-20 z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="md:col-span-2 w-full p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <FilterDropdown label="Role" options={['ALL', ...ROLES]} value={filters.role} onChange={val => handleFilterChange('role', val)} />
                    <FilterDropdown label="Class" options={['ALL', ...CHAMPION_CLASSES]} value={filters.class} onChange={val => handleFilterChange('class', val)} />
                    {/* <FilterDropdown label="Damage Type" options={['ALL', ...DAMAGE_TYPES]} value={filters.damageType} onChange={val => handleFilterChange('damageType', val)} /> */}
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {filteredChampions.map((champ, index) => (
                    <div key={champ.id} className="animate-pop-in" style={{ animationDelay: `${index*15}ms`, opacity: 0 }}>
                        <ChampionIcon champion={champ} version={ddragonData.version} onClick={onChampionSelect} className="w-full aspect-square"/>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FilterDropdown: React.FC<{ label: string, options: string[], value: string, onChange: (value: string) => void }> = ({ label, options, value, onChange }) => (
    <select
        aria-label={`Filter by ${label}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
    >
        <option value="ALL" disabled={value !== "ALL"}>{label}: All</option>
        {options.filter(o => o !== 'ALL').map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
);
// #endregion

// #region Champion Detail View
const ChampionDetailView: React.FC<{
    champion: Champion;
    ddragonData: DDragonData;
    onBack: () => void;
}> = ({ champion, ddragonData, onBack }) => {
    const { activeProfile } = useProfile();
    const { settings } = activeProfile!;

    const [vaultData, setVaultData] = useState<ChampionVaultData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const cachedDataRaw = sessionStorage.getItem(`vault_${champion.id}`);
            if (cachedDataRaw) {
                setVaultData(JSON.parse(cachedDataRaw));
            } else {
                const result = await geminiService.getChampionVaultData(champion, settings);
                if (result) {
                    setVaultData(result);
                    sessionStorage.setItem(`vault_${champion.id}`, JSON.stringify(result));
                } else {
                    setError("The Oracle could not retrieve complete data for this champion.");
                }
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred while consulting the Oracle's archives.");
        } finally {
            setIsLoading(false);
        }
    }, [champion, settings]);
    
    useEffect(() => {
        handleFetchData();
    }, [handleFetchData]);

    const champInfo = useMemo(() => staticChampionInfoList.find(c => c.ddragonKey === champion.id), [champion.id]);
    const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                <Icon name="chevron-right" className="w-4 h-4 transform rotate-180"/>
                Back to Vault
            </button>
            
            {/* Header */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <img src={splashUrl} alt={`${champion.name} Splash Art`} className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                    <h2 className="text-6xl font-display text-white" style={{ textShadow: '2px 2px 4px #000' }}>{champion.name}</h2>
                    <p className="text-2xl text-slate-300" style={{ textShadow: '1px 1px 2px #000' }}>{champion.title}</p>
                </div>
            </div>

            {/* At a Glance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard icon="map" label="Role" value={champInfo?.primaryRole} />
                <InfoCard icon="brain" label="Class" value={champInfo?.championClass} />
                <InfoCard icon="shield" label="Damage Type" value={champInfo?.damageType} />
                <InfoCard icon="sword" label="Engage" value={champInfo?.engagePotential} />
            </div>

            {isLoading && <div className="flex flex-col items-center justify-center p-12 gap-4 text-slate-500 dark:text-slate-400"><Spinner size="h-10 w-10" /> <p className="mt-2 text-lg">Consulting the Oracle's Archives...</p></div>}
            {error && <div className="p-6 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-center rounded-lg">{error}<button onClick={handleFetchData} className="ml-2 underline">Retry</button></div>}

            {vaultData && (
                <div className="space-y-6 animate-fade-in">
                    <Section title="How to Play" icon="brain">
                        <p className="text-slate-600 dark:text-slate-300">{vaultData.playstyleSummary}</p>
                    </Section>
                    <AbilitiesDisplay vaultData={vaultData} ddragonData={ddragonData} championId={champion.id}/>
                    <BuildsAndMatchupsTabs vaultData={vaultData} ddragonData={ddragonData} />
                </div>
            )}
        </div>
    );
};

const InfoCard: React.FC<{ icon: React.ComponentProps<typeof Icon>['name'], label: string, value?: string }> = ({ icon, label, value }) => (
    <div className="bg-slate-100 dark:bg-slate-800/70 p-4 rounded-lg flex items-center gap-4 border border-slate-200 dark:border-slate-700">
        <Icon name={icon} className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{value || 'N/A'}</p>
        </div>
    </div>
);

const AbilitiesDisplay: React.FC<{ vaultData: ChampionVaultData, ddragonData: DDragonData, championId: string }> = ({ vaultData, ddragonData, championId }) => {
    const [expandedAbility, setExpandedAbility] = useState<string | null>(null);
    const [detailedAbilities, setDetailedAbilities] = useState<any[]>([]);

    useEffect(() => {
        const fetchChampionDetails = async () => {
            try {
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddragonData.version}/data/en_US/champion/${championId}.json`);
                const data = await response.json();
                const champData = data.data[championId];
                const passive = { ...champData.passive, key: 'Passive' };
                const spells = champData.spells.map((spell: any, i:number) => ({ ...spell, key: ['Q', 'W', 'E', 'R'][i] }));
                setDetailedAbilities([passive, ...spells]);
            } catch (e) {
                console.error("Failed to fetch detailed ability data", e);
            }
        };
        fetchChampionDetails();
    }, [championId, ddragonData.version]);

    const getAbilityIconUrl = (image: { full: string }) => `https://ddragon.leagueoflegends.com/cdn/${ddragonData.version}/img/spell/${image.full}`;
    const getPassiveIconUrl = (image: { full: string }) => `https://ddragon.leagueoflegends.com/cdn/${ddragonData.version}/img/passive/${image.full}`;

    return (
        <Section title="Abilities" icon="settings">
            <div className="flex justify-around items-start p-4">
                {detailedAbilities.map((ability, index) => (
                    <div key={ability.id || ability.key} className="text-center" onClick={() => setExpandedAbility(expandedAbility === ability.key ? null : ability.key)}>
                        <img 
                            src={index === 0 ? getPassiveIconUrl(ability.image) : getAbilityIconUrl(ability.image)} 
                            alt={ability.name}
                            className={`w-16 h-16 rounded-lg cursor-pointer transition-all duration-200 border-2 ${expandedAbility === ability.key ? 'border-amber-400 scale-110' : 'border-slate-400 dark:border-slate-600 hover:border-indigo-500'}`}
                        />
                        <p className="text-xs font-bold mt-1">{ability.key}</p>
                    </div>
                ))}
            </div>
            {expandedAbility && (
                <div className="p-4 bg-slate-200/50 dark:bg-black/20 rounded-lg animate-fade-in">
                    <h5 className="font-bold text-lg text-slate-800 dark:text-slate-200">{detailedAbilities.find(a=>a.key === expandedAbility)?.name}</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400" dangerouslySetInnerHTML={{ __html: detailedAbilities.find(a=>a.key === expandedAbility)?.description }}></p>
                </div>
            )}
        </Section>
    );
};

const BuildsAndMatchupsTabs: React.FC<{ vaultData: ChampionVaultData, ddragonData: DDragonData }> = ({ vaultData, ddragonData }) => {
    const [activeTab, setActiveTab] = useState<'build' | 'matchups' | 'synergies'>('build');
    
    return (
        <div>
            <div className="border-b border-slate-200 dark:border-slate-700 flex">
                <TabButton name="Core Build" isActive={activeTab === 'build'} onClick={() => setActiveTab('build')} />
                <TabButton name="Matchups" isActive={activeTab === 'matchups'} onClick={() => setActiveTab('matchups')} />
                <TabButton name="Synergies" isActive={activeTab === 'synergies'} onClick={() => setActiveTab('synergies')} />
            </div>
            <div className="py-4">
                {activeTab === 'build' && (
                    <Section icon="shield" title="Core 3-Item Build">
                        <div className="flex justify-center gap-6 p-4">
                           {vaultData.coreItems.map(itemName => {
                                 const item = Object.values(ddragonData.items).find(i => i.name === itemName);
                                 return item ? <ItemIcon key={itemName} item={item} version={ddragonData.version} /> : <div key={itemName} className="text-xs">{itemName}</div>;
                            })}
                        </div>
                    </Section>
                )}
                {activeTab === 'matchups' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Section title="Strong Against" icon="sword">
                            <MatchupGrid champions={vaultData.counteredBy} ddragonData={ddragonData} />
                        </Section>
                        <Section title="Weak Against" icon="warning">
                            <MatchupGrid champions={vaultData.counters} ddragonData={ddragonData} />
                        </Section>
                    </div>
                )}
                {activeTab === 'synergies' && (
                     <Section title="Ideal Partners" icon="plus">
                        <div className="space-y-4">
                            {vaultData.synergies.lanePartner.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Lane Partners</h4>
                                    <MatchupGrid champions={vaultData.synergies.lanePartner} ddragonData={ddragonData} />
                                </div>
                            )}
                             {vaultData.synergies.jungler.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Jungle Synergies</h4>
                                     <MatchupGrid champions={vaultData.synergies.jungler} ddragonData={ddragonData} />
                                </div>
                            )}
                        </div>
                     </Section>
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ name: string; isActive: boolean; onClick: () => void; }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 font-semibold transition-colors border-b-2 ${isActive ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-indigo-500'}`}>
        {name}
    </button>
);

const MatchupGrid: React.FC<{champions: string[]; ddragonData: DDragonData}> = ({ champions, ddragonData }) => (
    <div className="flex flex-wrap gap-2">
        {champions.map(name => {
            const champion = Object.values(ddragonData.champions).find(c => c.name === name);
            return champion ? <ChampionIcon key={name} champion={champion} version={ddragonData.version} className="w-12 h-12" /> : null;
        })}
    </div>
);

const ItemIcon: React.FC<{item: Item; version: string}> = ({ item, version }) => (
    <div className="flex flex-col items-center gap-1 w-20 text-center">
        <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`} alt={item.name} className="w-16 h-16 rounded-md border-2 border-slate-400 dark:border-slate-600"/>
        <p className="text-xs text-slate-500 dark:text-slate-400">{item.name}</p>
    </div>
);

const Section: React.FC<{title: string; icon: React.ComponentProps<typeof Icon>['name']; children: React.ReactNode}> = ({ title, icon, children }) => (
    <div className="p-4 bg-slate-100/50 dark:bg-slate-900/30 rounded-lg">
        <h4 className="flex items-center gap-2 text-xl font-display text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
            <Icon name={icon} className="w-5 h-5 text-indigo-500" />
            {title}
        </h4>
        {children}
    </div>
);
// #endregion

export default ChampionVault;
