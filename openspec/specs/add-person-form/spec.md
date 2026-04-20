# Capability: add-person-form

## Purpose

Shared `AddPersonForm` component that encapsulates the person-creation form (photo upload, 6 fields, validation, submission) and is configured via props so that `AddNewContact` and `AddNewMember` are thin wrappers.

## Requirements

### Requirement: AddPersonForm shared component accepts 4 configuration props
The `AddPersonForm` component SHALL accept props: `namespace` (string — i18n namespace), `titleKey` (string — translation key for page heading), `successKey` (string — translation key for success toast), `backRoute` (string — route to navigate to after submission).

#### Scenario: Component renders with provided namespace
- **WHEN** `AddPersonForm` is rendered with `namespace="contact"` and `titleKey="addNewContact"`
- **THEN** the page heading displays the value of `t("addNewContact")` from the `contact` namespace

#### Scenario: Component renders with different namespace
- **WHEN** `AddPersonForm` is rendered with `namespace="team"` and `titleKey="addNewMemberTitle"`
- **THEN** the page heading displays the value of `t("addNewMemberTitle")` from the `team` namespace

### Requirement: AddPersonForm preserves all existing form behavior
The shared component SHALL retain all behavior from the original forms: photo upload with drag-and-drop, 6 form fields (First Name, Last Name, Email required; Phone, Date of Birth, Gender optional), validation with error messages, custom gender dropdown with click-outside/Escape close, and submission with loading spinner, success toast, and navigation.

#### Scenario: Submission uses successKey and backRoute
- **WHEN** user submits a valid form with `successKey="memberAdded"` and `backRoute="/team"`
- **THEN** the toast displays `t("memberAdded")` and navigates to `/team` after 1 second

#### Scenario: All form validation still works
- **WHEN** user submits with empty required fields
- **THEN** validation errors appear identically to the original forms

### Requirement: AddNewContact becomes a thin wrapper
`AddNewContact` SHALL import and render `AddPersonForm` with props: `namespace="contact"`, `titleKey="addNewContact"`, `successKey="contactAdded"`, `backRoute={ROUTES.CONTACT}`.

#### Scenario: AddNewContact renders identically
- **WHEN** user navigates to `/contact/add`
- **THEN** the page renders identically to before the refactor

### Requirement: AddNewMember becomes a thin wrapper
`AddNewMember` SHALL import and render `AddPersonForm` with props: `namespace="team"`, `titleKey="addNewMemberTitle"`, `successKey="memberAdded"`, `backRoute={ROUTES.TEAM}`.

#### Scenario: AddNewMember renders identically
- **WHEN** user navigates to `/team/add`
- **THEN** the page renders identically to before the refactor
