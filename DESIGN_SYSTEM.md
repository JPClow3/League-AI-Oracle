# Design System Documentation
## League AI Oracle - Visual Design Standards

---

## 🎨 Border Radius Scale

Use these standardized border radius values throughout the application:

### Border Radius Tokens

| Token | Value | Usage | Example Components |
|-------|-------|-------|-------------------|
| `rounded-sm` | 2px (0.125rem) | Small elements, badges, tags | Tags, small indicators |
| `rounded` | 4px (0.25rem) | Default for most UI | Input fields, small buttons |
| `rounded-md` | 6px (0.375rem) | Medium containers | Cards, panels, modals |
| `rounded-lg` | 8px (0.5rem) | Large containers | Main sections, feature cards |
| `rounded-xl` | 12px (0.75rem) | Hero sections | Dashboard cards, prominent features |
| `rounded-2xl` | 16px (1rem) | Very large containers | Page sections, hero banners |
| `rounded-full` | 9999px | Circular elements | Avatars, badges, pill buttons |

---

## 📏 Shadow Hierarchy

Use these standardized shadow values:

### Shadow Scale

| Class | Usage | Components |
|-------|-------|------------|
| `shadow-sm` | Subtle elevation | Input fields, subtle cards |
| `shadow` | Default cards | Standard cards, panels |
| `shadow-md` | Moderate elevation | Dropdowns, popovers |
| `shadow-lg` | High elevation | Modals, dialogs |
| `shadow-xl` | Maximum elevation | Full-screen overlays |
| `shadow-2xl` | Dramatic depth | Hero sections |

### Special Shadows

| Class | Usage |
|-------|-------|
| `shadow-glow-accent` | Accent glow effect |
| `shadow-glow-info` | Info glow effect |

---

## 🎯 Spacing Scale

Consistent spacing using Tailwind's scale:

| Value | Pixels | Usage |
|-------|--------|-------|
| `1` | 4px | Minimal gaps |
| `2` | 8px | Tight spacing |
| `3` | 12px | Comfortable spacing |
| `4` | 16px | Standard spacing |
| `6` | 24px | Section spacing |
| `8` | 32px | Large spacing |
| `12` | 48px | Extra large spacing |
| `16` | 64px | Maximum spacing |

---

## 🔤 Typography Scale

### Font Families

- **Body**: `font-sans` (Inter)
- **Display**: `font-display` (Teko)
- **Code**: `font-mono` (system monospace)

### Font Sizes

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 0.75rem (12px) | Fine print, captions |
| `text-sm` | 0.875rem (14px) | Secondary text |
| `text-base` | 1rem (16px) | Body text |
| `text-lg` | 1.125rem (18px) | Emphasized text |
| `text-xl` | 1.25rem (20px) | Small headings |
| `text-2xl` | 1.5rem (24px) | Section headings |
| `text-3xl` | 1.875rem (30px) | Page titles |
| `text-4xl` | 2.25rem (36px) | Hero titles |
| `text-5xl` | 3rem (48px) | Large hero titles |

---

## 🎨 Component-Specific Guidelines

### Buttons
- **Border Radius**: `rounded` (4px)
- **Padding**: `px-4 py-2` for default
- **Shadow**: `shadow-md` on hover

### Cards
- **Border Radius**: `rounded-md` (6px)
- **Border**: `border border-[hsl(var(--border))]`
- **Shadow**: `shadow-sm` default, `shadow-lg` on hover

### Modals
- **Border Radius**: Content doesn't need radius (full edge)
- **Border**: `border border-[hsl(var(--border))]`
- **Shadow**: `shadow-lg`

### Inputs
- **Border Radius**: `rounded-md` (6px)
- **Border**: `border border-[hsl(var(--border))]`
- **Focus Ring**: `ring-2 ring-[hsl(var(--accent))]`

### Champion Slots (PickSlot/BanSlot)
- **Border Radius**: None (square for champion images)
- **Ring**: For active states

### Tooltips
- **Border Radius**: `rounded` (4px)
- **Shadow**: Custom shadow

### Navigation Items
- **Border Radius**: `rounded-md` for hover states
- **Active Indicator**: `rounded-full` or `rounded-b-full`

---

## 🔧 Implementation Guidelines

### When to Use Each Radius

1. **No Radius (`rounded-none`)**: Champion images, technical UI elements
2. **Small (`rounded-sm`)**: Tags, badges, small indicators
3. **Default (`rounded`)**: Buttons, inputs, controls
4. **Medium (`rounded-md`)**: Cards, panels, containers
5. **Large (`rounded-lg`)**: Feature cards, main sections
6. **Extra Large (`rounded-xl`, `rounded-2xl`)**: Hero sections, page-level containers
7. **Full (`rounded-full`)**: Avatars, circular buttons, pills

### Consistency Rules

- **Interactive elements** (buttons, links): `rounded` or `rounded-md`
- **Containers** (cards, panels): `rounded-md` or `rounded-lg`
- **Images**: Usually `rounded` unless specifically square
- **Inputs/Forms**: `rounded-md`
- **Indicators/Badges**: `rounded-full` or `rounded-sm`

---

## 📱 Responsive Considerations

Some elements may need larger radius on desktop:
```tsx
className="rounded-md lg:rounded-lg"
```

---

## ✅ Migration Checklist

When updating components to match design system:

- [ ] Check current border-radius usage
- [ ] Replace with standardized values
- [ ] Verify visual consistency
- [ ] Test in both themes (light/dark)
- [ ] Check responsive behavior
- [ ] Update component documentation

---

**Last Updated:** 2025-10-25  
**Version:** 1.0

