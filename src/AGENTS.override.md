# Source Code Rules - StackMoss

> These rules override root AGENTS.md when working inside `src/`.

## Command Pattern (BRD §7)

Every CLI command in `src/commands/` MUST follow:

```typescript
export function parseArgs(input: string): ParsedArgs
export function checkState(config: Config): void
export function execute(args: ParsedArgs): Result
export function report(result: Result): string
```

Always call `validateState()` from `src/state-machine.ts` before executing any logic.

## Import Conventions

- Use `.js` extension in imports (TypeScript ESM): `import { foo } from './bar.js'`
- Relative paths only within `src/`
- No circular imports between modules

## Budget Enforcement

- `src/budgets.ts` is the canonical source for word budget constants (BRD §12.4)
- All budget-related logic MUST read from this file, never hardcode values
- Team total max: 1800 words

## Atomic Write Pattern

All file generation MUST use atomic writes:
1. Write to a temp file in the same directory
2. `rename()` temp -> final
3. If interrupted, no partial files remain

## Compile Layer (`src/compile/`)

- Claude Code: `claude-code.ts` -> `CLAUDE.md` + role skills in `.claude/skills/`
- Cursor: `cursor.ts` -> role skills in `.cursor/skills/`
- Codex: `codex.ts` -> repo-level `AGENTS.md`
- VS Code / Copilot: `vscode.ts` -> `.github/copilot-instructions.md`
- Antigravity: `antigravity.ts` -> capability-level skills plus shared rules/workflows in `.agent/`
- Dispatcher: `index.ts` -> `compileTarget()` routes by target name

## Key Types

- `IntakeResult` -> `src/intake/types.ts`
- `GeneratedFile` -> `src/templates/types.ts`
- `ScanResult` -> `src/scanner/types.ts`
- `StackMossConfig` -> `src/config.ts`
- `State` -> `src/state-machine.ts`

## Do NOT

- Skip state validation before executing a command
- Use LLM for routing or deterministic selection logic
- Auto-execute destructive operations
- Import from `tests/` in source code
- Add fields not defined in BRD schemas
