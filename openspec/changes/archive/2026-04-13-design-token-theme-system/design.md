## Context

DashStack uses a multi-layered styling architecture with three themes and parallel token formats. The system evolved from a need to support light, dark, and a custom forest theme while maintaining a consistent design language across 18 pages and 18+ reusable components. Design tokens exist in both CSS custom properties (for runtime theming) and SCSS variables (for compile-time utilities).

## Goals / Non-Goals

**Goals:**
- Document how the 3-tier styling system works together
- Capture the rationale for parallel CSS/SCSS token formats
- Explain the theme detection and persistence chain
- Record conventions for consistent theme support across components

**Non-Goals:**
- Adding new themes
- Migrating away from the parallel token approach
- Replacing classnames with clsx or another library
- Fixing the `appConfig.theme.defaultTheme` type to include "forest"

## Decisions

### Decision 1: Parallel CSS + SCSS Token Formats
**Choice**: Maintain design tokens in both CSS custom properties (`src/index.css`) and SCSS variables (`src/assets/styles/_variables.scss`).
**Rationale**: CSS custom properties enable runtime theme switching (values change when `data-theme` changes), while SCSS variables provide compile-time utilities (helper functions, maps, calculations). Both are needed for the hybrid Tailwind + SCSS approach.
**Alternatives considered**: CSS-only tokens (loses SCSS compile-time power), SCSS-only tokens (can't do runtime theme switching), CSS-in-JS (heavier runtime, different paradigm).

### Decision 2: data-theme Attribute for Theme Switching
**Choice**: Set `data-theme` attribute on `<html>` to drive theme-specific CSS custom property values.
**Rationale**: CSS attribute selectors (`[data-theme="dark"]`) allow theme switching with zero JavaScript runtime cost after the initial attribute set. All CSS custom property values cascade automatically.
**Alternatives considered**: CSS class toggling (works but less semantic), CSS-in-JS theme providers (runtime overhead), media queries only (doesn't support custom themes).

### Decision 3: classnames Library via cn() Helper
**Choice**: Use the `classnames` library exclusively, wrapped in a `cn()` helper at `src/utils/cn.ts`.
**Rationale**: Standardizes class composition across the codebase. The `cn()` wrapper provides a single import path and could be extended if needed.
**Alternatives considered**: `clsx` (smaller but team already uses classnames), template literals (error-prone with conditional classes).

### Decision 4: Three Themes with Cycle Navigation
**Choice**: Three themes (light/dark/forest) with `cycleTheme()` for sequential navigation.
**Rationale**: Light and dark are standard; forest is a branded custom theme. Cycle navigation keeps the UI simple (single button) rather than requiring a dropdown for three options.

### Decision 5: SCSS Modules for Complex Components Only
**Choice**: Reserve SCSS modules for components requiring animations, pseudo-elements, or complex selectors.
**Rationale**: Tailwind handles 90% of styling needs. SCSS modules add build complexity and potential specificity conflicts, so they're reserved for cases where Tailwind is insufficient.

## Risks / Trade-offs

- **[Token sync burden]** → CSS and SCSS tokens must be manually kept in sync. Mitigation: documented as a critical convention; future tooling could auto-generate one from the other.
- **[Forest theme type gap]** → `appConfig.theme.defaultTheme` type is `"light" | "dark"` but forest exists. Mitigation: documented as a known gap.
- **[SCSS module specificity]** → SCSS modules can conflict with Tailwind utilities. Mitigation: SCSS modules are only used for complex cases, and specificity is managed carefully.
