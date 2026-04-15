## Why

The calendar currently only supports a Month view. Users need Day and Week views to see time-of-day detail for their events and manage their daily/weekly schedules effectively. The view toggle buttons (Day/Week/Month) are already rendered in the UI but are non-functional, creating a gap between user expectations and actual capability.

## What Changes

- **Day view**: Full 24-hour time grid with hour labels, proportionally sized event blocks, all-day event row, current time indicator, and auto-scroll to current hour
- **Week view**: 7-column time grid (SUN-SAT) with shared hour gutter, multi-day all-day events spanning columns, overlapping event side-by-side layout, and current time indicator
- **View state management**: New `viewMode` state (`day | week | month`) in Calendar index, with view toggle buttons becoming functional
- **Unified navigation**: Prev/next/today controls adapt per view (day +-1, week +-7, month +-1); header label changes per view (full date / date range / month year)
- **Date selection state**: Replace `currentMonth`/`currentYear` with a single `currentDate` (Date) to support day-level navigation
- **Time-aware mock data**: Add events with time-of-day (hours/minutes set on `startDate`/`endDate`) alongside existing all-day events; add `allDay` boolean flag to `CalendarEvent` type
- **i18n additions**: New translation keys for time labels, navigation ARIA labels, and date formatting (en/jp)
- **SCSS additions**: New styles for time grid, hour gutter, event blocks, current time indicator, all-day row

## Capabilities

### New Capabilities
- `calendar-day-view`: Day view component with 24-hour time grid, event block rendering, current time indicator, and click-to-create interactions
- `calendar-week-view`: Week view component with 7-column time grid, multi-day all-day event spanning, overlapping event layout, and current time indicator
- `calendar-view-state`: View mode state management, unified navigation (prev/next/today per view), date selection state, and view toggle button wiring

### Modified Capabilities
- (none - existing month view, modals, and popovers remain unchanged; only the parent orchestration in index.tsx changes to support view switching)

## Impact

- **Types**: `CalendarEvent` gains optional `allDay` boolean field
- **Data**: `calendarEvents.ts` updated with time-of-day events
- **Components**: New `DayView.tsx`, `WeekView.tsx` components; `CalendarGrid.tsx` renamed/kept as month view; `index.tsx` refactored for view state
- **Styles**: `Calendar.module.scss` extended with day/week grid styles
- **i18n**: `calendar.json` (en/jp) gains new keys for time labels and ARIA
- **No new dependencies**: Uses native `Date`, `Intl.DateTimeFormat`, existing SCSS modules
