# Governance and Evolution

## Ownership

- Skill owner approves scope, risk, and production readiness.
- Skill engineer updates skill artifacts and evidence logs.

## Change Policy

- Prefer replace-only updates for existing sections and templates.
- Log notable validation failures and remediations.
- Do not store secrets in references, assets, logs, or examples.

## Review Cadence

- Recheck trigger quality after every significant update.
- Refresh research cutoff periodically or when user requests "latest".
- Re-run representative validations after changing scripts or templates.

## Failure Escalation

If technical validation fails repeatedly:

1. Record each failure attempt in `data/validation-log.ndjson`.
2. Add concise remediation notes.
3. Ask owner to resolve missing prerequisites before further generation.

## Cutoff Policy

- Maintain `data/research-cutoff.json` with `cutoffDate`, `updatedAt`, and `sources`.
- Baseline for this pack is set to 2026 to satisfy current owner requirement.

