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

**The flow for every code change:**

```
User request
    │
    ▼
┌─────────────────────┐
│  1. Context Review   │  ← Review existing specs & archives
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  2. /opsx:propose    │  ← Generate proposal, design, specs, tasks
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  3. Proposal Review  │  ← proposal-reviewer agent validates
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  4. STOP & Wait      │  ← User reviews artifacts
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  5. /opsx:apply      │  ← Implementation via agent pipeline
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  6. /opsx:archive    │  ← Archive completed change
└─────────────────────┘
```

**Agent pipeline during apply:**

```
Simple feature/fix:
  proposal-reviewer → implementation-specialist → code-reviewer

With new dependency:
  proposal-reviewer → implementation-specialist → security-reviewer → implementation-specialist → code-reviewer
```

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
│   ├── proposal-reviewer.md
│   ├── security-reviewer.md
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

### 4.2 Proposal Reviewer

**File:** `.claude/agents/proposal-reviewer.md`

```markdown
---
name: proposal-reviewer
description: "Review and refine OpenSpec proposal artifacts after the propose stage completes. Checks completeness, identifies gaps, asks the user targeted clarifying questions, suggests improvements, and updates artifacts before implementation begins. Use this agent AFTER opsx:propose completes and BEFORE opsx:apply starts."
tools: Read, Edit, Write, Glob, Grep, Bash, Skill, TaskCreate, TaskGet, TaskUpdate, TaskList
model: opus
color: green
---

You are a meticulous proposal reviewer and requirements analyst. Your job is to review OpenSpec change artifacts (proposal, design, specs, tasks) after they are generated, identify gaps or ambiguities, ask the user targeted questions, and refine the artifacts before implementation begins.

## Purpose

You are the quality gate between **planning** (opsx:propose) and **execution** (opsx:apply). Your goal is to ensure that the implementation team (subagents) receives clear, complete, and unambiguous specs so they can build the right thing the first time.

## When You Run

You are invoked after `opsx:propose` generates all artifacts for a change and before `opsx:apply` begins implementation.

## Review Process

### Phase 1: Read & Understand
1. Read all artifacts in the change directory (proposal.md, design.md, specs/*/spec.md, tasks.md)
2. Read relevant existing code referenced in the proposal
3. Read the project's architecture context from CLAUDE.md

### Phase 2: Validate Artifacts
Check each artifact for:
- **Proposal**: Clear why, specific what, well-scoped capabilities, complete impact
- **Design**: Alternatives considered, risks mitigated, consistent with project patterns
- **Specs**: Testable scenarios (WHEN/THEN), edge cases, empty/error/loading states
- **Tasks**: Correct order, small enough, complete coverage, verification steps included

### Phase 3: Cross-Cutting Analysis
- Consistency between artifacts
- Completeness (implied requirements written down?)
- Feasibility given existing codebase
- Missing patterns from project conventions
- Dependency gaps

### Phase 4: Generate Review Report
```
## Proposal Review: <change-name>
### Status: <APPROVED | NEEDS REVISION | NEEDS DISCUSSION>
### Strengths
### Issues Found
#### Must Fix (blocks implementation)
#### Should Fix (reduces quality if skipped)
#### Consider (nice to have)
### Questions for the User
### Suggestions
```

### Phase 5: Interactive Refinement
1. Ask the user targeted questions
2. Wait for answers
3. Update artifacts based on answers
4. Confirm readiness for opsx:apply

## What You Do NOT Do
- You do NOT implement code
- You do NOT review code (that's code-reviewer)
- You do NOT assess package security (that's security-reviewer)
```

### 4.3 Code Reviewer

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

### 4.4 Security Reviewer

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

## Overview

This workflow combines two concerns:

- **OpenSpec** governs the planning lifecycle: proposing, designing, specifying, and tasking changes before any code is written.
- **Agent pipeline** governs execution: which agent handles what, in what order, during implementation.

## OpenSpec: Spec-Driven Development

### Lifecycle

All code changes follow five phases:

1. **Context** — review existing specs and archived changes
2. **Propose** — describe the change; generate proposal, design, specs, and tasks
3. **Review** — validate artifacts, identify gaps, refine before implementation
4. **Apply** — implement the tasks (execution follows the agent pipeline)
5. **Archive** — finalize and archive the completed change

### Context Gathering (Phase 0)

Before proposing or implementing any change, review:

1. **Main specs** (`openspec/specs/`) — authoritative feature definitions
2. **Archived changes** (`openspec/changes/archive/`) — prior decisions and patterns
3. **Active changes** (`openspec/changes/`) — in-progress work that may overlap

### Commands

- `/opsx:propose "description"` — Create a change with all artifacts
- `/opsx:apply [change-name]` — Implement tasks
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think mode (read-only)

## Agent Pipeline: Execution During Apply

### Agent Priority Order

1. **Proposal reviewer after propose** — validates artifacts before code is written
2. **Implementation specialist first during apply** — handles all code work
3. **Security reviewer before external trust** — gates package installs, URLs, web-searched code
4. **Code reviewer last** — final quality gate

### Decision Tree

1. Has the proposal just been generated? → use proposal reviewer
2. Is this a code implementation task? → use implementation specialist
3. Does this task require trusting something external? → use security reviewer
4. Is the work done and ready for validation? → use code reviewer

### Common Sequences

**Feature without new dependencies:**
proposal-reviewer → implementation-specialist → code-reviewer

**Feature with new package:**
proposal-reviewer → implementation-specialist (plan) → security-reviewer → implementation-specialist (implement) → code-reviewer

**Bug fix (existing code only):**
proposal-reviewer → implementation-specialist → code-reviewer

## Stop Rules

Pause and use the security reviewer if:
- About to run a package install command
- About to fetch or run a remote script
- Found a package through web search
- Considering copying code from a third-party source

Pause and use the code reviewer if:
- The change is done but not reviewed
- The fix touches auth, data flow, or API boundaries
```

---

## Step 8: Add Workflow Section to CLAUDE.md

Your `CLAUDE.md` file needs a **Workflow** section that tells Claude Code to follow the spec-driven workflow. Add this section to your existing `CLAUDE.md` (or create one if it doesn't exist).

**Replace `<implementation-specialist>` with your chosen agent name** (e.g., `react-frontend-specialist`, `python-backend-specialist`).

```markdown
## Workflow

### Auto-Trigger Rules

**MANDATORY**: When the user prompts with ANY action that implies a code change — including but not limited to "implement", "fix", "handle", "build", "add", "create", "update", "refactor", "resolve", "change", "remove", "delete", "move", "rename", "optimize", "improve" — you MUST follow this workflow automatically:

1. **Context first** — Before anything else, review existing specs (`openspec/specs/`) and archived changes (`openspec/changes/archive/`) relevant to the area being changed. Summarize findings to inform the proposal. Also check active changes (`openspec/changes/`) for overlap.
2. **Propose** — Invoke the `opsx:propose` skill with the user's description plus context findings to generate proposal, design, specs, and tasks before writing any code.
3. **Review proposal** — Launch the `proposal-reviewer` subagent to validate artifacts, identify gaps, ask clarifying questions, and refine the proposal before implementation.
4. **STOP and wait for user** — After the proposal review completes, present a summary and **stop**. Do NOT proceed to implementation automatically. Tell the user: "Run `/opsx:apply` when you're ready to implement."
5. **Apply with agent pipeline** — Only when the user invokes `/opsx:apply`, implement tasks using the specialized subagents (see **Mandatory Subagent Usage**). Never implement tasks inline.
6. **Archive when done** — Suggest `opsx:archive` once all tasks are complete. **When archiving, always update the "Existing specs" list in this file.**

**No exceptions for small changes.** Even trivial fixes go through the full propose → apply → archive cycle.

**Only skip the workflow for non-code actions:**
- Pure questions or explanations
- Non-code tasks (git operations, running dev server, reading files)
- When the user explicitly invokes a specific `/opsx:` command directly

### Mandatory Subagent Usage

During the **apply** phase, you MUST use the Agent tool with these specialized `subagent_type` values:

1. **`proposal-reviewer`** (Proposal quality gate) — Launch AFTER `opsx:propose` completes.
2. **`<implementation-specialist>`** (Implementation) — Launch for all code implementation tasks.
3. **`security-reviewer`** (Security gate) — Launch BEFORE any external trust action.
4. **`code-reviewer`** (Final quality gate) — Launch LAST after implementation is complete.

**Sequencing rules:**
- Simple feature/fix: `proposal-reviewer` → `<implementation-specialist>` → `code-reviewer`
- Feature needing new dependency: `proposal-reviewer` → `<implementation-specialist>` (plan) → `security-reviewer` → `<implementation-specialist>` (implement) → `code-reviewer`
- Dependency-only change: `proposal-reviewer` → `security-reviewer` → `code-reviewer`

**Never skip subagents.** Even for one-line changes, at minimum use the implementation specialist and code reviewer.

All code changes follow the spec-driven workflow defined in `.claude/workflow.md`.

**OpenSpec commands:**
- `/opsx:propose "description"` — Plan a change
- `/opsx:apply [change-name]` — Implement tasks
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think through ideas (read-only)

[OpenSpec](https://github.com/Fission-AI/OpenSpec) specs live in `openspec/`.

**Agent mapping for this project:**
- **Proposal reviewer** → `proposal-reviewer`
- **Implementation specialist** → `<implementation-specialist>`
- **Security reviewer** → `security-reviewer`
- **Code reviewer** → `code-reviewer`

**Existing specs** (archived in `openspec/changes/archive/`):
<!-- Add entries as you archive changes -->

**Project notes:**
- Most tasks start with `<implementation-specialist>`
- Package recommendations from web search go through `security-reviewer` first
- Final sign-off goes through `code-reviewer`
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
grep -c "Auto-Trigger Rules" CLAUDE.md

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
| `.claude/workflow.md` | Agent name references |
| `CLAUDE.md` (Workflow section) | Agent name in `subagent_type`, sequencing rules |
| `.claude/agents/security-reviewer.md` | Approved packages list |
| `.claude/settings.local.json` | Build/lint/test command permissions |

Everything else (skills, commands, proposal-reviewer, code-reviewer) is **stack-agnostic**.

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

| Agent | When Used | `subagent_type` |
|-------|-----------|-----------------|
| Proposal Reviewer | After propose, before apply | `proposal-reviewer` |
| Implementation Specialist | During apply, for all code tasks | `<your-specialist-name>` |
| Security Reviewer | Before installing packages or trusting external code | `security-reviewer` |
| Code Reviewer | After implementation, before considering done | `code-reviewer` |

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
- Verify the "Auto-Trigger Rules" section is present
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
- [ ] proposal-reviewer.md
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
