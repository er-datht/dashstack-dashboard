## Context

The app has 3 pages with form validation: AddNewContact (3 required fields), Settings (4 required fields), and Calendar AddEventModal (1 required field). Currently, required fields are only distinguishable after a failed submission attempt, which is poor UX. Each page manages its own validation with a `FormErrors` type and `validate()` function, but none visually mark required fields upfront.

## Goals / Non-Goals

**Goals:**
- Add a red asterisk next to every required field label in the app
- Use a consistent pattern across all form pages
- Ensure theme support (the asterisk color adapts via `text-error`)

**Non-Goals:**
- Extracting a shared `<FormLabel>` component (only 3 pages — premature abstraction)
- Adding `aria-required` attributes (existing `aria-invalid` + `aria-describedby` on error is sufficient)
- Changing validation logic or error messages

## Decisions

### 1. Inline `<span>` vs. CSS `::after` pseudo-element
**Decision**: Inline `<span className="text-error">*</span>` inside the `<label>`.
**Rationale**: Visible in the DOM for screen readers, simple to implement, consistent with the existing JSX label pattern. A CSS pseudo-element would be invisible to assistive technology and require SCSS module changes in the Calendar modal.

### 2. Per-label markup vs. shared component
**Decision**: Add the `<span>` directly to each required label rather than creating a `<RequiredLabel>` wrapper.
**Rationale**: Only 8 labels across 3 files. A shared component adds indirection for minimal DRY benefit. If more forms are added later, extraction can happen then.

### 3. Test matcher update strategy
**Decision**: Switch `getByLabelText('exact')` to `getByLabelText(/regex/)` in Settings tests.
**Rationale**: The label's accessible name now includes the asterisk text content. Regex matchers are the standard Testing Library approach for partial label matching. Only Settings tests are affected — Calendar and AddNewContact tests don't query by label text.

## Risks / Trade-offs

- **Test fragility** → Using regex matchers is slightly less strict than exact strings, but the patterns are specific enough (e.g., `/siteName/`) to avoid false matches. Acceptable trade-off for maintainability.
- **No shared component** → If a 4th or 5th form page is added, the inline pattern will need to be repeated. Mitigation: the pattern is a single `<span>` — low copy cost, easy to extract later.
