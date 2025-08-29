import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmationState {
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    confirmVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    confirmText?: string;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    state: ConfirmationState | null;
}

export const ConfirmationModal = ({ isOpen, onClose, state }: ConfirmationModalProps) => {
    const handleConfirm = () => {
        state?.onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={state?.title || ''} size="md">
            <div className="p-6 space-y-6">
                <div className="text-lg text-text-secondary">{state?.message || ''}</div>
                <div className="flex justify-end gap-4">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant={state?.confirmVariant || 'danger'} onClick={handleConfirm}>
                        {state?.confirmText || 'Confirm'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};