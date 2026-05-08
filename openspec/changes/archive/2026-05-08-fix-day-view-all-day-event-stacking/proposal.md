## Why

Day view's pinned all-day row currently lays bars horizontally with `flex-wrap` (`.allDayContent`). When several all-day events fall on the displayed day, they sit side-by-side on a single line — visually inconsistent with Week view, which (per the just-archived `2026-05-08-fix-week-view-all-day-event-stacking`) now stacks overlapping all-day events into vertical rows. The user expects parity: every all-day event gets its own row, the strip grows with the count, and the time grid below shifts down accordingly.

## What Changes

- Replace Day view's `flex-wrap` all-day layout with vertical row-packing using the existing pure helper `packAllDayRows` from `src/pages/Calendar/calendarUtils.ts`. Each all-day event becomes a span with `startCol: 0, span: 1`; the algorithm degenerates to "one row per event" since every span ties on `startCol`.
- Render each all-day bar with `position: absolute` + `top: ${rowIdx * 24}px` (24px stride = `.allDayEventBar` 22px height + 2px gap, identical binding to Week view).
- Apply inline `minHeight: ${rowCount * 24 + 4}px` to the bar host so the strip grows with row count and the time grid below shifts down. The `+ 4` covers existing 2px top + 2px bottom padding so the bottom row isn't clipped. Clamp `rowCount` to 1 when zero events.
- Switch `.allDayContent` from `display: flex; flex-wrap: wrap; gap: 2px` to `position: relative` (drop the flex/wrap/gap). Bars become absolutely-positioned siblings.
- Keep `.allDayRow`'s outer-row `min-height: 40px` floor unchanged so the empty-state visual is byte-identical to today.
- Use a named `dayAllDaySpans` variable at the call site for parity with Week view's `allDaySpans` naming.
- Add unit tests for: multi-event vertical stacking (assert distinct `top` values), bar host inline `minHeight` reflects row count, single-event n=1 renders at `top: 0`.
- Add the parallel auto-scroll-preservation invariant requirement to the `calendar-day-view` spec, mirroring the Week-view ADDED requirement: growing the all-day strip SHALL NOT alter the time-grid's auto-scroll-to-current-time behavior.

Out of scope: helper-API changes (`packAllDayRows` is consumed unchanged), Week view (already done), Month view (non-repro — bars live in per-cell flex flow), data-model changes.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `calendar-day-view`: extend "Day view renders all-day events in a pinned row" with stacking and row-packing scenarios; add a new requirement locking the auto-scroll invariant against all-day-row growth.

## Impact

- Code: `src/pages/Calendar/DayView.tsx` (call `packAllDayRows`, switch all-day bar layout to absolute + inline `top` and bar-host `minHeight`); `src/pages/Calendar/Calendar.module.scss` (`.allDayContent` drops `flex-wrap`/`gap`, gains `position: relative`).
- Tests: `src/pages/Calendar/__tests__/DayView.test.tsx` (new multi-event stacking + minHeight scenarios).
- Specs: `openspec/specs/calendar-day-view/spec.md` (1 modified requirement + 1 added requirement after sync).
- No new dependencies. No external code. No API changes. No data-model changes.
- No breaking changes — n=1 all-day event renders at `top: 0px` and bar-host `minHeight: 28px` (still under the outer-row 40px floor, so visually identical to today for the common single-event case).
