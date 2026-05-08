## Context

The application has two sibling "gallery" entries in the sidebar's PAGES section: `UI Elements` (already shipped, at `/ui-elements`) and `Table` (currently a placeholder card). `UiElements` is implemented as a single page module that imports a `FilterByDropdown` and three `<Section />` components and renders them conditionally based on local filter state. The Tables gallery should mirror that exact shape so the two pages feel like a matched pair.

Three constraints shape the technical decisions below:

1. **Existing `TableCommon` consumers must not regress.** `ProductStock`, `Orders`, and `DealDetailsTable` all use `TableCommon` today. Any prop additions must default to `false`/no-op so their rendering is byte-identical.
2. **Theme support is non-negotiable.** Every visual change must work in light, dark, and forest themes using existing CSS custom properties (`--color-*`, `--spacing-*`). No hardcoded colors, no new design tokens.
3. **`ColorDots` is duplicated by intent, not accident.** The Tables gallery's "With Color Dots" variant needs the same component `ProductStock` already uses. Promoting it to a shared component now (rather than copy-pasting) avoids a known follow-up.

## Goals / Non-Goals

**Goals:**
- A `/table` page that mirrors the structure, header, filter dropdown, and section-card pattern of `UiElements`.
- Three new visual modifier props on `TableCommon` (`striped`, `bordered`, `compact`) that are CSS-only, theme-aware, and combinable.
- A shared `ColorDots` component reused by both `ProductStock` (existing call site) and the new gallery.
- A new `tables` i18n namespace covering all structural copy, with en + jp.
- Unit tests proving the modifier classes are gated by their respective props (no regression for existing consumers).

**Non-Goals:**
- Sortable headers, row selection (checkboxes), expandable rows — deferred to a separate change.
- Density toggle, column visibility toggle, CSV export, column-level filters — deferred.
- Persisting the filter dropdown state across navigation/reload (matches `UiElements` behavior).
- Migrating the placeholder's stray `navigation.table` / `table.description` keys — they are deleted, not migrated.
- Real data, services, or React Query hooks — all data is invented inline in `mockData.ts`.

## Decisions

### Decision 1: Mirror `UiElements`' file shape rather than introduce a new abstraction

`src/pages/UiElements/` ships as `index.tsx` + `components/{FilterByDropdown,BarChartSection,PieChartSection,DonutChartSection}.tsx` + `types.ts`. The Tables gallery uses the same shape: `index.tsx` + `components/{FilterByDropdown,Section,VariantCard,BasicTablesSection,CellContentSection,StatesAndInteractionSection}.tsx` + `types.ts` + `mockData.ts`.

**Why:** Two adjacent pages with the same external behavior should look the same internally. A future contributor maintaining one implicitly learns the other. Introducing a higher-order `Gallery` abstraction would couple two pages that have legitimately different content (charts vs. tables) and would fight the brownfield convention.

**Alternative considered:** Extract a generic `<Gallery sections={...} filterValue={...} />` shell shared between `UiElements` and the new `Table` page. **Rejected** — the two pages share *structure*, not *configuration*. Generalizing now would require predicting what a third gallery page would need; YAGNI.

### Decision 2: New `<Section />` shell instead of reusing `UiElements`' `ChartSection`

A new shared shell at `src/pages/Table/components/Section.tsx` (title + responsive grid wrapper). The grid is `1 col mobile / 2 col ≥lg` (not `4 col ≥xl` like `ChartSection`).

**Why:** Tables are intrinsically wider than charts. Four tables in a row would force horizontal scroll on most viewports. The 2×2 grid keeps each variant card readable. Also, `ChartSection` is in the `UiElements` page module — pulling it into a shared location just for this would couple two unrelated specs.

**Alternative considered:** Inline the section markup in each of the three section components (no shared shell). **Rejected** — three near-identical card+grid wrappers is the kind of duplication that goes stale; a 30-line shared component is cheaper.

### Decision 3: New `<VariantCard />` shell with title + small `TableCommon` instance

A small bordered card with a `text-sm font-medium text-secondary` subtitle and a child slot for the `TableCommon` instance. Each variant card passes its own `data`, `columns`, `renderCell`, and any modifier props.

**Why:** All 12 variants share the same chrome (subtitle + table). Centralizing the chrome means the gallery's visual rhythm is enforced in one place.

### Decision 4: `striped` reuses `--color-table-row-hover-secondary`

The existing token is already defined per-theme for the table-row hover highlight. Reusing it for the alternating row background:
- Avoids introducing three new theme-specific tokens (`light`/`dark`/`forest`).
- Guarantees the stripe color is *visually balanced* with hover (since hover wins, and they share the same hue family).

**Why not a dedicated token:** A dedicated `--color-table-row-stripe` would be semantically cleaner (stripe ≠ hover), but introducing it would require three new theme entries that read identically to the existing token. Pure overhead. If a future stripe-vs-hover divergence is needed, the rename is mechanical.

**Hover precedence:** `:hover` selectors come *after* `:nth-child(even)` in the cascade, so hover naturally wins.

### Decision 5: `bordered` is a full grid (every cell + outer border), corners stay rounded

CSS:
```scss
.bordered {
  border: 1px solid var(--color-border);
  th, td { border: 1px solid var(--color-border); }
}
```

The container's existing `border-radius` is preserved (the outer container clips inner corners with `overflow: hidden`).

**Why a full grid:** Most admin templates' "bordered" table renders a full grid. Header-only or vertical-only would surprise consumers. If finer control is needed later, additional modifier props (`borderedHeader`, `borderedCols`) can be added without breaking `bordered`.

### Decision 6: `compact` halves vertical padding only

Cell vertical padding goes from `var(--spacing-4)` (16px) to `var(--spacing-2)` (8px). Horizontal stays at `var(--spacing-4)`. Header padding follows the same axis.

**Why vertical only:** Horizontal compression makes columns crowd each other and damages readability of long strings. Vertical compression is the actual ergonomic win — more rows visible per viewport.

### Decision 7: Promote `ColorDots` in the same diff, not as a follow-up

`ColorDots` moves to `src/components/ColorDots/index.tsx`. `src/pages/ProductStock/index.tsx` updates its import. The Tables gallery imports from the same shared location.

**Why same diff:** A "promote in a follow-up" task tends to never get done. The promotion is one-line-add + one-line-import-change in `ProductStock`. Shipping both atomically ensures the gallery doesn't import a soon-to-move-anyway helper.

**Behavior:** No change. Same props (`colors`, `maxVisible?`), same rendering. Follows the project's component conventions (typed props via `type`, explicit `React.JSX.Element` return, `cn()` if needed).

### Decision 8: Toast feedback for "interactive" variants is the local-state pattern

Action Icons and Clickable Rows variants use a single local `useState<{text, variant} | null>` toast (same pattern as `ProductStock/index.tsx:50-75`). No `ConfirmModal`, no real mutation, no real navigation. Toast text comes from `tables:toast.edited` / `tables:toast.deleted` / `tables:toast.selected` (interpolated with row label).

**Why:** The variants exist to *demonstrate* `TableCommon`'s interactive surface, not to actually mutate anything. A real `ConfirmModal` for a fake delete would be misleading.

### Decision 9: Mock data lives in `mockData.ts`, English-only for placeholder strings

All 6 datasets (5 users, 5 orders, 5 product-with-colors, 5 product-with-actions, 25 generic for paginated, 4 small generic) live in one file. Names, emails, product titles, order IDs are English-only across both locales. Only structural copy (page title, filter labels, section titles, variant titles, column headers, toast messages) gets jp translations.

**Why English-only data:** `UiElements` chart data has no text labels, so the question never arose. Translating placeholder names (e.g., "Acme Corp" → 「アクメコーポレーション」) is busywork that doesn't reflect a real translation need; real consumer pages translate via API responses, not hardcoded mocks.

## Risks / Trade-offs

- **Risk:** Reusing `--color-table-row-hover-secondary` for stripes conflates two semantic uses. → **Mitigation:** Comment in `TableCommon.module.scss` explicitly states the reuse and the rename path.
- **Risk:** `compact` changes vertical padding only — a future `compact + bordered` combo may look visually unbalanced if border thickness is significant relative to row height. → **Mitigation:** Gallery shows single-modifier variants only, so the combo isn't rendered. If a consumer combines them and complains, that's a new spec change.
- **Risk:** Existing `TableCommon` snapshots (if any) could break from new optional props in `TableCommonProps<T>`. → **Mitigation:** Props are all optional with `false` defaults; the runtime output is byte-identical when callers omit them. The new modifier-class test guards this explicitly.
- **Risk:** `ColorDots` promotion changes its import path — TypeScript will catch the missed `ProductStock` import update, but lint/test in CI is the safety net. → **Mitigation:** The `ProductStock` import update is in the same diff and covered by `yarn build` + the existing `ProductStock` test suite.
- **Trade-off:** No persisting filter state matches `UiElements` but means a user filtering to "Cell Content" then navigating away loses the filter. **Accepted** — both gallery pages behave the same way; it's a showcase, not a workflow.
- **Trade-off:** 12 variant cards mounting on initial page load means 12 small `TableCommon` instances render at once. Each is tiny (3–5 rows or 25 rows for the paginated one), and React Compiler handles memoization. **Accepted** — same rendering load as `UiElements`' 12 chart variants.

## Migration Plan

No migration needed:
- New page at an existing route (`/table` already routes to the placeholder).
- New `tables` i18n namespace is additive.
- `TableCommon` props default to `false` — no existing consumer changes behavior.
- `ColorDots` promotion is a moved file + a one-line import update in `ProductStock`; the symbol is not re-exported from anywhere.
- Stray placeholder keys (`navigation.table`, `table.description`) are deleted along with the placeholder body. They have no other consumers (verified by repo-wide grep at planning time).

## Open Questions

None at this stage. All 15 clarifying questions surfaced by `requirements-analyst` have been resolved by user confirmation ("go with all").
