## Context

The Todo page (`src/pages/Todo/index.tsx`) uses `text-white` for button text on primary-colored backgrounds. Due to CSS Cascade Layers, the unlayered `body { color: var(--color-gray-900); }` rule in `_globals.scss` always beats Tailwind's layered `text-white` utility, making button text invisible on the primary background.

The Pagination component (`src/components/Pagination/index.tsx:86`) already solved this exact problem using `!text-on-primary` — a custom utility defined in `src/index.css:280-282` that applies `color: var(--color-white) !important`.

## Goals / Non-Goals

**Goals:**
- Make filter button and Add Task button text visible across all 3 themes
- Use existing theme-aware utility classes for consistency with the rest of the codebase

**Non-Goals:**
- Fixing the root cause (unlayered SCSS body color) — that would be a larger refactor
- Modifying other pages that may have similar issues

## Decisions

**Use `!text-on-primary` instead of fixing the cascade layer root cause**
The `!important` variant is the established pattern in this codebase (used by Pagination). Fixing the cascade layer ordering would require restructuring `_globals.scss` and could have unintended side effects across all pages. The `!text-on-primary` approach is surgical and proven.

**Use theme-aware utilities (`bg-primary`, `bg-surface-muted`, `text-secondary`, `hover-bg-muted`) instead of hardcoded dark-mode variants**
These utilities are already defined in `src/index.css` and automatically adapt to all 3 themes (light/dark/forest), eliminating the need for manual `dark:` prefixes and ensuring forest theme support.

## Risks / Trade-offs

- [Low] Using `!important` is generally discouraged → Mitigated by the fact that this is a deliberate pattern in the codebase's utility layer, scoped to text-on-primary-background situations only.
- [Low] Inactive button hover state may differ slightly → The `hover-bg-muted` utility uses `var(--color-gray-50)` which adapts per theme.
