## MODIFIED Requirements

### Requirement: AddEventModal viewport-bound height with sticky header/footer
The AddEventModal card SHALL bound its height to the viewport at `max-height: 90vh` so its content never exceeds the visible viewport. The card SHALL render as a flex column with three regions: a non-scrolling header containing the modal title, a scrollable body containing all form fields, and a non-scrolling footer containing the action buttons (Cancel, Save, and — when editing — Delete). The header SHALL display a 1px theme-aware bottom divider; the footer SHALL display a 1px theme-aware top divider. The footer SHALL remain inside the `<form>` element so the Save button retains native submit behavior. All existing modal behavior — focus trap, Escape-to-close, body-scroll lock, image upload, participants input, validation, theme awareness across light/dark/forest — SHALL remain unchanged. The show/hide animation's `transform: scale()` on the card SHALL NOT disturb the `max-height: 90vh` bound, the three-region flex column, the header and footer dividers, or the body's vertical scrolling.

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

#### Scenario: The scale transform preserves the viewport-bound layout
- **WHEN** the AddEventModal opens with the enter animation on a short viewport with a long form
- **THEN** the card SHALL still be bounded at `max-height: 90vh`
- **AND** the body region SHALL still scroll vertically with the header and footer fixed
- **AND** this SHALL hold in all three themes

## ADDED Requirements

### Requirement: AddEventModal retains its content through the exit animation

Because the modal now remains mounted while it plays an exit animation, and because every close path in the Calendar page clears the editing event in the same update as the open flag, the modal SHALL render its edit-specific content from the last value observed while it was open. The modal title and the presence of the Delete button — along with the event id that Delete targets — SHALL NOT change during the exit animation. In-progress form values SHALL likewise remain visible and fade out as the user left them.

#### Scenario: The modal title does not change mid-exit

- **WHEN** the user dismisses the AddEventModal while editing an existing event, and the parent clears the editing event in the same update
- **THEN** the modal heading SHALL continue to read "Edit Event" for the whole exit animation
- **AND** it SHALL NOT flip to "Add New Event" while still visible

#### Scenario: The Delete button does not disappear mid-exit

- **WHEN** the AddEventModal is dismissed from edit mode
- **THEN** the Delete button SHALL remain rendered in the footer for the duration of the exit animation
- **AND** the footer layout SHALL NOT reflow while the modal is fading out

#### Scenario: Filled-in form values fade out as entered

- **WHEN** the user closes the AddEventModal after typing a title, selecting dates, adding guests, or uploading an image
- **THEN** those values SHALL remain visible throughout the exit animation
- **AND** the user SHALL NOT see a flash of emptied fields before the modal disappears

#### Scenario: Form state is not reset while exiting

- **WHEN** the AddEventModal is playing its exit animation
- **THEN** the form-reset logic SHALL NOT run
- **AND** the reset SHALL run only when the modal is subsequently opened again

#### Scenario: The nested delete-confirm's exit may be truncated by its parent's removal

- **WHEN** the user confirms deletion from within the AddEventModal, closing both the nested confirmation modal and the AddEventModal in the same update
- **THEN** both SHALL begin their exit animations together with equal durations
- **AND** if the AddEventModal is removed from the DOM first, truncating the nested confirmation's remaining exit animation, that SHALL be acceptable behavior
- **AND** the body scroll lock SHALL still be released only once the last modal has been removed
