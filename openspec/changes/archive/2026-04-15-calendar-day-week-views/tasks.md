## 1. Type & Data Foundation

- [x] 1.1 Add optional `allDay?: boolean` field to `CalendarEvent` type in `src/types/calendar.ts`
- [x] 1.2 Update existing mock events in `src/data/calendarEvents.ts` to set `allDay: true` and add 4+ timed events with hours/minutes on `startDate`/`endDate` and `allDay: false`, using April 2026 dates so they're visible on first load
- [x] 1.3 Add shared utility functions to `src/pages/Calendar/calendarUtils.ts`: `getHourLabels()`, `getEventsInTimeRange()`, `calculateEventPosition()`, `groupOverlappingEvents()`, `getWeekRange(date)`. Timed events spanning midnight are clipped at midnight (not rendered past 11:59 PM)

## 2. View State & Header Extraction

- [x] 2.1 Extract shared `CalendarHeader.tsx` from `CalendarGrid.tsx`: Today button, prev/next arrows, dynamic label slot, view toggle buttons. Props: `viewMode`, `onViewChange`, `onPrev`, `onNext`, `onToday`, `label` (string)
- [x] 2.2 Refactor `src/pages/Calendar/index.tsx`: replace `currentMonth`/`currentYear` with single `currentDate: Date` state; add `viewMode` state (`day | week | month`, default `month`); compute view-specific header label
- [x] 2.3 Update navigation handlers: `handlePrev`/`handleNext` adapt per viewMode (day +-1, week +-7, month +-1); `handleToday` sets `currentDate` to today
- [x] 2.4 Conditionally render DayView/WeekView/CalendarGrid based on `viewMode`; pass `CalendarHeader` above the active view
- [x] 2.5 Update CalendarGrid to remove its internal header (now in CalendarHeader); derive `currentMonth`/`currentYear` from the `currentDate` prop

## 3. AddEventModal Time Support

- [x] 3.1 Add time input fields to AddEventModal: start time and end time inputs (shown when not all-day)
- [x] 3.2 Add "All Day" toggle switch to AddEventModal; when on, hide time inputs; when off, show time inputs
- [x] 3.3 Update `handleSaveEvent` data type in index.tsx to include `allDay: boolean`; propagate `allDay` when creating/updating events
- [x] 3.4 When modal opens from Day/Week time slot click, default `allDay` to `false` and pre-fill clicked hour; from Month view day click, default `allDay` to `true`

## 4. Day View Component

- [x] 4.1 Create `src/pages/Calendar/DayView.tsx` with 24-hour time grid layout (CSS Grid: hour gutter + main column), hour labels, and scrollable container
- [x] 4.2 Implement all-day event row pinned above the time grid
- [x] 4.3 Render timed event blocks with proportional top/height positioning using `calculateEventPosition()`; apply `EventColor` styling; minimum height equivalent to 30 minutes
- [x] 4.4 Implement overlapping event side-by-side layout using `groupOverlappingEvents()`
- [x] 4.5 Add current time indicator line (horizontal line + dot) with 60-second `setInterval` update; only visible when viewing today
- [x] 4.6 Implement auto-scroll to current time on initial render of today (scroll to current hour - 2, clamp to top if < 0)
- [x] 4.7 Add click interactions: click empty slot opens AddEventModal pre-filled with that day and hour (`allDay: false`); click event block opens EventDetailPopover

## 5. Week View Component

- [x] 5.1 Create `src/pages/Calendar/WeekView.tsx` with 7-column time grid layout (CSS Grid: hour gutter + 7 day columns, SUN-SAT), shared hour labels, scrollable container
- [x] 5.2 Add column headers with day name + date number; highlight today's column with blue circle badge
- [x] 5.3 Implement all-day event row with multi-day event spanning across day columns; clip to week boundaries
- [x] 5.4 Render timed event blocks in their respective day columns with proportional positioning
- [x] 5.5 Implement overlapping event side-by-side layout within each day column
- [x] 5.6 Add current time indicator line in today's column only; 60-second update interval
- [x] 5.7 Implement auto-scroll to current time on initial render when current week is shown
- [x] 5.8 Add click interactions: click empty slot in day column opens modal pre-filled with that day and hour; click event block opens popover
- [x] 5.9 Week view header label: compute date range string (e.g., "Apr 12 - 18, 2026"), handle cross-month ranges (e.g., "Mar 30 - Apr 5, 2026") and cross-year ranges

## 6. Styling

- [x] 6.1 Add SCSS styles to `Calendar.module.scss` for shared time grid layout: hour gutter, hour rows, grid lines, scrollable container
- [x] 6.2 Add SCSS styles for Day view: event blocks, all-day row, current time indicator
- [x] 6.3 Add SCSS styles for Week view: 7-column grid, column headers, all-day row spanning, current time indicator
- [x] 6.4 Add SCSS styles for CalendarHeader component (extracted from CalendarGrid styles)
- [x] 6.5 Add SCSS styles for AddEventModal time inputs and all-day toggle
- [x] 6.6 Ensure all new styles use CSS custom properties for theme compatibility (light/dark/forest); add `[data-theme]` overrides where needed

## 7. Internationalization

- [x] 7.1 Add new translation keys to `public/locales/en/calendar.json`: `previousDay`, `nextDay`, `previousWeek`, `nextWeek`, `allDay`, `startTime`, `endTime`, time format labels
- [x] 7.2 Add corresponding Japanese translations to `public/locales/jp/calendar.json`
