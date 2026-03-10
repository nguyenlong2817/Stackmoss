# StackMoss

**Agent Team Config generator** — scaffold AI agent teams for Claude Code, Cursor, and Antigravity.

StackMoss tạo cấu trúc team config cho AI agents, từ intake → migration → operational, với 4 compile targets.

## Install

```bash
npm install -g stackmoss
```

## Quick Start

```bash
# Create a new agent team config
stackmoss new my-project

# Answer 7 questions (Fast mode) or 13 (Interview mode)
# → Generates: team.md, FEATURES.md, NORTH_STAR.md, NON_GOALS.md, stackmoss.config.json
# → Compiles to your target: Claude Code, Cursor, or Antigravity
```

## Commands

| Command | Phase | Description |
|:---|:---|:---|
| `stackmoss new <name>` | GLOBAL | Create project + intake + generate files + compile |
| `stackmoss inject` | GLOBAL → MIGRATING | Scan repo → MIGRATION_REPORT.md |
| `stackmoss resolve` | MIGRATING | Interactive Q&A for open questions |
| `stackmoss promote --confirm` | MIGRATING → OPERATIONAL | 4 hard criteria gate |
| `stackmoss run <alias>` | OPERATIONAL | Execute command, auto-patch on failure |
| `stackmoss check` | OPERATIONAL | Config sanity + word budget validation |
| `stackmoss patch apply/reject` | OPERATIONAL | Manage patch proposals |
| `stackmoss upgrade [--apply]` | OPERATIONAL | CONSTITUTION-only merge |

## State Machine

```
GLOBAL → MIGRATING → OPERATIONAL
  new      inject       run
           resolve      check
           promote      patch
                        upgrade
```

## Compile Targets

| Target | Output | Split Level |
|:---|:---|:---|
| ClaudeCode (legacy) | `.claude/skills/*.skill.md` | Role |
| **ClaudeCodeV2** (default) | `CLAUDE.md` + `.claude/rules/*.md` | Role |
| **Cursor** | `.cursor/rules/*.mdc` | Role |
| **Antigravity** | `.agents/skills/<cap>/SKILL.md` | Capability (atomic) |

## Architecture

- **Deterministic** — no LLM required for any command
- **Atomic writes** — all-or-nothing file generation
- **State-aware** — commands validate state before execution
- **Word budgets** — enforced per capability section (BRD §12.4)
- **Patch proposals** — auto-generated on command failure

## Development

```bash
npm install
npm run build
npm test        # 247 tests
```

## License

MIT
