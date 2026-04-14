## Why

The `EventDetailPopover` is clipped when an event bar is near the bottom or right edge of the viewport. The popover uses `position: fixed` with `top`/`left` values derived directly from the event bar's `getBoundingClientRect()`, but never checks whether the popover itself fits within the visible viewport area.

## What Changes

- Add viewport boundary detection in `EventDetailPopover` so the popover's final position is clamped to stay fully visible within the viewport (with a small margin)
- Adjust vertical position when popover would overflow the bottom edge
- Adjust horizontal position when popover would overflow the right edge
- Clamp top to a minimum margin so the popover never goes above the viewport

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — no existing spec covers the popover; this is a self-contained bug fix in `EventDetailPopover.tsx`)_

## Impact

- **Files modified**: `src/pages/Calendar/EventDetailPopover.tsx` (only file changed)
- **Risk**: Low — purely visual positioning logic; no data model, API, or state management changes
