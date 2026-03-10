---
name: template-engine
description: StackMoss output file generation — schemas for team.md, FEATURES.md, NORTH_STAR.md, stackmoss.config.json, and all generated artifacts. Use when creating or modifying output templates.
---

# Template Engine Skill

## When to Use
- Creating or modifying output file templates
- Implementing the compile layer (team.md → target-specific skill files)
- Adding schema validation for generated files
- Working on BYO-LLM prompt templates

## Output File Registry

| File | Schema Ref | When Generated |
|:---|:---|:---|
| `stackmoss.config.json` | BRD §9.1 | `stackmoss new` |
| `team.md` | BRD §9.2 | `stackmoss new` |
| `FEATURES.md` | BRD §9.3 | `stackmoss new` |
| `NORTH_STAR.md` | BRD §9.4 | `stackmoss new` |
| `MIGRATION_REPORT.md` | BRD §9.5 | `stackmoss inject` |
| `README_AGENT_TEAM.md` | BRD §9.6 | `stackmoss new` |
| `OPEN_QUESTIONS.md` | BRD §9.7 | When questions are skipped |
| `NON_GOALS.md` | BRD §9.4 (adjacent) | `stackmoss new` |

## Architecture Rules

### Template Structure
```
src/templates/
├── config.ts          → stackmoss.config.json generator
├── team.ts            → team.md generator (full schema §9.2)
├── features.ts        → FEATURES.md generator
├── north-star.ts      → NORTH_STAR.md generator
├── migration-report.ts → MIGRATION_REPORT.md generator
├── readme.ts          → README_AGENT_TEAM.md generator
├── open-questions.ts  → OPEN_QUESTIONS.md generator
└── non-goals.ts       → NON_GOALS.md generator
```

### Compile Layer (team.md → target skills)
```
team.md role → compile per target:

Claude Code:  1 role = 1 file  → .claude/skills/<role>.skill.md
Cursor/Roo:   1 role = 1 file  → .roo/skills/<role>.skill.md
Antigravity:  1 capability = 1 file → .agents/skills/<role>--<cap>.skill.md
```

### Template Rules
- Templates use **string interpolation**, not LLM generation
- Every template MUST have a corresponding **validation test**
- Output MUST match the exact schema defined in BRD §9
- Skipped intake questions → write to `OPEN_QUESTIONS.md`, never infer

## Authority Sources
- **BRD §9.1–§9.7**: Full output file schemas
- **BRD §10**: Framework Packs (overlay compose)
- **BRD §11**: BYO-LLM prompt templates
- **BRD §15**: Compile targets

## Do NOT
- Hardcode business logic or domain content into templates
- Generate content via LLM when deterministic template suffices
- Add fields not defined in BRD schemas
- Skip validation tests for any template
