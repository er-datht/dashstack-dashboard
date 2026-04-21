## Why

The current OpenSpec setup guide (`docs/openspec-setup-guide.md`) assumes a single-repo project. It doesn't detect or handle mono repo structures (e.g., `apps/admin`, `apps/web`, multiple packages with separate stacks). Users with mono repos need guidance on where to place `openspec/`, how to scope changes per app, and how to write per-app vs root instruction files.

## What Changes

- Add a **repo detection step** early in the guide that checks whether the project is a single repo or mono repo (look for workspace config, `apps/` or `packages/` directories, multiple `package.json` files)
- Add **per-app routing pattern detection** — identify whether each app uses Next.js Pages Router (`pages/`), Next.js App Router (`app/`), or React Router (route definitions in `src/routes/` or similar), and document it in the per-app instruction file
- Add **mono repo-specific workflow section template** covering: change scoping/naming by app, root vs per-app instruction files, shared vs app-specific specs
- Update Step 1 (instruction file creation) to handle **per-app CLAUDE.md files** alongside the root one, including routing conventions per app
- Update Step 2 (OpenSpec init) with mono repo guidance — install once at root, single `openspec/` directory
- Update Step 3 (workflow section) with a **mono repo variant** that includes change scoping conventions
- Keep existing single-repo flow intact — the guide should branch based on detection, not replace

## Capabilities

### New Capabilities
- `mono-repo-detection`: Detection logic to determine if a project is a single repo or mono repo, and identify individual apps/packages within it
- `mono-repo-workflow-setup`: Mono repo-specific workflow setup including change scoping, per-app instruction files, and directory structure guidance

### Modified Capabilities

## Impact

- **Files**: `docs/openspec-setup-guide.md` (primary change — documentation only)
- **Dependencies**: None
- **Breaking changes**: None — existing single-repo instructions remain valid
