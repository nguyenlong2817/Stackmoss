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

    it('is readable by non-tech users', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('Bat dau nhanh');
        expect(result.content).toContain('Buoc 1');
        expect(result.content).toContain('Buoc 2');
        expect(result.content).toContain('Buoc 3');
        expect(result.content).toContain('Buoc 4');
    });

    it('references core StackMoss files', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('team.md');
        expect(result.content).toContain('FEATURES.md');
        expect(result.content).toContain('stackmoss.config.json');
        expect(result.content).toContain('NORTH_STAR.md');
        expect(result.content).toContain('NON_GOALS.md');
    });

    it('documents bootstrap outputs for each supported runtime', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('CLAUDE.md');
        expect(result.content).toContain('.claude/skills/<skill-name>/SKILL.md');
        expect(result.content).toContain('.cursor/skills/<skill-name>/SKILL.md');
        expect(result.content).toContain('AGENTS.md');
        expect(result.content).toContain('.agent/rules/*.md');
        expect(result.content).toContain('.agent/workflows/*.md');
    });

    it('tells the user to lock BRD and calibrate via Tech Lead first', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('Khoa BRD / North Star');
        expect(result.content).toContain('calibrate lai agent team');
        expect(result.content).toContain('hoi tiep bat ky cau hoi can thiet');
        expect(result.content).toContain('Calibration status: bootstrap');
        expect(result.content).toContain('Chi Tech Lead duoc chuan bi patch cho config chung');
        expect(result.content).toContain('giu dung cau truc bootstrap cua runtime ban dang dung');
    });
});
