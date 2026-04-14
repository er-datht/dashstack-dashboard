## 1. Add popover SCSS styles

- [x] 1.1 Add popover styles to `Calendar.module.scss`: `.popoverContainer` (absolute, z-30, w-[277px]), `.popoverCard` (bg white/surface, rounded-lg, p-4, shadow-lg, overflow hidden), `.popoverArrow` (::before pseudo-element, rotated 45deg white square on the left edge), `.popoverImage` (w-full, h-[155px], rounded-md, bg-[#ffe2e6]), `.popoverDivider` (h-px, w-full, bg border color), `.popoverActions` (absolute top-right, flex gap-2)
- [x] 1.2 Add theme support for popover: dark/forest themes should use `var(--color-surface)` for card bg, `var(--color-text-primary)` for title, `var(--color-text-secondary)`/`var(--color-text-tertiary)` for secondary text

## 2. Create EventDetailPopover component

- [x] 2.1 Create `src/pages/Calendar/EventDetailPopover.tsx` with props: `event: CalendarEvent`, `position: { top: number; left: number }`, `onClose: () => void`, `onEdit: (event: CalendarEvent) => void`, `onDelete: (id: string) => void`
- [x] 2.2 Implement popover layout matching Figma: event image placeholder (pink bg, 155px), title (bold 16px), organizer (medium 14px), date (12px), location (12px), divider, attendee avatars row with overflow badge
- [x] 2.3 Add edit (Pencil from lucide-react) and delete (Trash2 from lucide-react) icon buttons in top-right corner of the card, above the image
- [x] 2.4 Wire edit icon to call `onEdit(event)`, delete icon to call `onDelete(event.id)` with `window.confirm`
- [x] 2.5 Add click-outside detection: useEffect with mousedown listener on document, close if click target is outside popover ref
- [x] 2.6 Add Escape key listener to close popover
- [x] 2.7 Use locale-aware date formatting (same `LOCALE_MAP` pattern as EventsSidebar)

## 3. Wire popover into CalendarGrid

- [x] 3.1 Update CalendarGrid's `onEventClick` to pass click position: change type to `onEventClick?: (event: CalendarEvent, position: { top: number; left: number }) => void`
- [x] 3.2 In event bar onClick, calculate position from the event bar element's bounding rect relative to the grid container, pass to onEventClick
- [x] 3.3 Add `popoverEvent`, `popoverPosition`, and `onPopoverClose`, `onPopoverEdit`, `onPopoverDelete` props to CalendarGrid (or render the popover from the page shell)

## 4. Wire popover state in Calendar page shell

- [x] 4.1 Add `popoverEvent: CalendarEvent | null` and `popoverPosition: { top: number; left: number } | null` state
- [x] 4.2 Update handleEventClick (from grid) to set popoverEvent and popoverPosition instead of opening the modal directly
- [x] 4.3 Create `handlePopoverEdit(event)` — closes popover, sets editingEvent, opens modal
- [x] 4.4 Create `handlePopoverDelete(id)` — closes popover, deletes event from state
- [x] 4.5 Create `handlePopoverClose()` — clears popoverEvent and popoverPosition
- [x] 4.6 Keep sidebar `onEventClick` going directly to edit modal (no popover for sidebar)
- [x] 4.7 Render EventDetailPopover conditionally when popoverEvent is set, pass all handlers

## 5. Verify functionality

- [x] 5.1 Confirm clicking an event bar shows popover positioned near the bar with correct event details
- [x] 5.2 Confirm clicking edit icon in popover closes popover and opens edit modal pre-filled
- [x] 5.3 Confirm clicking delete icon in popover shows confirmation and removes event
- [x] 5.4 Confirm clicking outside popover closes it
- [x] 5.5 Confirm Escape key closes popover
- [x] 5.6 Confirm sidebar event click still opens edit modal directly (no popover)
- [x] 5.7 Confirm theme support across light/dark/forest
- [x] 5.8 Confirm event bar click does NOT trigger day cell click (stopPropagation preserved)
