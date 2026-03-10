/**
 * Command: stackmoss promote --confirm
 * Phase B: Hard gate validation → transition to OPERATIONAL
 * Authority: BRD §13.2, cli-pipeline skill
 *
 * Pattern: parseArgs → checkState → execute → report
 *
 * Promote Criteria (ALL must pass):
 * 1. MIGRATION_REPORT.md has zero open questions
 * 2. At least 1 command in [DEV-ENV] verified
 * 3. No critical hypothesis with confidence < 80%
 * 4. User passed --confirm flag
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { readState, transitionState } from '../state-machine.js';
import { MIGRATION_REPORT_FILENAME, parseMigrationReport } from '../scanner/index.js';

// ─── Types ───────────────────────────────────────────────────────

export interface PromoteCriterion {
    name: string;
    passed: boolean;
    detail: string;
}

export interface PromoteResult {
    criteria: PromoteCriterion[];
    allPassed: boolean;
    promoted: boolean;
}

// ─── 4-method command pattern ────────────────────────────────────

export function parseArgs(options: { confirm?: boolean }): {
    projectPath: string;
    configPath: string;
    reportPath: string;
    hasConfirmFlag: boolean;
} {
    const projectPath = resolve('.');
    const configPath = join(projectPath, CONFIG_FILENAME);
    const reportPath = join(projectPath, MIGRATION_REPORT_FILENAME);

    if (!existsSync(configPath)) {
        throw new Error(
            `No ${CONFIG_FILENAME} found in current directory.\n` +
            `   Run 'stackmoss new <project_name>' first.`,
        );
    }

    return {
        projectPath,
        configPath,
        reportPath,
        hasConfirmFlag: options.confirm === true,
    };
}

export function checkState(configPath: string): void {
    const currentState = readState(configPath);

    if (currentState !== 'MIGRATING') {
        throw new Error(
            `Command 'promote' is only available in MIGRATING state.\n` +
            `   Current state: ${currentState}.`,
        );
    }
}

export function execute(
    configPath: string,
    reportPath: string,
    hasConfirmFlag: boolean,
): PromoteResult {
    const criteria: PromoteCriterion[] = [];

    // ── Criterion 1: No unresolved questions ─────────────────
    if (existsSync(reportPath)) {
        const content = readFileSync(reportPath, 'utf-8');
        const parsed = parseMigrationReport(content);

        criteria.push({
            name: 'No unresolved open questions',
            passed: !parsed.hasUnresolvedQuestions,
            detail: parsed.hasUnresolvedQuestions
                ? `${parsed.unresolvedCount} unresolved question(s) — run \`stackmoss resolve\``
                : `All questions resolved (${parsed.resolvedCount} total)`,
        });

        // ── Criterion 3: No critical low-confidence hypotheses ──
        criteria.push({
            name: 'No critical hypothesis < 80% confidence',
            passed: !parsed.hasCriticalLowConfidence,
            detail: parsed.hasCriticalLowConfidence
                ? 'Critical hypothesis with low confidence found — review MIGRATION_REPORT.md'
                : 'All critical hypotheses have sufficient confidence',
        });
    } else {
        criteria.push({
            name: 'No unresolved open questions',
            passed: false,
            detail: `${MIGRATION_REPORT_FILENAME} not found — run \`stackmoss inject\` first`,
        });
        criteria.push({
            name: 'No critical hypothesis < 80% confidence',
            passed: false,
            detail: `${MIGRATION_REPORT_FILENAME} not found`,
        });
    }

    // ── Criterion 2: At least 1 DEV-ENV command verified ─────
    // Free tier: check if package.json scripts have dev/start/build
    const pkgJsonPath = join(resolve('.'), 'package.json');
    let hasVerifiedCommand = false;
    let commandDetail = 'No package.json found to verify commands';

    if (existsSync(pkgJsonPath)) {
        try {
            const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as {
                scripts?: Record<string, string>;
            };
            const devScripts = ['dev', 'start', 'build'];
            const found = devScripts.filter((s) => pkg.scripts?.[s]);

            if (found.length > 0) {
                hasVerifiedCommand = true;
                commandDetail = `Verified scripts exist: ${found.map((s) => `\`${s}\``).join(', ')}`;
            } else {
                commandDetail = 'No dev/start/build scripts found in package.json';
            }
        } catch {
            commandDetail = 'package.json could not be parsed';
        }
    }

    criteria.push({
        name: 'At least 1 DEV-ENV command verified',
        passed: hasVerifiedCommand,
        detail: commandDetail,
    });

    // ── Criterion 4: --confirm flag ──────────────────────────
    criteria.push({
        name: 'User passed --confirm flag',
        passed: hasConfirmFlag,
        detail: hasConfirmFlag
            ? '--confirm flag provided'
            : 'Missing --confirm flag — run `stackmoss promote --confirm`',
    });

    // ── Evaluate ─────────────────────────────────────────────
    const allPassed = criteria.every((c) => c.passed);

    if (allPassed) {
        transitionState(configPath, 'MIGRATING', 'OPERATIONAL');
    }

    return { criteria, allPassed, promoted: allPassed };
}

export function report(result: PromoteResult): void {
    console.log('\n📋 Promote Criteria Check:\n');

    for (const c of result.criteria) {
        const icon = c.passed ? '✅' : '❌';
        console.log(`   ${icon} ${c.name}`);
        console.log(`      ${c.detail}`);
    }

    console.log('');

    if (result.promoted) {
        console.log('🎉 Promoted to OPERATIONAL!');
        console.log('   State: MIGRATING → OPERATIONAL');
        console.log('');
        console.log('   You can now use Phase C commands:');
        console.log('   - stackmoss run <alias>');
        console.log('   - stackmoss check');
        console.log('   - stackmoss patch apply');
    } else {
        console.log('⛔ Promote blocked — resolve the issues above first.');
    }
}

/**
 * Full command handler
 */
export function handler(options: { confirm?: boolean }): void {
    const { configPath, reportPath, hasConfirmFlag } = parseArgs(options);
    checkState(configPath);
    const result = execute(configPath, reportPath, hasConfirmFlag);
    report(result);
}
