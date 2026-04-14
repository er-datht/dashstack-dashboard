## Context

The Calendar page already has event bars on the grid that are clickable (with `onEventClick` and `stopPropagation`), an AddEventModal with edit/delete support (`editEvent`, `onDelete` props), and sidebar event items that are clickable. Currently, clicking an event bar or sidebar item opens the full edit modal directly. The Figma design shows an intermediate step: a detail popover card that appears next to the clicked event, showing event details with edit/delete action icons.

## Goals / Non-Goals

**Goals:**
- Clicking an event bar on the calendar grid opens a detail popover positioned near the bar
- Popover shows: event image placeholder (pink/salmon bg), title, organizer, date, location, divider, attendee avatars
- Popover has edit (pencil) and delete (trash) icon buttons in the top-right
- Edit icon closes popover and opens AddEventModal in edit mode
- Delete icon removes the event with confirmation
- Popover closes on click outside or Escape key
- Sidebar event items open the edit modal directly (no popover needed since sidebar already shows all details)

**Non-Goals:**
- Real event images (placeholder only)
- Popover for sidebar items (they go directly to edit modal)
- Animated popover transitions

## Decisions

### Decision 1: Popover as a new component, not extending AddEventModal
**Choice**: Create `EventDetailPopover.tsx` as a separate component. It's a read-only detail view with action icons, fundamentally different from the form-based modal.
**Rationale**: The popover is a display component with no form state. Cramming it into AddEventModal would make that component overly complex. Separation of concerns.

### Decision 2: Popover positioning via absolute positioning relative to calendar grid
**Choice**: The popover is rendered inside the CalendarGrid container with absolute positioning. The event bar click passes coordinates (via `getBoundingClientRect`) to position the popover near the clicked bar.
**Rationale**: Absolute positioning within the grid container avoids portal complexity. The grid has `overflow: hidden` on the outer card but `overflow: visible` can be set on the inner grid area.

### Decision 3: Popover state managed in Calendar page shell
**Choice**: Calendar page shell holds `popoverEvent: CalendarEvent | null` and `popoverPosition: { top: number; left: number } | null`. CalendarGrid receives these and renders the popover.
**Rationale**: Keeps state centralized. The page shell orchestrates: event bar click → show popover, popover edit → close popover + open modal, popover delete → confirm + remove event.

### Decision 4: Arrow/caret using CSS rotated square
**Choice**: The Figma design shows a left-pointing arrow made from a rotated white square. Implement with a `::before` pseudo-element on the popover card — rotated 45deg, positioned on the left edge.
**Rationale**: Pure CSS, no extra DOM elements, matches Figma exactly.

### Decision 5: Event image placeholder with pink/salmon background
**Choice**: Use a static colored div (bg matching Figma's `#ffe2e6`) as the event image placeholder, 155px tall with rounded corners.
**Rationale**: Matches Figma exactly. No real images exist in the mock data.

## Risks / Trade-offs

- **[Popover overflow]** → The popover may overflow the calendar grid boundaries if the event is near the edge. Mitigation: position the popover to the right of the event bar by default; if near the right edge, can adjust in a follow-up.
- **[No animation]** → Popover appears/disappears instantly. Mitigation: acceptable for MVP; CSS transition can be added later.
- **[Click-outside detection]** → Uses a mousedown listener on document to detect clicks outside the popover. Mitigation: standard pattern, works well with the existing modal backdrop approach.
