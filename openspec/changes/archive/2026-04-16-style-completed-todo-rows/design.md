## Context

The Todo page (`src/pages/Todo/index.tsx`) currently renders each todo row with a shared white background and differentiates completion only via:
1. A filled blue checkbox (`bg-primary-600 border-primary-600`) with white checkmark.
2. `line-through` + muted gray text on the label.

The reference design keeps the checkbox-and-strikethrough idea but inverts the row's color scheme: the whole row becomes primary-blue (full-bleed, edge-to-edge; no inner pill or added border radius), the checkbox becomes outlined-white with a white checkmark, and the text becomes white (via the semantic `!text-on-primary` utility). This is a small, visual-only change isolated to the completed-state branches of the row's conditional classes.

Existing constraints:
- Tailwind v4 utilities only (no new SCSS).
- `cn()` helper (from `src/utils/cn.ts`, wraps `classnames`) for conditional class composition.
- Must work in all 3 themes (light/dark/forest). The project already exposes theme-aware primary utilities (`bg-primary`, `bg-primary-dark`, `!text-on-primary`) that adapt per theme.
- No manual memoization needed (React Compiler handles it).

## Goals / Non-Goals

**Goals:**
- Completed rows render with a full-bleed primary-blue row background, outlined-white checkbox (with `!text-on-primary` checkmark), and `!text-on-primary` text (strikethrough preserved).
- Star and delete action icon buttons on completed rows use `text-on-primary` for icons and `hover:bg-white/10` for button-hover background so they remain legible against the blue row.
- Active rows remain visually unchanged.
- Visual parity across light, dark, and forest themes (accepting that forest's `bg-primary` is green).
- Hover state on completed rows stays within the blue family (no white/gray hover flash).
- The existing row divider (`divide-y divide-gray-200 dark:divide-gray-700`) and the existing `transition-colors` animation are preserved.
- Accessibility: row/label contrast ≥ 4.5:1; checkbox remains focusable with the existing focus behavior (no new focus ring introduced); `aria-label` semantics unchanged.

**Non-Goals:**
- No change to todo data model, API, or hook behavior.
- No change to the Add-Todo input, filter tabs, pagination footer, "Showing N of M" text, empty state, or the star/delete action buttons' *behavior* (only the completed-row icon-color and button-hover-bg are adjusted).
- No new design tokens, no new SCSS modules, no new components extracted.
- No animation/transition redesign beyond the existing `transition-colors`.
- No new focus ring, no formal contrast audit task, no new `data-*` test attributes, no visual regression / Storybook story.

## Decisions

### Decision 1: Use the existing theme-aware `bg-primary` / `bg-primary-dark` utilities for row background

**Rationale:** These utilities are defined in `src/index.css` and already adapt per `data-theme`. Using them avoids hardcoded hex values and keeps the change themeable for free.

**Alternatives considered:**
- Hardcode `#4880FF` or similar → rejected, breaks CLAUDE.md rule "no hardcoded colors, must support all 3 themes".
- Introduce a new `bg-todo-completed` token → rejected, over-engineering for a single-row use case when `bg-primary` already matches the design intent.

### Decision 2: Apply completed styling via `cn()` on the row `<div>`, not via a wrapper component

**Rationale:** The row is a simple, one-off conditional. Wrapping it in a new `CompletedTodoRow` component would add indirection without reuse value.

**Alternatives considered:**
- Extract `TodoRow` / `TodoRowCompleted` components → rejected, premature abstraction; the conditional is ~5 classes.

### Decision 3: Outlined checkbox on completed rows = transparent background + white border (existing `border-2` thickness retained) + `!text-on-primary` checkmark

**Rationale:** On a blue row background, a filled-blue checkbox would disappear. An outlined white checkbox (no fill, white border, checkmark rendered with the semantic `!text-on-primary` utility) provides the contrast shown in the reference image and reads clearly as "checked" thanks to the visible checkmark inside.

**Implementation:** Replace the completed-branch classes from `"bg-primary-600 border-primary-600"` to `"bg-transparent border-white"` (keeping the existing `border-2` thickness), and keep the `<Check>` icon at its default Lucide stroke width, swapping its color class from `text-white` to `!text-on-primary`.

**Alternatives considered:**
- Keep solid-blue checkbox on blue background → rejected, poor contrast.
- White-filled checkbox with blue checkmark → rejected, doesn't match the reference; would look like an inverted/active state.
- Thicker checkbox border on completed rows → rejected, keep existing `border-2` thickness.
- Bolder Lucide stroke width for the checkmark → rejected, keep default.

### Decision 4: Hover on completed rows uses `hover-bg-primary-dark` instead of the existing `hover:bg-gray-50 dark:hover:bg-gray-700/50`

**Rationale:** Gray hover over a blue row would look jarring. `hover-bg-primary-dark` is already used elsewhere (e.g., filter tabs, add button) and matches the dark-blue hover in the reference.

**Alternatives considered:**
- Remove hover on completed rows entirely → rejected; users still benefit from hover feedback when targeting the star/delete icons.

### Decision 5: Text color for completed rows is `!text-on-primary` (semantic) with `line-through` preserved

**Rationale:** Reference image shows white text on the blue background. The project already exposes the `!text-on-primary` utility (used for the Add button and the active filter tab) which resolves to white on primary-colored backgrounds and adapts per theme. Using the semantic token instead of a literal `text-white` keeps the change consistent with existing patterns. The `!` modifier is preserved to match how the utility is applied elsewhere (overriding descendant default text colors). The strikethrough is retained because it continues to reinforce the "done" affordance semantically, even if subtle on white.

**Alternatives considered:**
- Literal `text-white` → rejected in favor of the semantic `!text-on-primary` per existing project convention.
- Drop the strikethrough → rejected, removes a second-channel "done" indicator that helps users scanning the list.
- Use a muted white (e.g., `text-white/70`) to mimic the current gray-muted effect → rejected; user confirmed full white (via `!text-on-primary`).

### Decision 6: Star and delete icon buttons on completed rows use `text-on-primary` icons + `hover:bg-white/10` button-hover

**Rationale:** The existing star (yellow-tinted hover) and delete (red-tinted hover) styles become hard to read against `bg-primary`. Forcing icons to the semantic `text-on-primary` utility and replacing the hover background with a semi-transparent white tint (`hover:bg-white/10`) keeps icons legible and consistent with the row's blue surface. This tracks the original reference design more faithfully than leaving yellow/red tints.

**Implementation:** When `todo.completed` is `true`, the star and delete icon buttons apply `text-on-primary` for the icon color and `hover:bg-white/10` for the button hover. When the star is `starred`, keep `fill-current` so it renders as a filled white star on blue. Active rows keep their existing yellow/red icon styles unchanged.

**Alternatives considered:**
- Leave existing yellow/red hover tints → rejected; the user explicitly chose option (b) — force `text-on-primary` icons and `hover:bg-white/10` on completed rows.
- Use literal `text-white` for icons → rejected; semantic `text-on-primary` keeps the change consistent with Decision 5 and existing project patterns.
- Swap the star fill to a different color on completed rows → rejected; `fill-current` with `text-on-primary` yields the simplest, most consistent result (filled white star on blue).

### Decision 7: Forest theme renders completed rows in green (accepted behavior, no new token)

**Rationale:** In the forest theme, `bg-primary` resolves to green rather than blue. The user explicitly accepted this: completed rows will be green in the forest theme. No new `bg-todo-completed` token or theme-specific override is introduced.

**Alternatives considered:**
- Introduce a dedicated `bg-todo-completed` token pinned to blue across themes → rejected as over-engineering.
- Pin completed rows to a specific hex → rejected, violates the "no hardcoded colors, use theme-aware utilities" convention.

## Risks / Trade-offs

- **[Risk] `bg-primary` utility may not define a compatible hover variant in all themes** → Mitigation: verify `hover-bg-primary-dark` resolves on all three themes by spot-checking the Todo page in light/dark/forest during apply; fall back to `hover:opacity-90` if a theme gap is found.
- **[Risk] Existing unit tests assert against old completed-row classes (e.g., `bg-primary-600` on checkbox)** → Mitigation: `unit-test-writer` updates tests first to the new contract (TDD); `react-frontend-specialist` then makes them pass.
- **[Trade-off]** Strikethrough on white text is low-contrast visually; kept anyway (user confirmed) for semantic redundancy with the background-color cue.
- **[Trade-off]** Forest theme will render completed rows in green (because `bg-primary` is green in forest). This is an accepted visual outcome, not a bug; no theme override is introduced.
- **[Trade-off]** Tests assert via Tailwind class names rather than dedicated `data-*` attributes. Acceptable for this visual-only change; keeps the component free of test-only markup.

## Migration Plan

No migration. This is a purely visual change to a single page component; deployment is a standard build + deploy. Rollback = revert the PR.
