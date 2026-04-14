### Requirement: Popover guests SHALL display as a horizontal avatar row
The EventDetailPopover guests section SHALL render participants as a horizontal flex row of 24×24 circular avatars showing participant initials. Participant names SHALL NOT be displayed. The "Guests" label and divider above the row SHALL remain.

#### Scenario: Event with participants within threshold
- **WHEN** the popover displays an event with 3 or fewer participants
- **THEN** 24×24 rounded-full circles are rendered in a horizontal row with 10px gap, each showing the participant's initials in 8px bold font, with a neutral gray background (`--color-surface-secondary`) and `--color-text-primary` text color

#### Scenario: Event with no participants
- **WHEN** the popover displays an event with zero participants
- **THEN** the guests section (divider, label, and avatar row) SHALL NOT be rendered

### Requirement: Overflow indicator SHALL use primary-colored circle
When the number of participants exceeds the display threshold, a "+N" overflow circle SHALL be rendered at the end of the avatar row. The circle SHALL be 24×24 rounded-full with a transparent background, a 1px solid border in `--color-primary-600`, and text in `--color-primary-600` showing the overflow count (e.g. "15+").

#### Scenario: Event with more participants than threshold
- **WHEN** the popover displays an event with more than 3 participants (EXTRA_PARTICIPANTS_THRESHOLD)
- **THEN** the first 3 participants are shown as avatar circles, followed by a "+N" circle where N is the number of remaining participants, styled with a 1px solid `--color-primary-600` border and `--color-primary-600` text on a transparent background
