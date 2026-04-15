# Workflow

## Overview

This workflow combines two concerns:

- **OpenSpec** governs the planning lifecycle: proposing, designing, specifying, and tasking changes before any code is written.
- **Agent pipeline** governs execution: which agent handles what, in what order, during implementation.

OpenSpec answers *what* to build. The agent pipeline answers *how* to build it.

## OpenSpec: Spec-Driven Development

### Lifecycle

All code changes follow five phases:

1. **Context** — review existing specs (`openspec/specs/`) and archived changes (`openspec/changes/archive/`) to understand established patterns, decisions, and logic before planning anything.
2. **Propose** — describe the change; generate proposal, design, specs, and tasks.
3. **Review** — validate artifacts, identify gaps, ask clarifying questions, refine before implementation.
4. **Apply** — implement the tasks (execution follows the agent pipeline below).
5. **Archive** — finalize and archive the completed change.

### Context Gathering (Phase 0)

Before proposing or implementing any change, you MUST review the existing knowledge base:

1. **Check main specs** (`openspec/specs/`) — Read specs relevant to the area being changed. These contain the authoritative definitions of how features work, their data models, component contracts, and integration points. Any new work must be consistent with these specs.

2. **Check archived changes** (`openspec/changes/archive/`) — Scan archived changes for prior decisions, edge cases handled, patterns established, and lessons learned in the same area. Archived changes contain the full history of *why* things were built a certain way.

3. **Check active changes** (`openspec/changes/` excluding `archive/`) — Look for in-progress changes that may overlap or conflict with the new work.

**What to look for:**
- Data models and type definitions that the new change must conform to
- Component contracts and props interfaces that must be respected
- Integration patterns (API calls, state management, routing) already established
- Edge cases, error states, and loading states already handled
- i18n keys and translation patterns already in use
- Theme support patterns already implemented
- Design decisions and trade-offs documented in proposals

**Output:** Summarize relevant findings before proceeding to the propose phase. If specs reveal constraints or patterns the change must follow, include them in the proposal context.

### Commands

- `/opsx:propose "description"` — Create a new change with proposal, design, specs, and tasks
- `/opsx:apply [change-name]` — Implement tasks from a change
- `/opsx:archive [change-name]` — Archive a completed change
- `/opsx:explore [topic]` — Think through ideas without implementing (read-only exploration mode)

## Agent Pipeline: Execution During Apply

### Agent Priority Order

1. **Proposal reviewer after propose** — validates artifacts, identifies gaps, asks clarifying questions, and refines the proposal before any code is written.
2. **Unit test writer first during apply** — writes tests from specs before implementation (TDD). Only for tasks that produce testable units.
3. **Implementation specialist after tests** — implements code to make tests pass. Handles all UI, component, layout, state, and accessibility work. Runs `yarn test` after each task.
4. **Security reviewer before external trust** — gates package installs, dependency changes, external URLs, and web-searched code.
5. **Code reviewer last** — final quality gate before considering work done.

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

## Integrated Workflows

### Implementing a Task

1. **Review existing specs and archive first** — read relevant specs in `openspec/specs/` and archived changes in `openspec/changes/archive/` to understand established patterns, data models, and prior decisions that the new work must respect.
2. After `opsx:propose` completes, launch the proposal reviewer to validate and refine artifacts.
3. Once the proposal reviewer confirms readiness, proceed with `opsx:apply`.
4. Launch the unit test writer to create tests from specs before any implementation begins.
5. Understand the task and inspect local code first.
6. If the task is frontend/UI work, use the implementation specialist to implement the change and make the tests pass.
7. If implementation requires a new dependency, stop before installation and use the security reviewer.
8. Only proceed with dependency installation if the security reviewer returns `allow`, or if the user explicitly accepts an `ask` result.
9. Finish implementation. Ensure `yarn test` passes.
10. Run code reviewer as the final review pass.

### Fixing a Bug

1. **Review existing specs and archive first** — read relevant specs in `openspec/specs/` and archived changes in `openspec/changes/archive/` to understand the original design intent and constraints before diagnosing the bug.
2. After `opsx:propose` generates the fix proposal, launch the proposal reviewer to validate the diagnosis and planned fix.
3. Once confirmed, proceed with `opsx:apply`.
4. Launch the unit test writer to create regression tests from the bug spec (tests that reproduce the bug and verify the fix).
5. Reproduce and understand the bug using local code and existing tools.
6. If the bug is in UI, layout, state, rendering, or accessibility, use the implementation specialist to fix and make the tests pass.
7. If the proposed fix involves upgrading, downgrading, or adding a dependency, use the security reviewer before making that change. (For bugs fixed entirely with existing local code, the security reviewer is not needed.)
8. After the fix is implemented, ensure `yarn test` passes, then use code reviewer to look for regressions, missed edge cases, and production risks.

### Common Sequences

**New feature without new dependencies:**
1. Proposal reviewer
2. Unit test writer
3. Implementation specialist
4. Code reviewer

**New feature with a new package:**
1. Proposal reviewer
2. Unit test writer
3. Implementation specialist for design and implementation planning
4. Security reviewer before installing or trusting the package
5. Implementation specialist to finish implementation
6. Code reviewer for final review

**Bug fix using existing code only:**
1. Proposal reviewer
2. Unit test writer
3. Implementation specialist
4. Code reviewer

**Bug fix that likely needs a dependency upgrade:**
1. Proposal reviewer
2. Unit test writer
3. Investigate locally first
4. Security reviewer before any upgrade or replacement
5. Implement the chosen fix
6. Code reviewer

**Web search for a library:**
1. Proposal reviewer
2. Security reviewer reviews candidate packages and URLs first
3. Choose package only after review
4. Unit test writer
5. Implement with implementation specialist if the change is frontend
6. Finish with code reviewer

## Stop Rules

Pause and use the security reviewer immediately if:

- you are about to run a package install command (`yarn add`, `npm install`, `pnpm add`, `pip install`, `cargo add`, `brew install`, `go get`, `composer require`)
- you are about to fetch or run a remote script
- you found a package through web search and may use it
- you are considering copying code from a third-party source

Pause and use the code reviewer if:

- the change is done but not reviewed
- the fix touches auth, data flow, API boundaries, or production behavior
- the change feels correct but risky

## Checklist

Before proposing:

- Did you review relevant specs in `openspec/specs/`?
- Did you scan archived changes in `openspec/changes/archive/` for the same area?
- Did you check for active changes in `openspec/changes/` that may overlap?
- Did you summarize relevant findings to inform the proposal?

After proposing:

- Did the proposal reviewer validate the artifacts?
- Were all clarifying questions answered?
- Did the proposal reviewer confirm readiness for apply?

Before starting implementation:

- Did the unit test writer create tests from the specs?
- Is this a frontend task?
- Does it require a new external dependency or URL?
- Which agent should go first?

Before installing anything:

- Did the security reviewer review the package or URL?
- Was the verdict `allow` or user-approved after `ask`?

Before finishing:

- Do all tests pass (`yarn test`)?
- Did the code reviewer review the final change?

## Working Agreement

- Do not skip the proposal reviewer after propose — it catches gaps before they become rework.
- Do not skip the unit test writer before implementation — tests define the behavioral contract.
- Do not use the unit test writer for non-testable tasks (config, routing, styling, i18n).
- Do not use the security reviewer for ordinary local coding.
- Do not skip the security reviewer when external trust is involved.
- Do not treat the code reviewer as a replacement for implementation.
- Do not treat the implementation specialist as a package trust reviewer.
- Do not treat the proposal reviewer as a code reviewer — it reviews specs, not code.
- The implementation specialist may fix minor test issues inline but must flag major behavioral mismatches back to the spec.
