import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './hooks/useSettings';
import { UserProfileProvider } from './hooks/useUserProfile';
import { ModalProvider } from './hooks/useModals';
import { DraftProvider } from './contexts/DraftContext';
import { ChampionProvider } from './contexts/ChampionContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <UserProfileProvider>
        <ModalProvider>
          <DraftProvider>
            <ChampionProvider>
              <App />
            </ChampionProvider>
          </DraftProvider>
        </ModalProvider>
      </UserProfileProvider>
    </SettingsProvider>
  </React.StrictMode>
);
