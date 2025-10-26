import React, { lazy, Suspense } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import type { Page, DraftState } from './types';
import { Loader } from './components/common/Loader';

// Lazy load all page components for code splitting
const Home = lazy(() => import('./components/Home/Home').then(m => ({ default: m.Home })));
const DraftLab = lazy(() => import('./components/DraftLab/DraftLab').then(m => ({ default: m.DraftLab })));
const Playbook = lazy(() => import('./components/Playbook/Playbook').then(m => ({ default: m.Playbook })));
const Academy = lazy(() => import('./components/Academy/Academy').then(m => ({ default: m.Academy })));
const LiveArena = lazy(() => import('./components/Arena/LiveArena').then(m => ({ default: m.LiveArena })));
const LiveDraft = lazy(() => import('./components/LiveDraft/LiveDraft').then(m => ({ default: m.LiveDraft })));
const StrategyHub = lazy(() => import('./components/StrategyHub/StrategyHub').then(m => ({ default: m.StrategyHub })));
const DailyTrial = lazy(() => import('./components/Trials/DailyTrial').then(m => ({ default: m.DailyTrial })));
const Profile = lazy(() => import('./components/Profile/Profile').then(m => ({ default: m.Profile })));
const MetaOracle = lazy(() => import('./components/MetaOracle/MetaOracle').then(m => ({ default: m.MetaOracle })));
const DraftScenarios = lazy(() => import('./components/Scenarios/DraftScenarios').then(m => ({ default: m.DraftScenarios })));

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
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader messages={["Loading page..."]} interval={3000} />
            </div>
        }>
            <TransitionGroup>
                <CSSTransition key={currentPage} nodeRef={nodeRef} timeout={300} classNames="page">
                    <div ref={nodeRef} className="page-container">
                        {renderPage()}
                    </div>
                </CSSTransition>
            </TransitionGroup>
        </Suspense>
    );
};