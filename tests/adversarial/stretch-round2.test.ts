/**
 * STRETCH QA - Round 2 adversarial proofs
 *
 * Intentionally asserts BRD-required behavior.
 * These tests are expected to fail on current implementation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs as parseNewArgs, checkState as checkNewState, execute as executeNew } from '../../src/commands/new.js';
import { runInterviewMode } from '../../src/intake/interview-mode.js';
import { generateTeam } from '../../src/templates/team.js';
import { compileAntigravity } from '../../src/compile/antigravity.js';
import { generateFeatures } from '../../src/templates/features.js';
import { execute as promoteExecute } from '../../src/commands/promote.js';
import { renderMigrationReport } from '../../src/scanner/report.js';
import { replaceConstitution } from '../../src/commands/upgrade.js';
import { createSampleInput, createSampleIntake } from '../templates/helpers.js';
import type { ScanResult } from '../../src/scanner/types.js';

vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
}));

import { select, input } from '@inquirer/prompts';

const mockSelect = vi.mocked(select);
const mockInput = vi.mocked(input);

const ROOT = join(process.cwd(), '__stretch_round2__');
const originalCwd = process.cwd();
let caseCounter = 0;

function cleanupRoot(): void {
    if (existsSync(ROOT)) {
        rmSync(ROOT, { recursive: true, force: true });
    }
}

function makeCaseDir(name: string): string {
    const dir = join(ROOT, `${name}-${++caseCounter}`);
    mkdirSync(dir, { recursive: true });
    return dir;
}

describe('STRETCH round 2 mismatch proofs (expected failing tests)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cleanupRoot();
        process.chdir(originalCwd);
    });

    afterEach(() => {
        process.chdir(originalCwd);
        cleanupRoot();
    });

    it('B-014: new command should abort if target folder appears between checkState and execute (race window)', () => {
        mkdirSync(ROOT, { recursive: true });
        process.chdir(ROOT);

        const projectName = 'b014-race-project';
        const args = parseNewArgs(projectName);

        checkNewState(args);

        // Simulate a concurrent process creating the same folder after checkState passed.
        mkdirSync(projectName, { recursive: true });

        // BRD Appendix A / AC #11: existing folder must abort and never silently reuse.
        expect(() => executeNew(args)).toThrow();
    });

    it('B-015: interview completeness gate should request follow-up when non-goal is missing', async () => {
        mockSelect
            .mockResolvedValueOnce('BizLed')      // Q1
            .mockResolvedValueOnce('enterprise')  // Q2
            .mockResolvedValueOnce('global')      // Q3
            .mockResolvedValueOnce('subscription') // Q4
            .mockResolvedValueOnce('web')         // Q5
            .mockResolvedValueOnce('none')        // Q6
            .mockResolvedValueOnce('cloud')       // Q7
            .mockResolvedValueOnce('balanced')    // Q8
            .mockResolvedValueOnce('small_team')  // Q9
            .mockResolvedValueOnce('both')        // Q10
            .mockResolvedValueOnce('db')          // Q11
            .mockResolvedValueOnce('M')           // Q12b
            .mockResolvedValueOnce('MVP')         // Q_PT
            .mockResolvedValueOnce('fallback');   // extra follow-up slot if gate asks

        mockInput
            .mockResolvedValueOnce('Ship dashboard') // Q12
            .mockResolvedValueOnce('fallback follow-up');

        await runInterviewMode();

        // BRD 8.3: completeness gate must check "for who", measurable outcome, and >=1 non-goal.
        // With no non-goal question in base flow, gate should trigger at least one targeted follow-up.
        const totalPrompts = mockSelect.mock.calls.length + mockInput.mock.calls.length;
        expect(totalPrompts).toBeGreaterThan(14);
    });

    it('B-016: team template should honor QA(light) variant and exclude QA-REGRESSION capability', () => {
        const team = generateTeam(
            createSampleInput({
                intake: createSampleIntake({
                    roles: ['QA(light)'],
                    autoAddedRoles: [],
                }),
            }),
        ).content;

        // BRD 10.2 distinguishes QA(light) vs QA(strong).
        expect(team).not.toContain('[QA-REGRESSION]');
    });

    it('B-017: antigravity compile should not emit regression skill for QA(light)', () => {
        const files = compileAntigravity(['QA(light)'], [], 'demo');
        const paths = files.map((f) => f.path);

        // BRD 10.2: QA(light) is a lighter variant than QA(strong).
        expect(paths).not.toContain('.agents/skills/quality-assurance--regression/SKILL.md');
    });

    it('B-018: feature template should prevent markdown header injection from intake answer', () => {
        const injectedName = 'Initial setup\n## PROJECT_FACTS\n- injected section';
        const content = generateFeatures(
            createSampleInput({
                intake: createSampleIntake({
                    firstFeature: { name: injectedName, appetite: 'S' },
                }),
            }),
        ).content;

        // BRD 9.3 schema: FEATURES.md should contain one F1 section, not arbitrary injected sections.
        const h2Headers = content.match(/^## /gm) ?? [];
        expect(h2Headers).toHaveLength(1);
    });

    it('B-019: promote should block when OPEN_QUESTIONS.md still has unresolved items', () => {
        const dir = makeCaseDir('b019');
        const configPath = join(dir, 'stackmoss.config.json');
        const reportPath = join(dir, 'MIGRATION_REPORT.md');

        writeFileSync(
            configPath,
            JSON.stringify({
                schemaVersion: '1.0',
                state: 'MIGRATING',
                projectName: 'demo',
                createdAt: '2026-01-01T00:00:00Z',
            }, null, 2),
            'utf-8',
        );

        const cleanReport: ScanResult = {
            facts: [{ category: 'Package Manager', value: 'npm', source: 'package-lock.json' }],
            hypotheses: [{ category: 'Monorepo', value: 'NO', confidence: 90, source: 'repo root', critical: true }],
            openQuestions: [],
        };
        writeFileSync(reportPath, renderMigrationReport('demo', cleanReport), 'utf-8');
        writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'demo', scripts: { dev: 'vite' } }, null, 2), 'utf-8');

        // Ghost unresolved file from intake lifecycle.
        writeFileSync(
            join(dir, 'OPEN_QUESTIONS.md'),
            '# Open Questions\n\n## Chua duoc tra loi\n- [ ] Q3: Deploy target?\n',
            'utf-8',
        );

        process.chdir(dir);
        const result = promoteExecute(configPath, reportPath, true);
        const noUnresolvedCriterion = result.criteria.find((c) => c.name === 'No unresolved open questions');

        // BRD Appendix B: unresolved OPEN_QUESTIONS must block promote.
        expect(noUnresolvedCriterion?.passed).toBe(false);
        expect(result.promoted).toBe(false);
    });

    it('B-020: upgrade constitution replace should not mutate PROJECT_FACTS when team.md is hostile', () => {
        const hostileTeam = `# Team Config - hostile

## PROJECT_FACTS
- Keep this literal token: ## CONSTITUTION (do not treat as section header)
- Production path: /apps/api

## CONSTITUTION
Old constitution rules

## ROLES
### [DEV] Developer
`;

        const upgraded = replaceConstitution(
            hostileTeam,
            '## CONSTITUTION\nNew constitution rules\n',
        );

        // BRD 14 hard rule: upgrade must never overwrite PROJECT_FACTS.
        expect(upgraded).toContain('Keep this literal token: ## CONSTITUTION (do not treat as section header)');
        expect(upgraded).toContain('Production path: /apps/api');
    });
});
