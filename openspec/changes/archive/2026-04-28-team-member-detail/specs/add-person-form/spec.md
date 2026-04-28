## RENAMED Requirements

### Requirement: AddPersonForm shared component accepts 4 configuration props
- **FROM:** AddPersonForm shared component accepts 4 configuration props
- **TO:** PersonForm shared component accepts configuration props

### Requirement: AddPersonForm preserves all existing form behavior
- **FROM:** AddPersonForm preserves all existing form behavior
- **TO:** PersonForm preserves all existing form behavior

### Requirement: AddNewContact becomes a thin wrapper
- **FROM:** AddNewContact becomes a thin wrapper
- **TO:** AddNewContact becomes a thin wrapper

### Requirement: AddNewMember becomes a thin wrapper
- **FROM:** AddNewMember becomes a thin wrapper
- **TO:** AddNewMember becomes a thin wrapper

## MODIFIED Requirements

### Requirement: PersonForm shared component accepts configuration props
The `PersonForm` component (renamed from `AddPersonForm`) SHALL accept props: `namespace` (string), `titleKey` (string), `successKey` (string), `backRoute` (string), optional `onSubmit` callback (`(data: PersonFormData) => void`), optional `initialValues` (`Partial<PersonFormData>` — pre-populates form fields for edit mode), and optional `submitKey` (string — translation key for the submit button, defaults to `"addNow"`). A `PersonFormData` type SHALL be exported from the component. The component directory SHALL be `src/components/PersonForm/`.

#### Scenario: Component renders with provided namespace
- **WHEN** `PersonForm` is rendered with `namespace="contact"` and `titleKey="addNewContact"`
- **THEN** the page heading displays the value of `t("addNewContact")` from the `contact` namespace

#### Scenario: Component renders with different namespace
- **WHEN** `PersonForm` is rendered with `namespace="team"` and `titleKey="addNewMemberTitle"`
- **THEN** the page heading displays the value of `t("addNewMemberTitle")` from the `team` namespace

#### Scenario: onSubmit callback is called with form data on valid submission
- **WHEN** `onSubmit` is provided and user submits a valid form with firstName "Jane", lastName "Doe", email "jane@example.com"
- **THEN** `onSubmit` is called with `{ firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "", dateOfBirth: "", gender: "", photoPreview: null }`

#### Scenario: onSubmit is not provided (backward compatible)
- **WHEN** `onSubmit` is not provided and user submits a valid form
- **THEN** the form behaves identically to before — toast and navigate without calling any callback

#### Scenario: Breadcrumb shows parent and current page
- **WHEN** `PersonForm` is rendered with `namespace="team"`, `titleKey="addNewMemberTitle"`, `backRoute="/team"`
- **THEN** a breadcrumb nav appears above the heading showing "Team" (clickable, navigates to `/team`) followed by a chevron separator and "Add New Member"

#### Scenario: Breadcrumb parent is clickable
- **WHEN** user clicks the parent label in the breadcrumb
- **THEN** the app navigates to `backRoute`

#### Scenario: Form pre-populated with initialValues
- **WHEN** `PersonForm` is rendered with `initialValues={{ firstName: "Jacob", lastName: "Perez", email: "jacob@example.com" }}`
- **THEN** the firstName field shows "Jacob", lastName shows "Perez", email shows "jacob@example.com", and other fields default to empty

#### Scenario: Submit button uses submitKey
- **WHEN** `PersonForm` is rendered with `submitKey="save"`
- **THEN** the submit button displays the translated text for "save" instead of "Add Now"

#### Scenario: Submit button defaults to addNow
- **WHEN** `PersonForm` is rendered without `submitKey`
- **THEN** the submit button displays the translated text for "addNow"

#### Scenario: initialValues with photo
- **WHEN** `PersonForm` is rendered with `initialValues={{ photoPreview: "https://example.com/photo.jpg" }}`
- **THEN** the photo upload area displays the image from the provided URL

### Requirement: AddNewContact becomes a thin wrapper
`AddNewContact` SHALL import and render `PersonForm` (updated import path from `src/components/PersonForm`) with props: `namespace="contact"`, `titleKey="addNewContact"`, `successKey="contactAdded"`, `backRoute={ROUTES.CONTACT}`.

#### Scenario: AddNewContact renders identically
- **WHEN** user navigates to `/contact/add`
- **THEN** the page renders identically to before the rename

### Requirement: AddNewMember becomes a thin wrapper
`AddNewMember` SHALL import and render `PersonForm` (updated import path from `src/components/PersonForm`) with props: `namespace="team"`, `titleKey="addNewMemberTitle"`, `successKey="memberAdded"`, `backRoute={ROUTES.TEAM}`, and an `onSubmit` handler that persists the new member to localStorage.

#### Scenario: AddNewMember renders identically
- **WHEN** user navigates to `/team/add`
- **THEN** the page renders identically to before the rename

#### Scenario: AddNewMember passes onSubmit handler
- **WHEN** user navigates to `/team/add` and submits a valid form
- **THEN** the `onSubmit` handler constructs a `TeamMember` and saves it to localStorage
