## MODIFIED Requirements

### Requirement: Week view renders all-day events in a pinned row
All-day events SHALL render in a dedicated row above the scrollable time grid. Multi-day all-day events SHALL span across the columns for each day they cover. When two or more all-day events share at least one visible day-column, they SHALL stack into distinct vertical rows within the pinned all-day strip such that no two bars overlap visually. Stacking SHALL use a greedy row-packing strategy with no row cap (unbounded). The pinned all-day strip's height SHALL grow with the number of stack rows so every bar is visible and the time grid below the strip shifts down accordingly. When only a single all-day event (or none) is present, the strip's rendered height and the bar's vertical position SHALL be visually identical to the prior single-row layout.

#### Scenario: Single-day all-day event
- **WHEN** an all-day event exists on Wednesday only
- **THEN** it renders as a bar in the all-day row under the Wednesday column

#### Scenario: Multi-day all-day event spanning columns
- **WHEN** an all-day event spans Tuesday through Thursday
- **THEN** the event bar stretches across the Tuesday, Wednesday, and Thursday columns in the all-day row

#### Scenario: Multi-day event clipped to week boundaries
- **WHEN** an all-day event starts on Friday of the previous week and ends on Tuesday of the current week
- **THEN** the event bar shows from Sunday through Tuesday in the current week's all-day row

#### Scenario: Two all-day events sharing a date stack into separate rows
- **WHEN** two all-day events both fall on Friday in the visible week
- **THEN** the two bars render at distinct vertical positions within the all-day strip
- **AND** neither bar overlaps the other visually
- **AND** the all-day strip's height accommodates both rows

#### Scenario: Non-overlapping all-day events share a single row
- **WHEN** one all-day event is on Monday and another all-day event is on Thursday in the same visible week, with no date overlap
- **THEN** both bars render at the same vertical position (the same row) within the all-day strip
- **AND** the all-day strip's height is the single-row height

#### Scenario: Three or more overlapping all-day events stack into multiple rows
- **WHEN** three all-day events all fall on the same day in the visible week
- **THEN** the three bars render at three distinct vertical positions
- **AND** the all-day strip's height accommodates all three rows
- **AND** the time grid below the strip shifts down by the additional rows' height

#### Scenario: Multi-day bar and single-day bar overlapping share the strip
- **WHEN** a Monday-through-Thursday all-day event and a Wednesday-only all-day event are both in the visible week
- **THEN** the multi-day bar and the single-day bar render at distinct vertical positions
- **AND** neither bar overlaps the other visually

#### Scenario: Empty all-day strip retains its label and minimum height
- **WHEN** the visible week contains no all-day events
- **THEN** the "ALL DAY" label remains visible at its prior vertical position
- **AND** the strip's height equals the single-row height

## ADDED Requirements

### Requirement: Growing the all-day strip preserves time-grid auto-scroll behavior
When the pinned all-day strip grows in height because additional stack rows are required to display overlapping all-day events, the Week view's auto-scroll-to-current-time behavior SHALL remain unchanged. The time grid SHALL continue to auto-scroll on the current week so that the current hour minus approximately two hours is near the top of the time-grid scroll container, regardless of how many rows the all-day strip occupies.

#### Scenario: Auto-scroll on today's week with a single-row all-day strip
- **WHEN** the Week view renders for the week containing today and the all-day strip occupies a single row
- **THEN** the time grid scrolls so the current hour minus two hours is near the top of the time-grid scroll container

#### Scenario: Auto-scroll on today's week with a multi-row all-day strip
- **WHEN** the Week view renders for the week containing today and the all-day strip occupies multiple rows because overlapping all-day events are stacked
- **THEN** the time grid scrolls so the current hour minus two hours is near the top of the time-grid scroll container, identical to the single-row case
- **AND** the additional all-day rows do not alter the time-grid scroll target
