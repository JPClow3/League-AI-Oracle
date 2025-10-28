import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../common/Button';
import { useModals } from '../../hooks/useModals';

export const Footer = () => {
  const { t } = useTranslation();
  const { dispatch } = useModals();

  const handleOpenShortcuts = () => {
    dispatch({ type: 'OPEN_KEYBOARD_SHORTCUTS' });
  };

  return (
    <footer className="mt-8 py-6 border-t border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-4 text-center text-[hsl(var(--text-muted))] text-xs space-y-2">
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <Button variant="ghost" onClick={() => dispatch({ type: 'OPEN_FEEDBACK' })}>Give Feedback</Button>
          <span className="hidden md:inline">|</span>
          <Button variant="ghost" onClick={handleOpenShortcuts}>Keyboard Shortcuts</Button>
          <span className="hidden md:inline">|</span>
          <p className="hidden md:inline">Press <kbd className="font-sans font-semibold text-text-secondary px-1.5 py-0.5 bg-surface-secondary rounded border border-border">Ctrl+K</kbd> to command</p>
        </div>
        <p>{t('footer_tagline')}</p>
        <p>&copy; {new Date().getFullYear()}. {t('footer_disclaimer')}</p>
      </div>
    </footer>
  );
};