## Context

The Calendar page is implemented with static mock events. The page shell (`index.tsx`) holds month/year state and passes `calendarEvents` (imported from `src/data/calendarEvents.ts`) directly to both `EventsSidebar` and `CalendarGrid`. Day cells are non-interactive divs. The "+ Add New Event" button has no onClick handler. This change adds click-to-create functionality with a modal form, storing events in local component state.

## Goals / Non-Goals

**Goals:**
- Users can click any date cell (including out-of-month days) to open an "Add Event" modal pre-filled with that date
- Users can click "+ Add New Event" button to open the same modal (pre-filled with today's date)
- The modal form supports: title, start date, end date (optional for multi-day events), location, organizer
- Created events appear immediately on both the calendar grid and sidebar
- Modal follows project styling (card appearance, theme-aware, i18n)
- Modal closes on backdrop click, X button, or successful save

**Non-Goals:**
- Event editing or deletion
- Validation beyond requiring a title
- Persisting events across page refreshes (local state only)
- Custom color picker (auto-assigned from palette)

## Decisions

### Decision 1: Modal as a sibling component in the Calendar page folder
**Choice**: Create `AddEventModal.tsx` co-located in `src/pages/Calendar/`. The Calendar page shell manages the modal open/close state and the pre-filled date.
**Rationale**: Keeps it co-located with the feature. The modal is Calendar-specific, not a shared component.

### Decision 2: Events stored in useState with initial mock data
**Choice**: The Calendar page shell holds `const [events, setEvents] = useState<CalendarEvent[]>(calendarEvents)`. New events are appended via `setEvents(prev => [...prev, newEvent])`.
**Rationale**: Simplest approach — no context, no external state. Mock events are the initial state, user events are added on top. Works for a no-API feature.

### Decision 3: Auto-assigned event colors from a palette
**Choice**: A predefined array of 6 event colors (matching the Figma palette: purple, pink, orange, blue, green, red). Each new event gets the next color in rotation (based on events array length % palette size).
**Rationale**: Avoids a color picker UI which is out of scope. Ensures visual variety. The palette reuses colors already seen in the Figma design.

### Decision 4: Native HTML date inputs for start/end date
**Choice**: Use `<input type="date" />` for start and end date fields. No custom date picker component.
**Rationale**: Native date inputs are accessible, theme-compatible, and require zero additional dependencies. They provide built-in calendar dropdowns on all modern browsers.

### Decision 5: Modal as a portal-free overlay
**Choice**: Render the modal as a fixed-position overlay directly within the Calendar page, not using React portals.
**Rationale**: The Calendar page is already within the DashboardLayout which has no overflow restrictions that would clip the modal. Portals add complexity without benefit here.

### Decision 6: Day cells clickable including out-of-month days
**Choice**: All 42 day cells are clickable, including out-of-month (striped) days. Clicking an out-of-month day opens the modal with that date.
**Rationale**: More intuitive — the date is visible, so it should be clickable. The modal shows the actual date regardless of which month view you're on.

## Risks / Trade-offs

- **[No persistence]** → Events are lost on page refresh. Mitigation: acceptable for current mock-data-only architecture; can add localStorage or API later.
- **[No edit/delete]** → Users can only create, not modify. Mitigation: keeps scope focused; edit/delete can be a follow-up change.
- **[Native date input styling]** → Native `<input type="date">` styling varies across browsers and may not perfectly match the design system. Mitigation: acceptable trade-off vs. building a custom date picker; the inputs inherit text/border colors from the form styling.
