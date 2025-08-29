<div align="center">

# Project: DraftWise AI
### The Hextech Dossier

**A strategic co-pilot for the modern League of Legends tactician.**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B1?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![IndexedDB](https://img.shields.io/badge/IndexedDB-0087c3?style=for-the-badge&logo=indexeddb&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

</div>

---

## `1.0` | Project Mandate & Design Philosophy

DraftWise AI is not merely an application; it is an advanced strategic co-pilot designed to augment the tactical mind of a League of Legends player. Our core philosophy is built upon the **"Hextech Dossier"** design paradigm—a clean, professional, and immersive interface that provides a premium, data-rich experience.

Our design and engineering efforts are guided by three core principles:

*   **Clarity:** Data must be presented with absolute precision. The UI is minimalist and purpose-driven, ensuring every piece of strategic advice is instantly legible and actionable without cognitive overhead.
*   **Thematic Immersion:** The interface is engineered to feel like a product of Piltover—technologically advanced yet artistically crafted. Sharp, angular designs, subtle rune glows, and a cohesive thematic color system create an authentic, immersive user experience.
*   **Tactile Responsiveness:** The interface must feel alive. Interactions provide meaningful haptic and visual feedback through fluid animations and glowing highlights, making the user feel connected to the system's analytical core.

---

## `2.0` | Module Analysis: Core Systems

The DraftWise AI system is composed of several interconnected modules, each designed for a specific strategic function.

| Module                    | Designation               | Function                                                                                                 |
| ------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Strategy Forge**        | Draft Simulation Chamber  | A high-fidelity sandbox for theory-crafting 5v5 compositions with instant, AI-powered strategic analysis.    |
| **Live Co-Pilot**         | Real-Time Tactical Overlay| An active-draft assistant that provides live AI suggestions as a user manually inputs picks and bans.      |
| **Draft Arena**           | Combat Training Simulator | A training ground to practice drafting against a variety of AI bot personas in a simulated, turn-based environment. |
| **The Archives**          | Persistent Strategy Codex | Save, review, and annotate draft blueprints. AI-generated "Dossiers" provide a full game plan for saved compositions. |
| **The Armory**            | Hextech Intelligence DB   | A comprehensive database of Champion Dossiers featuring optimal builds, runes, and AI-powered strategy analysis. |
| **Meta Intelligence**     | Environmental Analysis    | A live data feed providing the latest meta insights, including AI-generated tier lists and patch note summaries. |
| **The Oracle**            | Live Query Interface      | A direct line to the cognitive core. Ask any question about the meta and get answers grounded in real-time search data. |
| **Academy**               | Strategic Knowledge Base  | An interactive library of core strategic concepts, from wave management to composition archetypes.           |
| **Daily Challenge**       | Aptitude Test             | A daily scenario-based question to test and reward strategic knowledge and critical thinking.               |
| **Profile & Progression** | Strategist Dossier        | A personal file to track user progression, complete missions, earn Strategic Points (SP), and view mastery stats. |

---

## `3.0` | Hextech Engine: Core Technologies

DraftWise AI is constructed with a modern, performant, and scalable suite of frontend technologies, chosen for their power and efficiency.

- **Framework:** [React 19](https://react.dev/) — The core of our user interface, providing a robust and declarative component model.
- **Language:** [TypeScript](https://www.typescriptlang.org/) — Ensures a scalable and maintainable codebase through strict type safety, reducing runtime errors.
- **Cognitive Core (AI/LLM):** [Google Gemini API (`@google/genai`)](https://ai.google.dev/) — Powers all intelligent features, from draft analysis to meta summaries.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) — A utility-first CSS framework enabling rapid development of the custom "Hextech Dossier" design system.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) — Provides the fluid, tactile animations that are central to the application's immersive feel.
- **Iconography:** [Lucide React](https://lucide.dev/) — Delivers a clean, consistent, and highly readable set of SVG icons.
- **Client-Side Database:** [Dexie.js (IndexedDB)](https://dexie.org/) — A robust wrapper for IndexedDB, providing persistent, offline storage for user-generated strategies in "The Archives."
- **Modules:** ES Modules with a CDN-based `importmap` for a modern, buildless development environment that is fast and simple to set up.

---

## `4.0` | Architectural Schematics

The application is a single-page application (SPA) designed with a clear separation of concerns, prioritizing state management, AI service abstraction, and component modularity.

### `4.1` | State Management

Global state is managed via a suite of React Context providers, ensuring a clean, unidirectional data flow and eliminating prop-drilling.

- **`ChampionContext`**: Fetches and provides all champion data from the Data Dragon API at startup. It handles caching and serves as the single source of truth for champion information.
- **`SettingsContext`**: Manages user preferences like theme, language, and favorite champions. Persisted to `localStorage` and synced across tabs.
- **`UserProfileContext`**: Handles all gamification and user progression data (SP, level, missions, mastery). Persisted to `localStorage`.
- **`DraftContext`**: Manages the transient state for the **Strategy Forge**, the primary draft sandbox.
- **`ModalContext`**: A centralized reducer-based system for controlling the state of all modals, panels, and pop-ups across the app.

### `4.2` | Cognitive Core: Gemini API Integration (`geminiService.ts`)

This service is the heart of the application, acting as an abstraction layer for all communication with the Google Gemini API. It is engineered for reliability, consistency, and performance.

- **Strategic Grounding:** The service injects a `STRATEGIC_PRIMER` (from `data/strategyInsights.ts`) into all relevant prompts. This primer is a curated knowledge base of expert-level League of Legends drafting theory. This critical step **constrains the AI's responses**, ensuring its analysis is consistent, context-aware, uses the correct terminology, and maintains a high standard of quality.
- **Structured & Typed Output:** We heavily leverage Gemini's `responseSchema` and `responseMimeType: "application/json"` features. This forces the AI to return data in a predictable JSON format, which is then parsed into strongly-typed TypeScript interfaces. This eliminates runtime errors from unexpected AI responses and ensures type safety throughout the application.
- **Live Data with Grounding:** The **Meta Intelligence** and **Oracle** features utilize Gemini's Google Search grounding capabilities (`tools: [{googleSearch: {}}]`). This allows the AI to answer questions based on up-to-the-minute web data. The service is designed to extract and display the source URLs from the API response (`groundingChunks`), providing transparency and verifiability.
- **Resilience & Error Handling:** A generic `_withRetries` wrapper function encapsulates API calls. It implements an **exponential backoff with jitter** strategy to gracefully handle transient API errors (e.g., rate limits, server issues), making the application more robust.
- **Performance Caching:** A `_fetchAndCache` utility wraps API calls that fetch non-volatile data (like meta reports). It caches results in `localStorage` with a TTL and invalidates the cache based on the latest Data Dragon version, significantly reducing API costs and improving load times on subsequent visits.

### `4.3` | Operant Progression System (`useUserProfile.ts`)

A robust gamification system is implemented to drive user engagement, create a rewarding learning loop, and provide a sense of progression.

- **Strategic Points (SP):** The primary "experience" currency, earned by completing missions, performing well in the Arena, or achieving high scores in the Strategy Forge.
- **Levels & Ranks:** SP gain contributes to leveling up, which unlocks new Ranks (e.g., 'Iron Analyst' -> 'Bronze Tactician'), visually represented in the user's profile.
- **Missions:** A multi-tiered mission system (Getting Started, Daily, Weekly) provides clear goals and rewards, guiding the user through the application's features.
- **Champion Mastery:** Users gain mastery points for champions they use to achieve high-scoring (A- or S) drafts, encouraging experimentation and strategic depth.

### `4.4` | Client-Side Database (`lib/indexedDb.ts` & `usePlaybook.ts`)

To provide a robust, persistent storage solution for user-generated strategies in **The Archives**, the application utilizes IndexedDB via the `Dexie.js` wrapper.

- **Persistence:** Unlike `localStorage`, IndexedDB is designed for larger, structured data sets and offers better performance and reliability, ensuring a user's valuable strategies are not easily lost.
- **Offline Access:** Saved drafts are available even when the user is offline.
- **Asynchronous Operations:** The `usePlaybook` hook manages all database interactions, including the asynchronous generation of AI "Dossiers" for newly saved drafts, providing a non-blocking user experience.

---

## `5.0` | System Activation Protocol: Local Deployment

To run DraftWise AI locally, follow these steps.

### `5.1` | Prerequisites

- A modern web browser (Chrome, Firefox, Edge).
- A text editor (e.g., VS Code).
- A local web server. The simplest method is to use a VS Code extension like **Live Server**.

### `5.2` | Configuration

1.  **Obtain a Gemini API Key:**
    - Go to [Google AI Studio](https://aistudio.google.com/).
    - Click "Get API key" and create a new API key.

2.  **Set up Environment Variable:**
    - The application is configured to read the API key from `process.env.API_KEY`.
    - To simulate this in a static, buildless environment, you must manually edit the `index.html` file.
    - Find the `<script type="module" src="/index.tsx"></script>` tag and insert the following script **before** it:

    ```html
    <!-- Add this script block before the main index.tsx import -->
    <script>
      window.process = {
        env: {
          API_KEY: 'YOUR_GEMINI_API_KEY_HERE'
        }
      };
    </script>

    <!-- This is the existing script tag -->
    <script type="module" src="/index.tsx"></script>
    ```
    - **Crucial:** Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key. **Under no circumstances should this key be committed to version control.**

### `5.3` | Running the Application

1.  Clone the repository.
2.  Open the project folder in your code editor.
3.  Right-click on `index.html` and select "Open with Live Server" (or your equivalent).
4.  The application will open in your default browser.

---

## `6.0` | System Directory Map

```
.
├── App.tsx                 # Main component, routing logic, and layout composition
├── index.html              # HTML entry point, importmap, global styles
├── index.tsx               # React root renderer, top-level context providers
├── components/
│   ├── Academy/            # UI for strategic lessons and knowledge base
│   ├── Arena/              # UI for the draft practice simulator
│   ├── Armory/             # UI for the champion dossier database
│   ├── common/             # Globally reusable components (Button, Modal, Loader)
│   ├── DraftLab/           # UI for the core draft sandbox and analyzer
│   ├── Home/               # Landing page and smart dashboard UI
│   ├── Intel/              # UI for meta intelligence (tier lists, patch notes)
│   ├── Layout/             # Global layout components (Header, Sidebar, Footer)
│   ├── LiveDraft/          # UI for the real-time co-pilot feature
│   ├── MetaOracle/         # UI for the grounded Q&A feature
│   ├── Onboarding/         # UI for the initial user setup flow
│   ├── Playbook/           # UI for viewing and managing saved drafts
│   └── Profile/            # UI for user profile, missions, and mastery
├── contexts/               # React Context providers for global state
│   ├── ChampionContext.tsx # Fetches and provides all champion data app-wide
│   └── DraftContext.tsx    # Manages the transient state for the Strategy Forge
├── data/
│   └── strategyInsights.ts # The crucial strategic primer injected into AI prompts
├── hooks/
│   ├── useCommands.ts      # Logic for the command palette (Ctrl+K)
│   ├── usePlaybook.ts      # Business logic for managing saved drafts with IndexedDB
│   ├── useSettings.ts      # State management for user settings
│   └── useUserProfile.ts   # State management for gamification and profile data
├── lib/
│   ├── draftUtils.ts       # Helper functions for draft state manipulation
│   ├── indexedDb.ts        # Dexie.js database configuration
│   └── i18n.ts             # Internationalization strings
├── services/
│   └── geminiService.ts    # Centralized abstraction layer for all Gemini API calls
└── types.ts                # Centralized TypeScript type definitions
```
