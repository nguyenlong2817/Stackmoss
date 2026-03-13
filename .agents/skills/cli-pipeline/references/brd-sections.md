# BRD Reference — CLI Pipeline Skill

> Excerpts from `stackmoss-agent-config-BRD-v1.0.md` relevant to this skill.
> Read the full BRD for complete context.

## §6 — State Machine: 3 states

```
GLOBAL ──[inject]──▶ MIGRATING ──[resolve + promote]──▶ OPERATIONAL
```

- **GLOBAL**: Template-only, no project knowledge
- **MIGRATING**: Read-only on repo. Allowed: read files, detect stack, write `.agents/`. Forbidden: execute code, modify source, external API, push commit.
- **OPERATIONAL**: Research locked. Learn from operational experience only. Update via `patch apply` (replace-only + budget gate).

## §7 — CLI Commands

| Command | Phase | When |
|:---|:---|:---|
| `new <name>` | A | Idea-first bootstrap |
| `inject` | B | Scan repo → MIGRATION_REPORT |
| `resolve` | B | Answer open questions |
| `promote --confirm` | B | Hard criteria gate → OPERATIONAL |
| `run <alias>` | C | Wrapper → Patch Proposal on fail |
| `check` | C | Sanity check → Patch Proposal |
| `patch apply/reject` | C | Apply/reject patch |
| `upgrade` | C | CONSTITUTION-only merge |

## §12 — Patch Proposal Flow

Triggers: command fail (exit≠0) + fix found, path not exist + resolved, error repeat ≥2, TL explicit.
Forbidden: logic error, first-time error, unverified fix.
Apply rules: find section → rewrite → content length after ≤ before → no new sections.

## §13 — Promote Criteria (hard gates)

1. MIGRATION_REPORT: zero unresolved open questions
2. At least 1 [DEV-ENV] command verified
3. No critical hypothesis with confidence < 80%
4. User typed `--confirm` flag

## §14 — Upgrade Isolation

Merge ONLY CONSTITUTION section. Never touch PROJECT_FACTS. Never touch operational learnings.
