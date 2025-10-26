# Storybook Setup Guide

## Overview

Storybook is a powerful tool for developing and documenting UI components in isolation. This guide helps you set up Storybook for the League AI Oracle project.

## Installation

### 1. Install Storybook

```bash
npx storybook@latest init
```

This will:
- Detect your project type (Vite + React)
- Install necessary dependencies
- Create initial configuration
- Add sample stories

### 2. Install Additional Addons

```bash
npm install --save-dev @storybook/addon-a11y @storybook/addon-coverage
```

## Configuration

### Update `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-coverage',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Add path alias
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '..'),
    };
    return config;
  },
};

export default config;
```

### Update `.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/react';
import '../index.css'; // Import your global styles

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0f0f1e',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
  },
};

export default preview;
```

## Writing Stories

### Example: Button Component

Create `components/common/Button.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    disabled: true,
  },
};
```

### Example: Skeleton Component

Create `components/common/Skeleton.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { 
  Skeleton, 
  ChampionCardSkeleton,
  ChampionGridSkeleton,
  DraftPanelSkeleton,
  AdvicePanelSkeleton 
} from './Skeleton';

const meta = {
  title: 'Common/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    variant: 'text',
    width: 200,
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 40,
    height: 40,
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: 300,
    height: 200,
  },
};

export const ChampionCard: Story = {
  render: () => <ChampionCardSkeleton />,
};

export const ChampionGrid: Story = {
  render: () => <ChampionGridSkeleton count={6} />,
};

export const DraftPanel: Story = {
  render: () => <DraftPanelSkeleton />,
};

export const AdvicePanel: Story = {
  render: () => <AdvicePanelSkeleton />,
};
```

### Example: Modal Component

Create `components/common/Modal.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { useState } from 'react';

const meta = {
  title: 'Common/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open Modal</button>
        <Modal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)}
          title="Example Modal"
        >
          <p>This is the modal content.</p>
        </Modal>
      </>
    );
  },
};

export const WithLongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Long Content Modal"
      >
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          ))}
        </div>
      </Modal>
    );
  },
};
```

## Running Storybook

```bash
# Add to package.json scripts
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

Start Storybook:
```bash
npm run storybook
```

Build static Storybook:
```bash
npm run build-storybook
```

## Recommended Story Structure

```
components/
├── common/
│   ├── Button.tsx
│   ├── Button.stories.tsx
│   ├── Modal.tsx
│   ├── Modal.stories.tsx
│   └── ...
├── DraftLab/
│   ├── ChampionCard.tsx
│   ├── ChampionCard.stories.tsx
│   └── ...
└── ...
```

## Best Practices

### 1. Document Props

Use JSDoc comments for automatic documentation:

```typescript
interface ButtonProps {
  /** The button content */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: () => void;
}
```

### 2. Cover All States

Create stories for each state:
- Default
- Hover (use `play` function)
- Focus
- Active
- Disabled
- Loading
- Error

### 3. Include Accessibility Tests

```typescript
export const AccessibilityTest: Story = {
  args: {
    children: 'Accessible Button',
  },
  play: async ({ canvasElement }) => {
    // Accessibility tests run automatically with @storybook/addon-a11y
  },
};
```

### 4. Add Interactions

```typescript
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export const WithInteractions: Story = {
  args: {
    children: 'Click Me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await userEvent.click(button);
    await expect(button).toHaveTextContent('Click Me');
  },
};
```

### 5. Use Controls

Make stories interactive:

```typescript
export const Playground: Story = {
  args: {
    children: 'Customizable Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};
```

## Accessibility Testing

The `@storybook/addon-a11y` addon automatically checks:
- Color contrast
- Keyboard navigation
- ARIA attributes
- Semantic HTML

View accessibility violations in the "Accessibility" panel.

## Coverage

The `@storybook/addon-coverage` addon tracks:
- Component coverage
- Line coverage
- Branch coverage

Run coverage:
```bash
npm run build-storybook
```

## Deployment

### Deploy to Chromatic (Recommended)

1. Sign up at [chromatic.com](https://www.chromatic.com/)
2. Install Chromatic:
   ```bash
   npm install --save-dev chromatic
   ```
3. Publish:
   ```bash
   npx chromatic --project-token=<your-token>
   ```

### Deploy to Static Host

Build and deploy:
```bash
npm run build-storybook
# Deploy storybook-static/ folder to Netlify, Vercel, etc.
```

## Component Categories

Organize stories by category:

- **Common**: Buttons, Modals, Inputs, Skeletons
- **Layout**: Header, Footer, Navigation, Sidebar
- **DraftLab**: ChampionCard, ChampionGrid, TeamPanel
- **Academy**: LessonCard, ProgressBar
- **Arena**: ArenaCard, TurnIndicator
- **StrategyHub**: StrategyCard, CompositionCard
- **Feedback**: FeedbackForm, RatingStars

## Tips

1. **Start with simple components**: Button, Input, Card
2. **Add complex components gradually**: Modal, CommandPalette, ChampionGrid
3. **Include real data**: Use mock data that resembles production
4. **Test responsive design**: Add viewport addon for mobile/tablet views
5. **Document usage**: Add MDX docs for complex components

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Storybook Best Practices](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Component Story Format (CSF)](https://storybook.js.org/docs/react/api/csf)
- [Storybook Addons](https://storybook.js.org/addons)

## Next Steps

1. Install Storybook following this guide
2. Create stories for common components (Button, Modal, Skeleton)
3. Add stories for complex components (ChampionGrid, DraftPanel)
4. Set up Chromatic for visual regression testing
5. Document all components with stories

