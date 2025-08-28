
<div align="center">
  <img src="https://storage.googleapis.com/genai-assets/project-logos/draftwise-logo.svg" alt="DraftWise AI Logo" width="150">
  
  # DraftWise AI: The Hextech Dossier
  
  **A strategic co-pilot for the modern League of Legends tactician.**
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B1?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
  
</div>

---

## `1.0` | Transmission Log: Project Philosophy

DraftWise AI is not merely an application; it is an advanced strategic co-pilot designed to augment the tactical mind of a League of Legends player. Our core philosophy is built upon the **"Hextech Dossier"** design paradigm—a clean, professional, and immersive interface that provides a premium experience in both light and dark modes.

Our design and engineering efforts are guided by three core principles:

*   **Clarity:** Data must be presented with absolute precision. The UI is minimalist at its core, ensuring every piece of advice is instantly legible and understandable.
*   **Thematic Immersion:** The interface feels like a product of Piltover—technologically advanced yet artistically crafted. Sharp, angular designs, subtle rune glows, and thematic colors create an authentic, immersive experience.
*   **Tactile Responsiveness:** The interface must feel alive. Interactions provide meaningful feedback through fluid animations and glowing highlights, making the user feel connected to the system.

---

## `2.0` | System Schematics: Core Features

The DraftWise AI system is composed of several interconnected modules, each designed for a specific strategic function.

| Module                    | Designation               | Function                                                                                                 |
| ------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Strategy Forge**        | Draft Sandbox & Analyzer  | Theory-craft 5v5 compositions with instant, AI-powered strategic feedback.                               |
| **Live Co-Pilot**         | Real-Time Assistant       | Get live AI suggestions during an active draft by manually inputting picks as they happen.               |
| **Draft Arena**           | Training Simulator        | Practice drafting against a variety of AI bot personas in a simulated, turn-based environment.           |
| **The Archives**          | Strategy Library          | Save, review, and annotate your drafts. AI-generated "Dossiers" provide a game plan for saved comps.      |
| **The Armory**            | Intelligence Database     | Houses detailed Champion Dossiers with builds, runes, and AI-powered strategy & matchup analysis.          |
| **Meta Intelligence**     | Live Meta Analysis        | Get the latest meta insights, including AI-generated tier lists and concise patch note summaries.        |
| **The Oracle**            | Live Q&A                  | Ask any question about the meta and get answers grounded in real-time search data.                       |
| **Academy**               | Knowledge Base            | An interactive library of core strategic concepts and lessons, with keyword-driven navigation.           |
| **Daily Challenge**       | Skill Test                | A daily scenario-based question to test and reward strategic knowledge.                                  |
| **Profile & Gamification**| User Progression          | Track your journey, complete missions, earn SP, and view your stats.                                     |

---

## `3.0` | Technological Blueprint: Tech Stack

DraftWise AI is built with modern, performant, and scalable frontend technologies.

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI/LLM:** [Google Gemini API (`@google/genai`)](https://ai.google.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom thematic color system.
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Modules:** ES Modules with a CDN-based `importmap` for a buildless development environment.

---

## `4.0` | Architectural Overview

The application is a single-page application (SPA) designed with a clear separation of concerns, prioritizing state management, AI service abstraction, and component modularity.

### `4.1` | State Management

Global state is managed via React Context to avoid prop-drilling and provide a clean data flow.

- **`SettingsContext`**: Manages user preferences like theme, language, and favorite champions. Persisted to `localStorage`.
- **`UserProfileContext`**: Handles all gamification and user progression data, including SP, level, missions, and mastery. Persisted to `localStorage`.
- **`DraftContext`**: Manages the state for the **Strategy Forge**, the primary draft sandbox.
- **`ModalContext`**: A centralized reducer-based system for controlling the state of all modals and panels across the app.

### `4.2` | AI Integration (`geminiService.ts`)

This service is the heart of the application, acting as an abstraction layer for all communication with the Google Gemini API.

- **Structured Output:** Leverages Gemini's `responseSchema` and `responseMimeType: "application/json"` to enforce structured JSON responses, ensuring type safety and reliability.
- **Strategic Grounding:** Injects a `STRATEGIC_PRIMER` (from `data/strategyInsights.ts`) into relevant prompts. This primer contains expert-level League of Legends drafting theory, ensuring the AI's analysis is consistent, context-aware, and of high quality.
- **Live Data with Grounding:** The Meta Intelligence and Oracle features utilize Gemini's Google Search grounding (`tools: [{googleSearch: {}}]`) to provide answers based on up-to-the-minute web data.
- **Resilience:** Implements a generic `_withRetries` wrapper using exponential backoff to gracefully handle transient API errors.
- **Caching:** A `_fetchAndCache` utility wraps grounded API calls (like meta reports) to cache results in `localStorage`, reducing API costs and improving load times. The cache is invalidated based on a TTL and the current `DATA_DRAGON_VERSION`.

### `4.3` | Component Structure

The application follows a standard, feature-based component structure.

- **`components/`**:
  - **`Layout/`**: Contains global layout components like `Header`, `Sidebar`, `Footer`.
  - **`common/`**: Houses reusable, generic components (`Button`, `Modal`, `Loader`, `Tooltip`).
  - **Feature Folders (`DraftLab/`, `Arena/`, `Profile/`, etc.)**: Each major feature is self-contained within its own folder.

### `4.4` | Gamification System (`useUserProfile.ts`)

A robust gamification system is implemented to drive user engagement and provide a sense of progression.

- **Strategic Points (SP):** The primary "experience" currency, earned by completing missions, performing well in the Arena, or getting high scores in the Draft Lab.
- **Levels & Ranks:** SP gain contributes to leveling up, which unlocks new Ranks (e.g., 'Iron Analyst' -> 'Bronze Tactician').
- **Missions:** A multi-tiered mission system (Getting Started, Daily, Weekly) provides goals and rewards.
- **Champion Mastery:** Users gain mastery points for champions they use to achieve high-scoring (A- or S) drafts, encouraging experimentation.

---

## `5.0` | Getting Started: Local Development

To run DraftWise AI locally, follow these steps.

### `5.1` | Prerequisites

- A modern web browser (Chrome, Firefox, Edge).
- A text editor (e.g., VS Code).
- A local web server. The simplest way is to use a VS Code extension like **Live Server**.

### `5.2` | Configuration

1.  **Obtain a Gemini API Key:**
    - Go to [Google AI Studio](https://aistudio.google.com/).
    - Click "Get API key" and create a new API key.

2.  **Set up Environment Variable:**
    - The application is configured to read the API key from `process.env.API_KEY`.
    - To simulate this in a static environment, you must manually edit the `index.html` file.
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
    - **Important:** Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key. **Do not commit this key to version control.**

### `5.3` | Running the Application

1.  Clone the repository.
2.  Open the project folder in your code editor.
3.  Right-click on `index.html` and select "Open with Live Server" (or your equivalent).
4.  The application will open in your default browser.

---

## `6.0` | Codebase Schematics: Folder Structure

```
.
├── App.tsx                 # Main application component, routing, and layout
├── index.html              # HTML entry point, importmap, styling
├── index.tsx               # React root renderer, context providers
├── components/
│   ├── Academy/            # Lessons and knowledge base UI
│   ├── Arena/              # Draft practice simulation UI
│   ├── Armory/             # Champion dossier UI
│   ├── common/             # Reusable components (Button, Modal, etc.)
│   ├── DraftLab/           # Core draft sandbox UI
│   ├── Home/               # Landing page and smart dashboard
│   ├── Intel/              # Meta intelligence UI
│   ├── Layout/             # Header, Sidebar, Footer, etc.
│   ├── LiveDraft/          # Live co-pilot UI
│   ├── MetaOracle/         # Q&A feature UI
│   ├── Onboarding/         # Initial user setup flow
│   ├── Playbook/           # Saved drafts UI
│   ├── Profile/            # User profile, missions, mastery UI
│   └── ...
├── contexts/
│   └── DraftContext.tsx    # Global state provider for the Strategy Forge
├── data/
│   ├── championData.ts     # Static, detailed champion information
│   └── strategyInsights.ts # The strategic primer for the AI
├── hooks/
│   ├── useCommands.ts      # Logic for the command palette
│   ├── usePlaybook.ts      # Logic for managing saved drafts
│   ├── useSettings.ts      # Logic for user settings
│   └── useUserProfile.ts   # Logic for gamification and profile
├── lib/
│   ├── draftUtils.ts       # Helper functions for draft state
│   └── i18n.ts             # Internationalization strings
├── services/
│   └── geminiService.ts    # Abstraction layer for all Gemini API calls
└── types.ts                # Centralized TypeScript type definitions
```
