## 1. Helper: row-packing utility

- [x] 1.1 Add `packAllDayRows(spans)` to `src/pages/Calendar/calendarUtils.ts`. Input: `{ event: CalendarEvent; startCol: number; span: number }[]`. Output: same array shape with an added `rowIdx: number` per item. Sort key: `(startCol asc, span desc, event.id asc)`. Greedy placement: walk sorted input; for each, place in lowest-indexed row whose previous occupant's `endCol` (= startCol + span - 1) is strictly less than the new event's `startCol`; new row when none fits. Pure, no side effects.
- [x] 1.2 Add a binding comment above the helper that names the SCSS values it depends on (`.allDayEventBar { height: 22px }` + `.allDayContent { gap: 2px }` → stride = 24px), mirroring the `calculateTitleLineClamp` pattern.

## 2. WeekView wiring

- [x] 2.1 In `src/pages/Calendar/WeekView.tsx`, after computing `allDaySpans`, pipe through `packAllDayRows` to get spans annotated with `rowIdx`.
- [x] 2.2 Compute `rowCount = (allDaySpans with rowIdx).reduce((max, s) => Math.max(max, s.rowIdx), -1) + 1 || 1` (clamps to 1 when there are zero events).
- [x] 2.3 Apply `style={{ minHeight: \`${rowCount * 24 + 4}px\` }}` to the `.weekAllDayGrid` div (the `+ 4` accounts for the existing 2px top + 2px bottom padding so the bottom row isn't visually clipped).
- [x] 2.4 Add `top: \`${rowIdx * 24}px\`` to each all-day bar's existing inline `style` object. Keep `position: absolute`, `left`, `width`, color, and click handler exactly as today.

## 3. SCSS adjustment

- [x] 3.1 In `src/pages/Calendar/Calendar.module.scss`, relax `.weekAllDayGrid`'s `min-height: 28px` so the inline value from WeekView always wins. Either drop the rule entirely or set it to `min-height: 24px` so it remains a floor for empty weeks before inline takes effect.

## 4. Tests

- [x] 4.1 In `src/pages/Calendar/__tests__/calendarUtils.test.ts`, add a `packAllDayRows` describe block covering: empty input, single event (rowIdx 0), two non-overlapping events sharing row 0, two overlapping events on rows 0/1, multi-day spans (e.g. Mon-Wed + Tue-only conflict), chain forcing 3+ rows, and stable order under a sort tiebreaker (same `startCol`, longer `span` lands on lower rowIdx).
- [x] 4.2 In `src/pages/Calendar/__tests__/WeekView.test.tsx`, add a "multiple all-day events overlapping in date" test inside the existing `describe('all-day events', ...)` block. Render two all-day events both on Friday, assert both are in the DOM, and assert their `style.top` values are distinct (one `0px`, one `24px`). Add a second case asserting `.weekAllDayGrid`'s inline `minHeight` reflects the row count.

## 5. Manual verification

- [x] 5.1 Run `yarn dev`, navigate to `/calendar`, switch to Week view, create three all-day events all landing on the same Friday, and verify they stack into three visible rows with no overlap. Verify the time grid below shifts down by the additional rows' height.
- [x] 5.2 Toggle through light, dark, and forest themes. Confirm the stacked all-day bars retain correct contrast and dividers.
- [x] 5.3 Confirm auto-scroll-to-current-time still lands at "now − 2 hours" on the current week regardless of how many all-day rows are stacked.

## 6. Lint and types

- [x] 6.1 `yarn lint` clean.
- [x] 6.2 `yarn build` (TypeScript compile) clean.
- [x] 6.3 `yarn test` — full suite passes, including the new `packAllDayRows` and overlapping-all-day test cases.
