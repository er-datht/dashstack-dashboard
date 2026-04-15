## Context

The calendar page (`src/pages/Calendar/`) currently renders a month grid view with event bars, an events sidebar, add/edit modals, and a detail popover. The view toggle buttons (Day/Week/Month) exist in `CalendarGrid.tsx` but are non-functional. State is managed via `currentMonth`/`currentYear` in `index.tsx`. Events use `CalendarEvent` type with `startDate`/`endDate` (Date objects) but current mock data only uses date-level granularity (no hours/minutes). The SCSS module `Calendar.module.scss` handles grid layout, event bars, and popover positioning.

## Goals / Non-Goals

**Goals:**
- Functional Day and Week views with time-of-day event rendering
- Unified navigation that adapts per view mode (prev/next/today)
- Modify AddEventModal to support time inputs (`datetime-local` or separate time fields) for timed event creation
- Reuse existing popover and sidebar components without modification
- Theme-aware styling across all three themes (light/dark/forest)
- i18n support for all new UI text (en/jp)
- Distinguish all-day events from timed events visually

**Non-Goals:**
- Drag-to-resize or drag-to-move events (future enhancement)
- API integration or backend persistence (remains client-side state)
- Responsive/mobile layout for day/week views (desktop-first for now)
- Custom time range display (always show full 24 hours)
- Event recurrence or repeating events
- Locale-specific week start day (always Sunday regardless of locale)
- Events spanning midnight show as clipped at midnight (Google Calendar behavior); continuation on next day is not rendered

## Decisions

### 1. Replace `currentMonth`/`currentYear` with `currentDate: Date`

**Choice**: Single `currentDate` state instead of separate month/year numbers.

**Why**: Day and week views need day-level precision for navigation. A single Date simplifies prev/next logic across all views and naturally encodes the full context (day, week, month) from one value.

**Alternative considered**: Keep month/year and add `currentDay` — rejected because it fragments state and requires keeping three values in sync.

### 2. Add `allDay` boolean to `CalendarEvent` type

**Choice**: Add optional `allDay?: boolean` field to the existing type. Events without time components (or `allDay: true`) render in the all-day row; timed events render as blocks in the time grid.

**Why**: The existing `startDate`/`endDate` already use `Date` objects which can hold time info. Adding `allDay` avoids breaking the existing API — all current events are implicitly all-day. New timed events set `allDay: false` (or omit it) and include hours/minutes in their dates.

**Alternative considered**: Separate `startTime`/`endTime` string fields — rejected because it duplicates date info and complicates event overlap calculations.

### 3. Extract shared `CalendarHeader` component

**Choice**: Extract the top bar (Today button, prev/next arrows, view-specific label, view toggle) from `CalendarGrid.tsx` into a new `CalendarHeader.tsx`. All three views share this header; only the label content and navigation step size differ. The header receives `viewMode`, `onViewChange`, `onPrev`, `onNext`, `onToday`, and a `label` string.

**Why**: Avoids duplicating header UI across DayView, WeekView, and CalendarGrid. Keeps each view component focused on rendering its grid only.

### 4. New components: `DayView.tsx` and `WeekView.tsx`

**Choice**: Create two new sibling components alongside `CalendarGrid.tsx` (which remains the month view). The parent `index.tsx` conditionally renders the active view.

**Why**: Each view has distinct layout logic (single-column time grid vs. 7-column grid vs. date-cell grid). Separate components keep each view focused and avoid a monolithic component with complex conditionals.

**Alternative considered**: A single `TimeGrid` component parameterized by column count — rejected because the day view and week view have enough differences (header format, all-day spanning, column width calculations) that a shared component would become overly complex.

### 4. Shared time grid utilities in `calendarUtils.ts`

**Choice**: Extract shared helpers into the existing `calendarUtils.ts`:
- `getHourLabels()`: Returns array of 24 hour labels formatted per locale
- `getEventsInTimeRange(events, startDate, endDate)`: Filters events overlapping a date range
- `calculateEventPosition(event, dayStart)`: Returns top/height percentages for a timed event within a day column
- `groupOverlappingEvents(events)`: Groups events that overlap in time and returns column assignments for side-by-side rendering

**Why**: Both DayView and WeekView need these same calculations. Extracting them avoids duplication and makes them independently testable.

### 5. CSS Grid for time grid layout

**Choice**: Use CSS Grid with the hour gutter as a fixed-width first column and day column(s) as `1fr` tracks. Event blocks use absolute positioning within each day column (relative container).

**Why**: CSS Grid handles the fixed-gutter + flexible-columns layout cleanly. Absolute positioning for events within day columns allows proportional height calculation (`top` = minutes from midnight / total minutes * 100%) matching how Google Calendar and similar apps work.

### 6. Current time indicator with `setInterval`

**Choice**: A thin horizontal line (primary color) with a small dot, positioned at the current time. Updated every 60 seconds via `setInterval` in a `useEffect`. Only visible when today is in the current view.

**Why**: 60-second updates are sufficient precision for a visual indicator. The interval auto-cleans up on unmount.

### 7. Auto-scroll to current hour

**Choice**: On initial render of Day/Week view (and when navigating to today), `scrollIntoView` the element nearest the current hour, offset by ~2 hours above for context.

**Why**: Showing midnight at the top is useless for most users. Scrolling to "now minus 2 hours" shows the current context.

### 8. View-specific header labels

**Choice**:
- **Day**: "Wednesday, April 15, 2026" — formatted via `Intl.DateTimeFormat`
- **Week**: "Apr 12 - 18, 2026" (or "Mar 30 - Apr 5" if week crosses months)
- **Month**: "April 2026" (unchanged)

**Why**: Each view needs contextually appropriate labeling. Using `Intl.DateTimeFormat` ensures locale-aware formatting.

### 10. Modify AddEventModal to support time inputs

**Choice**: Add time input fields to AddEventModal. When `initialDate` includes hours/minutes (from Day/Week slot click), the modal pre-fills the time. Add an "All Day" toggle that hides/shows time inputs. When creating from Day/Week view slot clicks, `allDay` defaults to `false`; from Month view day clicks, defaults to `true`.

**Why**: The user decided to expand modal scope to properly support timed event creation from Day/Week views. Without time inputs, the click-to-create-with-time feature would silently lose time info.

### 11. Update save callback to include `allDay`

**Choice**: Add `allDay: boolean` to the `handleSaveEvent` data parameter. Events created from Day/Week time slot clicks automatically get `allDay: false`. Events created from Month view or with the "All Day" toggle get `allDay: true`.

**Why**: The `CalendarEvent` type has `allDay` but the save flow must propagate it to correctly distinguish timed vs. all-day events.

### 12. Use `allDay` flag as sole discriminator

**Choice**: Use the `allDay` boolean exclusively to determine whether an event is all-day or timed. Never inspect the Date object's time component to infer this.

**Why**: A Date at midnight (00:00) is indistinguishable from a Date with "no meaningful time." The boolean flag is unambiguous.

## Risks / Trade-offs

- **[Many events overlapping]** Side-by-side layout may become cramped with 4+ simultaneous events → Mitigation: Cap visible columns at 3-4 and show "+N more" indicator for excess. Acceptable for V1 without this cap.
- **[Performance with many events]** Rendering 24 hours * 7 days of event positioning → Mitigation: Events are client-side mock data (small set); no optimization needed now. If real API returns hundreds of events, memoize filtered results.
- **[SCSS module growth]** Adding day/week styles to existing `Calendar.module.scss` → Mitigation: Styles are scoped by class name prefixes (`dayView*`, `weekView*`, `timeGrid*`). Split into separate files only if it exceeds ~500 lines.
- **[Time zone handling]** All dates use browser-local time via native `Date` → Mitigation: Acceptable for client-side demo app. Real-world calendar would need explicit timezone handling.
