## Why

The 8 chart variant files in `src/pages/UiElements/charts/` and the 3 section components in `src/pages/UiElements/components/` repeat the same recharts boilerplate many times: identical `<ResponsiveContainer height={180}>` + `<BarChart>`/`<PieChart>` + hidden axes + `<Tooltip content={<ChartTooltip />} />` wrapping in every bar variant; identical `<Pie cx="50%" cy="50%" outerRadius="85%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>` in every pie/donut variant; identical card-wrapper + 4-column responsive grid in every section. Roughly 95 lines of duplicated frame-code obscure the parts that actually differ between variants (the series declarations and the cell colors). Extracting shared shells lets each variant collapse to a 5–10 line config declaration, which makes future variants (Line, Area, Scatter) trivial to add.

## What Changes

- Extract three shell components in `src/pages/UiElements/components/`:
  - **`BarShell`** — owns the `<ResponsiveContainer>`, `<BarChart>`, hidden `<XAxis>` + `<YAxis>`, and `<Tooltip cursor={{fill:"transparent"}} content={<ChartTooltip />} />`. Renders one `<Bar>` per `series` prop entry. `series` is `Array<{ dataKey, fill, stackId?, barSize?, radius? }>`.
  - **`PieShell`** — owns the `<ResponsiveContainer>`, `<PieChart>`, `<Tooltip content={<ChartTooltip />} />`, and the `<Pie>` element with all fixed props (`cx`, `cy`, `outerRadius`, `startAngle`, `endAngle`, `stroke`, `isAnimationActive`). Accepts an optional `innerRadius` prop (pies omit, donuts pass `"60%"`). Renders one `<Cell>` per `cells` prop entry.
  - **`ChartSection`** — generic card-wrapper with a section title and a `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4` row. Replaces the duplicated structure in `BarChartSection`, `PieChartSection`, `DonutChartSection`.
- Rewrite all 8 chart variants in `src/pages/UiElements/charts/` to use `BarShell` or `PieShell`. Each variant becomes a thin component declaring the data + series/cells + colors and delegating render to the shell.
- Rewrite the 3 section components in `src/pages/UiElements/components/` to use `ChartSection` + ordered children.
- No spec deltas. No new tests. No behavior change.

## Capabilities

### New Capabilities
- `ui-elements-chart-shells`: Architectural commitment that UI Elements chart variants and section components are rendered through three shared shell components — `BarShell`, `PieShell` (with optional `innerRadius`), and `ChartSection`. Future variants and sections SHALL be authored against these shells rather than duplicating recharts boilerplate.

### Modified Capabilities
*None* — observable behavior is preserved exactly. The existing `ui-elements-page` capability still satisfies all its scenarios; only the implementation shape changes.

## Impact

- **Code (added)**:
  - `src/pages/UiElements/components/BarShell.tsx` (~30 lines)
  - `src/pages/UiElements/components/PieShell.tsx` (~30 lines)
  - `src/pages/UiElements/components/ChartSection.tsx` (~15 lines)
- **Code (rewritten in place)**:
  - `src/pages/UiElements/charts/BarVariantPlain.tsx`, `BarVariantStacked2.tsx`, `BarVariantGrouped.tsx`, `BarVariantStacked3.tsx`
  - `src/pages/UiElements/charts/PieVariantSingle.tsx`
  - `src/pages/UiElements/charts/DonutVariantSingle.tsx`, `DonutVariantStacked2.tsx`, `DonutVariantStacked3.tsx`
  - `src/pages/UiElements/components/BarChartSection.tsx`, `PieChartSection.tsx`, `DonutChartSection.tsx`
- **Untouched**: `palette.ts`, `data/mockData.ts`, `useChartTheme.ts`, `ChartTooltip.tsx`, `types.ts`, `index.tsx`, all locale/route/sidebar files.
- **Dependencies**: none added.
- **Tests**: existing `__tests__/index.test.tsx` and `__tests__/FilterByDropdown.test.tsx` continue to pass unchanged — they exercise the public contract (section visibility based on filter, dropdown options) which is preserved by the refactor. No new tests added.
- **Bundle**: marginally smaller due to deduplicated logic; not a goal of the change.
- **Risk**: low — pure code reorg, no behavior change, the existing test suite validates the contract.
