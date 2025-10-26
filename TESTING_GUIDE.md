# 🧪 Testing Guide
## League AI Oracle - Complete Testing Documentation

---

## 📋 TEST SUITES

### 1. Unit Tests (Vitest)

**Location:** `tests/unit/`

**What's Tested:**
- Individual functions
- React components
- Custom hooks
- Utility functions

**Run Tests:**
```bash
npm run test:unit          # Run once
npm run test              # Watch mode
npm run test:ui           # Interactive UI
npm run test:coverage     # With coverage report
```

**Coverage Goals:**
- Functions: >80%
- Branches: >75%
- Lines: >80%

---

### 2. Integration Tests (Vitest)

**Location:** `tests/integration/`

**What's Tested:**
- Hook interactions
- Context providers
- Service integrations
- Component interactions

**Run Tests:**
```bash
npm run test:integration
```

---

### 3. E2E Tests (Playwright)

**Location:** `tests/e2e/`

**What's Tested:**
- Full user flows
- Page interactions
- Cross-browser compatibility
- Accessibility

**Run Tests:**
```bash
npm run test:e2e          # Headless
npm run test:e2e:headed   # With browser UI
npm run test:e2e:ui       # Interactive mode
npm run test:e2e:debug    # Debug mode
npm run test:report       # View results
```

---

### 4. Performance Tests

**Lighthouse CI:**
```bash
npm run build
npm run lighthouse
```

**Metrics Tracked:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)
- Time to Interactive (TTI)

**Thresholds:**
- Performance: >80
- Accessibility: >90
- Best Practices: >80
- SEO: >80

---

## 🎯 TESTING STRATEGY

### Unit Testing Strategy

**What to Test:**
- Pure functions
- React components (props, state, rendering)
- Custom hooks (state changes, side effects)
- Utility functions (edge cases, error handling)

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { Button } from '../components/common/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button>Click</Button>);
    expect(getByText('Click')).toBeInTheDocument();
  });
});
```

---

### Integration Testing Strategy

**What to Test:**
- Context providers with hooks
- Multiple components working together
- Service layer integration
- State management across contexts

**Example:**
```typescript
describe('Draft Context Integration', () => {
  it('updates draft state', () => {
    const { result } = renderHook(() => useDraft(), { wrapper });
    act(() => result.current.setDraftState(newState));
    expect(result.current.draftState).toEqual(newState);
  });
});
```

---

### E2E Testing Strategy

**What to Test:**
- Critical user journeys
- Page navigation
- Form submissions
- API interactions
- Error states

**Example:**
```typescript
test('user can analyze draft', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Strategy Forge');
  // ... select champions
  await page.click('text=Analyze');
  await expect(page.locator('.advice-panel')).toBeVisible();
});
```

---

## 📊 PERFORMANCE MONITORING

### Real-time Monitoring

**Setup:**
```typescript
import { performanceMonitor } from './lib/performanceMonitor';

// In your component
useEffect(() => {
  const stop = performanceMonitor.startMeasure('MyComponent');
  return stop;
}, []);
```

### API Performance
```typescript
const data = await performanceMonitor.measureAPI(
  'fetchChampions',
  () => fetch('/api/champions')
);
```

### Web Vitals

Automatically tracked:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)

---

## 🔧 TEST UTILITIES

### Mock Data

**Champions:**
```typescript
const mockChampion = {
  id: 'ahri',
  name: 'Ahri',
  roles: ['Mid'],
  damageType: 'AP'
};
```

**Draft State:**
```typescript
const mockDraft = {
  blue: {
    picks: Array(5).fill({ champion: null, isActive: false }),
    bans: Array(5).fill({ champion: null })
  },
  red: { /* same */ }
};
```

---

## 🚀 CI/CD INTEGRATION

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run build
```

---

## 📈 COVERAGE REPORTS

### Generate Coverage

```bash
npm run test:coverage
```

**Output:**
- `coverage/index.html` - HTML report
- `coverage/coverage-final.json` - JSON data
- Terminal summary

### Coverage Goals

| Type | Goal |
|------|------|
| Statements | >80% |
| Branches | >75% |
| Functions | >80% |
| Lines | >80% |

---

## 🐛 DEBUGGING TESTS

### Vitest Debugging

```bash
npm run test:ui  # Interactive UI
```

**In VS Code:**
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```

### Playwright Debugging

```bash
npm run test:e2e:debug
```

**Features:**
- Pause execution
- Step through tests
- Inspect elements
- View network requests

---

## 📝 WRITING TESTS

### Best Practices

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good
   expect(button).toHaveText('Submit');
   
   // Avoid
   expect(component.state.buttonText).toBe('Submit');
   ```

2. **Use Descriptive Names**
   ```typescript
   it('shows error message when API call fails', () => {
     // test
   });
   ```

3. **Arrange, Act, Assert**
   ```typescript
   it('increments counter', () => {
     // Arrange
     const { getByRole } = render(<Counter />);
     
     // Act
     fireEvent.click(getByRole('button'));
     
     // Assert
     expect(getByRole('heading')).toHaveText('1');
   });
   ```

4. **Clean Up After Tests**
   ```typescript
   afterEach(() => {
     cleanup();
     vi.clearAllMocks();
   });
   ```

---

## 🎯 TEST CHECKLIST

Before committing:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E tests pass
- [ ] No TypeScript errors
- [ ] Code coverage >80%
- [ ] Performance metrics acceptable
- [ ] No console errors

---

## 📚 RESOURCES

### Documentation
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Tools
- `npm run test:ui` - Interactive test runner
- `npm run test:coverage` - Coverage report
- `npm run test:e2e:ui` - Playwright UI mode

---

## 🏆 QUALITY METRICS

### Current Status

- ✅ Unit Tests: Configured
- ✅ Integration Tests: Configured
- ✅ E2E Tests: 42 tests passing
- ✅ Performance Monitoring: Implemented
- ✅ Lighthouse CI: Configured

### Goals

- Unit Test Coverage: >80%
- E2E Test Coverage: All critical paths
- Performance Score: >80
- Accessibility Score: >90

---

**Last Updated:** 2025-10-26  
**Test Framework:** Vitest + Playwright  
**Coverage Tool:** V8  
**Performance Tool:** Lighthouse CI

