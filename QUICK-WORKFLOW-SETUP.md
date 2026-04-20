# Quick Workflow Setup Guide

Set up the OpenSpec + Agent Pipeline workflow in any project in ~10 minutes.

## What You Get

A principles-based workflow that scales to the change:

- **Small changes** — brief proposal, read code, fix it, verify.
- **Medium changes** — propose, implement with agents, review.
- **Large changes** — full cycle: propose, reviewer Q&A, approval gate, TDD, implement, review, archive.

5 agents available (use when they add value):

1. `proposal-reviewer` — validates plan, asks clarifying questions
2. `unit-test-writer` — writes tests from specs before implementation (TDD)
3. `<your-specialist>` — writes code to make tests pass (name varies by stack)
4. `security-reviewer` — gates package installs
5. `code-reviewer` — final quality check

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

### Create `.claude/agents/proposal-reviewer.md`

```markdown
---
name: proposal-reviewer
description: "Review OpenSpec artifacts for completeness, gaps, and clarity. Exhaustively questions the user to prevent hallucinated requirements. Use AFTER propose, BEFORE apply."
tools: Read, Edit, Write, Glob, Grep, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: green
---

Review OpenSpec change artifacts (proposal, design, specs, tasks).
Core principle: Ask, don't assume. Every gap is a question, not a decision.
Exhaustively mine assumptions, ask multi-round clarifying questions,
surface all implicit decisions in artifacts for user confirmation.
Never invent requirements or fill in "reasonable defaults" silently.
Validate completeness, consistency, feasibility. Report issues by severity.
Confirm readiness for apply only after user explicitly confirms.
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
- **Easy not complex** — Scale process to the change size.
- **Brownfield-first** — Read existing code first, specify deltas.

## Right-Sizing

- **Small** (one-line fix, typo): Brief proposal, read code, fix, verify.
- **Medium** (multi-file bug fix, new component): Propose, implement with agents, review.
- **Large** (new page, cross-cutting feature): Full cycle with proposal review, TDD, verify, and archiving.

## Available Agents

- `proposal-reviewer` — validates artifacts, asks clarifying questions
- `unit-test-writer` — writes tests from specs before implementation (TDD)
- `<your-specialist>` — implements code to make tests pass
- `security-reviewer` — always use before package installs
- `code-reviewer` — final quality check

## Typical Sequences (adapt as needed)

- Small fix: propose (brief) → `<your-specialist>` → done
- Feature: `proposal-reviewer` → `unit-test-writer` → `<your-specialist>` → `code-reviewer`
- Large feature: ... → `code-reviewer` → `opsx:verify` → `opsx:archive`
- New dependency: `security-reviewer` before installing → then proceed

## When Requirements Change

- **Same intent, refined scope** → update the existing change (revise specs/tasks, continue)
- **Fundamentally different direction** → start a new change (old artifacts become context)
```

## Step 6: Add to CLAUDE.md

Append this to your `CLAUDE.md` (replace `<your-specialist>`):

```markdown
## Workflow

### Principles

- **Fluid not rigid** — Artifacts can be created in any order. Don't force a linear phase gate when a different sequence makes more sense.
- **Iterative not waterfall** — Requirements change as understanding deepens. Revisit and revise artifacts at any point.
- **Easy not complex** — Every change gets a proposal, but a one-line fix gets a one-line proposal — not the same ceremony as a new feature.
- **Brownfield-first** — Read the code, understand what's there, then specify deltas.

### Right-Sizing the Process

**Small changes** (typos, renames, one-line fixes):
- Use `opsx:propose` to create a brief proposal (can be minimal for obvious changes).
- Read the code, make the change, verify it works.
- Use `<your-specialist>` for implementation if it involves logic. Use `code-reviewer` if subtle.

**Medium changes** (new component, multi-file bug fix, refactor):
- Review existing specs and code first.
- Use `opsx:propose` to plan. Review with `proposal-reviewer` if ambiguities exist.
- Implement with `<your-specialist>`. Write tests with `unit-test-writer` when testable.
- Run `code-reviewer` on the result.

**Large changes** (new page, new feature, cross-cutting refactor):
- Full workflow: context review → `opsx:propose` → `proposal-reviewer` → wait for user approval → `unit-test-writer` → `<your-specialist>` → `code-reviewer` → `opsx:verify` → `opsx:archive`.
- Use `opsx:verify` before archiving to check implementation matches specs.

### Available Subagents

Use subagents when they add value. Not every change needs every agent.

- `proposal-reviewer` — validates artifacts, asks clarifying questions
- `unit-test-writer` — writes tests from specs before implementation (TDD)
- `<your-specialist>` — implements code
- `security-reviewer` — always use before package installs or external code
- `code-reviewer` — reviews the diff after implementation

**Commands:** /opsx:propose, /opsx:apply, /opsx:archive, /opsx:explore

[OpenSpec](https://github.com/Fission-AI/OpenSpec) specs live in `openspec/`.

**Archive maintenance:** When archive exceeds ~50 changes, sync all to main specs (`opsx:sync`), keep the 20 most recent, delete the rest. Git preserves the full history.

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
| CLAUDE.md (agent names)           | proposal-reviewer agent |
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

| Command                | What                     |
| ---------------------- | ------------------------ |
| `/opsx:propose "desc"` | Plan a change            |
| `/opsx:apply`          | Implement                |
| `/opsx:archive`        | Archive done change      |
| `/opsx:explore`        | Think mode               |
| `/opsx:onboard`        | Guided tutorial          |
| `/opsx:verify`         | Check impl matches specs |
