## ADDED Requirements

### Requirement: Popover SHALL NOT overflow the viewport bottom edge
The `EventDetailPopover` SHALL adjust its vertical position so that its bottom edge does not extend beyond the viewport bottom, maintaining at least a 12px margin.

#### Scenario: Event bar near bottom of viewport
- **WHEN** user clicks an event bar whose popover would extend below the viewport bottom
- **THEN** the popover's top position is shifted upward so the entire popover is visible within the viewport with at least 12px margin from the bottom edge

#### Scenario: Popover taller than viewport
- **WHEN** the adjusted top position would go above the viewport top (popover very tall)
- **THEN** the popover's top position is clamped to at least 12px from the top edge

### Requirement: Popover SHALL NOT overflow the viewport right edge
The `EventDetailPopover` SHALL adjust its horizontal position so that its right edge does not extend beyond the viewport right, maintaining at least a 12px margin.

#### Scenario: Event bar near right edge of viewport
- **WHEN** user clicks an event bar whose popover would extend past the viewport right edge
- **THEN** the popover's left position is shifted leftward so the entire popover is visible within the viewport with at least 12px margin from the right edge

### Requirement: Position adjustment SHALL be seamless
The viewport clamping MUST happen without visible flicker to the user.

#### Scenario: Popover appears at adjusted position
- **WHEN** user clicks any event bar
- **THEN** the popover appears at its final (clamped) position without a visible jump or flash
