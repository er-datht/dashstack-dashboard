## ADDED Requirements

### Requirement: AddEventModal viewport-bound height with sticky header/footer
The AddEventModal card SHALL bound its height to the viewport at `max-height: 90vh` so its content never exceeds the visible viewport. The card SHALL render as a flex column with three regions: a non-scrolling header containing the modal title, a scrollable body containing all form fields, and a non-scrolling footer containing the action buttons (Cancel, Save, and — when editing — Delete). The header SHALL display a 1px theme-aware bottom divider; the footer SHALL display a 1px theme-aware top divider. The footer SHALL remain inside the `<form>` element so the Save button retains native submit behavior. All existing modal behavior — focus trap, Escape-to-close, body-scroll lock, image upload, participants input, validation, theme awareness across light/dark/forest — SHALL remain unchanged.

#### Scenario: Card never exceeds viewport on short viewports
- **WHEN** the AddEventModal opens on a viewport whose height is less than the form's natural content height
- **THEN** the card's rendered height SHALL NOT exceed 90% of the viewport height
- **AND** the action buttons SHALL remain visible and clickable without resizing the window

#### Scenario: Form fields scroll within the modal body
- **WHEN** the form's field content exceeds the available body height
- **THEN** the body region SHALL scroll vertically while the header and footer remain fixed in place
- **AND** the modal title SHALL stay visible at the top of the card during scroll
- **AND** the action buttons SHALL stay visible at the bottom of the card during scroll

#### Scenario: Theme-aware dividers separate header and footer from the body
- **WHEN** the AddEventModal renders in any of the three themes (light, dark, forest)
- **THEN** the header SHALL display a 1px bottom divider using the theme's border token
- **AND** the footer SHALL display a 1px top divider using the same token

#### Scenario: Save button still submits the form
- **WHEN** the user clicks Save inside the sticky footer
- **THEN** the form SHALL submit via its native `onSubmit` handler exactly as before this change
