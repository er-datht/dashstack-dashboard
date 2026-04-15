## Context

EventsSidebar renders all events in a flat list. The two-column layout in index.tsx uses `flex gap-[30px]` with the sidebar as `w-[284px] shrink-0` and the calendar card as `flex-1`. Currently both columns stretch to the height of the taller one (default `align-items: stretch` in flexbox).

## Goals / Non-Goals

**Goals:**
- Paginate events 4 at a time with "See More" as the trigger
- Calendar grid height stays constant regardless of sidebar content

**Non-Goals:**
- Collapsing events back (no "Show Less" button)
- Sorting or filtering the event list

## Decisions

### 1. `visibleCount` state with PAGE_SIZE = 4

**Choice**: Add `useState(4)` for `visibleCount` in EventsSidebar. Render `events.slice(0, visibleCount)`. "See More" increments by 4. Hide button when `visibleCount >= events.length`.

**Why**: Simplest approach — no external state needed, fully self-contained in the sidebar component.

### 2. `items-start` on the two-column flex container

**Choice**: Add `items-start` to the flex container in index.tsx so each column sizes independently.

**Why**: Default flexbox `align-items: stretch` makes both columns match the taller one's height. `items-start` lets the sidebar be shorter without affecting the calendar card height, and the calendar card keeps its natural height.

## Risks / Trade-offs

- **[Event count resets on re-render]** If parent re-renders (e.g., adding/deleting events), `visibleCount` resets to 4 → Acceptable since `useState` persists across parent re-renders; only unmount/remount resets it.
