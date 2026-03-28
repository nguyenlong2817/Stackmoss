# Output Contract and QC

## Required Output Bundle

Every generated skill must include:

1. `SKILL.md` with `name` and `description` frontmatter and execution workflow.
2. `references/` content for non-obvious methods, heuristics, or policies.
3. `assets/templates/` for reusable execution artifacts.
4. `examples/` for realistic scenario calibration (if relevant).
5. `scripts/` for deterministic validation when the task is technical or executable.
6. `data/research-cutoff.json` with current date and traceable sources.
7. validation evidence in `data/validation-log.ndjson` (pass or fail).

## Role Skill Minimum (PM or TL)

If the target is a role skill, it must also include:

1. mission and operating model
2. decision playbooks and anti-patterns
3. concrete deliverables and templates
4. risk/quality gate guidance
5. explicit runtime boundary

## Validation Rules

### Mandatory

- For technical skills, run at least one executable check.
- Log every run with command, status code, and output tails.
- If validation is blocked, emit owner questions and mark blocked status.

### Optional but Recommended

- baseline comparison against prior version
- assertion-based grading for objective outputs
- benchmark summary when iterating on quality

## Pass Criteria

- Trigger description is specific and activation-oriented.
- Instructions are actionable and avoid generic filler.
- Role depth is visible in artifacts, not only in narrative.
- Validation evidence exists and is consistent with claims.
- Research cutoff metadata is current (`2026-03-28` baseline or newer).
- Runtime boundary is respected.

## Fail Criteria

- Skill claims validation but no evidence exists.
- Technical skill has no executable validation path.
- Failure occurred but no remediation or owner question is provided.
- Artifacts are placeholders that cannot be executed in practice.
- Output path crosses runtime boundaries.
