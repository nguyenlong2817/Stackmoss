/**
 * Command: stackmoss check
 * Phase C: Verify config sanity, paths, commands, budgets
 * Authority: BRD §12.1, cli-pipeline skill
 *
 * Pattern: parseArgs → checkState → execute → report
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { readState } from '../state-machine.js';
import { wordCount, createProposal } from '../patch/index.js';
import type { CheckIssue, CheckResult } from '../patch/types.js';

// ─── Word Budget Limits (BRD §12.4) ─────────────────────────────

const CAPABILITY_BUDGETS: Record<string, number> = {
    'TL-ARCH': 280,
    'TL-REVIEW': 220,
    'TL-CONTEXT': 180,
    'TL-PLAN': 200,
    'BA-REQ': 220,
    'BA-AC': 180,
    'DEV-IMPL': 260,
    'DEV-ENV': 200,
    'DEV-DEBUG': 180,
    'QA-TEST': 180,
    'QA-REGRESSION': 150,
    'DOCS-README': 160,
    'DOCS-CHANGELOG': 130,
    'SEC-SCAN': 180,
    'OPS-DEPLOY': 180,
};

const TEAM_TOTAL_MAX = 1800;

// ─── 4-method command pattern ────────────────────────────────────

export function parseArgs(): { projectPath: string; configPath: string } {
    const projectPath = resolve('.');
    const configPath = join(projectPath, CONFIG_FILENAME);

    if (!existsSync(configPath)) {
        throw new Error(`No ${CONFIG_FILENAME} found in current directory.`);
    }

    return { projectPath, configPath };
}

export function checkState(configPath: string): void {
    const currentState = readState(configPath);

    if (currentState !== 'OPERATIONAL') {
        throw new Error(
            `Command 'check' is only available in OPERATIONAL state.\n` +
            `   Current state: ${currentState}.`,
        );
    }
}

export function execute(projectPath: string): CheckResult {
    const issues: CheckIssue[] = [];
    let patchesCreated = 0;

    // ── 1. Config file sanity ────────────────────────────────
    const configPath = join(projectPath, CONFIG_FILENAME);
    try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;

        const requiredFields = ['schemaVersion', 'state', 'projectName'];
        for (const field of requiredFields) {
            if (!(field in config)) {
                issues.push({
                    category: 'structure_invalid',
                    detail: `Missing required field '${field}' in ${CONFIG_FILENAME}`,
                    fixable: false,
                });
            }
        }
    } catch {
        issues.push({
            category: 'structure_invalid',
            detail: `${CONFIG_FILENAME} is not valid JSON`,
            fixable: false,
        });
    }

    // ── 2. team.md structure ─────────────────────────────────
    const teamPath = join(projectPath, 'team.md');
    if (existsSync(teamPath)) {
        const teamContent = readFileSync(teamPath, 'utf-8');
        const requiredSections = ['CONSTITUTION', 'ROLES', 'WORKING CONTRACT', 'PROJECT_FACTS'];

        for (const section of requiredSections) {
            if (!teamContent.includes(section)) {
                issues.push({
                    category: 'structure_invalid',
                    detail: `team.md missing required section: ${section}`,
                    fixable: false,
                });
            }
        }

        // ── 3. Word budget checks ────────────────────────────
        let totalWords = 0;

        for (const [capId, maxBudget] of Object.entries(CAPABILITY_BUDGETS)) {
            const capPattern = new RegExp(`\\[${capId}\\]([\\s\\S]*?)(?=\\n\\[|$)`);
            const capMatch = teamContent.match(capPattern);

            if (capMatch) {
                const capWords = wordCount(capMatch[1]);
                totalWords += capWords;

                if (capWords > maxBudget) {
                    issues.push({
                        category: 'budget_exceeded',
                        detail: `[${capId}] has ${capWords} words (max: ${maxBudget})`,
                        fixable: true,
                    });
                    patchesCreated++;

                    createProposal(
                        projectPath,
                        'check_fail',
                        `budget check [${capId}]`,
                        `Word count ${capWords} exceeds max ${maxBudget}`,
                        {
                            targetFile: 'team.md',
                            section: `[${capId}]`,
                            oldContent: capMatch[1].trim(),
                            newContent: capMatch[1].trim(), // User must manually trim
                        },
                    );
                }
            }
        }

        if (totalWords > TEAM_TOTAL_MAX) {
            issues.push({
                category: 'budget_exceeded',
                detail: `Team total: ${totalWords} words (max: ${TEAM_TOTAL_MAX})`,
                fixable: false,
            });
        }
    } else {
        issues.push({
            category: 'path_missing',
            detail: 'team.md not found in project',
            fixable: false,
        });
    }

    // ── 4. Key file existence ────────────────────────────────
    const expectedFiles = [
        'FEATURES.md',
        'NORTH_STAR.md',
    ];

    for (const file of expectedFiles) {
        if (!existsSync(join(projectPath, file))) {
            issues.push({
                category: 'path_missing',
                detail: `Expected file not found: ${file}`,
                fixable: false,
            });
        }
    }

    return {
        issues,
        patchesCreated,
        allClear: issues.length === 0,
    };
}

export function report(result: CheckResult): void {
    if (result.allClear) {
        console.log('\n✅ All checks passed — config is healthy.');
        return;
    }

    console.log(`\n⚠️  Found ${result.issues.length} issue(s):\n`);

    for (const issue of result.issues) {
        const icon = issue.fixable ? '🔧' : '❌';
        console.log(`   ${icon} [${issue.category}] ${issue.detail}`);
    }

    if (result.patchesCreated > 0) {
        console.log(`\n📋 ${result.patchesCreated} Patch Proposal(s) created.`);
        console.log('   Run `stackmoss patch apply` to fix automated issues.');
    }
}

/**
 * Full command handler
 */
export function handler(): void {
    const { projectPath, configPath } = parseArgs();
    checkState(configPath);
    const result = execute(projectPath);
    report(result);
}
