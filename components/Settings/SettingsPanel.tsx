import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../common/Button';
import { useModals } from '../../hooks/useModals';
import { X } from 'lucide-react';

interface SettingsPanelProps {}

const ToggleButton = ({ options, currentValue, onToggle }: {
    options: { value: string, label: string }[];
    currentValue: string;
    onToggle: (value: string) => void;
}) => (
    <div className="flex bg-[hsl(var(--surface-inset))] p-1 border border-[hsl(var(--border))]">
        {options.map(opt => (
            <button
                key={opt.value}
                onClick={() => onToggle(opt.value)}
                className={`relative px-3 py-1.5 text-sm font-semibold transition-colors w-full ${
                    currentValue === opt.value ? 'text-[hsl(var(--on-accent))]' : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]'
                }`}
            >
                <AnimatePresence>
                    {currentValue === opt.value && (
                        <motion.div
                            {...{
                              layoutId: "settings-toggle-bubble",
                              initial: { opacity: 0 },
                              animate: { opacity: 1 },
                              exit: { opacity: 0 },
                              transition: { type: 'spring', stiffness: 300, damping: 30 },
                            }}
                            className="absolute inset-0 bg-[hsl(var(--accent))]"
                            style={{ zIndex: 0 }}
                        />
                    )}
                </AnimatePresence>
                <span className="relative z-10">{opt.label}</span>
            </button>
        ))}
    </div>
);

export const SettingsPanel = () => {
    const { settings, setSettings } = useSettings();
    const { t } = useTranslation();
    const { modals, dispatch } = useModals();

    const handleLanguageChange = (value: string) => {
        setSettings({ language: value as 'en' | 'pt' });
    };
    
    const handleThemeChange = (value: string) => {
        setSettings({ theme: value as 'light' | 'dark' });
    };

    const onOpenProfileSettings = () => {
        dispatch({ type: 'OPEN_PROFILE_SETTINGS' });
    };
    
    const onClose = () => dispatch({ type: 'CLOSE', payload: 'settingsPanel' });

    return (
        <AnimatePresence>
            {modals.settingsPanel && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-[hsl(var(--bg-primary)_/_0.8)] backdrop-blur-sm z-50 flex items-start justify-end"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-sm bg-[hsl(var(--bg-secondary))] border-l border-[hsl(var(--border))] h-full shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-[hsl(var(--border))] flex justify-between items-center">
                            <h2 className="font-display text-xl font-bold text-[hsl(var(--text-primary))] tracking-wider">{t('settings_title')}</h2>
                             <button onClick={onClose} className="p-1 text-[hsl(var(--text-muted))] hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--text-primary))] transition-colors">
                                <X className="h-5 w-5" />
                             </button>
                        </div>
                        <div className="p-4 space-y-6">
                            <div className="space-y-2">
                                 <label className="text-sm font-medium text-[hsl(var(--text-muted))]">{t('settings_theme')}</label>
                                 <ToggleButton
                                    options={[
                                        { value: 'dark', label: t('settings_theme_dark') },
                                        { value: 'light', label: t('settings_theme_light') }
                                    ]}
                                    currentValue={settings.theme}
                                    onToggle={handleThemeChange}
                                />
                            </div>
                            <div className="space-y-2">
                                 <label className="text-sm font-medium text-[hsl(var(--text-muted))]">{t('settings_language')}</label>
                                 <ToggleButton
                                    options={[
                                        { value: 'en', label: t('settings_language_en') },
                                        { value: 'pt', label: t('settings_language_pt') }
                                    ]}
                                    currentValue={settings.language}
                                    onToggle={handleLanguageChange}
                                />
                            </div>
                             <div className="pt-4 border-t border-[hsl(var(--border))]">
                                <Button onClick={onOpenProfileSettings} variant="secondary" className="w-full">
                                    {t('settings_profile')}
                                </Button>
                             </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};