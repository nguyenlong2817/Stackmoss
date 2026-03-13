/**
 * Patch Proposal Engine
 * Authority: BRD §12.1-12.4
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve, sep } from 'node:path';
import type { PatchProposal, PatchFix, PatchTrigger } from './types.js';
import { CAPABILITY_MAX_BUDGETS, TEAM_TOTAL_MAX, extractCapabilityBlocks } from '../budgets.js';

const PATCHES_DIR = '.stackmoss/patches';
let patchCounter = 0;

export function wordCount(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
}

function normalizePathForComparison(path: string): string {
    return process.platform === 'win32' ? path.toLowerCase() : path;
}

function isPathInsideRoot(rootPath: string, targetPath: string): boolean {
    const normalizedRoot = normalizePathForComparison(resolve(rootPath));
    const normalizedTarget = normalizePathForComparison(resolve(targetPath));

    return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${sep}`);
}

function findSectionRanges(content: string, section: string): Array<{ start: number; end: number; value: string }> {
    const normalized = content.replace(/\r\n/g, '\n');
    const lines = normalized.split('\n');
    const isCapabilitySection = /^\[[^\]]+\]$/.test(section);
    const ranges: Array<{ start: number; end: number; value: string }> = [];

    for (let startLine = 0; startLine < lines.length; startLine++) {
        const trimmed = lines[startLine].trim();
        if (isCapabilitySection) {
            if (!(trimmed.startsWith(`- ${section}`) || trimmed === section)) {
                continue;
            }
        } else if (!(trimmed === section || trimmed.startsWith(section))) {
            continue;
        }

        let endLine = lines.length;
        for (let index = startLine + 1; index < lines.length; index++) {
            const nextTrimmed = lines[index].trim();
            const nextCapability = nextTrimmed.startsWith('- [');
            const nextHeading = lines[index].startsWith('## ');
            const divider = nextTrimmed === '---';

            if ((isCapabilitySection && (nextCapability || nextHeading || divider)) || (!isCapabilitySection && (nextHeading || divider))) {
                endLine = index;
                break;
            }
        }

        let start = 0;
        for (let index = 0; index < startLine; index++) {
            start += lines[index].length + 1;
        }

        let end = start;
        for (let index = startLine; index < endLine; index++) {
            end += lines[index].length + 1;
        }

        ranges.push({
            start,
            end,
            value: lines.slice(startLine, endLine).join('\n'),
        });
    }

    return ranges;
}

function validateTeamBudgets(teamContent: string): string | null {
    let totalWords = 0;

    for (const block of extractCapabilityBlocks(teamContent)) {
        const maxBudget = CAPABILITY_MAX_BUDGETS[block.id];
        if (!maxBudget) {
            continue;
        }

        const words = wordCount(block.content);
        totalWords += words;

        if (words > maxBudget) {
            return `[${block.id}] exceeds max budget (${words}/${maxBudget} words)`;
        }
    }

    if (totalWords > TEAM_TOTAL_MAX) {
        return `Team total exceeds max budget (${totalWords}/${TEAM_TOTAL_MAX} words)`;
    }

    return null;
}

export function createProposal(
    projectPath: string,
    trigger: PatchTrigger,
    command: string,
    errorOutput: string,
    suggestedFix: PatchFix,
): PatchProposal {
    const patchesDir = join(projectPath, PATCHES_DIR);
    mkdirSync(patchesDir, { recursive: true });

    const id = `PATCH-${Date.now()}-${++patchCounter}`;
    const proposal: PatchProposal = {
        id,
        createdAt: new Date().toISOString(),
        trigger,
        command,
        errorOutput: errorOutput.slice(0, 500),
        suggestedFix,
        status: 'pending',
    };

    const filepath = join(patchesDir, `${id}.json`);
    writeFileSync(filepath, JSON.stringify(proposal, null, 2), 'utf-8');

    return proposal;
}

export function listProposals(
    projectPath: string,
    filter?: 'pending' | 'applied' | 'rejected',
): PatchProposal[] {
    const patchesDir = join(projectPath, PATCHES_DIR);

    if (!existsSync(patchesDir)) {
        return [];
    }

    const files = readdirSync(patchesDir).filter((file) => file.endsWith('.json'));
    const proposals: PatchProposal[] = [];

    for (const file of files) {
        try {
            const raw = readFileSync(join(patchesDir, file), 'utf-8');
            const proposal = JSON.parse(raw) as PatchProposal;
            if (!filter || proposal.status === filter) {
                proposals.push(proposal);
            }
        } catch {
            // Skip corrupt files.
        }
    }

    return proposals.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export interface ApplyResult {
    success: boolean;
    detail: string;
}

export function applyProposal(
    projectPath: string,
    proposalId: string,
): ApplyResult {
    const patchesDir = join(projectPath, PATCHES_DIR);
    const filepath = join(patchesDir, `${proposalId}.json`);

    if (!existsSync(filepath)) {
        return { success: false, detail: `Proposal ${proposalId} not found` };
    }

    const proposal = JSON.parse(readFileSync(filepath, 'utf-8')) as PatchProposal;
    if (proposal.status !== 'pending') {
        return { success: false, detail: `Proposal already ${proposal.status}` };
    }

    const { suggestedFix } = proposal;
    const resolvedRoot = resolve(projectPath);
    const targetPath = resolve(resolvedRoot, suggestedFix.targetFile);

    if (!isPathInsideRoot(resolvedRoot, targetPath)) {
        return {
            success: false,
            detail: `Path traversal rejected: ${suggestedFix.targetFile} escapes project root`,
        };
    }

    if (!existsSync(targetPath)) {
        return { success: false, detail: `Target file not found: ${suggestedFix.targetFile}` };
    }

    const oldWords = wordCount(suggestedFix.oldContent);
    const newWords = wordCount(suggestedFix.newContent);
    if (newWords > oldWords) {
        return {
            success: false,
            detail: `Word budget violation: new content (${newWords} words) exceeds old content (${oldWords} words). BRD §12.3 requires content length after ≤ before.`,
        };
    }

    const currentContent = readFileSync(targetPath, 'utf-8');
    const sectionRange = findSectionRanges(currentContent, suggestedFix.section)
        .find((range) => range.value.includes(suggestedFix.oldContent));
    if (!sectionRange) {
        return {
            success: false,
            detail: `Old content not found inside the declared section — file may have changed since proposal creation.`,
        };
    }

    const updatedSection = sectionRange.value.replace(suggestedFix.oldContent, suggestedFix.newContent);
    const updatedContent = `${currentContent.slice(0, sectionRange.start)}${updatedSection}${currentContent.slice(sectionRange.end)}`;

    if (basename(targetPath).toLowerCase() === 'team.md') {
        const budgetViolation = validateTeamBudgets(updatedContent);
        if (budgetViolation) {
            return {
                success: false,
                detail: `Patch rejected by budget gate: ${budgetViolation}`,
            };
        }
    }

    writeFileSync(targetPath, updatedContent, 'utf-8');
    proposal.status = 'applied';
    writeFileSync(filepath, JSON.stringify(proposal, null, 2), 'utf-8');

    return { success: true, detail: `Patch applied to ${suggestedFix.targetFile}` };
}

export function rejectProposal(
    projectPath: string,
    proposalId: string,
    reason: string,
): ApplyResult {
    const patchesDir = join(projectPath, PATCHES_DIR);
    const filepath = join(patchesDir, `${proposalId}.json`);

    if (!existsSync(filepath)) {
        return { success: false, detail: `Proposal ${proposalId} not found` };
    }

    const proposal = JSON.parse(readFileSync(filepath, 'utf-8')) as PatchProposal;
    if (proposal.status !== 'pending') {
        return { success: false, detail: `Proposal already ${proposal.status}` };
    }

    proposal.status = 'rejected';
    proposal.rejectReason = reason;
    writeFileSync(filepath, JSON.stringify(proposal, null, 2), 'utf-8');

    return { success: true, detail: `Proposal rejected: ${reason}` };
}
