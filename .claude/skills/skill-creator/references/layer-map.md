# Layer Map: 3-Layer + 9-Layer

This skill uses progressive disclosure with a 9-layer operating model.

| 9-Layer | Purpose | File/System Mapping |
| --- | --- | --- |
| Layer 0: Intent and Trigger Map | Define what the skill is for and when it should activate | conversation signals, metadata draft |
| Layer 1: Metadata | Trigger-quality frontmatter | `SKILL.md` frontmatter (`name`, `description`) |
| Layer 2: Core Skill Logic | Execution workflow and guardrails | `SKILL.md` body |
| Layer 3: References | Deep guidance loaded on demand | `references/*.md` |
| Layer 4: Examples | Realistic samples for calibration | `examples/*.md` |
| Layer 5: Scripts and Tools | Deterministic helpers and validators | `scripts/*.mjs` |
| Layer 6: Assets and Templates | Reusable forms, checklists, blueprints | `assets/templates/*` |
| Layer 7: Output Contract and QC | Definition of done and pass/fail checks | `references/output-contract-qc.md`, `data/validation-log.ndjson` |
| Layer 8: Governance and Evolution | Versioning, cutoff refresh, iteration loop | `references/governance-evolution.md`, `data/research-cutoff.json` |
| Layer 9: Runtime Boundary Adapter | Runtime-specific path and config boundaries | `.claude/skills/*` for this runtime |

## Operating Principle

Keep Layer 2 concise and move details into Layers 3 through 9 to reduce context overhead.

## Role Quality Overlay

When generating role skills (for example `tech-lead`, `product-manager`):
- Layer 2 must include operating model and decision rules, not only a checklist.
- Layers 3 to 6 must include usable artifacts (playbooks/templates), not placeholders.
- Layer 7 must require validation evidence or explicit blocked status.
- Layer 9 must enforce runtime-safe output paths.
