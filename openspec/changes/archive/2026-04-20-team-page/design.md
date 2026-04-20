## Context

The Team page exists as a placeholder in `src/pages/Team/index.tsx` with routing (`/team`) and sidebar navigation already wired. The Contact page provides a proven pattern for card-grid pages with Load More pagination and companion "Add New" form pages. The goal is to replicate this pattern for Team.

## Goals / Non-Goals

**Goals:**
- Functional Team listing page with card grid and Load More pagination
- Add New Member form page with photo upload, validation, and toast feedback
- Full i18n support (en/jp) via dedicated `team` namespace
- Three-theme support (light/dark/forest) using existing utility classes

**Non-Goals:**
- Team roles or permissions management
- Edit/delete team member functionality
- Backend API integration (mock data only)
- Team member search or filtering

## Decisions

### 1. Reuse Contact page structure verbatim
**Decision**: Mirror the Contact page's component architecture (page + card + data + add form) rather than abstracting a shared "card grid page" component.

**Rationale**: The two pages are similar but not identical (different types, different icon colors, different namespaces). A shared abstraction would add complexity without clear benefit. Copy-and-adapt is simpler and keeps each page independent.

### 2. TeamMember type separate from Contact
**Decision**: Create `src/types/team.ts` with a `TeamMember` type rather than reusing the `Contact` type.

**Rationale**: Team members are a distinct domain concept. The type is simpler (id, name, email, avatar, createdAt, updatedAt) without contact-specific fields (address, company, tags). Separate types allow independent evolution.

### 3. Icon badge color: error (red/pink)
**Decision**: Use `bg-error-light` / `text-error` for the Team page header icon badge, matching the existing placeholder.

**Rationale**: Contact uses `bg-warning-light` / `text-warning` (yellow). The existing Team placeholder already uses the error color scheme, and the screenshot confirms this styling.

### 4. 12 mock team members
**Decision**: Create 12 mock entries (vs Contact's 18) for a more realistic team size.

**Rationale**: Teams are typically smaller than contact lists. 12 entries still exercises the Load More pagination (6 + 6).

### 5. Route: ADD_TEAM at /team/add
**Decision**: Add `ADD_TEAM: "/team/add"` to routes.ts, following the `ADD_CONTACT: "/contact/add"` pattern.

## Risks / Trade-offs

- **Duplication with Contact**: The Team and Contact pages share ~90% of their structure. This is acceptable technical debt — extracting shared components is a future refactor if a third similar page is needed.
- **Mock data images from randomuser.me**: External dependency for avatars. If the service is down, the User icon fallback handles it gracefully.
