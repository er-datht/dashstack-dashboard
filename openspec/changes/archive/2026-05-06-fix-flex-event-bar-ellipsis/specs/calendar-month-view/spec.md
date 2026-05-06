## ADDED Requirements

### Requirement: Month-view event bars truncate long titles with an ellipsis indicator
Each event bar rendered inside a month-view day cell SHALL display its title on a single line. When the title exceeds the bar's content width, the visible portion SHALL end with a trailing ellipsis ("…") to indicate that text has been truncated. The bar SHALL retain its existing fixed height, padding, left-edge color border, background color, text color, and click behavior. The full event title SHALL remain accessible via the native browser tooltip (`title` attribute on the bar) and via the EventDetailPopover when the bar is clicked.

#### Scenario: Short title fits without truncation
- **WHEN** an event's title fits within the bar's content width on a single line
- **THEN** the title SHALL render in full without an ellipsis indicator

#### Scenario: Long title is truncated with a trailing ellipsis
- **WHEN** an event's title is longer than the bar's content width can display on one line
- **THEN** the rendered text SHALL end with "…" at the right edge
- **AND** the bar's height SHALL remain unchanged
- **AND** the full title SHALL remain accessible via the bar's `title` attribute (native tooltip) and via the EventDetailPopover when the bar is clicked

#### Scenario: Title is vertically centered inside the bar
- **WHEN** an event bar is rendered in a month-view day cell
- **THEN** the title's text baseline SHALL be visually centered within the bar's height
