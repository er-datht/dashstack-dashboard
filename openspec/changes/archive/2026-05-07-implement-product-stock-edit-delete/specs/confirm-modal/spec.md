## ADDED Requirements

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

## MODIFIED Requirements

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
