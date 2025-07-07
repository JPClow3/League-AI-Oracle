# DraftWise AI

<div align="center">
  <img src="https://storage.googleapis.com/maker-suite-project-files-prod/15b53a0f-f90a-473c-b2b9-e4d6d9d43525/icon.png" alt="DraftWise AI Logo" width="150">
  <p><strong>Your Personal AI-Powered Strategic Analyst for League of Legends</strong></p>
  <p><em>Elevate your draft, master the meta, and outthink your opponents.</em></p>
</div>

---

DraftWise AI is an advanced strategic analysis platform for League of Legends, designed to feel like you have a professional esports analyst by your side. Powered by Google's Gemini API, it provides data-driven insights, real-time draft optimization, and personalized tactical guidance to help players of all levels elevate their in-game performance and strategic mastery.

## ✨ Key Features

-   **Live Drafting Arena**: Get real-time AI suggestions for picks and bans during a live draft simulation, tailored to your team's composition and your personal champion pool.
-   **The Forge (Draft Lab)**: An experimental sandbox to theory-craft compositions, see instant team analytics, and get AI-powered suggestions to fill in the gaps.
-   **In-Depth AI Analysis**: Once a draft is complete, receive a comprehensive breakdown including team identities, power spike timelines, win conditions, and matchup-specific threats.
-   **Personalized Learning Path**: The Academy provides a curated library of strategic knowledge. The AI tracks your progress and suggests lessons based on your gameplay patterns.
-   **Strategic Trials & Daily Puzzles**: Test your drafting knowledge with interactive scenarios and daily challenges to earn XP and sharpen your strategic mind.
-   **Game History & Post-Game Debriefs**: Log your game outcomes to receive a post-game AI analysis, identifying what went right, what went wrong, and which lesson could help you improve.
-   **Champion Vault**: A complete database of all champions, featuring AI-generated strategic summaries, strengths, weaknesses, and build synergies.
-   **Live Meta Snapshot**: Stay ahead of the curve with an AI-generated summary of the current patch's trending champions, powered by Google Search.
-   **Shareable Drafts**: Export your completed draft and analysis as a shareable link or a downloadable image to discuss with your team.
-   **Dynamic Aura System**: The app's UI subtly changes color to reflect the state of your draft, providing at-a-glance feedback on your team's damage profile or the AI's current "mood".

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Engine**: Google Gemini API (`@google/genai`)
-   **State Management**: Zustand
-   **Game Data**: Riot Games Data Dragon (DDragon) API
-   **Utilities**: `html2canvas` for image exports, `import-maps` for dependency management.

## 🏗️ Architecture & Design

DraftWise AI is built with a modern, scalable frontend architecture:

-   **Component-Based UI**: Built with React and TypeScript for a strongly-typed, maintainable, and reusable component library.
-   **Service-Oriented Logic**: Core functionalities like AI interaction (`geminiService`) and game data fetching (`ddragonService`) are abstracted into dedicated services, keeping components clean.
-   **Hybrid State Management**:
    -   **React Context (`ProfileContext`)**: Manages user profiles, settings, and history, which are persisted to `localStorage`. This is ideal for data that changes infrequently but is needed across the app.
    -   **Zustand (`draftStore`, `notificationStore`)**: A lightweight global store for managing transient, high-frequency state like the current draft and UI notifications.
-   **Data-Driven AI**: The `geminiService` constructs highly contextualized prompts using a combination of the current game state, user profile settings, and an internal knowledge base (`gameKnowledge.ts`, `knowledgeBase.ts`) to guide the Gemini model towards expert-level analysis.
-   **UX-First Design**: The application prioritizes a fluid and intuitive user experience with smooth animations, a dynamic theme system (light/dark), and responsive design that adapts to different screen sizes. The "Aura" system provides subtle, ambient feedback on the state of the draft.

## 🚀 Getting Started

To run DraftWise AI locally, follow these steps:

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/draftwise-ai.git
    cd draftwise-ai
    ```

2.  **Install dependencies:**
    The project uses ES modules and an `importmap` in `index.html`, so there's no traditional `npm install` step for frontend libraries. However, you'll need a local server to run the app. A simple way is to use a package like `serve`.

    ```bash
    # Install serve globally if you don't have it
    npm install -g serve
    ```

3.  **Set up your Environment Variable:**
    The application requires a Google Gemini API key.

    -   Create a file named `.env` in the root of the project.
    -   Add your API key to this file:
        ```
        API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```
    -   _Note: The application is designed to load this key from `process.env.API_KEY`. You will need a build tool or server setup that makes this environment variable available to the client-side code. For local development with basic servers, this may require a simple build script._

4.  **Run the application:**
    Use a local server to serve the project files.
    ```bash
    serve -s .
    ```
    This will start a server, typically on `http://localhost:3000`. Open this URL in your browser to use the application.

## 📁 Project Structure

```
/
├── public/
│   └── ... (Static assets if any)
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components (Icon, Spinner, Modals)
│   │   ├── DraftingScreen.tsx  # The live drafting view
│   │   ├── DraftLab.tsx      # The composition sandbox
│   │   ├── Home.tsx          # The main dashboard
│   │   └── ... (Other screen components)
│   ├── contexts/
│   │   └── ProfileContext.tsx # Manages user profiles and settings
│   ├── data/
│   │   ├── gameData.ts       # Static champion roles, classes, etc.
│   │   ├── knowledgeBase.ts  # The AI's strategic "textbook"
│   │   └── ... (Other static data)
│   ├── hooks/
│   │   └── useLocalStorage.ts # Custom hook for persisting state
│   ├── services/
│   │   ├── ddragonService.ts # Fetches data from Riot's DDragon API
│   │   ├── geminiService.ts  # Handles all communication with the Gemini API
│   │   └── historyAnalyzer.ts# Analyzes user game history for insights
│   ├── store/
│   │   ├── draftStore.ts     # Zustand store for live draft state
│   │   └── notificationStore.ts # Zustand store for UI notifications
│   ├── types/
│   │   └── types.ts          # Centralized TypeScript interfaces
│   ├── utils/
│   │   └── shareService.ts   # Logic for compressing/encoding drafts for URL sharing
│   ├── App.tsx             # Main app component, handles routing
│   └── index.tsx           # React root entry point
├── index.html              # Main HTML file with importmap
├── README.md               # You are here!
└── metadata.json           # Application metadata
```

## 🤝 Contributing

Contributions are welcome! If you have suggestions for new features, bug fixes, or improvements, please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgements

-   **Riot Games** for the [Data Dragon API](https://developer.riotgames.com/docs/lol#data-dragon), which provides the essential game data.
-   **Google** for the powerful and flexible [Gemini API](https://ai.google.dev/).
-   The creators of all the open-source libraries used in this project.
