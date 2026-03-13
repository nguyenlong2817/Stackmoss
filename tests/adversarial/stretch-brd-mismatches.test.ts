/**
 * STRETCH QA — Adversarial BRD mismatch tests
 *
 * Intentionally asserts BRD-required behavior.
 * These tests are expected to fail on current implementation and act as bug proofs.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execute as checkExecute } from '../../src/commands/check.js';
import { execute as promoteExecute } from '../../src/commands/promote.js';
import { resolveAlias, isAliasSafe } from '../../src/commands/run.js';
import { parseArgs as parseNewArgs } from '../../src/commands/new.js';
import { generateConfig } from '../../src/templates/config.js';
import { generateTeam } from '../../src/templates/team.js';
import { renderMigrationReport } from '../../src/scanner/report.js';
import { parseMigrationReport } from '../../src/scanner/report.js';
import { getProjectType } from '../../src/intake/pack-selector.js';
import { compileTarget } from '../../src/compile/index.js';
import { compileCursor } from '../../src/compile/cursor.js';
import { createProposal, applyProposal } from '../../src/patch/engine.js';
import { createSampleInput } from '../templates/helpers.js';
import type { ScanResult } from '../../src/scanner/types.js';

const ROOT = join(process.cwd(), '__stretch_adversarial__');
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

function writeCoreFiles(projectDir: string, teamContent: string): void {
    writeFileSync(join(projectDir, 'team.md'), teamContent, 'utf-8');
    writeFileSync(join(projectDir, 'FEATURES.md'), '# FEATURES\n', 'utf-8');
    writeFileSync(join(projectDir, 'NORTH_STAR.md'), '# NORTH_STAR\n', 'utf-8');
}

const externalArtifacts: string[] = [];

describe('STRETCH BRD mismatch proofs (expected failing tests)', () => {
    beforeEach(() => {
        cleanupRoot();
        process.chdir(originalCwd);
    });

    afterEach(() => {
        for (const p of externalArtifacts.splice(0)) {
            try {
                rmSync(p, { force: true });
            } catch {
                // best effort cleanup
            }
        }
        process.chdir(originalCwd);
        cleanupRoot();
    });

    it('B-001: check should not report structure_invalid on freshly generated stackmoss.config.json', () => {
        const dir = makeCaseDir('b001');

        // Real generated config (from template engine)
        const generatedConfig = generateConfig(createSampleInput()).content;
        writeFileSync(join(dir, 'stackmoss.config.json'), generatedConfig, 'utf-8');

        writeCoreFiles(dir, `# Team\n## CONSTITUTION\nA\n## ROLES\nA\n## WORKING CONTRACT\nA\n## PROJECT_FACTS\nA\n`);

        const result = checkExecute(dir);

        // BRD expectation: generated config is valid and should not trigger missing required fields
        expect(result.issues.filter((i) => i.category === 'structure_invalid')).toHaveLength(0);
        expect(result.allClear).toBe(true);
    });

    it('B-002: check should not over-count capability budget from unrelated sections', () => {
        const dir = makeCaseDir('b002');

        writeFileSync(
            join(dir, 'stackmoss.config.json'),
            JSON.stringify({ schemaVersion: '1.0', state: 'OPERATIONAL', projectName: 'demo' }, null, 2),
            'utf-8',
        );

        const longProjectFacts = Array.from({ length: 360 }, (_, i) => `noise${i}`).join(' ');
        const team = `# Team\n## CONSTITUTION\nA\n## ROLES\n- [TL-ARCH] tiny\n## WORKING CONTRACT\nA\n## PROJECT_FACTS\n${longProjectFacts}\n`;
        writeCoreFiles(dir, team);

        const result = checkExecute(dir);

        // BRD expectation: [TL-ARCH] content is tiny; unrelated PROJECT_FACTS text must not inflate its budget.
        expect(result.issues.filter((i) => i.category === 'budget_exceeded')).toHaveLength(0);
    });

    it('B-003: run alias resolution should parse [DEV-ENV] aliases in team.md', () => {
        const dir = makeCaseDir('b003');

        writeFileSync(
            join(dir, 'team.md'),
            `# Team\n## PROJECT_FACTS\n[DEV-ENV]\ntest: \`npm test\`\n`,
            'utf-8',
        );

        const resolved = resolveAlias(dir, 'test');

        // BRD expectation: stackmoss run <alias> resolves alias from [DEV-ENV] when package scripts are not present.
        expect(resolved).toBe('npm test');
    });

    it('B-004: promote must fail criterion #2 if no [DEV-ENV] command was verified', () => {
        const dir = makeCaseDir('b004');
        const configPath = join(dir, 'stackmoss.config.json');
        const reportPath = join(dir, 'MIGRATION_REPORT.md');

        writeFileSync(
            configPath,
            JSON.stringify({ schemaVersion: '1.0', state: 'MIGRATING', projectName: 'demo', createdAt: '2026-01-01T00:00:00Z' }, null, 2),
            'utf-8',
        );

        const scanResult: ScanResult = {
            facts: [{ category: 'Package Manager', value: 'npm', source: 'package-lock.json' }],
            hypotheses: [{ category: 'Monorepo', value: 'NO', confidence: 90, source: 'repo root', critical: true }],
            openQuestions: [{ id: 'OQ1', text: 'Deploy target?', impact: 'OPS', resolved: true, answer: 'Vercel' }],
        };
        writeFileSync(reportPath, renderMigrationReport('demo', scanResult), 'utf-8');

        // Has scripts, but no [DEV-ENV] verification source.
        writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'demo', scripts: { dev: 'vite' } }, null, 2), 'utf-8');

        process.chdir(dir);
        const result = promoteExecute(configPath, reportPath, true);
        const devEnvCriterion = result.criteria.find((c) => c.name.includes('DEV-ENV'));

        // BRD expectation: criterion #2 is specifically [DEV-ENV] verification, not generic package scripts existence.
        expect(devEnvCriterion?.passed).toBe(false);
        expect(result.promoted).toBe(false);
    });

    it('B-005: missing Q_PT should be treated as unresolved critical input (no silent default)', () => {
        // BRD principle: no silent assumptions for critical decisions.
        expect(() => getProjectType({})).toThrow();
    });

    it('B-006: team template should emit BRD default budget for TL-ARCH (220), not inflated max budget', () => {
        const team = generateTeam(createSampleInput()).content;

        // BRD §12.4 default table: TL-ARCH default = 220 words.
        expect(team).toContain('- [TL-ARCH] Architecture decisions & ADR\n  budget: 220');
    });

    it('B-007: compile target should support Roo role-level output per BRD target map', () => {
        expect(() => compileTarget('Roo' as never, ['DEV'], [], 'demo')).not.toThrow();
    });

    it('B-008: parser should count unresolved items only inside OPEN QUESTIONS section', () => {
        const report = `# Migration Report — demo\n\n## FACTS (confidence: high)\n- [ ] **[NOT_A_QUESTION]** checklist in facts\n\n## OPEN QUESTIONS (cần human confirm trước khi promote)\n_No open questions — all clear for promote._\n`;

        const parsed = parseMigrationReport(report);

        // BRD intent: only OPEN QUESTIONS should gate promote.
        expect(parsed.unresolvedCount).toBe(0);
        expect(parsed.hasUnresolvedQuestions).toBe(false);
    });

    it('B-009: alias safety should reject newline/redirection command injection patterns', () => {
        // Safety expectation: shell metacharacter injection vectors should be blocked.
        expect(isAliasSafe('npm test\nwhoami')).toBe(false);
        expect(isAliasSafe('npm test > out.txt')).toBe(false);
    });

    it('B-010: patch apply should block absolute path escape outside project root', () => {
        const dir = makeCaseDir('b010');
        const external = join('C:/Users/longl/AppData/Local/Temp', `stackmoss-escape-${Date.now()}.txt`);
        externalArtifacts.push(external);

        writeFileSync(external, 'outside old', 'utf-8');

        const proposal = createProposal(
            dir,
            'check_fail',
            'security-test',
            'n/a',
            {
                targetFile: external,
                section: '[DEV-ENV]',
                oldContent: 'outside old',
                newContent: 'outside new',
            },
        );

        const applied = applyProposal(dir, proposal.id);

        expect(applied.success).toBe(false);
        expect(applied.detail.toLowerCase()).toContain('path traversal');
    });

    it('B-011: new command should reject dangerous Windows reserved names', () => {
        expect(() => parseNewArgs('CON')).toThrow();
        expect(() => parseNewArgs('NUL')).toThrow();
        expect(() => parseNewArgs('PRN')).toThrow();
    });

    it('B-012: Cursor always-on rules should contain real extracted content, not placeholders', () => {
        const files = compileCursor(['TL'], [], 'demo');
        const constitution = files.find((f) => f.path === '.cursor/rules/constitution.mdc');

        expect(constitution).toBeDefined();
        expect(constitution!.content).not.toContain('_Section from team.md. Synced by StackMoss._');
    });

    it('B-013: generated config target should match BRD base target name ClaudeCode', () => {
        const cfg = JSON.parse(generateConfig(createSampleInput()).content) as { targets: string[] };
        expect(cfg.targets).toEqual(['ClaudeCode']);
    });
});

