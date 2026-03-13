---
name: stretch-testing
description: Adversarial QA and BRD compliance testing — write failing tests that prove bugs, edge case probing, and spec-vs-implementation mismatch detection. Use when running stretch tests, QA audits, or BRD compliance checks.
---

# Stretch Testing Skill

## When to Use
- Running adversarial QA against the codebase
- Detecting BRD spec vs implementation mismatches
- Writing edge case tests for untested code paths
- Verifying state machine can't be bypassed
- Checking template outputs match BRD §9 schemas exactly

## Methodology

### 1. Read Authority First
Before writing any test, read the relevant BRD section to understand expected behavior:
- State machine: BRD §6
- CLI commands: BRD §7
- Intake modes: BRD §8
- Output schemas: BRD §9
- Pack matrix: BRD §10
- Patch rules: BRD §12
- Promote criteria: BRD §13

### 2. Adversarial Test Categories

| Category | What to Test | Example |
|:---|:---|:---|
| **BRD Mismatch** | Implementation differs from BRD spec | Budget values hardcoded vs BRD §12.4 |
| **State Bypass** | Command runs in wrong state | `run` working in MIGRATING |
| **Input Injection** | Dangerous names, paths, content | Project name `CON`, `../../../etc/passwd` |
| **Budget Overflow** | Word budget can be exceeded | Patch that inflates beyond 1800 words |
| **Schema Violation** | Generated output missing required fields | Config without `schemaVersion` |
| **Gate Bypass** | Promote/completeness gate insufficient | Promote with unresolved questions |
| **Compile Drift** | Compile output inconsistent across targets | Cursor missing role that Claude has |

### 3. Test Output Format

```typescript
it('B-XXX: <description of what should happen per BRD>', () => {
  // Arrange: set up the scenario
  // Act: trigger the behavior
  // Assert: verify BRD-expected result
});
```

### 4. Reporting Format

For each bug found:
- **Bug ID**: B-001, B-002, etc.
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW
- **Component**: which `src/` module
- **Actual**: what happens
- **Expected**: what BRD says should happen (cite section)
- **Proof**: test file path + test name

## Test Files

- Adversarial tests go in `tests/adversarial/`
- Name pattern: `stretch-<category>.test.ts`
- Import helpers from `tests/templates/helpers.ts`

## Do NOT
- Fix bugs — only find and document them
- Write tests without BRD reference for expected behavior
- Skip cleanup in afterEach (temp dirs, external files)
- Assume anything works until proven with a test
