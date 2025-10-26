import React, { Suspense } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import type { Page, DraftState } from '../types';
import { LoadingSpinner } from './common/LoadingSpinner';
import { FeatureErrorBoundary } from './common/FeatureErrorBoundary';

// Eager load Home for instant initial render
import { Home } from './Home/Home';

// Lazy load all other routes for better code splitting
const DraftLab = React.lazy(() => import('./DraftLab/DraftLab').then(m => ({ default: m.DraftLab })));
const Playbook = React.lazy(() => import('./Playbook/Playbook').then(m => ({ default: m.Playbook })));
const Academy = React.lazy(() => import('./Academy/Academy').then(m => ({ default: m.Academy })));
const LiveArena = React.lazy(() => import('./Arena/LiveArena').then(m => ({ default: m.LiveArena })));
const LiveDraft = React.lazy(() => import('./LiveDraft/LiveDraft').then(m => ({ default: m.LiveDraft })));
const StrategyHub = React.lazy(() => import('./StrategyHub/StrategyHub').then(m => ({ default: m.StrategyHub })));
const DailyTrial = React.lazy(() => import('./Trials/DailyTrial').then(m => ({ default: m.DailyTrial })));
const Profile = React.lazy(() => import('./Profile/Profile').then(m => ({ default: m.Profile })));
const MetaOracle = React.lazy(() => import('./MetaOracle/MetaOracle').then(m => ({ default: m.MetaOracle })));
const DraftScenarios = React.lazy(() => import('./Scenarios/DraftScenarios').then(m => ({ default: m.DraftScenarios })));

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
                return (
                    <FeatureErrorBoundary componentName="Draft Lab" onReset={props.handleTourComplete}>
                        <DraftLab startTour={props.startLabTour} onTourComplete={props.handleTourComplete} navigateToAcademy={props.navigateToAcademy} />
                    </FeatureErrorBoundary>
                );
                return <DraftLab startTour={props.startLabTour} onTourComplete={props.handleTourComplete} navigateToAcademy={props.navigateToAcademy} />;
                return (
                    <FeatureErrorBoundary componentName="Live Draft" onReset={props.resetLiveDraft}>
                        <LiveDraft draftState={props.liveDraftState} setDraftState={props.setLiveDraftState} onReset={props.resetLiveDraft} />
                    </FeatureErrorBoundary>
                );
                return <LiveDraft draftState={props.liveDraftState} setDraftState={props.setLiveDraftState} onReset={props.resetLiveDraft} />;
                return (
                    <FeatureErrorBoundary componentName="Draft Arena" onReset={props.resetArena}>
                        <LiveArena draftState={props.arenaDraftState} setDraftState={props.setArenaDraftState} onReset={props.resetArena} onNavigateToForge={props.loadDraftAndNavigate} />
                    </FeatureErrorBoundary>
                );
                return <LiveArena draftState={props.arenaDraftState} setDraftState={props.setArenaDraftState} onReset={props.resetArena} onNavigateToForge={props.loadDraftAndNavigate} />;
                return (
                    <FeatureErrorBoundary componentName="Playbook">
                        <Playbook onLoadDraft={props.loadDraftAndNavigate} setCurrentPage={props.setCurrentPage} navigateToAcademy={props.navigateToAcademy} />
                    </FeatureErrorBoundary>
                );
                return <Playbook onLoadDraft={props.loadDraftAndNavigate} setCurrentPage={props.setCurrentPage} navigateToAcademy={props.navigateToAcademy} />;
                return (
                    <FeatureErrorBoundary componentName="Academy">
                        <Academy initialLessonId={props.academyInitialLessonId} onHandled={() => props.setAcademyInitialLessonId(undefined)} loadChampionsAndNavigateToForge={props.loadChampionsAndNavigateToForge} />
                    </FeatureErrorBoundary>
                );
                return <Academy initialLessonId={props.academyInitialLessonId} onHandled={() => props.setAcademyInitialLessonId(undefined)} loadChampionsAndNavigateToForge={props.loadChampionsAndNavigateToForge} />;
                return (
                    <FeatureErrorBoundary componentName="Strategy Hub">
                        <StrategyHub
                            initialTab={props.strategyHubInitialTab}
                            initialSearchTerm={props.strategyHubInitialSearch}
                            onLoadChampionInLab={props.loadChampionToLab}
                            onHandled={() => {
                                props.setStrategyHubInitialTab('champions');
                                props.setStrategyHubInitialSearch(null);
                            }}
                        />
                    </FeatureErrorBoundary>
                );
                />;
                return (
                    <FeatureErrorBoundary componentName="Meta Oracle">
                        <MetaOracle />
                    </FeatureErrorBoundary>
                );
                return <MetaOracle />;
                return (
                    <FeatureErrorBoundary componentName="Daily Trial">
                        <DailyTrial navigateToAcademy={props.navigateToAcademy} />
                    </FeatureErrorBoundary>
                );
                return <DailyTrial navigateToAcademy={props.navigateToAcademy} />;
                return (
                    <FeatureErrorBoundary componentName="Draft Scenarios">
                        <DraftScenarios />
                    </FeatureErrorBoundary>
                );
                return <DraftScenarios />;
                return (
                    <FeatureErrorBoundary componentName="Profile">
                        <Profile setCurrentPage={props.setCurrentPage} navigateToAcademy={props.navigateToAcademy} />
                    </FeatureErrorBoundary>
                );
                return <Profile setCurrentPage={props.setCurrentPage} navigateToAcademy={props.navigateToAcademy} />;
            default:
                return <Home setCurrentPage={props.setCurrentPage} navigateToArmory={props.navigateToArmory} />;
        }
    };

    const nodeRef = pageRefs.current[currentPage] ?? (pageRefs.current[currentPage] = React.createRef());
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <LoadingSpinner size="lg" />
                        </div>
                    }>
                        {renderPage()}
                    </Suspense>
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <LoadingSpinner size="lg" />
                        </div>
                    }>
                        {renderPage()}
                    </Suspense>
        <TransitionGroup>
            <CSSTransition key={currentPage} nodeRef={nodeRef} timeout={300} classNames="page">
                <div ref={nodeRef} className="page-container">
                    {renderPage()}
                </div>
            </CSSTransition>
        </TransitionGroup>
    );
};