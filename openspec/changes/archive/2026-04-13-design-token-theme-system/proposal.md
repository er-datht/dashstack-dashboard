## Why

Document the design token system and multi-theme architecture of DashStack. The application uses a sophisticated 3-tier styling approach (Tailwind utilities, CSS custom properties, SCSS modules) with three themes (light, dark, forest) that must stay in sync across two parallel token formats. This spec captures the existing token architecture, theme switching mechanics, and styling conventions for maintainability and onboarding.

## What Changes

- Document the 3-tier styling hierarchy and when to use each approach
- Document the parallel design token formats (CSS custom properties and SCSS variables) that must stay in sync
- Document the three theme definitions and their color palettes
- Document ThemeContext, useTheme hook, and theme persistence/detection
- Document the cn() helper and classnames usage convention
- Document SCSS mixins library for complex component styling

## Capabilities

### New Capabilities
- `design-tokens`: CSS custom properties and SCSS variable system, including the parallel formats that must stay in sync, helper functions, and custom utility classes
- `theme-switching`: ThemeContext provider, useTheme hook, theme persistence to localStorage, system preference detection, and cycleTheme functionality
- `scss-mixins`: SCSS mixin library for responsive design, layout utilities, typography, effects, and advanced patterns like glass-morphism

### Modified Capabilities

## Impact

- **Files**: `src/index.css`, `src/assets/styles/_variables.scss`, `src/assets/styles/_mixins.scss`, `src/contexts/ThemeContext.tsx`, `src/hooks/useTheme.ts`, `src/utils/cn.ts`
- **Convention**: All components must support all 3 themes — no hardcoded colors
- **Convention**: Use `classnames` (not `clsx`) via the `cn()` helper
- **Known gap**: `appConfig.theme.defaultTheme` type definition includes only `"light" | "dark"` but forest theme exists
