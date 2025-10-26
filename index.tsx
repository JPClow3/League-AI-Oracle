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
import { isIndexedDBSupported } from './lib/indexedDb';
import { logger } from './lib/logger';
import { featureFlags } from './lib/featureFlags';
import { offlineService } from './lib/offlineService';
import { analytics } from './lib/analytics';

function Root() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        console.log('🚀 Initializing League AI Oracle...');

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
        
        console.log('✅ All services initialized');
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Initialization Error</h1>
        <p>{initError}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
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
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);