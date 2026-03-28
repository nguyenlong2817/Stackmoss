/**
 * Tests: Template Engine integration (end-to-end)
 * Authority: template-engine skill, BRD §8.4
 */

import { describe, expect, it } from 'vitest';
import { generateAllFiles } from '../../src/templates/index.js';
import { createSampleInput, createSampleIntake } from './helpers.js';

describe('Template Engine: generateAllFiles', () => {
    it('generates core files + eval harness (no skipped questions)', () => {
        const input = createSampleInput();
        const files = generateAllFiles(input);

        const paths = files.map((file) => file.path);
        expect(paths).toContain('stackmoss.config.json');
        expect(paths).toContain('team.md');
        expect(paths).toContain('FEATURES.md');
        expect(paths).toContain('NORTH_STAR.md');
        expect(paths).toContain('NON_GOALS.md');
        expect(paths).toContain('README_AGENT_TEAM.md');
        expect(paths).toContain('ROLE_SKILL_OVERRIDES.md');
        expect(paths).not.toContain('OPEN_QUESTIONS.md');
        expect(paths).toContain('evals/rubric.md');
        expect(paths.some((path) => path.startsWith('evals/cases/'))).toBe(true);
        expect(paths.some((path) => path.startsWith('evals/expected/'))).toBe(true);
    });

    it('generates extra OPEN_QUESTIONS when there are skipped questions', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                skippedQuestions: ['Q3'],
            }),
        });
        const files = generateAllFiles(input);

        const paths = files.map((file) => file.path);
        expect(paths).toContain('OPEN_QUESTIONS.md');
        expect(files.length).toBe(44);
    });

    it('all files have non-empty content', () => {
        const files = generateAllFiles(createSampleInput());

        for (const file of files) {
            expect(file.content.length).toBeGreaterThan(0);
        }
    });

    it('generates correct total files including code map and skill kit', () => {
        const files = generateAllFiles(createSampleInput());

        expect(files).toHaveLength(43);
        expect(files.some((file) => file.path === 'CODE_MAP.md')).toBe(true);
        expect(files.some((file) => file.path === '.stackmoss/skill-kit/ROLE_INDEX.md')).toBe(true);
    });

    it('config file contains valid JSON', () => {
        const files = generateAllFiles(createSampleInput());
        const configFile = files.find((file) => file.path === 'stackmoss.config.json')!;

        expect(() => JSON.parse(configFile.content)).not.toThrow();
    });

    it('team.md contains all required sections', () => {
        const files = generateAllFiles(createSampleInput());
        const teamFile = files.find((file) => file.path === 'team.md')!;

        expect(teamFile.content).toContain('CONSTITUTION');
        expect(teamFile.content).toContain('ROLES');
        expect(teamFile.content).toContain('WORKING CONTRACT');
        expect(teamFile.content).toContain('PROJECT_FACTS');
    });

    it('FEATURES.md uses the derived bootstrap F1', () => {
        const files = generateAllFiles(createSampleInput());
        const featuresFile = files.find((file) => file.path === 'FEATURES.md')!;

        expect(featuresFile.content).toContain('appetite: M');
        expect(featuresFile.content).toContain('Lock BRD with Tech Lead and BA');
    });
});
