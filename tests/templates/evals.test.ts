/**
 * Tests: Eval Harness Output (F14)
 */

import { describe, it, expect } from 'vitest';
import { generateRubric, generateCases, generateExpected, generateEvals } from '../../src/templates/evals.js';
import type { TemplateInput } from '../../src/templates/types.js';
import type { IntakeResult } from '../../src/intake/types.js';

function makeInput(overrides?: Partial<IntakeResult>): TemplateInput {
    const intake: IntakeResult = {
        mode: 'fast',
        language: 'en',
        answers: {},
        skippedQuestions: [],
        persona: 'DevLed',
        projectType: 'Production',
        roles: ['TL(guide)', 'DEV', 'QA(light)'],
        autoAddedRoles: ['SEC-lite'],
        firstFeature: { name: 'Auth', appetite: 'S' },
        ...overrides,
    };
    return { projectName: 'test-project', version: '0.4.0', intake };
}

describe('Eval Harness Output', () => {
    describe('generateRubric', () => {
        it('generates evals/rubric.md', () => {
            const file = generateRubric(makeInput());
            expect(file.path).toBe('evals/rubric.md');
        });

        it('includes project name in header', () => {
            const file = generateRubric(makeInput());
            expect(file.content).toContain('# Eval Rubric — test-project');
        });

        it('includes CONSTITUTION rules table', () => {
            const file = generateRubric(makeInput());
            expect(file.content).toContain('R1');
            expect(file.content).toContain('No silent assumptions');
            expect(file.content).toContain('Replace-only patches');
            expect(file.content).toContain('Budget discipline');
        });

        it('includes capability budget table', () => {
            const file = generateRubric(makeInput());
            expect(file.content).toContain('TL-ARCH');
            expect(file.content).toContain('DEV-IMPL');
            expect(file.content).toContain('words');
        });

        it('includes quality criteria', () => {
            const file = generateRubric(makeInput());
            expect(file.content).toContain('Q1');
            expect(file.content).toContain('Code compiles');
            expect(file.content).toContain('Tests pass');
        });

        it('includes project-specific section for user extension', () => {
            const file = generateRubric(makeInput());
            expect(file.content).toContain('Project-Specific Criteria');
        });
    });

    describe('generateCases', () => {
        it('generates case files in evals/cases/', () => {
            const files = generateCases(makeInput());
            for (const file of files) {
                expect(file.path).toMatch(/^evals\/cases\/case-\d+-.+\.md$/);
            }
        });

        it('includes core cases (feature impl, review, no-assumption, patch)', () => {
            const files = generateCases(makeInput());
            const ids = files.map((f) => f.path);
            expect(ids).toContain('evals/cases/case-01-feature-impl.md');
            expect(ids).toContain('evals/cases/case-02-code-review.md');
            expect(ids).toContain('evals/cases/case-03-no-assumption.md');
            expect(ids).toContain('evals/cases/case-04-patch-budget.md');
        });

        it('includes Production-specific case', () => {
            const files = generateCases(makeInput({ projectType: 'Production' }));
            const ids = files.map((f) => f.path);
            expect(ids).toContain('evals/cases/case-05-breaking-change.md');
        });

        it('includes MVP-specific case', () => {
            const files = generateCases(makeInput({ projectType: 'MVP' }));
            const ids = files.map((f) => f.path);
            expect(ids).toContain('evals/cases/case-05-speed-vs-quality.md');
        });

        it('case files include focus criteria', () => {
            const files = generateCases(makeInput());
            const featureCase = files.find((f) => f.path.includes('case-01'));
            expect(featureCase!.content).toContain('Focus Criteria');
            expect(featureCase!.content).toContain('no scope creep');
        });
    });

    describe('generateExpected', () => {
        it('generates expected files matching cases', () => {
            const cases = generateCases(makeInput());
            const expected = generateExpected(makeInput());
            expect(expected.length).toBe(cases.length);
        });

        it('expected files are in evals/expected/', () => {
            const files = generateExpected(makeInput());
            for (const file of files) {
                expect(file.path).toMatch(/^evals\/expected\/case-\d+-.+\.md$/);
            }
        });

        it('includes expected patterns and anti-patterns', () => {
            const files = generateExpected(makeInput());
            const noAssumption = files.find((f) => f.path.includes('case-03'));
            expect(noAssumption!.content).toContain('Expected Pattern');
            expect(noAssumption!.content).toContain('Anti-patterns');
            expect(noAssumption!.content).toContain('clarifying questions');
        });
    });

    describe('generateEvals (combined)', () => {
        it('returns rubric + cases + expected', () => {
            const files = generateEvals(makeInput());
            const paths = files.map((f) => f.path);

            expect(paths).toContain('evals/rubric.md');
            expect(paths.some((p) => p.startsWith('evals/cases/'))).toBe(true);
            expect(paths.some((p) => p.startsWith('evals/expected/'))).toBe(true);
        });

        it('for Production: 1 rubric + 5 cases + 5 expected = 11 files', () => {
            const files = generateEvals(makeInput({ projectType: 'Production' }));
            expect(files.length).toBe(11); // 1 + 5 + 5
        });

        it('for MVP: 1 rubric + 5 cases + 5 expected = 11 files', () => {
            const files = generateEvals(makeInput({ projectType: 'MVP' }));
            expect(files.length).toBe(11);
        });

        it('for InternalTool: 1 rubric + 4 cases + 4 expected = 9 files', () => {
            const files = generateEvals(makeInput({ projectType: 'InternalTool' }));
            expect(files.length).toBe(9); // no project-type-specific case
        });
    });
});
