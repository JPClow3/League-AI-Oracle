
<div align="center">

# DraftWise AI: The Hextech Co-Pilot

**A strategic dossier for the modern League of Legends tactician.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B1?style=for-the-badge&logo=google-gemini&logoColor=white)

</div>

---

## `1.0` | Transmission Log: Project Philosophy

DraftWise AI is not merely an application; it is an advanced piece of Hextech engineering, a strategic co-pilot designed to augment the tactical mind of a League of Legends player. Our core philosophy is built upon the **"Holographic Hextech"** design paradigm—a dark, professional, and immersive interface that resonates with the high-tech aesthetic of modern esports.

Our design and engineering efforts are guided by three core principles:

*   **Clarity:** Data must be presented with absolute precision. Every piece of advice, every champion statistic, must be instantly legible and understandable.
*   **Responsiveness:** The interface must feel alive and tactile. Interactions should provide meaningful feedback, making the user feel connected to the system.
*   **Immersion:** The user should feel like a professional strategist. From the subtle hex-grid background to the frosted glass panels and cyan glows, every element is crafted to create a premium, focused experience.

## `2.0` | System Schematics: Core Features

The DraftWise AI system is composed of several interconnected modules, each designed for a specific strategic function.

| Module                    | Designation               | Function                                                                                                 |
| ------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Draft Lab**             | `The Forge`               | A sandbox environment for theory-crafting team compositions with instant, AI-powered strategic analysis.     |
| **Drafting Arena**        | `The Proving Grounds`     | A simulated environment to practice drafting against an adaptive AI bot in a real-time, competitive format.  |
| **Playbook**              | `The Codex`               | A personal, persistent library of saved strategies, complete with AI analysis and user-penned notes.       |
| **Strategy Hub**          | `The Archives`            | A central database of strategic knowledge, containing the Champion Armory and the AI Intel Hub.            |
| &nbsp;&nbsp;↳ Champion Armory | `Dossier Catalog`       | In-depth champion data, including abilities, AI-generated builds, synergies, counters, and matchup tips.   |
| &nbsp;&nbsp;↳ AI Intel Hub    | `Oracle Matrix`         | Real-time meta insights, featuring AI-generated tier lists and concise patch note summaries via Google Search. |
| **Academy**               | `The Athenaeum`           | An educational module with in-depth lessons on drafting fundamentals, macro-play, and game theory.         |
| **Profile**               | `Strategist's Dossier`    | A gamified progression system tracking user level, rank, missions, and champion mastery.                 |

## `3.0` | Technology Matrix: The Tech Stack

The co-pilot is constructed from a curated set of modern, high-performance technologies.

-   **Core Framework:** [React](https://react.dev/) (v19) with [TypeScript](https://www.typescriptlang.org/) for a robust, type-safe component architecture.
-   **AI Integration:** [Google Gemini API (`@google/genai`)](https://ai.google.dev/) for all strategic analysis, content generation, and real-time data synthesis.
-   **Styling Engine:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first approach to implementing the custom Holographic Hextech design system.
-   **Performance Optimization:** [React Window](https://react-window.vercel.app/) is utilized for virtualizing large lists (e.g., champion grids) to ensure a smooth, high-framerate experience.
-   **State Management:** React Context API, encapsulated within custom hooks (`useSettings`, `useUserProfile`, `usePlaybook`) for clean, decoupled state logic.
-   **Data Persistence:** Browser `localStorage` is used to maintain user settings, profile progress, and playbook entries across sessions.

## `4.0` | Directory Blueprints: Project Structure

The project's file system is organized for logical separation of concerns and scalability.

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── Academy/         # UI for the Academy lessons
│   │   ├── Arena/           # UI for the Drafting Arena
│   │   ├── Armory/          # UI for the Champion Armory
│   │   ├── common/          # Reusable components (Modal, Button, Loader, etc.)
│   │   ├── DraftLab/        # UI for the Draft Lab
│   │   ├── Feedback/        # UI for the feedback system
│   │   ├── Home/            # The main landing page dashboard
│   │   ├── Intel/           # UI for the AI Intel Hub
│   │   ├── Layout/          # Header and Footer components
│   │   ├── Onboarding/      # Profile setup and guided tour components
│   │   ├── Playbook/        # UI for the Playbook
│   │   ├── Profile/         # UI for the user's profile and progression
│   │   ├── Settings/        # UI for the user settings modal
│   │   └── StrategyHub/     # Container for Armory and Intel tabs
│   │
│   ├── data/
│   │   ├── championData.ts  # Static, detailed data for all champions
│   │   └── strategyInsights.ts # The core strategic primer for the Gemini API
│   │
│   ├── hooks/
│   │   ├── usePlaybook.ts   # State logic for the Playbook (localStorage)
│   │   ├── useSettings.ts   # State logic for user preferences (localStorage)
│   │   └── useUserProfile.ts # State logic for gamification and profile (localStorage)
│   │
│   ├── lib/
│   │   └── draftUtils.ts    # Utilities for draft state serialization
│   │
│   ├── services/
│   │   └── geminiService.ts # Centralized module for all Gemini API interactions
│   │
│   ├── types.ts             # Global TypeScript type definitions
│   ├── App.tsx              # Main application component and router
│   └── index.tsx            # Application entry point
│
├── index.html               # The HTML shell, including theme styles and import maps
├── metadata.json            # Application metadata
└── README.md                # This file
```

## `5.0` | The Holographic Hextech Design System

All visual components adhere to a strict, pre-defined design system to ensure aesthetic cohesion and a premium user experience.

### `5.1` Color Palette

-   **Primary Brand (DraftWise Cyan):**
    -   Text/Accent: `#67E8F9` (cyan-300)
    -   Interactive/Buttons: `#0891B2` (cyan-600)
    -   Glows/Hovers: `#0E7490` (cyan-700)
-   **Neutral Palette (Deep Space):**
    -   Primary Background: `#0A0F1F`
    -   Panel/Card Background: `#141A33`
    -   Borders/Dividers: `#334155` (slate-700)
-   **Semantic Colors:**
    -   Success/Buffs: `#4ADE80` (green-400)
    -   Warning: `#FACC15` (yellow-400)
    -   Danger/Nerfs: `#F87171` (red-400)

### `5.2` Typography

-   **Headings Font (`font-display`):** `Rajdhani` - A futuristic, squared sans-serif for personality.
-   **UI & Body Font:** `Inter` - A highly legible variable sans-serif for clarity at all sizes.

### `5.3` Core Effects & Animations

-   **Subtle Hex Grid:** A low-opacity hexagonal grid pattern is applied to the main body background for texture and thematic reinforcement.
-   **Frosted Glass Effect:** Key UI surfaces like the header and modals use `backdrop-blur` to create a sense of depth and focus.
-   **Cyan Glows:** Primary buttons and active states use soft `box-shadow` glows instead of hard borders for a more modern, energetic feel.
-   **Tactile Interactions:** Buttons subtly scale down (`transform: scale(0.97)`) on click for satisfying feedback. Cards lift on hover (`transform: translateY(-4px)`).

## `6.0` | The Gemini Core: AI Integration

The soul of DraftWise AI is its connection to the **Google Gemini API**, orchestrated through `src/services/geminiService.ts`.

### `6.1` The Strategic Primer

The most critical component of our AI is the **`STRATEGIC_PRIMER`** found in `src/data/strategyInsights.ts`. This is a hand-curated knowledge base synthesized from expert-level game theory. It is injected into relevant prompts to provide the Gemini model with a consistent, high-quality strategic framework. This ensures that all AI advice is grounded in established concepts like composition archetypes (Poke, Dive, etc.), win conditions, and power spikes.

### `6.2` Key Service Functions

-   **`getDraftAdvice`:** The primary analysis engine for the Draft Lab. It formats the current draft state, injects the `STRATEGIC_PRIMER`, and requests a structured JSON response by defining a `responseSchema`.
-   **`getChampionAnalysis` & `getMatchupAnalysis`:** Power the Champion Armory by requesting deep, structured data on a specific champion, including builds, runes, playstyle, and matchup-specific tips.
-   **`getTierList` & `getPatchNotesSummary`:** These functions leverage Gemini's **Google Search grounding tool** (`tools: [{googleSearch: {}}]`) to fetch and synthesize real-time information about the current game meta. The raw sources are always extracted and displayed to the user for transparency.
-   **`getChampionSuggestions`:** A low-latency function (`thinkingConfig: { thinkingBudget: 0 }`) that provides quick, context-aware champion recommendations for the active draft slot.

## `7.0` | Powering Up: Local Development Setup

Follow these steps to initialize your local development environment.

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd draftwise-ai
    ```

2.  **Install Dependencies:**
    This project uses `npm` as its package manager.
    ```bash
    npm install
    ```

3.  **Configure API Key:**
    The Gemini API key is required for all AI features. It **must** be provided via an environment variable.
    -   Create a file named `.env` in the project root.
    -   Add the following line, replacing `YOUR_API_KEY_HERE` with your actual key:
        ```
        API_KEY=YOUR_API_KEY_HERE
        ```
    -   The `.env` file is listed in `.gitignore` and should never be committed to version control.

4.  **Launch Development Server:**
    ```bash
    npm run dev
    ```
    The application will now be running on your local machine, typically at `http://localhost:5173`.

## `8.0` | Joining the Forge: Contribution Guidelines

Contributions to enhance the Hextech Co-Pilot are welcome. Please adhere to the following protocols.

-   **Code Style:** Maintain the existing code style. Use TypeScript, write clean and readable components, and adhere to the established project structure.
-   **Commit Messages:** Use clear and descriptive commit messages that explain the "what" and "why" of your changes.
-   **UI/UX Cohesion:** All new or modified UI components **must** adhere to the "Holographic Hextech" design system. Use the established color palette, typography, and effects.
-   **Pull Requests:**
    -   Create a new branch for your feature or bugfix.
    -   Ensure your code is free of linting errors and builds successfully.
    -   Submit a pull request with a detailed description of the changes you have made.

---
<div align="center">

**End of Transmission.**

</div>
