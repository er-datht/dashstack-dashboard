## ADDED Requirements

### Requirement: Day view all-day event bars truncate long titles with an ellipsis indicator
Each all-day event bar rendered in the Day view's pinned all-day row SHALL display its title on a single line. When the title exceeds the bar's content width, the visible portion SHALL end with a trailing ellipsis ("…") to indicate that text has been truncated. The bar SHALL retain its existing fixed height, padding, left-edge color border, background color, text color, and click behavior. The full event title SHALL remain accessible via the EventDetailPopover when the bar is clicked.

#### Scenario: Short all-day title fits without truncation
- **WHEN** an all-day event's title fits within the bar's content width on a single line
- **THEN** the title SHALL render in full without an ellipsis indicator

#### Scenario: Long all-day title is truncated with a trailing ellipsis
- **WHEN** an all-day event's title is longer than the bar's content width can display on one line
- **THEN** the rendered text SHALL end with "…" at the right edge
- **AND** the bar's height SHALL remain unchanged
- **AND** the full title SHALL remain accessible via the EventDetailPopover when the bar is clicked

#### Scenario: All-day title is vertically centered inside the bar
- **WHEN** an all-day event bar is rendered in the Day view's pinned all-day row
- **THEN** the title's text baseline SHALL be visually centered within the bar's height
