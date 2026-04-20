## Why

The Calendar page's date header ("Monday, April 20, 2026") is static text — navigating to a distant date requires repeatedly clicking the prev/next arrows. Additionally, the Orders page has a custom-built calendar grid in `DateFilterPopup` that duplicates calendar logic. Adopting `react-calendar` project-wide replaces custom calendar grids with a mature, accessible, consistent widget.

## What Changes

- Install `react-calendar` library (pinned version) as a new dependency
- **CalendarHeader**: Make the date label clickable — clicking it opens a `react-calendar` popup for quick day/month/year drill-down navigation
- **Orders/DateFilterPopup**: Replace the custom 42-cell calendar grid with `react-calendar`, preserving multi-date selection and "Apply Now" behavior
- Style `react-calendar` to match the app's 3-theme system (light/dark/forest) via shared CSS overrides
- Click-outside or Escape closes popups

**Not replaced**: `CalendarGrid.tsx` (month view) — it renders event bars overlaid on the grid, which `react-calendar` does not support.

## Capabilities

### New Capabilities
- `calendar-date-picker`: Click-to-open date picker popup on the Calendar header label, powered by `react-calendar`, with theme-aware styling and keyboard dismissal
- `react-calendar-theme`: Shared CSS overrides for `react-calendar` across all usages, supporting light/dark/forest themes via CSS custom properties

### Modified Capabilities
- `calendar-view-state`: The date label in CalendarHeader gains an `onClick` handler and the parent page passes `currentDate` + `onDateSelect` to CalendarHeader
- `order-filter-system`: DateFilterPopup replaces its custom calendar grid with `react-calendar` in multi-select mode, keeping the same external API (selectedDates, onApply, onClose)

## Impact

- **New dependency**: `react-calendar` (+ `@types/react-calendar`, pinned versions)
- **Calendar page**: `CalendarHeader.tsx` (clickable label + picker popup), `Calendar/index.tsx` (pass new props)
- **Orders page**: `DateFilterPopup.tsx` (replace custom grid with react-calendar), `Orders.module.scss` (remove old grid styles)
- **Shared styles**: New react-calendar theme overrides (in `Calendar.module.scss` or a shared SCSS file)
- **No breaking changes** — existing navigation and filter behavior remain unchanged
