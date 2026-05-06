## Why

In Day and Week views, clicking on an empty time slot is silently swallowed — the AddEventModal never opens, breaking the primary "create event from grid" flow. The transparent per-day event-column overlays (`.weekDayEventsColumn`, `.dayEventsColumn`) cover the entire scrollable grid (`top:0; bottom:0`) and intercept every click that should reach the underlying `.weekHourSlot` / `.hourSlot` cells. Both calendar specs (`calendar-day-view`, `calendar-week-view`) already mandate this interaction, so the live UI is a regression against shipped contracts — not a missing requirement.

## What Changes

- Add `pointer-events: none` to `.weekDayEventsColumn` and `.dayEventsColumn` in `Calendar.module.scss` so the overlays no longer absorb clicks.
- Add `pointer-events: auto` to `.timedEventBlock` so individual event blocks remain clickable through the now-transparent parent (preserves "Click event block to show popover" scenarios).
- Add regression-locking unit tests to `WeekView.test.tsx` and `DayView.test.tsx` covering "click empty slot fires onTimeSlotClick with the expected Date" and "click event block fires onEventClick" — neither path is currently exercised, which is why this regression slipped through CI.

## Capabilities

### New Capabilities

<!-- None — this is a regression fix against existing specs. -->

### Modified Capabilities

- `calendar-day-view`: ADD a "Time-grid overlay does not block slot clicks" invariant that captures the layering contract behind the existing "Click empty slot to create event" scenario, so future overlay regressions are caught by spec-level review.
- `calendar-week-view`: ADD the same invariant scoped to the per-day event columns in the week grid.

## Impact

- **Code**: `src/pages/Calendar/Calendar.module.scss` (3 declarations), `src/pages/Calendar/__tests__/WeekView.test.tsx` (new test cases), `src/pages/Calendar/__tests__/DayView.test.tsx` (new test cases).
- **APIs / dependencies**: None.
- **Specs**: Two ADDED requirements (one per existing spec) locking in the click-through invariant. No existing requirements modified or removed.
- **Themes / i18n**: Unaffected — pure pointer-events plumbing.
- **Risk**: Low. Standard calendar-grid overlay pattern (used by FullCalendar, Google Calendar). Children explicitly opt back into pointer events, so event-block click handlers continue to fire.
