## Context

The current `EventDetailPopover` guests section (lines 181-236) renders participants as a vertical `flex-col` list: each row contains a 24×24 circle with initials + the participant's full name. The overflow indicator uses event-color styling. The Figma design specifies a horizontal `flex-row` of avatar circles with no names, and a "+N" overflow circle styled with primary-600 border/text on a transparent background.

## Goals / Non-Goals

**Goals:**
- Match the Figma layout: horizontal avatar row with 10px gap, 24×24 circles, initials only
- "+N" circle uses `--color-primary-600` for border and text, transparent/surface background
- Keep the "Guests" label and divider above the row

**Non-Goals:**
- Adding actual avatar images to participants (the `Participant` type only has `id` and `name`)
- Changing the `EXTRA_PARTICIPANTS_THRESHOLD` constant (stays at 3)
- Modifying the avatar appearance in any other component (e.g. EventsSidebar)

## Decisions

**1. Use Tailwind utilities for the avatar row layout**
The layout is a simple `flex items-center gap-2.5` row. No need for SCSS module styles since there are no pseudo-elements or animations involved.

*Alternative considered:* Adding SCSS classes for `.avatarRow`, `.avatarCircle`, `.avatarMore` — rejected because these are simple static styles that Tailwind handles well.

**2. Use `--color-primary-600` CSS variable for the "+N" circle**
The Figma uses `#4880ff` which is the project's primary-600 value. Using the CSS variable ensures theme-awareness across light/dark/forest themes.

**3. Keep `getInitials()` for avatar content**
The existing utility generates initials from participant names. This matches the Figma's gray circles (which show avatar images we don't have), but with initials as a text fallback. Background color will use `var(--color-surface-secondary)` (the neutral gray) instead of the event color, matching Figma's `#d9d9d9`.

## Risks / Trade-offs

- [Visual difference from Figma] The Figma shows actual photos in avatars, but our `Participant` type only has `name`. Using initials on a gray background is an acceptable approximation. → No mitigation needed; this is a known data limitation.
