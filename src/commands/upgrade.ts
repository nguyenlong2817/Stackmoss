/**
 * Command: stackmoss upgrade
 * Phase C: Merge CONSTITUTION updates from new StackMoss version
 * Authority: BRD §14, cli-pipeline skill
 *
 * Pattern: parseArgs → checkState → execute → report
 *
 * HARD RULE: upgrade NEVER overwrites PROJECT_FACTS.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { readState } from '../state-machine.js';

// ─── Types ───────────────────────────────────────────────────────

export interface UpgradeResult {
    hasChanges: boolean;
    constitutionDiff: { old: string; new: string } | null;
    applied: boolean;
}

// ─── Section Extraction ──────────────────────────────────────────

const CONSTITUTION_HEADER = '## CONSTITUTION';
const ROLES_HEADER = '## ROLES';

/**
 * Extract CONSTITUTION section from team.md content.
 * Returns the content between ## CONSTITUTION and the next ## section.
 */
export function extractConstitution(content: string): string | null {
    const startIdx = content.indexOf(CONSTITUTION_HEADER);
    if (startIdx === -1) return null;

    const afterHeader = content.indexOf('\n', startIdx);
    if (afterHeader === -1) return content.slice(startIdx);

    // Find next ## header
    const nextSection = content.indexOf('\n## ', afterHeader);
    if (nextSection === -1) return content.slice(startIdx);

    return content.slice(startIdx, nextSection);
}

/**
 * Replace CONSTITUTION section in content, preserving all other sections.
 */
export function replaceConstitution(content: string, newConstitution: string): string {
    const startIdx = content.indexOf(CONSTITUTION_HEADER);
    if (startIdx === -1) return content;

    const afterHeader = content.indexOf('\n', startIdx);
    if (afterHeader === -1) return newConstitution;

    const nextSection = content.indexOf('\n## ', afterHeader);
    if (nextSection === -1) {
        return content.slice(0, startIdx) + newConstitution;
    }

    return content.slice(0, startIdx) + newConstitution + content.slice(nextSection);
}

// ─── 4-method command pattern ────────────────────────────────────

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

/**
 * Execute upgrade.
 *
 * For v0.3, we use a built-in "latest" CONSTITUTION.
 * In future versions, this would fetch from registry/GitHub.
 */
export function execute(
    teamPath: string,
    latestConstitution?: string,
): UpgradeResult {
    const currentContent = readFileSync(teamPath, 'utf-8');
    const currentConstitution = extractConstitution(currentContent);

    // Use provided latest or built-in default
    const latest = latestConstitution ?? getBuiltInConstitution();

    if (!currentConstitution) {
        return { hasChanges: false, constitutionDiff: null, applied: false };
    }

    // Compare
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

/**
 * Apply the upgrade (after user confirms).
 */
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

/**
 * Built-in latest CONSTITUTION for v0.3.
 * Future: fetch from npm registry or GitHub.
 */
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

/**
 * Full command handler.
 * Note: In v0.3, --apply flag triggers immediate apply without interactive confirm.
 */
export function handler(options: { apply?: boolean }): void {
    const { configPath, teamPath } = parseArgs();
    checkState(configPath);
    const result = execute(teamPath);

    if (result.hasChanges && options.apply) {
        applyUpgrade(teamPath, result.constitutionDiff!.new);
        console.log('\n✅ CONSTITUTION upgraded successfully.');
        console.log('   PROJECT_FACTS and operational learnings preserved.');
    } else {
        report(result);
    }
}
