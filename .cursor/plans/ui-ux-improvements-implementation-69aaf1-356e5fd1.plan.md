<!-- 356e5fd1-0af2-4eb6-bf27-4dce471a1907 b708fe1f-a81f-4b7c-94a4-5a74c337e7da -->

# UI/UX Improvements Implementation Plan

## Overview

This plan implements all recommendations from UI_UX_REVIEW.md, organized into three phases aligned with the priority matrix. Each phase includes specific implementation details, file paths, code patterns, and testing strategies.

**Key Principles:**

- Prioritize high-impact, high-priority items first
- Maintain backward compatibility during implementation
- Test incrementally after each major change
- Follow existing design system patterns (see DESIGN_SYSTEM.md)
- Ensure mobile-first responsive design

## Phase 1: Critical Issues (High Priority, High Impact) - 1-2 weeks

### 1.1 Navigation Structure Simplification

**Priority:** High Priority, High Impact (Do First #1)

**Files to create:**

- `components/Layout/SidebarNav.tsx` - Desktop sidebar with collapsible sections
- `components/Layout/QuickActionsMenu.tsx` - Dropdown menu in header
- `components/Layout/MoreMenu.tsx` - Mobile drawer for secondary features
- `components/common/Breadcrumbs.tsx` - Navigation breadcrumbs

**Files to modify:**

- `components/Layout/BottomNav.tsx` - Add "More" menu item (5th slot)
- `components/Layout/Header.tsx` - Add Quick Actions button and sidebar toggle
- `App.tsx` - Add sidebar state management

**Implementation:**

- SidebarNav: Collapsible sections (Draft Tools, Learning, Resources, Profile)
- Quick Actions: Dropdown with shortcuts (Start Draft, Daily Challenge, Recent)
- More Menu: Bottom sheet on mobile with secondary features
- Breadcrumbs: Show page hierarchy on desktop

### 1.2 Home Page Redesign

**Priority:** High Priority, High Impact (Do First #6)

**Files to create:**

- `components/Home/HeroSection.tsx` - Hero component with primary CTA
- `components/Home/FeatureSection.tsx` - Grouped feature cards

**Files to modify:**

- `components/Home/Home.tsx` - Complete restructure
- `components/Home/SmartDashboard.tsx` - Enhanced with recommendations

**Implementation:**

- Hero section with "Start Your First Draft" CTA
- Feature grouping: Core Tools, Learning, Resources
- Quick Start section for new users (level < 3)
- Enhanced SmartDashboard with recent activity and recommendations

### 1.3 DraftLab Mobile Experience

**Priority:** High Priority, High Impact (Do First #2)

**Files to create:**

- `components/DraftLab/MobileTabs.tsx` - Tab navigation for mobile
- `components/DraftLab/MobileTeamView.tsx` - Combined team view
- `hooks/useSwipeGesture.ts` - Swipe gesture detection

**Files to modify:**

- `components/DraftLab/DraftLab.tsx` - Conditional rendering (desktop vs mobile)
- `components/DraftLab/TeamPanel.tsx` - Ensure 48px touch targets
- `components/DraftLab/ChampionGrid.tsx` - Mobile optimizations

**Implementation:**

- Tabbed interface: Team | Champions | Advice
- Swipe gestures between tabs
- Pull-to-refresh functionality
- Bottom sheet modals instead of full-screen
- All touch targets minimum 48px

### 1.4 Confirmation Dialogs for Destructive Actions

**Priority:** High Priority, High Impact (Do First #3)

**Files to modify:**

- `components/common/ConfirmationModal.tsx` - Enhance with icons
- `components/DraftLab/DraftLab.tsx` - Add confirmation for reset
- `components/Arena/LiveArena.tsx` - Add confirmation for reset
- `components/LiveDraft/LiveDraft.tsx` - Add confirmation for reset

**Implementation:**

- Enhance ConfirmationModal with variant icons
- Add confirmations for all reset/delete actions
- Use variant="danger" for destructive actions
- Keyboard support (Enter to confirm, Escape to cancel)

### 1.5 Champion Selection UX Improvements

**Priority:** High Priority, High Impact (Do First #4)

**Files to create:**

- `lib/metaChampions.ts` - Top 20 meta champions list
- `hooks/useChampionHistory.ts` - Track recently used champions
- `components/DraftLab/ChampionQuickPick.tsx` - Quick pick mode
- `components/DraftLab/FilterChips.tsx` - Filter chips component

**Files to modify:**

- `components/DraftLab/ChampionGrid.tsx` - Add all enhancements
- `hooks/useSettings.ts` - Add favoriteChampions to settings

**Implementation:**

- Quick Pick mode showing top 20 meta champions
- Sticky search bar on scroll
- Filter chips above grid (visible without clicking)
- Favorites row at top of grid
- Recently used section
- Smart suggestions based on team composition
- Drag indicators on champion cards

## Phase 2: Major Improvements (High Priority, Medium Impact) - 2-4 weeks

### 2.1 Undo/Redo Functionality

**Priority:** High Priority, Medium Impact (#7)

**Files to create:**

- `hooks/useUndoRedo.ts` - Generic undo/redo hook
- `components/DraftLab/UndoRedoControls.tsx` - UI controls

**Files to modify:**

- `contexts/DraftContext.tsx` - Integrate undo/redo
- `components/DraftLab/DraftLab.tsx` - Add controls and keyboard shortcuts

**Implementation:**

- useUndoRedo hook with max 50 state history
- Undo/redo buttons in DraftLab header
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)
- Toast notifications for undo/redo actions
- Action descriptions in toasts

### 2.2 Contextual Help and Tooltips

**Priority:** High Priority, Medium Impact (#8)

**Files to create:**

- `components/common/ContextualHelp.tsx` - Help button and modal
- `hooks/useContextualHelp.ts` - Track shown tooltips
- `components/common/FeatureTooltip.tsx` - First-time tooltips
- `lib/helpContent.ts` - Help content for each page

**Files to modify:**

- `components/common/Tooltip.tsx` - Enhance with rich content
- `components/Layout/Header.tsx` - Add Help button

**Implementation:**

- Help button in header with page-specific tips
- First-time tooltips for features
- Track shown tooltips in localStorage
- Enhanced tooltip with rich content support
- DraftLab tooltips for interaction methods

### 2.3 Design System Standardization

**Priority:** High Priority, Medium Impact (#9)

**Files to create:**

- `components/common/Card.tsx` - Standardized card component
- `components/common/Typography.tsx` - Typography components
- `components/common/Icon.tsx` - Icon wrapper with sizes
- `lib/designTokens.ts` - Design token constants

**Files to modify:**

- `tailwind.config.js` - Add spacing and typography tokens
- `styles/index.css` - Add typography CSS variables

**Implementation:**

- Card component with variants (default, elevated, outlined, interactive)
- Typography components (H1-H4, Body, Small, Tiny)
- Icon wrapper standardizing sizes (16px, 20px, 24px, 32px)
- Spacing scale in Tailwind config
- Typography scale CSS variables

### 2.4 Skeleton Screens for Loading States

**Priority:** High Priority, Medium Impact (#10)

**Files to modify:**

- `components/common/Skeleton.tsx` - Add variants
- `components/DraftLab/AdvicePanel.tsx` - Add skeleton
- `components/DraftLab/ChampionGrid.tsx` - Add skeleton
- All components with isLoading states

**Implementation:**

- Skeleton variants: text, card, grid, list, circle
- Skeleton for AdvicePanel during AI analysis
- Skeleton for ChampionGrid during loading
- Progress indication with estimated time
- Smooth shimmer animation

### 2.5 AI Advice Panel Improvements

**Priority:** High Priority, High Impact (Do First #5)

**Files to create:**

- `components/DraftLab/AdviceSection.tsx` - Advice sections component
- `components/DraftLab/CopyInsightButton.tsx` - Copy button component

**Files to modify:**

- `components/DraftLab/AdvicePanel.tsx` - Complete redesign
- `components/DraftLab/DraftLab.tsx` - Ensure always visible

**Implementation:**

- Always visible panel (desktop) or accessible via tab (mobile)
- Visual tabs with icons (Blue, Red, Head-to-Head, Builds)
- Content formatting with bullet points and icons
- Copy insight buttons for key recommendations
- Highlight actionable items (bans, picks)
- Expandable sections for detailed analysis

### 2.6 Toast Notification Improvements

**Priority:** High Priority, Medium Impact

**Files to modify:**

- `App.tsx` - Update Toaster configuration
- `lib/toastUtils.ts` - Enhance toast utilities

**Implementation:**

- Critical toasts: top-center (errors, success)
- Info toasts: bottom-right (existing)
- Toast types with icons (Success, Error, Warning, Info)
- Action buttons in toasts (e.g., "Undo")
- Larger size, rich content support

## Phase 3: Medium Priority Improvements - 1-2 months

### 3.1 Data Visualizations

**Priority:** Medium Priority, High Impact (#11)

**Dependencies:** Install recharts

**Files to create:**

- `components/DraftLab/PowerSpikeChart.tsx` - Line/area chart
- `components/DraftLab/TeamRadarChart.tsx` - Radar chart
- `components/Playbook/ComparisonChart.tsx` - Comparison view

**Implementation:**

- Power spike line chart (0-40 minutes)
- Team radar chart for strengths/weaknesses
- Side-by-side comparison view
- Interactive charts with hover details

### 3.2 Search & Filter Enhancements

**Priority:** Medium Priority, High Impact (#13)

**Files to modify:**

- `components/DraftLab/ChampionGrid.tsx` - Enhance search
- `components/Armory/Armory.tsx` - Enhance search
- `components/Playbook/Playbook.tsx` - Enhance search

**Implementation:**

- Search suggestions/autocomplete
- Active filters as removable chips
- Remember filter preferences (localStorage)
- Keyboard shortcuts for common filters
- Search history (last 10 searches)

### 3.3 Empty States Enhancement

**Priority:** Medium Priority, High Impact (#15)

**Files to modify:**

- `components/common/EmptyState.tsx` - Enhance with illustrations
- All components using EmptyState

**Implementation:**

- Illustrations or icons in all empty states
- Helpful tips or examples
- Prominent CTAs (larger, better contrast)
- "Learn More" links to documentation
- Custom empty states for each feature

### 3.4 Accessibility Enhancements

**Priority:** Medium Priority, High Impact

**Files to create:**

- `components/common/SkipLinks.tsx` - Skip navigation links

**Files to modify:**

- `styles/index.css` - Add reduce motion support
- All interactive components - Ensure focus indicators

**Implementation:**

- Skip links for main content
- Reduce motion media query support
- Keyboard shortcuts in tooltips
- Focus indicators on all interactive elements
- Screen reader testing

### 3.5 Mobile-Specific Enhancements

**Priority:** Low Priority, Nice to Have (#16)

**Files to modify:**

- `components/Layout/BottomNav.tsx` - Add haptic feedback, badges
- All mobile components

**Implementation:**

- Haptic feedback on tap (if supported)
- Badge indicators for notifications
- Long-press for quick actions
- Swipe gestures (left/right, pull-to-refresh, dismiss)
- Bottom sheet modals
- Virtual scrolling for long lists
- Lazy load images below fold

### 3.6 DraftLab Simple Mode

**Priority:** Medium Priority, High Impact

**Files to modify:**

- `components/DraftLab/DraftLab.tsx` - Add Simple Mode toggle
- `components/DraftLab/TeamPanel.tsx` - Simplify in Simple Mode
- `components/DraftLab/ChampionGrid.tsx` - Simplify in Simple Mode

**Implementation:**

- Simple Mode toggle in DraftLab header
- Hide advanced features (bans, power spikes)
- Show only essential UI
- More prominent tooltips
- Team Builder Assistant as FAB
- Visual drag indicators
- Quick Fill button for testing

## Technical Considerations

### Dependencies to Add

- `recharts` - For data visualizations
- Consider `react-swipeable` - For swipe gestures (or use framer-motion)

### Design Tokens

- Typography scale: h1: 2.5rem, h2: 2rem, h3: 1.5rem, h4: 1.25rem
- Spacing scale: xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px
- Icon sizes: 16px, 20px, 24px, 32px
- Border radius: Follow DESIGN_SYSTEM.md

### Testing Strategy

- Test on mobile devices (iOS and Android)
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test keyboard navigation
- Test with reduced motion preference
- Test undo/redo functionality thoroughly
- Performance testing (lighthouse, bundle size)

## Success Metrics

- Task completion rate (draft completion, feature usage)
- Time to complete tasks
- Error rate
- User satisfaction (SUS score)
- Feature discovery rate
- Mobile vs desktop usage
- Accessibility compliance score (WCAG)

### To-dos

- [ ] Create SidebarNav component for desktop with collapsible sections (Draft Tools, Learning, Resources, Profile)
- [ ] Create QuickActionsMenu dropdown in header with shortcuts (Start Draft, Daily Challenge, Recent)
- [ ] Create MoreMenu bottom sheet component for mobile with secondary features
- [ ] Create Breadcrumbs component showing page hierarchy on desktop
- [ ] Update BottomNav to add 'More' menu item as 5th slot
- [ ] Update Header to add Quick Actions button and sidebar toggle
- [ ] Add sidebar state management to App.tsx
- [ ] Create HeroSection component with primary CTA (Start Your First Draft)
- [ ] Create FeatureSection component for grouped feature cards (Core Tools, Learning, Resources)
- [ ] Restructure Home.tsx with hero section, grouped features, and Quick Start section
- [ ] Enhance SmartDashboard with recent activity, progress, and personalized recommendations
- [ ] Create MobileTabs component for DraftLab (Team | Champions | Advice)
- [ ] Create MobileTeamView component combining blue and red teams for mobile
- [ ] Create useSwipeGesture hook for swipe detection between tabs
- [ ] Update DraftLab.tsx with conditional rendering for mobile (tabs) vs desktop (columns)
- [ ] Ensure all touch targets are minimum 48px in TeamPanel and ChampionGrid
- [ ] Add pull-to-refresh functionality to ChampionGrid and AdvicePanel
- [ ] Convert full-screen modals to bottom sheet modals on mobile
- [ ] Enhance ConfirmationModal with variant icons and better visual distinction
- [ ] Add confirmation dialog for resetDraft in DraftLab.tsx
- [ ] Add confirmation dialog for reset in LiveArena.tsx
- [ ] Add confirmation dialog for reset in LiveDraft.tsx
- [ ] Create metaChampions.ts with top 20 meta champions list
- [ ] Create useChampionHistory hook to track recently used champions
- [ ] Create ChampionQuickPick component and add Quick Pick mode toggle
- [ ] Create FilterChips component showing visible filter options above grid
- [ ] Add favorites functionality to ChampionGrid (row at top, add/remove favorite)
- [ ] Add Recently Used section to ChampionGrid using useChampionHistory
- [ ] Implement smart suggestions based on current team composition
- [ ] Add drag indicators (grip icon) on champion cards for drag operations
- [ ] Make search bar sticky on scroll with backdrop blur
- [ ] Add favoriteChampions to useSettings hook and localStorage
- [ ] Create useUndoRedo hook with max 50 state history
- [ ] Create UndoRedoControls component with buttons and tooltips
- [ ] Integrate useUndoRedo with DraftContext for draft state tracking
- [ ] Add keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z) to DraftLab
- [ ] Create ContextualHelp component with Help button and modal
- [ ] Create helpContent.ts with page-specific help tips
- [ ] Create useContextualHelp hook to track shown tooltips in localStorage
- [ ] Create FeatureTooltip component for first-time tooltips
- [ ] Add Help button to Header.tsx that opens ContextualHelp
- [ ] Enhance Tooltip component with rich content and keyboard shortcut support
- [ ] Add contextual tooltips to DraftLab explaining interaction methods
- [ ] Create Card component with variants (default, elevated, outlined, interactive)
- [ ] Create Typography components (H1-H4, Body, Small, Tiny) with proper sizes
- [ ] Create Icon wrapper component standardizing sizes (16px, 20px, 24px, 32px)
- [ ] Create designTokens.ts with spacing and typography constants
- [ ] Add spacing scale and typography tokens to tailwind.config.js
- [ ] Add typography CSS variables to styles/index.css
- [ ] Add variants to Skeleton component (text, card, grid, list, circle)
- [ ] Add skeleton screen to AdvicePanel during AI analysis with progress indication
- [ ] Add skeleton screen to ChampionGrid during loading
- [ ] Add skeleton screen to TeamPanel during loading
- [ ] Add estimated time remaining and progress bar for AI analysis
- [ ] Make AdvicePanel always visible on desktop, accessible via tab on mobile
- [ ] Add visual tabs with icons (Blue, Red, Head-to-Head, Builds) to AdvicePanel
- [ ] Format advice content with bullet points, icons, and cards
- [ ] Create CopyInsightButton component and add to key recommendations
- [ ] Highlight actionable items (bans, picks) with colors and badges
- [ ] Add expandable sections for detailed analysis using Accordion
- [ ] Add empty state to AdvicePanel when no advice available
- [ ] Update Toaster configuration: critical toasts top-center, info bottom-right
- [ ] Add toast types with icons (Success, Error, Warning, Info)
- [ ] Add action buttons to toasts (e.g., Undo button)
- [ ] Enhance toast size, rich content support, and auto-dismiss progress
- [ ] Install recharts dependency for data visualizations
- [ ] Create PowerSpikeChart component with line/area chart (0-40 minutes)
- [ ] Create TeamRadarChart component for team strengths/weaknesses
- [ ] Create ComparisonChart component for side-by-side draft comparison
- [ ] Add search suggestions/autocomplete to ChampionGrid search
- [ ] Show active filters as removable chips in search interfaces
- [ ] Remember filter preferences in localStorage per user
- [ ] Add search history (last 10 searches) to search interfaces
- [ ] Add illustrations or icons to all EmptyState components
- [ ] Add helpful tips or examples to empty states
- [ ] Make CTAs more prominent in empty states (larger, better contrast)
- [ ] Add 'Learn More' links to relevant documentation in empty states
- [ ] Create SkipLinks component for main content navigation
- [ ] Add reduce motion media query support to styles/index.css
- [ ] Ensure all interactive components have visible focus indicators
- [ ] Show keyboard shortcuts in tooltips for discoverability
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Add haptic feedback on tap for BottomNav (if supported)
- [ ] Add badge indicators for notifications in BottomNav
- [ ] Add long-press for quick actions on mobile navigation
- [ ] Implement swipe gestures (left/right navigation, dismiss modals)
- [ ] Implement virtual scrolling for long lists (champion grid, playbook)
- [ ] Lazy load images below the fold for performance
- [ ] Add Simple Mode toggle to DraftLab header
- [ ] Hide advanced features (bans, power spikes) in Simple Mode
- [ ] Add more prominent tooltips in Simple Mode
- [ ] Make Team Builder Assistant a floating action button in Simple Mode
- [ ] Add visual drag indicators in Simple Mode
- [ ] Add Quick Fill button to auto-populate teams for testing
