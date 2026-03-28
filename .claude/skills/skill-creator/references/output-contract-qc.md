# Output Contract and QC

## Required Outputs

Every generated skill must include:

1. `SKILL.md` with frontmatter (`name`, `description`) and concise operational body.
2. At least one reference file containing non-obvious domain/process knowledge.
3. At least one example file with realistic input/output.
4. At least one executable validation path for technical behavior.
5. Validation evidence in `data/validation-log.ndjson`.
6. Current research cutoff in `data/research-cutoff.json` (baseline year >= 2026 for this pack).

## Pass/Fail Rubric

### Pass

- Trigger description is specific and activation-oriented.
- Core instructions avoid generic filler.
- Validation command was executed and logged.
- Failures are recorded with command, exit code, and stderr tail.
- Blocking unknowns are converted into owner questions.

### Fail

- No executable validation for technical skill outputs.
- Validation is claimed but no run evidence exists.
- Failure occurs but no remediation or owner question is produced.
- Research cutoff is missing or stale.

## Suggested QC Sequence

1. Structural lint: required files present.
2. Command checks: run core validation(s).
3. Failure handling check: confirm failed execution is logged.
4. Trigger check: verify metadata triggers intended use cases.
5. Cutoff check: verify research baseline is current.

