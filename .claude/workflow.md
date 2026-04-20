# Workflow

## Principles

- **Fluid not rigid** — Artifacts can be created in any order. Don't force a linear phase gate when a different sequence makes more sense for the change at hand.
- **Iterative not waterfall** — Requirements change as understanding deepens. Revisit and revise artifacts at any point — a proposal written before reading the code may need to change after.
- **Easy not complex** — Scale process to the change. Every change gets a proposal, but a one-line fix gets a one-line proposal — not the same ceremony as a new feature.
- **Brownfield-first** — This is an existing codebase. Read the code, understand what's there, then specify *deltas* — not green-field descriptions.

## Overview

This workflow combines two concerns:

- **OpenSpec** governs the planning lifecycle: proposing, designing, specifying, and tasking changes.
- **Agent pipeline** governs execution: which agent handles what, in what order, during implementation.

OpenSpec answers *what* to build. The agent pipeline answers *how* to build it.

## Right-Sizing the Process

Match the process to the change. Use judgment, not a checklist.

**Small changes** (typos, renames, one-line fixes, simple styling tweaks):
- Use `opsx:propose` to create a brief proposal (can be minimal for obvious changes).
- Read the relevant code, make the change, verify it works.
- Use the implementation specialist for logic changes. Use code reviewer if subtle or risky.

**Medium changes** (new component, bug fix spanning multiple files, refactor):
- Review existing specs and code first to understand context.
- Use `opsx:propose` to plan. Review with proposal reviewer if there are ambiguities.
- Implement with the specialist. Write tests with unit test writer when testable.
- Run code reviewer on the result.

**Large changes** (new page, new feature, cross-cutting refactor):
- Full workflow: context review → propose → proposal reviewer Q&A → wait for user approval → unit test writer → implementation specialist → code reviewer.
- Archive with `opsx:archive` when done.

## OpenSpec

### When to Use

Always use `opsx:propose` before implementing any change. The proposal scales to the change — a simple fix gets a brief proposal, a new feature gets a thorough one.

### Context Gathering

Before proposing or implementing non-trivial changes, review the existing knowledge base:

1. **Main specs** (`openspec/specs/`) — authoritative feature definitions, data models, component contracts.
2. **Archived changes** (`openspec/changes/archive/`) — prior decisions, edge cases, patterns, and lessons learned.
3. **Active changes** (`openspec/changes/` excluding `archive/`) — in-progress work that may overlap.

Look for: data models, component contracts, integration patterns, edge cases, i18n/theme patterns, and prior design decisions relevant to the change.

### Commands

- `/opsx:propose "description"` — Create a new change with proposal, design, specs, and tasks
- `/opsx:apply [change-name]` — Implement tasks from a change
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think through ideas without implementing (read-only exploration mode)

## Available Agents

Use agents when they add value. Not every change needs every agent.

### Agent Roles

#### Proposal reviewer

Use when:

- `opsx:propose` has just completed and artifacts are ready for review
- the user wants to validate or refine a proposal before implementation
- a proposal has been updated and needs re-validation

Do not use for:

- code implementation (that's the implementation specialist)
- code review after implementation (that's the code reviewer)
- package security assessment (that's the security reviewer)

The proposal reviewer checks:

- **Completeness**: Are all artifacts present and fully specified? Are edge cases, error states, empty states, loading states covered?
- **Consistency**: Do tasks match specs? Does the design match the proposal scope?
- **Feasibility**: Are there technical blockers or missing patterns given the existing codebase?
- **Gaps**: Missing i18n coverage, theme support, routing, accessibility requirements?
- **Scope**: Is the change appropriately sized — not too broad, not missing obvious related work?

After review, the proposal reviewer:
1. Presents a structured report (strengths, issues by severity, questions, suggestions)
2. Asks the user targeted clarifying questions
3. Updates artifacts based on answers
4. Confirms readiness for `opsx:apply`

#### Unit test writer

Use when:

- implementation is about to begin and tests have not been written yet
- the change includes tasks that produce testable units (components, utilities, hooks, services)
- you want to establish the behavioral contract before code is written

Do not use for:

- changes that only affect config, routing, styling, or i18n files
- dependency-only changes (no testable units)
- writing implementation code (that's the implementation specialist)
- reviewing code (that's the code reviewer)

The unit test writer:

1. Reads the OpenSpec artifacts (specs, design, tasks) for the change
2. Identifies which tasks produce testable units, skips the rest
3. Writes lean test files: happy path + key edge cases (3-5 tests per unit)
4. Reports what was created, what was skipped, and any spec ambiguities found
5. Follows project test conventions: Vitest globals, `@testing-library/react`, `__tests__/` directories, i18n key assertions

After the unit test writer completes:
- Tests will initially fail (implementation doesn't exist yet) — this is expected TDD behavior
- The implementation specialist writes code to make them pass
- Minor test fixes (import paths, type tweaks) can be made by the implementation specialist inline
- Major behavioral mismatches must be flagged and traced back to the spec

#### Implementation specialist

Use when:

- building a new page or component
- changing UI behavior
- fixing frontend bugs
- improving accessibility
- improving client-side state flow
- optimizing rendering or responsiveness

Do not use as the first choice for:

- dependency trust decisions
- package selection from the web
- final cross-cutting review
- writing tests before implementation (that's the unit test writer)

#### Security reviewer

Use when:

- a task needs a new package
- a task suggests upgrading or replacing a package
- a package or URL came from web search
- a remote script, binary, or install command is involved
- you are about to trust third-party code or docs enough to use them in the project

Do not use for:

- purely local code changes
- normal implementation with existing approved dependencies
- general bug fixing that does not involve external trust

#### Code reviewer

Use when:

- implementation is complete and needs review
- a bug fix may have hidden regressions
- a change touches security-sensitive logic
- you want a final quality gate before considering the task done

Do not use as the first step for:

- basic implementation
- dependency trust review
- package selection

### Decision Tree

Start here:

0. Have you reviewed relevant specs and archived changes for context?
   No -> read `openspec/specs/` and `openspec/changes/archive/` for the relevant area first.
   Yes -> continue.
1. Has the proposal just been generated and not yet reviewed?
   Yes -> use proposal reviewer.
   No -> continue.
2. Is implementation about to begin and tests not yet written?
   Yes -> use unit test writer to create tests from specs first.
   No -> continue.
3. Is this mainly a UI, layout, accessibility, or frontend-state task?
   Yes -> use implementation specialist (run `yarn test` after each task to verify tests pass).
   No -> continue.
4. Does this task require trusting something external?
   Examples: new package, package upgrade, remote URL, script from the internet, web-searched library or code snippet.
   Yes -> use security reviewer before proceeding.
   No -> continue.
5. Is the work implemented and ready for validation?
   Yes -> use code reviewer.
   No -> continue with the implementation path.

## Typical Sequences

Adapt these to the change at hand — they're patterns, not mandates.

**Small fix:**
propose (brief) → implementation specialist → done (add code reviewer if subtle)

**Feature (no new deps):**
proposal reviewer → unit test writer → implementation specialist → code reviewer

**Feature with new package:**
proposal reviewer → unit test writer → implementation specialist (plan) → security reviewer → implementation specialist (implement) → code reviewer

**Bug fix:**
propose (brief for small bugs, thorough for larger) → unit test writer (regression tests) → implementation specialist → code reviewer.

**New dependency:**
security reviewer before installing → then proceed with implementation

## Stop Rules

Always pause and use the **security reviewer** if:
- about to run a package install command
- about to fetch or run a remote script
- found a package through web search
- considering copying code from a third-party source

Consider using the **code reviewer** if:
- the change is done but not reviewed
- the fix touches auth, data flow, API boundaries, or production behavior

## Verify Before Archiving

For large changes, use `/opsx:verify` before `/opsx:archive` to check implementation matches artifacts:

- **Completeness** — All tasks done, all requirements implemented, scenarios covered.
- **Correctness** — Implementation matches spec intent, edge cases handled.
- **Coherence** — Design decisions reflected in code, patterns consistent.

Verify won't block archive, but it surfaces issues worth addressing first.

## When Requirements Change: Update vs. Start Fresh

**Update the existing change when:**
- Same intent, refined execution (e.g., "system preference detection is harder than expected")
- Scope narrows to an MVP (ship what's done, rest becomes a new change)
- Learning-driven corrections (codebase isn't what you expected)
- Design tweaks based on implementation discoveries

**Start a new change when:**
- Intent fundamentally changed (e.g., "add dark mode" → "add custom themes")
- Scope exploded into different work entirely
- Original change can be marked "done" standalone
- Patching the artifacts would confuse more than clarify

When updating: revise the specs and remaining tasks to reflect the new requirement, then continue implementation from where it makes sense. Completed work that's still valid stays.

When starting fresh: archive or discard the current change, then create a new one. The old artifacts become context — prior decisions, edge cases discovered, code already read. The new change doesn't restart from zero.

## Guidelines

- Each agent has a specific role — don't use one as a substitute for another (e.g., proposal reviewer reviews specs, not code; security reviewer handles external trust, not local bugs).
- The implementation specialist may fix minor test issues inline but must flag major behavioral mismatches back to the spec.
- For non-testable tasks (config, routing, styling, i18n), skip the unit test writer.
