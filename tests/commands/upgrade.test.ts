/**
 * Tests: Upgrade Command — CONSTITUTION merge
 * Authority: BRD §14
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
    extractConstitution,
    replaceConstitution,
    execute as upgradeExecute,
} from '../../src/commands/upgrade.js';

const SAMPLE_TEAM = `# Team — test

## CONSTITUTION
_Rules bất biến._

1. Rule one.
2. Rule two.

## ROLES
TL, DEV

## PROJECT_FACTS
These are project facts that must never change.
Some operational learnings here.
`;

const TEST_DIR = join(process.cwd(), '__test_upgrade__');
const TEAM_PATH = join(TEST_DIR, 'team.md');

function cleanup(): void {
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

describe('Upgrade Command', () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    describe('extractConstitution', () => {
        it('extracts CONSTITUTION section', () => {
            const constitution = extractConstitution(SAMPLE_TEAM);

            expect(constitution).toBeDefined();
            expect(constitution).toContain('## CONSTITUTION');
            expect(constitution).toContain('Rule one');
            expect(constitution).not.toContain('## ROLES');
        });

        it('returns null when no CONSTITUTION found', () => {
            const result = extractConstitution('# Team\n## ROLES\nSome roles');
            expect(result).toBeNull();
        });
    });

    describe('replaceConstitution', () => {
        it('replaces CONSTITUTION preserving other sections', () => {
            const newConst = '## CONSTITUTION\n_Updated rules._\n\n1. New rule.\n';
            const result = replaceConstitution(SAMPLE_TEAM, newConst);

            expect(result).toContain('## CONSTITUTION');
            expect(result).toContain('New rule');
            expect(result).toContain('## ROLES');
            expect(result).toContain('## PROJECT_FACTS');
            expect(result).toContain('project facts that must never change');
        });

        it('preserves PROJECT_FACTS exactly', () => {
            const newConst = '## CONSTITUTION\n_Changed._\n';
            const result = replaceConstitution(SAMPLE_TEAM, newConst);

            expect(result).toContain('These are project facts that must never change.');
            expect(result).toContain('Some operational learnings here.');
        });
    });

    describe('execute', () => {
        it('detects no changes when CONSTITUTION is same', () => {
            mkdirSync(TEST_DIR, { recursive: true });
            writeFileSync(TEAM_PATH, SAMPLE_TEAM, 'utf-8');

            const currentConst = extractConstitution(SAMPLE_TEAM)!;
            const result = upgradeExecute(TEAM_PATH, currentConst);

            expect(result.hasChanges).toBe(false);
        });

        it('detects changes when CONSTITUTION differs', () => {
            mkdirSync(TEST_DIR, { recursive: true });
            writeFileSync(TEAM_PATH, SAMPLE_TEAM, 'utf-8');

            const newConst = '## CONSTITUTION\n_Completely different rules._\n\n1. New rule.\n';
            const result = upgradeExecute(TEAM_PATH, newConst);

            expect(result.hasChanges).toBe(true);
            expect(result.constitutionDiff).toBeDefined();
            expect(result.constitutionDiff!.new).toContain('Completely different');
        });
    });
});
