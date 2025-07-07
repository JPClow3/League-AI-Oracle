import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { CounterIntelToast } from './CounterIntelToast';
import { ContextualTipToast } from './ContextualTipToast';
import { KNOWLEDGE_BASE } from '../../data/knowledgeBase';

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
