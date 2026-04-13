## Why

The Todo page filter buttons ("All", "Active", "Completed", "Starred") and the "Add Task" button lose their text when clicked/selected. The active button renders as a solid blue rectangle with invisible text. This is caused by a CSS Cascade Layers conflict: the `_globals.scss` body color rule (`body { color: var(--color-gray-900); }`) compiles to unlayered CSS, while Tailwind's `text-white` utility is inside `@layer utilities`. Per CSS spec, unlayered styles always beat layered styles, so the inherited body color overrides `text-white`.

## What Changes

- Replace `text-white` with `!text-on-primary` on the active filter button state and "Add Task" button to ensure text visibility via `!important`
- Replace hardcoded theme classes (`bg-primary-600`, `bg-gray-100`, `dark:bg-gray-700`, etc.) with theme-aware utility classes (`bg-primary`, `bg-surface-muted`, `text-secondary`, `hover-bg-muted`, `hover-bg-primary-dark`)
- Follow the proven fix pattern already used by the Pagination component (`src/components/Pagination/index.tsx:86`)

## Capabilities

### New Capabilities
- `fix-todo-filter-buttons`: Fix CSS cascade layer conflict on Todo page buttons by using theme-aware utility classes with `!important` text color override

### Modified Capabilities

## Impact

- `src/pages/Todo/index.tsx` — Lines 173 (Add Task button) and 195-196 (filter button active/inactive states)
- No API, dependency, or architectural changes
- Visual fix across all 3 themes (light, dark, forest)
