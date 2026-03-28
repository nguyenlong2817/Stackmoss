---
name: skill-creator
description: Build or upgrade role skills with a 3-layer plus 9-layer structure, evaluation loop, and runtime-safe generation. Use for new role packs, weak skill refactors, and technical skills that must self-validate and log failures.
---

# Skill Creator (Runtime-Safe, Role-First)

Create production-grade skills that are reusable, testable, and maintainable.
This skill is role-focused (for example `tech-lead`, `product-manager`, and domain specialists), not StackMoss-specific business logic.

## Runtime Boundary

- This runtime may generate skills only under `.claude/skills/*`.
- Never generate files into `.agents/*` or `.agent/*`.
- Keep workflow and contracts runtime-agnostic; only path/config adapters are runtime-specific.

## Non-Negotiable Rules

- Keep deterministic structure and validation workflow.
- Use progressive disclosure:
  - Layer A: metadata (`name`, `description`) for trigger quality.
  - Layer B: concise `SKILL.md` with execution guidance.
  - Layer C: load references/examples/scripts/assets/data only when needed.
- For technical skills, include executable validation and failure logging.
- If validation cannot run safely, ask focused owner questions and mark status `blocked`.
- Keep research cutoff current in `data/research-cutoff.json` with baseline date `2026-03-28`.

## 3-Layer + 9-Layer Standard

Use `references/layer-map.md` as canonical mapping.
Use `references/role-structure-guide.md` when generating role skills.

## Operating Workflow

### 1) Capture Intent

- Extract from conversation first, then ask only missing questions.
- Confirm:
  - skill objective and trigger context
  - target runtime and output root
  - role depth expectation (quick draft vs production-grade)
  - validation rigor (smoke only vs eval loop)

Use: `assets/templates/owner-questions.md`

### 2) Research and Gap Scan

- Review:
  - `references/opensource-research-2026.md`
  - local source: `E:/skill-engineer/` as benchmark pattern
  - existing skill packs in current repo for consistency
- Reuse proven patterns, avoid copy-paste lock-in to any one platform.

### 3) Design the Skill Bundle

- Generate all required layers for the requested quality bar.
- Ensure role quality for `tech-lead` and `product-manager` is not hollow:
  - mission and operating model
  - playbooks and decision rules
  - artifacts/templates for real execution
  - delivery gates and risk handling
  - measurable validation paths

Use:
- `assets/templates/SKILL.template.md`
- `assets/templates/role-skill-blueprint.md`
- `references/output-contract-qc.md`

### 4) Evaluate

- Define 2 to 5 realistic eval prompts.
- For objective outputs, define assertions and evidence format.
- For subjective outputs, define rubric-based qualitative review.
- Compare against baseline where useful (previous version or no-skill run).

### 5) Execute Validation and Log Evidence

- Run executable checks through:
  - `node scripts/validate-and-log.mjs --command "<cmd>" --id "<case-id>" --owner "<owner>"`
- Append pass/fail evidence to `data/validation-log.ndjson`.
- Failed validation is first-class evidence, not something to hide.
- Never mark skill as ready without either:
  - passing evidence, or
  - explicit blocked state + owner follow-up questions.

### 6) Review and Iterate

- Summarize:
  - what improved
  - what remains risky
  - next concrete revision
- Tighten trigger description to reduce under-trigger and false-trigger.
- Remove instructions that do not produce measurable value.

## Definition of Done

A generated skill is done only when:
- structure follows 3-layer + 9-layer
- output contract is satisfied (`references/output-contract-qc.md`)
- validation evidence exists in logs (or blocked status documented)
- runtime boundary is clean
- research cutoff metadata is current

## Safety

- Do not produce malware, exploit workflows, or unauthorized access playbooks.
- Do not log secrets, credentials, or sensitive payloads.
- Prefer minimal-owner-question sets (1 to 3) to unblock safely and quickly.
