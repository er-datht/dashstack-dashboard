# Theme System

Comprehensive overview of how theming works in this project (Light, Dark, Forest) and how to extend it.

## Goals

- Consistent design tokens across components (SCSS + CSS variables).
- Runtime theme switching without full page reload.
- Persist user preference while respecting system dark mode.
- Easy extension: add new theme with minimal duplication.

## Architecture Overview

| Layer              | Purpose                                                             | Location                                                                 |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| SCSS Tokens        | Static design values (palette, spacing, typography, radii, shadows) | `src/assets/styles/_variables.scss`                                      |
| Base CSS Variables | Exported tokens as `--color-*`, `--spacing-*`, etc.                 | Generated / consolidated in `src/index.css` (root scope)                 |
| Theme Overrides    | Replace a subset of CSS variables per theme                         | `[data-theme="dark"]`, `[data-theme="forest"]` blocks in `src/index.css` |
| React Context      | State + persistence + system detection                              | `src/contexts/ThemeContext.tsx`                                          |
| Hook               | Consumer access to theme API                                        | `src/hooks/useTheme.ts`                                                  |
| Persistence        | Remember last manual choice                                         | `localStorage` key `theme`                                               |

## React Integration

`ThemeProvider` mounts once near app root. It:

- Determines initial theme: `localStorage` value OR system preference (`prefers-color-scheme: dark`).
- Applies theme via `document.documentElement.setAttribute('data-theme', theme)`.
- Listens for OS dark mode changes (only if user hasn’t manually selected a theme).

API exposed by `useTheme()`:

```ts
const { theme, setTheme, cycleTheme } = useTheme();
```

- `setTheme('dark')` sets + persists.
- `cycleTheme()` rotates through `['light','dark','forest']`.

## CSS Variable Strategy

1. Base variables define neutral (light) defaults: backgrounds, surfaces, text, semantic colors.
2. Theme blocks override a focused subset (surface, text, borders, semantic UI and shadow tinting).
3. Component styles reference variables (e.g. `color: var(--color-text-primary)`). This decouples components from palette specifics.

Advantages:

- Zero re-render for pure CSS changes; React only updates `data-theme` attribute.
- Theming cost is low (single attribute toggle triggers cascade).

## SCSS Tokens (Design Layer)

Key maps in `_variables.scss`:

- `$colors`: primary palette (blue base), grays, semantic sets, surfaces.
- `$spacing`, `$font-sizes`, `$font-weights`, `$line-heights`.
- `$border-radius`, `$shadows`, `$z-index`, `$breakpoints`, `$transitions`.

Helper functions (e.g. `color($key)`) allow SCSS modules to pull raw values when needed. Prefer CSS variables for runtime theming.

## Adding a New Theme

Minimal steps:

1. Choose a primary palette (e.g. brand purple) & supporting surface/background values.
2. Add override block in `src/index.css`:

```css
[data-theme="purple"] {
  --color-primary-500: #7e57c2;
  --color-primary-600: #6a42b5;
  /* surfaces, text, borders, shadows ... */
}
```

3. Extend `Theme` union & `THEMES` array in `ThemeContext.tsx`:

```ts
export type Theme = "light" | "dark" | "forest" | "purple";
const THEMES: Theme[] = ["light", "dark", "forest", "purple"];
```

4. Update any theme-specific icon or utility adjustments if needed.

Avoid copying all base variables—override only what differs to reduce maintenance.

## Adding / Changing Tokens

1. Modify maps in `_variables.scss`.
2. Ensure build process (via SCSS + Tailwind) exposes needed values as `--*` variables or utility classes.
3. Keep naming consistent: `--color-<family>-<scale>` or `--spacing-<step>`.
4. Update docs if tokens are user-facing (e.g. design system consumers).

## Using Theme in Components

SCSS Module:

```scss
.card {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  transition: background var(--transition-slow) var(--transition-ease-in-out);
}
.card:hover {
  background: var(--color-surface-secondary);
}
```

JSX:

```tsx
import { useTheme } from "@/hooks/useTheme";
const { theme, cycleTheme } = useTheme();
return <button onClick={cycleTheme}>Theme: {theme}</button>;
```

Tailwind utilities can coexist; prefer variables for themable properties.

## Performance Considerations

- Single attribute mutation vs. class toggles -> minimal layout shift.
- Keep override blocks concise to reduce recalculation scope.
- Memoize expensive derived color computations in JS if ever introduced (currently none).

## Forest Theme Notes

Forest theme replaces primary palette with green spectrum and dark forest surfaces; semantic success/warning/error remain accessible but tinted where appropriate.

## Dark Theme Notes

Dark theme maintains blue primary palette while shifting surfaces to desaturated dark neutrals; shadows intensified but opacity adjusted.

## Extending Shadows / Elevation

If a new theme wants unique elevation tinting, override only shadow variables within its `[data-theme]` block.

## Fallback Behavior

If anything fails (e.g. localStorage blocked) theme defaults to system preference or `light`. Failure is non-breaking (warnings logged only).

## Testing Checklist

- Verify `data-theme` attribute updates.
- Inspect critical components (Sidebar, TopNav, Cards, Tables) under each theme.
- Ensure focus outlines remain visible in all themes.
- Contrast check text vs. surface (WCAG AA ideally).

## FAQ

Q: Why use CSS variables instead of SCSS only?  
A: CSS variables allow runtime switching without recompilation.

Q: Why not use class-based theming?  
A: Attribute approach keeps specificity lower and isolates theme lookups to `:root` cascade.

Q: Can themes be user-defined at runtime?  
A: Yes—generate a dynamic block & append a `<style>` tag or manage a user palette, then add it to `THEMES`.

---

Update this file whenever a new theme, token family, or architectural change is introduced.
