## Why

Document the dashboard page composition and data visualization components of DashStack. The main dashboard features stat cards, interactive charts (built with recharts), and a deals data table, all adapting to three themes. This spec captures the component architecture, chart configuration, data flow, and theme adaptation patterns for the dashboard's visualization layer.

## What Changes

- Document the Dashboard page layout and composition (stat cards, charts, table)
- Document RevenueChart and SalesDetailsChart recharts implementations with theme-aware colors
- Document DealDetailsTable with TableCommon integration, pagination, and status badges
- Document PromotionalBanner carousel with react-slick auto-play
- Document theme adaptation patterns for chart colors

## Capabilities

### New Capabilities
- `dashboard-composition`: Dashboard page structure with stat cards, chart placement, and data table layout
- `chart-components`: RevenueChart and SalesDetailsChart implementations using recharts with theme-aware color palettes and month filtering
- `deal-details-table`: DealDetailsTable component using the generic TableCommon, with pagination, status badges, and month filtering

### Modified Capabilities

## Impact

- **Files**: `src/pages/Dashboard/index.tsx`, `src/components/RevenueChart/`, `src/components/SalesDetailsChart/`, `src/components/DealDetailsTable/`, `src/components/PromotionalBanner/`
- **Dependencies**: `recharts` for charts, `react-slick` + `slick-carousel` for carousels
- **Convention**: Chart components must define color palettes for all 3 themes
