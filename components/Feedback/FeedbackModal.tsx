import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { FeedbackCategory, DraftState } from '../../types';
import { toSavedDraft } from '../../lib/draftUtils';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    draftState: DraftState;
}

const CATEGORIES: FeedbackCategory[] = [
    'AI Suggestion Quality',
    'Bug Report',
    'Feature Request',
    'UI/UX Feedback',
    'Other'
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, draftState }) => {
    const [category, setCategory] = useState<FeedbackCategory>('AI Suggestion Quality');
    const [comments, setComments] = useState('');
    const [includeDraft, setIncludeDraft] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!comments.trim()) {
            toast.error("Please enter some feedback before submitting.");
            return;
        }

        setIsSubmitting(true);
        const feedbackData = {
            category,
            comments,
            timestamp: new Date().toISOString(),
            draftContext: includeDraft ? toSavedDraft(draftState) : null,
        };

        // In a real application, this would be an API call.
        // We'll simulate it with a timeout and console.log.
        console.log("Submitting feedback:", feedbackData);

        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Thank you! Your feedback has been submitted.");
            onClose();
            setComments('');
        }, 1000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Give Feedback">
            <div className="p-4 space-y-4">
                <div>
                    <label htmlFor="feedback-category" className="block text-sm font-medium text-gray-300 mb-1">
                        Feedback Category
                    </label>
                    <select
                        id="feedback-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                        className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-bg))]"
                    >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="feedback-comments" className="block text-sm font-medium text-gray-300 mb-1">
                        Comments
                    </label>
                    <textarea
                        id="feedback-comments"
                        rows={6}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Please be as detailed as possible. What were you doing? What did you expect to happen?"
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-bg))] text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="include-draft"
                        checked={includeDraft}
                        onChange={(e) => setIncludeDraft(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[rgb(var(--color-accent-bg))] focus:ring-[rgb(var(--color-accent-bg))]"
                    />
                    <label htmlFor="include-draft" className="text-sm text-gray-300">
                        Include current Draft Lab state for context
                    </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
