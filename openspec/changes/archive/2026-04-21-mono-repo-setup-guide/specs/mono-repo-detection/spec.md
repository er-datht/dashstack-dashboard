## ADDED Requirements

### Requirement: Detect repo type before setup begins
The guide SHALL include a detection step (Step 1.5, after AI tool detection but before project scan) that determines whether the project is a single repo or mono repo.

#### Scenario: Mono repo detected via workspace config
- **WHEN** the root `package.json` contains a `workspaces` field, OR `pnpm-workspace.yaml` exists, OR `nx.json` exists, OR `turbo.json` exists
- **THEN** the guide SHALL classify the project as a mono repo and identify the workspace packages

#### Scenario: Mono repo detected via directory structure
- **WHEN** no workspace config is found, but `apps/` or `packages/` directories exist containing subdirectories with their own `package.json` files
- **THEN** the guide SHALL classify the project as a mono repo and list the discovered apps/packages

#### Scenario: Non-JS mono repo detected
- **WHEN** `go.work` exists (Go workspace) OR root `Cargo.toml` contains `[workspace]` (Rust workspace)
- **THEN** the guide SHALL classify the project as a mono repo and adapt detection output for the language

#### Scenario: Single repo detected
- **WHEN** none of the mono repo indicators are found
- **THEN** the guide SHALL classify the project as a single repo and continue with the existing flow unchanged

### Requirement: List discovered apps and their stacks
When a mono repo is detected, the guide SHALL enumerate each app/package and detect its tech stack (framework, language, key dependencies, and routing pattern).

#### Scenario: Multiple apps with different stacks
- **WHEN** a mono repo contains apps with different frameworks (e.g., `apps/admin` uses Next.js, `apps/web` uses Vite + React)
- **THEN** the detection output SHALL list each app with its detected stack so that per-app instruction files can be tailored

### Requirement: Detect routing pattern per app
The guide SHALL detect and document the routing pattern used by each app in a mono repo.

#### Scenario: Next.js Pages Router detected
- **WHEN** an app has a `pages/` directory at its root (with route files like `pages/index.tsx`, `pages/api/`) AND `next` is in its dependencies
- **THEN** the detection SHALL classify the app's routing as "Next.js Pages Router" and document conventions: file-based routing via `pages/`, API routes in `pages/api/`, `getServerSideProps`/`getStaticProps` for data fetching

#### Scenario: Next.js App Router detected
- **WHEN** an app has an `app/` directory at its root (with route files like `app/page.tsx`, `app/layout.tsx`) AND `next` is in its dependencies
- **THEN** the detection SHALL classify the app's routing as "Next.js App Router" and document conventions: file-based routing via `app/`, layouts, server components by default, `use client` directive for client components

#### Scenario: React Router detected
- **WHEN** an app has `react-router` or `react-router-dom` in its dependencies AND does NOT use Next.js
- **THEN** the detection SHALL classify the app's routing as "React Router" and document conventions: route definitions (typically in `src/routes/`), lazy-loaded components, programmatic navigation via `useNavigate`

#### Scenario: Single repo routing detection
- **WHEN** the project is a single repo (not a mono repo)
- **THEN** the guide SHALL detect the routing pattern and include it in the instruction file's Architecture section
