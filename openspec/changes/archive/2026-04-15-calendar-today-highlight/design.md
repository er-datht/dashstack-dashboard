## Context

The CalendarGrid component renders a 42-cell month grid. Each cell is a `CalendarDay` object with `date`, `dayOfMonth`, and `isCurrentMonth` fields. Out-of-month days get a striped background via the `.outOfMonth` class. Currently there is no mechanism to visually distinguish today's date from any other day.

## Goals / Non-Goals

**Goals:**
- Add a clear, theme-aware visual indicator for today's date in the calendar grid
- Keep the indicator visible even when today falls in an adjacent month row
- Minimal code change — extend the existing `CalendarDay` type and CSS module

**Non-Goals:**
- Animated/pulsing effects for today
- Changing the "Today" button behavior (navigation already works)
- Responsive/mobile-specific today styling

## Decisions

### 1. Extend `CalendarDay` type with `isToday` boolean

Add `isToday: boolean` to the existing `CalendarDay` type. Set it during `generateCalendarDays()` by comparing each generated date's year/month/day against `new Date()`. This keeps the detection logic co-located with the existing day generation.

**Alternative considered:** Compute `isToday` in the render loop instead of in the data model. Rejected because the data model already carries `isCurrentMonth` — keeping both flags together is consistent and avoids per-render recomputation.

### 2. Colored circle badge behind the day number

Style today's day number with a circular primary-colored background and white text. This is a common calendar UI pattern (Google Calendar, Apple Calendar) and provides strong contrast. The circle is applied via a `.todayNumber` CSS class on the `<span>` element.

**Alternative considered:** Highlight the entire cell background. Rejected because it conflicts with the existing `.outOfMonth` striped pattern and reduces the subtlety of the indicator.

### 3. Use existing CSS custom properties for theme support

Use `var(--color-primary-600)` for the circle background and `var(--color-white)` for the text. These properties are already defined across all three themes (light/dark/forest) in `src/index.css`, so no new token definitions are needed. The forest theme override mirrors the pattern used in `.viewToggleButtonActive`.

## Risks / Trade-offs

- [Circle may overlap event bars on narrow viewports] → The circle is positioned in the top-right corner of the cell (same as all day numbers), keeping it well away from event bars at the bottom.
- [Today detection uses client local time] → Acceptable for a dashboard app; server time sync is a non-goal.
