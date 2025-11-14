import './styles/ui-utilities.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { SettingsProvider } from './hooks/useSettings';
import { UserProfileProvider } from './hooks/useUserProfile';
import { ModalProvider } from './hooks/useModals';
import { DraftProvider } from './contexts/DraftContext';
import { ChampionProvider } from './contexts/ChampionContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loader } from './components/common/Loader';
import { Button } from './components/common/Button';
import { isIndexedDBSupported } from './lib/indexedDb';
import { logger } from './lib/logger';
import { featureFlags } from './lib/featureFlags';
import { offlineService } from './lib/offlineService';
import { analytics } from './lib/analytics';

export function Root() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize logging service
        logger.initialize();

        // Initialize analytics
        analytics.initialize();

        // Initialize feature flags
        await featureFlags.initialize();

        // Initialize offline service
        await offlineService.initialize();

        // Check IndexedDB support
        if (!isIndexedDBSupported()) {
          console.warn('IndexedDB not supported. Some features may be limited.');
          logger.warn('IndexedDB not supported', { userAgent: navigator.userAgent });
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization failed:', error);
        logger.error(error instanceof Error ? error : new Error('Initialization failed'));
        setInitError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
    initialize();
  }, []);

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--bg-primary))] p-4">
        <div className="text-center bg-[hsl(var(--error)_/_0.1)] p-8 border border-[hsl(var(--error)_/_0.2)] text-[hsl(var(--error))] max-w-md rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Initialization Error</h1>
          <p className="mb-4 text-[hsl(var(--text-secondary))]">{initError}</p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--bg-primary))]">
        <Loader messages={['Initializing services...', 'Loading application...']} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <SettingsProvider>
          <UserProfileProvider>
            <ModalProvider>
              <ChampionProvider>
                <DraftProvider>
                  <App />
                </DraftProvider>
              </ChampionProvider>
            </ModalProvider>
          </UserProfileProvider>
        </SettingsProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
