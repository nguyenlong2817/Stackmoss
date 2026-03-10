/**
 * Command: stackmoss patch <action>
 * Phase C: Apply or reject pending patch proposals
 * Authority: BRD §12.3, cli-pipeline skill
 *
 * Actions:
 * - apply [id]  — apply a pending proposal (enforce word budget)
 * - reject <reason> [id] — reject with reason
 * - list — show all pending proposals
 */

import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { readState } from '../state-machine.js';
import {
    listProposals,
    applyProposal,
    rejectProposal,
} from '../patch/index.js';
import type { PatchProposal } from '../patch/types.js';

// ─── 4-method command pattern ────────────────────────────────────

export function parseArgs(args: string[]): {
    projectPath: string;
    configPath: string;
    action: 'apply' | 'reject' | 'list';
    patchId?: string;
    reason?: string;
} {
    const projectPath = resolve('.');
    const configPath = join(projectPath, CONFIG_FILENAME);

    if (!existsSync(configPath)) {
        throw new Error(`No ${CONFIG_FILENAME} found in current directory.`);
    }

    if (args.length === 0) {
        throw new Error(
            'Action required. Usage:\n' +
            '  stackmoss patch apply [id]\n' +
            '  stackmoss patch reject <reason> [id]\n' +
            '  stackmoss patch list',
        );
    }

    const action = args[0] as string;

    if (action === 'apply') {
        return { projectPath, configPath, action: 'apply', patchId: args[1] };
    } else if (action === 'reject') {
        if (args.length < 2) {
            throw new Error('Reject requires a reason. Usage: stackmoss patch reject <reason> [id]');
        }
        return { projectPath, configPath, action: 'reject', reason: args[1], patchId: args[2] };
    } else if (action === 'list') {
        return { projectPath, configPath, action: 'list' };
    } else {
        throw new Error(`Unknown action '${action}'. Use: apply, reject, or list.`);
    }
}

export function checkState(configPath: string): void {
    const currentState = readState(configPath);

    if (currentState !== 'OPERATIONAL') {
        throw new Error(
            `Command 'patch' is only available in OPERATIONAL state.\n` +
            `   Current state: ${currentState}.`,
        );
    }
}

function formatProposal(p: PatchProposal): string {
    const icon = p.status === 'pending' ? '📋' : p.status === 'applied' ? '✅' : '❌';
    return `   ${icon} [${p.id}] ${p.trigger} — ${p.command}\n      Status: ${p.status} | Created: ${p.createdAt}`;
}

export function execute(
    projectPath: string,
    action: 'apply' | 'reject' | 'list',
    patchId?: string,
    reason?: string,
): void {
    if (action === 'list') {
        const all = listProposals(projectPath);

        if (all.length === 0) {
            console.log('\n📋 No patch proposals found.');
            return;
        }

        const pending = all.filter((p) => p.status === 'pending');
        const applied = all.filter((p) => p.status === 'applied');
        const rejected = all.filter((p) => p.status === 'rejected');

        if (pending.length > 0) {
            console.log(`\n📋 Pending (${pending.length}):`);
            for (const p of pending) console.log(formatProposal(p));
        }
        if (applied.length > 0) {
            console.log(`\n✅ Applied (${applied.length}):`);
            for (const p of applied) console.log(formatProposal(p));
        }
        if (rejected.length > 0) {
            console.log(`\n❌ Rejected (${rejected.length}):`);
            for (const p of rejected) console.log(formatProposal(p));
        }
        return;
    }

    // If no specific ID, use the first pending proposal
    let targetId = patchId;
    if (!targetId) {
        const pending = listProposals(projectPath, 'pending');
        if (pending.length === 0) {
            console.log('\n📋 No pending patch proposals.');
            return;
        }
        targetId = pending[0].id;
        console.log(`\n   Using first pending proposal: ${targetId}`);
    }

    if (action === 'apply') {
        const result = applyProposal(projectPath, targetId);
        if (result.success) {
            console.log(`\n✅ ${result.detail}`);
        } else {
            console.log(`\n❌ ${result.detail}`);
        }
    } else if (action === 'reject') {
        const result = rejectProposal(projectPath, targetId, reason ?? 'No reason given');
        if (result.success) {
            console.log(`\n✅ ${result.detail}`);
        } else {
            console.log(`\n❌ ${result.detail}`);
        }
    }
}

/**
 * Full command handler
 */
export function handler(action: string | undefined, args: string[]): void {
    const allArgs = action ? [action, ...args] : [];
    const parsed = parseArgs(allArgs);
    checkState(parsed.configPath);
    execute(parsed.projectPath, parsed.action, parsed.patchId, parsed.reason);
}
