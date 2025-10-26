import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import type { Page, DraftState } from '../types';

import { Home } from './Home/Home';
import { DraftLab } from './DraftLab/DraftLab';
import { Playbook } from './Playbook/Playbook';
import { Academy } from './Academy/Academy';
import { LiveArena } from './Arena/LiveArena';
import { LiveDraft } from './LiveDraft/LiveDraft';
import { StrategyHub } from './StrategyHub/StrategyHub';
import { DailyTrial } from './Trials/DailyTrial';
import { Profile } from './Profile/Profile';
import { MetaOracle } from './MetaOracle/MetaOracle';
import { DraftScenarios } from './Scenarios/DraftScenarios';

interface RouterProps {
    currentPage: Page;
    pageRefs: React.MutableRefObject<{ [key: string]: React.RefObject<HTMLDivElement> }>;
    
    // Props for pages
    setCurrentPage: (page: Page) => void;
    navigateToArmory: (tab: 'champions' | 'intel') => void;
    startLabTour: boolean;
    handleTourComplete: () => void;
    navigateToAcademy: (lessonId: string) => void;
    liveDraftState: DraftState;
    setLiveDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
    resetLiveDraft: () => void;
    arenaDraftState: DraftState;
    setArenaDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
    resetArena: () => void;
    loadDraftAndNavigate: (draft: DraftState) => void;
    academyInitialLessonId?: string;
    setAcademyInitialLessonId: (id: string | undefined) => void;
    strategyHubInitialTab: 'champions' | 'intel';
    strategyHubInitialSearch: string | null;
    loadChampionToLab: (championId: string, role?: string) => void;
    loadChampionsAndNavigateToForge: (championIds: string[]) => void;
    setStrategyHubInitialTab: (tab: 'champions' | 'intel') => void;
    setStrategyHubInitialSearch: (term: string | null) => void;
}

export const Router = (props: RouterProps) => {
    const { currentPage, pageRefs } = props;

    const renderPage = () => {
        switch (currentPage) {
            case 'Home':
                return <Home setCurrentPage={props.setCurrentPage} navigateToArmory={props.navigateToArmory} />;
            case 'Strategy Forge':
                return <DraftLab startTour={props.startLabTour} onTourComplete={props.handleTourComplete} navigateToAcademy={props.navigateToAcademy} />;
            case 'Live Co-Pilot':
                return <LiveDraft draftState={props.liveDraftState} setDraftState={props.setLiveDraftState} onReset={props.resetLiveDraft} />;
            case 'Draft Arena':
                return <LiveArena draftState={props.arenaDraftState} setDraftState={props.setArenaDraftState} onReset={props.resetArena} onNavigateToForge={props.loadDraftAndNavigate} />;
            case 'The Archives':
                return <Playbook onLoadDraft={props.loadDraftAndNavigate} setCurrentPage={props.setCurrentPage} navigateToAcademy={props.navigateToAcademy} />;
            case 'Academy':
                return <Academy initialLessonId={props.academyInitialLessonId} onHandled={() => props.setAcademyInitialLessonId(undefined)} loadChampionsAndNavigateToForge={props.loadChampionsAndNavigateToForge} />;
            case 'The Armory':
                return <StrategyHub
                    initialTab={props.strategyHubInitialTab}
                    initialSearchTerm={props.strategyHubInitialSearch}
                    onLoadChampionInLab={props.loadChampionToLab}
                    onHandled={() => {
                        props.setStrategyHubInitialTab('champions');
                        props.setStrategyHubInitialSearch(null);
                    }}
                />;
            case 'The Oracle':
                return <MetaOracle />;
            case 'Daily Challenge':
                return <DailyTrial navigateToAcademy={props.navigateToAcademy} />;
            case 'Draft Scenarios':
                return <DraftScenarios />;
            case 'Profile':
                return <Profile setCurrentPage={props.setCurrentPage} navigateToAcademy={props.navigateToAcademy} />;
            default:
                return <Home setCurrentPage={props.setCurrentPage} navigateToArmory={props.navigateToArmory} />;
        }
    };

    const nodeRef = pageRefs.current[currentPage] ?? (pageRefs.current[currentPage] = React.createRef());

    return (
        <TransitionGroup>
            <CSSTransition key={currentPage} nodeRef={nodeRef} timeout={300} classNames="page">
                <div ref={nodeRef} className="page-container">
                    {renderPage()}
                </div>
            </CSSTransition>
        </TransitionGroup>
    );
};