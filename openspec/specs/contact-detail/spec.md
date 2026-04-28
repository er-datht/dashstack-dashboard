# Capability: contact-detail

## Purpose

Contact detail/edit page that displays a pre-filled PersonForm for viewing and editing an individual contact's information, with localStorage persistence for edits.

## Requirements

### Requirement: ContactDetail page at /contact/:id
A `ContactDetail` page SHALL be accessible at route `/contact/:id`. It SHALL read the contact with the matching `id` from the `'contacts'` localStorage array, resolve `firstName`/`lastName` (from stored fields or by splitting `name` on first space), and render `PersonForm` in edit mode with `initialValues` pre-populated, `submitKey="save"`, and `titleKey` set to display the contact's name as the page heading.

#### Scenario: Detail page renders with pre-filled form
- **WHEN** user navigates to `/contact/1` for contact "Natali Craig"
- **THEN** the page displays PersonForm with firstName "Natali", lastName "Craig", email pre-filled, and other fields from the contact's data

#### Scenario: Page title shows contact name
- **WHEN** user navigates to a contact's detail page
- **THEN** the page heading shows the contact's name (e.g., "Natali Craig")

#### Scenario: Submit button says "Save"
- **WHEN** the detail page renders
- **THEN** the submit button displays the translated text for "save" instead of "Add Now"

#### Scenario: Breadcrumb shows Contact and contact name
- **WHEN** user navigates to `/contact/1` (Natali Craig)
- **THEN** a breadcrumb shows "Contact" (clickable, navigates to `/contact`) followed by "Natali Craig"

### Requirement: Saving edits updates contact in localStorage
When the user submits the form on the detail page, the system SHALL update the matching contact in the `'contacts'` localStorage array with the new field values (firstName, lastName, name recomputed as `firstName + " " + lastName`, email, phone, dateOfBirth, gender, avatar), update `updatedAt` to the current ISO timestamp, show a success toast, and navigate back to `/contact`.

#### Scenario: Edit and save a contact
- **WHEN** user changes firstName from "Natali" to "Natalie" and clicks Save
- **THEN** the contact's `firstName` is updated to "Natalie", `name` becomes "Natalie Craig", `updatedAt` is refreshed, and the user is navigated to `/contact`

#### Scenario: Updated contact visible in contact list
- **WHEN** user edits a contact and navigates back to the contact list
- **THEN** the contact card shows the updated name

### Requirement: Invalid contact ID redirects to /contact
If the `id` parameter does not match any contact in localStorage, the page SHALL redirect to `/contact`.

#### Scenario: Non-existent contact ID
- **WHEN** user navigates to `/contact/999` and no contact with id "999" exists
- **THEN** the user is redirected to `/contact`

### Requirement: Route and lazy loading
The route `contact/:id` SHALL be registered in `AppRoutes.tsx` with a lazy-loaded `ContactDetail` component. A `CONTACT_DETAIL` constant SHALL be added to the ROUTES object in `routes.ts`.

#### Scenario: Route is accessible
- **WHEN** user navigates to `/contact/1`
- **THEN** the ContactDetail page loads via lazy import

### Requirement: Detail page i18n
The detail page SHALL use translation keys from the `contact` namespace. New keys SHALL include `save` (button text) and `contactUpdated` (success toast). Translations SHALL be provided for `en` and `jp` locales.

#### Scenario: English translations
- **WHEN** locale is `en` and user is on the detail page
- **THEN** the save button shows "Save" and the success toast shows "Contact updated successfully"

#### Scenario: Japanese translations
- **WHEN** locale is `jp` and user is on the detail page
- **THEN** the save button shows "保存" and the success toast shows "連絡先が正常に更新されました"
