## ADDED Requirements

### Requirement: Event Title required field asterisk
The Event Title label in the Add/Edit Event modal SHALL display a red asterisk (`*`) indicator using theme-aware `text-error` styling to visually distinguish it as a required field. Other optional field labels (Upload Image, Start Date, End Date, Start Time, End Time, Location, Organizer, Guests) SHALL NOT display an asterisk.

#### Scenario: Event Title shows asterisk indicator
- **WHEN** the Add Event or Edit Event modal opens
- **THEN** the Event Title label SHALL display a red asterisk (`*`) after the label text
- **AND** all other field labels SHALL NOT display an asterisk
