import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { KNOWLEDGE_BASE } from '../../data/knowledgeBase';
import { CounterIntelligence, ContextualDraftTip } from '../../types';
import { Icon } from './Icon';

// --- Inlined Components ---

// From: CounterIntelToast.tsx
const CounterIntelToast: React.FC<{ championName: string; intel: CounterIntelligence; onClose: () => void; }> = ({ championName, intel, onClose }) => {
    return (
        <div className="w-80 bg-slate-800/80 dark:bg-slate-900/80 border border-amber-500/50 rounded-lg shadow-2xl p-4 animate-slide-fade-in glass-effect">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-400">Enemy Picked</p>
                    <h3 className="text-xl font-bold font-display text-amber-400">{championName}</h3>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                    <Icon name="x" className="w-5 h-5"/>
                </button>
            </div>
            <div className="mt-3 space-y-2">
                <div>
                    <h4 className="font-semibold text-xs text-slate-300">Vulnerable To:</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {intel.vulnerabilities.map(vuln => (
                            <span key={vuln} className="px-2 py-0.5 text-xs bg-rose-900/80 text-rose-300 rounded-full">{vuln}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-xs text-slate-300">Quick Tip:</h4>
                    <p className="text-sm text-slate-300">{intel.quickTip}</p>
                </div>
            </div>
        </div>
    );
};

// From: ContextualTipToast.tsx
const ContextualTipToast: React.FC<{ tip: ContextualDraftTip; lessonTitle: string; onClose: () => void; onLearnMore: () => void; }> = ({ tip, lessonTitle, onClose, onLearnMore }) => {
    return (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg animate-slide-fade-in">
            <div className="bg-slate-800/80 dark:bg-slate-900/80 border border-indigo-500/50 rounded-lg shadow-2xl p-4 glass-effect">
                <div className="flex items-start gap-3">
                    <Icon name="brain" className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                        <h3 className="font-semibold text-indigo-400">Oracle's Insight</h3>
                        <p className="text-sm text-slate-200">
                            {tip.insight}
                            <button onClick={onLearnMore} className="ml-2 font-semibold text-amber-400 hover:text-amber-300 underline">
                                [Learn about {lessonTitle}]
                            </button>
                        </p>
                    </div>
                     <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                        <Icon name="x" className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Hub Component ---

interface NotificationHubProps {
    onNavigateToLesson: (lessonId: string) => void;
}

export const NotificationHub: React.FC<NotificationHubProps> = ({ onNavigateToLesson }) => {
    const { notifications, removeNotification } = useNotificationStore();

    // Separate notifications by their intended position on the screen
    const topRightNotifications = notifications.filter(n => n.type === 'counterIntel');
    const bottomCenterNotifications = notifications.filter(n => n.type === 'contextualTip');

    return (
        <>
            {/* Top-Right Hub for Counter Intel */}
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-3">
                {topRightNotifications.map(notification => (
                    <CounterIntelToast
                        key={notification.id}
                        championName={notification.payload.championName}
                        intel={notification.payload.intel}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>

            {/* Bottom-Center Hub for Contextual Tips */}
            <>
                 {bottomCenterNotifications.map(notification => {
                     const lesson = KNOWLEDGE_BASE.find(l => l.id === notification.payload.suggestedLessonId);
                     if (!lesson) return null;
                     return (
                         <ContextualTipToast
                             key={notification.id}
                             tip={notification.payload}
                             lessonTitle={lesson.title}
                             onClose={() => removeNotification(notification.id)}
                             onLearnMore={() => {
                                 onNavigateToLesson(notification.payload.suggestedLessonId);
                                 removeNotification(notification.id);
                             }}
                         />
                     );
                 })}
            </>
        </>
    );
};