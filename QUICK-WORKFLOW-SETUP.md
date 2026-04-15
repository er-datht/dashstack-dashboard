# Quick Workflow Setup Guide

Set up the OpenSpec + Agent Pipeline workflow in any project in ~10 minutes.

## What You Get

Every code change follows: **propose** -> **review** -> **apply** -> **archive**

5 agents work in sequence:

1. `proposal-reviewer` — validates plan before coding
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

All code changes: Context -> Propose -> Review -> Apply -> Archive

## Agent Pipeline (during apply)

1. proposal-reviewer (validates artifacts)
2. unit-test-writer (writes tests from specs — TDD)
3. <your-specialist> (implements code to make tests pass)
4. security-reviewer (before package installs)
5. code-reviewer (final gate)

## Sequences

- Standard: proposal-reviewer -> unit-test-writer -> <your-specialist> -> code-reviewer
- With new package: proposal-reviewer -> unit-test-writer -> <your-specialist> -> security-reviewer -> <your-specialist> -> code-reviewer
```

## Step 6: Add to CLAUDE.md

Append this to your `CLAUDE.md` (replace `<your-specialist>`):

```markdown
## Workflow

### Auto-Trigger Rules

**MANDATORY**: For ANY code change action (implement, fix, add, create, update, refactor, etc.):

1. **Context** — Review openspec/specs/ and openspec/changes/archive/.
2. **Propose** — Invoke opsx:propose to generate artifacts.
3. **Review** — Launch proposal-reviewer to validate.
4. **STOP** — Tell user: "Run /opsx:apply when ready."
5. **Apply** — Implement via subagents (never inline).
6. **Archive** — Suggest opsx:archive when done.

Skip only for non-code actions (questions, git ops, reading files).

### Mandatory Subagent Usage

- `proposal-reviewer` — after propose
- `unit-test-writer` — writes tests from specs before implementation (TDD)
- `<your-specialist>` — implements code to make tests pass
- `security-reviewer` — before package installs
- `code-reviewer` — after implementation

**Commands:** /opsx:propose, /opsx:apply, /opsx:archive, /opsx:explore

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
grep "Auto-Trigger" CLAUDE.md       # workflow section exists
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
