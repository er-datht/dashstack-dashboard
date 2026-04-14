## Why

The Add/Edit Event modal currently only captures basic event info (title, dates, location, organizer). Users need the ability to upload a background image for events and add participants, both of which are already supported by the `CalendarEvent` type but not yet exposed in the modal UI.

## What Changes

- Add an image upload area to the Add/Edit Event modal that lets users select and preview a background image for the event
- Add a participants input field that allows adding multiple participants by name, with the ability to remove individual participants
- Extend the `CalendarEvent` type with an optional `image` field to store the uploaded image data
- Update the `onSave` callback and parent state management to persist image and participant data
- Update the `EventDetailPopover` to display the uploaded image instead of the static placeholder
- Update the `EventsSidebar` to display the event creator's avatar (from organizer) as a circular thumbnail instead of the static placeholder
- Add drag-and-drop support for the image upload area
- Add 5MB file size limit with error message for image uploads
- Add i18n translations for new fields across all 3 languages (en, jp, ko)

## Capabilities

### New Capabilities
- `event-image-upload`: Image upload UI for event background — file picker, preview, and data URL storage
- `event-participants-input`: Multi-participant input with add/remove — tag-style chips in the modal form

### Modified Capabilities
- `event-detail-popover`: Display uploaded image instead of static placeholder
- `event-sidebar`: Display event creator avatar in sidebar event items

## Impact

- **Files modified**: `src/types/calendar.ts`, `src/pages/Calendar/AddEventModal.tsx`, `src/pages/Calendar/index.tsx`, `src/pages/Calendar/EventDetailPopover.tsx`, `src/pages/Calendar/EventsSidebar.tsx`, `src/pages/Calendar/Calendar.module.scss`, `src/data/calendarEvents.ts`
- **i18n**: `public/locales/{en,jp,ko}/calendar.json` — new modal field labels
- **No new dependencies** — uses native `FileReader` API for image handling
- **No API changes** — data remains client-side
