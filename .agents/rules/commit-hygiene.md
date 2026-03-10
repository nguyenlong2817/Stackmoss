# Commit Hygiene — StackMoss

> Always-on rule. Strict A/B/C layering for clean git history.

## Commit Layers

| Layer | Type | Scope | No-Go |
|:---|:---|:---|:---|
| **Commit A** | Feature Code | `src/`, `bin/`, `tests/` | Never include docs/reports |
| **Commit B** | Reports / Logs | Test results, benchmark logs, terminal output | Never include app code |
| **Commit C** | Documents | `*.md`, `docs/`, `.agents/` | No tracked code changes |

## Rules

- **No `git add .`**: Stage files explicitly by path.
- **Scope isolation**: Each commit belongs to exactly one layer.
- **Commit messages**: Use conventional format.
  - A: `feat(cli):`, `fix(intake):`, `refactor(template):`
  - B: `chore(report):`, `test(result):`
  - C: `docs(brd):`, `docs(readme):`
- **Checkpoint governance**: STOP for owner feedback at each defined checkpoint before proceeding.
