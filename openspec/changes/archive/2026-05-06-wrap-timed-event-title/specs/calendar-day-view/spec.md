## ADDED Requirements

### Requirement: Timed event block titles wrap with line-clamp ellipsis derived from block height
Inside a Day view timed event block, the event title SHALL wrap across multiple lines using normal text flow. The number of visible lines SHALL be derived from the block's rendered height (which itself is derived from the event's duration via `calculateEventPosition`), so that taller blocks display more lines and shorter blocks display fewer. When the wrapped title exceeds the visible line budget, the last visible line SHALL end with an ellipsis ("…") indicating that additional content is hidden. Single unbroken words longer than the block's content width SHALL break across lines rather than overflow horizontally. Block dimensions, position math, color, and click behavior SHALL remain unchanged. The full title SHALL remain accessible via the EventDetailPopover when the block is clicked.

#### Scenario: Short title fits on one line without ellipsis
- **WHEN** an event's title fits within a single line of the block's content width
- **THEN** the title SHALL render on one line
- **AND** no ellipsis indicator SHALL be shown

#### Scenario: Multi-word title wraps across multiple lines in a tall block
- **WHEN** an event with a multi-word title spans two or more hours, producing a block tall enough for several lines of 11px text (e.g., a 2-hour block fits roughly 8 lines)
- **THEN** the title SHALL wrap across multiple lines inside the block, up to the line budget for that block height
- **AND** if the title fully fits within the line budget, no ellipsis SHALL be shown

#### Scenario: Long title clamps with ellipsis on the last visible line
- **WHEN** an event's wrapped title would require more lines than the block's height allows
- **THEN** the title SHALL clamp at the maximum number of lines that fit
- **AND** the last visible line SHALL end with a trailing ellipsis ("…")
- **AND** the full title SHALL remain accessible via the EventDetailPopover when the block is clicked

#### Scenario: Smallest block (30-minute minimum) shows at least one line
- **WHEN** the event has the minimum height (a 30-minute block, or a sub-30-minute event raised to the 30-minute minimum)
- **THEN** at least one line of the title SHALL render
- **AND** if the title is longer than that one line, that line SHALL end with an ellipsis

#### Scenario: Single unbroken long word wraps rather than overflows
- **WHEN** an event title contains a single word longer than the block's content width (e.g., a URL or no-space string)
- **THEN** the word SHALL break across lines so it does not overflow horizontally
