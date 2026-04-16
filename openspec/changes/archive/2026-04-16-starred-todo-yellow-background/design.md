## Context

After the `redesign-todo-row-cards` change, the Todo row `<div>` uses a two-way `cn()`:

```tsx
cn(
  "rounded-xl p-4 transition-colors group",
  todo.completed
    ? "bg-primary hover-bg-primary-dark"
    : "bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
)
```

Starred and non-starred active rows look identical (only the star icon differs). The user wants the **starred active** state to be a visually distinct yellow card, while keeping:

1. **Completed rows blue** regardless of starred state (completed is the stronger signal).
2. **Non-starred active rows white** with neutral border (unchanged).

The project already has the `.bg-warning-light` utility (defined in `src/index.css` for light and dark themes) that resolves to:
- Light: `#fffbeb` (pastel yellow).
- Dark: `color-mix(in srgb, var(--color-warning-500) 15%, transparent)` (translucent yellow).
- Forest: no override — inherits the light definition; on a green forest surface the pastel yellow is still legible and visually distinct.

## Goals / Non-Goals

**Goals:**
- Starred active rows render with `.bg-warning-light` as their card background.
- Completed rows remain blue regardless of `todo.starred` (completion wins).
- Non-starred active rows remain white (`bg-surface`) with neutral border — fully unchanged.
- All 3 themes supported using existing theme-aware tokens.
- No new utilities, no new tokens, no hardcoded hex.

**Non-Goals:**
- No change to text classes (weight, color, strikethrough) on starred-active rows — the card color is the only signal. Active-row text stays `font-semibold text-gray-900 dark:text-gray-100`.
- No change to checkbox, star, or delete button styling on starred-active rows.
- No change to the completed-row treatment.
- No new hover shade for the starred-yellow branch (the base color is the state; hover stays visually neutral).
- No new design tokens, no SCSS modules, no extracted components.
- No contrast audit / Storybook / visual-regression task.

## Decisions

### Decision 1: Three-way conditional on card background using `cn()` with completion precedence

**Rationale:** Completion is a stronger semantic state than starred. A completed-and-starred todo should visually signal "done" (blue) rather than "important" (yellow). The JSX remains a single `cn()` call on one `<div>`; an `if/else if/else` via a ternary-chain or derived variable keeps it readable.

**Implementation:** Use a derived boolean or nested ternary, preferring a local variable for clarity:

```tsx
const cardState = todo.completed ? "completed" : todo.starred ? "starred" : "active";
```

Then in `cn()`:

```tsx
cn(
  "rounded-xl p-4 transition-colors group",
  cardState === "completed" && "bg-primary hover-bg-primary-dark",
  cardState === "starred" && "bg-warning-light",
  cardState === "active" && "bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50",
)
```

This keeps the three branches mutually exclusive and makes the test contract "one branch lights up at a time" trivial to assert.

**Alternatives considered:**
- Nested ternary without a derived variable → rejected, harder to read with three branches and compound conditions.
- Extract a helper function `getCardClasses(todo)` → over-engineering for a three-line branch.

### Decision 2: `bg-warning-light` with NO standalone `border` utility for starred cards

**Rationale:** The yellow fill is visually distinctive enough to delimit the card on its own, similar to how the completed-blue card omits a border. Adding a border would either (a) use neutral gray (visually dull against yellow) or (b) use a yellow-tinted border (requires a new token — out of scope). Dropping the border keeps scope tight and matches the completed-card pattern.

**Alternatives considered:**
- `border border-warning-100` → rejected, `border-warning-100` is NOT an existing Tailwind utility mapping; would require a new CSS class or arbitrary value `border-[#fef3c7]` (hardcoded hex — not allowed). Out of scope.
- Keep `border border-gray-200 dark:border-gray-700` → rejected, gray border on yellow looks muddy.

### Decision 3: No hover color shift on starred cards

**Rationale:** The starred yellow is the state; shifting on hover to a slightly darker/lighter yellow would require adding a new utility (e.g., `hover:bg-warning-100`), which doesn't exist in the project's utility set. The `transition-colors` animation stays in place, and cards still toggle to/from blue (when toggling completion) with a smooth transition. For hover feedback on the actions themselves, the existing per-button hover styles (star-hover-yellow, delete-hover-red-tint, etc.) still work on the yellow card background since those are scoped to the button, not the card.

**Implementation:** Omit any `hover:bg-*` class from the starred branch. Keep `transition-colors` on the base classes so the yellow smoothly transitions to/from blue when completion toggles.

**Alternatives considered:**
- `hover:bg-[var(--color-warning-100)]` arbitrary value → rejected; CSS-variable arbitrary values in Tailwind work but add complexity for a micro-interaction the user didn't ask for.
- Add a new `.hover-bg-warning-darker` utility to `src/index.css` → rejected, scope creep (no new utilities in this change).
- `hover:opacity-95` → rejected, opacity-hover on a card feels fragile (changes descendant contrast).

### Decision 4: Starred-completed priority — completed wins

**Rationale:** A user who stars a task AND completes it still primarily wants to see "this is done." The completed state is terminal; starred is an in-progress importance marker. Making completed win avoids ambiguity.

**Implementation:** The derived `cardState` checks `todo.completed` first (short-circuits), then `todo.starred`. This falls out naturally from the conditional order.

**Alternatives considered:**
- Starred wins over completed → rejected, completed is a stronger state.
- Both apply simultaneously (blue card with yellow border accent) → rejected, adds visual noise and requires new utilities.

### Decision 5: Starred card does NOT include a border utility — mutual exclusivity only

**Rationale:** Ensures test assertions are clean: active card has `border`; completed card has no `border` standalone; starred card has no `border` standalone. This is a three-way mutex, each state exclusive.

**Implementation:** Only the active branch of the `cn()` includes `border border-gray-200 dark:border-gray-700`. The other two branches omit it.

## Risks / Trade-offs

- **[Risk] Forest theme inherits light-yellow for `.bg-warning-light`** — on the forest theme's green surfaces, pastel yellow is visually acceptable but not theme-native. Mitigation: this is consistent with other warning affordances elsewhere in the app; if it looks out of place in practice, follow up with a forest-theme-specific warning shade in a separate change.
- **[Risk] No hover shift may feel less interactive on starred cards** — mitigation: the star and delete buttons still have per-button hover states; the card itself doesn't need hover feedback since its color already encodes state.
- **[Risk] Starred cards look similar in dark mode because the translucent yellow sits over a dark background** — the existing dark-theme `.bg-warning-light` (at `src/index.css:687`) uses `color-mix(in srgb, var(--color-warning-500) 15%, transparent)`, which is a muted yellow over dark — visually weaker than the light-mode `#fffbeb`. Mitigation: accepted; the warning tokens are used elsewhere in the app under this exact formulation.
- **[Trade-off]** Omitting the hover-color shift on starred rows is a small interactive inconsistency but keeps the change scope minimal and avoids adding new CSS utilities.

## Migration Plan

No migration. Standard build + deploy; rollback = revert the PR. The spec delta only ADDS new scenarios (no removals), so tests from prior changes keep working.
