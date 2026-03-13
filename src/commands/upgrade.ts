/**
 * Command: stackmoss upgrade
 * Phase C: Merge CONSTITUTION updates from new StackMoss version
 * Authority: BRD §14
 *
 * HARD RULE: upgrade never overwrites PROJECT_FACTS.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { readState } from '../state-machine.js';

export interface UpgradeResult {
    hasChanges: boolean;
    constitutionDiff: { old: string; new: string } | null;
    applied: boolean;
}

const CONSTITUTION_HEADER = '## CONSTITUTION';

function findTopLevelSectionRange(content: string, header: string): { start: number; end: number } | null {
    const normalized = content.replace(/\r\n/g, '\n');
    const lines = normalized.split('\n');

    let startLine = -1;
    for (let index = 0; index < lines.length; index++) {
        if (lines[index].trim() === header) {
            startLine = index;
            break;
        }
    }

    if (startLine === -1) {
        return null;
    }

    let start = 0;
    for (let index = 0; index < startLine; index++) {
        start += lines[index].length + 1;
    }

    let end = normalized.length;
    let offset = start;
    for (let index = startLine; index < lines.length; index++) {
        if (index > startLine && lines[index].startsWith('## ')) {
            end = offset;
            break;
        }
        offset += lines[index].length + 1;
    }

    return { start, end };
}

export function extractConstitution(content: string): string | null {
    const range = findTopLevelSectionRange(content, CONSTITUTION_HEADER);
    if (!range) {
        return null;
    }

    return content.slice(range.start, range.end).trimEnd();
}

export function replaceConstitution(content: string, newConstitution: string): string {
    const range = findTopLevelSectionRange(content, CONSTITUTION_HEADER);
    if (!range) {
        return content;
    }

    const prefix = content.slice(0, range.start);
    const suffix = content.slice(range.end);
    const normalizedConstitution = newConstitution.trimEnd();
    return `${prefix}${normalizedConstitution}${suffix.startsWith('\n') ? '' : '\n'}${suffix}`;
}

export function parseArgs(): {
    projectPath: string;
    configPath: string;
    teamPath: string;
} {
    const projectPath = resolve('.');
    const configPath = join(projectPath, CONFIG_FILENAME);
    const teamPath = join(projectPath, 'team.md');

    if (!existsSync(configPath)) {
        throw new Error(`No ${CONFIG_FILENAME} found in current directory.`);
    }

    if (!existsSync(teamPath)) {
        throw new Error('No team.md found in project — nothing to upgrade.');
    }

    return { projectPath, configPath, teamPath };
}

export function checkState(configPath: string): void {
    const currentState = readState(configPath);

    if (currentState !== 'OPERATIONAL') {
        throw new Error(
            `Command 'upgrade' is only available in OPERATIONAL state.\n` +
            `   Current state: ${currentState}.`,
        );
    }
}

export function execute(
    teamPath: string,
    latestConstitution?: string,
): UpgradeResult {
    const currentContent = readFileSync(teamPath, 'utf-8');
    const currentConstitution = extractConstitution(currentContent);
    const latest = latestConstitution ?? getBuiltInConstitution();

    if (!currentConstitution) {
        return { hasChanges: false, constitutionDiff: null, applied: false };
    }

    if (currentConstitution.trim() === latest.trim()) {
        return { hasChanges: false, constitutionDiff: null, applied: false };
    }

    return {
        hasChanges: true,
        constitutionDiff: {
            old: currentConstitution.trim(),
            new: latest.trim(),
        },
        applied: false,
    };
}

export function applyUpgrade(teamPath: string, newConstitution: string): void {
    const content = readFileSync(teamPath, 'utf-8');
    const updated = replaceConstitution(content, newConstitution);
    writeFileSync(teamPath, updated, 'utf-8');
}

export function report(result: UpgradeResult): void {
    if (!result.hasChanges) {
        console.log('\n✅ CONSTITUTION is already up-to-date. Nothing to upgrade.');
        return;
    }

    console.log('\n📋 CONSTITUTION upgrade available:\n');
    console.log('--- Current ---');
    console.log(result.constitutionDiff!.old.slice(0, 300));
    console.log('\n--- New ---');
    console.log(result.constitutionDiff!.new.slice(0, 300));
    console.log('\n⚠️  PROJECT_FACTS and operational learnings will NOT be touched.');
    console.log('   Run `stackmoss upgrade --apply` to apply this change.');
}

function getBuiltInConstitution(): string {
    return `## CONSTITUTION
_Rules bất biến — chỉ thay đổi qua stackmoss upgrade._

1. Agent không viết code production mà không có instruction rõ ràng từ TL.
2. Mỗi feature phải có acceptance criteria trước khi bắt đầu.
3. Agent không tự ý thêm scope — nếu cần mở rộng, hỏi TL.
4. Replace-only: khi patch, content mới ≤ content cũ (word count).
5. Không tạo section mới trong team.md — chỉ edit existing sections.
6. Mọi command phải qua state validation trước khi execute.
7. Atomic writes: hoặc ghi hết, hoặc không ghi gì.
8. Budget enforcement: mỗi capability section có word limit cứng.
`;
}

export function handler(options: { apply?: boolean }): void {
    const { configPath, teamPath } = parseArgs();
    checkState(configPath);
    const result = execute(teamPath);

    if (result.hasChanges && options.apply) {
        applyUpgrade(teamPath, result.constitutionDiff!.new);
        console.log('\n✅ CONSTITUTION upgraded successfully.');
        console.log('   PROJECT_FACTS and operational learnings preserved.');
        return;
    }

    report(result);
}
