## Context

`.timedEventTitle` is a `<span>` rendered inside each `.timedEventBlock` in `WeekView.tsx` (line 318) and `DayView.tsx` (line 200). The span historically declared `display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` — single-line truncation regardless of block height. An earlier iteration of this change tried "hard clip with no ellipsis indicator" (drop `nowrap`, drop `text-overflow`, add `word-break`); live verification showed the missing affordance was confusing. This iteration uses multi-line line-clamp with a per-block clamp count derived from the block's rendered height, so the last visible line ends with "…" whenever the title was truncated.

Block height is computed by `calculateEventPosition` in `calendarUtils.ts` as a percentage 0–100 of the day grid (`(durationMinutes / 1440) * 100`, with a 30-minute minimum height). The grid's CSS `min-height` is exactly `calc(24 * 60px) = 1440px`, and events absolutely positioned inside that grid render at predictable pixel heights. This stable mapping between percentage and pixels is what makes a CSS-only-with-helper approach feasible without a `ResizeObserver`.

## Goals / Non-Goals

**Goals:**
- Multi-line title rendering inside timed event blocks in Day and Week views.
- Visible "…" affordance on the last visible line whenever the title was truncated.
- Line count tracks block height: a 30-min block clamps to 1 line, a 1-hr block to ~3, a 2-hr block to ~8.
- Long unbroken words wrap rather than overflow horizontally.
- The line-clamp helper is pure JS and unit-testable.

**Non-Goals:**
- Hover-to-reveal full title (popover already shows full title on click).
- `.eventBar` (month view, intentionally single-line at ~18px row) — unchanged.
- `.allDayEventBar` (fixed 22px pinned all-day row) — unchanged.
- Font-size adjustment based on block size; preserve current 11px / 600 weight / 1.3 line-height.
- Padding adjustments inside `.timedEventBlock` (today: `padding: 2px 6px`).
- Re-rendering on window resize (the grid is fixed at 1440px `min-height`; clamp values do not need to recompute on resize).

## Decisions

### Decision 1: Multi-line line-clamp with `-webkit-box`, clamp count supplied per-block
- **Choice**: Set `display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; word-break: break-word;` on `.timedEventTitle` in CSS, and supply `-webkit-line-clamp: <N>` via inline `style` from each render site, where `N` is computed from the block's rendered height.
- **Why**: `-webkit-line-clamp` is the only widely-supported CSS mechanism for "clip at line N + render ellipsis on the last visible line" (no Chrome-only `line-clamp` standard form has shipped broadly enough to rely on). It needs an integer; height-derived clamps cannot be expressed in pure CSS today. Inline style is the simplest channel to feed the integer per element without a runtime stylesheet rewrite.
- **Why ellipsis is needed**: `text-overflow: ellipsis` is what materialises the "…" character when `-webkit-line-clamp` triggers; without it the clamp truncates but does not render the affordance.
- **Why `word-break: break-word`**: lets a single unbroken long word break across lines instead of overflowing horizontally. Without it, a long URL would push past the right edge or trigger a hidden horizontal scrollbar.
- **Alternative considered**: `display: block` + `max-height: <N>em` + a CSS `::after { content: '…'; position: absolute; }` overlay. Rejected — fragile across font metrics and theme changes; gradient-mask hacks for the trailing fade are even more brittle.
- **Alternative considered**: Fixed clamp count (e.g., `-webkit-line-clamp: 3` in CSS only). Rejected for this iteration — caps tall blocks at 3 lines even when 16 would fit, wasting room; under-shows on small blocks (clamp doesn't trigger so no ellipsis even when content overflows the parent).

### Decision 2: Helper `calculateTitleLineClamp(heightPercent)` lives in `calendarUtils.ts`
- **Choice**: Add a single exported function:

  ```ts
  // Constants tied to .timedEventTitle / .timedEventBlock styles in Calendar.module.scss
  const TITLE_LINE_HEIGHT_PX = 14.3;        // 11px font-size × 1.3 line-height
  const BLOCK_VERTICAL_PADDING_PX = 4;      // 2px top + 2px bottom on .timedEventBlock
  const GRID_HEIGHT_PX = 1440;              // matches .weekTimeGrid / .timeGrid min-height (24 × 60px)

  export function calculateTitleLineClamp(heightPercent: number): number {
    const blockHeightPx = (heightPercent / 100) * GRID_HEIGHT_PX;
    const innerHeightPx = Math.max(0, blockHeightPx - BLOCK_VERTICAL_PADDING_PX);
    return Math.max(1, Math.floor(innerHeightPx / TITLE_LINE_HEIGHT_PX));
  }
  ```

- **Why this file**: `calendarUtils.ts` already houses every other shared calendar math primitive (`calculateEventPosition`, `groupOverlappingEvents`, `getHourLabels`). Keeping all view-math in one module preserves the pattern and makes the constants traceable.
- **Why a helper**: Both `WeekView.tsx` and `DayView.tsx` need this; duplicating constants in two files would invite drift if any of the SCSS values change. A helper centralises the contract.
- **Why a `Math.max(1, …)`**: enforces at least one line even on the smallest block (30-min minimum height = 30px → ~1.8 lines of content room → floor would still give 1, but the guard is explicit and survives any future SCSS padding bump).
- **Alternative considered**: Inline the math in the JSX of both files. Rejected — duplicates three magic numbers and makes the SCSS↔JS coupling implicit.
- **Alternative considered**: Read the block's actual computed height with `useRef` + `getBoundingClientRect`. Rejected — adds a render-after-layout step (flash of un-clamped text), needs a `ResizeObserver`, and is unnecessary because the grid height is fixed.

### Decision 3: Pass clamp count via inline `style`, not a CSS variable
- **Choice**: `<span style={{ WebkitLineClamp: maxLines }} className={styles.timedEventTitle}>…</span>`.
- **Why**: React typings and runtime accept the camelCased property directly. Using a CSS variable (`style={{ "--line-clamp": maxLines }}`) and `-webkit-line-clamp: var(--line-clamp)` works but adds two layers of indirection for one integer.

### Decision 4: Constants tied to SCSS, documented at the constant definition site
- **Choice**: The three constants in `calendarUtils.ts` get a single comment lining up with the SCSS source of truth (`Calendar.module.scss` selector + property pairs). If someone changes `font-size`, `line-height`, `.timedEventBlock` padding, or the grid `min-height`, the comment names exactly which selectors to bump.
- **Why**: This is a JS/CSS coupling that cannot be statically enforced; a clear pointer at the coupling site is the cheapest insurance.

### Decision 5: Unit-test the helper, not the visual rendering
- **Choice**: Add unit tests for `calculateTitleLineClamp` in `calendarUtils.test.ts` covering: 30-min minimum block (1 line), 60-min block (3 lines), 120-min block (8 lines), 24-hour block (caps based on grid height), and the floor-of-zero guard.
- **Why**: The helper is pure JS, deterministic, and JSDOM-friendly. The visual line-clamp rendering itself is JSDOM-unobservable (JSDOM does not implement `-webkit-line-clamp`); tests there would either over-claim or be no-ops. Manual browser smoke covers the visual layer.

## Risks / Trade-offs

- **Risk**: If the SCSS constants drift (e.g., someone changes `font-size` from 11 to 12), `calculateTitleLineClamp` will silently miscount lines. → **Mitigation**: comment at the constant definition site explicitly names the SCSS selectors; a code review touching either side has a clear pointer to update both. A future hardening could be a CSS-variable-driven approach (CSS exposes `--line-height-px`, JS reads it via `getComputedStyle`), but that's overkill for now.
- **Risk**: Browsers without `-webkit-box` (none in the modern browserslist target) would fall back to `display: inline` for the span and lose the layout. → **Mitigation**: Vite's default browserslist targets evergreen browsers; `-webkit-box` is supported in every browser this app targets. No legacy fallback needed.
- **Risk**: An overlapping pair of events at half-width may produce a clamp count that's right vertically but the text still feels cramped horizontally. → **Mitigation**: not a regression — narrow columns showed even less title before this change. `word-break: break-word` keeps the layout intact regardless of column width.
- **Risk**: Helper produces clamp = 1 for a 30-min block; if the title is short enough to fit on one line, no ellipsis appears (clamp doesn't trigger). That's the correct behavior. If the title is long, line 1 ends with "…". Both outcomes are desirable.
- **Trade-off**: Manual line-height arithmetic is brittle to future typography changes. Justification: the alternative (live measurement) introduces a flash of un-clamped text and additional render passes for marginal benefit; this codebase does not change calendar typography frequently.
