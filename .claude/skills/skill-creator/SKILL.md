---
name: skill-creator
description: Design and generate high-quality agent skills using a 3-layer progressive-disclosure model mapped to a 9-layer system architecture. Use when creating or upgrading skills, especially technical skills that must include executable self-validation, failure logging, owner-question fallback, and up-to-date research references.
---

# Skill Creator

Build standalone skills that are reusable, testable, and maintainable.

## Non-Negotiable Rules

- Keep deterministic behavior for structure and validation workflow.
- Use progressive disclosure:
  - Layer A: metadata (`name`, `description`) for trigger quality.
  - Layer B: concise `SKILL.md` core instructions.
  - Layer C: load `references/`, `examples/`, `scripts/`, `assets/`, `data/` only when needed.
- For technical skills, always include executable validation and failure logging.
- If execution validation cannot be run safely or lacks environment prerequisites, ask the owner focused follow-up questions using `assets/templates/owner-questions.md`.
- Keep the research cutoff current in `data/research-cutoff.json`. For this version, baseline cutoff is 2026.

## 3-Layer to 9-Layer Map

Use `references/layer-map.md` as the canonical mapping.

- Layer 1 metadata lives in this file frontmatter.
- Layer 2 core instructions live in this file body.
- Layer 3 references/resources are externalized to subfolders.

## Build Workflow

1. Define scope and trigger map.
2. Materialize the 9-layer design in files.
3. Generate or update skill artifacts.
4. Validate output contract and run executable checks.
5. Record validation outcomes (including failures) in `data/validation-log.ndjson`.
6. If checks cannot run, ask owner questions and block "done" until answered.
7. Update research cutoff and source references.

Detailed contracts are in:

- `references/output-contract-qc.md`
- `references/governance-evolution.md`
- `references/opensource-research-2026.md`

## Execution Validation Protocol (Technical Skills)

For each generated technical skill:

1. Define at least one runnable verification command.
2. Run it via:

   `node scripts/validate-and-log.mjs --command "<cmd>" --id "<case-id>" --owner "<owner>"`

3. If command fails:
   - Keep failure evidence in the log.
   - Propose remediation steps.
   - Do not mark the skill as production-ready.

## Owner Question Fallback

When blocked (missing credentials, missing environment, unsafe destructive commands, unclear acceptance criteria):

1. Ask 1-3 high-signal questions from `assets/templates/owner-questions.md`.
2. Wait for owner response.
3. Re-run validation and append new evidence to the log.

## Deliverables Checklist

- `SKILL.md` with strict trigger-quality metadata.
- 9-layer supporting files and templates.
- Validation script(s) and at least one recorded run in `data/validation-log.ndjson`.
- Research reference and 2026 cutoff file.

