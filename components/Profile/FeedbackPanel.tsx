import type { RecentFeedback } from '../../types';
import { CheckCircle2, GraduationCap } from 'lucide-react';

interface FeedbackPanelProps {
    feedback: RecentFeedback[];
}

const getIcon = (type: RecentFeedback['type']) => {
    if (type === 'adjustment') {
        return (
            <div className="bg-success/20 text-success rounded-full p-1.5">
                 <CheckCircle2 className="h-5 w-5" />
            </div>
        )
    }
    return (
        <div className="bg-secondary-accent/20 text-secondary-accent rounded-full p-1.5">
             <GraduationCap className="h-5 w-5" />
        </div>
    )
}

export const FeedbackPanel = ({ feedback }: FeedbackPanelProps) => {
    return (
        <div className="bg-surface-primary p-6 rounded-xl shadow-lg border border-border-primary">
            <h2 className="text-xl font-bold text-text-primary mb-4">Actionable Feedback</h2>
            <ul className="space-y-3">
                {feedback.map(item => (
                    <li key={item.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getIcon(item.type)}</div>
                        <p className="text-sm text-text-secondary">{item.message}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};
