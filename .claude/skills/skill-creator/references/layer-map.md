# Layer Map: 3-Layer + 9-Layer

This skill implements progressive disclosure with a 9-layer operating model.

| 9-Layer | Purpose | File/System Mapping |
| --- | --- | --- |
| Layer 0: Use Case & Trigger Map | Define what the skill is for and when it must activate | `references/layer-map.md`, metadata description in `SKILL.md` |
| Layer 1: Metadata | Trigger-quality frontmatter | `SKILL.md` frontmatter |
| Layer 2: Core SKILL.md | Core operating instructions | `SKILL.md` body |
| Layer 3: References | Deep docs loaded on demand | `references/*.md` |
| Layer 4: Examples | Concrete input/output examples | `examples/*.md` |
| Layer 5: Scripts & Tools | Executable deterministic tooling | `scripts/*.mjs` |
| Layer 6: Assets & Templates | Reusable templates and forms | `assets/templates/*` |
| Layer 7: Output Contract & QC | Definition of done and pass/fail checks | `references/output-contract-qc.md`, validation logs |
| Layer 8: Governance & Evolution | Versioning, review loop, research cutoff, continuous improvement | `references/governance-evolution.md`, `data/research-cutoff.json`, `data/validation-log.ndjson` |

## Operating Principle

Keep Layer 2 concise and move details into Layers 3-8 to reduce context overhead.

