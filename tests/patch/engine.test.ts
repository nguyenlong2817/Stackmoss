/**
 * Tests: Patch Proposal Engine
 * Authority: BRD §12
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
    createProposal,
    listProposals,
    applyProposal,
    rejectProposal,
    wordCount,
} from '../../src/patch/engine.js';
import type { PatchFix } from '../../src/patch/types.js';

const TEST_DIR = join(process.cwd(), '__test_patch__');

function cleanup(): void {
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

function createTestFix(overrides: Partial<PatchFix> = {}): PatchFix {
    return {
        targetFile: 'team.md',
        section: '[DEV-ENV]',
        oldContent: overrides.oldContent ?? 'dev: `npm run dev`',
        newContent: overrides.newContent ?? 'dev: `npm run dev`',
        ...overrides,
    };
}

describe('Word Count', () => {
    it('counts words correctly', () => {
        expect(wordCount('hello world')).toBe(2);
        expect(wordCount('one two three four')).toBe(4);
        expect(wordCount('')).toBe(0);
        expect(wordCount('  spaces  between  ')).toBe(2);
    });
});

describe('Patch Engine', () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    it('creates a proposal', () => {
        mkdirSync(TEST_DIR, { recursive: true });

        const proposal = createProposal(
            TEST_DIR,
            'run_fail',
            'npm run dev',
            'Error: ENOENT',
            createTestFix(),
        );

        expect(proposal.id).toMatch(/^PATCH-/);
        expect(proposal.status).toBe('pending');
        expect(proposal.trigger).toBe('run_fail');
    });

    it('lists proposals', () => {
        mkdirSync(TEST_DIR, { recursive: true });

        createProposal(TEST_DIR, 'run_fail', 'cmd1', 'err1', createTestFix());
        createProposal(TEST_DIR, 'check_fail', 'cmd2', 'err2', createTestFix());

        const all = listProposals(TEST_DIR);
        expect(all.length).toBe(2);
    });

    it('filters proposals by status', () => {
        mkdirSync(TEST_DIR, { recursive: true });

        createProposal(TEST_DIR, 'run_fail', 'cmd1', 'err1', createTestFix());

        const pending = listProposals(TEST_DIR, 'pending');
        expect(pending.length).toBe(1);

        const applied = listProposals(TEST_DIR, 'applied');
        expect(applied.length).toBe(0);
    });

    it('applies proposal to target file', () => {
        mkdirSync(TEST_DIR, { recursive: true });
        const teamPath = join(TEST_DIR, 'team.md');
        writeFileSync(teamPath, 'dev: `npm run dev`\nbuild: `tsc`', 'utf-8');

        const proposal = createProposal(
            TEST_DIR,
            'run_fail',
            'npm run dev',
            'err',
            createTestFix({
                oldContent: 'dev: `npm run dev`',
                newContent: 'dev: `npm run start`',
            }),
        );

        const result = applyProposal(TEST_DIR, proposal.id);

        expect(result.success).toBe(true);
        const content = readFileSync(teamPath, 'utf-8');
        expect(content).toContain('npm run start');
    });

    it('rejects proposal with word budget violation', () => {
        mkdirSync(TEST_DIR, { recursive: true });
        const teamPath = join(TEST_DIR, 'team.md');
        writeFileSync(teamPath, 'short content', 'utf-8');

        const proposal = createProposal(
            TEST_DIR,
            'run_fail',
            'cmd',
            'err',
            createTestFix({
                oldContent: 'short content',
                newContent: 'this is a much longer content that exceeds the original word count significantly',
            }),
        );

        const result = applyProposal(TEST_DIR, proposal.id);

        expect(result.success).toBe(false);
        expect(result.detail).toContain('Word budget violation');
    });

    it('rejects proposal', () => {
        mkdirSync(TEST_DIR, { recursive: true });

        const proposal = createProposal(
            TEST_DIR,
            'run_fail',
            'cmd',
            'err',
            createTestFix(),
        );

        const result = rejectProposal(TEST_DIR, proposal.id, 'Not applicable');

        expect(result.success).toBe(true);

        const updated = listProposals(TEST_DIR);
        expect(updated[0].status).toBe('rejected');
        expect(updated[0].rejectReason).toBe('Not applicable');
    });

    it('rejects apply on already-applied proposal', () => {
        mkdirSync(TEST_DIR, { recursive: true });
        const teamPath = join(TEST_DIR, 'team.md');
        writeFileSync(teamPath, 'dev: `npm run dev`', 'utf-8');

        const proposal = createProposal(
            TEST_DIR,
            'run_fail',
            'cmd',
            'err',
            createTestFix(),
        );

        applyProposal(TEST_DIR, proposal.id);
        const result = applyProposal(TEST_DIR, proposal.id);

        expect(result.success).toBe(false);
        expect(result.detail).toContain('already applied');
    });

    it('returns empty list when no patches dir', () => {
        const proposals = listProposals(TEST_DIR);
        expect(proposals).toEqual([]);
    });
});
