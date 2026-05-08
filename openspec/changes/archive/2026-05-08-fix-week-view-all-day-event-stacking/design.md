## Context

The Week view's pinned all-day row currently positions each event with `position: absolute; left: <startCol/7 * 100%>; width: <span/7 * 100% - 4px>;` and never sets `top`. Inside `.weekAllDayGrid` (`min-height: 28px`), every bar lands at `top: 0`, so any two bars whose date ranges share a column paint on top of each other. Day view doesn't repro because its all-day container is a flex row with `flex-wrap: wrap` (`.allDayContent`); month view doesn't repro because its bars live in per-cell flex flow (`.eventBar`). Only Week view needs a fix because it's the only place where horizontal placement is fully driven by the event's date span — flex-wrap can't be reused.

The codebase already solves the conceptually identical problem for **timed** events via `groupOverlappingEvents` in `calendarUtils.ts` (assigns each event a column index within a horizontal cluster). The all-day variant is a transposed version of the same problem: assign each event a row index within a vertical stack, packed greedily so non-overlapping events share rows.

## Goals / Non-Goals

**Goals:**
- Stack overlapping all-day events into distinct rows in Week view so every event is visible.
- Keep n=1 rendering byte-identical to today (rowIdx=0 → top: 0).
- Keep the auto-scroll-to-current-time behavior unaffected when the all-day strip grows.
- Provide a pure, unit-testable helper that mirrors the existing `groupOverlappingEvents` pattern.

**Non-Goals:**
- No row cap, no "+N more" affordance — unbounded stacking. (If needed later, a separate change adds the cap and overflow UX.)
- No changes to Day view or Month view.
- No data-model or i18n changes.
- No restructuring of the Week view's grid into a CSS subgrid or table layout — keep the existing absolute-positioning model and only add the missing axis.

## Decisions

### Decision 1: Greedy row-packing (transpose of column-packing)

**Choice:** Sort all-day events by `startCol` (the event's first visible day-column index in the current week, already computed by the existing `allDaySpans` logic). Walk events in order; for each event, find the lowest-indexed row whose previous occupant's `endCol` is **strictly less than** the new event's `startCol`. Place it there. If no row fits, append a new row.

**Why this:**
- It's the same algorithm the existing `groupOverlappingEvents` uses, transposed from horizontal time-axis to vertical row-stacking. Pattern parity makes the helper trivial to read for anyone familiar with the existing code.
- Greedy is optimal for interval graph coloring on a single dimension (this case), so we never produce more rows than strictly necessary.

**Alternatives considered:**
- *Per-day vertical lanes (assign each day-column its own stack of N events).* Rejected: it would render the same multi-day event in different vertical positions on different days, which is visually wrong for a continuous bar.
- *CSS Grid with `grid-row` placement.* Rejected: `.weekAllDayGrid` is not a grid container and converting it would ripple into the column-header alignment, all-day-row borders, and the gutter layout. The pure-helper approach keeps the diff small and contained to vertical placement.

### Decision 2: Helper lives in `calendarUtils.ts` next to `groupOverlappingEvents`

**Choice:** New exported function `packAllDayRows(spans: { event: CalendarEvent; startCol: number; span: number }[]): { event: CalendarEvent; startCol: number; span: number; rowIdx: number }[]`. Returns a copy with `rowIdx` added per event. Pure, deterministic, no side effects.

**Why this:**
- Sibling to `groupOverlappingEvents` — same file, same shape (input array → annotated output array).
- Keeps `WeekView.tsx` declarative: it composes `allDaySpans` → `packAllDayRows` → render.
- Pure-function shape gives us cheap unit tests that don't need React Testing Library.

### Decision 3: Render with `top: rowIdx * 24px` using literals + binding comment

**Choice:** In `WeekView.tsx`, add `top: \`${rowIdx * 24}px\`` to each all-day bar's inline style. The 24 = 22 (bar height) + 2 (gap), both literals, with a comment in the helper file pointing to `.allDayEventBar { height: 22px; }` and `.allDayContent { gap: 2px; }` in `Calendar.module.scss`. Mirrors the existing `calculateTitleLineClamp` pattern, which is also a JS constant explicitly bound to SCSS values.

**Why this:**
- Introducing a CSS variable just for this is extra surface area for a localized fix.
- The binding comment makes the SCSS-JS coupling explicit and grep-able. If `.allDayEventBar`'s height ever changes, the next reader sees the comment and updates both sides.

**Alternatives considered:**
- *CSS custom property `--all-day-row-stride: 24px` exposed in `:root`.* Rejected — the value is structural (depends on bar geometry that itself is hard-coded), not a token candidate. Promote to a token in a separate change if it ends up being reused.

### Decision 4: Compute and apply `min-height` inline on `.weekAllDayGrid`

**Choice:** Compute `rowCount = max(rowIdx) + 1 || 1` in `WeekView.tsx`, then pass `style={{ minHeight: \`${rowCount * 24 + 4}px\` }}` to `.weekAllDayGrid` (or set CSS `--row-count` and consume in SCSS). The `+ 4` covers the existing 2px top + 2px bottom padding so the bottom row isn't visually clipped. Relax `.weekAllDayGrid`'s static `min-height: 28px` to e.g. `min-height: 24px` so the inline value can grow it (or remove the static one and rely on inline entirely — see Risks).

**Why this:**
- `.weekAllDayRow` is `display: flex; align-items: center;` so growing the inner `.weekAllDayGrid` naturally grows the row, which pushes the time grid below it down. Auto-scroll is structurally unaffected because it operates inside `timeGridScroll`, a sibling of the all-day row, not a child.

### Decision 5: Stable sort key

**Choice:** Sort spans by `(startCol asc, span desc, event.id asc)`. The `span desc` tiebreaker keeps wider (multi-day) bars on lower row indices when they tie on `startCol`, which is the reading-order most calendar UIs follow (longer events visually anchor the top). `event.id asc` is the final tiebreaker for determinism so test assertions don't depend on input order.

## Risks / Trade-offs

- **Risk:** A pathological week with many overlapping all-day events grows the strip indefinitely and pushes the time grid below the fold.
  → **Mitigation:** Document explicitly in the spec that stacking is unbounded. If users actually hit this, follow-up change adds a row cap + "+N more" affordance with a popover.

- **Risk:** Removing the static `min-height: 28px` could regress empty-week rendering (zero events → zero height → no row visible).
  → **Mitigation:** When `allDaySpans.length === 0`, `rowCount` clamps to `1` so the strip retains its single-row height and the "ALL DAY" label remains visible. Covered by an existing test (single-day all-day event renders).

- **Risk:** Adding `top` inline conflicts with any future hover/drag state that wants to animate vertical position.
  → **Mitigation:** None taken — inline `top` is the standard approach used throughout the codebase (timed events do the same with `top: \`${pos.top}%\``). If future drag is added, it'll override inline style anyway.

- **Trade-off:** Literals (22, 2, 24) instead of tokens. Caught by a clear binding comment + a `calendarUtils` test that asserts `top` values are 0, 24, 48 for a 3-row stack — if the literals drift out of sync with SCSS, the test fails fast.

## Migration Plan

No data migration. No backwards-compat shims. Drop-in fix:

1. Land `packAllDayRows` helper + tests.
2. Update `WeekView.tsx` to consume the helper and emit `top` + grid `minHeight`.
3. Adjust `Calendar.module.scss` `.weekAllDayGrid` if the static `min-height: 28px` interferes with the inline value (likely fine since `min-height` is a floor, not a cap).
4. Verify in browser across all three themes (light/dark/forest) at desktop viewports.

Rollback: revert the commit. n=1 case is byte-identical, so no data is at risk.
