## 1. Verify Dashboard Page Composition

- [ ] 1.1 Confirm Dashboard page renders 4 stat cards with icons and trends
- [ ] 1.2 Confirm RevenueChart and SalesDetailsChart render in the chart section
- [ ] 1.3 Confirm DealDetailsTable renders below charts with pagination

## 2. Verify Chart Components

- [ ] 2.1 Confirm RevenueChart uses recharts Area chart with Sales and Profit series
- [ ] 2.2 Confirm SalesDetailsChart uses recharts Area chart with volume and percentage
- [ ] 2.3 Confirm both charts define color palettes for light, dark, and forest themes
- [ ] 2.4 Confirm both charts include month dropdown filters
- [ ] 2.5 Confirm charts display loading spinners while data loads

## 3. Verify DealDetailsTable

- [ ] 3.1 Confirm DealDetailsTable uses TableCommon<Deal> generic component
- [ ] 3.2 Confirm columns: Name, Location, DateTime, Amount, Price, Status
- [ ] 3.3 Confirm StatusBadge renders Delivered (teal), Pending (yellow), Rejected (red)
- [ ] 3.4 Confirm pagination with 10 items per page
- [ ] 3.5 Confirm data sourced from useDeals() hook

## 4. Verify PromotionalBanner

- [ ] 4.1 Confirm react-slick carousel with auto-play (5000ms interval)
- [ ] 4.2 Confirm manual prev/next navigation arrows
- [ ] 4.3 Confirm dot indicators for slide position
