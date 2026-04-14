## 1. Add i18n keys for the modal

- [x] 1.1 Add modal translation keys to `public/locales/en/calendar.json`: modal.title ("Add New Event"), modal.eventTitle ("Event Title"), modal.startDate ("Start Date"), modal.endDate ("End Date"), modal.location ("Location"), modal.organizer ("Organizer"), modal.save ("Save"), modal.cancel ("Cancel"), modal.titleRequired ("Title is required")
- [x] 1.2 Add matching Japanese translations to `public/locales/jp/calendar.json`
- [x] 1.3 Add matching Korean translations to `public/locales/ko/calendar.json`

## 2. Create AddEventModal component

- [x] 2.1 Create `src/pages/Calendar/AddEventModal.tsx` with props: `isOpen: boolean`, `onClose: () => void`, `onSave: (event: Omit<CalendarEvent, 'id' | 'color' | 'participants'>) => void`, `initialDate?: Date`
- [x] 2.2 Implement modal UI: fixed overlay with backdrop (semi-transparent black), centered card with form fields (title input, start date input, end date input, location input, organizer input), Save and Cancel buttons
- [x] 2.3 Form state: title (required), startDate (pre-filled from initialDate prop or today), endDate (optional), location, organizer. Show validation message if title is empty on save attempt
- [x] 2.4 On save: call onSave with the form data, then close modal. On cancel/backdrop click: close modal
- [x] 2.5 Apply theme support: use `card` class for modal body, `text-primary`/`text-secondary` for labels, `bg-primary text-on-primary` for save button, theme-aware input borders and backgrounds

## 3. Add modal SCSS styles

- [x] 3.1 Add modal styles to `Calendar.module.scss`: `.modalOverlay` (fixed inset-0, bg black/50, flex center, z-50), `.modalCard` (card appearance, max-w, padding, gap), `.modalInput` (theme-aware border, background, text color, focus ring), `.modalLabel` (font-semibold, text-secondary)

## 4. Wire up day cell click in CalendarGrid

- [x] 4.1 Add `onDayClick?: (date: Date) => void` prop to CalendarGrid
- [x] 4.2 Make day cells clickable: add onClick handler calling `onDayClick(day.date)`, add cursor-pointer to day cells
- [x] 4.3 Add day cell hover style in SCSS: `.dayCellClickable` with hover background change

## 5. Wire up sidebar button and page state

- [x] 5.1 Add `onAddEvent?: () => void` prop to EventsSidebar, wire to "+ Add New Event" button onClick
- [x] 5.2 In Calendar page shell (`index.tsx`): add `events` state initialized with `calendarEvents`, add `isModalOpen` and `modalInitialDate` state
- [x] 5.3 Create `handleDayClick(date)` — sets modalInitialDate and opens modal. Create `handleAddEventClick()` — opens modal with no initial date (defaults to today). Create `handleSaveEvent(data)` — generates id, assigns color from palette, creates CalendarEvent, appends to events state
- [x] 5.4 Pass dynamic `events` state (not imported `calendarEvents`) to both EventsSidebar and CalendarGrid. Render AddEventModal with isOpen/onClose/onSave/initialDate
- [x] 5.5 Define EVENT_COLORS palette array (6 colors from Figma: purple, pink, orange, blue, green, teal) and assign color based on `events.length % palette.length`

## 6. Verify functionality

- [x] 6.1 Confirm clicking a day cell opens modal with that date pre-filled in start date
- [x] 6.2 Confirm clicking "+ Add New Event" opens modal with today's date
- [x] 6.3 Confirm saving an event with a date range shows a multi-day event bar on the grid
- [x] 6.4 Confirm new events appear in the sidebar event list
- [x] 6.5 Confirm modal closes on backdrop click, Cancel button, and successful save
- [x] 6.6 Confirm all modal text uses t() and renders correctly in en/jp/ko
- [x] 6.7 Confirm theme support across light/dark/forest
