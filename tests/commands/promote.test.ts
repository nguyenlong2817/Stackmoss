/**
 * Tests: Promote Command — hard gate validation
 * Authority: BRD §13.2, cli-pipeline skill
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execute as promoteExecute } from '../../src/commands/promote.js';
import { renderMigrationReport } from '../../src/scanner/report.js';
import type { ScanResult } from '../../src/scanner/types.js';

const TEST_DIR = join(process.cwd(), '__test_promote__');
const CONFIG_PATH = join(TEST_DIR, 'stackmoss.config.json');
const REPORT_PATH = join(TEST_DIR, 'MIGRATION_REPORT.md');
const OPEN_QUESTIONS_PATH = join(TEST_DIR, 'OPEN_QUESTIONS.md');

function setup(opts: {
    state?: string;
    unresolvedQuestions?: boolean;
    criticalLowConfidence?: boolean;
    hasVerifiedDevEnv?: boolean;
    openQuestionsFileUnresolved?: boolean;
} = {}): void {
    const {
        state = 'MIGRATING',
        unresolvedQuestions = false,
        criticalLowConfidence = false,
        hasVerifiedDevEnv = true,
        openQuestionsFileUnresolved = false,
    } = opts;

    mkdirSync(TEST_DIR, { recursive: true });

    // Config
    writeFileSync(CONFIG_PATH, JSON.stringify({
        schemaVersion: '1.0',
        state,
        projectName: 'test',
        createdAt: '2026-01-01T00:00:00Z',
    }, null, 2), 'utf-8');

    // Report
    const scanResult: ScanResult = {
        facts: hasVerifiedDevEnv
            ? [
                { category: 'PM', value: 'npm', source: 'lock' },
                { category: 'Run command', value: '`npm run dev`', source: 'package.json scripts' },
            ]
            : [{ category: 'PM', value: 'npm', source: 'lock' }],
        hypotheses: criticalLowConfidence
            ? [{ category: 'Monorepo', value: 'YES', confidence: 55, source: 'apps/', critical: true }]
            : [{ category: 'DB', value: 'PG', confidence: 85, source: 'deps', critical: true }],
        openQuestions: unresolvedQuestions
            ? [{ id: 'OQ1', text: 'Deploy?', impact: 'OPS', resolved: false }]
            : [{ id: 'OQ1', text: 'Deploy?', impact: 'OPS', resolved: true, answer: 'Docker' }],
    };
    writeFileSync(REPORT_PATH, renderMigrationReport('test', scanResult), 'utf-8');

    if (openQuestionsFileUnresolved) {
        writeFileSync(
            OPEN_QUESTIONS_PATH,
            '# Open Questions\n\n## Chưa được trả lời\n- [ ] Q1: Deploy target?\n',
            'utf-8',
        );
    }
}

function cleanup(): void {
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

// Save and restore CWD since promote reads from CWD
const originalCwd = process.cwd();

describe('Promote Command', () => {
    beforeEach(() => {
        cleanup();
        process.chdir(originalCwd);
    });
    afterEach(() => {
        process.chdir(originalCwd);
        cleanup();
    });

    it('passes when all criteria met', () => {
        setup();
        process.chdir(TEST_DIR);

        const result = promoteExecute(CONFIG_PATH, REPORT_PATH, true);

        expect(result.allPassed).toBe(true);
        expect(result.promoted).toBe(true);
        expect(result.criteria.every((c) => c.passed)).toBe(true);
    });

    it('blocks when unresolved questions exist', () => {
        setup({ unresolvedQuestions: true });
        process.chdir(TEST_DIR);

        const result = promoteExecute(CONFIG_PATH, REPORT_PATH, true);

        expect(result.allPassed).toBe(false);
        expect(result.promoted).toBe(false);
        const qCriterion = result.criteria.find((c) => c.name.includes('unresolved'));
        expect(qCriterion?.passed).toBe(false);
    });

    it('blocks when --confirm flag missing', () => {
        setup();
        process.chdir(TEST_DIR);

        const result = promoteExecute(CONFIG_PATH, REPORT_PATH, false);

        expect(result.allPassed).toBe(false);
        const confirmCriterion = result.criteria.find((c) => c.name.includes('--confirm'));
        expect(confirmCriterion?.passed).toBe(false);
    });

    it('blocks when critical hypothesis has low confidence', () => {
        setup({ criticalLowConfidence: true });
        process.chdir(TEST_DIR);

        const result = promoteExecute(CONFIG_PATH, REPORT_PATH, true);

        expect(result.allPassed).toBe(false);
        const hypCriterion = result.criteria.find((c) => c.name.includes('confidence'));
        expect(hypCriterion?.passed).toBe(false);
    });

    it('blocks when no verified DEV-ENV command is found', () => {
        setup({ hasVerifiedDevEnv: false });
        process.chdir(TEST_DIR);

        const result = promoteExecute(CONFIG_PATH, REPORT_PATH, true);

        expect(result.allPassed).toBe(false);
        const devCriterion = result.criteria.find((c) => c.name.includes('DEV-ENV'));
        expect(devCriterion?.passed).toBe(false);
    });

    it('blocks when OPEN_QUESTIONS.md still has unresolved items', () => {
        setup({ openQuestionsFileUnresolved: true });
        process.chdir(TEST_DIR);

        const result = promoteExecute(CONFIG_PATH, REPORT_PATH, true);

        expect(result.allPassed).toBe(false);
        const questionCriterion = result.criteria.find((c) => c.name.includes('open questions'));
        expect(questionCriterion?.passed).toBe(false);
    });

    it('transitions state to OPERATIONAL on success', () => {
        setup();
        process.chdir(TEST_DIR);

        promoteExecute(CONFIG_PATH, REPORT_PATH, true);

        const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
        expect(raw.state).toBe('OPERATIONAL');
    });

    it('does NOT transition state on failure', () => {
        setup({ unresolvedQuestions: true });
        process.chdir(TEST_DIR);

        promoteExecute(CONFIG_PATH, REPORT_PATH, true);

        const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
        expect(raw.state).toBe('MIGRATING');
    });

    it('handles missing report file', () => {
        setup();
        process.chdir(TEST_DIR);
        rmSync(REPORT_PATH); // Remove report

        const result = promoteExecute(CONFIG_PATH, REPORT_PATH, true);

        expect(result.allPassed).toBe(false);
    });

    it('returns 4 criteria', () => {
        setup();
        process.chdir(TEST_DIR);

        const result = promoteExecute(CONFIG_PATH, REPORT_PATH, true);

        expect(result.criteria.length).toBe(4);
    });
});
