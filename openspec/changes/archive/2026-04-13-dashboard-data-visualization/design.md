## Context

The DashStack dashboard page is the primary landing view, featuring real-time metrics, interactive charts, and a data table. All visualization components are built with recharts and adapt to three themes. The dashboard uses React Query hooks for data fetching and the generic TableCommon component for tabular data.

## Goals / Non-Goals

**Goals:**
- Document the dashboard page component composition
- Capture how chart components handle theme-aware color palettes
- Explain the TableCommon integration pattern for DealDetailsTable
- Document the PromotionalBanner carousel configuration

**Non-Goals:**
- Adding new chart types or metrics
- Connecting charts to real-time data sources
- Replacing recharts with another charting library

## Decisions

### Decision 1: recharts for Data Visualization
**Choice**: Use the recharts library for all chart components.
**Rationale**: recharts provides declarative React components for charts, integrates well with the React component model, and supports customization for theme-aware styling.
**Alternatives considered**: Chart.js (imperative API), D3 directly (complex for standard charts), Nivo (heavier bundle).

### Decision 2: Theme-Aware Color Maps
**Choice**: Each chart component defines a color palette object mapping theme names to color values, selecting the active palette via `useTheme()`.
**Rationale**: Centralizes theme-specific colors within each chart component, making them self-contained. Each chart can have unique color needs while respecting the active theme.

### Decision 3: react-slick for Carousels
**Choice**: Use react-slick with slick-carousel for the PromotionalBanner carousel.
**Rationale**: Provides auto-play, manual navigation (prev/next arrows), dot indicators, and responsive behavior out of the box.

### Decision 4: Generic TableCommon for Deal Table
**Choice**: Build DealDetailsTable using the generic `TableCommon<Deal>` component rather than a custom table.
**Rationale**: Reuses the established table pattern with built-in pagination, loading states, and consistent styling. Custom cell rendering is handled via the `renderCell` callback.

## Risks / Trade-offs

- **[Static sample data]** → Charts use hardcoded sample data rather than live API data. Mitigation: the pattern is set up for real data integration when backend is available.
- **[recharts bundle size]** → recharts is a significant dependency. Mitigation: only Area chart type is used, and tree-shaking reduces the impact.
- **[Month filter is UI-only]** → Month dropdowns don't filter from an API — they select pre-defined datasets. Mitigation: documented for future API integration.
