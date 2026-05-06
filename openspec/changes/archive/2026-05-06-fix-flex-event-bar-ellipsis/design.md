## Context

Two event-bar variants in `src/pages/Calendar/Calendar.module.scss` exhibit the same bug:

1. **`.eventBar`** (lines 67-89) — used in `CalendarGrid.tsx:217` for month-view event bars. Declares `display: flex; align-items: center; height: 18px; ... white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`.
2. **`.allDayEventBar`** (lines 521-538) — used in `DayView.tsx` and `WeekView.tsx` for all-day events in the pinned row. Declares `display: flex; align-items: center; height: 22px; ... white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`.

Both are rendered with the title text as a direct text-node child of the flex container:

```tsx
// CalendarGrid.tsx
<div className={styles.eventBar} title={event.title} onClick={...}>
  {event.title}
</div>

// DayView.tsx & WeekView.tsx
<div className={styles.allDayEventBar} onClick={...}>
  {event.title}
</div>
```

The CSS spec for `text-overflow` requires the property to apply to a block container that establishes a block formatting context for an inline-level child. When `display: flex` is set on the bar, the direct text becomes wrapped in an anonymous flex item — `overflow: hidden` still clips, but `text-overflow: ellipsis` does not render the "…" indicator on the anonymous item. Result: clipped text without affordance.

The standard CSS-only fix is to drop the flex container and switch to a normal block container, using `line-height` matching the bar height for single-line vertical centering — the canonical idiom for "single line, vertically centered, fixed height". `text-overflow: ellipsis` then applies to the direct text node and renders "…" correctly.

## Goals / Non-Goals

**Goals:**
- Long titles in `.eventBar` and `.allDayEventBar` SHALL show a trailing "…" when clipped horizontally.
- Single-line layout preserved.
- Visual vertical centering preserved (line-height = height is the canonical CSS idiom).
- All coloring, click handling, hover, padding, borders, and theme adaptation unchanged.

**Non-Goals:**
- Multi-line wrapping (covered by `wrap-timed-event-title` for `.timedEventTitle`).
- Hover-to-reveal full title (the existing `title={event.title}` attribute on `.eventBar` provides the native browser tooltip; same idiom can be added later to `.allDayEventBar` if needed but is out of scope here).
- JSX changes (e.g., wrapping the text in a `<span>`).
- `.eventCard` or any sidebar event rendering — different component, no flex-text bug.
- Changing the bar height, font-size, font-weight, padding, or color tokens.

## Decisions

### Decision 1: Drop flex layout, use block + line-height for vertical centering
- **Choice**: For each rule, remove `display: flex; align-items: center;` and add `line-height: <height>px` (18px on `.eventBar`, 22px on `.allDayEventBar`). The default `display: block` for a `<div>` then takes effect.
- **Why**: Block layout puts the text directly inside the bar's block formatting context, which is what `text-overflow: ellipsis` needs. `line-height` matching the bar's `height` is the standard CSS idiom for single-line vertical centering and produces the same visual result as `align-items: center` for single-line text.
- **Alternative considered**: Wrap the text in an explicit `<span>` and apply `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` to the span while keeping the parent as a flex container. Rejected — requires JSX changes in three files (`CalendarGrid.tsx`, `DayView.tsx`, `WeekView.tsx`), adds a DOM node per bar, and provides no behavioral benefit. The CSS-only swap is smaller and cleaner.
- **Alternative considered**: Set `min-width: 0` on a wrapping flex child to allow text-overflow inside flex. Rejected — requires the explicit-span change above; doesn't help when text is a direct child.

### Decision 2: Use `line-height: <height>px` rather than `line-height: 1` + padding tweaks
- **Choice**: `line-height: 18px` on `.eventBar` (matches `height: 18px`); `line-height: 22px` on `.allDayEventBar` (matches `height: 22px`).
- **Why**: This single declaration vertically centers the inline content without touching padding. With small font sizes (8px on `.eventBar`, 11px on `.allDayEventBar`) and ample line height, the resulting visual baseline matches what `align-items: center` produced.
- **Why not relative units (`line-height: 1`, `line-height: 2.25` etc)**: explicit pixel values match the bar's pixel `height` exactly, removing rounding ambiguity that could shift the baseline by sub-pixel amounts under certain DPIs.

### Decision 3: Keep all other declarations
- `padding-left: 8px` on `.eventBar`, `padding: 0 8px` on `.allDayEventBar` — both work identically under block layout.
- `border-left-width / border-left-style` (`.eventBar`) and `border-left: 3px solid` (`.allDayEventBar`) — unaffected by display change.
- `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` — these are the existing intent; the fix is making them effective.
- `cursor: pointer; pointer-events: auto; z-index: 2;` (`.eventBar`) — unaffected.

### Decision 4: New `calendar-month-view` capability instead of attaching to an existing spec
- **Choice**: Create `openspec/specs/calendar-month-view/spec.md` with a single ADDED requirement.
- **Why**: There is no existing `calendar-month-view` capability today (month-view behavior was specified only in the archived `2026-04-14-calendar-page` proposal and never split into a dedicated spec). The project already follows a per-view granularity pattern (`calendar-day-view`, `calendar-week-view`); creating `calendar-month-view` matches that pattern and gives future month-view work (cell layout, today highlight, out-of-month styling, multi-day spanning) a long-term home. Attaching to `calendar-view-state` would conflate per-view rendering with cross-view state — wrong fit.

### Decision 5 (added after first apply): Add `min-width: 0; max-width: 100%` to `.allDayEventBar` to defeat flex `min-width: auto` in Day view
- **Choice**: Append two declarations to `.allDayEventBar`: `min-width: 0;` and `max-width: 100%;`.
- **Why**: Live verification after the initial flex-to-block swap revealed that the Day-view all-day bar still overflows the visible viewport without rendering "…". Root cause: `DayView.tsx` renders `.allDayEventBar` inside `.allDayContent { display: flex; flex-wrap: wrap }` with no explicit width. A flex child's default `min-width: auto` resolves to its intrinsic min-content width — and with `white-space: nowrap` on the bar, that intrinsic min-content width is the **full text width**. The bar grows to fit the entire title (no overflow inside its own box), and `text-overflow: ellipsis` never triggers; the card's outer `overflow: hidden` is what visually clips the bar, but the user never sees an ellipsis indicator.
- **How the two declarations interact**: `min-width: 0` overrides the `min-width: auto` default so the flex layout is allowed to shrink the bar below its intrinsic content width. `max-width: 100%` then caps the bar at 100% of its containing block (its flex parent), so the bar's actual rendered width equals the available row width minus its own padding/border. Within that constrained box, the existing `white-space: nowrap` + `overflow: hidden` + `text-overflow: ellipsis` finally have something to clip — and the "…" appears.
- **Why this doesn't affect Week view**: In `WeekView.tsx`, `.allDayEventBar` is rendered with `position: absolute` and an explicit inline `width: calc(<percent>% - 4px)`. Position-absolute elements are out of flex flow, so flex's `min-width: auto` default doesn't apply. `min-width: 0` is a no-op there; `max-width: 100%` resolves against the bar's containing block (`.weekAllDayGrid`), which is the same as the inline width's reference, so it cannot widen the bar past its computed inline width — at most it equals it.
- **Alternative considered**: Force the bar to `width: 100%` of its parent in Day view (e.g., a Day-view-specific `.allDayContent .allDayEventBar { width: 100% }`). Rejected — couples the bar's intrinsic constraints to a parent selector and creates a special case for Day view that future maintenance has to remember. The `min-width: 0; max-width: 100%` pair is the standard "make a flex child support text-overflow: ellipsis" recipe (well-known across the React ecosystem) and works uniformly regardless of whether the parent is flex or absolute.
- **Alternative considered**: Drop `flex-wrap: wrap` from `.allDayContent` and use a different layout. Rejected — out of scope; existing layout supports zero or many all-day events on the same day, and changing the parent shape risks regressions in the multi-event case.

### Decision 6 (added after second apply): Also add `min-width: 0` to `.allDayContent`
- **Choice**: Add a single declaration `min-width: 0;` to the existing `.allDayContent` rule. No other changes to that rule (`flex: 1`, `display: flex`, `flex-wrap: wrap`, `gap: 2px`, `padding: 2px 4px` all preserved).
- **Why**: Live verification after Decision 5 showed the Day-view all-day bar still overflowing the card with no ellipsis. Investigating up the flex tree: `.allDayContent` is itself a flex child of `.allDayRow` (`display: flex`). Its default `min-width: auto` resolves to its content's intrinsic min-content width — and its content is `.allDayEventBar` whose intrinsic min-content (under `white-space: nowrap`) is the full title text width, regardless of the bar's own `min-width: 0` (the bar's `min-width: 0` only governs the bar's own shrinkability, not the parent's intrinsic content sizing calculation).
- **What this fixes**: With `min-width: 0` on `.allDayContent`, the flex layout in `.allDayRow` is allowed to shrink `.allDayContent` to fit the available row space (parent width − the 60px `.allDayGutter`). Once `.allDayContent` has a constrained width, `.allDayEventBar { max-width: 100% }` finally resolves against a sane reference, capping the bar at the available row width. The bar's content now overflows its constrained box, and the existing `white-space: nowrap` + `overflow: hidden` + `text-overflow: ellipsis` finally render the "…".
- **Why this isn't needed for Week view**: `.weekAllDayGrid` (Week view's analogue) is `flex: 1; position: relative` inside `.weekAllDayRow`. The bars inside use `position: absolute` with explicit inline widths, so the flex `min-width: auto` chain doesn't apply there.
- **Standard recipe**: For text-overflow: ellipsis to work on a flex descendant, every flex ancestor up to the constraining width must override `min-width: auto`. This is a well-known idiom; the missing-`min-width-0` pitfall has been independently rediscovered enough times that React typings even include `min-width` as a CSS property in autocomplete suggestions for any flex layout. The chain `.allDayRow > .allDayContent > .allDayEventBar` now has `min-width: 0` at the two relevant levels (the gutter is fixed-width and not a problem).
- **Alternative considered**: Switch `.allDayContent` from `display: flex; flex-wrap: wrap` to `display: flex; flex-direction: column` so multi-event Day views stack vertically. Rejected for this iteration — single-declaration `min-width: 0` is a strictly smaller change and preserves the existing horizontal-with-wrap layout that was the original author's intent. If multi-event vertical stacking is desired later, that's a separate UX decision.

## Risks / Trade-offs

- **Risk**: Replacing `align-items: center` with `line-height: <height>px` could cause sub-pixel baseline shifts on certain DPIs or when descenders are involved. → **Mitigation**: matched `line-height` to existing `height` exactly so the line box is the same size as the bar; this is the same idiom used across the codebase for single-line buttons (e.g., `.viewToggleButton` uses `height: 34px` with native button vertical centering). Manual visual smoke during apply will catch any pixel drift.
- **Risk**: A future change adds inline icons or badges inside the bar; `display: block` means they'd flow inline with the text instead of laying out as flex children. → **Mitigation**: out of scope today; if/when icons are added, the bar can be re-layered with an inner span / icon component without re-introducing the original bug (the text would live in its own ellipsis-capable span, parent could go back to flex).
- **Risk**: Long all-day titles spanning multiple days (Week view all-day row) may show "…" sooner because the bar's width is the spanned columns minus 4px. → **Mitigation**: that is the desired behavior — users currently see no truncation indicator at all; they will now see "…" exactly where the text is being clipped, which is more informative.
- **Trade-off**: No hover-to-reveal native tooltip on `.allDayEventBar` (only `.eventBar` has `title={event.title}` today). Out of scope for this fix; can be added in a separate change if discoverability becomes a concern.
