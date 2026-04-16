## Why

Completed todo items on the Todo page currently render as white rows with only the checkbox filled in primary blue. The reference design calls for a much stronger "done" visual: the entire row should take on a primary-blue background with a white checkmark inside an outlined checkbox and white text. This makes completed vs. active tasks instantly distinguishable and matches the product's intended look.

## What Changes

- Completed todo rows render with a full-bleed primary-blue background (replacing the white/hover-gray background used for active rows) — the background extends edge-to-edge across the row container with no inner pill or added border radius.
- The completion checkbox on completed rows is outlined white (transparent fill, white border, white checkmark using the semantic `!text-on-primary` utility) instead of solid blue with a white checkmark.
- Todo text on completed rows is rendered with `!text-on-primary` (resolves to white on primary backgrounds) while keeping the existing `line-through` decoration.
- Star and delete action icon buttons on completed rows use `text-on-primary` for the icon color and `hover:bg-white/10` for the button hover background, so they remain legible against the blue row.
- Row hover styling for completed rows remains visually consistent (slightly darker primary blue, `hover-bg-primary-dark`) rather than the light-gray hover used for active rows.
- The existing row divider (`divide-y divide-gray-200 dark:divide-gray-700`) and the existing `transition-colors` animation are preserved.
- Active (not-completed) rows are unchanged.
- No behavioral changes: toggle, star, and delete actions continue to work identically; all 3 themes (light/dark/forest) remain supported. Note: in the forest theme, `bg-primary` resolves to green, so completed rows will render green in forest — this is accepted behavior.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `remaining-pages`: The "Todo page with CRUD" requirement gains new scenarios that pin the visual treatment of completed rows (full-bleed blue row background, outlined white checkbox with checkmark, `!text-on-primary` strikethrough text, action-icon treatment).

## Impact

- **Code**: `src/pages/Todo/index.tsx` — the completed-row JSX (row container classes, checkbox classes, text classes, action-icon button classes).
- **Styles**: Tailwind utility classes only; `cn()` helper from `src/utils/cn.ts` used for conditional composition. No new SCSS modules, no new design tokens.
- **Themes**: Must remain correct across light, dark, and forest themes — uses existing theme-aware primary utilities (`bg-primary`, `hover-bg-primary-dark`, `!text-on-primary`). In forest theme, `bg-primary` resolves to green; completed rows will be green there — accepted.
- **Tests**: Update/add unit tests for Todo completed-state rendering (row background class, checkbox variant, text color, action-icon classes on completed rows). Assertions remain class-name-based (no new `data-*` attributes introduced).
- **No API, routing, or state changes. No pagination footer / "Showing N of M" text changes. No new focus ring. No contrast-audit task.**
