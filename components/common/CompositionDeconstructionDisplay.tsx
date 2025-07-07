import React from 'react';
import { Champion, CompositionDeconstruction, DDragonData } from '../../types';
import { ChampionIcon } from './ChampionIcon';
import { Icon } from './Icon';
import InteractiveText from './InteractiveText';

interface DeconstructionDisplayProps {
  deconstruction: CompositionDeconstruction;
  ddragonData: DDragonData;
  onKeywordClick: (lessonId: string) => void;
}

const SectionCard: React.FC<{ title: string; icon: React.ComponentProps<typeof Icon>['name']; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="font-display text-xl flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
            <Icon name={icon} className="w-5 h-5 text-indigo-500" />
            {title}
        </h3>
        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            {children}
        </div>
    </div>
);

const CompositionDeconstructionDisplay: React.FC<DeconstructionDisplayProps> = ({ deconstruction, ddragonData, onKeywordClick }) => {
    const getChampion = (name: string): Champion | null => {
        return Object.values(ddragonData.champions).find(c => c.name === name) || null;
    };

    const winConChampion = getChampion(deconstruction.winCondition.championName);

    return (
        <div className="space-y-4">
            <h2 className="font-display text-3xl text-center text-teal-500">
                Deconstruction: <span className="text-gradient-primary">{deconstruction.coreIdentity}</span>
            </h2>

            <SectionCard title="Strategic Goal" icon="brain">
                <InteractiveText onKeywordClick={onKeywordClick}>{deconstruction.strategicGoal}</InteractiveText>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectionCard title="Win Condition" icon="profile">
                    {winConChampion && (
                        <div className="flex items-center gap-4 p-2 bg-slate-200 dark:bg-black/20 rounded-md">
                            <ChampionIcon champion={winConChampion} version={ddragonData.version} isClickable={false} className="w-16 h-16 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{winConChampion.name}</p>
                                <InteractiveText onKeywordClick={onKeywordClick}>{deconstruction.winCondition.reasoning}</InteractiveText>
                            </div>
                        </div>
                    )}
                </SectionCard>
                <SectionCard title="Power Curve" icon="history">
                    <p><strong>Summary:</strong> <span className="italic">{deconstruction.powerCurve.summary}</span></p>
                    <InteractiveText onKeywordClick={onKeywordClick}>{deconstruction.powerCurve.details}</InteractiveText>
                </SectionCard>
            </div>
            
            <SectionCard title="Key Synergies" icon="playbook">
                <div className="space-y-3">
                    {deconstruction.keySynergies.map((synergy, index) => (
                        <div key={index} className="p-3 bg-slate-200 dark:bg-black/20 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                                {synergy.championNames.map(name => {
                                    const champ = getChampion(name);
                                    return champ ? <ChampionIcon key={name} champion={champ} version={ddragonData.version} isClickable={false} className="w-10 h-10" /> : null
                                })}
                            </div>
                            <InteractiveText onKeywordClick={onKeywordClick}>{synergy.description}</InteractiveText>
                        </div>
                    ))}
                </div>
            </SectionCard>

             <SectionCard title="Item Dependencies" icon="briefcase">
                <div className="space-y-3">
                    {deconstruction.itemDependencies.map((dep, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="w-16 text-center flex-shrink-0">
                                {getChampion(dep.championName) && <ChampionIcon champion={getChampion(dep.championName)!} version={ddragonData.version} isClickable={false} className="w-12 h-12 mx-auto" />}
                                <p className="text-xs font-bold truncate">{dep.championName}</p>
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">Core Items: {dep.items.join(', ')}</p>
                                <InteractiveText onKeywordClick={onKeywordClick}>{dep.reasoning}</InteractiveText>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};

export default CompositionDeconstructionDisplay;
