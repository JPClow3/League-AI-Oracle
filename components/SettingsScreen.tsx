
    import React, { useState, useEffect } from 'react';
    import { AppSettings, OraclePersonality, PlaybookEntry, AppTheme } from '../types';
    import { 
      ArrowUturnLeftIcon, 
      Cog6ToothIcon, 
      ArrowDownTrayIcon, 
      ArrowUpTrayIcon,
      ConfirmIcon,
      WarningIcon,
      AISparkleIcon,
      SunIcon,
      MoonIcon
    } from './icons/index';
    import { PLAYBOOK_STORAGE_KEY, DEFAULT_ORACLE_PERSONALITY, DEFAULT_THEME } from '../constants';
    
    interface SettingsScreenProps {
      onGoHome: () => void;
      currentSettings: AppSettings;
      onSaveSettings: (newSettings: Partial<AppSettings>) => void;
    }
    
    type ToastType = 'success' | 'error';

    const mockPersonalityResponses: Record<OraclePersonality, string> = {
        Default: "A teamfight is a crucial, often game-deciding, engagement involving multiple members of both teams. Success hinges on target prioritization, cooldown management, and coordinated ability usage. Positioning is paramount to protect carries while effectively applying damage and crowd control.",
        Concise: "Teamfight: Group engagement. Prioritize targets, use abilities wisely. Positioning key.",
        ForBeginners: "A teamfight is when lots of players from both teams fight together! It's super important. Try to focus on taking down the enemy who does the most damage first, and make sure your strong players are safe. Use your cool abilities to help your team win the fight!"
    };
    
    export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
      onGoHome, 
      currentSettings,
      onSaveSettings 
    }) => {
      const [selectedPersonality, setSelectedPersonality] = useState<OraclePersonality>(
        currentSettings.oraclePersonality || DEFAULT_ORACLE_PERSONALITY
      );
      const [enableAnimations, setEnableAnimations] = useState<boolean>(
        currentSettings.enableAnimations === undefined ? true : currentSettings.enableAnimations
      );
      const [selectedTheme, setSelectedTheme] = useState<AppTheme>(
        currentSettings.theme || DEFAULT_THEME
      );
      const [personalityPreview, setPersonalityPreview] = useState<string>(
        mockPersonalityResponses[currentSettings.oraclePersonality || DEFAULT_ORACLE_PERSONALITY]
      );

      const [toastMessage, setToastMessage] = useState<string | null>(null);
      const [toastType, setToastType] = useState<ToastType>('success');
    
      useEffect(() => {
        setSelectedPersonality(currentSettings.oraclePersonality || DEFAULT_ORACLE_PERSONALITY);
        setEnableAnimations(currentSettings.enableAnimations === undefined ? true : currentSettings.enableAnimations);
        setSelectedTheme(currentSettings.theme || DEFAULT_THEME);
        setPersonalityPreview(mockPersonalityResponses[currentSettings.oraclePersonality || DEFAULT_ORACLE_PERSONALITY]);
      }, [currentSettings]);
    
      const showToast = (message: string, type: ToastType = 'success', duration: number = 3000) => {
        setToastMessage(message);
        setToastType(type);
        // Clear any existing timer
        const existingToastTimer = document.body.getAttribute('data-toast-timer');
        if (existingToastTimer) {
            clearTimeout(parseInt(existingToastTimer, 10));
        }
        const timerId = setTimeout(() => {
          setToastMessage(null);
          document.body.removeAttribute('data-toast-timer');
        }, duration);
        document.body.setAttribute('data-toast-timer', timerId.toString());
      };
    
      const handlePersonalityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPersonality = event.target.value as OraclePersonality;
        setSelectedPersonality(newPersonality);
        onSaveSettings({ oraclePersonality: newPersonality });
        setPersonalityPreview(mockPersonalityResponses[newPersonality]);
        showToast("Oracle's voice updated!", "success");
      };
    
      const handleAnimationToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newEnableAnimations = event.target.checked;
        setEnableAnimations(newEnableAnimations);
        onSaveSettings({ enableAnimations: newEnableAnimations });
        showToast(newEnableAnimations ? "Visual & Ambient animations enabled." : "Visual & Ambient animations disabled.", "success");
      };

      const handleThemeChange = (theme: AppTheme) => {
        setSelectedTheme(theme);
        onSaveSettings({ theme });
        showToast(`Theme changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}.`, "success");
      };
    
      const handleExportPlaybook = () => {
        try {
          const playbookData = localStorage.getItem(PLAYBOOK_STORAGE_KEY);
          if (!playbookData || playbookData === "[]") {
            showToast("Playbook is empty. Nothing to export.", "error");
            return;
          }
          const blob = new Blob([playbookData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'lol_draft_oracle_playbook.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast("Playbook exported successfully!", "success");
        } catch (error) {
          console.error("Error exporting playbook:", error);
          showToast("Failed to export playbook.", "error");
        }
      };
    
      const handleImportPlaybook = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const importedPlaybook = JSON.parse(content);
            
            if (!Array.isArray(importedPlaybook)) {
              throw new Error("Invalid playbook format. Expected an array of entries.");
            }
            // Basic structural check for the first entry if playbook is not empty
            if (importedPlaybook.length > 0) {
              const firstEntry = importedPlaybook[0] as Partial<PlaybookEntry>; // Use Partial for safety
              if (typeof firstEntry.id !== 'string' || typeof firstEntry.name !== 'string' || !Array.isArray(firstEntry.yourTeamPicks)) {
                 throw new Error("Invalid entry structure in playbook file. Check ID, name, and team picks.");
              }
            }
    
            if (window.confirm("Are you sure you want to import this playbook? This will overwrite your current playbook.")) {
              localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(importedPlaybook));
              showToast("Playbook imported successfully!", "success");
            }
          } catch (error) {
            console.error("Error importing playbook:", error);
            showToast(error instanceof Error ? error.message : "Failed to import playbook. Invalid file structure.", "error");
          } finally {
            if (event.target) {
                event.target.value = ""; 
            }
          }
        };
        reader.readAsText(file);
      };
    
    
      return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8"> {/* Increased max-width */}
          <div className="flex justify-between items-center mb-8 sm:mb-10"> {/* Increased mb */}
            <h2 className="text-4xl sm:text-5xl font-['Playfair_Display'] text-sky-400 flex items-center"> {/* Increased font size */}
              <Cog6ToothIcon className="w-8 h-8 sm:w-9 sm:h-9 mr-3 sm:mr-3.5" /> {/* Increased icon size & mr */}
              Settings
            </h2>
            <button
              onClick={onGoHome}
              className="lol-button lol-button-secondary text-base px-4 py-2 sm:px-5 sm:py-2.5 flex items-center" /* Increased text & padding */
            >
              <ArrowUturnLeftIcon className="w-5 h-5 mr-2" /> {/* Increased icon size & mr */}
              Return Home
            </button>
          </div>
    
          <div className="space-y-10"> {/* Increased spacing */}
            {/* Oracle Personality Setting */}
            <div className="lol-panel p-6 sm:p-7 rounded-2xl"> {/* Increased padding */}
              <h3 className="text-xl font-semibold text-sky-300 mb-3.5 flex items-center font-['Inter']"> {/* Increased font size & mb */}
                <AISparkleIcon className="w-6 h-6 mr-2.5 text-yellow-400" /> Oracle's Voice {/* Increased icon size & mr */}
              </h3>
              <p className="text-base text-slate-400 mb-4 font-['Inter'] leading-relaxed"> {/* Increased font size & mb */}
                Choose how the Oracle communicates its wisdom.
              </p>
              <select
                id="oraclePersonality"
                value={selectedPersonality}
                onChange={handlePersonalityChange}
                className="w-full lol-select text-base font-['Inter'] mb-5" /* Increased font size & mb */
                aria-label="Select Oracle Personality"
              >
                <option value="Default">Default (Balanced & Strategic)</option>
                <option value="Concise">Concise (Brief & To-the-Point)</option>
                <option value="ForBeginners">For Beginners (Simple & Explanatory)</option>
              </select>
              <div className="mt-4 p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl"> {/* Increased padding & mt */}
                <p className="text-sm text-slate-400 mb-1.5 font-['Inter']">Example (Question: What is a teamfight?)</p> {/* Increased font size & mb */}
                <p className="text-base text-slate-300 italic font-['Inter'] leading-relaxed">{personalityPreview}</p> {/* Increased font size */}
              </div>
            </div>

            {/* Theme Selection Setting */}
            <div className="lol-panel p-6 sm:p-7 rounded-2xl"> {/* Increased padding */}
              <h3 className="text-xl font-semibold text-sky-300 mb-3.5 font-['Inter']">Interface Theme</h3> {/* Increased font size & mb */}
              <p className="text-base text-slate-400 mb-4 font-['Inter'] leading-relaxed"> {/* Increased font size & mb */}
                Select your preferred visual theme for the Oracle's domain.
              </p>
              <div className="flex space-x-4"> {/* Increased spacing */}
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 lol-button flex items-center justify-center text-base py-2.5 ${selectedTheme === 'dark' ? 'lol-button-primary' : 'lol-button-secondary'}`} /* Increased text & padding */
                  aria-pressed={selectedTheme === 'dark'}
                >
                  <MoonIcon className="w-5 h-5 mr-2.5" /> Dark Theme {/* Increased icon size & mr */}
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 lol-button flex items-center justify-center text-base py-2.5 ${selectedTheme === 'light' ? 'lol-button-primary' : 'lol-button-secondary'}`} /* Increased text & padding */
                  aria-pressed={selectedTheme === 'light'}
                >
                  <SunIcon className="w-5 h-5 mr-2.5" /> Light Theme {/* Increased icon size & mr */}
                </button>
              </div>
            </div>
    
            {/* Animation Setting */}
            <div className="lol-panel p-6 sm:p-7 rounded-2xl"> {/* Increased padding */}
              <h3 className="text-xl font-semibold text-sky-300 mb-3.5 font-['Inter']">Visual Effects & Animations</h3> {/* Increased font size & mb */}
              <div className="flex items-center justify-between">
                <label htmlFor="enableAnimations" className="text-base text-slate-300 flex-grow font-['Inter']"> {/* Increased font size */}
                  Enable UI & Ambient Animations
                </label>
                <div className="relative inline-block w-12 mr-2.5 align-middle select-none transition duration-200 ease-in"> {/* Increased w and mr */}
                    <input 
                        type="checkbox" 
                        name="enableAnimations" 
                        id="enableAnimations" 
                        checked={enableAnimations}
                        onChange={handleAnimationToggle}
                        className={`
                          toggle-checkbox absolute block w-7 h-7 rounded-full bg-white border-4 appearance-none cursor-pointer
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700
                          ${enableAnimations ? 'border-[var(--accent-yellow)]' : 'border-slate-500'}
                        `} /* Increased w, h */
                        style={{
                            transition: 'right 0.2s ease-in-out',
                            right: enableAnimations ? '0px' : '1.25rem', // Adjusted for new size (w-12 (48px) - w-7 (28px) = 20px = 1.25rem)
                        }}
                    />
                    <label 
                        htmlFor="enableAnimations" 
                        className={`
                          toggle-label block overflow-hidden h-7 rounded-full cursor-pointer transition-colors duration-200 ease-in-out
                          ${enableAnimations ? 'bg-[var(--accent-yellow)]' : 'bg-slate-600'}
                        `} /* Increased h */
                    ></label>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2.5 font-['Inter'] leading-relaxed"> {/* Increased font size & mt */}
                Toggles visual effects like background pulse, particle effects, border shimmers, and UI transition animations. 
                Disabling can improve performance on some devices. 
                {currentSettings.isFocusModeActive && enableAnimations && (
                     <span className="block text-sm text-yellow-300 italic mt-1.5">Focus Mode is active; some animations will remain subdued.</span> /* Increased font size & mt */
                  )}
              </p>
            </div>
    
            {/* Playbook Data Management */}
            <div className="lol-panel p-6 sm:p-7 rounded-2xl"> {/* Increased padding */}
              <h3 className="text-xl font-semibold text-sky-300 mb-3.5 font-['Inter']">Playbook Data Management</h3> {/* Increased font size & mb */}
              <p className="text-base text-slate-400 mb-5 font-['Inter'] leading-relaxed"> {/* Increased font size & mb */}
                Export your playbook to save a backup, or import a previously saved playbook.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Increased gap */}
                <button
                  onClick={handleExportPlaybook}
                  className="lol-button lol-button-secondary text-base py-2.5 flex items-center justify-center" /* Increased text & padding */
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2.5" /> Export Playbook {/* Increased icon size & mr */}
                </button>
                <div>
                  <input
                    type="file"
                    id="importPlaybookFile"
                    accept=".json"
                    onChange={handleImportPlaybook}
                    className="hidden"
                    aria-label="Import Playbook File"
                  />
                  <label
                    htmlFor="importPlaybookFile"
                    className="lol-button lol-button-secondary text-base py-2.5 w-full flex items-center justify-center cursor-pointer" /* Increased text & padding */
                    role="button" 
                    tabIndex={0} 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') (e.target as HTMLLabelElement).click(); }} 
                  >
                    <ArrowUpTrayIcon className="w-5 h-5 mr-2.5" /> Import Playbook {/* Increased icon size & mr */}
                  </label>
                </div>
              </div>
            </div>
          </div>
          
           {toastMessage && (
            <div 
                aria-live="assertive" 
                aria-atomic="true" 
                className={`toast-notification toast-show ${toastType === 'success' ? 'toast-success' : 'toast-error'} fixed bottom-5 left-1/2 transform -translate-x-1/2`}
            >
                <div className="toast-icon">
                 {toastType === 'success' ? <ConfirmIcon className="w-6 h-6"/> : <WarningIcon className="w-6 h-6"/>} {/* Increased icon size */}
                </div>
                {toastMessage}
            </div>
          )}
        </div>
      );
    };