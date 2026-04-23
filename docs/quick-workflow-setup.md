# Quick Workflow Setup Guide

Set up the OpenSpec + Agent Pipeline workflow in any project in ~10 minutes.

## What You Get

A principles-based workflow where every change runs the same pipeline — size only controls how deep each stage goes, never whether the stage runs.

```
requirements-analyst (clarify requirements FIRST)
⏸ WAIT — present findings to user, wait for confirmation
→ opsx:propose (from confirmed requirements) →
security-reviewer (if deps — ⛔ BLOCKS) →
unit-test-writer (if testable) → ⏸ WAIT for user →
opsx:apply (user-triggered) → code-reviewer →
opsx:verify → opsx:archive
```

- **Small changes** — fast pass through every stage (quick reviewer pass, may need zero questions but still present findings and wait for user confirmation, brief proposal, quick code review).
- **Medium changes** — normal depth at every stage. `requirements-analyst` and `code-reviewer` are never skipped. Always wait for user confirmation after requirements-analyst before running `opsx:propose`.
- **Large changes** — deep pass, with thorough requirements gathering by `requirements-analyst` — **wait for user answers** before running `opsx:propose`.

5 agents mapped to OpenSpec workflow stages:

| Agent | OpenSpec Stage | Role | Skip when |
|-------|---------------|------|-----------|
| `requirements-analyst` | **Before** `opsx:propose` | Checks requirements, asks clarifying questions | Never |
| `security-reviewer` | Before package install / external URL | **⛔ BLOCKING** — gates dependency additions and external code. All work pauses until safe. | No deps / no external code |
| `unit-test-writer` | Before `opsx:apply` | Writes tests from specs (TDD) | No testable units (pure config/styling/docs) |
| `<your-specialist>` | During `opsx:apply` | Writes code to make tests pass | No code surface |
| `code-reviewer` | After `opsx:apply` | Final quality check — security, correctness, conventions | Never |

---

## Step 1: Install OpenSpec CLI

```bash
npm install -g openspec-cli
# verify:
openspec --version
```

Or skip install and use `npx openspec` everywhere.

## Step 2: Run the setup script

From your project root:

```bash
# Initialize OpenSpec
openspec init
mkdir -p openspec/specs openspec/changes/archive

# Create .claude structure
mkdir -p .claude/agents
mkdir -p .claude/commands/opsx
for s in openspec-propose openspec-apply-change openspec-archive-change \
         openspec-explore openspec-new-change openspec-continue-change \
         openspec-ff-change openspec-verify-change openspec-sync-specs \
         openspec-bulk-archive-change; do
  mkdir -p ".claude/skills/$s"
done
```

## Step 3: Copy skills & commands from reference project

Skills and commands are **identical across all projects** — just copy them:

```bash
REF="/path/to/dashstack-dashboard"   # <-- change this to your reference project path

# Copy skills
for s in openspec-propose openspec-apply-change openspec-archive-change \
         openspec-explore openspec-new-change openspec-continue-change \
         openspec-ff-change openspec-verify-change openspec-sync-specs \
         openspec-bulk-archive-change; do
  cp "$REF/.claude/skills/$s/SKILL.md" ".claude/skills/$s/SKILL.md"
done

# Copy commands
for c in propose apply archive explore new continue ff verify sync bulk-archive onboard; do
  cp "$REF/.claude/commands/opsx/$c.md" ".claude/commands/opsx/$c.md"
done
```

## Step 4: Create 5 agent files

### Pick your specialist name

| Your Stack      | Agent Name                  |
| --------------- | --------------------------- |
| React / Next.js | `react-frontend-specialist` |
| Python          | `python-backend-specialist` |
| Go              | `go-backend-specialist`     |
| Generic         | `implementation-specialist` |

### Create `.claude/agents/<your-specialist>.md`

```markdown
---
name: <your-specialist>
description: "Use for all code implementation: features, bugs, refactoring. Invoke PROACTIVELY."
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: blue
---

You are an elite <stack> developer with deep expertise in <technologies>.
Implement code following project conventions. Proper error handling, type safety, edge cases.
Propose plan before coding. Self-review before presenting.
```

### Create `.claude/agents/unit-test-writer.md`

```markdown
---
name: unit-test-writer
description: "TDD specialist that writes unit tests from OpenSpec artifacts BEFORE implementation begins. Analyzes which tasks produce testable units and creates test files. Lean approach: happy path + key edge cases."
tools: Read, Edit, Write, Bash, Glob, Grep, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: green
---

TDD specialist. Write tests from specs BEFORE implementation exists.
Test components, utilities, hooks. Skip config/routing/styling tasks.
Lean coverage: happy path + key edge cases (3-5 tests per unit).
Follow project test conventions. Never write implementation code.
```

### Create `.claude/agents/requirements-analyst.md`

```markdown
---
name: requirements-analyst
description: "Requirements analyst that runs BEFORE opsx:propose. Checks the user's description, explores the codebase for context, asks clarifying questions, and resolves all ambiguities so that opsx:propose generates correct artifacts the first time."
tools: Read, Edit, Write, Glob, Grep, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: green
---

Requirements analyst that runs BEFORE opsx:propose.
Core principle: Ask, don't assume. Every gap is a question, not a decision.
Explore the codebase for context, exhaustively mine assumptions from
the user's description, ask multi-round clarifying questions.
Never let vague requirements pass through to opsx:propose.
Produce a requirements summary that feeds directly into opsx:propose.
Confirm readiness for propose only after user explicitly confirms.
```

### Create `.claude/agents/code-reviewer.md`

```markdown
---
name: code-reviewer
description: "Code review for quality, security, performance. Use PROACTIVELY after implementation."
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: yellow
---

Final quality gate. Review for security (OWASP), performance, maintainability,
project conventions. Structured feedback by severity with code examples.
```

### Create `.claude/agents/security-reviewer.md`

```markdown
---
name: security-reviewer
description: "Use before installing packages, fetching URLs, or trusting external code."
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: red
---

Supply-chain security reviewer. Default untrusted. Never run install commands.
Check: identity, CVEs, install scripts, maintainer health, license, alternatives.
Verdict: allow / ask / stop.
```

## Step 5: Create `.claude/workflow.md`

Replace `<your-specialist>` below:

```markdown
# Workflow

## Principles

- **Fluid not rigid** — Create artifacts in any order that makes sense.
- **Iterative not waterfall** — Revisit and revise at any point.
- **Easy not complex** — Scale *depth* to the change size, not which stages run.
- **Brownfield-first** — Read existing code first, specify deltas.

## The Pipeline (every change)

1. `requirements-analyst` — check requirements, ask clarifying questions, resolve ambiguities BEFORE generating artifacts. **⏸ WAIT for user** — present the analyst's findings (questions, assumptions, suggestions) and wait for the user to confirm before proceeding. Never auto-chain to `opsx:propose`.
2. `opsx:propose` — create proposal + design + specs + tasks (from user-confirmed requirements)
3. `security-reviewer` — before any `yarn add` / external URL / web-sourced code (skip only if the change adds none). **⛔ BLOCKING: all work pauses until verdict is ✅ allow.**
4. `unit-test-writer` — before `opsx:apply` when the change produces testable units
5. **⏸ WAIT for user** — present findings, wait for user to trigger apply. Never auto-chain.
6. `opsx:apply` via `<your-specialist>` — implementation (user-triggered)
7. `code-reviewer` — review the diff
8. `opsx:verify` — check implementation matches specs
9. `opsx:archive` — finalize

Right-size within this pipeline by shortening each stage, not by removing stages.

## Right-Sizing

- **Small** (one-line fix, typo, styling tweak): full pipeline, minimal depth. `requirements-analyst` and `code-reviewer` are never skipped — quick pass (may need zero questions but still present findings and wait for user confirmation). Skip `unit-test-writer` only if no testable unit is produced; skip `security-reviewer` only if no deps/external code.
- **Medium** (multi-file bug fix, new component): full pipeline, normal depth. `requirements-analyst` and `code-reviewer` are never skipped. Always wait for user confirmation after requirements-analyst before running `opsx:propose`.
- **Large** (new page, cross-cutting feature): full pipeline, deep depth. `requirements-analyst` does thorough requirements gathering — **wait for user answers** before running `opsx:propose`. **Always wait for user to trigger `opsx:apply`.**

## Available Agents

| Agent | OpenSpec Stage | Skip when |
|-------|---------------|-----------|
| `requirements-analyst` | **Before** `opsx:propose` | Never |
| `security-reviewer` | Before package install / external URL (**⛔ BLOCKS**) | No deps / no external code |
| `unit-test-writer` | Before `opsx:apply` (TDD) | No testable units produced |
| `<your-specialist>` | During `opsx:apply` | No code surface |
| `code-reviewer` | After `opsx:apply` | Never |

## When Requirements Change

- **Same intent, refined scope** → update the existing change (revise specs/tasks, continue)
- **Fundamentally different direction** → start a new change (old artifacts become context)

## OpenSpec Commands

- `/opsx:propose "description"` — Plan a change (proposal, design, specs, tasks)
- `/opsx:apply [change-name]` — Implement tasks from a change
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think mode (read-only)

**Expanded commands (finer control):**

- `/opsx:new [change-name]` — Scaffold a change directory without creating artifacts
- `/opsx:ff [change-name]` — Fast-forward: create all remaining planning artifacts at once
- `/opsx:continue [change-name]` — Create the next artifact one step at a time
- `/opsx:verify [change-name]` — Validate implementation against specs
- `/opsx:sync [change-name]` — Merge delta specs to main specs
- `/opsx:bulk-archive` — Archive multiple completed changes at once
- `/opsx:onboard` — Guided tutorial walkthrough

**When to use `ff` vs `continue`:**

| Situation | Use |
|-----------|-----|
| Clear requirements, ready to build | `/opsx:ff` or `/opsx:propose` |
| Exploring, want to review each artifact | `/opsx:continue` |
| Time pressure, need to move fast | `/opsx:ff` |
| Complex change, want control | `/opsx:continue` |

**Rule of thumb:** If you can describe the full scope upfront, use `propose` or `ff`. If figuring it out as you go, use `new` + `continue`.

## Verify Before Archiving

Always run `opsx:verify` before `opsx:archive` to validate that the implementation matches the specs.

## Parallel Changes

Work on multiple changes concurrently — each lives in its own `openspec/changes/` directory:

- Use `/opsx:apply [change-name]` to resume a specific change
- Use `/opsx:bulk-archive` to archive multiple completed changes at once
- Each change's artifacts are independent — no cross-contamination

## Update vs. New Change

**Update the existing change when:**
- Same intent, refined execution
- Scope narrows (shipping MVP first, rest later)
- Design tweaks based on implementation discoveries

**Start a new change when:**
- Intent fundamentally changed
- Scope exploded to different work entirely
- Original change can be marked "done" standalone

**Quick test:** Can the original change be archived as a complete, coherent unit without these new changes? If yes → new change. If no → update.

## Archive Maintenance

Never delete archived changes — they are the audit trail (proposal, design, tasks, specs) that doesn't exist in structured form anywhere else. Let the archive grow; it's markdown and has negligible cost.

When the "Existing specs" list grows unwieldy, reorganize it by domain rather than listing every change individually. When spec files grow too large from accumulated deltas, split them by subdomain.
```

## Step 6: Add to CLAUDE.md

Append this to your `CLAUDE.md` (replace `<your-specialist>`):

```markdown
## Workflow

### Principles

- **Fluid not rigid** — Artifacts can be created in any order. Don't force a linear phase gate when a different sequence makes more sense.
- **Iterative not waterfall** — Requirements change as understanding deepens. Revisit and revise artifacts at any point.
- **Easy not complex** — Every change gets a proposal, but a one-line fix gets a one-line proposal. Size scales depth, not which stages run.
- **Brownfield-first** — Read the code, understand what's there, then specify deltas.

### Right-Sizing the Process

Every change runs the same OpenSpec pipeline. Subagents are **mandatory at their stage** — size only affects how deep each agent goes, never whether the agent runs.

**The pipeline (every change):**

1. `requirements-analyst` — check requirements, ask clarifying questions, resolve ambiguities BEFORE generating artifacts. **⏸ WAIT for user** — present the analyst's findings (questions, assumptions, suggestions) and wait for the user to confirm before proceeding. Never auto-chain to `opsx:propose`.
2. `opsx:propose` — create proposal + design + specs + tasks (from user-confirmed requirements)
3. `security-reviewer` — before any `yarn add` / external URL / web-sourced code (skip only if the change adds none). **⛔ BLOCKING: all work pauses until verdict is ✅ allow.**
4. `unit-test-writer` — before `opsx:apply` when the change produces testable units (skip only for pure config/styling/docs)
5. **⏸ WAIT for user** — present findings from steps 3–4 and wait for the user to explicitly trigger `opsx:apply`. Never auto-chain implementation.
6. `opsx:apply` via `<your-specialist>` — implementation (user-triggered)
7. `code-reviewer` — review the diff
8. `opsx:verify` — validate implementation matches specs
9. `opsx:archive` — finalize

**Small changes** (typos, renames, one-line fixes):

- Full pipeline, minimal depth. `requirements-analyst` and `code-reviewer` are never skipped — quick pass (may need zero questions but still present findings and wait for user confirmation). Skip `unit-test-writer` only if no testable unit is produced; skip `security-reviewer` only if no deps/external code.

**Medium changes** (new component, multi-file bug fix, refactor):

- Full pipeline, normal depth. `requirements-analyst` and `code-reviewer` are never skipped. Always wait for user confirmation after requirements-analyst before running `opsx:propose`.

**Large changes** (new page, new feature, cross-cutting refactor):

- Full pipeline, deep depth. `requirements-analyst` does thorough requirements gathering — **wait for user answers** before running `opsx:propose`. After pre-implementation stages complete, **always wait for user to trigger `opsx:apply`**.

### Available Subagents

| Agent | OpenSpec Stage | Skip when |
|-------|---------------|-----------|
| `requirements-analyst` | **Before** `opsx:propose` | Never — even "obvious" requests have hidden assumptions |
| `security-reviewer` | Before package install / external URL | Change adds no deps and no external code |
| `unit-test-writer` | Before `opsx:apply` (TDD) | No testable units — pure config, routing, styling-only, docs |
| `<your-specialist>` | During `opsx:apply` | No UI/code surface |
| `code-reviewer` | After `opsx:apply` | Never |

**Core commands:** /opsx:propose, /opsx:apply, /opsx:archive, /opsx:explore

**Expanded commands:** /opsx:new, /opsx:ff, /opsx:continue, /opsx:verify, /opsx:sync, /opsx:bulk-archive, /opsx:onboard

[OpenSpec](https://github.com/Fission-AI/OpenSpec) specs live in `openspec/`.

**Archive maintenance:** Never delete archived changes — they are the audit trail (proposal, design, tasks, specs) that doesn't exist in structured form anywhere else. Let the archive grow; it's markdown and has negligible cost. When the "Existing specs" list grows unwieldy, reorganize by domain. When spec files grow too large, split by subdomain.

**Existing specs** (update as you archive):

<!-- 1. change-name — description -->
```

## Step 7: Create `.claude/settings.local.json`

```json
{
  "permissions": {
    "allow": ["Bash(npx openspec:*)", "Bash(openspec:*)", "WebSearch"],
    "deny": ["Bash(curl:*)", "Read(./.env)", "Read(./.env.*)"]
  }
}
```

Add your build/test commands to `allow` (e.g. `"Bash(yarn build)"`, `"Bash(npm test)"`).

## Verify

```bash
openspec --version                   # CLI works
ls .claude/agents/                   # 5 files
ls .claude/skills/                   # 10 dirs with SKILL.md each
ls .claude/commands/opsx/            # 11 files
grep "Principles" CLAUDE.md          # workflow section exists
```

Open Claude Code and run `/opsx:onboard` for a guided test.

---

## What to Customize vs Copy As-Is

| Customize per project             | Copy unchanged          |
| --------------------------------- | ----------------------- |
| Implementation specialist agent   | 10 skill files          |
| unit-test-writer (test conventions)| 11 command files       |
| CLAUDE.md (agent names)           | requirements-analyst agent |
| workflow.md (agent names)         | code-reviewer agent     |
| settings.local.json (build cmds)  |                         |
| security-reviewer (approved pkgs) |                         |

## For Existing Projects

Purely additive — only adds `.claude/` and `openspec/` dirs. To bootstrap context:

```
/opsx:explore current architecture
```

Then archive the findings as your baseline specs.

## Command Cheat Sheet

**Core commands:**

| Command                | What                     |
| ---------------------- | ------------------------ |
| `/opsx:propose "desc"` | Plan a change (all artifacts at once) |
| `/opsx:apply`          | Implement                |
| `/opsx:archive`        | Archive done change      |
| `/opsx:explore`        | Think mode (read-only)   |

**Expanded commands:**

| Command                | What                     |
| ---------------------- | ------------------------ |
| `/opsx:new "name"`     | Scaffold change, step through artifacts |
| `/opsx:ff`             | Fast-forward: all artifacts at once     |
| `/opsx:continue`       | Create next artifact one at a time      |
| `/opsx:verify`         | Check impl matches specs |
| `/opsx:sync`           | Merge delta specs to main |
| `/opsx:bulk-archive`   | Archive multiple changes at once |
| `/opsx:onboard`        | Guided tutorial          |

**`ff` vs `continue`:** Use `propose`/`ff` when scope is clear. Use `new` + `continue` when exploring.
