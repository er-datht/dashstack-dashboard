## Why

The calendar grid currently has no visual indicator for today's date. Users must mentally track which day is "today" when viewing the calendar, reducing usability. Highlighting today makes the calendar immediately scannable and anchors the user's temporal context.

## What Changes

- Add an `isToday` boolean flag to the `CalendarDay` type in `CalendarGrid.tsx`
- Set `isToday` during calendar day generation by comparing each date against today's date
- Apply a distinctive visual style (colored circle/badge behind the day number) to today's cell
- The highlight must be visible across all 3 themes (light, dark, forest)
- The highlight should appear even when today falls in an adjacent (out-of-month) row

## Capabilities

### New Capabilities
- `today-highlight`: Visual highlighting of the current day in the calendar month grid

### Modified Capabilities

## Impact

- `src/pages/Calendar/CalendarGrid.tsx` — `CalendarDay` type gets `isToday` field; `generateCalendarDays()` sets it; render adds conditional class
- `src/pages/Calendar/Calendar.module.scss` — new `.today` / `.todayNumber` styles
- No new dependencies, no API changes, no breaking changes
