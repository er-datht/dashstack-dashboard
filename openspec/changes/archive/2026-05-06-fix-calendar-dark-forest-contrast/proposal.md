## Why

Two contrast bugs make the calendar hard to read in dark and forest themes:

1. **Header date label "May 2026" appears black on the dark surface.** In light mode it reads correctly; in dark/forest it falls back to the browser-default button color regardless of theme. Users can barely see the current month/year — the most prominent label in the calendar header.
2. **Out-of-month cells in the month grid render with bright near-white diagonal stripes** that overwhelm the dark cell background and obscure the day number rendered inside.

Both are theme-cascade bugs in `Calendar.module.scss`: one selector overrides the theme-aware utility class with `color: inherit`, and one hardcodes a brand-50 token that is intentionally NOT overridden per theme.

## What Changes

- `.datePickerLabel`: drop `color: inherit`. The button's existing Tailwind `text-primary` class then applies, giving `color: var(--color-text-primary)` which already adapts per theme. No JSX changes.
- `.outOfMonth`: keep the existing light-mode stripe declaration. Add `[data-theme="dark"] .outOfMonth` and `[data-theme="forest"] .outOfMonth` overrides that swap the stripe color to a subtle low-opacity white overlay (`rgba(255, 255, 255, 0.04)`) so day numbers remain legible against the dark cell.
- Out of scope: any other contrast issues outside the calendar; theme tokens themselves; `react-calendar`-library popup styling (already theme-aware via `react-calendar-theme` spec); the chevron / Today / view-toggle buttons (already theme-correct).

## Capabilities

### New Capabilities
<!-- None — extends two existing capability specs. -->

### Modified Capabilities
- `calendar-view-state`: ADD a "Date picker label adapts to active theme" requirement covering the header date-label button's color in all three themes. The capability already owns the `CalendarHeader` props contract (`currentDate`, `onDateSelect`); typography/contrast belongs in the same home.
- `calendar-month-view`: ADD an "Out-of-month cells use a theme-aware diagonal stripe pattern" requirement. The `today-highlight` spec already references the striped background as a concept but never defined its appearance — this complements that without conflict.

## Impact

- **Code**: `src/pages/Calendar/Calendar.module.scss` only. Two small edits: remove one declaration from `.datePickerLabel`, add two `[data-theme]` blocks for `.outOfMonth`.
- **APIs / dependencies**: None.
- **JSX / TSX**: None.
- **Specs**: Two ADDED requirements (one per existing capability). No existing requirements modified or removed.
- **Tests**: None added. JSDOM does not honor CSS custom-property cascade through `[data-theme]` attribute selectors, so unit tests cannot meaningfully verify either fix. Verification is manual browser smoke per `tasks.md` across light/dark/forest.
- **Risk**: Low. Removing `color: inherit` lets `text-primary` (already in JSX) apply unchanged in light mode; user-visible behavior in dark/forest goes from "unreadable black-on-dark" to "readable light-on-dark". Adding `[data-theme]` overrides for `.outOfMonth` only affects the two dark themes; light mode keeps its current stripe.
