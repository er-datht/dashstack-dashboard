## ADDED Requirements

### Requirement: Mono repo directory structure guidance
The guide SHALL document the recommended directory structure for OpenSpec in a mono repo.

#### Scenario: Root-level openspec directory
- **WHEN** setting up OpenSpec in a mono repo
- **THEN** the guide SHALL instruct to place a single `openspec/` directory at the mono repo root, not per-app

#### Scenario: Per-app instruction files
- **WHEN** a mono repo contains apps with distinct stacks or conventions
- **THEN** the guide SHALL recommend creating per-app instruction files (e.g., `apps/admin/CLAUDE.md`) in addition to the root instruction file

### Requirement: Change scoping conventions for mono repos
The guide SHALL provide naming conventions for scoping changes to specific apps or shared concerns.

#### Scenario: App-scoped change naming
- **WHEN** a change applies to a single app
- **THEN** the guide SHALL instruct to prefix the change name with the app name (e.g., `admin/add-user-mgmt`, `web/redesign-checkout`)

#### Scenario: Cross-app change naming
- **WHEN** a change spans multiple apps or shared infrastructure
- **THEN** the guide SHALL instruct to use a `shared/` prefix or no prefix (e.g., `shared/update-auth-flow`)

### Requirement: Mono repo workflow section template
The guide SHALL provide a workflow section template variant for mono repos that includes change scoping guidance.

#### Scenario: Workflow section includes scoping subsection
- **WHEN** the detected project is a mono repo
- **THEN** the workflow section template SHALL include a "Change Scoping (Mono Repo)" subsection with naming conventions and guidance on root vs per-app changes

### Requirement: Root instruction file documents mono repo structure
The root instruction file SHALL include a section listing all apps/packages and their stacks.

#### Scenario: Root instruction file enumerates apps
- **WHEN** creating the root instruction file for a mono repo
- **THEN** the file SHALL include a table or list of apps with their directory, stack, and app-specific build/test commands

### Requirement: OpenSpec install happens once at root
The guide SHALL instruct to install OpenSpec at the mono repo root, not per-app.

#### Scenario: Single install at root
- **WHEN** setting up OpenSpec in a mono repo
- **THEN** the guide SHALL run install and `openspec init` from the mono repo root only, with a note that per-app installs are unnecessary
