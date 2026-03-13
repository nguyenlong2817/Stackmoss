# Test Rules — StackMoss

> These rules override root AGENTS.md when working inside `tests/`.

## Framework

- **Vitest** — use `describe`, `it`, `expect`, `beforeEach`, `afterEach`
- No Jest globals, no Mocha-style
- Config: `vitest.config.ts` at project root

## Run Commands

```bash
npm test                              # all tests
npx vitest run tests/<path>           # single file
npx vitest run --reporter=verbose     # verbose output
npx vitest run --grep "<pattern>"     # filter by name
```

## File Naming

- Test file: `tests/<module>/<name>.test.ts` mirrors `src/<module>/<name>.ts`
- Adversarial tests: `tests/adversarial/` for stretch/BRD-mismatch tests
- Integration tests: `tests/<module>/integration.test.ts`

## Fixtures

- Shared helpers: always import `createSampleInput()` from `tests/templates/helpers.ts`
- Temp directories: create in `beforeEach`, clean in `afterEach`
- Use `process.cwd()` + unique subdirectory for isolation

## Test Patterns

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Module Name', () => {
  beforeEach(() => { /* setup temp dirs */ });
  afterEach(() => { /* cleanup */ });

  it('should do X when Y', () => {
    // Arrange → Act → Assert
    const result = functionUnderTest(input);
    expect(result).toBe(expected);
  });
});
```

## Current Coverage

| Module | Test File | Test Count |
|:---|:---|:---|
| State machine | `state-machine.test.ts` | 20 |
| Intake | `intake/*.test.ts` (6 files) | ~40 |
| Templates | `templates/*.test.ts` (8 files) | ~58 |
| Compile | `compile/*.test.ts` (3 files) | ~27 |
| Commands | `commands/*.test.ts` (2 files) | ~20 |
| Adversarial | `adversarial/*.test.ts` | growing |

## Do NOT

- Use `jest.fn()` or Jest-specific APIs
- Write tests without cleanup (temp files/dirs)
- Import from `src/` using absolute paths
- Skip assertion — every `it()` must have `expect()`
- Hardcode paths — use `join(process.cwd(), ...)` or `__dirname`
