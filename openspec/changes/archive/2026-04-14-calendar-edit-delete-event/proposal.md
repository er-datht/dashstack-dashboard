## Why

Users can create calendar events but cannot view details, edit, or delete them. Clicking an event should show a detail popover matching the Figma design, with edit/delete actions. This completes the CRUD cycle and matches the DashStack design system.

## What Changes

- Create an EventDetailPopover component that appears when clicking an event bar on the calendar grid — shows event image placeholder, title, organizer, date/time, location, attendee avatars, and edit/delete action icons
- The popover is positioned next to the clicked event bar with a left-pointing arrow/caret
- Edit icon in the popover opens the existing AddEventModal pre-filled with event data
- Delete icon in the popover removes the event (with confirmation)
- Sidebar event items also open the popover or go directly to edit modal
- Clicking outside the popover closes it
- AddEventModal already supports edit mode (editEvent/onDelete props) — this change wires the popover as the intermediate step

## Capabilities

### New Capabilities
- `event-detail-popover`: A popover card (277px wide, rounded-lg, shadow) showing: event image placeholder (pink/salmon bg, 155px tall), event title (bold 16px), organizer (medium 14px gray), date/time (12px lighter gray), location (12px gray), divider, attendee avatars row with overflow badge. Has edit (Pencil) and delete (Trash2) icon buttons in the top-right corner.

### Modified Capabilities
- `calendar-grid`: Event bar click opens the EventDetailPopover positioned near the bar (already has onEventClick + stopPropagation)
- `calendar-page-shell`: Manages popover state (selected event + position), wires popover edit → modal, popover delete → remove event
- `events-sidebar`: Event item click opens edit modal directly (sidebar already shows full details, no need for popover)

## Impact

- **New file**: `src/pages/Calendar/EventDetailPopover.tsx` — popover component
- **Modified**: `src/pages/Calendar/index.tsx` — popover state, wire popover actions to modal/delete
- **Modified**: `src/pages/Calendar/CalendarGrid.tsx` — pass click position for popover placement
- **Modified**: `src/pages/Calendar/Calendar.module.scss` — popover styles (card, arrow, image placeholder)
- **Modified**: `public/locales/{en,jp,ko}/calendar.json` — add popover-related i18n keys if needed
- **Dependencies**: Uses lucide-react (Pencil, Trash2) — already installed
