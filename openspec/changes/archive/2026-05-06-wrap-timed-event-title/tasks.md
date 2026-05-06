## 1. Helper function in `calendarUtils.ts`

- [x] 1.1 In `src/pages/Calendar/calendarUtils.ts`, add three module-level constants tied to the SCSS source of truth: `TITLE_LINE_HEIGHT_PX = 14.3` (11px font-size × 1.3 line-height in `.timedEventTitle`), `BLOCK_VERTICAL_PADDING_PX = 4` (2px top + 2px bottom on `.timedEventBlock`), and `GRID_HEIGHT_PX = 1440` (matches `.weekTimeGrid` / `.timeGrid` `min-height: calc(24 * 60px)`). Include a single comment naming the SCSS selectors so a future change to those styles has a clear pointer to update both sides.
- [x] 1.2 Add an exported function `calculateTitleLineClamp(heightPercent: number): number` that returns `Math.max(1, Math.floor(((heightPercent / 100) * GRID_HEIGHT_PX - BLOCK_VERTICAL_PADDING_PX) / TITLE_LINE_HEIGHT_PX))`. Express the inner math via clear intermediate variables (`blockHeightPx`, `innerHeightPx`) — readability over one-liner density.

## 2. Helper unit tests

- [x] 2.1 In `src/pages/Calendar/__tests__/calendarUtils.test.ts`, add a `describe('calculateTitleLineClamp', ...)` block.
- [x] 2.2 Test: `calculateTitleLineClamp(2.083)` (30-minute minimum block ≈ 30px tall) returns `1`.
- [x] 2.3 Test: `calculateTitleLineClamp(4.166)` (60-minute block ≈ 60px tall) returns `3` (`(60 - 4) / 14.3 = 3.916` → floor = 3).
- [x] 2.4 Test: `calculateTitleLineClamp(8.333)` (120-minute block ≈ 120px tall) returns `8` (`(120 - 4) / 14.3 = 8.111` → floor = 8).
- [x] 2.5 Test: `calculateTitleLineClamp(0)` returns `1` (the `Math.max(1, …)` guard).
- [x] 2.6 Test: `calculateTitleLineClamp(100)` (full-day 1440px block) returns `100` (`(1440 - 4) / 14.3 = 100.4` → floor = 100).

## 3. CSS rule update

- [x] 3.1 In `src/pages/Calendar/Calendar.module.scss`, edit the `.timedEventTitle` rule. Final state: `font-size: 11px; font-weight: 600; line-height: 1.3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word;`. Concretely vs. the current implementation: change `display: block` → `display: -webkit-box`, add `-webkit-box-orient: vertical`, add back `text-overflow: ellipsis`, keep `word-break: break-word`. Do NOT add a `-webkit-line-clamp` value here — it is supplied per block via inline style.

## 4. Wire helper into WeekView and DayView

- [x] 4.1 In `src/pages/Calendar/WeekView.tsx`, import `calculateTitleLineClamp` from `./calendarUtils`. Inside the `grouped.map(({ event, column, totalColumns }) => ...)` block (around line 296), compute `const maxLines = calculateTitleLineClamp(pos.height);` (after the existing `const pos = calculateEventPosition(event, dayStart);` call). On the `<span className={styles.timedEventTitle}>` element, add `style={{ WebkitLineClamp: maxLines }}`.
- [x] 4.2 In `src/pages/Calendar/DayView.tsx`, repeat the same wiring: import `calculateTitleLineClamp`, compute `maxLines` from `pos.height` inside the `groupedTimedEvents.map(...)` block (around line 178), and pass `style={{ WebkitLineClamp: maxLines }}` to the `<span className={styles.timedEventTitle}>` element.

## 5. Verification

- [x] 5.1 Run `yarn test src/pages/Calendar` — new helper tests pass; existing Calendar tests still pass.
- [x] 5.2 Run `yarn lint` — no new warnings.
- [x] 5.3 Run `yarn build` — TypeScript compile + Vite build succeed.
- [x] 5.4 In the running dev server (http://localhost:5174/), switch to Day view; create or pick a tall multi-hour event with a long title and confirm the title wraps across multiple lines and (if it overflows) the last visible line ends with "…".
- [x] 5.5 In Day view, confirm a 30-minute event with a long title shows exactly 1 line ending with "…".
- [x] 5.6 In Day view, confirm a 1-hour event with a long title shows up to 3 lines, last line ending with "…" if the title overflows.
- [x] 5.7 Switch to Week view; confirm the same height-derived clamp + ellipsis behavior in any day column.
- [x] 5.8 In Week view, confirm overlapping events (two events at the same hour rendered side-by-side at half-width each) still wrap their titles to fit the narrower column with ellipsis on the last visible line when truncated.
- [x] 5.9 Confirm Month view event bars (`.eventBar`) and all-day event bars (`.allDayEventBar` in both Day and Week views) still render single-line with their existing single-line ellipsis — they were intentionally left untouched.
- [x] 5.10 Visual smoke check across all three themes (light, dark, forest) — no visual regression.
