# OpenSpec Workflow Setup Guide

> **Purpose**: This file is for Claude to read when setting up the OpenSpec workflow in a new project that does not currently use OpenSpec. Follow these instructions step by step, asking the user for information at each stage.

---

## Step 1: Initialize AI Instruction File (if not present)

Different AI tools use different instruction files. This step creates the right one for the user's tool.

### 1.1 Detect which AI tool is being used

Ask the user:

> "Which AI coding tool are you using? This determines where project instructions are stored."

Then check for existing instruction files:

```bash
ls CLAUDE.md .cursorrules .cursor/rules AGENTS.md .github/copilot-instructions.md GEMINI.md 2>/dev/null || echo "NONE_FOUND"
```

| AI Tool            | Instruction File                                        | Notes                                      |
| ------------------ | ------------------------------------------------------- | ------------------------------------------ |
| **Claude Code**    | `CLAUDE.md`                                             | Project root                               |
| **Cursor**         | `.cursorrules` or `.cursor/rules/*.md`                  | Project root or `.cursor/rules/` directory |
| **GitHub Copilot** | `.github/copilot-instructions.md`                       | Inside `.github/` directory                |
| **Codex (OpenAI)** | `AGENTS.md`                                             | Project root                               |
| **Gemini CLI**     | `GEMINI.md`                                             | Project root                               |
| **Windsurf**       | `.windsurfrules`                                        | Project root                               |
| **Cline**          | `.clinerules`                                           | Project root                               |
| **Multiple tools** | Create one per tool, or share a common file and symlink |

**If the instruction file already exists**: Read it, then skip to Step 2. You'll add the Workflow section later in Step 3.

**If the instruction file does NOT exist**: Continue with Step 1.2 to create it.

### 1.2 Detect repo type (single repo or mono repo)

Before scanning the project, determine whether it's a single repo or a mono repo. This affects how you scan, where instruction files go, and how the workflow section is structured.

Run these checks in order — stop at the first match:

```bash
# 1. Check for workspace config in package.json
node -e "const p = require('./package.json'); if (p.workspaces) { console.log('MONOREPO: workspaces found'); console.log(JSON.stringify(p.workspaces)); } else { console.log('NO_WORKSPACES'); }" 2>/dev/null || echo "NO_PACKAGE_JSON"

# 2. Check for workspace config files
ls pnpm-workspace.yaml nx.json turbo.json lerna.json 2>/dev/null || echo "NO_WORKSPACE_CONFIG"

# 3. Check for apps/ or packages/ directories with their own package.json
result=$(find apps packages -maxdepth 2 -name "package.json" 2>/dev/null); [ -n "$result" ] && echo "$result" || echo "NO_APP_DIRS"

# 4. Non-JS workspace detection
cat go.work 2>/dev/null && echo "GO_WORKSPACE"
grep -l '\[workspace\]' Cargo.toml 2>/dev/null && echo "RUST_WORKSPACE"
```

**Classification:**

| Result                                                                               | Classification           |
| ------------------------------------------------------------------------------------ | ------------------------ |
| `workspaces` field found, OR `pnpm-workspace.yaml` / `nx.json` / `turbo.json` exists | **Mono repo**            |
| `apps/` or `packages/` dirs with nested `package.json` files                         | **Mono repo** (inferred) |
| `go.work` or Cargo `[workspace]` found                                               | **Mono repo** (non-JS)   |
| None of the above                                                                    | **Single repo**          |

**If mono repo detected**, enumerate each app/package:

```bash
# List all apps/packages and detect their stacks
for dir in apps/* packages/*; do
  [ -d "$dir" ] || continue
  echo "=== $dir ==="
  # Framework detection
  cat "$dir/package.json" 2>/dev/null | grep -E '"(next|nuxt|react|vue|angular|svelte)"' || echo "  (no framework detected)"
  # Routing pattern detection (see below)
done
```

**Routing pattern detection** — for each app (or for a single repo), detect the routing approach:

```bash
# Next.js Pages Router: has pages/ directory + next dependency
[ -d "pages" ] || [ -d "src/pages" ] && grep -q '"next"' package.json 2>/dev/null && echo "ROUTING: Next.js Pages Router"

# Next.js App Router: has app/ directory + next dependency
[ -d "app" ] || [ -d "src/app" ] && grep -q '"next"' package.json 2>/dev/null && echo "ROUTING: Next.js App Router"

# React Router: has react-router-dom dependency, no Next.js
grep -q '"react-router-dom"\|"react-router"' package.json 2>/dev/null && ! grep -q '"next"' package.json 2>/dev/null && echo "ROUTING: React Router"
```

For mono repos, run routing detection **per app** (replace `package.json` with `$dir/package.json` and check `$dir/pages/`, `$dir/app/`, `$dir/src/pages/`, `$dir/src/app/`).

**Detection output format** — summarize what was found:

For a **mono repo**, produce a table like:

```
Repo type: Mono repo (yarn workspaces)
Apps detected:
| App          | Directory       | Framework        | Routing              | Build Command  |
|--------------|-----------------|------------------|----------------------|----------------|
| admin        | apps/admin      | Next.js 14       | Pages Router         | next build     |
| web          | apps/web        | Vite + React 19  | React Router v7      | vite build     |
| purchase     | apps/purchase   | Next.js 14       | App Router           | next build     |
| e2e-tests    | apps/e2e        | Playwright       | N/A                  | playwright test|
```

For a **single repo**, note the routing pattern and continue with the standard flow:

```
Repo type: Single repo
Routing: React Router v7 (src/routes/)
```

**If single repo**: Continue with Step 1.3 (scan the project).
**If mono repo**: Continue with Step 1.3, but follow the mono repo variant instructions.

### 1.3 Scan the project

Gather project information by reading the codebase directly — do NOT ask the user for information you can find yourself.

#### Single repo scan

```bash
# Project structure
ls
tree -L 2 2>/dev/null || find . -maxdepth 2 -type f | head -50

# Detect package manager and dependencies
cat package.json 2>/dev/null       # Node.js (also check for yarn.lock, pnpm-lock.yaml, package-lock.json)
cat requirements.txt 2>/dev/null   # Python (also check pyproject.toml, setup.py)
cat go.mod 2>/dev/null             # Go
cat Cargo.toml 2>/dev/null         # Rust
cat Gemfile 2>/dev/null            # Ruby

# Detect build/dev/test/lint commands from scripts
cat package.json | grep -A 20 '"scripts"' 2>/dev/null   # Node.js
cat Makefile 2>/dev/null                                  # Make-based projects
cat Taskfile.yml 2>/dev/null                              # Task runner

# Detect config files (build tools, linters, testing, etc.)
ls tsconfig*.json .eslintrc* vite.config.* webpack.config.* vitest.config.* jest.config.* .prettierrc* 2>/dev/null
```

From the scan, extract:

- **Project overview**: Infer from package.json description, README, or directory structure
- **Tech stack**: Languages, frameworks, key libraries (from dependencies)
- **Package manager**: Detect from lock file (yarn.lock → yarn, package-lock.json → npm, pnpm-lock.yaml → pnpm, go.sum → go, Cargo.lock → cargo)
- **Development commands**: Read from scripts in package.json, Makefile, etc.
- **Testing setup**: Detect from test config files and test directories
- **Styling**: (frontend) Check for tailwind, scss, styled-components, etc. in dependencies
- **API layer**: Check for axios, fetch wrappers, API client files
- **Routing**: Detected in Step 1.2 (Next.js Pages Router, Next.js App Router, or React Router)

#### Mono repo scan (if detected in Step 1.2)

Scan **each app/package individually** in addition to the root:

```bash
# Root-level: package manager, workspace tooling, shared config
cat package.json 2>/dev/null
ls turbo.json nx.json lerna.json 2>/dev/null
ls yarn.lock pnpm-lock.yaml package-lock.json 2>/dev/null

# Per-app scan: repeat for each app/package
for dir in apps/* packages/*; do
  [ -d "$dir" ] || continue
  echo "=== Scanning $dir ==="

  # Dependencies and scripts
  cat "$dir/package.json" 2>/dev/null

  # Config files (build tool, framework)
  ls "$dir"/tsconfig*.json "$dir"/vite.config.* "$dir"/next.config.* "$dir"/webpack.config.* "$dir"/vitest.config.* "$dir"/jest.config.* 2>/dev/null

  # Routing pattern (from Step 1.2 detection)
  # Next.js Pages Router
  [ -d "$dir/pages" ] || [ -d "$dir/src/pages" ] && grep -q '"next"' "$dir/package.json" 2>/dev/null && echo "  Routing: Next.js Pages Router"
  # Next.js App Router
  [ -d "$dir/app" ] || [ -d "$dir/src/app" ] && grep -q '"next"' "$dir/package.json" 2>/dev/null && echo "  Routing: Next.js App Router"
  # React Router
  grep -q '"react-router-dom"\|"react-router"' "$dir/package.json" 2>/dev/null && ! grep -q '"next"' "$dir/package.json" 2>/dev/null && echo "  Routing: React Router"

  # Styling
  grep -E '"tailwindcss"|"sass"|"styled-components"|"@emotion"' "$dir/package.json" 2>/dev/null
done
```

From the per-app scan, extract for each app:

- **App name**: Directory name (e.g., `admin`, `web`)
- **Framework**: Next.js, Vite + React, Vue, etc.
- **Routing pattern**: Next.js Pages Router, Next.js App Router, React Router
- **Build/dev/test commands**: From the app's `package.json` scripts
- **Styling approach**: Tailwind, SCSS, styled-components, etc.
- **Key dependencies**: App-specific libraries

**Only ask the user** for things you genuinely cannot determine from the code:

- What the project does (if no README or description exists)
- Project-specific conventions that aren't documented anywhere
- Which apps are actively developed vs legacy/deprecated

### 1.4 Create the instruction file

Create the appropriate file for the user's AI tool. The content structure is the same regardless of tool — only the filename and header differ.

**For Claude Code** → `CLAUDE.md`
**For Cursor** → `.cursorrules`
**For GitHub Copilot** → `.github/copilot-instructions.md` (create `.github/` dir first)
**For Codex** → `AGENTS.md`
**For Gemini** → `GEMINI.md`
**For multiple tools** → Create the primary one, then tell the user they can symlink or copy for others.

#### Single repo: instruction file template

Use this structure (example shown as CLAUDE.md — adapt the header for other tools):

````markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

{PROJECT_DESCRIPTION}

## Development Commands

```bash
{DEV_COMMAND}      # Start development server
{BUILD_COMMAND}    # Build for production
{TEST_COMMAND}     # Run tests
{LINT_COMMAND}     # Run linter
```
````

**Package Manager**: Use **{PACKAGE_MANAGER}** exclusively.

## Architecture

### Build Stack

{BUILD_STACK_DETAILS}

### Routing

{ROUTING_PATTERN_AND_CONVENTIONS}

<!-- Example for React Router: -->
<!-- React Router v7 with lazy-loaded routes. Route constants in `src/routes/routes.ts`. -->
<!-- Example for Next.js Pages Router: -->
<!-- Next.js Pages Router. Pages in `pages/`, API routes in `pages/api/`. -->
<!-- Example for Next.js App Router: -->
<!-- Next.js App Router. Routes in `app/`, layouts via `layout.tsx`, server components by default. -->

### Project Structure

{KEY_DIRECTORIES_AND_THEIR_PURPOSE}

### Key Libraries

{NOTABLE_DEPENDENCIES_AND_WHAT_THEY_DO}

## Common Gotchas

{LIST_OF_THINGS_THAT_ARE_EASY_TO_GET_WRONG}

````

#### Mono repo: instruction files

For mono repos, create **two levels** of instruction files:

**1. Root instruction file** (required) — covers shared conventions, workspace setup, and the app inventory:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

{PROJECT_DESCRIPTION} — mono repo containing multiple apps.

## Repo Structure

| App | Directory | Framework | Routing | Dev Command | Build Command | Test Command |
|-----|-----------|-----------|---------|-------------|---------------|--------------|
| {APP_NAME} | `apps/{APP_NAME}` | {FRAMEWORK} | {ROUTING_PATTERN} | {DEV_CMD} | {BUILD_CMD} | {TEST_CMD} |
| {APP_NAME_2} | `apps/{APP_NAME_2}` | {FRAMEWORK_2} | {ROUTING_PATTERN_2} | {DEV_CMD_2} | {BUILD_CMD_2} | {TEST_CMD_2} |

**Package Manager**: Use **{PACKAGE_MANAGER}** exclusively.

## Shared Architecture

### Workspace Setup

{WORKSPACE_TOOLING} — e.g., yarn workspaces, pnpm workspaces, turborepo, nx

### Shared Packages

{SHARED_PACKAGES_AND_THEIR_PURPOSE}

## Common Gotchas

{LIST_OF_THINGS_THAT_ARE_EASY_TO_GET_WRONG}
- **Run commands from root** — use workspace commands (e.g., `yarn workspace {APP_NAME} dev`) or `cd` into the app directory
- **Per-app instruction files** — check `apps/{APP_NAME}/CLAUDE.md` for app-specific conventions
````

**2. Per-app instruction files** (recommended for apps with distinct stacks) — placed inside each app directory:

````markdown
# CLAUDE.md

This file provides guidance for the **{APP_NAME}** app within the mono repo.

## Development Commands

```bash
{DEV_COMMAND}      # Start this app's dev server
{BUILD_COMMAND}    # Build this app
{TEST_COMMAND}     # Run this app's tests
{LINT_COMMAND}     # Lint this app
```
````

## Architecture

### Build Stack

{APP_SPECIFIC_BUILD_STACK}

### Routing

{ROUTING_PATTERN_AND_CONVENTIONS}

<!-- Document the specific routing approach for this app -->

### Project Structure

{APP_SPECIFIC_DIRECTORIES}

### Key Libraries

{APP_SPECIFIC_DEPENDENCIES}

## Common Gotchas

{APP_SPECIFIC_GOTCHAS}

````

Per-app instruction files are optional but recommended when:
- Apps use **different frameworks** (e.g., Next.js vs Vite + React)
- Apps use **different routing patterns** (e.g., Pages Router vs App Router vs React Router)
- Apps have **distinct conventions** that would clutter the root file

**Guidelines for writing instruction files:**
- Be specific — include exact file paths, command names, config locations
- Document conventions that aren't obvious from the code (e.g., "use `classnames` not `clsx`", "all imports are relative, no path aliases")
- Document the "why" behind non-obvious decisions
- Keep it factual — describe what IS, not aspirational goals
- Include the routing pattern and its conventions (where routes are defined, how to add new pages)
- The Workflow section will be added in Step 3 after OpenSpec is installed

---

## Step 2: Install OpenSpec CLI

### 2.1 Check if OpenSpec is already installed

```bash
openspec --version 2>&1 || echo "NOT_INSTALLED"
````

### 2.2 If not installed, install the package

**IMPORTANT: You MUST actually run the install command below. Do not skip this step.**

Detect the project's package manager (check for `yarn.lock`, `pnpm-lock.yaml`, or `package-lock.json`) and run the corresponding command:

| Package Manager | Install Command                             |
| --------------- | ------------------------------------------- |
| yarn            | `yarn add -D @fission-ai/openspec@1.3.0`    |
| npm             | `npm install -D @fission-ai/openspec@1.3.0` |
| pnpm            | `pnpm add -D @fission-ai/openspec@1.3.0`    |

If no lock file exists or the project is not Node.js-based, install globally:

```bash
npm install -g @fission-ai/openspec@1.3.0
```

**Mono repo note**: Install at the **mono repo root only**, not in individual apps. Use the root-level package manager. The `openspec` CLI will be available to all apps via the root `node_modules/.bin/`.

After running the install, verify it succeeded:

```bash
openspec --version
```

### 2.3 Initialize OpenSpec in the project

Run with the `--tools` flag matching the user's AI tool from Step 1:

| AI Tool        | Init Command                                                |
| -------------- | ----------------------------------------------------------- |
| Claude Code    | `npx openspec init --tools claude`                          |
| Cursor         | `npx openspec init --tools cursor`                          |
| GitHub Copilot | `npx openspec init --tools github-copilot`                  |
| Codex          | `npx openspec init --tools codex`                           |
| Gemini         | `npx openspec init --tools gemini`                          |
| Windsurf       | `npx openspec init --tools windsurf`                        |
| Cline          | `npx openspec init --tools cline`                           |
| Multiple tools | `npx openspec init --tools claude,cursor` (comma-separated) |
| All tools      | `npx openspec init --tools all`                             |

**Mono repo note**: Run `openspec init` once from the **mono repo root**. This creates a single `openspec/` directory for all apps. Do NOT run `openspec init` inside individual app directories.

This automatically creates:

```
project-root/
├── openspec/
│   ├── specs/              # Main specs (living documentation)
│   └── changes/
│       └── archive/        # Completed changes stored here
```

When a change is created (via `/opsx:propose` or `/opsx:new`), it generates a folder under `changes/`:

```
openspec/changes/{change-name}/
├── .openspec.yaml        # Change metadata (auto-generated by CLI)
├── proposal.md           # Why this change, what changes, impact
├── design.md             # Technical decisions, goals/non-goals, alternatives
├── tasks.md              # Implementation checklist
└── specs/                # Delta specs for this change
    └── {capability}/
        └── spec.md
```

Plus tool-specific command/prompt files. What gets created depends on the AI tool:

| AI Tool        | Files Created                 | Location                                                                  |
| -------------- | ----------------------------- | ------------------------------------------------------------------------- |
| Claude Code    | 11 slash commands + 11 skills | `.claude/commands/opsx/*.md` + `.claude/skills/openspec-*/SKILL.md`       |
| GitHub Copilot | 11 prompt files + 11 skills   | `.github/prompts/opsx-*.prompt.md` + `.github/skills/openspec-*/SKILL.md` |
| Cursor         | 11 rules                      | `.cursor/rules/opsx-*.mdc`                                                |
| Other tools    | Varies                        | Check the output of `openspec init`                                       |

### How to invoke OpenSpec commands per AI tool

Each AI tool uses a different syntax to invoke the same OpenSpec commands:

| AI Tool            | How to invoke                                                                                           | Example                          |
| ------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **Claude Code**    | Type `/` then select the command                                                                        | `/opsx:propose "add search bar"` |
| **GitHub Copilot** | In Copilot Chat, type `#` then select the prompt file, or right-click a `.prompt.md` file → "Open Chat" | `#opsx-propose add search bar`   |
| **Cursor**         | Rules are auto-loaded based on context                                                                  | Reference the rule in chat       |

### OpenSpec commands reference

| Command        | Purpose                                                                                 |
| -------------- | --------------------------------------------------------------------------------------- |
| `propose`      | Create a change and generate all artifacts (proposal, design, specs, tasks) in one step |
| `apply`        | Implement tasks from a change                                                           |
| `archive`      | Archive a completed change                                                              |
| `explore`      | Think through ideas, investigate problems (read-only, no code changes)                  |
| `verify`       | Verify implementation matches change artifacts before archiving                         |
| `sync`         | Sync delta specs from a change to main specs                                            |
| `ff`           | Fast-forward: create all artifacts at once (alias for propose)                          |
| `new`          | Start a new change, step through artifacts one at a time                                |
| `continue`     | Continue working on an existing change (create next artifact)                           |
| `onboard`      | Guided tutorial: walk through a complete workflow cycle with real codebase work         |
| `bulk-archive` | Archive multiple completed changes at once                                              |

### 2.4 Verify installation

```bash
npx openspec --version
npx openspec list
ls openspec/                      # Should show: specs/ changes/
```

Verify that the tool-specific directories were created. For example:

- Claude Code: `ls .claude/commands/opsx/` and `ls .claude/skills/`
- GitHub Copilot: `ls .github/prompts/` and `ls .github/skills/`
- Cursor: `ls .cursor/rules/`

---

## Step 3: Add Workflow Section to the Instruction File

Add the Workflow section to the project's instruction file (CLAUDE.md, .cursorrules, AGENTS.md, etc. — whichever was identified in Step 1). Replace placeholders with project-specific values gathered in Step 1.

- **If the instruction file was created in Step 1**: Append the Workflow section to the end of the file.
- **If it already existed**: Read it, find where the workflow section should go (typically after the Architecture/Conventions sections), and add it there.

### 3.1 Ask the user about their subagents

Before writing the Workflow section, ask the user:

> "Do you have custom subagents defined for this project that you'd like to integrate into the OpenSpec workflow? (e.g., agents in `.claude/agents/`, `.github/skills/`, or similar)
>
> If yes, I'll include them in the workflow so OpenSpec knows when to delegate to your agents during the propose → implement → review cycle.
>
> If no, I'll write a simpler workflow where you handle all steps directly.
>
> Would you like to include your subagents? (yes/no)"

- **If yes**: Use the "Template: Workflow Section (WITH subagents)" below. Read the user's agent definitions to populate the `{SUBAGENT_TABLE}` and `{TYPICAL_SEQUENCES}` placeholders with their actual agents.
- **If no**: Use the "Template: Workflow Section (WITHOUT subagents)" below.

---

### Template: Workflow Section (WITH subagents)

```markdown
## Workflow

### Principles

The workflow follows four OpenSpec principles:

- **Fluid not rigid** — Artifacts can be created in any order. Don't force a linear phase gate when a different sequence makes more sense for the change at hand.
- **Iterative not waterfall** — Requirements change as understanding deepens. Revisit and revise artifacts at any point.
- **Easy not complex** — Every change gets a proposal, but a one-line fix gets a one-line proposal. Size scales _depth_, not which stages run.
- **Brownfield-first** — This is an existing codebase. Read the code, understand what's there, then specify _deltas_ — not green-field descriptions.

### Right-Sizing the Process

Every change runs the same OpenSpec pipeline. Subagents are **mandatory at their stage** — size only affects how deep each agent goes, never whether the agent runs.

**The pipeline (every change):**

1. `requirements-analyst` — check requirements, ask clarifying questions, resolve ambiguities BEFORE generating artifacts. **⏸ WAIT for user** — present the analyst's findings (questions, assumptions, suggestions) and wait for the user to confirm before proceeding. Never auto-chain to `opsx:propose`.
2. `opsx:propose` — create proposal + design + specs + tasks (from user-confirmed requirements)
3. `security-reviewer` — before any dependency add / external URL / web-sourced snippet (skip only if the change adds none). **⛔ BLOCKING: all work pauses until verdict is ✅ allow.**
4. `unit-test-writer` — before `opsx:apply` when the change produces testable units (skip only for pure config, routing, docs, cosmetic styling)
5. **⏸ WAIT for user** — present findings from steps 3–4 and wait for the user to explicitly trigger `opsx:apply`. Never auto-chain implementation.
6. `opsx:apply` via the implementation specialist — writes code (user-triggered); verify with {BUILD_COMMAND} / {TEST_COMMAND}
7. `code-reviewer` — review the diff
8. `opsx:verify` — validate implementation matches specs (completeness, correctness, coherence)
9. `opsx:archive` — finalize; update the "Existing specs" list below

**Small changes** (typos, renames, one-line fixes, config tweaks):

- Full pipeline, minimal depth. `requirements-analyst` and `code-reviewer` are never skipped — quick pass (may need zero questions but still present findings and wait for user confirmation). Skip `unit-test-writer` only if no testable unit is produced; skip `security-reviewer` only if no deps/external code.

**Medium changes** (new component/module, bug fix spanning multiple files, refactor):

- Full pipeline, normal depth. `requirements-analyst` and `code-reviewer` are never skipped. Always wait for user confirmation after requirements-analyst before running `opsx:propose`.

**Large changes** (new page/feature, cross-cutting refactor):

- Full pipeline, deep depth. `requirements-analyst` does thorough requirements gathering — **wait for user answers** before running `opsx:propose`. After pre-implementation stages complete, **always wait for user to trigger `opsx:apply`**.

**Multi-app changes** (mono repo only — change spans multiple apps):

- Prefix the change name with `shared/` (e.g., `shared/update-auth-flow`).
- List all affected apps in the proposal's Impact section.
- Read per-app CLAUDE.md files for app-specific conventions before implementing.

### When to Use OpenSpec

Always use `opsx:propose` before implementing any change. The proposal scales to the change — a simple fix gets a brief proposal, a new feature gets a thorough one.

**Core commands (every change):**

- `/opsx:propose "description"` — Plan a change (proposal, design, specs, tasks — creates all artifacts at once)
- `/opsx:apply [change-name]` — Implement tasks from a change
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think through ideas (read-only)

**Expanded commands (finer control):**

- `/opsx:new [change-name]` — Scaffold a change directory without creating artifacts
- `/opsx:ff [change-name]` — Fast-forward: create all remaining planning artifacts at once
- `/opsx:continue [change-name]` — Create the next artifact one step at a time, reviewing each before proceeding
- `/opsx:verify [change-name]` — Validate implementation against specs (completeness, correctness, coherence)
- `/opsx:sync [change-name]` — Merge delta specs from a change into main `openspec/specs/`
- `/opsx:bulk-archive` — Archive multiple completed changes at once with conflict detection
- `/opsx:onboard` — Guided tutorial walkthrough

**When to use `ff` vs `continue`:**

| Situation | Use |
|-----------|-----|
| Clear requirements, ready to build | `/opsx:ff` or `/opsx:propose` |
| Exploring, want to review each artifact | `/opsx:continue` |
| Time pressure, need to move fast | `/opsx:ff` |
| Complex change, want control over each step | `/opsx:continue` |

**Rule of thumb:** If you can describe the full scope upfront, use `propose` or `ff`. If figuring it out as you go, use `new` + `continue`.

[OpenSpec](https://github.com/Fission-AI/OpenSpec) specs live in `openspec/`.

### Change Scoping (Mono Repo)

<!-- INCLUDE THIS SECTION ONLY FOR MONO REPOS. Delete for single repos. -->

All changes live in root `openspec/changes/`, scoped by naming convention:

| Change Scope        | Naming Convention          | Example                                        |
| ------------------- | -------------------------- | ---------------------------------------------- |
| Single app          | `{app-name}/{change-desc}` | `admin/add-user-mgmt`, `web/redesign-checkout` |
| Shared / cross-app  | `shared/{change-desc}`     | `shared/update-auth-flow`                      |
| Infrastructure / CI | `infra/{change-desc}`      | `infra/add-ci-pipeline`                        |

**Recommended mono repo directory structure:**
```

monorepo-root/
├── CLAUDE.md # Root: shared conventions, app inventory, workflow
├── openspec/
│ ├── specs/ # Cross-cutting specs (shared libs, CI, infra)
│ └── changes/
│ └── archive/
├── apps/
│ ├── admin/
│ │ └── CLAUDE.md # Admin-specific: stack, routing, commands
│ ├── web/
│ │ └── CLAUDE.md # Web-specific: stack, routing, commands
│ ├── purchase/
│ │ └── CLAUDE.md # Purchase-specific: stack, routing, commands
│ └── automation-playwright/
│ └── CLAUDE.md # E2E test conventions
└── packages/ # Shared packages (if any)
└── shared-lib/

```

### Available Subagents

{SUBAGENT_TABLE}

**Canonical sequence (every change):**

```

requirements-analyst (clarify requirements with the user FIRST)
⏸ WAIT — present findings to user, wait for confirmation
→ opsx:propose (generate artifacts from confirmed requirements)
→ security-reviewer (if yarn add / external code — ⛔ BLOCKS until safe)
→ unit-test-writer (if testable units; tests land first)
⏸ WAIT — present findings, wait for user to trigger apply
→ opsx:apply via {IMPLEMENTATION_SPECIALIST} (user-triggered only)
→ code-reviewer (address findings before continuing)
→ opsx:verify
→ opsx:archive

```

Right-size by shortening each stage, not by removing stages. Skipping an agent requires its "Skip when" condition in the table above to be true.

### Parallel Changes

Work on multiple changes concurrently. Each change lives in its own `openspec/changes/` directory:

- Use `/opsx:apply [change-name]` to resume a specific change
- Use `/opsx:bulk-archive` to archive multiple completed changes at once (detects spec conflicts automatically)
- Each change's artifacts are independent — no cross-contamination

### Update vs. New Change

When requirements shift during a change, decide whether to update the existing change or start a new one:

**Update the existing change when:**
- Same intent, refined execution
- Scope narrows (shipping MVP first, rest later)
- Design tweaks based on implementation discoveries

**Start a new change when:**
- Intent fundamentally changed
- Scope exploded to different work entirely
- Original change can be marked "done" standalone

**Quick test:** Can the original change be archived as a complete, coherent unit without these new changes? If yes → new change. If no → update.

### When Requirements Change Mid-Implementation

Requirements change — this is normal. The change directory (`openspec/changes/{change-name}/`) and all its artifacts (`.openspec.yaml`, `proposal.md`, `design.md`, `tasks.md`, `specs/`) must be preserved and updated in place. Never delete a change and start over unless the direction fundamentally changed.

**Before implementation starts** (proposal exists, `opsx:apply` not yet run):
- Update the existing artifacts in place (proposal, specs, design, tasks)
- No need to create a new change

**During implementation** (some tasks done, others pending):
1. Pause implementation
2. Assess impact — which completed tasks are still valid?
3. Update `specs/` and `tasks.md` to reflect new requirements
4. Update `design.md` if technical approach changed
5. Continue implementation from where it makes sense

**After implementation** (result isn't what was wanted):
- Small adjustment: make the edit directly, update `tasks.md`
- Bigger rework: revise `specs/` first, add/update tasks in `tasks.md`, re-implement affected parts

**Completely different direction**:
- Archive or discard the current change
- Create a new change — but use the old change's artifacts as context (lessons learned, edge cases discovered)

**Key rule**: Always update artifacts to match the current truth. Specs, tasks, and design should reflect what IS being built, not the original plan.

### Archive Maintenance

Never delete archived changes — they are the audit trail (proposal, design, tasks, specs) that doesn't exist in structured form anywhere else. Let the archive grow; it's markdown and has negligible cost.

When the "Existing specs" list grows unwieldy, reorganize it by domain rather than listing every change individually. When spec files grow too large from accumulated deltas, split them by subdomain.

### Non-Code Actions (No Workflow Needed)

- Pure questions or explanations
- Git operations, running dev server, config lookups, reading files
- When the user explicitly invokes a specific `/opsx:` command directly

**Existing specs** (archived in `openspec/changes/archive/`):
[List will grow as changes are archived]
```

---

### Template: Workflow Section (WITHOUT subagents)

```markdown
## Workflow

### Principles

The workflow follows four OpenSpec principles:

- **Fluid not rigid** — Artifacts can be created in any order. Don't force a linear phase gate when a different sequence makes more sense for the change at hand.
- **Iterative not waterfall** — Requirements change as understanding deepens. Revisit and revise artifacts at any point.
- **Easy not complex** — Every change gets a proposal, but a one-line fix gets a one-line proposal. Size scales _depth_, not which stages run.
- **Brownfield-first** — This is an existing codebase. Read the code, understand what's there, then specify _deltas_ — not green-field descriptions.

### Right-Sizing the Process

Every change runs the same OpenSpec pipeline — size only affects how deep each stage goes, never whether the stage runs.

**The pipeline (every change):**

1. `opsx:propose` — create proposal + design + specs + tasks
2. Self-review the artifacts — read for ambiguities, gaps, unstated assumptions; revise before implementing
3. Implement the tasks, running {BUILD_COMMAND} / {TEST_COMMAND} along the way
4. Write tests where the change produces testable units (components, utilities, endpoints)
5. Self-review the diff — quality, security, correctness, convention adherence
6. `opsx:verify` — validate implementation matches specs (completeness, correctness, coherence)
7. `opsx:archive` — finalize; update the "Existing specs" list below

**Small changes** (typos, renames, one-line fixes, config tweaks):

- Full pipeline, minimal depth. Skip tests only if no testable unit is produced.

**Medium changes** (new component/module, bug fix spanning multiple files, refactor):

- Full pipeline, normal depth. Always self-review before and after implementation.

**Large changes** (new page/feature, cross-cutting refactor):

- Full pipeline, deep depth. Present artifacts for approval before implementing.
- Update the "Existing specs" list below when archiving.

**Multi-app changes** (mono repo only — change spans multiple apps):

- Prefix the change name with `shared/` (e.g., `shared/update-auth-flow`).
- List all affected apps in the proposal's Impact section.
- Read per-app CLAUDE.md files for app-specific conventions before implementing.

### When to Use OpenSpec

Always use `opsx:propose` before implementing any change. The proposal scales to the change — a simple fix gets a brief proposal, a new feature gets a thorough one.

**Core commands (every change):**

- `/opsx:propose "description"` — Plan a change (proposal, design, specs, tasks — creates all artifacts at once)
- `/opsx:apply [change-name]` — Implement tasks from a change
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think through ideas (read-only)

**Expanded commands (finer control):**

- `/opsx:new [change-name]` — Scaffold a change directory without creating artifacts
- `/opsx:ff [change-name]` — Fast-forward: create all remaining planning artifacts at once
- `/opsx:continue [change-name]` — Create the next artifact one step at a time, reviewing each before proceeding
- `/opsx:verify [change-name]` — Validate implementation against specs (completeness, correctness, coherence)
- `/opsx:sync [change-name]` — Merge delta specs from a change into main `openspec/specs/`
- `/opsx:bulk-archive` — Archive multiple completed changes at once with conflict detection
- `/opsx:onboard` — Guided tutorial walkthrough

**When to use `ff` vs `continue`:**

| Situation | Use |
|-----------|-----|
| Clear requirements, ready to build | `/opsx:ff` or `/opsx:propose` |
| Exploring, want to review each artifact | `/opsx:continue` |
| Time pressure, need to move fast | `/opsx:ff` |
| Complex change, want control over each step | `/opsx:continue` |

**Rule of thumb:** If you can describe the full scope upfront, use `propose` or `ff`. If figuring it out as you go, use `new` + `continue`.

[OpenSpec](https://github.com/Fission-AI/OpenSpec) specs live in `openspec/`.

### Change Scoping (Mono Repo)

<!-- INCLUDE THIS SECTION ONLY FOR MONO REPOS. Delete for single repos. -->

All changes live in root `openspec/changes/`, scoped by naming convention:

| Change Scope        | Naming Convention          | Example                                        |
| ------------------- | -------------------------- | ---------------------------------------------- |
| Single app          | `{app-name}/{change-desc}` | `admin/add-user-mgmt`, `web/redesign-checkout` |
| Shared / cross-app  | `shared/{change-desc}`     | `shared/update-auth-flow`                      |
| Infrastructure / CI | `infra/{change-desc}`      | `infra/add-ci-pipeline`                        |

**Recommended mono repo directory structure:**
```

monorepo-root/
├── CLAUDE.md # Root: shared conventions, app inventory, workflow
├── openspec/
│ ├── specs/ # Cross-cutting specs (shared libs, CI, infra)
│ └── changes/
│ └── archive/
├── apps/
│ ├── admin/
│ │ └── CLAUDE.md # Admin-specific: stack, routing, commands
│ ├── web/
│ │ └── CLAUDE.md # Web-specific: stack, routing, commands
│ ├── purchase/
│ │ └── CLAUDE.md # Purchase-specific: stack, routing, commands
│ └── automation-playwright/
│ └── CLAUDE.md # E2E test conventions
└── packages/ # Shared packages (if any)
└── shared-lib/

```

### Parallel Changes

Work on multiple changes concurrently — each lives in its own `openspec/changes/` directory:

- Use `/opsx:apply [change-name]` to resume a specific change
- Use `/opsx:bulk-archive` to archive multiple completed changes at once
- Each change's artifacts are independent — no cross-contamination

### Update vs. New Change

**Update the existing change when:**
- Same intent, refined execution
- Scope narrows (shipping MVP first, rest later)
- Design tweaks based on implementation discoveries

**Start a new change when:**
- Intent fundamentally changed
- Scope exploded to different work entirely
- Original change can be marked "done" standalone

**Quick test:** Can the original change be archived as a complete, coherent unit without these new changes? If yes → new change. If no → update.

### Archive Maintenance

Never delete archived changes — they are the audit trail (proposal, design, tasks, specs) that doesn't exist in structured form anywhere else. Let the archive grow; it's markdown and has negligible cost.

When the "Existing specs" list grows unwieldy, reorganize it by domain rather than listing every change individually. When spec files grow too large from accumulated deltas, split them by subdomain.

### When Requirements Change Mid-Implementation

Requirements change — this is normal. The change directory (`openspec/changes/{change-name}/`) and all its artifacts (`.openspec.yaml`, `proposal.md`, `design.md`, `tasks.md`, `specs/`) must be preserved and updated in place. Never delete a change and start over unless the direction fundamentally changed.

**Before implementation starts** (proposal exists, `opsx:apply` not yet run):
- Update the existing artifacts in place (proposal, specs, design, tasks)
- No need to create a new change

**During implementation** (some tasks done, others pending):
1. Pause implementation
2. Assess impact — which completed tasks are still valid?
3. Update `specs/` and `tasks.md` to reflect new requirements
4. Update `design.md` if technical approach changed
5. Continue implementation from where it makes sense

**After implementation** (result isn't what was wanted):
- Small adjustment: make the edit directly, update `tasks.md`
- Bigger rework: revise `specs/` first, add/update tasks in `tasks.md`, re-implement affected parts

**Completely different direction**:
- Archive or discard the current change
- Create a new change — but use the old change's artifacts as context (lessons learned, edge cases discovered)

**Key rule**: Always update artifacts to match the current truth. Specs, tasks, and design should reflect what IS being built, not the original plan.

### Non-Code Actions (No Workflow Needed)

- Pure questions or explanations
- Git operations, running dev server, config lookups, reading files
- When the user explicitly invokes a specific `/opsx:` command directly

**Existing specs** (archived in `openspec/changes/archive/`):
[List will grow as changes are archived]
```

---

### Placeholders Reference

When writing the CLAUDE.md workflow section, replace these placeholders with project-specific values:

| Placeholder                   | Replace With                                           | Example                                                  |
| ----------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| `{BUILD_COMMAND}`             | Project's build command                                | `yarn build`, `cargo build`, `go build ./...`            |
| `{TEST_COMMAND}`              | Project's test command                                 | `yarn test`, `pytest`, `go test ./...`                   |
| `{IMPLEMENTATION_SPECIALIST}` | Name of the implementation agent                       | `react-frontend-specialist`, `python-backend-specialist` |
| `{SUBAGENT_TABLE}`            | Table of available subagents with a `Skip when` column | See examples below                                       |

### Example: Filled-In Subagent Section (React project)

```markdown
### Available Subagents

Each agent maps to a specific stage of the OpenSpec workflow. The agent is required at its stage unless its explicit "Skip when" condition is met.

| Agent                       | OpenSpec Stage                                                       | Purpose                                                                                                                              | Skip when                                                     |
| --------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `requirements-analyst`      | **Before** `opsx:propose`                                            | Checks requirements, asks clarifying questions, resolves ambiguities                                                                 | Never — even "obvious" requests have hidden assumptions       |
| `security-reviewer`         | Before `yarn add` / fetching external URLs / using web-searched code | **⛔ BLOCKING** — reviews packages, URLs, and external snippets for typosquatting, CVEs, malicious code. All work pauses until safe. | The change adds no dependencies and pulls in no external code |
| `unit-test-writer`          | Before `opsx:apply` (TDD)                                            | Writes tests from specs before implementation so tests drive the diff                                                                | No testable units — pure config, routing, styling-only, docs  |
| `react-frontend-specialist` | During `opsx:apply`                                                  | Implements UI components, layouts, state, API integration                                                                            | Change has no UI surface                                      |
| `code-reviewer`             | After `opsx:apply`, before `opsx:verify`                             | Reviews the diff for quality, correctness, security                                                                                  | Never                                                         |

**Canonical sequence (every change):**
```

requirements-analyst (clarify requirements FIRST)
⏸ WAIT — present findings to user, wait for confirmation
→ opsx:propose (generate artifacts from confirmed requirements)
→ security-reviewer (if yarn add / external code — ⛔ BLOCKS until safe)
→ unit-test-writer (if testable units)
⏸ WAIT — present findings, wait for user to trigger apply
→ opsx:apply via react-frontend-specialist (user-triggered only)
→ code-reviewer
→ opsx:verify
→ opsx:archive

```

```

### Example: Filled-In Subagent Section (Go API)

```markdown
### Available Subagents

| Agent                   | OpenSpec Stage                 | Purpose                                                                                   | Skip when                  |
| ----------------------- | ------------------------------ | ----------------------------------------------------------------------------------------- | -------------------------- |
| `requirements-analyst`  | **Before** `opsx:propose`      | Checks requirements, asks clarifying questions                                            | Never                      |
| `security-reviewer`     | Before `go get` / external URL | **⛔ BLOCKING** — reviews new modules for supply-chain risks. All work pauses until safe. | No deps / no external code |
| `unit-test-writer`      | Before `opsx:apply` (TDD)      | Writes `_test.go` tests from specs                                                        | No testable units          |
| `go-backend-specialist` | During `opsx:apply`            | Implements Go code                                                                        | No code surface            |
| `code-reviewer`         | After `opsx:apply`             | Reviews diffs for quality and correctness                                                 | Never                      |

**Canonical sequence (every change):**
```

requirements-analyst (clarify requirements FIRST) →
⏸ WAIT for user confirmation →
opsx:propose (from confirmed requirements) →
security-reviewer (if go get — ⛔ BLOCKS) →
unit-test-writer (if testable) → ⏸ WAIT for user →
opsx:apply via go-backend-specialist (user-triggered) →
code-reviewer → opsx:verify → opsx:archive

```

```

---

## Step 4: Document Existing Architecture as Specs (Optional)

Ask the user:

> "Would you like me to create specs that document your existing architecture? This captures what's already built (e.g., build pipeline, API layer, key components) as living documentation — so future changes can reference it instead of re-reading the codebase from scratch.
>
> This is optional. Recommended for established projects with meaningful architecture. Skip for new or small projects."

If yes, use `/opsx:propose` with a description like "Document existing {area} architecture" to create brownfield specs that capture the current state without changing any code.

---

## Step 5: Verify Complete Setup

Run through this checklist to confirm everything is working:

### Directory structure

```bash
ls openspec/                      # Should show: specs/ changes/
ls openspec/changes/              # Should show: archive/
```

Check tool-specific directories (example for Claude Code):

```bash
ls .claude/commands/opsx/         # Should show 11 .md files
ls .claude/skills/                # Should show 11 openspec-* directories
```

### Subagents (if the user added any separately)

```bash
ls .claude/agents/                # Should show agent .md files (if any)
```

### OpenSpec CLI

```bash
npx openspec --version            # Should show version number
npx openspec list                 # Should work (empty list is fine)
```

### Instruction file

- Workflow section is present with project-specific values (no unfilled placeholders)
- Build/test commands are correct
- Subagent table matches the agents in `.claude/agents/` (if any were added separately)

### Quick smoke test

Tell the user:

> "Setup is complete! Try running `/opsx:onboard` for a guided walkthrough of the full workflow, or `/opsx:propose "your first change"` to start working."

---

## Artifact Structure Reference

Each OpenSpec change produces these artifacts (scaled to the change size):

### Change Directory Layout

```
openspec/changes/{change-name}/
├── .openspec.yaml        # Change metadata (auto-generated)
├── proposal.md           # Why this change, what changes, impact
├── design.md             # Technical decisions, goals/non-goals, alternatives
├── tasks.md              # Implementation checklist
└── specs/
    └── {capability}/
        └── spec.md       # New/updated specs (delta format)
```

### Proposal Format (`proposal.md`)

```markdown
## Why

[1-3 sentences explaining motivation]

## What Changes

- [Bullet list of what will be added/modified/removed]

## Capabilities

### New Capabilities

- `capability-name`: Brief description

### Modified Capabilities

- `capability-name`: What changes

## Impact

- **Files**: [Key files affected]
- **Dependencies**: [New/changed dependencies]
- **Breaking changes**: [If any]
```

### Design Format (`design.md`)

```markdown
## Context

[Background and current state]

## Goals / Non-Goals

**Goals:**

- [What this achieves]

**Non-Goals:**

- [What this deliberately does NOT do]

## Decisions

### Decision 1: [Title]

**Choice**: [What was chosen]
**Rationale**: [Why]
**Alternatives considered**: [What else was evaluated]
```

### Tasks Format (`tasks.md`)

```markdown
## 1. [Group Name]

- [ ] 1.1 [Specific actionable task]
- [ ] 1.2 [Another task]

## 2. [Next Group]

- [ ] 2.1 [Task]
```

### Spec Format (`specs/{capability}/spec.md`)

Delta specs use ADDED/MODIFIED/REMOVED sections:

```markdown
## ADDED Requirements

### Requirement: [Name]

[Description]

#### Scenario: [Name]

- **WHEN** [trigger]
- **THEN** [expected outcome]

## MODIFIED Requirements

### Requirement: [Name]

#### Scenario: [New scenario to add]

- **WHEN** [trigger]
- **THEN** [outcome]

## REMOVED Requirements

### Requirement: [Deprecated Feature]
```

Main specs (in `openspec/specs/`) use a flat format:

```markdown
# {capability} Specification

## Purpose

[What this spec documents]

## Requirements

### Requirement: [Name]

[Description]

#### Scenario: [Name]

- **WHEN** [trigger]
- **THEN** [expected outcome]
```
