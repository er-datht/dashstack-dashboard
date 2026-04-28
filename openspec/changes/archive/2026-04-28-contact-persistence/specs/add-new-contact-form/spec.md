## MODIFIED Requirements

### Requirement: Form submission
When the form passes validation, clicking "Add Now" SHALL persist the new contact to localStorage via an `onSubmit` callback before showing the loading state. The callback SHALL construct a `Contact` object from the `PersonFormData` and prepend it to the contacts array in localStorage under key `'contacts'`. After persisting, the button SHALL show a loading state (spinner icon, button disabled), display a success toast "Contact added successfully", and navigate back to the Contact page (`/contact`) after a 1-second delay.

#### Scenario: Successful submission persists contact
- **WHEN** user fills all required fields with valid data and clicks "Add Now"
- **THEN** the new contact is saved to localStorage, the button shows a loading spinner, a success toast appears, and the page navigates to `/contact` after 1 second

#### Scenario: Button disabled during save
- **WHEN** the form is being submitted
- **THEN** the "Add Now" button is disabled and shows a Loader2 spinner icon
