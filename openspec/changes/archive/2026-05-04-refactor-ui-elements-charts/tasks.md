## 1. Create the three shell components

- [x] 1.1 Create `src/pages/UiElements/components/BarShell.tsx` with `BarSeries` + `BarShellProps` types and a default-exported `BarShell` component. The shell wraps `<ResponsiveContainer width="100%" height={180}>` → `<BarChart data={data}>` → `<XAxis dataKey="name" hide />` + `<YAxis hide />` + `<Tooltip cursor={{ fill: "transparent" }} content={<ChartTooltip />} />` and maps `series` to `<Bar>` elements (forwarding `dataKey`, `fill`, `stackId?`, `barSize?`, `radius?` verbatim, omitting any prop that is `undefined`)
- [x] 1.2 Create `src/pages/UiElements/components/PieShell.tsx` with `PieCell` + `PieShellProps` types (props: `data`, `cells`, `innerRadius?: string`) and a default-exported `PieShell` component. The shell wraps `<ResponsiveContainer width="100%" height={180}>` → `<PieChart>` → `<Tooltip content={<ChartTooltip />} />` and a `<Pie>` element with fixed `cx="50%" cy="50%" outerRadius="85%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}`. The `innerRadius` prop is forwarded only when defined. The shell maps `cells` to ordered `<Cell>` children
- [x] 1.3 Create `src/pages/UiElements/components/ChartSection.tsx` with `ChartSectionProps` (`title: string`, `children: ReactNode`) and a default-exported `ChartSection` component. The shell renders `<section className="card p-6">` → `<h2 className="text-lg font-semibold text-primary mb-4">{title}</h2>` → `<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{children}</div>`

## 2. Rewrite the four bar chart variants

- [x] 2.1 Rewrite `src/pages/UiElements/charts/BarVariantPlain.tsx` to call `<BarShell data={barPlainData} series={[{ dataKey: "value", fill: colors.plainBlue, barSize: 12, radius: [4, 4, 0, 0] }]} />`. Keep `useChartTheme()` + `getBarColors(theme)` calls
- [x] 2.2 Rewrite `src/pages/UiElements/charts/BarVariantStacked2.tsx` to call `<BarShell data={barStacked2Data} series={[{ dataKey: "base", fill: colors.stacked2Base, stackId: "a", barSize: 12 }, { dataKey: "top", fill: colors.stacked2Top, stackId: "a", barSize: 12, radius: [4, 4, 0, 0] }]} />`
- [x] 2.3 Rewrite `src/pages/UiElements/charts/BarVariantGrouped.tsx` to call `<BarShell data={barGroupedData} series={[{ dataKey: "a", fill: colors.groupedA, radius: [4, 4, 0, 0] }, { dataKey: "b", fill: colors.groupedB, radius: [4, 4, 0, 0] }]} />` (no `stackId`, no `barSize`)
- [x] 2.4 Rewrite `src/pages/UiElements/charts/BarVariantStacked3.tsx` to call `<BarShell data={barStacked3Data} series={[{ dataKey: "base", fill: colors.stacked3Base, stackId: "a", barSize: 12 }, { dataKey: "mid", fill: colors.stacked3Mid, stackId: "a", barSize: 12 }, { dataKey: "top", fill: colors.stacked3Top, stackId: "a", barSize: 12, radius: [4, 4, 0, 0] }]} />`

## 3. Rewrite the four pie/donut chart variants

- [x] 3.1 Rewrite `src/pages/UiElements/charts/PieVariantSingle.tsx` to call `<PieShell data={pieData(value)} cells={[{ fill: color }, { fill: colors.track }]} />`. Keep the `(color, value)` props and the `useChartTheme()` + `getPieColors(theme)` calls
- [x] 3.2 Rewrite `src/pages/UiElements/charts/DonutVariantSingle.tsx` to call `<PieShell data={donutSingleData(value)} cells={[{ fill: color }, { fill: colors.track }]} innerRadius="60%" />`. Keep the `(color, value)` props
- [x] 3.3 Rewrite `src/pages/UiElements/charts/DonutVariantStacked2.tsx` to call `<PieShell data={donutStacked2Data} cells={[{ fill: colors.yellow }, { fill: colors.teal }, { fill: colors.track }]} innerRadius="60%" />`
- [x] 3.4 Rewrite `src/pages/UiElements/charts/DonutVariantStacked3.tsx` to call `<PieShell data={donutStacked3Data} cells={[{ fill: colors.yellow }, { fill: colors.teal }, { fill: colors.tealLight }, { fill: colors.blue }, { fill: colors.orange }]} innerRadius="60%" />` (no track cell)

## 4. Rewrite the three section components

- [x] 4.1 Rewrite `src/pages/UiElements/components/BarChartSection.tsx` to call `<ChartSection title={t("uiElements:sections.bar")}>` with the 4 bar variants as children. Drop the inline card + grid markup
- [x] 4.2 Rewrite `src/pages/UiElements/components/PieChartSection.tsx` to call `<ChartSection title={t("uiElements:sections.pie")}>` with 4 `<PieVariantSingle />` calls (preserving the existing color/value pairs: blue 25%, purple 25%, orange 33%, blue 33%)
- [x] 4.3 Rewrite `src/pages/UiElements/components/DonutChartSection.tsx` to call `<ChartSection title={t("uiElements:sections.donut")}>` with the 2 `<DonutVariantSingle />` calls (teal, blue) followed by `<DonutVariantStacked2 />` and `<DonutVariantStacked3 />`

## 5. Verification

- [x] 5.1 Run `yarn lint` — confirm no new lint issues introduced (5 pre-existing issues are unrelated)
- [x] 5.2 Run `yarn build` — confirm clean TypeScript compile + Vite bundle
- [x] 5.3 Run `yarn test --run` — confirm 458/458 tests still pass without modification
- [x] 5.4 Start `yarn dev`, open `/ui-elements` in a browser, and visually verify all 12 charts in **light** theme look identical to pre-refactor
- [x] 5.5 Switch to **dark** theme; verify all 12 charts look identical to pre-refactor
- [x] 5.6 Switch to **forest** theme; verify all 12 charts look identical to pre-refactor
- [x] 5.7 Hover over each chart variant; verify tooltips appear with the same content as before
- [x] 5.8 Click the Filter By dropdown and exercise each option (Charts / Bar Chart / Pie Chart / Donut Chart); verify section visibility behavior is unchanged
