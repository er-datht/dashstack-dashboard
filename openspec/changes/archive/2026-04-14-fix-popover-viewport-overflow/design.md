## Context

`EventDetailPopover` renders at a fixed screen position (`top`/`left`) calculated from the clicked event bar's `getBoundingClientRect()`. The position is passed as a prop and applied directly via inline styles. The popover has `position: fixed` and a fixed width of 277px, but its height is dynamic (depends on image, participants, etc.). When the event bar is near the bottom or right viewport edge, the popover extends outside the visible area and gets clipped.

## Goals / Non-Goals

**Goals:**
- Popover stays fully visible within the viewport regardless of where the event bar is located
- Adjustment is seamless — no flicker or visible jump

**Non-Goals:**
- Repositioning the arrow indicator to track the adjusted offset (can be a follow-up)
- Supporting window resize while the popover is open
- Changing the popover's anchor logic in `CalendarGrid` (keep the existing `rect.right + 12` calculation)

## Decisions

**1. Post-render measurement with `useEffect`**
After the popover renders at the initial position, measure its bounding rect and compare against `window.innerHeight` / `window.innerWidth`. If it overflows, compute a clamped position and update state. This avoids needing to pre-calculate the popover height (which depends on dynamic content).

*Alternative considered:* Pre-calculating height based on content — rejected because popover height varies with image presence, participant count, and text wrapping. Measuring the actual DOM element is more reliable.

**2. Local `adjustedPosition` state**
Store the clamped position in component-local state, initialized from the `position` prop. The `useEffect` that measures runs on every render (no dependency array) to catch any size changes, but only calls `setAdjustedPosition` when the values actually differ, preventing infinite loops.

**3. 12px viewport margin**
Keep a 12px margin from all viewport edges to avoid the popover touching the browser chrome. This matches the existing 12px gap used in `CalendarGrid`'s `left: rect.right + 12`.

## Risks / Trade-offs

- **One-frame flash**: The popover initially renders at the unclamped position before the effect adjusts it. In practice this is imperceptible because React batches the state update within the same paint cycle. → If noticeable, could add `opacity: 0` until adjustment runs, but this is unlikely to be needed.
- **No arrow repositioning**: After clamping, the arrow may not point exactly at the event bar. → Acceptable for a bug fix; arrow refinement is a separate enhancement.
