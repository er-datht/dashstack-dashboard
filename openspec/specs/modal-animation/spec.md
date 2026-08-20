# modal-animation Specification

## Purpose
Defines the shared show/hide animation contract for the app's modal dialogs — enter/exit timing and transforms, the deferred-unmount guarantee that keeps a closing modal in the DOM for the duration of its exit animation, uniform treatment of every close path, re-entrancy when a modal is reopened mid-exit, `prefers-reduced-motion` behavior, body-scroll-lock release timing, and theme independence. Implemented by the shared `useModalTransition` hook at `src/hooks/useModalTransition.ts` plus per-component SCSS; currently adopted by `AddEventModal` (`src/pages/Calendar/`) and the shared `ConfirmModal` (`src/components/ConfirmModal/`).

## Requirements

### Requirement: Modal enter animation

When a modal dialog opens, its overlay and its card SHALL animate in together. The overlay SHALL animate `opacity` from `0` to `1`. The card SHALL animate `opacity` from `0` to `1` and `transform` from `scale(0.95) translateY(8px)` to `scale(1) translateY(0)`. Both SHALL run for 200ms with an ease-out curve, sourced from the existing `--transition-base` and `--transition-ease-out` design tokens. The animation SHALL be present on the node in its first painted frame, so no un-animated frame is ever visible. Only `opacity` and `transform` SHALL be animated, so that the animation remains compositor-only and performs no layout or paint work.

#### Scenario: Overlay and card animate in on open

- **WHEN** a modal's `isOpen` prop becomes `true`
- **THEN** the overlay element SHALL carry an enter animation taking `opacity` from `0` to `1`
- **AND** the card element SHALL carry an enter animation taking `opacity` from `0` to `1` and `transform` from `scale(0.95) translateY(8px)` to `scale(1) translateY(0)`
- **AND** both animations SHALL use a 200ms duration and an ease-out timing function

#### Scenario: Enter animation is present on the first painted frame

- **WHEN** the modal node is inserted into the DOM
- **THEN** the enter animation class SHALL already be applied in that same commit
- **AND** the modal SHALL NOT render one frame at its final appearance before jumping back to the animation's starting state

#### Scenario: Only compositor-friendly properties are animated

- **WHEN** either enter animation runs
- **THEN** the animated properties SHALL be limited to `opacity` and `transform`
- **AND** no animated property SHALL trigger layout or repaint of the modal's contents

### Requirement: Modal exit animation with deferred unmount

When a modal dialog closes, it SHALL remain mounted in the DOM for the duration of an exit animation and SHALL be removed only after that animation completes. The overlay SHALL animate `opacity` from `1` to `0`. The card SHALL animate `opacity` from `1` to `0` and `transform` from `scale(1) translateY(0)` to `scale(0.95) translateY(8px)`. Both SHALL run for 150ms with an ease-in curve, sourced from the existing `--transition-fast` and `--transition-ease-in` design tokens. The overlay and card exit durations SHALL be equal so that neither animation is truncated.

#### Scenario: Node is retained during the exit animation

- **WHEN** a modal's `isOpen` prop changes from `true` to `false`
- **THEN** the modal's overlay and card SHALL remain present in the DOM
- **AND** they SHALL carry exit animation classes taking `opacity` to `0` and the card's `transform` to `scale(0.95) translateY(8px)`
- **AND** the exit animations SHALL use a 150ms duration and an ease-in timing function

#### Scenario: Node is removed after the exit animation completes

- **WHEN** the exit animation on the modal's overlay finishes
- **THEN** the modal SHALL be removed from the DOM entirely
- **AND** nothing from the modal SHALL remain rendered

#### Scenario: Unmount is driven by the animation completing, not by a duplicated duration constant

- **WHEN** the exit animation completes
- **THEN** the removal SHALL be triggered by the overlay's `animationend` event
- **AND** the exit's visual timing SHALL be defined solely in the stylesheet, with no matching duration value required in TypeScript

#### Scenario: The enter animation does not trigger an unmount

- **WHEN** the modal is open and its enter animation completes, firing `animationend`
- **THEN** the modal SHALL remain mounted and visible
- **AND** the modal SHALL NOT be removed from the DOM

#### Scenario: A descendant's animation does not trigger an unmount

- **WHEN** an element nested inside the modal completes its own animation and the resulting `animationend` event bubbles up to the overlay
- **THEN** the modal SHALL remain mounted
- **AND** the removal SHALL occur only for an `animationend` whose target is the overlay itself

#### Scenario: Unmount is guaranteed even if the animation never completes

- **WHEN** a modal begins its exit animation and no `animationend` event is ever received for the overlay
- **THEN** the modal SHALL still be removed from the DOM within a bounded fallback interval
- **AND** the application SHALL NOT be left with a permanently visible overlay blocking interaction

### Requirement: Every close path animates identically

All ways of dismissing a modal SHALL route through the same exit animation. No dismissal path SHALL remove the modal instantly.

#### Scenario: Escape key close animates

- **WHEN** the user presses Escape to dismiss an open modal
- **THEN** the modal SHALL play its exit animation before being removed

#### Scenario: Overlay click close animates

- **WHEN** the user clicks the overlay backdrop to dismiss an open modal
- **THEN** the modal SHALL play its exit animation before being removed

#### Scenario: Cancel button close animates

- **WHEN** the user clicks the modal's cancel button
- **THEN** the modal SHALL play its exit animation before being removed

#### Scenario: Successful submit close animates

- **WHEN** a modal closes as the result of a successful save or a confirmed destructive action
- **THEN** the modal SHALL play its exit animation before being removed
- **AND** the underlying data change SHALL be applied without waiting for the animation to finish

### Requirement: Modal animation respects reduced motion

Under `@media (prefers-reduced-motion: reduce)`, the modal animations SHALL be reduced to an imperceptible duration rather than removed. The animation declarations SHALL be retained with their duration overridden to 1ms, so that the `animationend` event still fires and the deferred unmount continues to be event-driven. Reduced-motion handling SHALL be implemented entirely in CSS, with no `window.matchMedia` query in component or hook code.

#### Scenario: Reduced motion collapses the animation duration

- **WHEN** the user's system requests reduced motion
- **THEN** the modal's enter and exit animation durations SHALL be overridden to 1ms
- **AND** the animation declarations SHALL NOT be removed or set to `none`

#### Scenario: Reduced motion still unmounts the modal promptly

- **WHEN** a modal closes while the user's system requests reduced motion
- **THEN** the modal SHALL be removed from the DOM effectively immediately
- **AND** the removal SHALL NOT wait on the bounded fallback interval

#### Scenario: No JavaScript media query is used

- **WHEN** reduced-motion behavior is implemented
- **THEN** neither the modal components nor the shared transition hook SHALL call `window.matchMedia`

### Requirement: Reopening a modal mid-exit restarts the enter animation

A modal that is reopened while its exit animation is still playing SHALL cleanly interrupt the exit and play its enter animation from the beginning. The pending exit SHALL NOT complete and SHALL NOT remove the reopened modal.

#### Scenario: Enter interrupts a playing exit

- **WHEN** a modal's `isOpen` prop returns to `true` while its exit animation is still running
- **THEN** the modal SHALL apply its enter animation and play it from the start
- **AND** the modal SHALL remain mounted

#### Scenario: The pending fallback removal is cancelled on reopen

- **WHEN** a modal is reopened during its exit animation
- **THEN** the bounded fallback that would have removed it SHALL be cancelled
- **AND** the modal SHALL NOT be removed while it is open

### Requirement: An exiting modal is inert

For the duration of its exit animation a modal is visible but SHALL NOT respond to user interaction. Keyboard handlers and overlay-click handlers SHALL take no action while the modal is exiting.

#### Scenario: Keyboard input is ignored while exiting

- **WHEN** the user presses Escape or Tab while a modal is playing its exit animation
- **THEN** the modal SHALL take no action
- **AND** the modal's focus trap SHALL NOT pull focus back into the exiting modal

#### Scenario: Overlay clicks are swallowed, not passed through

- **WHEN** the user clicks the overlay of a modal that is playing its exit animation
- **THEN** the click SHALL have no effect
- **AND** the click SHALL NOT reach any element underneath the overlay

### Requirement: Body scroll lock is released on unmount, not on close

A modal that locks body scroll SHALL hold the lock until it is actually removed from the DOM, not merely until its `isOpen` prop becomes `false`. Releasing the lock at the start of the exit animation would let the scrollbar reappear mid-animation, change the page width, and visibly displace the animating card. The release SHALL additionally be guarded so that a modal does not unlock scrolling while another modal — including one that is still playing its exit animation — remains in the DOM.

#### Scenario: Lock is held for the whole exit animation

- **WHEN** a modal begins its exit animation
- **THEN** the document body SHALL still have `overflow: hidden`
- **AND** the lock SHALL be released only once the modal has been removed from the DOM

#### Scenario: The page does not shift during the exit animation

- **WHEN** a modal plays its exit animation on a page tall enough to scroll
- **THEN** the scrollbar SHALL NOT reappear before the modal is removed
- **AND** the animating card SHALL NOT be displaced horizontally

#### Scenario: A modal does not unlock scrolling while another modal is still present

- **WHEN** two stacked modals close together and one is removed from the DOM while the other is still playing its exit animation
- **THEN** the modal that unmounts first SHALL leave the body scroll lock in place
- **AND** the lock SHALL be released only when the last modal has been removed

### Requirement: Modal animation is theme-independent and additive to existing behavior

The animations SHALL render identically under the light, dark, and forest themes. Adding the animation SHALL NOT change either modal's public prop shape and SHALL NOT require changes at any call site. All pre-existing modal behavior SHALL be preserved. A modal rendered with `isOpen` already `false` SHALL render nothing at all, exactly as before.

#### Scenario: Identical animation across all three themes

- **WHEN** a modal opens or closes under the light, dark, or forest theme
- **THEN** the enter and exit animations SHALL be identical in timing and transform
- **AND** the overlay backdrop SHALL remain theme-independent

#### Scenario: Call sites are unchanged

- **WHEN** the animation is added to a modal component
- **THEN** the component's props SHALL be unchanged
- **AND** no consumer of that component SHALL require modification

#### Scenario: A modal never opened renders nothing

- **WHEN** a modal is rendered for the first time with `isOpen` set to `false`
- **THEN** it SHALL render no DOM at all
- **AND** its container SHALL be empty

#### Scenario: Existing modal behavior is preserved

- **WHEN** a modal with the animation applied is opened
- **THEN** its focus trap, Escape-to-close, initial focus placement, body scroll lock, ARIA attributes, form controls, and validation SHALL behave exactly as they did before the animation was added
