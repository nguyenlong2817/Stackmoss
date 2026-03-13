/**
 * Command: stackmoss promote --confirm
 * Phase B: Hard gate validation -> transition to OPERATIONAL
 * Authority: BRD §13.2
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { readState, transitionState } from '../state-machine.js';
import { MIGRATION_REPORT_FILENAME, parseMigrationReport } from '../scanner/index.js';

const OPEN_QUESTIONS_FILENAME = 'OPEN_QUESTIONS.md';

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

function countOpenQuestionsFileUnresolved(projectPath: string): number {
    const openQuestionsPath = join(projectPath, OPEN_QUESTIONS_FILENAME);
    if (!existsSync(openQuestionsPath)) {
        return 0;
    }

    const content = readFileSync(openQuestionsPath, 'utf-8');
    const lines = content.split('\n');
    const startIndex = lines.findIndex((line) => line.startsWith('## Chưa được trả lời'));

    if (startIndex === -1) {
        return (content.match(/^- \[ \]/gm) ?? []).length;
    }

    const sectionLines: string[] = [];
    for (let index = startIndex; index < lines.length; index++) {
        if (index > startIndex && lines[index].startsWith('## ')) {
            break;
        }
        sectionLines.push(lines[index]);
    }

    return (sectionLines.join('\n').match(/^- \[ \]/gm) ?? []).length;
}

function getVerifiedDevEnvCommand(reportPath: string): { passed: boolean; detail: string } {
    if (!existsSync(reportPath)) {
        return {
            passed: false,
            detail: `${MIGRATION_REPORT_FILENAME} not found`,
        };
    }

    const content = readFileSync(reportPath, 'utf-8');
    const lines = content.split('\n');
    const startIndex = lines.findIndex((line) => line.startsWith('## FACTS'));
    const sectionLines: string[] = [];

    if (startIndex !== -1) {
        for (let index = startIndex; index < lines.length; index++) {
            if (index > startIndex && lines[index].startsWith('## ')) {
                break;
            }
            sectionLines.push(lines[index]);
        }
    }

    const verifiedCommands = sectionLines
        .map((line) => line.trim())
        .filter((line) => /(Run command|Build command|Test command)/i.test(line));

    if (verifiedCommands.length === 0) {
        return {
            passed: false,
            detail: 'No verified [DEV-ENV] command found in MIGRATION_REPORT.md facts',
        };
    }

    return {
        passed: true,
        detail: `Verified [DEV-ENV] commands: ${verifiedCommands.join('; ')}`,
    };
}

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
    const projectPath = resolve('.');

    if (existsSync(reportPath)) {
        const content = readFileSync(reportPath, 'utf-8');
        const parsed = parseMigrationReport(content);
        const unresolvedOpenQuestions = countOpenQuestionsFileUnresolved(projectPath);
        const unresolvedTotal = parsed.unresolvedCount + unresolvedOpenQuestions;

        criteria.push({
            name: 'No unresolved open questions',
            passed: unresolvedTotal === 0,
            detail: unresolvedTotal > 0
                ? `${unresolvedTotal} unresolved question(s) — clear MIGRATION_REPORT.md and OPEN_QUESTIONS.md before promote`
                : `All questions resolved (${parsed.resolvedCount} total)`,
        });

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

    const verifiedCommand = getVerifiedDevEnvCommand(reportPath);
    criteria.push({
        name: 'At least 1 DEV-ENV command verified',
        passed: verifiedCommand.passed,
        detail: verifiedCommand.detail,
    });

    criteria.push({
        name: 'User passed --confirm flag',
        passed: hasConfirmFlag,
        detail: hasConfirmFlag
            ? '--confirm flag provided'
            : 'Missing --confirm flag — run `stackmoss promote --confirm`',
    });

    const allPassed = criteria.every((criterion) => criterion.passed);

    if (allPassed) {
        transitionState(configPath, 'MIGRATING', 'OPERATIONAL');
    }

    return {
        criteria,
        allPassed,
        promoted: allPassed,
    };
}

export function report(result: PromoteResult): void {
    console.log('\n📋 Promote Criteria Check:\n');

    for (const criterion of result.criteria) {
        const icon = criterion.passed ? '✅' : '❌';
        console.log(`   ${icon} ${criterion.name}`);
        console.log(`      ${criterion.detail}`);
    }

    console.log('');

    if (result.promoted) {
        console.log('🎉 Promoted to OPERATIONAL!');
        console.log('   State: MIGRATING -> OPERATIONAL');
        console.log('');
        console.log('   You can now use Phase C commands:');
        console.log('   - stackmoss run <alias>');
        console.log('   - stackmoss check');
        console.log('   - stackmoss patch apply');
    } else {
        console.log('⛔ Promote blocked — resolve the issues above first.');
    }
}

export function handler(options: { confirm?: boolean }): void {
    const { configPath, reportPath, hasConfirmFlag } = parseArgs(options);
    checkState(configPath);
    const result = execute(configPath, reportPath, hasConfirmFlag);
    report(result);
}
