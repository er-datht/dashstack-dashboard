# OpenSpec + Agent Pipeline Workflow Setup Guide

A step-by-step guide to set up the spec-driven development workflow with Claude Code subagents in any project (new or existing).

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start (TL;DR)](#quick-start)
4. [Step 1: Install OpenSpec CLI](#step-1-install-openspec-cli)
5. [Step 2: Initialize OpenSpec](#step-2-initialize-openspec)
6. [Step 3: Create Directory Structure](#step-3-create-directory-structure)
7. [Step 4: Set Up Agent Definitions](#step-4-set-up-agent-definitions)
8. [Step 5: Set Up Skills](#step-5-set-up-skills)
9. [Step 6: Set Up Slash Commands](#step-6-set-up-slash-commands)
10. [Step 7: Create the Workflow File](#step-7-create-the-workflow-file)
11. [Step 8: Add Workflow Section to CLAUDE.md](#step-8-add-workflow-section-to-claudemd)
12. [Step 9: Configure Permissions](#step-9-configure-permissions)
13. [Step 10: Verify the Setup](#step-10-verify-the-setup)
14. [Customization Guide](#customization-guide)
15. [For Existing Projects](#for-existing-projects)
16. [Command Reference](#command-reference)
17. [Troubleshooting](#troubleshooting)

---

## Overview

This workflow combines two systems:

- **OpenSpec** — governs the planning lifecycle: proposing, designing, specifying, and tasking changes before any code is written.
- **Agent Pipeline** — governs execution: which Claude Code subagent handles what, in what order, during implementation.

**Four guiding principles:**

- **Fluid not rigid** — Artifacts can be created in any order. Don't force a linear phase gate when a different sequence makes more sense.
- **Iterative not waterfall** — Requirements change as understanding deepens. Revisit and revise artifacts at any point.
- **Easy not complex** — Every change gets a proposal, but a one-line fix gets a one-line proposal — not the same ceremony as a new feature.
- **Brownfield-first** — Most work modifies existing systems. Read the code, understand what's there, specify deltas.

**Every change runs the same pipeline. Size controls depth per stage, not which stages run:**

```
requirements-analyst              (clarify requirements with the user FIRST)
  → opsx:propose               (generate artifacts from clarified requirements)
  → security-reviewer          (if yarn add / external code — ⛔ BLOCKS until safe)
  → unit-test-writer           (if testable units — skip for pure config/styling/docs)
  ⏸ WAIT — present findings, wait for user to trigger apply
  → opsx:apply via implementation-specialist   (user-triggered only)
  → code-reviewer              (address findings before continuing)
  → opsx:verify
  → opsx:archive
```

- **Small fix** — fast pass through every stage (quick requirements-analyst pass, may need zero questions). Skip `unit-test-writer` / `security-reviewer` only when their gate condition is met.
- **Medium change** — normal depth. `requirements-analyst` and `code-reviewer` are never skipped.
- **Large change** — deep pass with thorough requirements gathering by `requirements-analyst` before `opsx:propose` runs. **Always wait for user to trigger `opsx:apply`.**

---

## Prerequisites

- **Claude Code** — CLI, desktop app, or IDE extension
- **Node.js** — v18+ (for OpenSpec CLI via npx)
- **Git** — project should be a git repository

---

## Quick Start

For the impatient — run these commands, then follow the detailed sections to fill in file contents:

```bash
# 1. Install OpenSpec
npm install -g openspec-cli
# OR use npx (no global install): npx openspec --version

# 2. Initialize OpenSpec in your project root
openspec init

# 3. Create the .claude directory structure
mkdir -p .claude/agents
mkdir -p .claude/skills/openspec-propose
mkdir -p .claude/skills/openspec-apply-change
mkdir -p .claude/skills/openspec-archive-change
mkdir -p .claude/skills/openspec-explore
mkdir -p .claude/skills/openspec-new-change
mkdir -p .claude/skills/openspec-continue-change
mkdir -p .claude/skills/openspec-ff-change
mkdir -p .claude/skills/openspec-verify-change
mkdir -p .claude/skills/openspec-sync-specs
mkdir -p .claude/skills/openspec-bulk-archive-change
mkdir -p .claude/commands/opsx

# 4. Create the OpenSpec directory
mkdir -p openspec/specs
mkdir -p openspec/changes

# 5. Then copy the file contents from this guide into each file
```

---

## Step 1: Install OpenSpec CLI

**Option A: Global install**
```bash
npm install -g openspec-cli
```

**Option B: Use via npx (no install needed)**
```bash
npx openspec --version
```

**Option C: Add as dev dependency**
```bash
# npm
npm install --save-dev openspec-cli

# yarn
yarn add --dev openspec-cli

# pnpm
pnpm add --save-dev openspec-cli
```

Verify it works:
```bash
openspec --version   # or: npx openspec --version
# Should output: 1.3.0 (or newer)
```

---

## Step 2: Initialize OpenSpec

In your project root:

```bash
openspec init
```

This creates the `openspec/` directory with the default `spec-driven` schema. The schema defines the artifact sequence: proposal → specs → design → tasks.

If `openspec/` already exists, skip this step.

---

## Step 3: Create Directory Structure

Your project needs this structure under `.claude/`:

```
.claude/
├── agents/
│   ├── code-reviewer.md
│   ├── requirements-analyst.md
│   ├── security-reviewer.md
│   ├── unit-test-writer.md               # TDD: tests from specs before implementation
│   └── <implementation-specialist>.md    # Name varies by stack
├── skills/
│   ├── openspec-propose/SKILL.md
│   ├── openspec-apply-change/SKILL.md
│   ├── openspec-archive-change/SKILL.md
│   ├── openspec-explore/SKILL.md
│   ├── openspec-new-change/SKILL.md
│   ├── openspec-continue-change/SKILL.md
│   ├── openspec-ff-change/SKILL.md
│   ├── openspec-verify-change/SKILL.md
│   ├── openspec-sync-specs/SKILL.md
│   └── openspec-bulk-archive-change/SKILL.md
├── commands/opsx/
│   ├── propose.md
│   ├── apply.md
│   ├── archive.md
│   ├── explore.md
│   ├── new.md
│   ├── continue.md
│   ├── ff.md
│   ├── verify.md
│   ├── sync.md
│   ├── bulk-archive.md
│   └── onboard.md
├── workflow.md
└── settings.local.json
```

And under `openspec/`:
```
openspec/
├── specs/              # Main specs (accumulated knowledge)
├── changes/            # Active changes
│   └── archive/        # Completed changes
└── .openspec.yaml      # (per-change, created by CLI)
```

Create the directories:

```bash
mkdir -p .claude/agents
mkdir -p .claude/skills/openspec-propose
mkdir -p .claude/skills/openspec-apply-change
mkdir -p .claude/skills/openspec-archive-change
mkdir -p .claude/skills/openspec-explore
mkdir -p .claude/skills/openspec-new-change
mkdir -p .claude/skills/openspec-continue-change
mkdir -p .claude/skills/openspec-ff-change
mkdir -p .claude/skills/openspec-verify-change
mkdir -p .claude/skills/openspec-sync-specs
mkdir -p .claude/skills/openspec-bulk-archive-change
mkdir -p .claude/commands/opsx
mkdir -p openspec/specs
mkdir -p openspec/changes/archive
```

---

## Step 4: Set Up Agent Definitions

These are Claude Code custom agent definitions. Each file lives in `.claude/agents/`.

### 4.1 Implementation Specialist

**Choose one based on your stack.** The agent name and description change, but the role is the same: handle all code implementation tasks.

**File:** `.claude/agents/<specialist-name>.md`

| Stack | File Name | `subagent_type` |
|-------|-----------|-----------------|
| React/Next.js frontend | `react-frontend-specialist.md` | `react-frontend-specialist` |
| Python backend | `python-backend-specialist.md` | `python-backend-specialist` |
| Full-stack Node | `fullstack-specialist.md` | `fullstack-specialist` |
| Mobile (React Native) | `mobile-specialist.md` | `mobile-specialist` |
| Generic | `implementation-specialist.md` | `implementation-specialist` |

**Template** (adapt the description/expertise to your stack):

```markdown
---
name: <specialist-name>
description: "Use this agent when building components, implementing features, fixing bugs, refactoring code, or any code writing task. This agent should be invoked PROACTIVELY for all implementation work."
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: blue
---

You are an elite <stack> developer with deep expertise in <technologies>.

## Core Responsibilities

- Design and implement code following project conventions
- Build with proper error handling and edge case coverage
- Implement proper typing/validation for type safety
- Handle loading states, error states, and empty states
- Follow the project's existing patterns and architecture

## Technical Standards

<< List your stack-specific standards here >>

## Implementation Workflow

1. **Analysis**: Understand requirements and existing code
2. **Planning**: Break down into components and identify dependencies
3. **Ask for Approval**: Propose plan and ask before making changes
4. **Implementation**: Code with best practices and error handling
5. **Self-Review**: Verify types, no errors, follows conventions, edge cases handled

## Code Quality Standards

- Clean Code: Self-documenting code with meaningful names
- SOLID Principles where applicable
- DRY & KISS: Don't repeat yourself, keep it simple
- Proper error handling
```

### 4.2 Unit Test Writer

**File:** `.claude/agents/unit-test-writer.md`

This agent writes unit tests from OpenSpec artifacts **before** implementation begins (TDD approach). It analyzes which tasks produce testable units and creates test files following your project's test conventions.

**Customize** the test conventions section (framework, file location, patterns) to match your project.

```markdown
---
name: unit-test-writer
description: "TDD specialist that writes unit tests from OpenSpec artifacts (specs, design, tasks) BEFORE implementation begins. Analyzes which tasks produce testable units and creates test files following project conventions. Uses a lean approach: happy path + key edge cases. Invoked after requirements-analyst and before implementation specialist."
tools: Read, Edit, Write, Bash, Glob, Grep, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: green
---

You are a TDD specialist who writes unit tests from specifications before any implementation code exists. You read OpenSpec artifacts (specs, design, tasks) and create test files that define the behavioral contract for upcoming implementation.

## Core Responsibility

Write test files BEFORE implementation based on specs — not implementation details. Your tests define **what** the code should do, and the implementation specialist writes code to make them pass.

You do NOT write implementation code. You only write test files.

## What You Test

Analyze each task and only write tests for tasks that produce testable units:

**DO test:**
- Components (render output, props behavior, user interactions, conditional rendering)
- Utility functions (pure input/output)
- Custom hooks (state transitions, return values)
- Service functions (API call structure, data transformation)

**DO NOT test (skip these tasks):**
- Route/navigation config additions
- Translation/i18n key additions
- CSS/styling-only changes
- Configuration file changes
- File reorganization / moves / renames
- Type-only files (type definitions, interfaces)

## Test Coverage: Lean TDD

- **Happy path**: The primary use case works correctly
- **Key edge cases**: Empty states, boundary values, null/undefined inputs
- **Error states**: What happens when things go wrong
- **Conditional rendering**: Different outputs based on props/state

3-5 focused tests per unit. More only for complex units with many distinct states.

## Project Test Conventions (CUSTOMIZE THIS)

<< Adapt these to match your project's test setup >>

1. **Framework**: << Vitest / Jest / other >> with << jsdom / node >> environment
2. **Component Testing**: << @testing-library/react / Enzyme / other >>
3. **File location**: << __tests__/ dirs / *.test.ts co-located / other >>
4. **Mocks**: << describe any global mocks in your setup file >>
5. **Conventions**: << describe naming, import, and structure patterns >>

## Pragmatic TDD Rules

1. **Tests define the contract** — implementation specialist writes code to make them pass
2. **Minor fixes allowed** — implementation specialist may fix trivial test issues inline (import paths, type tweaks)
3. **Major mismatches get flagged** — fundamentally wrong expectations must be flagged back to the spec
4. **Tests must pass before task completion** — implementation specialist runs tests after each task

## Guardrails

- NEVER write implementation code — only test files
- NEVER guess at implementation details — test behavior from specs only
- Follow existing project test patterns exactly
- If a spec is too vague to write meaningful tests, flag it rather than guessing
```

### 4.3 Requirements Analyst

**File:** `.claude/agents/requirements-analyst.md`

This agent's #1 job is to **ask the user as many clarifying questions as needed** before `opsx:propose` generates any artifacts. It treats every gap in the user's description as a question, never as a decision to make on its own.

```markdown
---
name: requirements-analyst
description: "Requirements analyst that runs BEFORE opsx:propose. Checks the user's description, explores the codebase for context, asks clarifying questions, and resolves all ambiguities so that opsx:propose generates correct artifacts the first time."
tools: Read, Edit, Write, Glob, Grep, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: green
---

You are a meticulous requirements analyst. Your #1 job is to **ask the user as many clarifying questions as needed** to fully understand requirements BEFORE opsx:propose generates any artifacts. You never assume, guess, or fill in gaps on your own — if something is unclear, ambiguous, or unstated, you ASK.

## Core Principle: Ask, Don't Assume

Every gap in the user's description is a question, not a decision for you to make. Hallucination in software comes from filling in unstated requirements with guesses. Your role is to surface every assumption and turn it into an explicit, user-confirmed requirement BEFORE any artifacts are generated.

Never let vague requirements pass through to opsx:propose. Every behavioral detail that opsx:propose needs must trace back to either (a) the user's explicit statement or (b) a verifiable convention in the existing codebase.

## Purpose

Quality gate BEFORE opsx:propose. Ensure requirements are clear, complete, and unambiguous so that opsx:propose generates correct artifacts the first time — reducing rework and re-review.

## Review Process

### Phase 1: Read & Understand
1. Analyze the user's description — identify what's stated, what's implied, what's missing
2. Read relevant existing code that will be affected by this change
3. Read the project's architecture context from CLAUDE.md
4. Check existing specs and archived changes for related prior work

### Phase 2: Exhaustive Assumption Mining (MOST CRITICAL)
Go through the user's description and extract EVERY implicit assumption. Mine for:
- Behavioral, scope, data, UX, business logic, integration, visual/design, and edge case assumptions
- Turn each into a question for the user

### Phase 3: Generate Requirements Review
- Questions for the User section is the CORE output (grouped by category)
- Assumptions section lists every assumption opsx:propose would have to make
- Aim for 10-15+ questions — better to over-ask than under-ask

### Phase 4: Interactive Refinement (Multi-Round)
1. Ask ALL questions — explain WHY each matters
2. Wait for answers before proceeding
3. Analyze answers for NEW questions or contradictions — ask follow-ups
4. Repeat until no remaining ambiguities (2-3 rounds is normal)
5. Produce a requirements summary for opsx:propose
6. Final confirmation: "Does this fully capture what you want?"

## Anti-Hallucination Rules
1. Never invent requirements — if user didn't say it, ask
2. Never fill in "reasonable defaults" silently — surface and confirm
3. Flag vague language ruthlessly ("appropriate", "proper", "nice", "handle correctly")
4. Prefer asking "dumb" questions over making "smart" assumptions
5. One-line descriptions → expand into 10+ questions
6. Your output feeds directly into opsx:propose — every unresolved ambiguity becomes a guess

## What You Do NOT Do
- You do NOT implement code
- You do NOT review code (that's code-reviewer)
- You do NOT assess package security (that's security-reviewer)
- You do NOT generate proposal artifacts (that's opsx:propose, which runs after you)
- You do NOT assume answers to your own questions — you ALWAYS ask the user
```

### 4.4 Code Reviewer

**File:** `.claude/agents/code-reviewer.md`

```markdown
---
name: code-reviewer
description: "Elite code review expert specializing in code analysis, security vulnerabilities, performance optimization, and production reliability. Use PROACTIVELY for code quality assurance after implementation."
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: yellow
---

You are an elite code review expert specializing in modern code analysis, quality assurance, and production reliability.

## Purpose

Final quality gate after implementation. Ensures code quality, security, performance, and maintainability.

## Capabilities

- Security vulnerability detection (OWASP Top 10)
- Performance and scalability analysis
- Code quality and maintainability assessment
- Project convention compliance
- Error handling and resilience review

## Review Process

1. Analyze code context and identify review scope
2. Assess security implications
3. Evaluate performance impact
4. Review for consistency with project patterns
5. Provide structured feedback organized by severity
6. Suggest improvements with specific code examples

## Behavioral Traits

- Constructive and educational tone
- Prioritizes security and production reliability
- Provides specific, actionable feedback with code examples
- Balances thoroughness with practical development velocity
```

### 4.5 Security Reviewer

**File:** `.claude/agents/security-reviewer.md`

```markdown
---
name: security-reviewer
description: "Use this agent when about to install a dependency, add a package, fetch an external URL, or trust code from a web search. Also use proactively when you see install commands about to be executed."
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: red
---

You are an elite dependency and web security reviewer with deep expertise in software supply-chain security, CVE databases, and package registry ecosystems.

## Core Principles

- **Default untrusted**: Treat ALL new packages, URLs, and external code as untrusted
- **Advisory, not autonomous**: You provide assessments. You NEVER execute install commands yourself
- **Conservative by default**: When evidence is incomplete, lean toward `ask` or `stop`
- **Evidence-based**: Every claim must be backed by verifiable evidence

## Review Procedure

For every package, URL, or external code:

1. **Identity Verification** — exact name, registry, version; check for typosquatting
2. **Vulnerability Assessment** — known CVEs, security advisories
3. **Installation Safety** — install scripts, postinstall hooks, binary downloads
4. **Maintainer & Project Health** — reputation, age, release cadence, downloads
5. **License Compatibility** — flag copyleft, missing, or unclear licenses
6. **Source Trust** — verify URLs and GitHub repos match published packages
7. **Alternatives Assessment** — is it already in the project? simpler alternative?

## Verdicts

Every review MUST conclude with one of:
- **✅ allow**: Low risk, well-established, properly licensed, no known vulnerabilities
- **⚠️ ask**: Incomplete evidence or moderate concern, user should decide
- **🛑 stop**: Meaningful security, supply-chain, or licensing concern

## Output Format

```
## Security Review
- **Action**: [install/fetch/trust]
- **Target**: [package name, version, or URL]
- **Ecosystem**: [yarn/npm/pip/cargo/etc.]
- **Risk Level**: [low/moderate/high/critical]
- **Verdict**: [✅ allow | ⚠️ ask | 🛑 stop]
### Evidence
### Missing Information
### Recommended Next Step
### Safer Alternative
```

## Special Rules

- Check existing dependencies first — functionality may already be covered
- For this project, these packages are already approved: << LIST YOUR APPROVED PACKAGES >>
```

---

## Step 5: Set Up Skills

Skills are SKILL.md files that define how Claude Code executes specific operations. These are the same across all projects — **copy them directly** from the reference project.

Each skill file lives at `.claude/skills/<skill-name>/SKILL.md`.

### Where to get the skill files

**Option A: Copy from this project**

The skill files are located in this project at `.claude/skills/*/SKILL.md`. Copy them directly:

```bash
# From the reference project (dashstack-dashboard), copy to your target project:
SOURCE="/path/to/dashstack-dashboard"
TARGET="/path/to/your-project"

for skill in openspec-propose openspec-apply-change openspec-archive-change \
             openspec-explore openspec-new-change openspec-continue-change \
             openspec-ff-change openspec-verify-change openspec-sync-specs \
             openspec-bulk-archive-change; do
  mkdir -p "$TARGET/.claude/skills/$skill"
  cp "$SOURCE/.claude/skills/$skill/SKILL.md" "$TARGET/.claude/skills/$skill/SKILL.md"
done
```

**Option B: Install OpenSpec skills via CLI (if supported)**

Check if `openspec` can scaffold skills:
```bash
openspec init --with-skills   # Check openspec docs for current syntax
```

### Skills Summary

| Skill Name | Purpose |
|-----------|---------|
| `openspec-propose` | Create a change and generate all artifacts in one step |
| `openspec-apply-change` | Implement tasks from a change |
| `openspec-archive-change` | Archive a completed change |
| `openspec-explore` | Think-mode: investigate before implementing |
| `openspec-new-change` | Start a new change step-by-step |
| `openspec-continue-change` | Continue creating the next artifact |
| `openspec-ff-change` | Fast-forward: generate all artifacts at once |
| `openspec-verify-change` | Verify implementation matches artifacts |
| `openspec-sync-specs` | Sync delta specs to main specs |
| `openspec-bulk-archive-change` | Archive multiple changes at once |

**These skill files are stack-agnostic** — they work identically regardless of your project's tech stack because they only manage OpenSpec artifacts, not application code.

---

## Step 6: Set Up Slash Commands

Slash commands are the user-facing `/opsx:*` commands. They live in `.claude/commands/opsx/`.

Like skills, these are **stack-agnostic** — copy them directly from the reference project.

```bash
SOURCE="/path/to/dashstack-dashboard"
TARGET="/path/to/your-project"

mkdir -p "$TARGET/.claude/commands/opsx"

for cmd in propose apply archive explore new continue ff verify sync bulk-archive onboard; do
  cp "$SOURCE/.claude/commands/opsx/$cmd.md" "$TARGET/.claude/commands/opsx/$cmd.md"
done
```

### Commands Summary

| Command | Purpose |
|---------|---------|
| `/opsx:propose "description"` | Plan a change (proposal, design, specs, tasks) |
| `/opsx:apply [change-name]` | Implement tasks from a change |
| `/opsx:archive [change-name]` | Archive a completed change |
| `/opsx:explore [topic]` | Think through ideas (read-only) |
| `/opsx:new [name]` | Start a new change, step by step |
| `/opsx:continue [name]` | Continue creating next artifact |
| `/opsx:ff [name]` | Fast-forward: all artifacts at once |
| `/opsx:verify [name]` | Verify implementation matches specs |
| `/opsx:sync [name]` | Sync delta specs to main specs |
| `/opsx:bulk-archive` | Archive multiple changes |
| `/opsx:onboard` | Guided tutorial walkthrough |

---

## Step 7: Create the Workflow File

**File:** `.claude/workflow.md`

This file defines the integrated workflow — when to use which agent and in what order.

**Adapt the "Implementation specialist" references to match your chosen agent name.**

```markdown
# Workflow

## Principles

- **Fluid not rigid** — Artifacts can be created in any order. Don't force a linear phase gate when a different sequence makes more sense.
- **Iterative not waterfall** — Requirements change as understanding deepens. Revisit and revise artifacts at any point.
- **Easy not complex** — Every change gets a proposal, but a one-line fix gets a one-line proposal — not the same ceremony as a new feature.
- **Brownfield-first** — Read existing code first, then specify deltas — not green-field descriptions.

## The Pipeline (every change)

1. `requirements-analyst` — check requirements, ask clarifying questions, resolve ambiguities BEFORE generating artifacts
2. `opsx:propose` — create proposal + design + specs + tasks (from clarified requirements)
3. `security-reviewer` — before any dependency add / external URL / web-sourced code (skip only if the change adds none). **⛔ BLOCKING: all work pauses until verdict is ✅ allow.**
4. `unit-test-writer` — before `opsx:apply` when the change produces testable units (skip only for pure config/routing/styling/docs)
5. **⏸ WAIT for user** — present findings from steps 3–4 and wait for the user to explicitly trigger `opsx:apply`. Never auto-chain implementation.
6. `opsx:apply` via implementation-specialist — writes code (user-triggered)
7. `code-reviewer` — reviews the diff
8. `opsx:verify` — checks implementation matches specs
9. `opsx:archive` — finalizes

Right-size by shortening each stage, not by removing stages.

## Right-Sizing the Process

**Small changes** (typos, renames, one-line fixes):
- Full pipeline, minimal depth. `requirements-analyst` and `code-reviewer` are never skipped — quick pass (may need zero questions). Skip `unit-test-writer` only if no testable unit is produced; skip `security-reviewer` only if no deps/external code.

**Medium changes** (new component, multi-file bug fix, refactor):
- Full pipeline, normal depth. Do not skip `requirements-analyst` — it catches gaps before artifacts are generated.

**Large changes** (new page, new feature, cross-cutting refactor):
- Full pipeline, deep depth. `requirements-analyst` does thorough requirements gathering — **wait for user answers** before running `opsx:propose`.

## OpenSpec Commands

- `/opsx:propose "description"` — Plan a change (proposal, design, specs, tasks)
- `/opsx:apply [change-name]` — Implement tasks from a change
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think mode (read-only)

## Available Agents

| Agent | OpenSpec Stage | Purpose | Skip when |
|-------|---------------|---------|-----------|
| requirements-analyst | **Before** `opsx:propose` | Checks requirements, asks clarifying questions, resolves ambiguities | Never — even "obvious" requests have hidden assumptions |
| security-reviewer | Before package install / external URL | **⛔ BLOCKING** — reviews packages, URLs, and external code for supply-chain risks. All work pauses until safe. | Change adds no deps and no external code |
| unit-test-writer | Before `opsx:apply` (TDD) | Writes tests from specs before implementation | No testable units — pure config/routing/styling/docs |
| implementation-specialist | During `opsx:apply` | Implements code | No code surface |
| code-reviewer | After `opsx:apply` | Reviews the diff for quality, security, correctness | Never |

## Verify Before Archiving

For large changes, use `/opsx:verify` before `/opsx:archive` to check implementation matches artifacts:
- **Completeness** — All tasks done, all requirements implemented
- **Correctness** — Implementation matches spec intent, edge cases handled
- **Coherence** — Design decisions reflected in code

Verify won't block archive, but it surfaces issues worth addressing first.

## Archive Maintenance

When archive exceeds ~50 changes, sync all to main specs (`opsx:sync`), keep the 20 most recent archives, delete the rest. Git preserves the full history — use `git log -- openspec/changes/archive/` to recover old proposals if needed.

## When Requirements Change

- **Same intent, refined scope** → update the existing change (revise specs/tasks, continue)
- **Fundamentally different direction** → start a new change (old artifacts become context, not waste)

## Context Sources

When starting a change, check relevant context from:
1. **Main specs** (`openspec/specs/`) — authoritative feature definitions
2. **Archived changes** (`openspec/changes/archive/`) — prior decisions and patterns
3. **Active changes** (`openspec/changes/`) — in-progress work that may overlap
```

---

## Step 8: Add Workflow Section to CLAUDE.md

Your `CLAUDE.md` file needs a **Workflow** section that tells Claude Code to follow the spec-driven workflow. Add this section to your existing `CLAUDE.md` (or create one if it doesn't exist).

**Replace `<implementation-specialist>` with your chosen agent name** (e.g., `react-frontend-specialist`, `python-backend-specialist`).

```markdown
## Workflow

### Principles

The workflow follows four OpenSpec principles:

- **Fluid not rigid** — Artifacts can be created in any order. Don't force a linear phase gate when a different sequence makes more sense for the change at hand.
- **Iterative not waterfall** — Requirements change as understanding deepens. Revisit and revise artifacts at any point — a proposal written before reading the code may need to change after.
- **Easy not complex** — Every change gets a proposal, but a one-line fix gets a one-line proposal. Size scales *depth*, not which stages run.
- **Brownfield-first** — This is an existing codebase. Read the code, understand what's there, then specify *deltas* — not green-field descriptions.

### Right-Sizing the Process

Every change runs the same OpenSpec pipeline. Subagents are **mandatory at their stage** — size only affects how deep each agent goes, never whether the agent runs.

**The pipeline (every change):**

1. `requirements-analyst` — check requirements, ask clarifying questions, resolve ambiguities BEFORE generating artifacts
2. `opsx:propose` — create proposal + design + specs + tasks (from clarified requirements)
3. `security-reviewer` — before any dependency add / external URL / web-sourced code (skip only if the change adds none). **⛔ BLOCKING: all work pauses until verdict is ✅ allow.**
4. `unit-test-writer` — before `opsx:apply` when the change produces testable units (skip only for pure config, routing, docs, cosmetic styling)
5. **⏸ WAIT for user** — present findings from steps 3–4 and wait for the user to explicitly trigger `opsx:apply`. Never auto-chain implementation.
6. `opsx:apply` via `<implementation-specialist>` — implementation (user-triggered)
7. `code-reviewer` — review the diff
8. `opsx:verify` — validate implementation matches specs
9. `opsx:archive` — finalize; update the "Existing specs" list below

**Small changes** (typos, renames, one-line fixes, simple styling tweaks):
- Full pipeline, minimal depth. `requirements-analyst` and `code-reviewer` are never skipped — quick pass (may need zero questions). Skip `unit-test-writer` only if no testable unit is produced; skip `security-reviewer` only if no deps/external code.

**Medium changes** (new component, bug fix spanning multiple files, refactor):
- Full pipeline, normal depth. `requirements-analyst` and `code-reviewer` are never skipped.

**Large changes** (new page, new feature, cross-cutting refactor):
- Full pipeline, deep depth. `requirements-analyst` does thorough requirements gathering — **wait for user answers** before running `opsx:propose`. After pre-implementation stages complete, **always wait for user to trigger `opsx:apply`**.

### When to Use OpenSpec

Always use `opsx:propose` before implementing any change. The proposal scales to the change — a simple fix gets a brief proposal, a new feature gets a thorough one.

**OpenSpec commands:**
- `/opsx:propose "description"` — Plan a change (proposal, design, specs, tasks)
- `/opsx:apply [change-name]` — Implement tasks from a change
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think through ideas (read-only)

[OpenSpec](https://github.com/Fission-AI/OpenSpec) specs live in `openspec/`.

### Available Subagents

Each agent maps to a specific stage of the OpenSpec workflow. The agent is required at its stage unless its explicit "Skip when" condition is met.

| Agent | OpenSpec Stage | Purpose | Skip when |
|-------|---------------|---------|-----------|
| `requirements-analyst` | **Before** `opsx:propose` | Checks requirements, asks clarifying questions, resolves ambiguities so `opsx:propose` generates correct artifacts the first time | Never — even "obvious" requests have hidden assumptions |
| `security-reviewer` | Before `yarn add` / fetching external URLs / using web-searched code | **⛔ BLOCKING** — reviews packages, URLs, and external snippets for supply-chain risks. All work pauses until safe. | The change adds no dependencies and pulls in no external code |
| `unit-test-writer` | Before `opsx:apply` (TDD) | Writes tests from specs before implementation so tests drive the diff | No testable units — pure config, routing, styling-only, docs |
| `<implementation-specialist>` | During `opsx:apply` | Implements code following project conventions | The change has no code surface (e.g., pure config) |
| `code-reviewer` | After `opsx:apply`, before `opsx:verify` | Reviews the diff for quality, correctness, security | Never |

**Canonical sequence (every change):**

```
requirements-analyst              (clarify requirements with the user FIRST)
  → opsx:propose               (generate artifacts from clarified requirements)
  → security-reviewer          (if yarn add / external code — ⛔ BLOCKS until safe)
  → unit-test-writer           (if testable units; tests land first)
  ⏸ WAIT — present findings, wait for user to trigger apply
  → opsx:apply via <implementation-specialist>   (user-triggered only)
  → code-reviewer              (address findings before continuing)
  → opsx:verify
  → opsx:archive
```

Right-size within this sequence by shortening each stage — not by removing stages.

### Non-Code Actions (No Workflow Needed)

- Pure questions or explanations ("what does X do?", "explain this code")
- Git operations, running dev server, config lookups, reading files
- When the user explicitly invokes a specific `/opsx:` command directly (follow that command instead)

**Agent mapping for this project:**
- **Requirements analyst** → `requirements-analyst`
- **Unit test writer** → `unit-test-writer`
- **Implementation specialist** → `<implementation-specialist>`
- **Security reviewer** → `security-reviewer`
- **Code reviewer** → `code-reviewer`

**Existing specs** (archived in `openspec/changes/archive/`):
<!-- Add entries as you archive changes -->
```

---

## Step 9: Configure Permissions

**File:** `.claude/settings.local.json`

This file pre-approves safe commands so Claude Code doesn't prompt for permission on every openspec operation.

```json
{
  "permissions": {
    "allow": [
      "Bash(npx openspec:*)",
      "Bash(openspec new:*)",
      "Bash(openspec:*)",
      "WebSearch"
    ],
    "deny": [
      "Bash(curl:*)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ],
    "ask": []
  }
}
```

**Add your project-specific build/lint commands to `allow`:**

```json
{
  "permissions": {
    "allow": [
      "Bash(npx openspec:*)",
      "Bash(openspec new:*)",
      "Bash(openspec:*)",
      "WebSearch",
      "Bash(yarn build)",
      "Bash(yarn lint)",
      "Bash(yarn test)",
      "Bash(npm run build)",
      "Bash(npm run lint)",
      "Bash(npm run test)",
      "Bash(python -m pytest:*)",
      "Bash(cargo build:*)",
      "Bash(cargo test:*)",
      "Bash(go build:*)",
      "Bash(go test:*)"
    ],
    "deny": [
      "Bash(curl:*)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ],
    "ask": []
  }
}
```

---

## Step 10: Verify the Setup

Run these checks to confirm everything is in place:

```bash
# 1. OpenSpec CLI works
npx openspec --version

# 2. OpenSpec directory exists
ls openspec/

# 3. Agent definitions exist
ls .claude/agents/

# 4. Skills exist
ls .claude/skills/

# 5. Commands exist
ls .claude/commands/opsx/

# 6. Workflow file exists
cat .claude/workflow.md | head -5

# 7. CLAUDE.md has workflow section
grep -c "Principles" CLAUDE.md

# 8. Try creating a test change
npx openspec new change "test-setup"
npx openspec status --change "test-setup"

# 9. Clean up test
rm -rf openspec/changes/test-setup
```

**Then test with Claude Code:**

1. Open Claude Code in your project
2. Type `/opsx:onboard` to run the guided tutorial
3. Or type a change request like "add a health check endpoint" and verify Claude follows the propose → review → apply flow

---

## Customization Guide

### Adapting for Different Tech Stacks

The **only files that need stack-specific changes** are:

| File | What to Change |
|------|---------------|
| `.claude/agents/<specialist>.md` | Agent name, description, expertise, tools |
| `.claude/agents/unit-test-writer.md` | Test framework, file conventions, patterns for your stack |
| `.claude/workflow.md` | Agent name references |
| `CLAUDE.md` (Workflow section) | Agent name in `subagent_type`, sequencing rules |
| `.claude/agents/security-reviewer.md` | Approved packages list |
| `.claude/settings.local.json` | Build/lint/test command permissions |

Everything else (skills, commands, requirements-analyst, code-reviewer) is **stack-agnostic**.

### Stack-Specific Agent Examples

**React/Next.js Frontend:**
```yaml
name: react-frontend-specialist
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
# Add Figma tools if using Figma integration:
# mcp__figma__get_design_context, mcp__figma__get_screenshot, etc.
```

**Python Backend (Django/FastAPI):**
```yaml
name: python-backend-specialist
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
```

**Go Backend:**
```yaml
name: go-backend-specialist
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
```

**Full-Stack (multiple specialists):**
You can have multiple implementation specialists. Update CLAUDE.md to route tasks:
```markdown
**Agent mapping:**
- Frontend tasks → `react-frontend-specialist`
- Backend tasks → `python-backend-specialist`
- Infra tasks → `devops-specialist`
```

### Adding MCP Server Tools to Agents

If you use MCP servers (Figma, IDE diagnostics, etc.), add the tool names to the agent's `tools` field:

```yaml
tools: Read, Edit, Write, WebSearch, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList, mcp__figma__get_screenshot, mcp__figma__get_design_context, mcp__ide__getDiagnostics
```

### Adding Agent Memory to Security Reviewer

The security reviewer benefits from persistent memory to track reviewed packages:

Add to `.claude/agents/security-reviewer.md`:
```markdown
memory: project
```

And create the memory directory:
```bash
mkdir -p .claude/agent-memory/security-reviewer
```

---

## For Existing Projects

If you have an existing project and want to add this workflow:

### 1. Don't change existing code

The workflow is purely additive — it adds `.claude/` and `openspec/` directories but doesn't modify your existing code.

### 2. Bootstrap existing architecture as specs

For existing projects, you can retroactively create specs from your current architecture. This gives Claude Code context about your project's patterns and decisions.

**Quick approach — archive existing knowledge:**

```bash
# Create a change to document existing architecture
npx openspec new change "existing-architecture"
```

Then describe your project's architecture in the proposal and specs. Archive it immediately — this becomes the baseline context for future changes.

**Or use `/opsx:explore` first:**

Start a Claude Code session and run:
```
/opsx:explore current architecture
```

Claude will investigate your codebase and help you identify what's worth documenting as specs.

### 3. Add to .gitignore (optional)

If you want to keep settings local:
```
# .gitignore
.claude/settings.local.json
.claude/agent-memory/
```

The rest of `.claude/` (agents, skills, commands, workflow.md) should be committed so the workflow is shared across your team.

### 4. Update CLAUDE.md

If you already have a `CLAUDE.md`, just add the Workflow section from [Step 8](#step-8-add-workflow-section-to-claudemd). Don't remove your existing sections — the workflow section is additive.

---

## Command Reference

### Core Workflow (daily use)

| Command | When to Use |
|---------|------------|
| `/opsx:propose "add login page"` | Starting any new feature or fix |
| `/opsx:apply` | After reviewing and approving the proposal |
| `/opsx:archive` | After implementation is complete |
| `/opsx:explore "auth options"` | Thinking through a problem before committing |

### Additional Commands

| Command | When to Use |
|---------|------------|
| `/opsx:new "add-auth"` | Start a change and step through artifacts one by one |
| `/opsx:continue` | Resume creating artifacts for an existing change |
| `/opsx:ff "add-auth"` | Fast-forward: create all artifacts at once (like propose) |
| `/opsx:verify` | Verify implementation matches specs before archiving |
| `/opsx:sync` | Sync delta specs to main specs without archiving |
| `/opsx:bulk-archive` | Archive multiple completed changes at once |
| `/opsx:onboard` | Guided tutorial for first-time users |

### Agent Pipeline

| Agent | OpenSpec Stage | `subagent_type` | Skip when |
|-------|---------------|-----------------|-----------|
| Requirements Analyst | **Before** `opsx:propose` | `requirements-analyst` | **Never** |
| Security Reviewer | Before package install / external URL | `security-reviewer` | No deps / no external code |
| Unit Test Writer | Before `opsx:apply` | `unit-test-writer` | No testable units produced |
| Implementation Specialist | During `opsx:apply` | `<your-specialist-name>` | No code surface |
| Code Reviewer | After `opsx:apply` | `code-reviewer` | **Never** |

---

## Troubleshooting

### "openspec: command not found"
```bash
# Use npx instead:
npx openspec --version

# Or install globally:
npm install -g openspec-cli
```

### Claude doesn't follow the workflow
- Check that `CLAUDE.md` exists in your project root
- Verify the "Workflow" section with "Principles" and "Right-Sizing" is present
- Make sure `.claude/workflow.md` exists
- Try `/opsx:onboard` to test the setup

### Skills don't appear in Claude Code
- Verify skill files are at `.claude/skills/<name>/SKILL.md` (exact path matters)
- Restart Claude Code after adding new skills
- Check that the SKILL.md has valid YAML frontmatter

### Commands don't appear
- Verify command files are at `.claude/commands/opsx/<name>.md`
- Restart Claude Code after adding new commands

### Agent not found errors
- Verify agent files are at `.claude/agents/<name>.md`
- Check that the `name` field in frontmatter matches the `subagent_type` used in CLAUDE.md
- Restart Claude Code

### Permissions issues
- Check `.claude/settings.local.json` for correct syntax
- Add project-specific commands to the `allow` list

---

## File Checklist

Use this checklist when setting up a new project:

```
Prerequisites:
- [ ] Node.js v18+ installed
- [ ] Claude Code installed
- [ ] OpenSpec CLI available (global or npx)

OpenSpec:
- [ ] openspec/ directory initialized
- [ ] openspec/specs/ exists
- [ ] openspec/changes/ exists
- [ ] openspec/changes/archive/ exists

Agents (.claude/agents/):
- [ ] <implementation-specialist>.md — adapted for your stack
- [ ] unit-test-writer.md — adapted for your test framework
- [ ] requirements-analyst.md
- [ ] code-reviewer.md
- [ ] security-reviewer.md

Skills (.claude/skills/):
- [ ] openspec-propose/SKILL.md
- [ ] openspec-apply-change/SKILL.md
- [ ] openspec-archive-change/SKILL.md
- [ ] openspec-explore/SKILL.md
- [ ] openspec-new-change/SKILL.md
- [ ] openspec-continue-change/SKILL.md
- [ ] openspec-ff-change/SKILL.md
- [ ] openspec-verify-change/SKILL.md
- [ ] openspec-sync-specs/SKILL.md
- [ ] openspec-bulk-archive-change/SKILL.md

Commands (.claude/commands/opsx/):
- [ ] propose.md
- [ ] apply.md
- [ ] archive.md
- [ ] explore.md
- [ ] new.md
- [ ] continue.md
- [ ] ff.md
- [ ] verify.md
- [ ] sync.md
- [ ] bulk-archive.md
- [ ] onboard.md

Configuration:
- [ ] .claude/workflow.md — agent names match your specialist
- [ ] .claude/settings.local.json — permissions configured
- [ ] CLAUDE.md — Workflow section added with correct agent names

Verification:
- [ ] npx openspec --version works
- [ ] /opsx:onboard runs successfully
- [ ] A test change request triggers the full workflow
```
