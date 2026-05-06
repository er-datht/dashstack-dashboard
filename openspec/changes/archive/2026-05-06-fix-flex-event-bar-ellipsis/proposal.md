## Why

Long event titles in two calendar event-bar variants are hard-clipped at the right edge of the bar with no "…" indicator, even though both rules declare `text-overflow: ellipsis`. User report: "The First Event The Firs" appears clipped in the month-view event bar with no ellipsis. The cause is identical in both rules: `.eventBar` and `.allDayEventBar` are declared as flex containers (`display: flex; align-items: center`) with the title text as a **direct text-node child** of the flex container — and CSS does not apply `text-overflow: ellipsis` to direct text inside a flex container. The text overflows, gets clipped by `overflow: hidden`, and the ellipsis indicator is silently suppressed.

## What Changes

- `.eventBar` (month-view event bar in `CalendarGrid.tsx:217`): switch from `display: flex; align-items: center` to `display: block; line-height: 18px;`. The existing `text-overflow: ellipsis` then applies to the direct text node and renders "…" at the right edge.
- `.allDayEventBar` (all-day pinned row in both Day view and Week view): same fix with `line-height: 22px` to match its existing `height: 22px`. Additionally, add `min-width: 0; max-width: 100%;` to defeat the `min-width: auto` default that, in Day view's flex parent (`.allDayContent { display: flex; flex-wrap: wrap }`), expands the bar to its full intrinsic content width and prevents `text-overflow: ellipsis` from ever triggering. (Week view is unaffected by this addition because `.allDayEventBar` is rendered with `position: absolute` and an explicit inline `width` there — flex constraints don't apply.)
- `.allDayContent` (Day view's wrapper around all-day bars): add `min-width: 0;` so it can shrink below its content's intrinsic width inside its parent flex row (`.allDayRow`). Without this, `.allDayContent`'s default `min-width: auto` resolves to its child bar's intrinsic min-content (the full nowrap text width), expanding `.allDayContent` beyond the available row width. The leaf-level `max-width: 100%` on `.allDayEventBar` then resolves against an already-oversized parent, so `text-overflow: ellipsis` still never triggers. The standard recipe for "make a flex descendant support text-overflow: ellipsis" is to apply `min-width: 0` at every flex ancestor up to the constraining width — this completes the chain.
- Behavior preserved exactly: single-line layout, vertical centering of text inside the bar (line-height = height is the standard CSS idiom for single-line vertical centering), all coloring, click handling, hover, and theme adaptation are unchanged.
- Out of scope: `.timedEventBlock` / `.timedEventTitle` (multi-line behavior, already correct under `wrap-timed-event-title`); `.eventCard`, `.popoverEventTitle`, or any other text rendering outside these two specific bars.

## Capabilities

### New Capabilities
- `calendar-month-view`: gives the month-view grid (`CalendarGrid.tsx`) its own dedicated capability spec for the first time. Month-view behavior was specified once in the archived `2026-04-14-calendar-page` proposal but never split into a standalone capability. The new spec contains a single requirement covering month-view event-bar typography (single-line truncation with ellipsis indicator). Future month-view requirements (cell layout, today highlight, out-of-month dimming, multi-day spanning) can be added here over time.

### Modified Capabilities
- `calendar-day-view`: ADD a "All-day event bar truncates with ellipsis" typography invariant to the existing all-day-row capability. The current "Day view renders all-day events in a pinned row" requirement covers presence/positioning but not title overflow.
- `calendar-week-view`: ADD the same all-day-bar invariant. Existing week-view all-day-row requirements cover positioning, multi-day spanning, and clipping to week boundaries — none cover title overflow on a single day's bar.

## Impact

- **Code**: `src/pages/Calendar/Calendar.module.scss` only — two rules, four declaration changes total (remove `display: flex; align-items: center` from each; add `line-height: <height>px` to each).
- **APIs / dependencies**: None.
- **JSX / TSX**: None — `CalendarGrid.tsx`, `DayView.tsx`, and `WeekView.tsx` are not touched.
- **Specs**: One NEW capability (`calendar-month-view`) and two ADDED requirements (in `calendar-day-view` and `calendar-week-view`).
- **Themes / i18n**: Unaffected — typography flow change identical across themes and locales.
- **Tests**: None added. JSDOM does not enforce `text-overflow`, `white-space`, or `line-height`-driven vertical centering, so unit tests cannot meaningfully assert this behavior. Verification is browser-side per `tasks.md`.
- **Risk**: Low. The flex-to-block swap with explicit `line-height: <height>px` is the standard CSS idiom for single-line vertically-centered text in a fixed-height container. Padding (`.eventBar` has `padding-left: 8px`; `.allDayEventBar` has `padding: 0 8px`) and borders work identically under both layout modes. The only observable change should be the ellipsis appearing on truncated titles.
