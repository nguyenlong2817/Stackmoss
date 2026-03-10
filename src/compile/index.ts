/**
 * Compile Layer — Entry point
 * Authority: BRD §15
 *
 * v0.1: Claude Code (legacy .claude/skills/)
 * v0.3: ClaudeCodeV2 (CLAUDE.md + .claude/rules/) + Cursor (.cursor/rules/)
 */

import type { GeneratedFile } from '../templates/types.js';
import { compileClaudeCode, compileClaudeCodeV2 } from './claude-code.js';
import { compileCursor } from './cursor.js';
import { compileAntigravity } from './antigravity.js';

// ─── Supported Targets ──────────────────────────────────────────

export type CompileTarget = 'ClaudeCode' | 'ClaudeCodeV2' | 'Cursor' | 'Antigravity';

export const DEFAULT_TARGET: CompileTarget = 'ClaudeCodeV2';

export const SUPPORTED_TARGETS: readonly CompileTarget[] = [
    'ClaudeCode',
    'ClaudeCodeV2',
    'Cursor',
    'Antigravity',
] as const;

// ─── Compile ─────────────────────────────────────────────────────

/**
 * Compile team roles to target-specific config files.
 *
 * @param target - compile target
 * @param roles - role strings from IntakeResult
 * @param autoAddedRoles - auto-added roles
 * @param projectName - project name
 */
export function compileTarget(
    target: CompileTarget,
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    switch (target) {
        case 'ClaudeCode':
            return compileClaudeCode(roles, autoAddedRoles, projectName);
        case 'ClaudeCodeV2':
            return compileClaudeCodeV2(roles, autoAddedRoles, projectName);
        case 'Cursor':
            return compileCursor(roles, autoAddedRoles, projectName);
        case 'Antigravity':
            return compileAntigravity(roles, autoAddedRoles, projectName);
        default:
            throw new Error(`Unsupported compile target: ${target}`);
    }
}
