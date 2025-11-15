# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage (90%+) for the League AI Oracle application, including unit tests, integration tests, and E2E tests.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual components, hooks, services
├── integration/       # Integration tests for component interactions
└── e2e/              # End-to-end tests for critical user flows
```

## Coverage Targets

- **Lines**: 90%
- **Functions**: 90%
- **Branches**: 85%
- **Statements**: 90%

## Running Tests

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage Report

```bash
npm run test:coverage
```

### All Tests

```bash
npm run test:all
```

## Test Categories

### Unit Tests

#### Services

- `cacheService.test.ts` - Cache management, TTL, stale-while-revalidate
- `storageService.test.ts` - LocalStorage operations
- `analytics.test.ts` - Analytics tracking and user identification
- `logger.test.ts` - Error logging and Sentry integration

#### Components

- `ChampionGrid.test.tsx` - Champion selection, filtering, keyboard navigation
- `TeamPanel.test.tsx` - Team display, drag & drop, slot management
- `AdvicePanel.test.tsx` - AI advice display, tabs, loading states
- `OptimizedImage.test.tsx` - Image loading, lazy loading, WebP support
- `Loader.test.tsx` - Loading states, progress indicators
- `Button.test.tsx` - Button variants, states, interactions
- `CommandPalette.test.tsx` - Command search, execution, keyboard navigation

#### Hooks

- `useSettings.test.tsx` - Settings management and persistence
- `useUserProfile.test.tsx` - User profile, SP, missions
- `usePlaybook.test.tsx` - Draft history management
- `useCommands.test.tsx` - Command palette commands

#### Utilities

- `draftUtils.test.ts` - Draft state management, champion filtering
- `apiValidation.test.ts` - Zod schema validation
- `errorUtils.test.ts` - Error handling and formatting

### Integration Tests

- `draftLab.test.tsx` - Full draft lab workflow
- `championSelection.test.tsx` - Champion selection with recent tracking
- `geminiService.test.tsx` - API integration with validation

### E2E Tests

- `critical-flows.spec.ts` - Complete user journeys
- `strategy-forge.spec.ts` - Strategy Forge feature testing
- `recent-champions.spec.ts` - Recent champions feature
- `keyboard-navigation.spec.ts` - Keyboard accessibility
- `export-draft.spec.ts` - Draft export functionality
- `progress-indicators.spec.ts` - Loading and progress states
- `validation.spec.ts` - API response validation

## Key Testing Patterns

### Mocking

- Services are mocked to avoid external dependencies
- API calls are intercepted in E2E tests
- Context providers are wrapped in test utilities

### Test Data

- Mock champions and draft states are reused across tests
- Test fixtures are defined in test files

### Assertions

- Using `@testing-library/jest-dom` for DOM assertions
- Vitest for unit test assertions
- Playwright for E2E assertions

## Continuous Integration

Tests run automatically on:

- Pull requests
- Commits to main branch
- Pre-commit hooks (via Husky)

## Coverage Reports

Coverage reports are generated in:

- `coverage/` directory (HTML)
- `coverage/lcov.info` (LCOV format for CI)

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `beforeEach` and `afterEach` for setup/teardown
3. **Descriptive Names**: Test names should clearly describe what they test
4. **AAA Pattern**: Arrange, Act, Assert
5. **Mock External Dependencies**: Don't rely on real API calls in unit tests
