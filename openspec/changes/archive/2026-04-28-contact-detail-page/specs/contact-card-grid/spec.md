## MODIFIED Requirements

### Requirement: Contact card display
Each contact card SHALL display a large photo area covering approximately 60% of the card height with rounded top corners, the contact's name (bold, centered, truncated to 1 line with tooltip on hover), the contact's email (smaller text, muted color, centered, truncated to 1 line with tooltip on hover), and a "Message" button with a `Mail` icon (outlined with border, centered). The card SHALL have rounded corners, a subtle shadow/border on the surface background, and a hover effect (shadow lift) on desktop. The entire card SHALL be clickable and navigate to `/contact/${contact.id}`. The card SHALL have `cursor-pointer`, `role="link"`, `tabIndex={0}`, and keyboard support (Enter/Space triggers navigation). The Message button SHALL use `e.stopPropagation()` to prevent card navigation when clicked.

#### Scenario: Card renders contact info
- **WHEN** a contact card is displayed
- **THEN** it shows the contact's avatar photo, name (truncated with tooltip), email (truncated with tooltip), and a "Message" button with border

#### Scenario: Card click navigates to detail page
- **WHEN** user clicks on a contact card (outside the Message button)
- **THEN** the app navigates to `/contact/${contact.id}`

#### Scenario: Card keyboard navigation
- **WHEN** user focuses a contact card and presses Enter or Space
- **THEN** the app navigates to `/contact/${contact.id}`

#### Scenario: Message button does not trigger card navigation
- **WHEN** user clicks the "Message" button on a contact card
- **THEN** the app navigates to `/inbox` without triggering the card's click handler

#### Scenario: Card hover effect
- **WHEN** user hovers over a contact card on desktop
- **THEN** the card displays a subtle shadow lift effect and a pointer cursor

#### Scenario: Avatar image fails to load
- **WHEN** a contact's avatar image fails to load or avatar is undefined
- **THEN** a generic Lucide `User` icon SHALL be displayed in a neutral background area in place of the photo

#### Scenario: Long name or email truncation
- **WHEN** a contact's name or email exceeds the card width
- **THEN** text is truncated to 1 line with ellipsis, and hovering shows the full text in a tooltip
