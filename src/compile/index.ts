/**
 * Compile Layer — Entry point
 * Authority: BRD §15
 *
 * v0.1: Claude Code legacy .claude/skills/*.skill.md
 * v0.6: Runtime-native bootstrap:
 * - ClaudeCodeV2: CLAUDE.md + .claude/skills/<skill>/SKILL.md
 * - Cursor: .cursor/skills/<skill>/SKILL.md
 * - Antigravity: .agent/{skills,rules,workflows}
 */

import type { GeneratedFile } from '../templates/types.js';
import { compileClaudeCode, compileClaudeCodeV2 } from './claude-code.js';
import { compileCursor } from './cursor.js';
import { compileAntigravity } from './antigravity.js';
import { compileCodex } from './codex.js';
import { compileVSCode } from './vscode.js';

// ─── Supported Targets ──────────────────────────────────────────

export type CompileTarget = 'ClaudeCode' | 'ClaudeCodeV2' | 'Cursor' | 'Roo' | 'Antigravity' | 'Codex' | 'VSCode';

export const DEFAULT_TARGET: CompileTarget = 'ClaudeCodeV2';

export const BOOTSTRAP_TARGETS: readonly CompileTarget[] = [
    'ClaudeCodeV2',
    'Cursor',
    'Antigravity',
    'Codex',
    'VSCode',
] as const;

export const SUPPORTED_TARGETS: readonly CompileTarget[] = [
    'ClaudeCode',
    'ClaudeCodeV2',
    'Cursor',
    'Roo',
    'Antigravity',
    'Codex',
    'VSCode',
] as const;

function compileRoo(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    return compileClaudeCode(roles, autoAddedRoles, projectName).map((file) => ({
        path: file.path
            .replace('.claude/skills/', '.roo/skills/')
            .replace(/\.skill\.md$/, '.md'),
        content: file.content,
    }));
}

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
        case 'Roo':
            return compileRoo(roles, autoAddedRoles, projectName);
        case 'Antigravity':
            return compileAntigravity(roles, autoAddedRoles, projectName);
        case 'Codex':
            return compileCodex(roles, autoAddedRoles, projectName);
        case 'VSCode':
            return compileVSCode(roles, autoAddedRoles, projectName);
        default:
            throw new Error(`Unsupported compile target: ${target}`);
    }
}

export function compileBootstrapTargets(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    const seen = new Set<string>();
    const files: GeneratedFile[] = [];

    for (const target of BOOTSTRAP_TARGETS) {
        for (const file of compileTarget(target, roles, autoAddedRoles, projectName)) {
            if (seen.has(file.path)) {
                continue;
            }
            seen.add(file.path);
            files.push(file);
        }
    }

    return files;
}
