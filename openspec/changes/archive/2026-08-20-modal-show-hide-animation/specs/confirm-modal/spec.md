## MODIFIED Requirements

### Requirement: ConfirmModal supports keyboard interaction and accessibility
The modal SHALL be accessible via keyboard and screen readers. It SHALL trap focus within the modal, support Escape to cancel, lock body scroll, and include proper ARIA attributes. Initial focus SHALL be placed on the Cancel button to prevent accidental deletion. Because the modal now remains mounted for the duration of an exit animation, the body scroll lock SHALL be released when the modal is actually removed from the DOM rather than when `isOpen` becomes `false`, and the existing `[aria-modal="true"]` handoff guard on that release SHALL continue to apply — including when the other modal present in the DOM is itself still playing an exit animation. Focus SHALL be restored to the previously focused element at the start of the exit animation, so keyboard focus returns immediately rather than after the animation completes. While the modal is exiting it SHALL be inert: its Escape and Tab handling SHALL take no action, and its focus trap SHALL NOT pull focus back into the exiting modal.

#### Scenario: Escape key dismisses the modal
- **WHEN** the confirmation modal is open and the user presses the Escape key
- **THEN** the modal begins its exit animation and is then removed, without deleting the event

#### Scenario: Focus is trapped within the modal
- **WHEN** the confirmation modal is open
- **THEN** Tab and Shift+Tab SHALL cycle focus only among the modal's interactive elements

#### Scenario: Initial focus on Cancel button
- **WHEN** the confirmation modal opens
- **THEN** the Cancel button SHALL receive initial focus

#### Scenario: ARIA attributes are present
- **WHEN** the confirmation modal is rendered
- **THEN** the modal container SHALL have `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title element, and `aria-describedby` pointing to the message element

#### Scenario: Body scroll is locked
- **WHEN** the confirmation modal is open
- **THEN** the document body SHALL have `overflow: hidden` to prevent background scrolling

#### Scenario: Body scroll lock is held through the exit animation
- **WHEN** the confirmation modal's `isOpen` prop becomes `false` and its exit animation begins
- **THEN** the document body SHALL still have `overflow: hidden`
- **AND** the lock SHALL be released only once the modal has been removed from the DOM

#### Scenario: Scroll lock handoff to a still-exiting sibling modal
- **WHEN** the confirmation modal is removed from the DOM while another element with `aria-modal="true"` is still present, including one that is playing its own exit animation
- **THEN** the confirmation modal SHALL leave the body scroll lock in place

#### Scenario: Focus is restored when the exit begins
- **WHEN** the confirmation modal starts its exit animation
- **THEN** focus SHALL be returned to the element that was focused before the modal opened
- **AND** the restoration SHALL NOT wait for the exit animation to complete

#### Scenario: The exiting modal ignores keyboard input
- **WHEN** the user presses Escape or Tab while the confirmation modal is playing its exit animation
- **THEN** the modal SHALL take no action
- **AND** focus SHALL NOT be pulled back into the exiting modal

### Requirement: ConfirmModal cancel dismisses without action
The system SHALL close the confirmation modal and take no delete action when the user cancels. Closing SHALL play the exit animation before the modal is removed from the DOM. Clicks on the overlay of a modal that is already exiting SHALL be swallowed rather than passed through to the page underneath.

#### Scenario: Cancel button click
- **WHEN** the user clicks the cancel button in the confirmation modal
- **THEN** the modal plays its exit animation and is then removed, and the event is NOT deleted

#### Scenario: Overlay click dismisses
- **WHEN** the user clicks the overlay backdrop outside the modal card
- **THEN** the modal plays its exit animation and is then removed, and the event is NOT deleted

#### Scenario: Overlay click during the exit animation has no effect
- **WHEN** the user clicks the overlay while the confirmation modal is already playing its exit animation
- **THEN** the click SHALL have no effect
- **AND** the click SHALL NOT reach any element underneath the overlay

### Requirement: ConfirmModal confirm triggers deletion
The system SHALL execute the delete action and close the modal when the user confirms. The delete action SHALL be applied immediately, without waiting for the exit animation; the modal SHALL then play its exit animation before being removed from the DOM.

#### Scenario: Confirm button click from popover
- **WHEN** the user clicks the delete button in the confirmation modal triggered from EventDetailPopover
- **THEN** the event is deleted immediately and the confirmation modal plays its exit animation before being removed

#### Scenario: Confirm button click from edit modal
- **WHEN** the user clicks the delete button in the confirmation modal triggered from AddEventModal
- **THEN** the event is deleted immediately, and both the confirmation modal and the edit modal play their exit animations simultaneously before being removed

#### Scenario: Stacked exits do not release the scroll lock early
- **WHEN** the confirmation modal and the AddEventModal are both exiting and one is removed from the DOM before the other
- **THEN** the body scroll lock SHALL remain in place until the last of the two has been removed
