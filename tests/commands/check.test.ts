/**
 * Tests: Check Command
 * Authority: BRD §12.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execute as checkExecute } from '../../src/commands/check.js';

const TEST_DIR = join(process.cwd(), '__test_check__');

function setup(opts: {
    hasTeamMd?: boolean;
    teamContent?: string;
    hasFeatures?: boolean;
    hasNorthStar?: boolean;
} = {}): void {
    const {
        hasTeamMd = true,
        teamContent,
        hasFeatures = true,
        hasNorthStar = true,
    } = opts;

    mkdirSync(TEST_DIR, { recursive: true });

    // Config
    writeFileSync(join(TEST_DIR, 'stackmoss.config.json'), JSON.stringify({
        schemaVersion: '1.0',
        state: 'OPERATIONAL',
        projectName: 'test',
    }, null, 2), 'utf-8');

    // team.md
    if (hasTeamMd) {
        const content = teamContent ?? `# Team — test
## CONSTITUTION
Rules here.

## ROLES
TL, DEV

## WORKING CONTRACT
Agreements here.

## PROJECT_FACTS
Facts here.
`;
        writeFileSync(join(TEST_DIR, 'team.md'), content, 'utf-8');
    }

    if (hasFeatures) writeFileSync(join(TEST_DIR, 'FEATURES.md'), '# Features', 'utf-8');
    if (hasNorthStar) writeFileSync(join(TEST_DIR, 'NORTH_STAR.md'), '# North Star', 'utf-8');
}

function cleanup(): void {
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

const originalCwd = process.cwd();

describe('Check Command', () => {
    beforeEach(() => {
        cleanup();
        process.chdir(originalCwd);
    });
    afterEach(() => {
        process.chdir(originalCwd);
        cleanup();
    });

    it('passes when everything is healthy', () => {
        setup();
        process.chdir(TEST_DIR);

        const result = checkExecute(TEST_DIR);

        expect(result.allClear).toBe(true);
        expect(result.issues.length).toBe(0);
    });

    it('detects missing team.md', () => {
        setup({ hasTeamMd: false });
        process.chdir(TEST_DIR);

        const result = checkExecute(TEST_DIR);

        expect(result.allClear).toBe(false);
        const issue = result.issues.find((i) => i.detail.includes('team.md'));
        expect(issue).toBeDefined();
    });

    it('detects missing FEATURES.md', () => {
        setup({ hasFeatures: false });
        process.chdir(TEST_DIR);

        const result = checkExecute(TEST_DIR);

        expect(result.allClear).toBe(false);
        const issue = result.issues.find((i) => i.detail.includes('FEATURES.md'));
        expect(issue).toBeDefined();
    });

    it('detects missing required sections in team.md', () => {
        setup({ teamContent: '# Team\nJust a header, no sections.' });
        process.chdir(TEST_DIR);

        const result = checkExecute(TEST_DIR);

        const structureIssues = result.issues.filter((i) => i.category === 'structure_invalid');
        expect(structureIssues.length).toBeGreaterThan(0);
    });
});
