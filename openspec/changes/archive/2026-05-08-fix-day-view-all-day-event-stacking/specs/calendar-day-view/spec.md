## MODIFIED Requirements

### Requirement: Day view renders all-day events in a pinned row
Events with `allDay: true` (or no time component) SHALL render in a dedicated row above the scrollable time grid. This all-day row SHALL remain visible when the time grid scrolls. When two or more all-day events are present on the displayed day, they SHALL stack into distinct vertical rows within the pinned all-day strip such that no two bars overlap visually. Stacking SHALL use a greedy row-packing strategy with no row cap (unbounded). The bar host's height SHALL grow with the number of stack rows so every bar is visible and the time grid below the strip shifts down accordingly. When only a single all-day event (or none) is present, the strip's rendered height and the bar's vertical position SHALL be visually identical to the prior single-row layout.

#### Scenario: All-day event appears in top row
- **WHEN** an all-day event exists on the current day
- **THEN** it renders as a horizontal bar in the all-day section above the time grid

#### Scenario: All-day row not shown when no all-day events
- **WHEN** no all-day events exist on the current day
- **THEN** the all-day row is still rendered but appears empty (minimal height)

#### Scenario: Two all-day events stack into separate rows
- **WHEN** two all-day events both fall on the displayed day
- **THEN** the two bars render at distinct vertical positions within the all-day strip
- **AND** neither bar overlaps the other visually
- **AND** the all-day strip's height accommodates both rows

#### Scenario: Three or more all-day events stack into multiple rows
- **WHEN** three or more all-day events fall on the displayed day
- **THEN** all bars render at distinct vertical positions, one per row
- **AND** the all-day strip's height accommodates all rows
- **AND** the time grid below the strip shifts down by the additional rows' height

#### Scenario: Single-event rendering visually unchanged
- **WHEN** exactly one all-day event is present on the displayed day
- **THEN** the bar's vertical position SHALL match the single-bar position from before this change
- **AND** the all-day strip's rendered height SHALL not change visibly

## ADDED Requirements

### Requirement: Growing the all-day strip preserves time-grid auto-scroll behavior
When the pinned all-day strip grows in height because additional stack rows are required to display multiple all-day events on the displayed day, the Day view's auto-scroll-to-current-time behavior SHALL remain unchanged. The time grid SHALL continue to auto-scroll on today's date so that the current hour minus approximately two hours is near the top of the time-grid scroll container, regardless of how many rows the all-day strip occupies.

#### Scenario: Auto-scroll on today with a single-row all-day strip
- **WHEN** the Day view renders for today's date and the all-day strip occupies a single row
- **THEN** the time grid scrolls so the current hour minus two hours is near the top of the time-grid scroll container

#### Scenario: Auto-scroll on today with a multi-row all-day strip
- **WHEN** the Day view renders for today's date and the all-day strip occupies multiple rows because multiple all-day events are stacked
- **THEN** the time grid scrolls so the current hour minus two hours is near the top of the time-grid scroll container, identical to the single-row case
- **AND** the additional all-day rows do not alter the time-grid scroll target
