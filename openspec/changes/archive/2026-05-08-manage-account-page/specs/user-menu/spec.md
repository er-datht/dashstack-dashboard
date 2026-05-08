## MODIFIED Requirements

### Requirement: Placeholder items show "coming soon" toast
When the user clicks Change Password or Activity Log, the dropdown SHALL close and a "coming soon" toast notification SHALL appear briefly (~2 seconds). Manage Account is no longer a placeholder — it navigates to `/manage-account` (see the new "Manage Account navigates to page" requirement below).

#### Scenario: Clicking placeholder item shows toast
- **WHEN** user clicks "Change Password" or "Activity Log"
- **THEN** the dropdown SHALL close
- **AND** a "coming soon" toast notification SHALL appear and auto-dismiss after approximately 2 seconds

#### Scenario: Manage Account is not a placeholder
- **WHEN** user clicks "Manage Account"
- **THEN** no "coming soon" toast SHALL appear
- **AND** instead the navigation behavior defined in "Manage Account navigates to page" SHALL apply

## ADDED Requirements

### Requirement: Manage Account navigates to page
When the user clicks "Manage Account" in the dropdown, the menu item SHALL navigate the application to `ROUTES.MANAGE_ACCOUNT` (`/manage-account`) using the React Router `useNavigate` hook. The dropdown SHALL close. No toast SHALL be shown.

#### Scenario: Navigation on click
- **WHEN** user clicks "Manage Account"
- **THEN** the application SHALL navigate to `/manage-account`
- **AND** the dropdown SHALL close
- **AND** no toast SHALL be displayed

#### Scenario: Internal action type changes from placeholder to navigation
- **WHEN** the menu item configuration is inspected
- **THEN** the `manageAccount` item's action SHALL be a navigation action (not the shared "placeholder" handler that other Coming-Soon items use)
