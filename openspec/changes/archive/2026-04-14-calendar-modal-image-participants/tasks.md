## 1. Type & Data Layer

- [x] 1.1 Add optional `image?: string` field to `CalendarEvent` type in `src/types/calendar.ts`
- [x] 1.2 Add sample `image` fields to seed data in `src/data/calendarEvents.ts` (at least one event with a small base64 image for testing)

## 2. i18n Translations

- [x] 2.1 Add translation keys in `public/locales/en/calendar.json`: `modal.uploadImage`, `modal.removeImage`, `modal.imageSizeError`, `modal.participants`, `modal.addParticipantPlaceholder`, `modal.removeParticipant`
- [x] 2.2 Add matching translation keys in `public/locales/jp/calendar.json`
- [x] 2.3 Add matching translation keys in `public/locales/ko/calendar.json`

## 3. AddEventModal — Image Upload

- [x] 3.1 Add image state (`string | undefined`) and file input ref to `AddEventModal`
- [x] 3.2 Implement image upload area UI with upload icon, helper text, preview display, and remove button above the Event Title field
- [x] 3.3 Implement click-to-upload: hidden file input triggered by clicking the upload area
- [x] 3.4 Implement drag-and-drop: `onDragOver`/`onDragLeave`/`onDrop` handlers with drag-over visual highlight, file type validation, and drop handling
- [x] 3.5 Implement `FileReader` handler to convert selected file to data URL with 5MB file size validation and error message display
- [x] 3.6 Pre-populate image state from `editEvent.image` when editing (preserves existing image if untouched)
- [x] 3.7 Add SCSS styles for upload area (empty state, drag-over state, preview state, remove button) in `Calendar.module.scss`

## 4. AddEventModal — Participants Input

- [x] 4.1 Add participants state array (`Participant[]`) to `AddEventModal`
- [x] 4.2 Implement participants text input with Enter/comma handler to add chips (reject empty/whitespace)
- [x] 4.3 Implement removable chip/tag UI for each participant with X button
- [x] 4.4 Pre-populate participants state from `editEvent.participants` when editing
- [x] 4.5 Add SCSS styles for participant chips in `Calendar.module.scss`

## 5. Save Flow Integration

- [x] 5.1 Extend `onSave` callback type to include `image?: string` and `participants: Participant[]` fields
- [x] 5.2 Update `handleSubmit` in `AddEventModal` to pass current image state and participants array
- [x] 5.3 Update `handleSaveEvent` in `Calendar/index.tsx` to persist image and participants to event state (both create and edit paths)

## 6. Image Display in Popover & Sidebar

- [x] 6.1 Update `EventDetailPopover` to display `event.image` in the image area when available, falling back to placeholder
- [x] 6.2 Update `EventsSidebar` `EventItem` to display the event creator's avatar (from `organizer`) as a circular thumbnail (object-fit cover) when available, falling back to a placeholder (e.g., initials or generic user icon)
