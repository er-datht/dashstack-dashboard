# DashStack Theme System

Complete documentation for the DashStack multi-theme design system, including design tokens, implementation patterns, and theming utilities.

## Table of Contents

- [Overview](#overview)
- [Supported Themes](#supported-themes)
- [Design Tokens](#design-tokens)
- [Theme Implementation Guide](#theme-implementation-guide)
- [SCSS Mixins and Utilities](#scss-mixins-and-utilities)
- [Component Theming Patterns](#component-theming-patterns)
- [Best Practices](#best-practices)

---

## Overview

DashStack uses a **dual-token system** combining SCSS variables with CSS custom properties to provide a flexible, maintainable theming architecture. The system supports three built-in themes (Light, Dark, Forest) with automatic system preference detection and localStorage persistence.

### Key Features

- **Three built-in themes**: Light, Dark, Forest
- **System preference detection**: Automatically detects user's OS theme preference
- **localStorage persistence**: Theme selection persists across sessions
- **Type-safe theme switching**: TypeScript-powered theme management
- **Dual-token architecture**: SCSS variables + CSS custom properties
- **Automatic dark mode adjustments**: Shadows, borders, and effects auto-adjust

---

## Supported Themes

### Light Theme (Default)
- Clean, bright interface with high contrast
- Primary color: `#4880FF` (Blue)
- Background: White (`#FFFFFF`)
- Surface: Light gray (`#F8F9FA`)

### Dark Theme
- Modern dark interface optimized for low-light environments
- Inverted color scheme with adjusted brightness
- Background: Deep gray (`#1A1D1F`)
- Surface: Charcoal (`#272B30`)
- Reduced shadow intensity for better contrast

### Forest Theme
- Nature-inspired green color palette
- Primary color: `#059669` (Emerald green)
- Warm, earthy tones
- Balanced contrast for extended use

---

## Design Tokens

### Dual Token System

DashStack maintains design tokens in **two parallel formats** that must stay synchronized:

#### 1. SCSS Variables (`src/assets/styles/_variables.scss`)

SCSS maps with helper functions for use in SCSS modules:

```scss
// Usage in SCSS modules
@use "../../assets/styles/variables" as *;

.element {
  color: color("primary", 600);
  padding: spacing(4);
  font-size: font-size("base");
}
```

#### 2. CSS Custom Properties (`src/index.css`)

Theme-adaptive CSS variables in `:root` and `[data-theme]` selectors:

```css
/* Usage in CSS or inline styles */
.element {
  color: var(--color-primary-600);
  padding: var(--spacing-4);
  font-size: var(--font-size-base);
}
```

### Color Tokens

#### Primary Colors
```scss
// SCSS
color("primary", 50)   // #EFF6FF
color("primary", 100)  // #DBEAFE
color("primary", 200)  // #BFDBFE
color("primary", 300)  // #93C5FD
color("primary", 400)  // #60A5FA
color("primary", 500)  // #3B82F6
color("primary", 600)  // #4880FF (Brand color)
color("primary", 700)  // #1D4ED8
color("primary", 800)  // #1E40AF
color("primary", 900)  // #1E3A8A
```

```css
/* CSS Variables */
var(--color-primary-50)
var(--color-primary-600) /* Brand color */
var(--color-primary-900)
```

#### Semantic Colors

**Success** (Green):
- Light: `#10B981` (500), `#059669` (600)
- Usage: Success states, confirmations, positive metrics

**Warning** (Amber):
- Light: `#F59E0B` (500), `#D97706` (600)
- Usage: Warnings, pending states, cautionary messages

**Error** (Red):
- Light: `#EF4444` (500), `#DC2626` (600)
- Usage: Errors, destructive actions, validation failures

**Info** (Blue):
- Light: `#3B82F6` (500), `#2563EB` (600)
- Usage: Informational messages, tips, neutral notifications

#### Gray Scale
```scss
color("gray", 50)   // #F9FAFB
color("gray", 100)  // #F3F4F6
color("gray", 200)  // #E5E7EB
color("gray", 300)  // #D1D5DB
color("gray", 400)  // #9CA3AF
color("gray", 500)  // #6B7280
color("gray", 600)  // #4B5563
color("gray", 700)  // #374151
color("gray", 800)  // #1F2937
color("gray", 900)  // #111827
```

#### Theme-Adaptive Tokens

These automatically change based on the active theme:

```css
/* Text Colors */
--color-text-primary      /* Main text color */
--color-text-secondary    /* Secondary/muted text */
--color-text-tertiary     /* Disabled/placeholder text */
--color-text-inverse      /* Text on dark backgrounds */

/* Background Colors */
--color-bg-primary        /* Main page background */
--color-bg-secondary      /* Alternative background */
--color-surface           /* Card/panel background */
--color-surface-hover     /* Hover state for surfaces */

/* Border Colors */
--color-border            /* Default borders */
--color-border-light      /* Subtle borders */
--color-border-dark       /* Emphasized borders */
```

### Spacing Tokens

8-point grid system with 4px base unit:

```scss
// SCSS
spacing(0)   // 0
spacing(1)   // 4px
spacing(2)   // 8px
spacing(3)   // 12px
spacing(4)   // 16px
spacing(5)   // 20px
spacing(6)   // 24px
spacing(8)   // 32px
spacing(10)  // 40px
spacing(12)  // 48px
spacing(16)  // 64px
spacing(20)  // 80px
spacing(24)  // 96px
spacing(32)  // 128px
```

```css
/* CSS Variables */
var(--spacing-1)  /* 4px */
var(--spacing-4)  /* 16px */
var(--spacing-8)  /* 32px */
```

### Typography Tokens

#### Font Sizes
```scss
font-size("xs")    // 12px / 0.75rem
font-size("sm")    // 14px / 0.875rem
font-size("base")  // 16px / 1rem
font-size("lg")    // 18px / 1.125rem
font-size("xl")    // 20px / 1.25rem
font-size("2xl")   // 24px / 1.5rem
font-size("3xl")   // 30px / 1.875rem
font-size("4xl")   // 36px / 2.25rem
font-size("5xl")   // 48px / 3rem
```

#### Font Weights
```scss
font-weight("normal")    // 400
font-weight("medium")    // 500
font-weight("semibold")  // 600
font-weight("bold")      // 700
```

#### Line Heights
```scss
line-height("tight")    // 1.25
line-height("normal")   // 1.5
line-height("relaxed")  // 1.75
```

### Border Radius
```scss
border-radius("none")  // 0
border-radius("sm")    // 0.125rem (2px)
border-radius("base")  // 0.25rem (4px)
border-radius("md")    // 0.375rem (6px)
border-radius("lg")    // 0.5rem (8px)
border-radius("xl")    // 0.75rem (12px)
border-radius("2xl")   // 1rem (16px)
border-radius("3xl")   // 1.5rem (24px)
border-radius("full")  // 9999px (circular)
```

### Shadows

Auto-adjust intensity in dark themes:

```scss
shadow("sm")    // Small shadow (subtle elevation)
shadow("base")  // Default shadow (cards)
shadow("md")    // Medium shadow (dropdowns)
shadow("lg")    // Large shadow (modals)
shadow("xl")    // Extra large shadow (prominent elements)
shadow("2xl")   // Maximum shadow (overlays)
```

### Transitions

```scss
transition("fast")  // 150ms
transition("base")  // 200ms
transition("slow")  // 300ms
```

### Z-Index Layers

```scss
z-index("dropdown")     // 1000
z-index("sticky")       // 1010
z-index("fixed")        // 1020
z-index("modal-backdrop") // 1030
z-index("modal")        // 1040
z-index("popover")      // 1050
z-index("tooltip")      // 1060
z-index("notification") // 1070
```

---

## Theme Implementation Guide

### Theme Context

Theme state is managed via `ThemeContext` and applied through the `data-theme` attribute on the `<html>` element.

**Location**: `src/contexts/ThemeContext.tsx`

```tsx
import { createContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'forest';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Check localStorage
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) return stored;

    // 2. Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // 3. Default to light
    return 'light';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    // Persist to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'forest'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### useTheme Hook

**Location**: `src/hooks/useTheme.ts`

```tsx
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Using Themes in Components

#### Method 1: Tailwind Utility Classes (Recommended)

Use pre-defined theme-aware utility classes from `src/index.css`:

```tsx
function Card() {
  return (
    <div className="bg-surface text-primary border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold">Card Title</h3>
      <p className="text-secondary">Card content goes here</p>
    </div>
  );
}
```

**Available theme-aware classes**:
- `.bg-surface` - Card/panel background
- `.text-primary` - Main text color
- `.text-secondary` - Muted text color
- `.card` - Complete card styling
- `.bg-primary` - Primary brand color background
- `.text-on-primary` - Text on primary background
- `.bg-sidebar`, `.text-sidebar-*` - Sidebar-specific colors
- `.bg-topnav`, `.border-topnav` - TopNav-specific colors

#### Method 2: CSS Custom Properties

For dynamic or inline styles:

```tsx
function CustomElement() {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      padding: 'var(--spacing-4)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-md)',
    }}>
      Dynamic styles using CSS variables
    </div>
  );
}
```

#### Method 3: SCSS Modules with Theme Mixins

For complex components with SCSS modules:

```tsx
// Component.tsx
import styles from './Component.module.scss';

function Component() {
  return <div className={styles.container}>Content</div>;
}
```

```scss
// Component.module.scss
@use "../../assets/styles/variables" as *;
@use "../../assets/styles/mixins" as *;

.container {
  @include surface; // Applies theme-aware surface styling
  @include theme-aware(border-color, color("gray", 200), color("gray", 700));
  padding: spacing(4);
  border-radius: border-radius("lg");
}
```

### Creating a New Theme

To add a new theme (e.g., "ocean"):

1. **Update Theme Type** (`src/contexts/ThemeContext.tsx`):
```tsx
export type Theme = 'light' | 'dark' | 'forest' | 'ocean';
```

2. **Define Theme Tokens** (`src/index.css`):
```css
[data-theme="ocean"] {
  /* Colors */
  --color-primary-600: #0EA5E9; /* Sky blue */
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-bg-primary: #F0F9FF;
  --color-surface: #FFFFFF;
  --color-border: #BAE6FD;

  /* Add other tokens as needed */
}
```

3. **Update Theme Switcher** (if using cycle function):
```tsx
const cycleTheme = () => {
  const themes: Theme[] = ['light', 'dark', 'forest', 'ocean'];
  const currentIndex = themes.indexOf(theme);
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
};
```

4. **Add Translations** (`public/locales/en/theme.json`, `public/locales/jp/theme.json`):
```json
{
  "ocean": "Ocean"
}
```

### Theme Switching Component

**ThemeSwitcher** component example (typically in Sidebar):

```tsx
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon, TreePine } from 'lucide-react';
import type { Theme } from '../../contexts/ThemeContext';

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <Sun className="w-5 h-5" />,
  dark: <Moon className="w-5 h-5" />,
  forest: <TreePine className="w-5 h-5" />,
};

export default function ThemeSwitcher() {
  const { theme, cycleTheme } = useTheme();

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surface transition-colors"
      aria-label="Switch theme"
    >
      {themeIcons[theme]}
      <span className="capitalize">{theme}</span>
    </button>
  );
}
```

---

## SCSS Mixins and Utilities

All mixins are defined in `src/assets/styles/_mixins.scss`.

### Layout Mixins

#### Flexbox Utilities

```scss
// Center content (both axes)
@include flex-center;
// Output: display: flex; align-items: center; justify-content: center;

// Space between items
@include flex-between;
// Output: display: flex; align-items: center; justify-content: space-between;

// Custom flex
@include flex($direction, $align, $justify);
// Example: @include flex(column, flex-start, space-between);
```

#### Grid Layout

```scss
@include grid($columns: 1, $gap: spacing(4));
// Example: @include grid(3, spacing(6));
```

### Text Utilities

```scss
// Truncate text with ellipsis
@include truncate;

// Multi-line clamp
@include line-clamp($lines);
// Example: @include line-clamp(3);
```

### Theme-Aware Mixins

#### Surface Styling

```scss
@include surface;
// Applies theme-appropriate surface background and shadow
```

#### Theme-Specific Properties

```scss
@include theme-aware($property, $light-value, $dark-value);
// Example:
@include theme-aware(background-color, color("gray", 50), color("gray", 800));
```

### Responsive Mixins

```scss
// Mobile-first breakpoints
@include breakpoint(sm) { /* 640px+ */ }
@include breakpoint(md) { /* 768px+ */ }
@include breakpoint(lg) { /* 1024px+ */ }
@include breakpoint(xl) { /* 1280px+ */ }
@include breakpoint(2xl) { /* 1536px+ */ }

// Desktop-first breakpoints
@include breakpoint-down(lg) { /* <1024px */ }
```

**Breakpoint values**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Effect Mixins

#### Transitions

```scss
@include transition($properties: all, $duration: transition("base"), $easing: ease-in-out);
// Example: @include transition(opacity transform, transition("fast"));
```

#### Hover Effects

```scss
@include hover {
  opacity: 0.8;
  transform: translateY(-2px);
}
// Only applies on devices with hover capability
```

#### Focus Ring

```scss
@include focus-ring($color: color("primary", 500), $offset: 2px);
// Applies accessible focus outline
```

### Utility Mixins

#### Custom Scrollbar

```scss
@include custom-scrollbar(
  $track-color: color("gray", 100),
  $thumb-color: color("gray", 400),
  $thumb-hover: color("gray", 500)
);
```

#### Visually Hidden

```scss
@include visually-hidden;
// Hide element visually but keep accessible to screen readers
```

### Complete Mixin Example

```scss
@use "../../assets/styles/variables" as *;
@use "../../assets/styles/mixins" as *;

.card {
  @include surface;
  @include transition(box-shadow transform);
  padding: spacing(6);
  border-radius: border-radius("xl");

  @include hover {
    transform: translateY(-4px);
    box-shadow: shadow("lg");
  }

  @include breakpoint(md) {
    padding: spacing(8);
  }
}

.title {
  @include truncate;
  font-size: font-size("xl");
  font-weight: font-weight("bold");
  color: color("gray", 900);

  @include theme-aware(color, color("gray", 900), color("gray", 100));
}

.description {
  @include line-clamp(3);
  font-size: font-size("sm");
  color: color("gray", 600);
  margin-top: spacing(2);
}
```

---

## Component Theming Patterns

### 3-Tier Styling Strategy

Use this decision tree for component styling:

**Tier 1: Tailwind Utilities** (90% of cases)
- Use for simple layouts, spacing, colors, typography
- Theme-aware classes: `.bg-surface`, `.text-primary`, `.card`

**Tier 2: CSS Variables** (Dynamic values)
- Use for programmatic/inline styles
- Pattern: `style={{ color: 'var(--color-primary-600)' }}`

**Tier 3: SCSS Modules** (Complex components)
- Use for animations, pseudo-elements, complex state
- Pattern: `Component.module.scss` with mixins

### Pattern 1: Simple Card Component

```tsx
// SimpleCard.tsx (Tier 1: Tailwind only)
type SimpleCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function SimpleCard({ title, children }: SimpleCardProps) {
  return (
    <div className="bg-surface rounded-lg p-6 shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      <div className="text-secondary">{children}</div>
    </div>
  );
}
```

### Pattern 2: Interactive Button

```tsx
// Button.tsx (Tier 1 + Tier 2 hybrid)
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
};

const variantStyles = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-surface border border-gray-300 text-primary hover:bg-gray-50',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg font-medium transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {children}
    </button>
  );
}
```

### Pattern 3: Complex Chart Component

```tsx
// RevenueChart.tsx (Tier 3: SCSS Module)
import { useDeals } from '../../hooks/useDeals';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './RevenueChart.module.scss';

export default function RevenueChart() {
  const { deals, isLoading } = useDeals();

  if (isLoading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={deals}>
          <CartesianGrid strokeDasharray="3 3" className={styles.grid} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)' }} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-primary-600)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

```scss
// RevenueChart.module.scss
@use "../../assets/styles/variables" as *;
@use "../../assets/styles/mixins" as *;

.container {
  @include surface;
  padding: spacing(6);
  border-radius: border-radius("xl");

  @include breakpoint(md) {
    padding: spacing(8);
  }
}

.title {
  font-size: font-size("xl");
  font-weight: font-weight("bold");
  margin-bottom: spacing(6);

  @include theme-aware(color, color("gray", 900), color("gray", 100));
}

.grid {
  @include theme-aware(stroke, color("gray", 200), color("gray", 700));
}

.loading {
  @include flex-center;
  min-height: 300px;
  color: color("gray", 500);
  font-size: font-size("sm");
}
```

### Pattern 4: Theme-Aware Icon

```tsx
// StatusBadge.tsx
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type Status = 'success' | 'error' | 'warning';

type StatusBadgeProps = {
  status: Status;
  label: string;
};

const statusConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 border-green-200',
    iconColor: 'var(--color-success-500)',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-200',
    iconColor: 'var(--color-error-500)',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    iconColor: 'var(--color-warning-500)',
  },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const { icon: Icon, className, iconColor } = statusConfig[status];

  return (
    <span className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium', className)}>
      <Icon className="w-4 h-4" style={{ color: iconColor }} />
      {label}
    </span>
  );
}
```

### Pattern 5: Responsive Sidebar

```tsx
// Sidebar.tsx with theme-aware collapse
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ChevronLeft, Sun, Moon, TreePine } from 'lucide-react';
import styles from './Sidebar.module.scss';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, cycleTheme } = useTheme();

  return (
    <aside className={cn(styles.sidebar, { [styles.collapsed]: isCollapsed })}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={styles.collapseBtn}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft className={cn(styles.chevron, { [styles.rotated]: isCollapsed })} />
      </button>

      <nav className={styles.nav}>
        {/* Navigation items */}
      </nav>

      <div className={styles.themeSection}>
        <button onClick={cycleTheme} className={styles.themeBtn}>
          {theme === 'light' && <Sun className="w-5 h-5" />}
          {theme === 'dark' && <Moon className="w-5 h-5" />}
          {theme === 'forest' && <TreePine className="w-5 h-5" />}
          {!isCollapsed && <span className="capitalize">{theme}</span>}
        </button>
      </div>
    </aside>
  );
}
```

```scss
// Sidebar.module.scss
@use "../../assets/styles/variables" as *;
@use "../../assets/styles/mixins" as *;

.sidebar {
  @include flex(column, stretch, space-between);
  @include transition(width);
  @include custom-scrollbar;

  width: 280px;
  height: 100vh;
  padding: spacing(6) spacing(4);
  border-right: 1px solid;

  @include theme-aware(background-color, color("gray", 50), color("gray", 900));
  @include theme-aware(border-color, color("gray", 200), color("gray", 800));

  &.collapsed {
    width: 80px;
  }

  @include breakpoint-down(lg) {
    position: fixed;
    left: 0;
    top: 0;
    z-index: z-index("fixed");
  }
}

.collapseBtn {
  @include flex-center;
  @include transition(background-color);

  width: 32px;
  height: 32px;
  margin-left: auto;
  border-radius: border-radius("full");

  @include hover {
    background-color: color("gray", 200);
  }
}

.chevron {
  @include transition(transform);

  &.rotated {
    transform: rotate(180deg);
  }
}

.themeBtn {
  @include flex-center;
  @include transition(background-color);

  gap: spacing(3);
  width: 100%;
  padding: spacing(3);
  border-radius: border-radius("lg");

  @include hover {
    background-color: color("gray", 200);
  }

  @include theme-aware(color, color("gray", 700), color("gray", 300));
}
```

---

## Best Practices

### 1. Token Usage

**DO**:
- ✅ Use design tokens for all values
- ✅ Prefer theme-aware Tailwind classes
- ✅ Use CSS variables for dynamic values
- ✅ Keep token system in sync (SCSS + CSS)

**DON'T**:
- ❌ Hardcode colors, spacing, or shadows
- ❌ Use arbitrary values without design tokens
- ❌ Mix pixel values with token-based spacing

```tsx
// ❌ Bad: Hardcoded values
<div style={{ color: '#4880FF', padding: '16px' }}>

// ✅ Good: Design tokens
<div className="text-primary p-4">
```

### 2. Theme Testing

**Always test components in all three themes**:

### 3. Accessibility

**Ensure sufficient contrast in all themes**:

- Text on background: Minimum 4.5:1 ratio (WCAG AA)
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear focus states
- Test with browser DevTools accessibility panel

### 4. Performance

**Optimize theme switching**:

- CSS variables enable instant theme changes without re-rendering
- Avoid inline styles when possible (use classes)
- Theme state stored in localStorage (no flash on reload)
- System preference detected once on mount

### 5. Responsive Design

**Mobile-first approach with themes**:

```scss
.element {
  // Mobile styles (default)
  padding: spacing(4);

  @include breakpoint(md) {
    // Tablet and up
    padding: spacing(6);
  }

  @include breakpoint(lg) {
    // Desktop and up
    padding: spacing(8);
  }
}
```

### 6. Component Composition

**Build theme-aware primitives**:

```tsx
// Primitive components
function Card({ children, className }: Props) {
  return <div className={cn('bg-surface rounded-lg p-6', className)}>{children}</div>;
}

// Composed components
function ProductCard({ product }: Props) {
  return (
    <Card>
      <h3 className="text-primary font-semibold">{product.name}</h3>
      <p className="text-secondary">{product.description}</p>
    </Card>
  );
}
```

### 7. Documentation

**Document theme-specific behavior**:

```tsx
/**
 * StatusBadge component
 *
 * Displays a status indicator with icon and label.
 *
 * Theme Support:
 * - Light: Pastel backgrounds with darker text
 * - Dark: Darker backgrounds with lighter text
 * - Forest: Earth-toned status colors
 *
 * @param status - Status type (success, error, warning)
 * @param label - Display text
 */
```

### 8. Migration Checklist

When adding theme support to an existing component:

- [ ] Replace hardcoded colors with theme tokens
- [ ] Test component in all three themes
- [ ] Verify contrast ratios meet WCAG standards
- [ ] Update hover/focus states for dark themes
- [ ] Check responsive behavior across themes
- [ ] Add theme-aware shadows if applicable
- [ ] Document any theme-specific quirks

---

## Troubleshooting

### Theme Not Applying

1. Check `data-theme` attribute on `<html>`:
```javascript
console.log(document.documentElement.getAttribute('data-theme'));
```

2. Verify ThemeProvider wraps your app:
```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

3. Clear localStorage and test system preference:
```javascript
localStorage.removeItem('theme');
```

### CSS Variables Not Working

1. Ensure variables are defined in `:root` or `[data-theme]`
2. Check variable name (case-sensitive)
3. Use fallback values: `var(--color-primary, #4880FF)`

### SCSS Compilation Errors

1. Verify import path: `@use "../../assets/styles/variables" as *;`
2. Check function name: `color()`, `spacing()`, etc.
3. Ensure Sass is installed: `yarn add sass`

### Dark Theme Contrast Issues

1. Adjust shadow intensity in dark theme
2. Lighten text colors for better readability
3. Reduce border opacity
4. Test with browser DevTools dark mode simulation

---

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [React Context API](https://react.dev/reference/react/useContext)

---
