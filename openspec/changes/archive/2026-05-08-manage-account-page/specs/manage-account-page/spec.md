## ADDED Requirements

### Requirement: Manage Account route registration
The application SHALL expose a Manage Account page at the route path `/manage-account`. The route constant SHALL be added as `MANAGE_ACCOUNT` to the `ROUTES` object in `src/routes/routes.ts`. The route SHALL be lazy-loaded inside `DashboardLayout` in `src/routes/AppRoutes.tsx` and SHALL be guarded by the existing `withAuth` HOC. Manage Account SHALL NOT appear in the sidebar navigation.

#### Scenario: Authenticated navigation
- **WHEN** an authenticated user navigates to `/manage-account`
- **THEN** the Manage Account page renders inside `DashboardLayout`

#### Scenario: Unauthenticated access
- **WHEN** an unauthenticated user navigates to `/manage-account`
- **THEN** they are redirected to `/login` by the `withAuth` HOC, with `/manage-account` recorded in route state as `from`

#### Scenario: Sidebar omission
- **WHEN** the Sidebar renders
- **THEN** no menu item links to `/manage-account` — the page is reachable only via the TopNav UserMenu dropdown

### Requirement: Page layout follows the Settings page idiom
The Manage Account page SHALL render a heading "Manage Account", a circular avatar uploader centered above the form card, a `card p-8` form container with a 2-column grid that collapses to 1 column below the `md` breakpoint, and a centered Save button at the bottom of the card. Page background SHALL use `bg-page`.

#### Scenario: Visual structure
- **WHEN** the page renders
- **THEN** the layout SHALL include, in order: page heading → centered circular avatar uploader → 2-col form card body → centered Save button

#### Scenario: Responsive collapse
- **WHEN** the viewport is narrower than the `md` Tailwind breakpoint
- **THEN** the 2-col form grid SHALL collapse to 1 column

### Requirement: Avatar upload via drag-drop
The avatar uploader SHALL accept an image via click or drag-and-drop onto the circular dropzone. The dropzone SHALL show a dashed border when empty and switch to a solid border with a `bg-surface-muted` background while a file is being dragged over. The accepted MIME types SHALL be `image/png`, `image/jpeg`, `image/gif`, `image/svg+xml`, and `image/webp`. The maximum file size SHALL be 2 MB. Uploaded files SHALL be read with `FileReader.readAsDataURL` and stored as a data URL.

#### Scenario: Click to upload
- **WHEN** the user clicks the circular dropzone
- **THEN** a hidden file input SHALL be triggered and the chosen file SHALL be applied as the avatar preview

#### Scenario: Drag-drop upload
- **WHEN** the user drops an accepted image file onto the dropzone
- **THEN** the file SHALL be applied as the avatar preview

#### Scenario: Reject oversize file
- **WHEN** the user selects a file larger than 2 MB
- **THEN** the file SHALL NOT be applied
- **AND** an inline error message SHALL be shown beneath the avatar

#### Scenario: Reject unsupported MIME
- **WHEN** the user selects a file whose MIME type is not in the whitelist
- **THEN** the file SHALL NOT be applied
- **AND** an inline error message SHALL be shown beneath the avatar

#### Scenario: Remove uploaded avatar
- **WHEN** an avatar preview is showing and the user clicks "Remove Photo"
- **THEN** the preview SHALL be cleared
- **AND** the dropzone SHALL return to its empty state with the dashed border and camera icon

#### Scenario: Keyboard activation
- **WHEN** the dropzone has keyboard focus and the user presses Enter or Space
- **THEN** the hidden file input SHALL be triggered

### Requirement: Editable form fields with validation
The form SHALL include three editable text fields: Display Name, Phone, and Bio. The Display Name field SHALL be required, trimmed, and limited to 1–60 characters. The Phone field SHALL be optional with no format check. The Bio field SHALL be optional with a soft cap of 200 characters; the textarea SHALL NOT enforce a `maxLength` attribute, but submission SHALL be blocked when the trimmed length exceeds 200. A live character counter (`n / 200`) SHALL be displayed beneath the Bio textarea and SHALL switch to an error color when `n > 200`.

#### Scenario: Display Name required
- **WHEN** the user clicks Save with an empty Display Name (after trimming)
- **THEN** the form SHALL NOT submit
- **AND** the Display Name field SHALL receive `aria-invalid="true"` and `aria-describedby` linking to an inline error message

#### Scenario: Display Name length cap
- **WHEN** the user clicks Save with a Display Name longer than 60 characters (after trimming)
- **THEN** the form SHALL NOT submit
- **AND** an inline error SHALL inform the user of the 60-character limit

#### Scenario: Phone optional
- **WHEN** the user clicks Save with the Phone field empty
- **THEN** the form SHALL submit successfully (Phone is optional)

#### Scenario: Bio counter under cap
- **WHEN** the Bio field contains 0–200 characters
- **THEN** the counter SHALL display `n / 200` in the default text color

#### Scenario: Bio counter over cap
- **WHEN** the Bio field contains more than 200 characters
- **THEN** the counter SHALL display in the error color
- **AND** clicking Save SHALL NOT submit
- **AND** the textarea SHALL receive `aria-invalid="true"` linked to an inline error message

#### Scenario: Required-field asterisk
- **WHEN** the form renders
- **THEN** a red asterisk SHALL appear after the Display Name label only

### Requirement: Read-only fields display from stored user
The form card SHALL display Email and Role as read-only badges (rendered in disabled-input styling, not editable inputs), and a "Member since {date}" line where `{date}` is `User.createdAt` formatted in the user's locale.

#### Scenario: Email and Role rendered read-only
- **WHEN** the page renders
- **THEN** Email and Role SHALL be visually distinct as non-editable (e.g., disabled-input or badge styling)
- **AND** Email SHALL show `User.email` and Role SHALL show `User.role`

#### Scenario: Member since rendered
- **WHEN** the page renders and the stored user has a `createdAt` value
- **THEN** a "Member since {date}" line SHALL be displayed
- **AND** `{date}` SHALL be formatted via the browser's locale-aware date formatter

#### Scenario: Member since absent
- **WHEN** the stored user has no `createdAt` value
- **THEN** the "Member since" line SHALL NOT be rendered

### Requirement: Form prefill on mount from stored user
The form SHALL prefill all editable fields from `getStoredUser()` once on mount via a `useState` initializer. Display Name SHALL prefill from `User.name`, Phone from `User.phone ?? ""`, Bio from `User.bio ?? ""`, and the avatar preview from `User.avatar ?? null`.

#### Scenario: Prefill from stored record
- **WHEN** the page mounts and `getStoredUser()` returns a non-null record
- **THEN** each editable field SHALL initialize from the corresponding User field (empty string for missing optional fields)

#### Scenario: Prefill prior to mount completion
- **WHEN** the page mounts
- **THEN** `getStoredUser()` SHALL be invoked exactly once via the `useState` initializer (no second read on subsequent renders)

### Requirement: Save flow persists to storage and dispatches event
On Save, the page SHALL run client-side validation; if any validation fails, submission SHALL be blocked. On valid submission, the page SHALL call `updateStoredUser({ name, phone, bio, avatar })` (with `phone` and `bio` set to `undefined` when empty so the field is omitted), simulate a 800 ms delay (matching Settings UX), then show a success toast and reset the saving state. If `updateStoredUser` returns `false` (storage write failure, e.g. `QuotaExceededError`), the page SHALL show an error toast and re-enable the Save button.

#### Scenario: Successful save
- **WHEN** validation passes and the user clicks Save
- **THEN** the Save button SHALL display a loading spinner for ~800 ms
- **AND** `updateStoredUser` SHALL be called with the merged patch
- **AND** a success toast SHALL appear after the delay

#### Scenario: Validation failure short-circuits save
- **WHEN** the user clicks Save with invalid input
- **THEN** `updateStoredUser` SHALL NOT be called
- **AND** the form SHALL remain editable

#### Scenario: Storage write failure
- **WHEN** `updateStoredUser` returns `false`
- **THEN** an error toast SHALL appear
- **AND** the Save button SHALL be re-enabled

#### Scenario: User stays on the page after save
- **WHEN** save succeeds
- **THEN** no navigation SHALL occur — the user remains on `/manage-account`

### Requirement: Toast notification placement
Toast notifications SHALL appear at the top-right of the viewport, following the same positioning and styling as the Settings page (`fixed top-6 right-6 z-50`). Toasts SHALL auto-dismiss after 3 seconds.

#### Scenario: Toast position
- **WHEN** a toast is shown
- **THEN** it SHALL appear at the top-right of the viewport with `z-50` layering

#### Scenario: Auto-dismiss
- **WHEN** a toast is shown
- **THEN** it SHALL be removed after 3000 ms

### Requirement: Internationalization with manageAccount namespace
All user-facing text on the page SHALL be loaded via `t()` from a new `manageAccount` namespace. The namespace SHALL be registered in the `i18n.ts` namespace list. Translation files SHALL exist at `public/locales/en/manageAccount.json` and `public/locales/jp/manageAccount.json` with full key parity.

#### Scenario: Namespace registration
- **WHEN** the app boots
- **THEN** `manageAccount` SHALL be among the registered i18next namespaces

#### Scenario: en/jp parity
- **WHEN** the en and jp `manageAccount.json` files are compared
- **THEN** they SHALL contain the same set of keys

#### Scenario: All visible strings translated
- **WHEN** the page renders
- **THEN** no English literal strings SHALL appear inline in the JSX — every label, button, placeholder, error, and toast SHALL use `t()`

### Requirement: Theme support
The page SHALL render correctly in light, dark, and forest themes. Colors SHALL be derived from CSS custom properties or theme-aware Tailwind utility classes — no hardcoded hex values in the page styles.

#### Scenario: All three themes
- **WHEN** the active theme is `light`, `dark`, or `forest`
- **THEN** the page background, card surface, input borders, text colors, and Save button SHALL use the theme's colors via tokens
