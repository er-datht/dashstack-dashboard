## Context

Two places in the app use custom-built calendar grids:
1. **CalendarHeader** — currently a static `<span>` label; no date picker exists yet
2. **Orders/DateFilterPopup** — a custom 42-cell grid with multi-date toggle selection

Both can be served by `react-calendar`, which provides day/month/year drill-down, accessible navigation, and multi-select support. The main `CalendarGrid.tsx` (month view with event bars) is NOT replaced — react-calendar doesn't support event overlays.

## Goals / Non-Goals

**Goals:**
- Make CalendarHeader's date label clickable to open a `react-calendar` popup
- Replace DateFilterPopup's custom grid with `react-calendar` (multi-select mode)
- Theme react-calendar for light, dark, and forest using CSS custom properties
- Maintain consistent calendar UX across the app

**Non-Goals:**
- Replacing CalendarGrid.tsx (month view with event bars)
- Adding time selection — date only
- Custom react-calendar builds

*Note: Scope expanded during implementation to also replace native `<input type="date">` in AddEventModal and AddPersonForm with a shared `DatePickerInput` component.*

## Decisions

### 1. Library: `react-calendar` (pinned version)
**Choice**: Use `react-calendar` for all date-picker calendar grids.
**Rationale**: Mature, well-maintained, supports drill-down (day→month→year), accessible, lightweight (~10KB gzipped). User explicitly requested this library.

### 2. Shared theme overrides
**Choice**: Base react-calendar theme overrides in `src/index.css` as global styles. Component-specific SCSS files only add layout overrides (sizing, padding, positioning).
**Rationale**: All react-calendar instances share the same theme colors. Centralizing in `index.css` avoids duplication. Using CSS custom properties ensures automatic theme switching via `data-theme`.

### 3. CalendarHeader popup: absolute positioning
**Choice**: Render the picker absolutely positioned below the date label, inside a relative wrapper.
**Rationale**: Simple CSS, no portal needed. Header is at the top so there's always room below.

### 4. DateFilterPopup: react-calendar with multi-select
**Choice**: Use react-calendar's `onClickDay` + custom `tileClassName` to replicate multi-date toggle behavior. Keep the existing "Apply Now" footer and external API (`selectedDates`, `onApply`, `onClose`).
**Rationale**: Preserves the existing filter UX while removing ~90 lines of custom grid code. The multi-select state remains local to DateFilterPopup, same as before.

### 5. CalendarHeader state flow
**Choice**: CalendarHeader receives `currentDate: Date` and `onDateSelect: (date: Date) => void` as new props. Picker open/close state is local to CalendarHeader.
**Rationale**: Keeps popup UI logic in the header; parent Calendar page remains single source of truth for `currentDate`.

## Risks / Trade-offs

- **Bundle size increase** (~10KB gzipped) → Acceptable; both pages are lazy-loaded.
- **CSS specificity conflicts** → Mitigate by scoping overrides under a wrapper class.
- **react-calendar version drift** → Mitigate by pinning exact version.
- **DateFilterPopup behavior change** → react-calendar's built-in month navigation replaces custom prev/next buttons. Visual change is minor; behavior is equivalent.
