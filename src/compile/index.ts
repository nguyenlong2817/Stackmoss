/**
 * Compile Layer - Entry point
 * Authority: BRD section 15
 *
 * Runtime contract:
 * - ClaudeCode: CLAUDE.md + .claude/skills/<skill>/...
 * - Codex: AGENTS.md + .agents/skills/<skill>/...
 * - Antigravity: .agent/{skills,rules,workflows}
 */

import type { GeneratedFile } from '../templates/types.js';
import { compileClaudeCode } from './claude-code.js';
import { compileAntigravity } from './antigravity.js';
import { compileCodex } from './codex.js';

export type CompileTarget = 'ClaudeCode' | 'Antigravity' | 'Codex';

export const DEFAULT_TARGET: CompileTarget = 'ClaudeCode';

export const BOOTSTRAP_TARGETS: readonly CompileTarget[] = [
    'ClaudeCode',
    'Antigravity',
    'Codex',
] as const;

export const SUPPORTED_TARGETS: readonly CompileTarget[] = [
    'ClaudeCode',
    'Antigravity',
    'Codex',
] as const;

export function compileTarget(
    target: CompileTarget,
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    switch (target) {
        case 'ClaudeCode':
            return compileClaudeCode(roles, autoAddedRoles, projectName);
        case 'Antigravity':
            return compileAntigravity(roles, autoAddedRoles, projectName);
        case 'Codex':
            return compileCodex(roles, autoAddedRoles, projectName);
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