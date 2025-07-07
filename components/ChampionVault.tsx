
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DDragonData, Champion, ChampionVaultEntry, Role, Item } from '../types';
import { Spinner } from './common/Spinner';
import { useDebounce } from '../../hooks/useDebounce';
import { ChampionIcon } from './common/ChampionIcon';
import { Icon } from './common/Icon';
import { staticChampionInfoList } from '../data/gameData';
import { CHAMPION_VAULT_DATA } from '../data/championVaultData';

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
                <ChampionGridComponent ddragonData={ddragonData} onChampionSelect={handleSelectChampion} />
            ) : (
                <ChampionDetailView champion={selectedChampion} ddragonData={ddragonData} onBack={handleClearChampion} />
            )}
        </div>
    );
};

// #region Champion Grid View
const ChampionGridComponent: React.FC<{
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
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {filteredChampions.map((champ, index) => (
                    <div key={champ.id} className="animate-pop-in" style={{ animationDelay: `${index*15}ms`, opacity: 0, animationFillMode: 'forwards' }}>
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
        <option value="ALL">{label}: All</option>
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
    const vaultData = CHAMPION_VAULT_DATA[champion.id];

    const champInfo = useMemo(() => staticChampionInfoList.find(c => c.ddragonKey === champion.id), [champion.id]);
    const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                <Icon name="chevron-right" className="w-4 h-4 transform rotate-180"/>
                Back to Vault
            </button>
            
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <img src={splashUrl} alt={`${champion.name} Splash Art`} className="w-full h-auto object-cover max-h-[400px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                    <h2 className="text-6xl font-display text-white" style={{ textShadow: '2px 2px 4px #000' }}>{champion.name}</h2>
                    <p className="text-2xl text-slate-300" style={{ textShadow: '1px 1px 2px #000' }}>{champion.title}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard icon="map" label="Role" value={champInfo?.primaryRole} />
                <InfoCard icon="brain" label="Class" value={champInfo?.championClass} />
                <InfoCard icon="shield" label="Damage" value={champInfo?.damageType} />
                <InfoCard icon="sword" label="Engage" value={champInfo?.engagePotential} />
            </div>

            {!vaultData ? (
                <div className="text-center p-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">Detailed strategic information for this champion has not been compiled yet.</p>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <Section title="Overview" icon="brain">
                        <p className="text-slate-600 dark:text-slate-300">{vaultData.overview}</p>
                    </Section>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="Strengths" icon="check">
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                                {vaultData.strengths.map(s => <li key={s}>{s}</li>)}
                            </ul>
                        </Section>
                        <Section title="Weaknesses" icon="x">
                             <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                                {vaultData.weaknesses.map(s => <li key={s}>{s}</li>)}
                            </ul>
                        </Section>
                    </div>

                    <Section title="Playstyle" icon="draft">
                        <p className="text-slate-600 dark:text-slate-300">{vaultData.playstyle}</p>
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

const AbilitiesDisplay: React.FC<{ vaultData: ChampionVaultEntry, ddragonData: DDragonData, championId: string }> = ({ vaultData, ddragonData, championId }) => {
    const [expandedAbility, setExpandedAbility] = useState<string | null>(null);
    const [detailedAbilities, setDetailedAbilities] = useState<any[]>([]);

    useEffect(() => {
        const fetchChampionDetails = async () => {
            try {
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddragonData.version}/data/en_US/champion/${championId}.json`);
                const data = await response.json();
                const champData = data.data[championId];
                const passive = { ...champData.passive, key: 'P' };
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

    const handleAbilityClick = (key: string) => {
        setExpandedAbility(prev => prev === key ? null : key);
    };
    
    const keys:('P' | 'Q' | 'W' | 'E' | 'R')[] = ['P', 'Q', 'W', 'E', 'R'];

    return (
        <Section title="Abilities" icon="book-open">
            <div className="flex justify-around items-start p-4">
                {keys.map((key, index) => {
                    const detail = detailedAbilities[index];
                    const abilityInfo = vaultData.abilities.find(a => a.key === key);
                    const isActive = expandedAbility === key;
                    return (
                        <div key={key} className="text-center cursor-pointer group" onClick={() => handleAbilityClick(key)}>
                            <img 
                                src={detail ? (index === 0 ? getPassiveIconUrl(detail.image) : getAbilityIconUrl(detail.image)) : ''} 
                                alt={abilityInfo?.name || ''}
                                className={`w-16 h-16 rounded-lg transition-all duration-200 border-2 
                                    ${isActive ? 'border-amber-400 scale-110' : 'border-slate-400 dark:border-slate-600 group-hover:border-indigo-500 group-hover:scale-105'}`}
                            />
                            <p className="text-xs font-bold mt-2 transition-colors">{isActive ? abilityInfo?.name : key}</p>
                        </div>
                    );
                })}
            </div>
            <div className={`collapsible ${expandedAbility ? 'expanded' : ''}`}>
                <div>
                {expandedAbility && (() => {
                    const abilityInfo = vaultData.abilities.find(a => a.key === expandedAbility);
                    const detail = detailedAbilities.find(a => a.key === expandedAbility);
                    if(!abilityInfo || !detail) return null;

                    return (
                        <div className="p-4 mt-2 bg-slate-200/50 dark:bg-black/20 rounded-lg">
                            <h5 className="font-bold text-lg text-slate-800 dark:text-slate-200">{abilityInfo.name}</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2" dangerouslySetInnerHTML={{ __html: detail.description }}></p>
                            <p className="text-sm text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-500 pl-3 italic">
                                <strong>Pro Tip:</strong> {abilityInfo.proTip}
                            </p>
                        </div>
                    )
                })()}
                </div>
            </div>
        </Section>
    );
};

const BuildsAndMatchupsTabs: React.FC<{ vaultData: ChampionVaultEntry, ddragonData: DDragonData }> = ({ vaultData, ddragonData }) => {
    const [activeTab, setActiveTab] = useState<'build' | 'matchups' | 'synergies'>('build');
    
    return (
        <div className="bg-slate-100/50 dark:bg-slate-900/30 rounded-lg p-4">
            <div className="border-b border-slate-200 dark:border-slate-700 flex mb-4">
                <TabButton name="Build" icon="briefcase" isActive={activeTab === 'build'} onClick={() => setActiveTab('build')} />
                <TabButton name="Matchups" icon="sword" isActive={activeTab === 'matchups'} onClick={() => setActiveTab('matchups')} />
                <TabButton name="Synergies" icon="plus" isActive={activeTab === 'synergies'} onClick={() => setActiveTab('synergies')} />
            </div>
            <div className="py-4">
                {activeTab === 'build' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4">
                           {vaultData.build.coreItems.map(({ name }) => {
                                 const item = Object.values(ddragonData.items).find(i => i.name === name);
                                 return item ? <ItemIcon key={name} item={item} version={ddragonData.version} /> : <div key={name} className="text-xs">{name}</div>;
                            })}
                        </div>
                        <p className="text-center text-slate-600 dark:text-slate-400 mt-4 px-4">{vaultData.build.explanation}</p>
                    </div>
                )}
                {activeTab === 'matchups' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <MatchupColumn title="Strong Against" champions={vaultData.matchups.strongAgainst} ddragonData={ddragonData} color="teal" />
                        <MatchupColumn title="Weak Against" champions={vaultData.matchups.weakAgainst} ddragonData={ddragonData} color="rose" />
                    </div>
                )}
                {activeTab === 'synergies' && (
                     <div className="animate-fade-in space-y-6">
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Ideal Partners</h4>
                            <div className="space-y-3">
                                {vaultData.synergies.partners.map(partner => {
                                    const champion = Object.values(ddragonData.champions).find(c => c.name === partner.championName);
                                    return (
                                        <div key={partner.championName} className="flex items-start gap-3 p-3 bg-slate-200/50 dark:bg-black/20 rounded-md">
                                            {champion && <ChampionIcon champion={champion} version={ddragonData.version} className="w-12 h-12 flex-shrink-0" />}
                                            <div>
                                                <p className="font-bold">{partner.championName}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{partner.reason}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Ideal Team Compositions</h4>
                            <div className="flex flex-wrap gap-2">
                                {vaultData.synergies.idealComps.map(comp => (
                                    <span key={comp} className="px-3 py-1 bg-indigo-200 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-sm font-semibold rounded-full">{comp}</span>
                                ))}
                            </div>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ name: string; icon: React.ComponentProps<typeof Icon>['name']; isActive: boolean; onClick: () => void; }> = ({ name, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors border-b-2 ${isActive ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-indigo-500'}`}>
        <Icon name={icon} className="w-4 h-4" />
        {name}
    </button>
);

const MatchupColumn: React.FC<{title: string, champions: {championName: string, tip: string}[], ddragonData: DDragonData, color: 'teal' | 'rose'}> = ({ title, champions, ddragonData, color }) => (
    <div>
        <h4 className={`font-bold text-${color}-600 dark:text-${color}-400 mb-2`}>{title}</h4>
        <div className="space-y-2">
            {champions.map(({ championName, tip }) => {
                const champion = Object.values(ddragonData.champions).find(c => c.name === championName);
                if (!champion) return null;
                return (
                    <div key={championName} className="flex items-start gap-3 p-2 bg-slate-200/50 dark:bg-black/20 rounded-md">
                        <ChampionIcon champion={champion} version={ddragonData.version} className="w-12 h-12 flex-shrink-0" />
                        <p className="text-xs text-slate-600 dark:text-slate-400">{tip}</p>
                    </div>
                )
            })}
        </div>
    </div>
);


const ItemIcon: React.FC<{item: Item; version: string}> = ({ item, version }) => (
    <div className="flex flex-col items-center gap-1 w-20 text-center" title={`${item.name} - ${item.plaintext}`}>
        <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`} alt={item.name} className="w-16 h-16 rounded-md border-2 border-slate-400 dark:border-slate-600"/>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full">{item.name}</p>
    </div>
);

const Section: React.FC<{title: string; icon: React.ComponentProps<typeof Icon>['name']; children: React.ReactNode}> = ({ title, icon, children }) => (
    <div className="p-4 bg-slate-100/50 dark:bg-slate-800/80 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
        <h4 className="flex items-center gap-2 text-xl font-display text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
            <Icon name={icon} className="w-5 h-5 text-indigo-500" />
            {title}
        </h4>
        {children}
    </div>
);
// #endregion

export default ChampionVault;
