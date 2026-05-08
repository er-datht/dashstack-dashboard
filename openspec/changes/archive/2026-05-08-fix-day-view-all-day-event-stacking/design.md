## Context

Day view's pinned all-day row currently uses `.allDayContent` as a `display: flex; flex-wrap: wrap; gap: 2px` container, so all-day bars sit horizontally side-by-side and only wrap to a second line when the row's width is exceeded. After the just-archived `2026-05-08-fix-week-view-all-day-event-stacking`, Week view stacks overlapping all-day events into vertical rows via the pure helper `packAllDayRows` in `src/pages/Calendar/calendarUtils.ts` (greedy row-packing, transposed `groupOverlappingEvents`). Day view is the last view that doesn't follow the new pattern.

The `.allDayEventBar` class is **shared** between Day view and Week view (`Calendar.module.scss` lines ~488-539): height 22px, line-height 22px, ellipsis truncation, color borders/bg/text. Week view consumes it as an absolutely-positioned child; Day view consumes it via flex flow. Switching Day view to absolute positioning matches Week view's idiom and avoids any class-level changes.

For Day view there is exactly one column. Every all-day event maps to a span with `startCol: 0, span: 1`, so when piped through `packAllDayRows` the algorithm degenerates to "every event takes the next free row" — output is `rowIdx = 0, 1, 2, …` ordered by `event.id asc` (the third sort tiebreaker, since `startCol` and `span` always tie in Day view).

## Goals / Non-Goals

**Goals:**
- Stack all-day events vertically in Day view, one bar per row, matching Week view's visual idiom and stride.
- Reuse `packAllDayRows` unchanged so the algorithm, sort key, and binding constants stay in lockstep across views.
- Keep n=1 rendering visually identical to today (rowIdx=0 → `top: 0px`; bar host minHeight 28px stays under the outer-row 40px floor).
- Add a Day-view auto-scroll-preservation invariant requirement, mirroring Week view's ADDED requirement, so future changes can't regress the current-time auto-scroll when the strip grows.

**Non-Goals:**
- No changes to `packAllDayRows` (consumed unchanged).
- No changes to Week view (already shipped) or Month view (non-repro — bars in per-cell flex flow).
- No data-model or i18n changes.
- No changes to the `.allDayEventBar` shared class or to how `.allDayRow` (the outer wrapper) renders.
- No new CSS modifier classes — the inline `position: relative` change is scoped to `.allDayContent` (currently used only here per grep).

## Decisions

### Decision 1: Reuse `packAllDayRows` with `startCol: 0, span: 1` per event

**Choice:** In `DayView.tsx`, after filtering all-day events, build `dayAllDaySpans = allDayEvents.map((event) => ({ event, startCol: 0, span: 1 }))` and pipe through `packAllDayRows`. The resulting `rowIdx` per event drives the inline `top` value at the render site.

**Why this:**
- The helper is already pure, deterministic, and unit-tested. No second implementation to maintain.
- For Day view, every event ties on `startCol` (= 0) and `span` (= 1), so the algorithm reduces to a stable index by `event.id asc` — same determinism guarantee Week view enjoys.
- The 24px stride and `+ 4` padding constants stay tied to the same SCSS values (`.allDayEventBar` 22px height + 2px gap + `.allDayContent` 2px top + 2px bottom padding), so any future SCSS change is a single-site update at the helper's binding comment.

**Alternatives considered:**
- *CSS-only fix: change `.allDayContent` from `flex-direction: row` to `flex-direction: column`.* Rejected — works visually but diverges Day view's idiom from Week view's (Week uses absolute positioning), and the same code path stops being a single source of truth for "how do all-day bars stack." Code parity is the asked-for outcome.
- *Day-specific helper `packAllDayRowsForSingleColumn(events)`.* Rejected — adds a second helper for the degenerate case of the existing one. The transform line `events.map(e => ({ event: e, startCol: 0, span: 1 }))` is one line at the call site.

### Decision 2: Switch `.allDayContent` from flex-wrap to relative positioning

**Choice:** Modify `.allDayContent` in `Calendar.module.scss`: drop `display: flex`, `flex-wrap: wrap`, `gap`, and any horizontal `align-items`. Add `position: relative` so absolutely-positioned bars can use it as the containing block. Padding stays the same (2px top + 2px bottom contribute to the `+ 4` in the `minHeight` math).

**Why this:**
- `.allDayContent` is only used by Day view (verified by grep). Modifying it in place is the minimum-diff path.
- Adding a parallel class (`.dayAllDayGrid`) would orphan the existing class name and add SCSS surface area for no reuse benefit.

**Alternatives considered:**
- *Introduce a parallel `.dayAllDayGrid` class mirroring `.weekAllDayGrid`.* Rejected — duplicates the SCSS rule for no caller-site savings; the existing class is the only place that needs to change.

### Decision 3: Render with `top: rowIdx * 24px` + inline `minHeight: rowCount * 24 + 4` on `.allDayContent`

**Choice:** In `DayView.tsx`, on each bar add `top: \`${rowIdx * 24}px\`` to its existing inline `style` object, plus `position: absolute`. On the `.allDayContent` div add `style={{ minHeight: \`${rowCount * 24 + 4}px\` }}`. `rowCount = packed.reduce((max, s) => Math.max(max, s.rowIdx), -1) + 1 || 1` (clamps to 1 when zero events, identical to Week view).

**Why this:**
- Mirrors Week view's idiom exactly. The 24px stride literal is documented at the helper's SCSS-binding comment in `calendarUtils.ts`.
- The `+ 4` covers `.allDayContent`'s 2px top + 2px bottom padding so the bottom row isn't clipped — same arithmetic Week view uses.
- The outer `.allDayRow`'s 40px `min-height` floor is unchanged, so the empty state and the n=1 case (which would compute 28px) both visually fall under the 40px floor — empty/single-event rendering is visually identical to today (the bar's y-offset within the row may shift by a few pixels because absolute `top: 0` anchors to the content box's top edge instead of the prior flex-flow centerline, indistinguishable in practice).

**Alternatives considered:**
- *Set `minHeight` on `.allDayRow` (the outer row) instead of `.allDayContent`.* Rejected — the outer row controls vertical centering of the gutter label and the strip together; growing the inner content is the right axis. Week view uses the same split (`.weekAllDayRow` flex + `.weekAllDayGrid` is the host that gets inline `minHeight`).

### Decision 4: Mirror Week view's auto-scroll-preservation invariant requirement

**Choice:** Add a new requirement to the `calendar-day-view` spec: "Growing the all-day strip preserves time-grid auto-scroll behavior." Two scenarios — single-row strip and multi-row strip — both asserting the time grid still auto-scrolls so the current hour minus two hours is near the top.

**Why this:**
- Day view's auto-scroll runs against `[data-hour]` elements inside `timeGridScroll`, a sibling of `.allDayRow`. Growing the strip shifts the scroll container down on the page but doesn't change scroll-target offsets within it. The invariant is structurally true today; locking it in the spec prevents regressions in future Day-view changes.
- Symmetry with Week view's archive (`calendar-week-view` lines 123-133). Spec language can be reused near-verbatim.

## Risks / Trade-offs

- **Risk:** A pathological day with many overlapping all-day events grows the strip indefinitely and pushes the time grid below the fold.
  → **Mitigation:** Document explicitly in the spec that stacking is unbounded (matches Week view's archived decision). If users hit this in practice, a separate change adds a row cap + "+N more" affordance with a popover for both Day and Week views.

- **Risk:** Removing `flex-wrap` changes the empty-state DOM (no flex container) — could ripple into a snapshot test or a future visual regression check.
  → **Mitigation:** Snapshot tests of `.allDayContent` would be sensitive to this; the existing `DayView.test.tsx` queries by event presence + textContent, not structure. The empty-state floor (`.allDayRow` 40px) is unchanged, so the rendered row height is identical.

- **Risk:** Adding `top` inline conflicts with any future hover/drag state that wants to animate vertical position.
  → **Mitigation:** None taken — inline `top` is the standard approach used throughout the codebase (timed events do the same, Week view does the same). Future drag would override inline style anyway.

- **Trade-off:** Repeats the literal `24` and `+ 4` in DayView.tsx (Week view also has them). Caught by the helper's SCSS-binding comment + a new DayView test asserting `top` values are 0/24/48 for a 3-row stack — if the constants drift between Day and Week, both tests fail.

## Migration Plan

No data migration. No backwards-compat shims.

1. Land DayView wiring (call `packAllDayRows`, set `top` per bar, set `minHeight` on `.allDayContent`).
2. Adjust `.allDayContent` SCSS (drop `flex-wrap`/`gap`, add `position: relative`).
3. Land tests for multi-event stacking + minHeight reflection.
4. Verify in browser across all three themes (light/dark/forest) at desktop viewports.

Rollback: revert the commit. Empty-state and n=1 cases are visually identical, so no data is at risk.
