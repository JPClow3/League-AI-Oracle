
# LoL Draft Oracle

**Version:** 1.0.0 (Inferred)
**Powered by:** Gemini API & Riot Games Data Dragon

## Overview

The LoL Draft Oracle is an advanced League of Legends draft assistant designed to provide players with AI-driven strategic insights and recommendations. Leveraging the power of Google's Gemini API and up-to-date game data from Riot's Data Dragon (DDragon), the Oracle analyzes team compositions, suggests champion picks and bans, offers itemization wisdom, and helps players deepen their strategic understanding of the game.

Whether you're preparing for a solo queue match, strategizing for competitive play, or simply exploring the vast world of League of Legends, the Oracle aims to be your trusted guide, offering personalized advice and learning opportunities.

## Features

The LoL Draft Oracle is packed with features to cover various aspects of League of Legends strategy:

### Core Drafting & Analysis
*   **Guided Drafting:** Supports both **Solo Queue** (standard 5-ban) and **Competitive** (multi-phase ban/pick) draft formats.
*   **AI-Powered Suggestions:**
    *   **Pick Suggestions:** Recommends 1-3 champions for the current pick turn, providing detailed reasoning based on team synergy, counters, meta relevance, and user preferences.
    *   **Ban Suggestions:** Suggests 1-3 champions to ban, explaining the strategic impact based on meta threats and composition disruption.
    *   **Enemy Item Spike Warnings:** Provides alerts on potential item power spikes for key enemy champions.
*   **Full Draft Analysis:** Offers a comprehensive breakdown of a completed or in-progress draft, covering:
    *   Team Identities & Expected Tempo
    *   Damage Profiles
    *   Oracle's Armory (Item Build Recommendations per champion)
    *   Strategic Focus (Laning, Power Spikes, Objectives, Teamfights)
    *   Enemy Threats & Counterplay
    *   Impact of Bans
    *   User Preference Alignment (if applicable)
    *   Key In-Game Reminders (Cheat Sheet)
*   **MVP Analysis:** Identifies a "Most Valuable Player" (MVP) champion from your team based on the Oracle's full draft analysis, highlighting their critical role.
*   **Follow-up Queries:** Allows users to ask contextual follow-up questions after a full draft analysis, maintaining conversation history with the Oracle.
*   **Team Analytics Dashboard:** Provides a quick overview of your team's and the enemy team's composition, including damage profile, CC score, engage potential, and top archetypes.
*   **Draft Timeline (Competitive Mode):** Visualizes the phases of a competitive draft.
*   **Role Swap:** Allows reassigning roles for picked champions within a team during a draft.
*   **Undo Last Action:** Reverts the last pick or ban, allowing for corrections.

### Strategic Tools & Learning
*   **Draft Lab:** A sandbox environment to freely experiment with team compositions (picks and bans for both teams) and request an immediate full analysis from the Oracle.
    *   **Threat Assessment Mode:** Allows focusing the Oracle's analysis on a specific enemy champion within the Draft Lab context.
*   **Strategy Explorer:** Query the Oracle about specific champions, item synergies, counters, or general LoL strategies.
*   **Oracle's Armory:** An item encyclopedia to explore all purchasable Summoner's Rift items. Users can view DDragon stats, descriptions, build paths, and seek the Oracle's wisdom on an item's strategic niche, ideal users, synergies, and common mistakes.
*   **Pre-Game Tactical Briefing (Home Screen):** Select a champion to receive a concise meta-analysis from the Oracle, including their current identity, fated allies, and grave threats.
*   **Deep Dive Consultation (Home Screen):** Select up to two champions and pose a specific strategic question to the Oracle for a focused analysis.
*   **Interactive Lessons:**
    *   **Concept Spotlights:** Learn core LoL concepts (e.g., Team Compositions, Win Conditions, Counter-Picking).
    *   **Champion Personas:** Lessons can be delivered by a chosen champion, with the Oracle adopting their voice and personality for a more immersive experience.
    *   **Interactive Challenges:** Test understanding with scenario-based multiple-choice questions and receive AI-generated feedback.
*   **Oracle's Trials (Daily Puzzles):**
    *   Engage in daily draft-related puzzles (champion pick, item choice, crucial ban, weak link analysis).
    *   Receive rated feedback on choices, with explanations for optimal strategies.
    *   Tracks completion status.
*   **In-Game Cheat Sheet:** A condensed version of the full draft analysis, focusing on key in-game reminders, accessible via a modal.
*   **Knowledge Base (Home Screen):** Central hub for accessing learning concepts. Tracks viewed concepts.

### User Experience & Customization
*   **Command Palette (Ctrl/Cmd + K):** Quickly navigate to different screens, toggle settings, or search for champions, items, and concepts.
*   **Thematic UI:** Immersive design with dark and light themes, animations, and particle effects.
    *   **Oracle's Aura:** Subtle visual cues (particle effects, border shimmers, background pulses) change based on the Oracle's sentiment about the draft ('pleased', 'concerned', 'neutral').
*   **Onboarding Tour:** Guides new users through key features of the application on their first visit to the Home screen.
*   **Settings:**
    *   **Oracle Personality:** Choose between 'Default' (balanced), 'Concise' (brief), or 'ForBeginners' (simple explanations) to tailor AI responses.
    *   **Theme Toggle:** Switch between Dark and Light mode.
    *   **Enable Animations:** Toggle UI and ambient animations for performance or preference.
    *   **Playbook Data Management:** Export and import playbook data.
*   **Draft Preferences:** Users can specify preferred roles and a champion pool for each role, which the Oracle considers in its suggestions.
*   **Responsive Design:** Adapts to various screen sizes.
*   **Local Storage Persistence:**
    *   Current draft state (resumable).
    *   Draft history (up to 20 drafts).
    *   Playbook entries (saved strategies).
    *   User settings.
    *   Onboarding completion status.
    *   Viewed learning concepts.
    *   Oracle's Trials progress.
*   **Error Handling:** Displays user-friendly error messages for API issues or internal problems.
*   **Focus Mode:** Reduces visual distractions by subduing animations and dimming non-essential UI elements, allowing users to concentrate on the core content panel.

## How to Use

### Getting Started
1.  **Home Screen:** The central hub.
    *   **Start New Draft:** Initiates a new drafting session. You'll be prompted to choose a game mode (Ranked or Competitive) and your starting side (Blue or Red).
    *   **Continue Last Draft:** If a draft was in progress, this option allows you to resume.
    *   **Draft Lab:** Experiment with compositions without the pressure of a real draft.
    *   **Oracle's Trials:** Test your knowledge with daily puzzles.
    *   **Oracle's Armory:** Browse items and get strategic insights.
    *   **Engage the Oracle (Tactical Briefing / Deep Dive):** Get quick champion insights or ask specific strategic questions.
    *   **Expand Your Knowledge:** Access interactive lessons on core LoL concepts.
    *   **Playbook/History:** Review saved strategies or past drafts.
2.  **Onboarding:** If it's your first time, an interactive tour will guide you through the main features accessible from the Home screen.

### Main Screens & Navigation
*   **Navigation:** Use the header icons (Home, Playbook, Settings), Command Palette (Ctrl/Cmd + K), or buttons within screens to move between different sections.
*   **Drafting Screen:** The main interface for picking and banning champions.
    *   **Team Displays:** Shows picks and bans for "Your Team" and "Enemy Team".
    *   **Action Panel:** Displays the current action (Pick/Ban), provides options to select champions from a grid, or request AI suggestions.
*   **Explorer Screen:** Select up to two champions and type a query to get insights from the Oracle.
*   **History/Playbook Screens:** View lists of past drafts or saved strategies. Click to review details.
*   **Settings Screen:** Customize Oracle personality, theme, animations, and manage playbook data.
*   **Interactive Lesson Screen:** Presents a concept explanation, followed by an interactive challenge.
*   **Oracle's Armory:** Browse items, filter by category, search, and click an item to view details and seek Oracle's wisdom.
*   **Draft Lab Screen:** Similar to drafting, but with manual control over all picks/bans. Use the Champion Grid on the right to drag champions to pick/ban slots or click empty slots to open a modal for selection.

### Key Interactions
*   **Champion Selection:**
    *   **Grid Modal:** In draft/lab/explorer, click "Select Champion/Ban" or an empty slot to open a grid of all champions. Filter by role or search by name. Click a champion to select.
    *   **Drag & Drop (Draft Lab):** Drag champions from the Champion Grid on the right to pick or ban slots.
*   **Requesting AI Suggestions (Drafting Screen):**
    *   Click "Suggest Pick" or "Suggest Ban" in the Action Panel. The Oracle will provide 1-3 suggestions with reasoning.
    *   Click "Use" next to a suggestion to automatically confirm that pick/ban.
*   **Full Draft Analysis:**
    *   In the Drafting Screen (once the draft is complete) or Draft Lab, click "Full Draft Analysis" or "Analyze Full Setup."
    *   The Oracle's detailed analysis will appear, including item recommendations, strategic focus, etc.
    *   Use the "In-Game Cheat Sheet" button for a condensed view.
    *   Ask follow-up questions using the text area provided.
*   **Saving/Loading:**
    *   **Save to History (Drafting Screen):** After a full analysis, save the current draft and its analysis to your history.
    *   **Save to Playbook (Drafting Screen/Draft Lab):** Save the current composition and analysis as a named strategy in your Playbook.
    *   **Load from Playbook (Playbook Screen):** Load a saved strategy directly into the Draft Lab for further experimentation or review.
*   **Command Palette (Ctrl/Cmd + K):**
    *   Type to search for navigation commands, actions (like toggling theme/focus mode), champions, items, or concepts.
    *   Use arrow keys to navigate results and Enter to execute.
*   **Theme & Focus Mode:** Toggle via header icons or the Command Palette.

## Technical Deep Dive

### Technology Stack
*   **Frontend:** React (v19+) with TypeScript.
*   **UI Styling:** Tailwind CSS with custom global styles and CSS variables for theming and animations (`index.html`).
*   **AI Engine:** Google Gemini API (specifically model `'gemini-2.5-flash-lite-preview-06-17'`), accessed via the `@google/genai` SDK.
*   **Game Data:** Riot Games Data Dragon (DDragon) for champion and item static data (images, names, basic stats).
*   **Module Management:** ES Modules with `importmap` in `index.html`.

### Architecture
*   **Single Page Application (SPA):** Built around a main `App.tsx` component that manages views, global state (DDragon data, settings), and routing between different screens.
*   **Component-Based:** UI is broken down into reusable React components (e.g., `HomeScreen`, `DraftingScreen`, `TeamDisplay`, `ChampionGridModal`).
*   **Service Layer:**
    *   `ddragonService.ts`: Handles fetching and caching (version only) data from DDragon.
    *   `geminiService.ts`: Encapsulates all interactions with the Gemini API, including prompt construction, API calls, and response parsing.
    *   `puzzleService.ts`: Manages daily puzzle logic and persistence.
*   **State Management:** Primarily uses React Hooks (`useState`, `useEffect`, `useReducer`, `useCallback`, `useMemo`).
    *   `App.tsx` holds global state like DDragon data, settings, and current view.
    *   Screen-specific complex state (like in `DraftingScreen.tsx`) is managed using `useReducer`.
*   **Data Persistence:** `localStorage` is used to store:
    *   Ongoing draft state (`DRAFT_STATE_STORAGE_KEY`)
    *   Draft history (`DRAFT_HISTORY_STORAGE_KEY`)
    *   Playbook entries (`PLAYBOOK_STORAGE_KEY`)
    *   Application settings (`APP_SETTINGS_STORAGE_KEY`)
    *   Onboarding status (`ONBOARDING_COMPLETED_KEY`)
    *   Oracle's Trials progress (`ORACLE_TRIALS_STORAGE_KEY`)
    *   Viewed learning concepts (`VIEWED_CONCEPTS_STORAGE_KEY`)

### Gemini API Integration

The core intelligence of the LoL Draft Oracle comes from the Gemini API.

*   **System Instruction & Core Principles:**
    A detailed system instruction is provided to the Gemini model (see `geminiService.ts`). This instruction sets the persona of an "elite-tier League of Legends analyst and master strategist." It outlines core LoL knowledge areas the AI should possess or be able to reason about, including:
    *   Game Fundamentals (Nexus, objectives, lanes, items, etc.)
    *   Champion Expertise (abilities, roles, classes, subclasses)
    *   Static Item Knowledge (strategic purpose, synergies - based on internal data like `itemStaticData.ts`)
    *   Meta Acumen (requiring Google Search for current patch DDragon stats, champion/item performance, tier lists)
    *   Item Demarcation (CRITICAL: `{{Item Name}}` format for UI integration)
    *   Advanced Strategic Concepts (Micro/Macro, Draft Theory, Team Archetypes, In-Game Execution, Meta Adaptation)
    The AI is instructed to explain the 'why' behind its recommendations and provide actionable advice.

*   **Prompt Engineering for Features:**
    Each feature that requires AI insight has a specifically crafted prompt in `geminiService.ts`:
    *   **Pick/Ban Suggestions:** Prompts include current draft state (picks, bans), role to suggest for, user preferences (if any), and a schema for the JSON response.
    *   **Full Draft Analysis:** Similar to pick/ban but requests a more comprehensive structured JSON output covering team identities, item builds, strategic focus, threats, etc.
    *   **Explorer Analysis:** Takes a user query and optional champion names, requesting a direct answer, champion-specific insights, and general strategic points in a structured JSON format.
    *   **Armory Item Wisdom:** Provides the AI with DDragon and static data for a specific item and asks for a structured JSON detailing its strategic niche, ideal users, build timing, etc.
    *   **Pre-Game Ritual Analysis:** Asks for a champion's meta identity, fated allies, and grave threats in JSON.
    *   **Threat Assessment (Draft Lab):** Focuses analysis on a single targeted enemy champion.
    *   **Concept Explanations (Interactive Lessons):** Requests a detailed markdown explanation of a specific LoL concept.
    *   **Challenge Generation (Interactive Lessons):** Asks for a scenario, question, and multiple-choice options in JSON format related to a concept.
    *   **Feedback Generation (Interactive Lessons):** Takes the concept, challenge, and user's answer to provide markdown feedback.
    *   **Follow-up Queries:** Appends the new user query to the existing conversation history for contextual responses.

*   **Structured JSON & Data Handling:**
    *   For many features, the Gemini API is instructed to respond in a specific JSON format (`responseMimeType: "application/json"` is generally used when not using Google Search, or the prompt explicitly requests JSON only).
    *   `geminiService.ts` includes a `parseJsonSafely` utility to handle potential inconsistencies in the AI's JSON output, including removing markdown fences.
    *   TypeScript types (`types.ts`) define the expected structure for these JSON responses (e.g., `StructuredDraftRec`, `StructuredExplorerRec`).

*   **Grounding with Google Search:**
    *   The `tools: [{ googleSearch: {} }]` configuration is used for many prompts.
    *   The system instruction emphasizes using Google Search for DYNAMIC, CURRENT-META information: current patch details, DDragon stats/costs/effects, champion tier lists, win rates, popular item builds, and emerging strategies.
    *   This contrasts with the AI's "internal" static knowledge (like from `itemStaticData.ts` or `staticChampionData.ts`), which provides foundational strategic purpose.
    *   Retrieved search sources (`groundingChunks`) are mapped and can be displayed in the UI.
    *   **Constraint**: `responseMimeType: "application/json"` is NOT used when `googleSearch` tool is active, as per guidelines. JSON output is requested via prompt instructions.

*   **Oracle Personalities & Champion Personas:**
    *   **Oracle Personalities (`Default`, `Concise`, `ForBeginners`):** `applyPersonalityToPromptPrefix` in `geminiService.ts` prepends an instruction to the main prompt to guide the AI's response style and depth.
    *   **Champion Personas (Interactive Lessons):** If a `championPersonaName` is provided, `generatePersonaInstruction` adds a critical instruction to the prompt, demanding the AI embody that champion's voice, personality, and phrasing. This is consistently applied for explanations, challenge generation, and feedback.

*   **Item Demarcation:** The system instruction strictly enforces that all item names must be enclosed in double curly braces (e.g., `{{Infinity Edge}}`). This allows the `RecommendationDisplay.tsx` component to parse these and display item images alongside their names.

*   **API Error Handling & Retries:**
    *   `callGeminiWithRetry` function implements a retry mechanism with exponential backoff for common transient API errors (429, 500, 503, etc.).
    *   `handleApiError` provides more user-friendly error messages for common issues like invalid API keys.

### Data Dragon (DDragon) Integration
*   `ddragonService.ts` manages fetching data from Riot's DDragon CDN.
*   `getLatestDDragonVersion()`: Fetches and caches the latest game version to ensure data is current. Includes a fallback version.
*   `getAllChampionsData()`: Fetches `champion.json`.
*   `getAllItemsData()`: Fetches `item.json`.
*   Image URL helpers (`getChampionImageURL`, `getItemImageURL`, etc.) construct correct URLs for assets.
*   DDragon provides champion names, IDs, stats, abilities, item names, costs, stats, descriptions, and image paths. This is primarily "static" data for a given patch.

### Local Storage Persistence
*   Various constants in `constants.ts` define keys for `localStorage`.
*   `App.tsx` loads settings, onboarding status, and viewed concepts on mount.
*   `DraftingScreen.tsx` loads and saves its state (picks, bans, mode, preferences) to `localStorage`, enabling draft resumption.
*   History and Playbook data are also stored and retrieved from `localStorage`.

### State Management
*   **Global State (`App.tsx`):** Manages `ddragonVersion`, `allChampions`, `allItems`, `appSettings`, `currentView`, and other cross-cutting concerns using `useState` and `useCallback`.
*   **Screen-Level State:**
    *   Complex screens like `DraftingScreen.tsx` use `useReducer` (`draftReducer`) for managing intricate draft logic and state transitions (picks, bans, suggestions, analysis requests).
    *   Simpler screens use `useState` and `useEffect` for local state management.
*   **Props Drilling:** State and callbacks are passed down through props. For a larger application, a context API or dedicated state management library might be considered.

## UI/UX Philosophy
*   **Thematic & Immersive:** The application strives for a "mystical oracle" theme through its design language, color palette (dark/light modes with accent colors), typography ('Playfair Display' for titles, 'Inter' for body), and subtle animations.
    *   **Oracle's Aura:** Dynamic background pulse, particle effects, and panel border shimmers change based on the AI's sentiment towards the current draft, providing visual feedback.
*   **Responsive Design:** Utilizes Tailwind CSS utility classes to adapt to different screen sizes, ensuring usability on desktop and mobile.
*   **Accessibility (ARIA):**
    *   ARIA attributes (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-modal`, `aria-pressed`, `role`) are used in various components, especially modals and interactive elements like buttons and the Command Palette, to improve screen reader compatibility.
    *   Focus management is implemented for modals and the Command Palette.
*   **User Guidance:** Onboarding tour for new users and clear labeling.
*   **Performance:**
    *   Animations can be disabled via settings.
    *   Lazy loading for champion/item images.
    *   Memoization of components (`React.memo`) where appropriate (e.g., `TeamDisplay`, `RecommendationDisplay`, `MemoizedChampionButton`).
    *   Debouncing for search inputs.
*   **Clarity of Information:** AI-generated text is often formatted using markdown (parsed into React elements) for better readability. Item and champion names are augmented with images.

## File Structure (Key Elements)
```
.
├── public/
│   └── (Static assets, though not explicitly shown, often here)
├── src/
│   ├── components/            # UI Components
│   │   ├── icons/             # SVG Icon Components
│   │   ├── App.tsx            # Main application component
│   │   ├── HomeScreen.tsx
│   │   ├── DraftingScreen.tsx
│   │   ├── ExplorerScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── PlaybookScreen.tsx
│   │   ├── DraftLabScreen.tsx
│   │   ├── InteractiveLessonScreen.tsx
│   │   ├── OracleTrialsScreen.tsx
│   │   ├── ArmoryScreen.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── OnboardingTour.tsx
│   │   ├── Modal.tsx
│   │   ├── RecommendationDisplay.tsx
│   │   ├── TeamDisplay.tsx
│   │   └── ... (other UI elements)
│   ├── constants/             # App-wide constants
│   │   ├── index.ts           # (Likely exports all constants, e.g. APP_TITLE, API_KEY) - Renamed to constants.ts
│   │   ├── conceptsData.ts    # Static data for learning concepts
│   │   └── dailyPuzzles.ts    # Static data for daily puzzles
│   ├── data/                  # Static game data curated for the app
│   │   └── itemStaticData.ts  # Curated strategic info about items
│   ├── services/              # External service integrations
│   │   ├── ddragonService.ts  # Riot Data Dragon API interaction
│   │   ├── geminiService.ts   # Google Gemini API interaction
│   │   └── puzzleService.ts   # Logic for daily puzzles
│   ├── utils/                 # Utility functions
│   │   └── textFormatting.ts  # Markdown parsing, debouncing
│   ├── types.ts               # TypeScript type definitions
│   ├── gameData.ts            # Static champion data and related utilities
│   ├── draftRules.ts          # Logic for generating draft flows
│   └── index.tsx              # Entry point, renders App component
├── index.html                 # Main HTML file, includes importmap and global styles
├── metadata.json              # Application metadata
└── README.md                  # This file
```

## Important Notes on API Key
*   The Google Gemini API key is managed **exclusively** via the environment variable `process.env.API_KEY`.
*   This variable is assumed to be pre-configured and accessible in the execution environment where the `@google/genai` client is initialized (`geminiService.ts`).
*   **The application will NOT, under any circumstances, provide UI elements or prompts for users to enter or manage the API key.**
*   The availability and validity of the API key are external dependencies handled by the platform/environment running this application.

---

This README aims to provide a thorough understanding of the LoL Draft Oracle application. For any further details, please refer to the source code comments and implementation within the respective files.
