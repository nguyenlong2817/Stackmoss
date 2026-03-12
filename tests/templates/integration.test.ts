/**
 * Tests: Template Engine integration (end-to-end)
 * Authority: template-engine skill, BRD §8.4
 */

import { describe, it, expect } from 'vitest';
import { generateAllFiles } from '../../src/templates/index.js';
import { createSampleInput, createSampleIntake } from './helpers.js';

describe('Template Engine: generateAllFiles', () => {
    it('generates core files + eval harness (no skipped questions)', () => {
        const input = createSampleInput();
        const files = generateAllFiles(input);

        const paths = files.map((f) => f.path);
        expect(paths).toContain('stackmoss.config.json');
        expect(paths).toContain('team.md');
        expect(paths).toContain('FEATURES.md');
        expect(paths).toContain('NORTH_STAR.md');
        expect(paths).toContain('NON_GOALS.md');
        expect(paths).toContain('README_AGENT_TEAM.md');
        expect(paths).not.toContain('OPEN_QUESTIONS.md');
        // Eval harness
        expect(paths).toContain('evals/rubric.md');
        expect(paths.some((p) => p.startsWith('evals/cases/'))).toBe(true);
        expect(paths.some((p) => p.startsWith('evals/expected/'))).toBe(true);
    });

    it('generates extra OPEN_QUESTIONS when there are skipped questions', () => {
        const input = createSampleInput({
            intake: createSampleIntake({
                skippedQuestions: ['Q3'],
            }),
        });
        const files = generateAllFiles(input);

        const paths = files.map((f) => f.path);
        expect(paths).toContain('OPEN_QUESTIONS.md');
        // 6 core + 1 OPEN_QUESTIONS + 11 evals (MVP) + 2 calibration = 20
        expect(files.length).toBe(20);
    });

    it('all files have non-empty content', () => {
        const files = generateAllFiles(createSampleInput());

        for (const file of files) {
            expect(file.content.length).toBeGreaterThan(0);
        }
    });

    it('generates correct total files (6 core + 11 evals + 2 calibration = 19 without skips)', () => {
        const files = generateAllFiles(createSampleInput());

        expect(files).toHaveLength(19);
    });

    it('config file contains valid JSON', () => {
        const files = generateAllFiles(createSampleInput());
        const configFile = files.find((f) => f.path === 'stackmoss.config.json')!;

        expect(() => JSON.parse(configFile.content)).not.toThrow();
    });

    it('team.md contains all required sections', () => {
        const files = generateAllFiles(createSampleInput());
        const teamFile = files.find((f) => f.path === 'team.md')!;

        expect(teamFile.content).toContain('CONSTITUTION');
        expect(teamFile.content).toContain('ROLES');
        expect(teamFile.content).toContain('WORKING CONTRACT');
        expect(teamFile.content).toContain('PROJECT_FACTS');
    });

    it('FEATURES.md has F1 with appetite', () => {
        const files = generateAllFiles(createSampleInput());
        const featuresFile = files.find((f) => f.path === 'FEATURES.md')!;

        expect(featuresFile.content).toContain('appetite: S');
        expect(featuresFile.content).toContain('Tạo landing page');
    });
});
