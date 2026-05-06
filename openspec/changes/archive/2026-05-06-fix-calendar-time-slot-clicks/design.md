## Context

`WeekView.tsx` and `DayView.tsx` render two stacked layers inside the time grid:

1. **Slot layer (in flex flow)** — `.weekHourRow` / `.hourRow` containing `.weekHourSlot` / `.hourSlot` cells. Each cell carries the `onClick` → `onTimeSlotClick(date, hour)` handler that opens AddEventModal.
2. **Event layer (absolutely positioned)** — per-day `.weekDayEventsColumn` (one per day, computed `left`/`width`) or single `.dayEventsColumn` (`left: 60px; right: 0`) covering the full vertical extent (`top: 0; bottom: 0`). Inside live `.timedEventBlock` event blocks (also absolute) and the `.currentTimeIndicator`.

Today, neither column wrapper sets `pointer-events`. Browsers treat transparent absolute divs as full hit-test rectangles, so the column overlay swallows every click on its bounding box — even where no event block is rendered. The slot-layer `onClick` never fires. `.currentTimeIndicator` already handles this correctly (`pointer-events: none` in `Calendar.module.scss:576`); the column wrappers were missed when they were added in commit `49136df`.

Tests in `WeekView.test.tsx` / `DayView.test.tsx` only render and assert presence — they never simulate a slot click and assert the handler ran, so the regression slipped through CI.

## Goals / Non-Goals

**Goals:**
- Restore the "click empty slot → AddEventModal opens" interaction defined by `calendar-day-view` and `calendar-week-view` specs.
- Preserve event-block clicks ("click event block → EventDetailPopover").
- Lock the layering invariant in unit tests so this regression cannot return silently.

**Non-Goals:**
- Drag-to-create event interactions (no spec exists; out of scope).
- Touch/long-press gestures or mobile-specific UX.
- Restructuring the day/week view DOM into a non-overlay layout.
- Changing `.currentTimeIndicator`, all-day rows, the month grid, or the calendar header.
- Visual changes to event blocks, slots, or grid lines.

## Decisions

### Decision 1: Use `pointer-events: none` on overlay wrappers + `pointer-events: auto` on children
- **Choice**: Add `pointer-events: none` to `.weekDayEventsColumn` and `.dayEventsColumn`; add `pointer-events: auto` to `.timedEventBlock`.
- **Why**: This is the standard CSS pattern for transparent overlays that contain interactive children (used by FullCalendar, Google Calendar, react-big-calendar). The wrapper becomes hit-test-transparent, so empty regions pass clicks through to the slot layer; explicit `auto` on children re-enables their click handlers without inheriting the parent's `none`.
- **Alternative considered**: Restructure the DOM so event blocks render as direct children of each `.weekHourSlot` / `.hourSlot`. Rejected — events span multiple hour rows and would require positioning math relative to a dynamic ancestor, plus the absolute overlay is what makes per-day overlap layout (`groupOverlappingEvents`) work cleanly today.
- **Alternative considered**: Drop the wrapper entirely and absolutely position each `.timedEventBlock` directly inside `.weekTimeGrid` / `.timeGrid`, computing day-column `left` per block. Rejected — duplicates the column-position math across N event blocks instead of carrying it once on the wrapper; harder to read and to maintain when columns count changes.

### Decision 2: Keep `.currentTimeIndicator` unchanged
- **Choice**: No change. It already declares `pointer-events: none`.
- **Why**: Verifies the pattern is already established in the same stylesheet; we are extending it to two more selectors that were missed.

### Decision 3: Test the wired behavior, not the CSS rule
- **Choice**: New tests assert that clicking the slot DOM node fires `onTimeSlotClick` with the correct `Date`, and that clicking an event block fires `onEventClick` with a position. Do NOT try to assert `pointer-events` values via JSDOM (JSDOM does not enforce CSS hit-testing).
- **Why**: JSDOM's `userEvent.click` dispatches directly to the targeted node regardless of CSS `pointer-events`, so a JSDOM-only test cannot catch an overlay-blocking regression. What we CAN lock down is "the slot has a click handler that produces the right `Date`" and "event blocks remain clickable" — both are existing-spec scenarios that previously had zero coverage.
- **Why this still helps**: The next regression most likely comes from a different cause (e.g., handler removed, props rewired) — the slot-click test will catch that. Browser verification (manual smoke check during apply) covers the CSS-layer regression class.

### Decision 4: Spec deltas are ADDED invariants, not MODIFIED scenarios
- **Choice**: Add a new `### Requirement: Time-grid event overlay does not block slot clicks` under `## ADDED Requirements` in both `calendar-day-view` and `calendar-week-view` delta specs. Do not modify the existing "Day/Week view click interactions" requirement.
- **Why**: The existing requirement already mandates the user-visible behavior. The new requirement makes the implementation invariant (overlay must not intercept pointer events on empty regions) explicit and testable so a future PR adding a new overlay class cannot reintroduce this regression undetected.
- **Alternative considered**: MODIFY the existing requirement to fold the invariant in. Rejected — modification requires copying the entire requirement block per OpenSpec rules and would conflate "what the user sees" with "how the layout must be wired", which `calendar-add-event` and similar specs keep separate.

## Risks / Trade-offs

- **Risk**: Adding `pointer-events: auto` to `.timedEventBlock` could theoretically affect month-view event bars if they share the class — they do not (month view uses `.eventBar`, not `.timedEventBlock`). → **Mitigation**: grep confirms `.timedEventBlock` is referenced only in `WeekView.tsx` and `DayView.tsx`.
- **Risk**: A future event-overlay sibling (e.g., a drag-preview ghost) added without `pointer-events: none` could re-introduce the bug. → **Mitigation**: the new ADDED spec invariant documents the contract; a code reviewer catching a new full-grid absolute overlay without `pointer-events: none` will flag it.
- **Risk**: The slot-click tests use `fireEvent.click` and assume `data-hour` / equivalent locators stable. → **Mitigation**: query by role="button" + accessible name, which the slot already exposes (line 261 / 163), so the test does not depend on internal class names.
- **Trade-off**: We are not adding a Playwright/browser-level test that would catch the CSS-layer regression. Justification: the project has no e2e harness today and adding one is out of scope for a 3-line CSS fix.