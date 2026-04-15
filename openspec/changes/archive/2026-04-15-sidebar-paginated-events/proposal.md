## Why

The EventsSidebar currently renders all events at once, causing the sidebar to grow unbounded and stretch the calendar section height alongside it. With 10 events from the Day/Week views change, the sidebar is too tall. The "See More" button exists but does nothing.

## What Changes

- Show only 4 events initially in the sidebar event list
- Clicking "See More" reveals 4 more events incrementally (4 → 8 → 12 → ...)
- Hide "See More" button when all events are visible
- The calendar grid section height is independent of sidebar height — sidebar overflow does not stretch the calendar card

## Capabilities

### New Capabilities
- `sidebar-paginated-events`: Paginated event list with incremental "See More" loading and layout independence from calendar grid

### Modified Capabilities
(none)

## Impact

- **Code**: `src/pages/Calendar/EventsSidebar.tsx` — add `visibleCount` state, slice events, wire "See More" onClick
- **Layout**: `src/pages/Calendar/index.tsx` — ensure two-column flex layout uses `items-start` or fixed height so columns don't stretch together
- **No new dependencies**
