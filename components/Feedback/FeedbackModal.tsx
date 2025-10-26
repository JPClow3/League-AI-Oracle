import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { FeedbackCategory } from '../../types';
import { toSavedDraft } from '../../lib/draftUtils';
import toast from 'react-hot-toast';
import { useModals } from '../../hooks/useModals';
import { useDraft } from '../../contexts/DraftContext';
import { TextArea } from '../common/TextArea';

type FeedbackModalProps = Record<string, never>;

const CATEGORIES: FeedbackCategory[] = [
    'AI Suggestion Quality',
    'Bug Report',
    'Feature Request',
    'UI/UX Feedback',
    'Other'
];

export const FeedbackModal = () => {
    const { modals, dispatch } = useModals();
    const { draftState } = useDraft();
    const [category, setCategory] = useState<FeedbackCategory>('AI Suggestion Quality');
    const [comments, setComments] = useState('');
    const [includeDraft, setIncludeDraft] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onClose = () => dispatch({ type: 'CLOSE', payload: 'feedback' });

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
        <Modal isOpen={modals.feedback} onClose={onClose} title="Give Feedback">
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="feedback-category" className="block text-sm font-medium text-text-secondary mb-1">
                        Feedback Category
                    </label>
                    <select
                        id="feedback-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                        className="w-full bg-secondary p-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="feedback-comments" className="block text-sm font-medium text-text-secondary mb-1">
                        Comments
                    </label>
                    <TextArea
                        id="feedback-comments"
                        rows={6}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Please be as detailed as possible. What were you doing? What did you expect to happen?"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        id="include-draft"
                        type="checkbox"
                        checked={includeDraft}
                        onChange={(e) => setIncludeDraft(e.target.checked)}
                        className="h-4 w-4 rounded border-border-secondary bg-surface-secondary text-accent focus:ring-accent"
                    />
                    <label htmlFor="include-draft" className="text-sm text-text-secondary">
                        Include current draft context (helpful for AI feedback)
                    </label>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};