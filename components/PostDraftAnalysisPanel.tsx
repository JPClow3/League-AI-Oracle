
import React, { useState } from 'react';
import { AIAnalysis, AIChat, DDragonData, DraftState } from '../types';
import { Spinner } from './common/Spinner';
import InteractiveText from './common/InteractiveText';
import FullAnalysisDisplay from './common/FullAnalysisDisplay';
import { Icon } from './common/Icon';

interface TabButtonProps {
    name: string;
    isActive: boolean;
    onClick: () => void;
}
const TabButton: React.FC<TabButtonProps> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold transition-colors
        ${isActive ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>
        {name}
    </button>
);

interface PostDraftAnalysisPanelProps {
    analysis: AIAnalysis;
    draftState: DraftState;
    handleExportImage: () => void;
    isExporting: boolean;
    handleShare: () => void;
    copied: boolean;
    handleSaveToHistory: () => void;
    setPlaybookModalOpen: (isOpen: boolean) => void;
    chat: AIChat | null;
    handleSendChatMessage: (message: string) => void;
    isChatLoading: boolean;
    draftNotes: string;
    setDraftNotes: (notes: string) => void;
    ddragonData: DDragonData;
    onKeywordClick: (lessonId: string) => void;
}

export const PostDraftAnalysisPanel: React.FC<PostDraftAnalysisPanelProps> = ({
    analysis, draftState, handleExportImage, isExporting, handleShare, copied, handleSaveToHistory, setPlaybookModalOpen,
    chat, handleSendChatMessage, isChatLoading, draftNotes, setDraftNotes, ddragonData, onKeywordClick
}) => {
    const [activeTab, setActiveTab] = useState<'ai' | 'notes'>('ai');
    const [chatMessage, setChatMessage] = useState('');

    const onSendMessage = () => {
        if (!chatMessage.trim()) return;
        handleSendChatMessage(chatMessage);
        setChatMessage('');
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full animate-slide-fade-in">
            <div className="flex border-b border-slate-200 dark:border-slate-700 px-2">
                <TabButton name="AI Analysis" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
                <TabButton name="Draft Notes" isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
            </div>
            <div className="p-4 flex-grow overflow-y-auto">
                {activeTab === 'ai' ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-display text-teal-600 dark:text-teal-400">In-Depth Analysis</h3>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-start">
                            <button onClick={handleExportImage} disabled={isExporting} className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-semibold flex items-center gap-1 disabled:opacity-50">
                                {isExporting ? <Spinner size="h-4 w-4" /> : <Icon name="image" className="w-4 h-4" />}
                                {isExporting ? 'Exporting...' : 'Export'}
                            </button>
                            <button onClick={handleShare} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold flex items-center gap-1">
                                {copied ? <><Icon name="check" className="w-4 h-4" /> Copied!</> : <><Icon name="copy" className="w-4 h-4" /> Share</>}
                            </button>
                            <button onClick={handleSaveToHistory} className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-semibold">Save History</button>
                            <button onClick={() => setPlaybookModalOpen(true)} className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-semibold">Save Playbook</button>
                        </div>
                        <FullAnalysisDisplay analysis={analysis} ddragonData={ddragonData} onKeywordClick={onKeywordClick} draftState={draftState} />
                        {chat && (
                            <div className="p-3 rounded-lg bg-slate-100 dark:bg-black/20">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Follow-up Questions</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto mb-2 pr-2">
                                    {chat.history.map((msg, i) => (
                                        <div key={i} className={`p-2 rounded-lg text-sm ${msg.isUser ? 'bg-indigo-100 dark:bg-indigo-900/50 ml-auto' : 'bg-slate-200 dark:bg-slate-700/50'}`} style={{maxWidth: '85%'}}>
                                            <InteractiveText onKeywordClick={onKeywordClick}>{msg.text}</InteractiveText>
                                        </div>
                                    ))}
                                    {isChatLoading && <div className="flex justify-start p-2"><Spinner size="h-5 w-5" /></div>}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSendMessage()} placeholder="Ask about the analysis..." className="w-full p-2 text-sm rounded bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"/>
                                    <button onClick={onSendMessage} disabled={isChatLoading || !chatMessage.trim()} className="px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">Send</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col animate-fade-in">
                        <h3 className="text-xl font-display text-slate-700 dark:text-slate-300 mb-2">Draft Notes</h3>
                        <textarea
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                            placeholder="Track summoner spell cooldowns, strategic reminders, enemy item spikes..."
                            className="w-full flex-grow p-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md resize-none focus:ring-1 focus:ring-indigo-500 outline-none min-h-[400px]"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
