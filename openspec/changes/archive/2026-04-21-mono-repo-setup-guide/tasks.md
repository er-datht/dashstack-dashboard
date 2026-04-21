## 1. Add Repo Type Detection Step

- [x] 1.1 Add new "Step 1.5: Detect Repo Type" section after Step 1.1 (AI tool detection) with bash commands to check for workspace config (`workspaces` in package.json, `pnpm-workspace.yaml`, `nx.json`, `turbo.json`), directory structure (`apps/`, `packages/` with nested package.json), and non-JS workspaces (`go.work`, Cargo workspace)
- [x] 1.2 Add detection output format: classify as single repo or mono repo, list discovered apps/packages with their detected stacks
- [x] 1.3 Add routing pattern detection commands per app: check for Next.js `pages/` dir (Pages Router), `app/` dir (App Router), or `react-router-dom` dependency (React Router) — include in per-app stack output and single-repo Architecture section

## 2. Update Step 1 — Instruction File for Mono Repos

- [x] 2.1 Update Step 1.2 (project scan) to scan each app/package individually when mono repo is detected — gather per-app stack, dependencies, commands, and routing pattern
- [x] 2.2 Update Step 1.3 (create instruction file) to include mono repo variant: root instruction file with an apps/packages table, plus per-app instruction file template
- [x] 2.3 Add root instruction file template section that lists all apps with directory, stack, and app-specific commands

## 3. Update Step 2 — OpenSpec Install for Mono Repos

- [x] 3.1 Add note in Step 2.2 that install happens at the mono repo root only (not per-app), and that the workspace package manager should be used
- [x] 3.2 Add note in Step 2.3 that `openspec init` runs once at root — single `openspec/` directory for all apps

## 4. Update Step 3 — Workflow Section Templates for Mono Repos

- [x] 4.1 Add "Change Scoping (Mono Repo)" subsection to both workflow templates (with and without subagents) — cover app-prefixed naming (`admin/feature-name`), `shared/` prefix for cross-app changes
- [x] 4.2 Add mono repo-specific notes in "Right-Sizing the Process" for changes that span multiple apps
- [x] 4.3 Add recommended mono repo directory structure diagram showing root openspec/, root CLAUDE.md, and per-app CLAUDE.md files

## 5. Verify and Review

- [x] 5.1 Read the complete updated guide end-to-end to verify single-repo flow is unchanged and mono repo branches integrate cleanly
- [x] 5.2 Verify all detection commands are correct and handle edge cases (no package.json, mixed signals)
