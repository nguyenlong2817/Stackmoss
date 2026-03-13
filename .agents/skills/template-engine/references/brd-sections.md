# BRD Reference — Template Engine Skill

> Excerpts from `stackmoss-agent-config-BRD-v1.0.md` relevant to this skill.

## §9 — Output File Schemas

| File | Schema | When Generated |
|:---|:---|:---|
| `stackmoss.config.json` | §9.1 | `stackmoss new` |
| `team.md` | §9.2 (full: CONSTITUTION, ROLES, WORKING CONTRACT, PROJECT_FACTS) | `stackmoss new` |
| `FEATURES.md` | §9.3 (appetite S/M/L, acceptance criteria) | `stackmoss new` |
| `NORTH_STAR.md` | §9.4 (10-15 lines: audience, problem, success signal) | `stackmoss new` |
| `MIGRATION_REPORT.md` | §9.5 (3 tiers: facts/hypotheses/questions) | `stackmoss inject` |
| `README_AGENT_TEAM.md` | §9.6 (3-step quick start for non-tech users) | `stackmoss new` |
| `OPEN_QUESTIONS.md` | §9.7 (unresolved/resolved sections) | When questions skipped |
| `NON_GOALS.md` | §9.4 adjacent | `stackmoss new` |

## §12.4 — Word Budget Table

| Role | Capability | Default | Max |
|:---|:---|:---|:---|
| TL | TL-ARCH | 220 | 280 |
| TL | TL-REVIEW | 180 | 220 |
| TL | TL-CONTEXT | 150 | 180 |
| TL | TL-PLAN | 160 | 200 |
| BA | BA-REQ | 180 | 220 |
| BA | BA-AC | 150 | 180 |
| DEV | DEV-IMPL | 200 | 260 |
| DEV | DEV-ENV | 160 | 200 |
| DEV | DEV-DEBUG | 150 | 180 |
| QA | QA-TEST | 150 | 180 |
| QA | QA-REGRESSION | 120 | 150 |
| DOCS | DOCS-README | 130 | 160 |
| DOCS | DOCS-CHANGELOG | 100 | 130 |
| SEC | SEC-SCAN | 140 | 180 |
| OPS | OPS-DEPLOY | 140 | 180 |

**Team total max: 1800 words**

## §15 — Compile Targets

| Target | Split Level | Output Path |
|:---|:---|:---|
| Claude Code | Role-level (1 role = 1 file) | `.claude/skills/` |
| Cursor / Roo | Role-level | `.cursor/rules/`, `.roo/skills/` |
| Antigravity | Capability-level (atomic) | `.agents/skills/` |

User edits `team.md` only. Compile layer handles split logic.
