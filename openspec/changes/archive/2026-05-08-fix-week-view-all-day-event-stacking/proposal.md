## Why

In the calendar Week view, when two or more all-day events share any visible date in the displayed week, they paint on top of each other in a single horizontal strip and become unreadable. The existing `calendar-week-view` spec covers single-day, multi-day-spanning, and week-boundary clipping for the pinned all-day row, but says nothing about how multiple bars should stack vertically when they overlap by date — so the behavior was never specified, never tested, and silently regressed. Day view (flex-wrap) and month view (per-cell flex flow) both stack correctly; only Week view is broken.

## What Changes

- Add greedy row-packing for all-day events in Week view's pinned all-day row: events sorted by `startCol`, each placed in the lowest-indexed row whose previous occupant's `endCol` is strictly less than the new event's `startCol`; new row when none fits. **Unbounded** — no row cap, no "+N more" affordance.
- Render each all-day bar with a computed vertical offset (`top: rowIdx * 24px`, where 22px is the bar height and 2px is the inter-row gap, matching the existing `.allDayEventBar` height and `.allDayContent` gap).
- Grow `.weekAllDayGrid`'s effective height with the row count so the time grid below shifts down rather than getting clipped by a fixed `min-height`.
- Lock an explicit invariant in the spec: growing the all-day strip SHALL NOT alter the time-grid's auto-scroll-to-current-time behavior.
- Add a new pure helper `packAllDayRows` in `src/pages/Calendar/calendarUtils.ts`, sibling to `groupOverlappingEvents`. Pure, unit-testable.
- Add unit tests for `packAllDayRows` (empty list, single event, two non-overlapping sharing a row, two overlapping on different rows, multi-day spans, chain forcing 3+ rows) and a Week view rendering test asserting that 2+ all-day events sharing dates render with distinct `top` values and that the all-day grid's effective height reflects row count.

Out of scope: month view (verified non-repro — `.eventBar` lives in per-cell flex flow, not absolute positioning). Day view (already correct via flex-wrap). No data-model changes — multiple all-day events per day remain supported.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `calendar-week-view`: extend the existing "Week view renders all-day events in a pinned row" requirement with stacking and row-packing behavior; add a new requirement locking the auto-scroll invariant against all-day-row growth.

## Impact

- Code: `src/pages/Calendar/WeekView.tsx` (replace single-axis positioning with row-packed positioning), `src/pages/Calendar/calendarUtils.ts` (add `packAllDayRows`), `src/pages/Calendar/Calendar.module.scss` (relax `.weekAllDayGrid` `min-height` so it can grow with inline style or computed height).
- Tests: `src/pages/Calendar/__tests__/WeekView.test.tsx` (new multi-overlap scenario), `src/pages/Calendar/__tests__/calendarUtils.test.ts` (new `packAllDayRows` suite).
- No new dependencies. No external code. No API changes. No data-model changes.
- No breaking changes — existing single/multi-day all-day rendering remains identical for the n=1 case (rowIdx=0 → top:0).
