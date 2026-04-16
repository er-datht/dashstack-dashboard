## Context

The Todo page in `src/pages/Todo/index.tsx` currently renders its list as:

```
<div className="bg-white dark:bg-gray-800 border ... rounded-lg shadow-sm">
  <div className="divide-y divide-gray-200 dark:divide-gray-700">
    {paginatedTodos.map(todo => (
      <div className="p-4 hover:... group"> {/* row */} </div>
    ))}
  </div>
  {/* pagination inside the same card */}
</div>
```

The Figma reference `figma.com/design/gbf5rpvxRabUueoXQCkQk8?node-id=5-7779` renders the same list as **independent bordered cards** stacked vertically with a small gap — no shared wrapper with `divide-y`. Active cards are light (`#fbfcff` with a `#d5d5d5` border, 12px radius); completed cards are full-bleed primary blue (no border, 12px radius). Action icons change: active rows use a Lucide "X-in-circle" for delete; completed rows hide the star and show a `Trash2` inside a translucent white rounded square. Active text is SemiBold; completed text is Bold.

Prior change `style-completed-todo-rows` (just implemented) locked in the blue row, outlined-white checkbox, `!text-on-primary` text + checkmark, `text-on-primary` icons, and `hover:bg-white/10` button hovers on completed rows. Those decisions carry over; the row layout around them is what's changing now.

## Goals / Non-Goals

**Goals:**
- Each todo row is its own card — independent border/background/radius; no shared divider.
- Active cards: `bg-surface`, neutral border, `rounded-xl`, SemiBold text.
- Completed cards: `bg-primary` / `hover-bg-primary-dark`, no border, `rounded-xl`, Bold text, `!text-on-primary`.
- Active-row delete icon = Lucide `XCircle`; completed-row delete icon = Lucide `Trash2` inside a translucent-white rounded square.
- Completed rows do NOT render the star button — only the delete button.
- Completed-row delete button is always visible (not hover-gated); active-row action icons remain hover-gated (existing behavior).
- Theme-aware: light, dark, forest (forest's primary resolves to green, accepted).
- No behavior change; no new dependencies; `cn()` used for conditional class composition.

**Non-Goals:**
- No change to toggle / star / delete / filter / pagination / add-todo / error / loading behavior.
- No change to the page header, add-todo input, or filter-tabs layout.
- No new design tokens, SCSS modules, or extracted components.
- No Storybook stories, no visual-regression snapshots, no contrast audit task.
- No new focus ring beyond what browsers already apply.
- No animation/transition redesign beyond the existing `transition-colors`.

## Decisions

### Decision 1: Remove the outer shared card + `divide-y` wrapper; each row is its own card

**Rationale:** The Figma reference clearly shows per-row cards, not a shared container with dividers. Keeping `divide-y` would conflict with independent borders. Removing the shared wrapper also removes the need to assert `divide-y` in tests (a previous spec scenario) — that scenario will be marked REMOVED in the spec delta with a migration note.

**Implementation:** Replace `<div className="bg-white ... rounded-lg shadow-sm"><div className="divide-y ..."> ... </div></div>` with a direct list wrapper using `space-y-3` (or equivalent). Pagination moves out of the shared card to its own spaced element below.

**Alternatives considered:**
- Keep the outer card and give each row its own inner border → rejected, produces a double-bordered look inconsistent with Figma.
- Use `gap-3` on a flex-column parent → equivalent to `space-y-3`; chose `space-y-3` for simplicity (no flex container needed).

### Decision 2: Card classes — active = `bg-surface` + theme-aware border; completed = `bg-primary` (no border)

**Rationale:** `bg-surface` is the project's theme-aware white/elevated-surface utility and matches the `#fbfcff` reference in light mode. The `#d5d5d5` reference border maps to `border-gray-200 dark:border-gray-700` (existing project pattern — same token the outer card previously used). Completed cards omit the border because the blue fill already delimits them.

**Implementation:**
- Active: `bg-surface border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group`.
- Completed: `bg-primary hover-bg-primary-dark rounded-xl p-4 transition-colors group`.

**Alternatives considered:**
- Use `shadow-sm` on cards → rejected, Figma shows no shadow.
- Use a new `bg-card` token → rejected, `bg-surface` already serves this role.

### Decision 3: Radius = `rounded-xl` (12px); spacing = `space-y-3` (12px gap)

**Rationale:** Figma uses `rounded-[12px]` on cards, which matches `rounded-xl` (Tailwind default 12px). The vertical gap in the Figma reference is small (visual estimate ≈ 12px); `space-y-3` matches.

**Alternatives considered:**
- `rounded-lg` (8px) → rejected, doesn't match Figma's 12px.
- `space-y-2` (8px) → rejected, slightly too tight vs. Figma.
- `space-y-4` (16px) → rejected, slightly too loose vs. Figma.

### Decision 4: Active-row delete icon = Lucide `XCircle`

**Rationale:** The Figma "Delete Todo" asset is a circle with an X inside, which is exactly Lucide's `XCircle`. `Trash2` is retained but moves to completed rows' delete button.

**Implementation:** Import `XCircle` from `lucide-react` alongside existing `Trash2`. In the active-row branch of the delete button, render `<XCircle className="w-5 h-5" />`. Keep the surrounding button classes (gray icon color, red hover) unchanged for active rows.

**Alternatives considered:**
- Lucide `X` (no circle) → rejected, Figma shows the circle outline.
- Lucide `CircleX` (alias) → equivalent; `XCircle` is the more common alias in the Lucide TypeScript export.

### Decision 5: Completed rows hide the star button entirely

**Rationale:** Figma shows no star icon on the completed "Review with HR" row — only a delete action. Starring a task the user has already completed has diminished product value, and hiding the button tightens the visual. The underlying `todo.starred` value is preserved in state (toggling completion back to active re-reveals the star in its prior state).

**Implementation:** In the JSX, render the star button only when `!todo.completed`. This is a conditional render, not a visibility toggle via CSS — no `hidden` class.

**Alternatives considered:**
- Keep the star button but hide via `hidden` class → rejected; conditional JSX is cleaner and avoids dead accessibility tree entries.
- Move the star to a separate menu on completed rows → rejected, out of scope.

### Decision 6: Completed-row delete button = `Trash2` inside translucent-white rounded square, always visible

**Rationale:** Figma shows the delete affordance on completed rows as a `Trash2` glyph inside a small rounded square with a translucent white background; this background is visible always (not only on hover). It's the primary action a user takes against a completed task (remove it from the list), so hiding it behind hover would be hostile on touch devices.

**Implementation:**
- Render the delete `<button>` regardless of hover state (i.e., outside the existing `opacity-0 group-hover:opacity-100` wrapper) when `todo.completed`.
- Classes: `bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors`.
- Icon: `<Trash2 className="w-5 h-5 text-on-primary" />`.
- `aria-label` unchanged (`t('actions.delete')`).

**Alternatives considered:**
- Render both star + delete on completed rows for consistency with active → rejected, Figma explicit about star absence.
- Keep the delete button hover-gated → rejected, Figma shows it rendered at all times on the blue card.

### Decision 7: Active-row action icons stay hover-gated; completed-row action icon (delete) is always visible

**Rationale:** Matches the Figma reference (active rows show subtle outlined star/X only on hover; completed rows show the trash affordance baked into the card design). This asymmetry is intentional, not a bug.

**Implementation:** Keep the existing `opacity-0 group-hover:opacity-100` wrapper for the active-row branch; bypass it for the completed-row delete button by placing that button outside the hover-gated wrapper (or by conditioning the wrapper's opacity classes on `!todo.completed`).

### Decision 8: Text weight — active = `font-semibold` (600); completed = `font-bold` (700)

**Rationale:** Figma specifies `Nunito Sans:SemiBold` for active rows and `Nunito Sans:Bold` for the completed "Review with HR" row. Tailwind's `font-semibold` = 600 and `font-bold` = 700 map exactly.

**Implementation:** Add `font-semibold` to active-branch text span and `font-bold` to completed-branch text span.

**Alternatives considered:**
- Keep default (Regular 400) everywhere → rejected, Figma is explicit.
- Make completed text `font-extrabold` (800) → rejected, overshoots the Figma spec.

### Decision 9: Pagination stays on the page but moves outside the (now-removed) shared card

**Rationale:** The shared card is being removed. Pagination previously lived inside it (`<div className="p-4 border-t border-gray-200 dark:border-gray-700">`). Post-change, it renders as a separate element below the list with its own surface treatment (keeping border-top for visual separation is fine, or using a simple `pt-4` — see Decision 10).

**Implementation:** Render `<Pagination />` in a `<div className="pt-4">` immediately after the list. No surrounding card.

**Alternatives considered:**
- Keep pagination inside a mini-card → rejected, adds visual weight Figma doesn't have.

### Decision 10: Empty state remains page-level (no card wrapper), outside the list

**Rationale:** When `filteredTodos.length === 0`, the current implementation shows an empty state inside the shared card. With that card gone, the empty state needs its own container. We keep the existing icon + message, wrapped in a simple `<div className="py-12 text-center">` (no bordered card), so the page doesn't show an empty bordered box.

**Implementation:** Move the empty-state JSX out of the card wrapper; keep its contents unchanged.

## Risks / Trade-offs

- **[Risk] Removing the `divide-y` scenario from the spec** — the previous change (`style-completed-todo-rows`) added a scenario pinning `divide-y` presence. That scenario is now incorrect. Mitigation: include a `REMOVED Requirements` entry in the spec delta explaining the migration. The corresponding unit test in `Todo.completed-styling.test.tsx` will also be updated (it currently asserts implicit presence via DOM walk; reviewer flagged that as a gap anyway).
- **[Risk] Existing tests in `Todo.completed-styling.test.tsx` assert classes on the "old" row container** — the DOM walk that uses `checkbox.parentElement.parentElement` to reach the row will still work because the card is the new row container, but the asserted classes (`bg-primary`, `hover-bg-primary-dark`) now live on the card. Other assertions (no star button on completed rows, `XCircle` vs `Trash2` icon, no `divide-y` parent) need to be added/updated. Mitigation: unit-test-writer updates tests before implementation (TDD).
- **[Risk] Hiding the star button on completed rows could surprise users who starred-then-completed** — the star state is preserved; completing → uncompleting restores the star display. Mitigation: document the behavior in the spec scenario; no UI change beyond visibility.
- **[Risk] Per-card hover background on active rows may conflict with the card's own background** — `bg-surface` + `hover:bg-gray-50` is an existing project pattern and works; verify by spot-check across themes during implementation.
- **[Trade-off]** Pagination moves outside a card → slight visual break from the old design, but Figma does not show pagination inside a card either.
- **[Trade-off]** Always-visible delete on completed rows slightly increases visual weight vs. hover-gated approach; the Figma reference explicitly shows it, so we follow it.

## Migration Plan

No migration. Deploy is a standard build + deploy; rollback = revert the PR. The spec delta marks the `divide-y` scenario REMOVED with a clear reason + "no user-facing migration required."
