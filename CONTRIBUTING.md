# Contributing to League AI Oracle

First off, thank you for considering contributing to League AI Oracle! It's people like you that make this tool amazing for the League of Legends community.

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this standard.

## 🚀 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected
- **Include screenshots** if relevant
- **Note your environment** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives** you've considered

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Follow the coding standards** (see below)
3. **Add tests** if you're adding functionality
4. **Update documentation** as needed
5. **Ensure the test suite passes**
6. **Make sure your code lints**
7. **Issue the pull request**

## 💻 Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` with your API keys
4. Start dev server: `npm run dev`
5. Make your changes
6. Test thoroughly: `npm run test:e2e`
7. Build to verify: `npm run build`

## 📝 Coding Standards

### TypeScript

- ✅ **Strict mode enabled** - No implicit any
- ✅ **99% type coverage** - Avoid `any`, use specific types or `unknown`
- ✅ **Interfaces over types** for object shapes
- ✅ **Descriptive names** - No abbreviations unless common

### React Components

- ✅ **Functional components** with hooks
- ✅ **Small, focused components** - Single Responsibility Principle
- ✅ **Props interfaces** for all components
- ✅ **Proper memo usage** for expensive components
- ✅ **Accessibility** - ARIA labels where needed

### File Naming

- **Components:** PascalCase (e.g., `DraftLab.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useGemini.ts`)
- **Utilities:** camelCase (e.g., `draftUtils.ts`)
- **Types:** PascalCase for interfaces (e.g., `DraftState`)

### Code Style

```typescript
// ✅ Good
interface DraftTurn {
  team: TeamSide;
  type: 'ban' | 'pick';
  index: number;
}

const analyzeDraft = async (state: DraftState): Promise<AIAdvice> => {
  // Implementation
};

// ❌ Bad
const analyzeDraft = async (state: any) => {
  // Implementation
};
```

### Component Structure

```typescript
// ✅ Preferred structure
interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState();
  
  // Refs
  const ref = useRef();
  
  // Contexts
  const context = useContext(SomeContext);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

## 🧪 Testing

- Write E2E tests for new features using Playwright
- Test across different screen sizes
- Test keyboard navigation
- Test with screen readers when adding accessibility features

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Update type definitions in types.ts
- Include code examples in PRs

## 🎨 Design Guidelines

- Follow the Hextech aesthetic (angular, clean, professional)
- Maintain consistent spacing and typography
- Use CSS variables for colors and themes
- Ensure responsive design (mobile-first)
- Smooth animations (Framer Motion)

## 🔍 Commit Messages

Follow conventional commits:

```
feat: add voice command support
fix: resolve draft state bug in Arena mode
docs: update installation instructions
style: format DraftLab component
refactor: improve cache management
test: add E2E tests for Playbook
chore: update dependencies
```

## 🏷️ Versioning

We use [SemVer](http://semver.org/) for versioning:
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

## 📋 Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows the style guidelines
- [ ] TypeScript types are properly defined (no `any`)
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.logs or debugger statements
- [ ] Tests pass (`npm run test:e2e`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tested on multiple browsers
- [ ] Responsive design verified

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

- 🎨 **UI/UX improvements** - Enhance the visual design
- 🌐 **Internationalization** - Add language support
- 🧪 **Testing** - Increase test coverage
- 📱 **Mobile optimization** - Improve mobile experience
- ♿ **Accessibility** - Enhance keyboard and screen reader support
- 📊 **Analytics** - Better insights and metrics
- 🤖 **AI Prompts** - Improve prompt engineering
- 📚 **Documentation** - Tutorials, guides, examples

## 💬 Questions?

Don't hesitate to ask questions in:
- GitHub Issues (tag with `question`)
- GitHub Discussions
- Pull request comments

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (coming soon)

Thank you for making League AI Oracle better! 🎮✨

