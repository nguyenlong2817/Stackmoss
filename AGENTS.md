# AGENTS.md — StackMoss

## Project Overview

StackMoss is a CLI pipeline that generates and maintains **agent team configurations** for AI coding assistants. It creates roles, governance, and skill files so every AI agent shares project context.

- **Runtime:** Node.js ≥18 · TypeScript (strict, ES2022)
- **Package manager:** npm
- **Test framework:** Vitest
- **CLI framework:** Commander.js
- **Entry point:** `src/bin/stackmoss.ts`
- **Authority doc:** `stackmoss-agent-config-BRD-v1.0.md` — single source of truth for ALL schemas and behaviors. Every implementation must trace back to a BRD section.

## State Machine (BRD §6)

```
GLOBAL ──[inject]──▶ MIGRATING ──[resolve + promote]──▶ OPERATIONAL
                                                              │
                                                    [upgrade] CONSTITUTION-only merge
                                                    [patch apply] replace-only + budget gate
```

- **GLOBAL**: Template-only, no project knowledge
- **MIGRATING**: Read-only on repo, write only to `.agents/`, no code execution
- **OPERATIONAL**: Research locked, learn from operational experience only

Every command MUST call `validateState()` before executing.

## CLI Commands (BRD §7)

| Command | Phase | State Required |
|:---|:---|:---|
| `stackmoss new <name>` | A | Any |
| `stackmoss inject` | B | GLOBAL |
| `stackmoss resolve` | B | MIGRATING |
| `stackmoss promote --confirm` | B | MIGRATING |
| `stackmoss run <alias>` | C | OPERATIONAL |
| `stackmoss check` | C | OPERATIONAL |
| `stackmoss patch apply/reject` | C | OPERATIONAL |
| `stackmoss upgrade` | C | OPERATIONAL |

## BRD Roles → Agent Mapping

| BRD Role | Codex Agent | Trigger |
|:---|:---|:---|
| [TL] Tech Lead | `tech-lead` | Architecture, feature breakdown, review, CONTEXT.md/FEATURES.md |
| [DEV] Developer | `dev` | Implementation, env commands, debug |
| [QA] Quality Assurance | `qa` | Tests, acceptance criteria, regression, word budget |
| [SEC] Security-lite | `security-auditor` | Auth, PII, financial data features |

## Compile Targets (BRD §15)

| Target | Split Level | Output Path |
|:---|:---|:---|
| Claude Code | Role-level (1 role = 1 file) | `.claude/skills/` |
| Cursor / Roo | Role-level | `.cursor/rules/`, `.roo/skills/` |
| Antigravity | Capability-level (atomic) | `.agents/skills/` |

Compiled outputs are **generated** — do NOT edit them manually. Edit `team.md` instead.

## Working Agreements

- Always run `npm test` after modifying TypeScript files.
- Run `npm run build` before committing to verify compilation.
- Use `npm` (not yarn, not pnpm) for dependency management.
- Ask for confirmation before adding new production dependencies.

## Architecture Rules (BRD §3)

1. **Deterministic logic only:** Pack/role selection, persona detection — never LLM.
2. **Replace-only + word budget:** Config never grows. Team total max: 1800 words.
3. **Atomic writes:** All file generation uses temp→rename pattern.
4. **No silent assumptions:** Unknown → `OPEN_QUESTIONS.md`. Never infer critical decisions.
5. **Safe by default:** Suggest-only mode. Forbid `rm -rf`, `drop table`, `git push --force`.

## Commit Hygiene (A/B/C Layers)

| Layer | Scope | Prefix |
|:---|:---|:---|
| **A** | Feature code (`src/`, `tests/`) | `feat():`, `fix():`, `refactor():` |
| **B** | Reports / logs | `chore(report):`, `test(result):` |
| **C** | Documents (`*.md`, `.agents/`) | `docs():` |

No `git add .` — stage files explicitly by path.

## Language Boundary

| Context | Language |
|:---|:---|
| Human-facing communication | **Vietnamese** |
| Code, CLI output, commit messages | **English** |
| BRD, FEATURES.md, NORTH_STAR.md | **Vietnamese** |
| SKILL.md, workflow instructions | **English** |

## Source Structure

```
src/
├── bin/stackmoss.ts       # CLI entry (shebang)
├── commands/              # new, inject, resolve, promote, run, check, patch, upgrade
├── intake/                # Fast (7Q) + Interview (13Q) modes
├── templates/             # 7 output file generators
├── compile/               # ClaudeCode, Cursor, Antigravity compile targets
├── scanner/               # Repo scanner + migration report
├── patch/                 # Patch proposal engine
├── budgets.ts             # Canonical word budget source (BRD §12.4)
├── config.ts              # Config schema + factory
└── state-machine.ts       # 3-state machine + validation
```

## Skills

Skills in `.agents/skills/`, each with `SKILL.md` + `agents/openai.yaml` + `references/`:

- `cli-pipeline` — CLI commands, state machine, pipeline orchestration
- `intake-engine` — Onboarding questionnaire, pack selection, completeness gates
- `template-engine` — Output file generation, compile layer, schema validation
- `stretch-testing` — Adversarial QA, BRD mismatch detection, edge case probing

## Workflows

In `.agents/workflows/`, invoke with `/slash-command`:

- `/feature-cycle` — Full feature cycle from TODO to DONE
- `/new-command` — Scaffold a new CLI command
- `/new-template` — Create or update an output template
- `/qa-check` — QA verification checklist
