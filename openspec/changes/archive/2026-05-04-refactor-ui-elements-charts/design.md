## Context

The `add-ui-elements-page` change shipped 8 chart variants (4 bar + 4 pie/donut) and 3 section components. Each variant file spent 70–80% of its lines on boilerplate identical to its siblings — the recharts container, the chart wrapper, hidden axes, the tooltip wiring — leaving only the per-variant series/cells declaration as the meaningful difference. The section components similarly repeat the card + grid frame three times, differing only in which children they render. This refactor consolidates that boilerplate into shared shells without changing observable behavior.

Constraints from the existing codebase:
- Variants must keep their own `useChartTheme()` + `getXxxColors(theme)` calls so that palette-type imports (`BarPalette`, `PiePalette`, `DonutPalette`) stay out of the shells.
- Recharts prop values must be reproduced exactly: `cursor={{ fill: "transparent" }}`, `isAnimationActive={false}`, `startAngle={90}`, `endAngle={-270}`, `stroke="none"`, container `width="100%" height={180}`. Even subtle differences could change rendering.
- The radius-on-top-of-stack treatment is currently authored per-`<Bar>`. The grouped variant gets radius on both bars; stacked variants get radius only on the top. There is no universal rule — every bar's radius must remain variant-controlled.
- `BarVariantGrouped` is the only bar variant without `barSize={12}`. The shell must allow per-series `barSize` to be omitted so recharts default grouped sizing is preserved.
- `DonutVariantStacked3` is the only donut without a "track" cell. The shell must not auto-append a track — the variant is responsible for the full cell list.

## Goals / Non-Goals

**Goals:**
- Eliminate ~95 lines of frame-code duplication across the 8 chart variants and 3 sections.
- Each variant collapses to a single shell call with a config-only body.
- Future chart variants (Line, Area, Scatter) become trivial drop-ins via additional shells of the same shape.
- Pixel-identical output across all 3 themes; tooltip behavior unchanged.

**Non-Goals:**
- No spec deltas. The `ui-elements-page` capability is unchanged at the requirement level.
- No new tests. The existing `index.test.tsx` and `FilterByDropdown.test.tsx` continue to validate the contract.
- No changes to `palette.ts`, `mockData.ts`, `useChartTheme.ts`, `ChartTooltip.tsx`, `types.ts`, the page `index.tsx`, or any locale/route/sidebar file.
- No new shells beyond the three listed (`BarShell`, `PieShell`, `ChartSection`).
- No reorganization of the directory tree (variants stay in `charts/`, shells go in `components/`).
- No bundle-size optimization beyond what falls out naturally from deduplication.
- No accessibility changes.

## Decisions

### 1. Three shells: `BarShell`, `PieShell`, `ChartSection`

**Decision:** Three separate shells with focused responsibilities. `BarShell` for bar charts. `PieShell` for both pie and donut charts (donut is just a pie with `innerRadius`). `ChartSection` for the card + 4-grid frame.

**Rationale:** The user explicitly chose one `<PieShell innerRadius?>` over two separate `PieShell` + `DonutShell` shells. This is the minimum-surface approach. `ChartSection` is necessary because all three section components share the same card/grid pattern.

Alternatives considered: a single mega-shell `<ChartShell type="bar" | "pie" | "donut">` — rejected, would require a discriminated union prop type and conditional rendering inside, harder to read than three small focused shells.

### 2. Variants own their theme + palette lookup

**Decision:** Each variant continues to call `useChartTheme()` + `getBarColors(theme)` / `getPieColors(theme)` / `getDonutColors(theme)` and derives its own colors. The shell receives only `string` colors via `series[].fill` and `cells[].fill`.

**Rationale:** Keeping palette types (`BarPalette`, `PiePalette`, `DonutPalette`) inside the variants preserves the per-variant color contract documented in `palette.ts` and avoids leaking palette-shape concerns into the shell. The shell stays domain-agnostic — it just knows about `string` fills.

Alternatives considered: pass a `theme` prop and let the shell call the palette lookup — rejected, would couple the shell to all three palette functions and force discriminated logic inside.

### 3. Bar `series` prop shape

**Decision:**
```ts
type BarSeries = {
  dataKey: string;
  fill: string;
  stackId?: string;
  barSize?: number;
  radius?: [number, number, number, number];
};
type BarShellProps = {
  data: ReadonlyArray<Record<string, unknown>>;
  series: ReadonlyArray<BarSeries>;
};
```

The shell maps each `series` entry to a `<Bar>` with the matching props. No prop is implicit; everything the variant cares about is on the entry.

**Rationale:** Matches the asymmetries that already exist:
- Grouped bars omit `stackId` and `barSize`.
- Only the top of a stack typically gets `radius`, but grouped bars get radius on both — keep `radius` per-series, no auto-derivation.
- No defaults inside the shell — defaults would surprise the grouped variant which relies on recharts' built-in sizing.

### 4. Pie `cells` prop shape and optional `innerRadius`

**Decision:**
```ts
type PieCell = { fill: string };
type PieShellProps = {
  data: ReadonlyArray<{ name: string; value: number }>;
  cells: ReadonlyArray<PieCell>;
  innerRadius?: string;       // omit for solid pies; pass "60%" for donuts
};
```

The shell renders the fixed `<Pie>` element with all six unchanging props (`cx`, `cy`, `outerRadius`, `startAngle`, `endAngle`, `stroke`, `isAnimationActive`) and maps `cells` to ordered `<Cell>` children. The `innerRadius` prop is forwarded only when defined (recharts treats absent `innerRadius` as 0 → solid pie).

**Rationale:** Pies and donuts share so much that two shells would mostly differ in one prop. One shell with optional `innerRadius` is more concise and matches the "donut = pie + innerRadius" mental model.

### 5. `cells` order matters; track is variant-supplied

**Decision:** The shell does not special-case any cell as "track." The variant declares the full ordered list of cells, including the track if applicable. `DonutVariantStacked3` simply omits a track from its `cells` array.

**Rationale:** Auto-appending a track would break `DonutVariantStacked3`. Keeping cells fully variant-controlled also avoids the shell needing to know about palette `track` colors.

### 6. `ChartSection` shape

**Decision:**
```tsx
type ChartSectionProps = {
  title: string;
  children: ReactNode;
};

function ChartSection({ title, children }: ChartSectionProps) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold text-primary mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  );
}
```

The grid receives whatever children the section parent passes (4 variants in our case, but not enforced — any child count works).

**Rationale:** Children-based composition is more flexible than enumerated props. Each section component still controls which 4 variants it renders and in what order.

### 7. Folder layout

**Decision:** Shells live in `src/pages/UiElements/components/` alongside `ChartTooltip`, `FilterByDropdown`, and the 3 section components. Variants stay in `src/pages/UiElements/charts/`.

**Rationale:** `components/` already holds reusable building blocks for this page. Variants are the "leaves" of the chart tree — they keep their own folder. No new folders introduced.

### 8. No new tests

**Decision:** Skip writing per-shell smoke tests.

**Rationale:** The existing `__tests__/index.test.tsx` exercises the page-level contract: default filter renders all 3 sections, filter changes hide/show sections. The 3 section components import their variants which import the shells — if any of the 11 rewritten files breaks, the page test will fail at import or render. Writing dedicated shell tests would test recharts internals and add brittleness without catching real regressions.

A render assertion like "BarShell with N series produces N `<Bar>` elements" exists at one level of abstraction below the contract that matters and would couple tests to recharts' DOM output.

## Risks / Trade-offs

- [**Subtle prop-value drift**] → mitigated by extracting all prop values verbatim from existing files. Reviewer should diff the JSX expansion mentally before approving.
- [**Refactor lands while `add-ui-elements-page` is still active**] → could confuse reviewers who see two pending changes touching the same files. Mitigation: this change is purely additive at the file level (new shells) plus internal rewrites of variant + section bodies; it does not modify any of the other change's spec deltas, route changes, or i18n changes. The two changes are content-orthogonal.
- [**Children typing on `ChartSection`**] → if a future caller passes non-variant children, layout could look wrong. Trade-off accepted; the section components are the only callers and they pass exactly 4 variants each.
- [**Shell becomes too generic**] → adding more recharts variants (Line, Area) later might need new shells; this refactor doesn't try to anticipate them. Acceptable per non-goals.
- [**`BarSeries.dataKey` typed as `string` vs the data record's typed keys**] → `data` is `ReadonlyArray<Record<string, unknown>>`, so `dataKey` is `string`. Recharts already accepts strings; we don't introduce stronger typing because the variants own their `mockData` shapes and pass through known dataKeys ("value", "base", "top", "mid", "a", "b").
