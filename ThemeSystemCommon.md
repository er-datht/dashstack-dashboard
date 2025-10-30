# Generic Theme System Guide

High-level conceptual guidance for designing and implementing a theme system for modern web applications. Not tied to project-specific details.

## Objectives

- Decouple design tokens from component logic.
- Enable runtime theme switching (no full page reload).
- Allow easy extension (add new themes without architectural breaks).
- Maintain accessibility (contrast, focus styles).

## Architectural Layers

1. Design Tokens (SCSS/JSON): colors, spacing, typography, radius, shadows, z-index.
2. CSS Variables: map tokens to `--color-*`, `--space-*`, etc. at `:root`.
3. Theme Overrides: each theme overrides a subset (background, surface, text, accent, shadow).
4. State Layer (Context / Store): holds current theme + mutation API.
5. Persistence: `localStorage` + system preference listener (`prefers-color-scheme`).
6. Components: consume CSS variables; avoid hard-coded color values.

## Naming Conventions

- Colors: `--color-primary-500`, `--color-surface`, `--color-text-primary`.
- Spacing: `--space-4`, `--space-8`.
- Typography: `--font-size-base`, `--line-height-relaxed`.
- Transitions: `--ease-in-out`, `--dur-slow`.

## Theme Render Flow

1. Determine initial theme: explicit user preference > system preference > default.
2. Apply attribute or class: `data-theme="dark"` on `<html>` / `<body>`.
3. CSS cascade applies overrides.
4. Component re-render not required (unless showing theme name in UI).

## Creating a New Theme

1. Define base palette (primary, neutrals, semantic).
2. Choose surface + text combinations meeting contrast (WCAG AA/AAA where needed).
3. Create override block:

```css
[data-theme="mytheme"] {
  --color-background: ...;
  --color-surface: ...;
  --color-primary-500: ...;
  --color-text-primary: ...;
  /* Optional: shadows, borders */
}
```

4. Add value to enum / theme list.
5. Test: focus, hover, disabled, skeleton, charts, tables.

## Common Patterns

- Light/Dark: dark adjusts contrast & reduces background saturation.
- Brand Variant: keep neutrals, swap primary palette.
- High Contrast: increase contrast ratios for accessibility mode.

## Accessibility

- Use contrast checker; primary text ≥ 4.5:1.
- Keep focus outline visible (do not remove).
- Avoid color-only status indicators (add icon / shape).

## Performance

- Single attribute mutation → minimal cascade cost.
- Avoid overriding excessive variables unnecessarily.
- Do not inline dynamic styles per component if global variables suffice.

## Anti-Patterns

- Overriding the entire palette for each theme (high duplication).
- Hard-coding color literals in components (harder maintenance).
- Setting styles on every element via JS (reflow cost).

## Testing Checklist

- Rapid switching across themes does not break layout.
- Hover, active, focus, disabled states use correct colors.
- Scrollbars (if customized) remain usable.
- Charts/data viz maintain clear distinction among series.

## Advanced Extensions

- User-defined themes (builder) → generate CSS block at runtime.
- Server-side preference sync (multi-device consistency).
- Module-scoped theming (CSS variables applied to subtree).
- Motion theme (adjust durations/easing respecting reduced motion preferences).

## FAQ

Q: Class or attribute?  
A: `data-theme` attribute reduces collision risk and communicates semantics; classes are fine if utility pipeline already established.

Q: Need SCSS tokens if CSS variables exist?  
A: SCSS centralizes raw source & can generate consistent sets; CSS variables power runtime switching.

Q: Can Tailwind and theming co-exist?  
A: Yes. Use utilities for layout; CSS variables for semantic themable values.

---

Update this file when adding principles or new patterns related to a generic theme system.
