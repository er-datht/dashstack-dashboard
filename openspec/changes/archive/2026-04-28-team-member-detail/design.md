## Context

The `AddPersonForm` component is a shared form used by both Team and Contact "add" pages. It currently only supports creation — all fields start empty, the button says "Add Now". The `TeamMember` type only stores `name`, `email`, `avatar` — no phone, DOB, or gender. To support a detail/edit page, the form needs pre-population support and the data model needs extending.

## Goals / Non-Goals

**Goals:**
- View and edit existing team member details using the same form layout
- Rename `AddPersonForm` → `PersonForm` for clarity across both modes
- Extend `TeamMember` type and mock data with all form fields
- Persist edits back to localStorage

**Non-Goals:**
- Contact detail page (separate change)
- Delete member functionality
- Backend API integration
- Real photo upload/storage (blob URLs only)

## Decisions

### 1. Rename `AddPersonForm` → `PersonForm`

**Choice**: Rename the component directory, function, and all import paths. The props type becomes `PersonFormProps`. `PersonFormData` stays the same (already generic).

**Why**: The user explicitly requested renaming to avoid confusion in edit mode. "AddPersonForm" implies creation-only. "PersonForm" is neutral — works for add, edit, or view.

**Impact**: 4 files need import updates (AddNewMember, AddNewContact, AppRoutes lazy imports use page wrappers not the form directly, so only the two wrapper files + the form itself + any tests).

### 2. `initialValues` and `submitKey` props

**Choice**: Add `initialValues?: Partial<PersonFormData>` and `submitKey?: string` to `PersonFormProps`.

- `initialValues`: When provided, each `useState` initializer uses the corresponding value from `initialValues` (falling back to empty string/null). This pre-fills the form for edit mode.
- `submitKey`: Translation key for the submit button text. Defaults to `"addNow"` for backward compatibility. Edit mode passes `"save"`.

**Why not a `mode` prop**: A `mode: 'add' | 'edit'` would couple the form to specific use cases. `initialValues` + `submitKey` are composable — the form doesn't need to know whether it's adding or editing.

### 3. Extend `TeamMember` type

**Choice**: Add optional fields to `TeamMember`:
```typescript
firstName?: string;
lastName?: string;
phone?: string;
dateOfBirth?: string;
gender?: string;
```

Keep the existing `name` field for display (TeamCard, grid) — it's the computed display name. `firstName`/`lastName` are the editable source fields.

**Why optional**: Existing mock data and previously-added members don't have these fields. Making them optional avoids a migration. When a member is edited, these fields get populated.

### 4. Mock data enrichment

**Choice**: Add plausible `firstName`, `lastName`, `phone`, `dateOfBirth`, `gender` values to all 12 mock members in `teamData.ts`. Split existing `name` into `firstName`/`lastName`.

**Why**: So the detail page looks populated for demo purposes. Without this, all optional fields would be blank for mock members.

### 5. Name resolution for detail page

**Choice**: When opening a member's detail page, resolve form fields in this priority:
1. Use `firstName`/`lastName` if they exist on the member
2. Fall back to splitting `name` on the first space

This handles both new members (which have `firstName`/`lastName` stored) and legacy members (which only have `name`).

### 6. TeamCard click navigation

**Choice**: Wrap the card's avatar + info area in a clickable region that navigates to `/team/${member.id}`. The Message button remains separate with `stopPropagation` to prevent double-navigation.

**Why not wrapping the entire card**: The Message button navigates to Inbox. If the entire card is clickable, clicking Message would trigger both navigations. Using `stopPropagation` on the Message button click keeps them independent.

### 7. Route pattern

**Choice**: `/team/:id` — matches the existing `products/:id/edit` pattern but without `/edit` since this is a combined view/edit page. Route constant: `TEAM_DETAIL: "/team/:id"` but actual navigation uses the dynamic `/team/${member.id}`.

### 8. Breadcrumb navigation

**Choice**: PersonForm renders a breadcrumb nav above the page heading: `t("title")` (clickable, navigates to `backRoute`) `>` `t(titleKey)` (current page). Uses `ChevronRight` icon as separator.

**Why in PersonForm**: Both add and edit pages need the breadcrumb, and PersonForm is the shared component. The breadcrumb derives the parent label from `t("title")` in the current namespace (e.g., "Team" or "Contact") and uses `backRoute` for navigation — no new props needed.

### 9. Invalid member ID handling

**Choice**: If `useParams` yields an ID not found in the localStorage array, redirect to `/team` using `<Navigate>`.

## Risks / Trade-offs

- **Rename is a wide-touch refactor** → Low risk since it's a find-and-replace across 4 files. No logic changes.
- **`name` field duplication** → `name` coexists with `firstName`/`lastName`. When editing, `name` is recomputed from `firstName + " " + lastName`. Slight redundancy, but avoids breaking TeamCard display logic.
- **Blob URL avatars don't persist across refresh** → Same known limitation from the add flow. Acceptable for mock data.
