/**
 * Patch Proposal Engine
 * Authority: BRD §12.1-12.4
 *
 * Manages the lifecycle of Patch Proposals:
 * create → list → apply/reject
 *
 * Enforce: replace-only, word budget, no new sections.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { PatchProposal, PatchFix, PatchTrigger } from './types.js';

// ─── Constants ───────────────────────────────────────────────────

const PATCHES_DIR = '.stackmoss/patches';
let patchCounter = 0;

// ─── Word Count ──────────────────────────────────────────────────

export function wordCount(text: string): number {
    return text.split(/\s+/).filter((w) => w.length > 0).length;
}

// ─── Create Proposal ─────────────────────────────────────────────

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
        errorOutput: errorOutput.slice(0, 500), // Cap error output
        suggestedFix,
        status: 'pending',
    };

    const filepath = join(patchesDir, `${id}.json`);
    writeFileSync(filepath, JSON.stringify(proposal, null, 2), 'utf-8');

    return proposal;
}

// ─── List Proposals ──────────────────────────────────────────────

export function listProposals(
    projectPath: string,
    filter?: 'pending' | 'applied' | 'rejected',
): PatchProposal[] {
    const patchesDir = join(projectPath, PATCHES_DIR);

    if (!existsSync(patchesDir)) return [];

    const files = readdirSync(patchesDir).filter((f) => f.endsWith('.json'));
    const proposals: PatchProposal[] = [];

    for (const file of files) {
        try {
            const raw = readFileSync(join(patchesDir, file), 'utf-8');
            const proposal = JSON.parse(raw) as PatchProposal;
            if (!filter || proposal.status === filter) {
                proposals.push(proposal);
            }
        } catch {
            // Skip corrupt files
        }
    }

    return proposals.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// ─── Apply Proposal ──────────────────────────────────────────────

export interface ApplyResult {
    success: boolean;
    detail: string;
}

/**
 * Apply a patch proposal.
 *
 * BRD §12.3 rules:
 * - Replace section content (not append)
 * - Content length after ≤ content length before
 * - If exceeds budget → trim
 * - No new sections
 */
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
    const targetPath = join(projectPath, suggestedFix.targetFile);

    if (!existsSync(targetPath)) {
        return { success: false, detail: `Target file not found: ${suggestedFix.targetFile}` };
    }

    // Check word budget constraint: new ≤ old
    const oldWords = wordCount(suggestedFix.oldContent);
    const newWords = wordCount(suggestedFix.newContent);

    if (newWords > oldWords) {
        return {
            success: false,
            detail: `Word budget violation: new content (${newWords} words) exceeds old content (${oldWords} words). BRD §12.3 requires content length after ≤ before.`,
        };
    }

    // Apply the patch
    const currentContent = readFileSync(targetPath, 'utf-8');

    if (!currentContent.includes(suggestedFix.oldContent)) {
        return {
            success: false,
            detail: 'Old content not found in target file — file may have been modified since proposal was created.',
        };
    }

    const newContent = currentContent.replace(suggestedFix.oldContent, suggestedFix.newContent);
    writeFileSync(targetPath, newContent, 'utf-8');

    // Update proposal status
    proposal.status = 'applied';
    writeFileSync(filepath, JSON.stringify(proposal, null, 2), 'utf-8');

    return { success: true, detail: `Patch applied to ${suggestedFix.targetFile}` };
}

// ─── Reject Proposal ─────────────────────────────────────────────

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
