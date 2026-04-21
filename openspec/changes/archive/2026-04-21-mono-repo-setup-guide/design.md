## Context

The setup guide (`docs/openspec-setup-guide.md`) walks through a 5-step process: create instruction file → install OpenSpec → add workflow section → optional specs → verify. It assumes a single `package.json`, one tech stack, and one instruction file. Mono repos (workspace-based projects with multiple apps/packages) need a different setup flow — particularly around where `openspec/` lives, how changes are scoped, and how instruction files are structured per app.

## Goals / Non-Goals

**Goals:**
- Add a detection step that identifies mono repo vs single repo based on project signals
- Provide mono repo-specific guidance for each existing step (instruction files, install, workflow section)
- Keep the guide as a single document with branching paths, not two separate guides
- Cover common mono repo patterns: `apps/` + `packages/`, workspace configs (yarn/pnpm/npm/nx/turborepo)

**Non-Goals:**
- Supporting per-app `openspec/` directories (one root `openspec/` is the recommended pattern)
- Covering mono repo tooling setup (turborepo, nx pipelines) — only how OpenSpec integrates with them
- Rewriting the single-repo flow — it stays intact

## Decisions

### Decision 1: Single `openspec/` at root, not per-app
**Choice**: One `openspec/` directory at the mono repo root for all changes and specs.
**Rationale**: Changes often span multiple apps. A single location keeps active work discoverable and avoids fragmented change tracking. App-scoped changes use naming prefixes (e.g., `admin/add-user-mgmt`).
**Alternatives considered**: Per-app `openspec/` directories — rejected because cross-app changes would have no clear home, and the archive would be harder to manage.

### Decision 2: Detection via workspace config + directory structure
**Choice**: Check for workspace indicators in this order: (1) `workspaces` field in root `package.json`, (2) `pnpm-workspace.yaml`, (3) `nx.json` / `turbo.json`, (4) `apps/` or `packages/` directories with their own `package.json` files.
**Rationale**: These signals are reliable and cover the vast majority of JS/TS mono repos. Non-JS mono repos (Go, Rust) use different signals (`go.work`, Cargo workspace) — include those as secondary checks.
**Alternatives considered**: Only checking for `apps/` directory — too fragile, many projects use different directory names.

### Decision 3: Branching within existing steps, not separate sections
**Choice**: Add "If mono repo:" branches within Steps 1, 2, 3 rather than creating entirely separate mono repo sections.
**Rationale**: Most of the setup is identical. Branching keeps the guide DRY and makes it clear which parts differ. A separate "Mono Repo Guide" would duplicate 70% of content.
**Alternatives considered**: Separate guide document — rejected due to maintenance burden and content duplication.

### Decision 4: Per-app instruction files are optional but recommended
**Choice**: Root instruction file is required; per-app files are recommended for large apps with distinct stacks.
**Rationale**: Small mono repos (2-3 similar apps) work fine with just a root file. Large mono repos with mixed stacks (React frontend + Go backend) benefit from per-app files that document app-specific commands and conventions.

## Risks / Trade-offs

- **Non-JS mono repos under-covered** → Mitigated by including Go/Rust workspace detection signals, but the templates are JS-centric. Users of other stacks can adapt.
- **Guide length increases** → Mitigated by keeping branches concise and using collapsible sections or clear "skip if single repo" markers.
