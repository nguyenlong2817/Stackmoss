/**
 * Command: stackmoss resolve
 * Phase B: Interactively answer open questions from MIGRATION_REPORT
 * Authority: BRD §7, §13, cli-pipeline skill, Appendix B
 *
 * Pattern: parseArgs → checkState → execute → report
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { select, input } from '@inquirer/prompts';
import { CONFIG_FILENAME } from '../config.js';
import { readState } from '../state-machine.js';
import { MIGRATION_REPORT_FILENAME } from '../scanner/index.js';

// ─── Types ───────────────────────────────────────────────────────

interface ResolveResult {
    totalQuestions: number;
    resolvedThisSession: number;
    remainingUnresolved: number;
}

// ─── Regex patterns for MIGRATION_REPORT ─────────────────────────

const UNRESOLVED_PATTERN = /^- \[ \] \*\*\[([^\]]+)\]\*\* (.+)$/;
const RESOLVED_SECTION_HEADER = '### Đã trả lời';

// ─── 4-method command pattern ────────────────────────────────────

export function parseArgs(): { projectPath: string; configPath: string; reportPath: string } {
    const projectPath = resolve('.');
    const configPath = join(projectPath, CONFIG_FILENAME);
    const reportPath = join(projectPath, MIGRATION_REPORT_FILENAME);

    if (!existsSync(configPath)) {
        throw new Error(
            `No ${CONFIG_FILENAME} found in current directory.\n` +
            `   Run 'stackmoss new <project_name>' first.`,
        );
    }

    if (!existsSync(reportPath)) {
        throw new Error(
            `No ${MIGRATION_REPORT_FILENAME} found.\n` +
            `   Run 'stackmoss inject' first to scan the repo.`,
        );
    }

    return { projectPath, configPath, reportPath };
}

export function checkState(configPath: string): void {
    const currentState = readState(configPath);

    if (currentState !== 'MIGRATING') {
        throw new Error(
            `Command 'resolve' is only available in MIGRATING state.\n` +
            `   Current state: ${currentState}.`,
        );
    }
}

export async function execute(reportPath: string): Promise<ResolveResult> {
    let content = readFileSync(reportPath, 'utf-8');
    const lines = content.split('\n');

    // Find all unresolved questions
    const unresolvedIndices: { lineIdx: number; id: string; text: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(UNRESOLVED_PATTERN);
        if (match) {
            unresolvedIndices.push({
                lineIdx: i,
                id: match[1],
                text: match[2].replace(/\s*_\(.+\)_\s*$/, ''),  // Remove impact note
            });
        }
    }

    if (unresolvedIndices.length === 0) {
        return {
            totalQuestions: 0,
            resolvedThisSession: 0,
            remainingUnresolved: 0,
        };
    }

    console.log(`\n📋 ${unresolvedIndices.length} open question(s) to resolve:\n`);

    let resolvedCount = 0;

    for (const item of unresolvedIndices) {
        console.log(`\n❓ [${item.id}] ${item.text}`);

        const action = await select({
            message: 'Action?',
            choices: [
                { name: 'Answer this question', value: 'answer' },
                { name: 'Skip for now', value: 'skip' },
                { name: 'Stop resolving', value: 'stop' },
            ],
        });

        if (action === 'stop') break;
        if (action === 'skip') continue;

        const answer = await input({
            message: 'Your answer:',
        });

        if (answer.trim().length > 0) {
            // Mark as resolved in content
            lines[item.lineIdx] = `- [x] **[${item.id}]** ${item.text} → ${answer.trim()}`;
            resolvedCount++;
        }
    }

    // Ensure "Đã trả lời" section exists
    if (resolvedCount > 0) {
        const resolvedSectionIdx = lines.findIndex((l) => l.trim() === RESOLVED_SECTION_HEADER);
        if (resolvedSectionIdx === -1) {
            // Find the OPEN QUESTIONS section end and insert resolved section
            const openQIdx = lines.findIndex((l) => l.includes('## OPEN QUESTIONS'));
            if (openQIdx !== -1) {
                // Find end: next ## or ---
                let insertIdx = lines.length;
                for (let i = openQIdx + 1; i < lines.length; i++) {
                    if (lines[i].startsWith('---') || (lines[i].startsWith('## ') && i > openQIdx)) {
                        insertIdx = i;
                        break;
                    }
                }
                lines.splice(insertIdx, 0, '', RESOLVED_SECTION_HEADER);
            }
        }

        // Write updated content
        writeFileSync(reportPath, lines.join('\n'), 'utf-8');
    }

    // Recount unresolved
    const updatedContent = readFileSync(reportPath, 'utf-8');
    const remainingUnresolved = (updatedContent.match(/^- \[ \] \*\*\[/gm) ?? []).length;

    return {
        totalQuestions: unresolvedIndices.length,
        resolvedThisSession: resolvedCount,
        remainingUnresolved,
    };
}

export function report(result: ResolveResult): void {
    console.log('');

    if (result.totalQuestions === 0) {
        console.log('✅ No open questions found — ready to promote!');
        console.log('   Run `stackmoss promote --confirm`');
        return;
    }

    console.log(`📊 Resolved ${result.resolvedThisSession}/${result.totalQuestions} questions this session.`);

    if (result.remainingUnresolved > 0) {
        console.log(`   ⚠️  ${result.remainingUnresolved} question(s) still unresolved.`);
        console.log('   Run `stackmoss resolve` again to continue.');
    } else {
        console.log('   ✅ All questions resolved — ready to promote!');
        console.log('   Run `stackmoss promote --confirm`');
    }
}

/**
 * Full command handler
 */
export async function handler(): Promise<void> {
    const { configPath, reportPath } = parseArgs();
    checkState(configPath);
    const result = await execute(reportPath);
    report(result);
}
