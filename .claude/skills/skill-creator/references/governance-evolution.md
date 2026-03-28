# Governance and Evolution

## Ownership

- Owner: approves scope, risk profile, and release decision.
- Skill engineer: authors or updates artifacts and validation evidence.

## Change Policy

- Prefer replace-first edits for stable sections to avoid drift.
- Keep cross-runtime boundaries explicit and enforced.
- Log meaningful failures and remediations.
- Never store secrets in references, assets, examples, or logs.

## Review Cadence

- Recheck trigger quality after each major revision.
- Re-run representative validations after script/template changes.
- Refresh `data/research-cutoff.json` when:
  - owner asks for latest guidance
  - reference set changes
  - cutoff is older than expected project policy

## Failure Escalation

If validation fails repeatedly:

1. Record each failure attempt in `data/validation-log.ndjson`.
2. Add concise remediation notes (what failed, why, next action).
3. Ask owner focused unblock questions before further generation.
4. Keep skill status as `blocked` until new evidence is recorded.

## Cutoff Policy

- Maintain `data/research-cutoff.json` with:
  - `baselineYear`
  - `cutoffDate`
  - `updatedAt`
  - `sources`
- For this repository, baseline cutoff is pinned to `2026-03-28`.

## Evolution Loop

Use an explicit loop for mature skills:
1. capture new requirement
2. patch minimal artifacts
3. validate and log evidence
4. compare with baseline where relevant
5. promote or iterate
