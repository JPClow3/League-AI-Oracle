import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { ArenaBotPersona, DraftState, TeamSide } from '../../types';
import { usePlaybook } from '../../hooks/usePlaybook';
import { TagInput } from '../common/TagInput';

interface ArenaSaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    draftState: DraftState;
    botPersona: ArenaBotPersona;
    userSide: TeamSide;
}

export const ArenaSaveModal = ({ isOpen, onClose, draftState, botPersona, userSide }: ArenaSaveModalProps) => {
    const [isSaving, setIsSaving] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [draftTags, setDraftTags] = useState<string[]>([]);
    const { addEntry: addPlaybookEntry, latestEntry } = usePlaybook();

    useEffect(() => {
        if (isOpen) {
            const defaultName = `Arena Practice vs ${botPersona}`;
            const existingEntry = latestEntry?.name.startsWith(defaultName);
            // Defer state updates to avoid cascading renders
            setTimeout(() => {
                setDraftName(existingEntry ? `${defaultName} #${(Math.random() * 100).toFixed(0)}` : defaultName);
                setDraftTags([`vs ${botPersona}`]);
            }, 0);
        }
    }, [isOpen, botPersona, latestEntry]);
    
    const handleConfirmSave = async () => {
        if (draftName.trim() && !isSaving) {
            setIsSaving(true);
            const success = await addPlaybookEntry(draftName.trim(), draftState, null, `Practice draft against the ${botPersona} AI.`, userSide, draftTags);
            setIsSaving(false);
            if (success) {
                onClose();
            }
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={() => { if(!isSaving) {onClose();} }} 
            title="Archive Arena Draft"
        >
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="draftName" className="block text-sm font-medium text-text-secondary">Draft Name</label>
                    <input
                        id="draftName"
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="e.g., Arena Practice vs Dive"
                        className="w-full mt-1 px-3 py-2 bg-surface-secondary border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                 <div>
                    <label htmlFor="draftTags" className="block text-sm font-medium text-text-secondary">Tags</label>
                    <TagInput tags={draftTags} onTagsChange={setDraftTags} placeholder="e.g. Practice, Counter-Engage" />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirmSave} disabled={!draftName.trim() || isSaving}>
                        {isSaving ? 'Saving...' : 'Save to The Archives'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};