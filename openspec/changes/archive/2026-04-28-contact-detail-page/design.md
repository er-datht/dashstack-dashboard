## Context

The Team section already supports a detail/edit page (`/team/:id`) via `MemberDetail`, a thin wrapper around the shared `PersonForm` component. The Contact section has the same card grid pattern and uses the same `PersonForm` for adding new contacts, but lacks a detail/edit page. All infrastructure (PersonForm, localStorage hooks, routing, i18n) is already in place.

## Goals / Non-Goals

**Goals:**
- Add a contact detail/edit page that exactly mirrors the team member detail page pattern
- Make contact cards clickable with keyboard accessibility
- Maintain consistency between Team and Contact sections

**Non-Goals:**
- Adding contact-specific fields (company, position, address, tags, notes) beyond the 6 PersonForm fields
- Search or filter functionality on the contact detail page
- Contact deletion from the detail page

## Decisions

### 1. Mirror MemberDetail pattern exactly
**Decision**: `ContactDetail` will be a thin `PersonForm` wrapper identical in structure to `MemberDetail`, using `namespace="contact"`, reading from localStorage key `'contacts'`, and navigating back to `/contact`.

**Rationale**: The pattern is proven, the shared component handles all form logic, and consistency reduces maintenance. No reason to deviate.

### 2. Card-level navigation on ContactCard
**Decision**: Add `onClick`, `onKeyDown`, `role="link"`, `tabIndex={0}`, and `cursor-pointer` to the ContactCard wrapper div, with `e.stopPropagation()` on the Message button — identical to TeamCard.

**Rationale**: Direct mirror of TeamCard's accessibility pattern. Users expect consistent card interaction across both sections.

### 3. Route structure `/contact/:id`
**Decision**: Use `CONTACT_DETAIL: "/contact/:id"` as the route constant, nested under the DashboardLayout in AppRoutes.

**Rationale**: Follows the existing `TEAM_DETAIL: "/team/:id"` pattern. No conflict with `/contact/add` since React Router matches static segments before dynamic params.

## Risks / Trade-offs

- **[Low] Name resolution logic duplication**: Both `MemberDetail` and `ContactDetail` resolve `firstName`/`lastName` from stored fields or by splitting `name`. This is intentional — extracting it would over-abstract for two simple cases.
