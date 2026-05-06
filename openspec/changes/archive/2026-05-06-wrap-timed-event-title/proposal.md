## Why

Timed event blocks in Day and Week views render their title on a single truncated line, even when the block has plenty of vertical room. A two-hour event titled "The First Event" displays as "The First Even…" because `.timedEventTitle` declares `white-space: nowrap` + single-line `text-overflow: ellipsis`. Users lose readable title content in tall blocks for no layout reason — height is already determined by event duration, and the parent `.timedEventBlock` already clips overflow.

> Update note: An earlier iteration of this proposal chose option 1 (hard clip with no ellipsis indicator). After live verification, the lack of an ellipsis indicator on the truncated last line was confusing — users could not tell that text had been clipped vs. that the title genuinely ended there. Pivoting to option 2 (multi-line ellipsis with line-clamp count derived from each block's rendered height). Same intent (multi-line title), refined execution (ellipsis indicator).

## What Changes

- Allow titles to wrap across multiple lines inside the timed event block.
- When the wrapped title would exceed the block's rendered height, clip at the last fitting line and render a trailing ellipsis ("…") on that line as a clear "more text below" affordance.
- The number of visible lines per block is derived from the block's rendered height (which is itself derived from the event's duration), so a 30-minute block typically shows 1 line, a 1-hour block 3 lines, a 2-hour block 8 lines, and so on.
- Long single words (e.g., URLs, no-space strings) wrap rather than overflow horizontally.
- Out of scope: month-view event bars (`.eventBar`, intentionally single-line in a ~18px row), all-day event bars (`.allDayEventBar`, fixed 22px pinned row).

## Capabilities

### New Capabilities
<!-- None — extends existing day/week view capabilities and adds a small helper to existing calendarUtils. -->

### Modified Capabilities
- `calendar-day-view`: ADD a "Timed event block titles wrap with line-clamp ellipsis derived from block height" requirement. Existing "Day view renders timed events as proportional blocks" covers position/height/color only; title typography was previously unspecified.
- `calendar-week-view`: ADD the same requirement scoped to per-day timed event blocks in the week grid.

## Impact

- **Code**:
  - `src/pages/Calendar/Calendar.module.scss` — `.timedEventTitle` rule (switch from `display: block` + `white-space: nowrap` to `display: -webkit-box` + `-webkit-box-orient: vertical` + `text-overflow: ellipsis` + `word-break: break-word`; the `-webkit-line-clamp` value is supplied per-block via inline style).
  - `src/pages/Calendar/calendarUtils.ts` — new exported helper `calculateTitleLineClamp(heightPercent: number): number` that converts the percentage height returned by `calculateEventPosition` into a line count via the known SCSS constants (line-height 14.3px, vertical block padding 4px, grid min-height 1440px).
  - `src/pages/Calendar/WeekView.tsx` — call the helper for each timed event and pass the result via inline `style={{ WebkitLineClamp: maxLines }}` on the `.timedEventTitle` span.
  - `src/pages/Calendar/DayView.tsx` — same wiring as WeekView.
- **APIs / dependencies**: None.
- **Specs**: Two ADDED requirements (one per existing spec). No existing requirements modified or removed.
- **Tests**: Unit tests for `calculateTitleLineClamp` in `calendarUtils.test.ts` (pure JS, JSDOM-friendly). The visual ellipsis behavior itself remains JSDOM-unobservable — manual browser smoke per `tasks.md`.
- **Themes / i18n**: Unaffected — typography flow change identical across themes and locales.
- **Risk**: Low. Block height math is unchanged (`calculateEventPosition` is the source of truth and is not modified). The new helper consumes its existing output. CSS line-clamp + box-orient is broadly supported (Chrome/Safari/Firefox/Edge with `-webkit-` prefix; this codebase already targets evergreen browsers via Vite's default browserslist).
