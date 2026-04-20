## Why

Form pages lack a visual indicator for which fields are required. Users must submit the form and trigger validation errors to discover which fields are mandatory. Adding a red asterisk (`*`) next to required field labels is a widely recognized UX convention that sets expectations before submission.

## What Changes

- Add a red asterisk (`<span className="text-error">*</span>`) to all required field labels across the app
- Affected pages:
  - **AddNewContact** (`src/pages/Contact/AddNewContact/index.tsx`): First Name, Last Name, Email
  - **Settings** (`src/pages/Settings/index.tsx`): Site Name, Copyright, SEO Title, SEO Keywords
  - **Calendar AddEventModal** (`src/pages/Calendar/AddEventModal.tsx`): Event Title
- Update Settings tests to use regex matchers for label text (since labels now contain a child `<span>`)

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `settings-general-form`: Required field labels now include a red asterisk indicator
- `add-new-contact-form`: Required field labels now include a red asterisk indicator
- `calendar-add-event`: Event Title label now includes a red asterisk indicator

## Impact

- **Pages**: 3 files modified to add asterisk spans to label elements
- **Tests**: `src/pages/Settings/__tests__/Settings.test.tsx` updated — `getByLabelText('siteName')` changed to `getByLabelText(/siteName/)` (regex) for all 4 required fields, plus `getByText` assertions similarly updated
- **No new dependencies or API changes**
