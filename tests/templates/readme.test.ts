/**
 * Tests: README_AGENT_TEAM.md template
 * Authority: BRD §9.6
 */

import { describe, it, expect } from 'vitest';
import { generateReadme } from '../../src/templates/readme.js';
import { createSampleInput } from './helpers.js';

describe('Template: README_AGENT_TEAM.md', () => {
    it('generates README_AGENT_TEAM.md file', () => {
        const result = generateReadme(createSampleInput());

        expect(result.path).toBe('README_AGENT_TEAM.md');
    });

    it('includes project name', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('test-project');
    });

    it('is readable by non-tech users (has Vietnamese instructions)', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('Bắt đầu nhanh');
        expect(result.content).toContain('Bước 1');
        expect(result.content).toContain('Bước 2');
        expect(result.content).toContain('Bước 3');
        expect(result.content).toContain('Bước 4');
    });

    it('references team.md', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('team.md');
    });

    it('references FEATURES.md', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('FEATURES.md');
    });

    it('includes file reference table', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('stackmoss.config.json');
        expect(result.content).toContain('NORTH_STAR.md');
        expect(result.content).toContain('NON_GOALS.md');
    });

    it('tells the user to lock BRD and calibrate via Tech Lead first', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('Khóa BRD / North Star');
        expect(result.content).toContain('calibrate lại agent team');
        expect(result.content).toContain('Calibration status: bootstrap');
        expect(result.content).toContain('Chỉ Tech Lead được chuẩn bị patch cho config chung');
    });
});
