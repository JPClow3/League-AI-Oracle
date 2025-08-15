import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmationState {
    title: string;
    message: string;
    onConfirm: () => void;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    state: ConfirmationState | null;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, state }) => {
    const handleConfirm = () => {
        state?.onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={state?.title || ''}>
            <div className="p-6 space-y-6">
                <p className="text-lg text-gray-300">{state?.message || ''}</p>
                <div className="flex justify-end gap-4">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
