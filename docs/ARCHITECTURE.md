# Architecture Documentation - League AI Oracle

## Overview

League AI Oracle is a React-based PWA that helps players improve their League of Legends draft strategy using AI-powered analysis.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   User Interface Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Home   │  │DraftLab  │  │  Arena   │  │ Profile │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Context Layer                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Draft     │  │   Champion   │  │   Settings     │ │
│  │  Context    │  │   Context    │  │   & Profile    │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Gemini    │  │   Storage    │  │   Analytics    │ │
│  │   AI API    │  │   Service    │  │   & Logging    │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  IndexedDB  │  │ LocalStorage │  │  Data Dragon   │ │
│  │             │  │              │  │  (Riot API)    │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Draft Analysis Flow

```
User selects champions
         │
         ▼
   DraftLab Component
         │
         ▼
   useDraft() Hook
         │
         ▼
   updateSlotInDraft()
         │
         ▼
   DraftState Updated
         │
         ▼
   User clicks "Analyze"
         │
         ▼
   getDraftAdvice() Service
         │
         ▼
   Gemini API Request
         │
         ▼
   Parse JSON Response
         │
         ▼
   Update UI with Advice
         │
         ▼
   Award SP & Complete Missions
```

### 2. Champion Data Flow

```
App Startup
     │
     ▼
ChampionProvider Mount
     │
     ▼
Check Cache (localStorage)
     │
     ├─ Cache Hit ─────────┐
     │                     │
     ▼                     ▼
Fetch DDragon Version  Use Cached Data
     │                     │
     ▼                     │
Fetch championFull.json   │
     │                     │
     ▼                     │
Transform Data            │
     │                     │
     ▼                     │
Store in Cache ───────────┘
     │
     ▼
Provide to App via Context
```

### 3. User Profile Flow

```
App Startup
     │
     ▼
UserProfileProvider Mount
     │
     ▼
Load from IndexedDB
     │
     ├─ Found ──────────────┐
     │                      │
     ▼                      ▼
Check Onboarding    Hydrate Profile
     │                      │
     ▼                      │
Show Setup Modal ──────────┘
     │
     ▼
User Interacts (earns SP, completes missions)
     │
     ▼
Update Profile State
     │
     ▼
Save to IndexedDB
     │
     ▼
Check for Level Up
     │
     ▼
Show Celebration Toast
```

## Key Design Patterns

### 1. **Context + Hooks Pattern**

Global state managed through React Context, accessed via custom hooks.

```typescript
// Context provides state
<DraftProvider>
  <App />
</DraftProvider>

// Hook consumes state
const { draftState, setDraftState } = useDraft();
```

**Benefits:**
- Avoids prop drilling
- Easy to test
- Type-safe
- Centralized state logic

### 2. **Service Layer Pattern**

Business logic separated from components in service modules.

```typescript
// services/geminiService.ts
export const getDraftAdvice = async (...) => {
  // API logic here
};

// Component uses service
import { getDraftAdvice } from '../../services/geminiService';
```

**Benefits:**
- Reusable across components
- Easy to mock for testing
- Clear separation of concerns
- Single source of truth for API calls

### 3. **Progressive Enhancement**

Features degrade gracefully when dependencies unavailable.

```typescript
// Prefer IndexedDB, fallback to localStorage
if (db) {
  await db.userProfile.put(profile);
} else {
  await SafeStorage.set(USER_PROFILE_ID, profile);
}
```

**Benefits:**
- Works in privacy mode
- Handles storage quota
- Supports older browsers

### 4. **Error Boundaries**

Component-level error isolation prevents full app crashes.

```typescript
<FeatureErrorBoundary componentName="Draft Lab">
  <DraftLab />
</FeatureErrorBoundary>
```

**Benefits:**
- Graceful degradation
- Better UX during errors
- Easier debugging
- Isolated failures

### 5. **Lazy Loading + Code Splitting**

Routes loaded on-demand to reduce initial bundle.

```typescript
const DraftLab = React.lazy(() => 
  import('./DraftLab/DraftLab')
);
```

**Benefits:**
- Faster initial load
- Smaller main bundle
- Better performance
- Improved caching

## Component Hierarchy

```
App
├── ErrorBoundary
├── ChampionProvider
├── DraftProvider
├── SettingsProvider
├── UserProfileProvider
└── Router
    ├── Home
    ├── DraftLab (lazy)
    │   ├── TeamPanel
    │   ├── ChampionGrid
    │   ├── AdvicePanel
    │   └── BlueprintPanel
    ├── Arena (lazy)
    │   ├── DraftTimeline
    │   ├── TurnIndicator
    │   └── ArenaChampionSelectModal
    ├── Playbook (lazy)
    ├── Academy (lazy)
    ├── StrategyHub (lazy)
    ├── MetaOracle (lazy)
    ├── Profile (lazy)
    └── Scenarios (lazy)
```

## State Management

### Global State (Contexts)

1. **DraftContext** - Main draft state (picks/bans)
2. **ChampionContext** - Champion data from DDragon
3. **SettingsContext** - User preferences
4. **UserProfileContext** - User progression & gamification

### Local State (Component useState)

- UI state (modals, loading, active slots)
- Form inputs
- Temporary data (draft for Arena mode)

### Derived State (useMemo)

- Filtered champion lists
- Available champions
- Calculated statistics

## Performance Optimizations

### 1. **React.memo**
Components that receive stable props are memoized.

```typescript
export const ChampionCard = React.memo(({ champion }) => {
  // ...
});
```

### 2. **useMemo & useCallback**
Expensive calculations and callbacks are memoized.

```typescript
const availableChampions = useMemo(
  () => getAvailableChampions(draftState, championsLite),
  [draftState, championsLite]
);
```

### 3. **Image Lazy Loading**
Champion images load only when visible.

```typescript
<img src={champ.image} loading="lazy" />
```

### 4. **Virtual Scrolling**
Large lists render only visible items (react-window).

### 5. **Caching**
- Champion data cached for 24 hours
- API responses cached when possible
- Service worker caches assets

## Security Considerations

### 1. **API Keys**
- Stored in environment variables
- Never exposed to client bundle
- Proxied through server when needed

### 2. **Input Validation**
- All user inputs validated with Zod
- AI prompts sanitized
- Draft states validated before analysis

### 3. **XSS Prevention**
- React automatically escapes content
- Markdown renderer sanitizes HTML
- No `dangerouslySetInnerHTML` without sanitization

### 4. **CSP Headers**
Content Security Policy headers prevent injection attacks (recommended for production).

## Testing Strategy

### Unit Tests
- Pure functions (draftUtils, validation)
- Custom hooks (useDebounce, useSettings)
- UI components (Button, Modal)

### Integration Tests
- Context providers with hooks
- Service layer with mocked APIs
- Component interactions

### E2E Tests (Playwright)
- Critical user flows
- Draft creation workflow
- Profile setup
- Navigation

## Deployment Architecture

```
Developer
    │
    ▼
Git Push to Main
    │
    ▼
CI/CD Pipeline (GitHub Actions)
    │
    ├─ Run Tests
    ├─ Type Check
    ├─ Build Production Bundle
    └─ Deploy
         │
         ▼
    Static Hosting (Vercel/Netlify)
         │
         ├─ Serve Static Assets
         ├─ Service Worker (PWA)
         └─ CDN Distribution
              │
              ▼
         End Users
```

## Future Architecture Considerations

### 1. **Backend API**
Consider adding a backend for:
- User accounts & cloud sync
- Leaderboards
- Advanced analytics
- Rate limiting

### 2. **WebSockets**
Real-time features:
- Live draft with teammates
- Shared draft rooms
- Real-time meta updates

### 3. **GraphQL**
Replace REST with GraphQL for:
- Flexible data fetching
- Reduced over-fetching
- Better caching with Apollo Client

### 4. **Web Workers**
Move heavy processing off main thread:
- Draft analysis parsing
- Large data transformations
- Background sync

## Monitoring & Observability

### Current Implementation
- Sentry for error tracking
- PostHog for analytics
- Performance API for metrics
- LaunchDarkly for feature flags

### Recommended Metrics
1. **Performance**
   - LCP, FID, CLS (Core Web Vitals)
   - Bundle sizes
   - API response times

2. **Business**
   - Draft analyses per user
   - AI success rate
   - Feature adoption
   - User retention

3. **Errors**
   - Error rate by component
   - AI failure rate
   - Storage errors
   - Network failures
# API Documentation - Services Layer

## Gemini AI Service

The Gemini AI Service handles all interactions with Google's Gemini AI API for draft analysis, meta predictions, and strategic advice.

### Core Functions

#### `getDraftAdvice()`

Analyzes a complete draft and provides comprehensive strategic insights.

**Parameters:**
- `draftState: DraftState` - The current draft with all picks and bans
- `userSide: TeamSide` - Which team the user is on ('blue' or 'red')
- `userRole: string` - The user's primary role (e.g., 'Mid', 'ADC')
- `skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'` - User's skill level for tailored advice
- `model: 'gemini-2.5-flash' | 'gemini-2.5-pro'` - AI model to use
- `signal: AbortSignal` - For cancelling requests

**Returns:** `Promise<AIAdvice>`

Contains:
- Team analysis for both sides
- Pick/ban suggestions
- Build recommendations
- Power spike timeline
- Key matchups

**Example:**
```typescript
const advice = await getDraftAdvice(
  draftState,
  'blue',
  'Mid',
  'Intermediate',
  'gemini-2.5-flash',
  abortController.signal
);

console.log(advice.teamAnalysis.blue.draftScore); // e.g., "A-"
```

---

#### `getBotDraftAction()`

Determines what a bot opponent should pick or ban based on their persona.

**Parameters:**
- `draftState: DraftState` - Current draft state
- `turn: DraftTurn` - Current turn information
- `persona: string` - Bot personality ('The Strategist', 'Meta Slave', etc.)
- `availableChampions: ChampionLite[]` - Champions not yet picked/banned
- `signal: AbortSignal` - For cancelling requests
- `sTierChampions?: string[]` - Optional S-tier champions for meta-focused bots
- `oneTrickChampion?: string` - Optional one-trick champion for specialized bots

**Returns:** `Promise<ChampionSuggestion>`

**Example:**
```typescript
const botChoice = await getBotDraftAction({
  draftState,
  turn: { team: 'red', type: 'pick', index: 0 },
  persona: 'The Strategist',
  availableChampions,
  signal: controller.signal
});

console.log(`Bot selected: ${botChoice.championName}`);
console.log(`Reasoning: ${botChoice.reasoning}`);
```

---

#### `getTeambuilderSuggestion()`

Suggests champions for a specific role based on a team composition concept.

**Parameters:**
- `coreConcept: string` - The strategy (e.g., "Poke comp", "Build around Yasuo")
- `currentPicks: string[]` - Champions already selected
- `roleToPick: string` - Role to fill ('Top', 'Jungle', etc.)
- `availableChampions: ChampionLite[]` - Available champion pool
- `signal: AbortSignal` - For cancelling requests

**Returns:** `Promise<ChampionSuggestion[]>`

Returns 3 suggestions with reasoning.

**Example:**
```typescript
const suggestions = await getTeambuilderSuggestion({
  coreConcept: 'Teamfight Wombo Combo',
  currentPicks: ['Malphite', 'Yasuo'],
  roleToPick: 'Support',
  availableChampions,
  signal: controller.signal
});

suggestions.forEach(s => {
  console.log(`${s.championName}: ${s.reasoning}`);
});
```

---

## Storage Service

Manages persistent data storage using IndexedDB with localStorage fallback.

### Core Functions

#### `getUserProfile()`

Retrieves the user's profile from storage.

**Returns:** `Promise<UserProfile | undefined>`

**Example:**
```typescript
const profile = await getUserProfile();
if (profile) {
  console.log(`Welcome back, ${profile.username}!`);
}
```

---

#### `saveUserProfile()`

Saves the user's profile to storage.

**Parameters:**
- `profile: UserProfile` - The profile object to save

**Returns:** `Promise<void>`

**Throws:** Error if save fails

**Example:**
```typescript
await saveUserProfile({
  ...profile,
  sp: profile.sp + 100,
  level: profile.level + 1
});
```

---

#### `getSettings()` / `saveSettings()`

Manages user settings in localStorage.

**Example:**
```typescript
const settings = getSettings();
if (settings) {
  console.log(`Theme: ${settings.theme}`);
}

saveSettings({
  ...settings,
  theme: 'dark'
});
```

---

#### `getCache()` / `setCache()`

Manages cached data with version control and TTL.

**Parameters:**
- `key: string` - Cache key
- `data: T` - Data to cache (for setCache)
- `version: string` - Data version for cache invalidation

**TTL:** 1 hour (configurable)

**Example:**
```typescript
// Try to get from cache
const cached = getCache<Champion[]>('championData', '14.1.1');
if (cached) {
  return cached;
}

// Fetch fresh data
const freshData = await fetchChampions();
setCache('championData', freshData, '14.1.1');
```

---

## Champion Context

Provides champion data throughout the application.

### Hook: `useChampions()`

**Returns:**
```typescript
{
  champions: Champion[],          // Full champion data
  championsLite: ChampionLite[], // Lightweight data for grids
  isLoading: boolean,
  error: string | null,
  latestVersion: string | null,
  refetch: () => Promise<void>
}
```

**Example:**
```typescript
const { champions, isLoading, error } = useChampions();

if (isLoading) return <Loader />;
if (error) return <ErrorMessage />;

return <ChampionGrid champions={champions} />;
```

---

## Draft Context

Manages draft state across the application.

### Hook: `useDraft()`

**Returns:**
```typescript
{
  draftState: DraftState,
  setDraftState: (state: DraftState) => void,
  resetDraft: () => void
}
```

**Example:**
```typescript
const { draftState, setDraftState, resetDraft } = useDraft();

// Add a pick
const handlePick = (champion: Champion) => {
  setDraftState(prev => 
    updateSlotInDraft(prev, 'blue', 'pick', 0, champion)
  );
};

// Reset draft
<Button onClick={resetDraft}>Start Over</Button>
```

---

## Error Handling

All service functions should be wrapped in try-catch blocks and handle:

1. **Network Errors** - API unavailable, timeouts
2. **Validation Errors** - Invalid input data
3. **Storage Errors** - Quota exceeded, privacy mode
4. **AI Errors** - Empty/invalid responses

**Example Pattern:**
```typescript
try {
  const result = await getDraftAdvice(...);
  setAdvice(result);
} catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    // Request was cancelled - ignore
    return;
  }
  
  const message = err instanceof Error 
    ? err.message 
    : 'An unknown error occurred';
  
  toast.error(message);
  console.error('Draft analysis failed:', err);
}
```

---

## Rate Limiting & Quotas

### AI Service Limits
- **Flash Model**: Fast, suitable for most operations
- **Pro Model**: Slower but more accurate for complex analysis

### Best Practices
1. Use abort controllers for all async operations
2. Debounce user inputs before calling AI
3. Cache AI responses when possible
4. Show loading states immediately
5. Provide meaningful error messages

---

## Testing

Service functions should have:
1. Unit tests for pure functions
2. Integration tests with mocked API
3. Error handling tests

**Example:**
```typescript
describe('getDraftAdvice', () => {
  it('handles incomplete drafts gracefully', async () => {
    const incompleteDraft = getInitialDraftState();
    await expect(
      getDraftAdvice(incompleteDraft, ...)
    ).rejects.toThrow();
  });
});
```

