/**
 * Command: stackmoss resolve
 * Phase B: interactively answer open questions from MIGRATION_REPORT.md
 * Authority: BRD §13 / Appendix B
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { select, input } from '@inquirer/prompts';
import { CONFIG_FILENAME } from '../config.js';
import { readState } from '../state-machine.js';
import { MIGRATION_REPORT_FILENAME } from '../scanner/index.js';

interface ResolveResult {
    totalQuestions: number;
    resolvedThisSession: number;
    remainingUnresolved: number;
}

const UNRESOLVED_PATTERN = /^- \[ \] \*\*\[([^\]]+)\]\*\* (.+)$/;
const RESOLVED_SECTION_HEADER = '### Đã trả lời';

interface ResolvedEntry {
    lineIdx: number;
    id: string;
    text: string;
    answer: string;
}

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

function upsertResolvedSection(lines: string[], resolvedEntries: ResolvedEntry[]): string[] {
    if (resolvedEntries.length === 0) {
        return lines;
    }

    const nextLines = [...lines];
    let resolvedHeaderIndex = nextLines.findIndex((line) => line.trim() === RESOLVED_SECTION_HEADER);

    if (resolvedHeaderIndex === -1) {
        const openQuestionsIndex = nextLines.findIndex((line) => line.includes('## OPEN QUESTIONS'));
        let insertIndex = nextLines.length;

        if (openQuestionsIndex !== -1) {
            for (let index = openQuestionsIndex + 1; index < nextLines.length; index++) {
                if (nextLines[index].startsWith('## ') || nextLines[index] === '---') {
                    insertIndex = index;
                    break;
                }
            }
        }

        nextLines.splice(insertIndex, 0, '', RESOLVED_SECTION_HEADER);
        resolvedHeaderIndex = nextLines.findIndex((line) => line.trim() === RESOLVED_SECTION_HEADER);
    }

    let insertAfter = resolvedHeaderIndex + 1;
    while (insertAfter < nextLines.length) {
        const line = nextLines[insertAfter];
        if (line.startsWith('## ') || line === '---') {
            break;
        }
        insertAfter++;
    }

    const rendered = resolvedEntries.map(
        (entry) => `- [x] **[${entry.id}]** ${entry.text} → ${entry.answer}`,
    );
    nextLines.splice(insertAfter, 0, ...rendered);
    return nextLines;
}

export async function execute(reportPath: string): Promise<ResolveResult> {
    const content = readFileSync(reportPath, 'utf-8');
    const lines = content.split('\n');

    const unresolvedEntries: { lineIdx: number; id: string; text: string }[] = [];
    for (let index = 0; index < lines.length; index++) {
        const match = lines[index].match(UNRESOLVED_PATTERN);
        if (!match) {
            continue;
        }

        unresolvedEntries.push({
            lineIdx: index,
            id: match[1],
            text: match[2].replace(/\s*_\(.+\)_\s*$/, ''),
        });
    }

    if (unresolvedEntries.length === 0) {
        return {
            totalQuestions: 0,
            resolvedThisSession: 0,
            remainingUnresolved: 0,
        };
    }

    console.log(`\n📋 ${unresolvedEntries.length} open question(s) to resolve:\n`);

    const resolvedEntries: ResolvedEntry[] = [];

    for (const item of unresolvedEntries) {
        console.log(`\n❓ [${item.id}] ${item.text}`);

        const action = await select({
            message: 'Action?',
            choices: [
                { name: 'Answer this question', value: 'answer' },
                { name: 'Skip for now', value: 'skip' },
                { name: 'Stop resolving', value: 'stop' },
            ],
        });

        if (action === 'stop') {
            break;
        }

        if (action === 'skip') {
            continue;
        }

        const answer = await input({
            message: 'Your answer:',
        });

        if (answer.trim().length > 0) {
            resolvedEntries.push({
                lineIdx: item.lineIdx,
                id: item.id,
                text: item.text,
                answer: answer.trim(),
            });
        }
    }

    if (resolvedEntries.length > 0) {
        const resolvedLineIndexes = new Set(resolvedEntries.map((entry) => entry.lineIdx));
        const unresolvedRemoved = lines.filter((_, index) => !resolvedLineIndexes.has(index));
        const updatedLines = upsertResolvedSection(unresolvedRemoved, resolvedEntries);
        writeFileSync(reportPath, updatedLines.join('\n'), 'utf-8');
    }

    const updatedContent = readFileSync(reportPath, 'utf-8');
    const remainingUnresolved = (updatedContent.match(/^- \[ \] \*\*\[/gm) ?? []).length;

    return {
        totalQuestions: unresolvedEntries.length,
        resolvedThisSession: resolvedEntries.length,
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
        return;
    }

    console.log('   ✅ All questions resolved — ready to promote!');
    console.log('   Run `stackmoss promote --confirm`');
}

export async function handler(): Promise<void> {
    const { configPath, reportPath } = parseArgs();
    checkState(configPath);
    const result = await execute(reportPath);
    report(result);
}
