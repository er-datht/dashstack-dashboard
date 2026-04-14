## Why

The Calendar page is one of the core PAGES section routes in DashStack that currently only has a placeholder implementation. The Figma design specifies a full calendar UI with a two-column layout: an events sidebar showing upcoming events with participant avatars, and a monthly calendar grid with event bars. Implementing this brings the Calendar route to feature parity with other implemented pages like Orders and Todo.

## What Changes

- Replace the placeholder Calendar page with a full two-column layout matching the Figma design
- Implement a left sidebar with "+ Add New Event" button, upcoming events list with avatars, and "See More" button
- Implement a right-side monthly calendar grid with day-of-week headers, date navigation, view mode toggles (Day/Week/Month), and colored event bars
- Add calendar-specific mock event data and types
- Add i18n translation files for calendar namespace (en/jp/ko)
- Add SCSS module for complex calendar grid and event bar styling
- Support all 3 themes (light/dark/forest)

## Capabilities

### New Capabilities
- `calendar-grid`: Monthly calendar grid with dynamic date calculation, previous/next month navigation, "Today" button, and grayed-out adjacent month days with diagonal stripe pattern
- `calendar-events-sidebar`: Left sidebar showing upcoming events with circular event images, event details (name, date, location, organizer), participant avatars with overflow count badge
- `calendar-event-bars`: Colored event bars overlaid on calendar days with left border accent and translucent background, supporting multiple colors (purple, pink, orange, blue)
- `calendar-view-modes`: Day/Week/Month toggle button group (Month view implemented, Day/Week as visual-only)

### Modified Capabilities
- None

## Impact

- **Files**: `src/pages/Calendar/` (index.tsx, CalendarGrid.tsx, EventsSidebar.tsx, EventBar.tsx, Calendar.module.scss)
- **Types**: `src/types/calendar.ts` (CalendarEvent, EventColor)
- **Data**: `src/data/calendarEvents.ts` (mock events with colors and participants)
- **i18n**: `public/locales/{en,jp,ko}/calendar.json`
- **Dependencies**: Uses lucide-react (ChevronLeft, ChevronRight), classnames, react-i18next. No new external dependencies.
