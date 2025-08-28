
import React, { createContext, useContext, useReducer, useMemo } from 'react';

// --- Modal State Management ---
export type ModalState = {
    profileSettings: boolean;
    settingsPanel: boolean;
    feedback: boolean;
    onboarding: boolean;
};

export type ModalAction =
    | { type: 'OPEN_PROFILE_SETTINGS' }
    | { type: 'OPEN_SETTINGS_PANEL' }
    | { type: 'OPEN_FEEDBACK' }
    | { type: 'OPEN_ONBOARDING' }
    | { type: 'CLOSE_ALL' }
    | { type: 'CLOSE', payload: keyof ModalState };

const initialModalState: ModalState = {
    profileSettings: false,
    settingsPanel: false,
    feedback: false,
    onboarding: false,
};

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
    switch (action.type) {
        case 'OPEN_PROFILE_SETTINGS':
            return { ...initialModalState, profileSettings: true }; // Close others for focus
        case 'OPEN_SETTINGS_PANEL':
            return { ...initialModalState, settingsPanel: true };
        case 'OPEN_FEEDBACK':
            return { ...initialModalState, feedback: true };
        case 'OPEN_ONBOARDING':
            return { ...initialModalState, onboarding: true };
        case 'CLOSE':
            return { ...state, [action.payload]: false };
        case 'CLOSE_ALL':
            return initialModalState;
        default:
            return state;
    }
};
// --- End Modal State Management ---


interface ModalContextType {
    modals: ModalState;
    dispatch: React.Dispatch<ModalAction>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [modals, dispatch] = useReducer(modalReducer, initialModalState);

    const contextValue = useMemo(() => ({ modals, dispatch }), [modals]);

    return React.createElement(
        ModalContext.Provider,
        { value: contextValue },
        children
    );
};

export const useModals = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModals must be used within a ModalProvider');
    }
    return context;
};
