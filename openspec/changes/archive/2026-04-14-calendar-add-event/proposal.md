## Why

The Calendar page currently displays static mock events with no interactivity beyond month navigation. Users need the ability to create new events by clicking on calendar date cells or the "+ Add New Event" button. This makes the calendar functional rather than purely display-only, and is a natural next step after the initial calendar page implementation.

## What Changes

- Add an "Add Event" modal dialog that opens when clicking a calendar date cell or the "+ Add New Event" sidebar button
- The modal has form fields: title (required), start date, end date (optional, for multi-day events), location, organizer
- Clicking a date cell pre-fills the start date; the sidebar button opens with today's date
- A random color is assigned to each new event from a predefined palette
- Created events are stored in component state (merged with the initial mock data) and immediately appear as event bars on the calendar grid and in the sidebar event list
- Add cursor pointer and hover effect to day cells to indicate clickability
- Add i18n keys for all modal labels across en/jp/ko

## Capabilities

### New Capabilities
- `add-event-modal`: Modal dialog with form fields for creating a new calendar event, with date pre-fill from clicked cell
- `day-cell-click`: Calendar day cells become clickable, triggering the add-event modal with the clicked date pre-filled
- `dynamic-event-state`: Events list is managed in Calendar page state, combining initial mock data with user-created events

### Modified Capabilities
- `calendar-grid`: Day cells gain onClick handler and hover styling
- `events-sidebar`: "+ Add New Event" button gains onClick to open modal; sidebar receives dynamic events list
- `calendar-page-shell`: Manages events state array and modal open/close state

## Impact

- **New file**: `src/pages/Calendar/AddEventModal.tsx` — modal dialog component
- **Modified**: `src/pages/Calendar/index.tsx` — events state, modal state, handlers
- **Modified**: `src/pages/Calendar/CalendarGrid.tsx` — add onDayClick prop and day cell click handler
- **Modified**: `src/pages/Calendar/EventsSidebar.tsx` — add onAddEvent prop for button click
- **Modified**: `src/pages/Calendar/Calendar.module.scss` — day cell hover styles, modal styles
- **Modified**: `public/locales/{en,jp,ko}/calendar.json` — modal form labels
- **Dependencies**: No new external dependencies
