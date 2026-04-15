## 1. Paginated Event List

- [x] 1.1 Add `visibleCount` state (default 4) to EventsSidebar; slice events to `events.slice(0, visibleCount)`; "See More" onClick increments by 4; hide "See More" when `visibleCount >= events.length`
- [x] 1.2 Add `items-start` to the two-column flex container in `src/pages/Calendar/index.tsx` so sidebar and calendar heights are independent
