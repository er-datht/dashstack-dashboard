## ADDED Requirements

### Requirement: BarShell renders bar charts for UI Elements
The UI Elements page SHALL render every bar chart variant through a shared `BarShell` component located at `src/pages/UiElements/components/BarShell.tsx`. The shell SHALL own the `<ResponsiveContainer width="100%" height={180}>`, the `<BarChart>` wrapper, hidden `<XAxis dataKey="name" hide />` and `<YAxis hide />`, and a `<Tooltip cursor={{ fill: "transparent" }} content={<ChartTooltip />} />`. The shell SHALL accept `data` (the chart data array) and `series` (an ordered list of `{ dataKey, fill, stackId?, barSize?, radius? }` entries) as props and SHALL render one `<Bar>` per series entry, forwarding each prop verbatim. Bar variant components SHALL NOT instantiate `<BarChart>`, `<XAxis>`, `<YAxis>`, `<Tooltip>`, or `<ResponsiveContainer>` directly; they SHALL only declare data and series and delegate render to `BarShell`.

#### Scenario: Bar variant uses BarShell
- **WHEN** a bar chart variant component renders
- **THEN** its JSX consists of a single `<BarShell />` call with `data` and `series` props, with no direct recharts imports beyond what the shell exposes

#### Scenario: BarShell omits implicit defaults
- **WHEN** a series entry omits `barSize` (as the grouped variant does)
- **THEN** the rendered `<Bar>` does not receive a `barSize` prop, preserving recharts' default grouped sizing

#### Scenario: BarShell forwards radius per series
- **WHEN** a series entry includes `radius`
- **THEN** the rendered `<Bar>` receives that exact radius array; sibling bars without `radius` do not get any radius

### Requirement: PieShell renders pies and donuts for UI Elements
The UI Elements page SHALL render every pie and donut chart variant through a shared `PieShell` component located at `src/pages/UiElements/components/PieShell.tsx`. The shell SHALL own the `<ResponsiveContainer width="100%" height={180}>`, the `<PieChart>` wrapper, a `<Tooltip content={<ChartTooltip />} />`, and a `<Pie>` element with the fixed props `cx="50%"`, `cy="50%"`, `outerRadius="85%"`, `startAngle={90}`, `endAngle={-270}`, `stroke="none"`, and `isAnimationActive={false}`. The shell SHALL accept `data`, `cells` (an ordered list of `{ fill: string }` entries), and an optional `innerRadius?: string` prop. When `innerRadius` is omitted, the rendered Pie SHALL be a solid pie; when provided (typically `"60%"`), the rendered Pie SHALL be a donut. The shell SHALL render one `<Cell>` per cells entry, in order. Pie and donut variants SHALL NOT instantiate `<PieChart>`, `<Pie>`, `<Tooltip>`, or `<ResponsiveContainer>` directly.

#### Scenario: Pie variant uses PieShell without innerRadius
- **WHEN** a pie chart variant renders
- **THEN** it calls `<PieShell />` without an `innerRadius` prop, producing a solid pie

#### Scenario: Donut variant uses PieShell with innerRadius
- **WHEN** a donut chart variant renders
- **THEN** it calls `<PieShell innerRadius="60%" />`, producing a donut

#### Scenario: PieShell does not auto-append a track cell
- **WHEN** a variant supplies a `cells` array without a final track cell (as `DonutVariantStacked3` does)
- **THEN** the rendered `<Pie>` contains exactly the cells declared by the variant, with no track cell auto-appended

#### Scenario: Cells render in declaration order
- **WHEN** a variant supplies cells `[{fill: A}, {fill: B}, {fill: C}]`
- **THEN** the rendered `<Pie>` contains `<Cell>` elements in the order A, B, C

### Requirement: ChartSection wraps each gallery section
The UI Elements page SHALL render every section card (Bar Chart, Pie Chart, Donut Chart) through a shared `ChartSection` component located at `src/pages/UiElements/components/ChartSection.tsx`. The shell SHALL render a `card`-class `<section>` containing a section title heading and a responsive grid (`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4`) of children. The shell SHALL accept `title` (a string) and `children` (React nodes) as props. Section components SHALL NOT duplicate the card-wrapper or grid markup; they SHALL only call `ChartSection` and pass their ordered chart variants as children.

#### Scenario: Section uses ChartSection
- **WHEN** any of the three section components (Bar, Pie, Donut) renders
- **THEN** it returns `<ChartSection title={...}>` with its 4 chart variants as children, with no direct card-wrapper or grid markup

#### Scenario: ChartSection title is translatable
- **WHEN** a section component passes a translated string from `t("uiElements:sections.bar")` (or `pie` or `donut`)
- **THEN** the rendered `<h2>` displays that translated string

#### Scenario: Children render inside the responsive grid
- **WHEN** a section component passes 4 chart variant components as children
- **THEN** the rendered grid contains exactly those 4 children in order, laid out 1-column on mobile, 2-column on tablet (`md` breakpoint), and 4-column on desktop (`xl` breakpoint)

### Requirement: Variants own theme + palette lookup
Chart variant components SHALL retain their own `useChartTheme()` and per-family palette lookup (`getBarColors`, `getPieColors`, `getDonutColors`). Shells SHALL receive only resolved `string` color values via `series[].fill` and `cells[].fill` and SHALL NOT import any palette types or theme primitives.

#### Scenario: Variant resolves palette internally
- **WHEN** a chart variant renders
- **THEN** it calls `useChartTheme()` and `getXxxColors(theme)` within its own body and passes the resolved hex strings into the shell

#### Scenario: Shell exposes no palette types
- **WHEN** a developer reads `BarShell.tsx` or `PieShell.tsx`
- **THEN** the file does not import `BarPalette`, `PiePalette`, `DonutPalette`, or any theme-related type

### Requirement: Refactor preserves observable behavior
The shell-based rewrite SHALL produce pixel-identical output to the pre-refactor implementation: same chart types, same series and cells per variant, same colors per theme, same hidden axes, same tooltip behavior via `ChartTooltip`, same responsive grid breakpoints, same filter-driven section visibility on the page.

#### Scenario: Existing test suite remains green
- **WHEN** the refactor is applied
- **THEN** the existing `__tests__/index.test.tsx` and `__tests__/FilterByDropdown.test.tsx` continue to pass without modification (the public contract — section visibility based on filter, dropdown options — is preserved)

#### Scenario: Visual diff is empty across themes
- **WHEN** the page is loaded in light, dark, and forest themes after the refactor
- **THEN** the rendered charts are visually indistinguishable from the pre-refactor rendering
