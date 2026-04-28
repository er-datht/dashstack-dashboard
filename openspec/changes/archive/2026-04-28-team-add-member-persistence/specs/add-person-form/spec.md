## MODIFIED Requirements

### Requirement: AddPersonForm shared component accepts 4 configuration props
The `AddPersonForm` component SHALL accept props: `namespace` (string — i18n namespace), `titleKey` (string — translation key for page heading), `successKey` (string — translation key for success toast), `backRoute` (string — route to navigate to after submission), and an optional `onSubmit` callback (`(data: PersonFormData) => void`). A `PersonFormData` type SHALL be exported from the component, containing: `firstName` (string), `lastName` (string), `email` (string), `phone` (string), `dateOfBirth` (string), `gender` (string), `photoPreview` (string | null).

#### Scenario: Component renders with provided namespace
- **WHEN** `AddPersonForm` is rendered with `namespace="contact"` and `titleKey="addNewContact"`
- **THEN** the page heading displays the value of `t("addNewContact")` from the `contact` namespace

#### Scenario: Component renders with different namespace
- **WHEN** `AddPersonForm` is rendered with `namespace="team"` and `titleKey="addNewMemberTitle"`
- **THEN** the page heading displays the value of `t("addNewMemberTitle")` from the `team` namespace

#### Scenario: onSubmit callback is called with form data on valid submission
- **WHEN** `onSubmit` is provided and user submits a valid form with firstName "Jane", lastName "Doe", email "jane@example.com"
- **THEN** `onSubmit` is called with `{ firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "", dateOfBirth: "", gender: "", photoPreview: null }`

#### Scenario: onSubmit is not provided (backward compatible)
- **WHEN** `onSubmit` is not provided and user submits a valid form
- **THEN** the form behaves identically to before — toast and navigate without calling any callback

### Requirement: AddNewMember becomes a thin wrapper
`AddNewMember` SHALL import and render `AddPersonForm` with props: `namespace="team"`, `titleKey="addNewMemberTitle"`, `successKey="memberAdded"`, `backRoute={ROUTES.TEAM}`, and an `onSubmit` handler that persists the new member to localStorage.

#### Scenario: AddNewMember passes onSubmit handler
- **WHEN** user navigates to `/team/add` and submits a valid form
- **THEN** the `onSubmit` handler constructs a `TeamMember` and saves it to localStorage
