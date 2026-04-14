## 1. Update Guests Layout

- [x] 1.1 Replace the vertical `flex-col gap-2` participant list with a horizontal `flex items-center gap-2.5` row in EventDetailPopover
- [x] 1.2 Update each participant avatar to a 24×24 rounded-full circle with `--color-surface-secondary` background and `text-primary` text color (`--color-text-primary`), showing initials only (remove the name `<span>` and the wrapping `flex items-center gap-2` div per participant)
- [x] 1.3 Update the "+N" overflow indicator: change `border-2` to `border` (1px), keep `--color-primary-600` border/text on transparent background, remove the wrapping `flex items-center gap-2` div so the circle is a direct child of the row

## 2. Verification

- [x] 2.1 Verify build passes with `yarn build`
- [x] 2.2 Verify lint passes with `yarn lint`
- [x] 2.3 Visually verify the popover guests section matches the Figma horizontal avatar row layout across all three themes (light, dark, forest)
