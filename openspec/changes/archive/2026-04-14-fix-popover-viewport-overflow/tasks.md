## 1. Refinement

- [x] 1.1 Change the clamping `useEffect` (no dependency array) to `useLayoutEffect` so the position adjustment happens before paint, preventing any one-frame flash
- [x] 1.2 Add left-edge clamping (`if (left < margin) left = margin;`) for defensive completeness

## 2. Verification

- [x] 2.1 Verify build passes with `yarn build`
- [x] 2.2 Manually verify: click event near bottom edge — popover stays within viewport
- [x] 2.3 Manually verify: click event near right edge — popover stays within viewport
