# DraftWise AI

<div align="center">
  <img src="https://storage.googleapis.com/maker-suite-project-files-prod/15b53a0f-f90a-473c-b2b9-e4d6d9d43525/icon.png" alt="DraftWise AI Logo" width="150">
  <p><strong>Your Personal AI-Powered Strategic Analyst for League of Legends</strong></p>
  <p><em>Elevate your draft, master the meta, and outthink your opponents.</em></p>
</div>

---

DraftWise AI is an advanced strategic analysis platform for League of Legends, designed to feel like you have a professional esports analyst by your side. Powered by Google's Gemini API, it provides data-driven insights, real-time draft optimization, and personalized tactical guidance to help players of all levels elevate their in-game performance and strategic mastery.

## ✨ Key Features

-   **Live Drafting Arena**: Get real-time AI suggestions, counter-intel on enemy picks, and contextual tips during a live draft simulation.
-   **The Forge (Draft Lab)**: An experimental sandbox to theory-craft compositions. Load meta blueprints, get live analytics, and use AI to find the perfect final pick.
-   **Commander's Playbook**: Save your best strategies and team compositions from the Lab or Arena for future reference and analysis.
-   **Live Game Scout**: Enter any player's Riot ID to get a live scouting report of their current game, including AI-generated player profiles for all participants.
-   **Riot Account Sync**: Link your Riot account to automatically import your top champions, track your ranked stats, and analyze your match history.
-   **In-Depth AI Analysis**: Receive comprehensive breakdowns of drafts, including team identities, power spike timelines, win conditions, and matchup-specific threats.
-   **Champion Vault & Oracle's Armory**: Explore a complete champion database with detailed strategic guides, and use the Armory to instantly find synergies and counters for any champion.
-   **Personalized Learning & Daily Challenges**: A full learning Academy with lessons and trials. Test your knowledge with a unique, AI-generated draft puzzle every day.
-   **Game History & Performance Analysis**: Review past drafts, get post-game AI debriefs, and see analysis of your strategic blind spots based on your play history.
-   **Live Meta Snapshot**: Stay ahead of the curve with an AI-generated summary of the current patch's trending champions, powered by Google Search.
-   **Shareable Drafts**: Export your completed draft and analysis as a shareable link or a downloadable image.
-   **Offline Functionality & Caching**: The app loads instantly on subsequent visits and core features like the Forge and Playbook are available offline, thanks to service workers and IndexedDB caching.
-   **Dynamic Aura System**: The app's UI subtly changes color to reflect the state of your draft, providing at-a-glance feedback on your team's damage profile or the AI's current "mood".


## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Engine**: Google Gemini API (`@google/genai`)
-   **State Management**: Zustand (global state) & React Context (profile state)
-   **Game Data**: Riot Games Data Dragon (DDragon) for static assets & Riot Games API for live player/game data.
-   **Utilities**: `html2canvas` for image exports, `import-maps` for dependency management.


## 🚀 Getting Started

### Prerequisites

You will need a local web server to run the project. A simple option is the `serve` package:
```bash
# Install serve globally if you don't have it
npm install -g serve
```

### Environment Variables

The application requires API keys to function. These are expected to be available as environment variables in the execution context.

Create a `.env` file in the root of the project and add your keys:
```
# For all AI features
API_KEY=YOUR_GEMINI_API_KEY_HERE

# For live game scouting and player data sync
RIOT_API_KEY=YOUR_RIOT_API_KEY_HERE
```
_Note: For a static project like this, a build tool (e.g., Vite, Parcel) or a custom server setup is required to correctly inject these environment variables for the browser to access them via `process.env`._

### Running the Application

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/draftwise-ai.git
    cd draftwise-ai
    ```

2.  **Serve the project:**
    ```bash
    serve -s .
    ```
    This will start a server, typically on `http://localhost:3000`. Open this URL in your browser to use the application.


## 📁 Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── common/             # Reusable components (Icon, Spinner, Modals)
│   │   ├── DraftingScreen.tsx  # The live drafting view
│   │   ├── DraftLab.tsx        # The composition sandbox
│   │   ├── ScoutScreen.tsx     # Live game scouting view
│   │   ├── Home.tsx            # The main dashboard
│   │   └── ... (Other screen components)
│   ├── contexts/
│   │   └── ProfileContext.tsx  # Manages user profiles, settings, and Riot account data
│   ├── data/
│   │   ├── gameData.ts         # Static champion roles, classes, etc.
│   │   ├── knowledgeBase.ts    # The AI's strategic "textbook"
│   │   ├── aiConstants.ts      # Core knowledge for the Gemini service
│   │   └── gameplayConstants.ts# Game rules, synergies, meta comps
│   ├── hooks/
│   │   └── ... (Custom hooks)
│   ├── services/
│   │   ├── ddragonService.ts   # Fetches data from Riot's DDragon API
│   │   ├── riotService.ts      # Fetches live data from the Riot Games API
│   │   ├── geminiService.ts    # Handles all communication with the Gemini API
│   │   └── historyAnalyzer.ts  # Analyzes user game history for insights
│   ├── store/
│   │   ├── draftStore.ts       # Zustand store for live draft state
│   │   └── notificationStore.ts# Zustand store for UI notifications
│   ├── types.ts                # Centralized TypeScript interfaces
│   ├── utils/
│   │   └── ... (Utility functions)
│   ├── App.tsx                 # Main app component, handles routing
│   └── index.tsx               # React root entry point
├── index.html                  # Main HTML file with importmap
├── README.md                   # You are here!
└── metadata.json               # Application metadata
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

-   **Riot Games** for the [Data Dragon API](https://developer.riotgames.com/docs/lol#data-dragon) and the [Riot Games API](https://developer.riotgames.com/).
-   **Google** for the powerful and flexible [Gemini API](https://ai.google.dev/).
-   The creators of all the open-source libraries used in this project.