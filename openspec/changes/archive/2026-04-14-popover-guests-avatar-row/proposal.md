## Why

The EventDetailPopover's guests section currently displays participants as a vertical list with initials + full names. The Figma design (node 5:7772) specifies a compact horizontal avatar row — circular 24×24 initials avatars laid out in a flex row, with a "+N" overflow circle styled with a primary-colored border and text. This brings the popover in line with the approved design and reduces its vertical footprint.

## What Changes

- Replace the vertical participant list in `EventDetailPopover` with a horizontal row of 24×24 circular avatar circles showing participant initials
- Replace the current "+N" badge (which uses the event color) with a circle that has a white/transparent background, primary-600 border, and primary-600 text (e.g. "15+")
- Remove participant name labels from the popover guests section — only avatars are shown
- Keep the "Guests" label header above the avatar row

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — no existing spec covers the popover guests display)_

## Impact

- **Files modified**: `src/pages/Calendar/EventDetailPopover.tsx` (guest rendering logic only)
- **Risk**: Low — purely visual change within a single component, no data model or API changes
