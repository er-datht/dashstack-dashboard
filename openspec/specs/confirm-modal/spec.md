# confirm-modal Specification

## Purpose
Defines a shared, themed confirmation modal that replaces the browser-native `window.confirm()` dialog across the app. Used by Calendar (event delete from popover and edit modal) and ProductStock (row delete). Lives at `src/components/ConfirmModal/` with no domain coupling: callers pass resolved labels.

## Requirements

### Requirement: ConfirmModal renders themed confirmation dialog
The system SHALL display a custom in-app confirmation modal instead of the browser-native `window.confirm()` dialog. The modal SHALL render with a semi-transparent overlay (z-index: 60, above both modals and popovers), a centered card with a visible title heading, a descriptive message, and two action buttons (cancel and confirm). The confirm button SHALL be styled as a danger/destructive action. The modal SHALL use CSS custom properties from the theme system to support light, dark, and forest themes. The component SHALL be implemented in the shared location at `src/components/ConfirmModal/`.

#### Scenario: Modal appears when delete is triggered from popover
- **WHEN** the user clicks the delete icon in the EventDetailPopover
- **THEN** the popover closes, and a confirmation modal appears with the title from `t("modal.confirmDeleteTitle")`, the message from `t("modal.deleteConfirm")`, a cancel button using `t("modal.cancel")`, and a delete button using `t("modal.delete")`

#### Scenario: Modal appears when delete is triggered from edit modal
- **WHEN** the user clicks the delete button in the AddEventModal (edit mode)
- **THEN** a confirmation modal appears above the edit modal with the title from `t("modal.confirmDeleteTitle")`, the message from `t("modal.deleteConfirm")`, a cancel button using `t("modal.cancel")`, and a delete button using `t("modal.delete")`

#### Scenario: Modal appears when delete is triggered from ProductStock row
- **WHEN** the user clicks the trash icon on a ProductStock row
- **THEN** a confirmation modal appears with the title from `t("confirmDeleteTitle", { ns: "products" })`, the message from `t("deleteConfirm", { ns: "products" })`, a cancel button using `t("cancel")` (or the products-namespaced equivalent), and a confirm button using `t("delete", { ns: "products" })`

#### Scenario: Themed appearance
- **WHEN** the confirmation modal is displayed under any theme (light, dark, forest)
- **THEN** the modal card background, text colors, and button styles SHALL use the active theme's CSS custom properties

### Requirement: ConfirmModal lives in shared components directory
The `ConfirmModal` component SHALL be importable from a shared location at `src/components/ConfirmModal/`, with its TSX entry point at `src/components/ConfirmModal/index.tsx` and its co-located styles at `src/components/ConfirmModal/ConfirmModal.module.scss`. Any caller in the codebase SHALL be able to import it via that shared path.

#### Scenario: Component imports resolve from the shared path
- **WHEN** a caller writes `import ConfirmModal from "../../components/ConfirmModal"` (or the equivalent relative path)
- **THEN** the import resolves to the shared component and its props match the existing `ConfirmModalProps` shape (`isOpen`, `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`)

#### Scenario: ProductStock page uses the shared ConfirmModal
- **WHEN** the ProductStock page renders its delete-confirmation
- **THEN** it imports `ConfirmModal` from `src/components/ConfirmModal/` (not from `src/pages/Calendar/`)

### Requirement: ConfirmModal has no domain coupling
The `ConfirmModal` component SHALL accept all user-visible text (title, message, button labels) as props and SHALL NOT call `useTranslation` itself. Callers SHALL be responsible for resolving i18n keys and passing the resulting strings.

#### Scenario: Different callers pass different labels
- **WHEN** the Calendar passes `t("modal.confirmDeleteTitle")` and the ProductStock passes `t("confirmDeleteTitle", { ns: "products" })`
- **THEN** each modal renders with its caller's resolved title text

### Requirement: ConfirmModal supports keyboard interaction and accessibility
The modal SHALL be accessible via keyboard and screen readers. It SHALL trap focus within the modal, support Escape to cancel, lock body scroll, and include proper ARIA attributes. Initial focus SHALL be placed on the Cancel button to prevent accidental deletion.

#### Scenario: Escape key dismisses the modal
- **WHEN** the confirmation modal is open and the user presses the Escape key
- **THEN** the modal closes without deleting the event

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

### Requirement: ConfirmModal cancel dismisses without action
The system SHALL close the confirmation modal and take no delete action when the user cancels.

#### Scenario: Cancel button click
- **WHEN** the user clicks the cancel button in the confirmation modal
- **THEN** the modal closes and the event is NOT deleted

#### Scenario: Overlay click dismisses
- **WHEN** the user clicks the overlay backdrop outside the modal card
- **THEN** the modal closes and the event is NOT deleted

### Requirement: ConfirmModal confirm triggers deletion
The system SHALL execute the delete action and close the modal when the user confirms.

#### Scenario: Confirm button click from popover
- **WHEN** the user clicks the delete button in the confirmation modal triggered from EventDetailPopover
- **THEN** the event is deleted and the confirmation modal closes

#### Scenario: Confirm button click from edit modal
- **WHEN** the user clicks the delete button in the confirmation modal triggered from AddEventModal
- **THEN** the event is deleted and both the confirmation modal and the edit modal close
