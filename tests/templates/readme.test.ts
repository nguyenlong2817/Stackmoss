import { describe, expect, it } from 'vitest';
import { generateReadme } from '../../src/templates/readme.js';
import { createSampleInput, createSampleIntake } from './helpers.js';

describe('Template: README_AGENT_TEAM.md', () => {
    it('generates README_AGENT_TEAM.md file', () => {
        const result = generateReadme(createSampleInput());
        expect(result.path).toBe('README_AGENT_TEAM.md');
    });

    it('includes project name', () => {
        const result = generateReadme(createSampleInput());
        expect(result.content).toContain('test-project');
    });

    it('renders an English playbook by default', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('Operating flow');
        expect(result.content).toContain('Step 1 - Check BRD status');
        expect(result.content).toContain('Step 2 - Chat with Tech Lead first');
        expect(result.content).toContain('stackmoss eval smoke');
    });

    it('renders a Vietnamese playbook when intake language is vi', () => {
        const result = generateReadme(createSampleInput({
            intake: createSampleIntake({ language: 'vi' }),
        }));

        expect(result.content).toContain('Quy trinh dung');
        expect(result.content).toContain('Buoc 1 - Kiem tra BRD');
        expect(result.content).toContain('Buoc 2 - Chat voi Tech Lead truoc');
        expect(result.content).toContain('stackmoss eval smoke');
    });

    it('references core StackMoss files', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('team.md');
        expect(result.content).toContain('FEATURES.md');
        expect(result.content).toContain('NORTH_STAR.md');
        expect(result.content).toContain('ROLE_SKILL_OVERRIDES.md');
        expect(result.content).toContain('README_AGENT_TEAM.md');
        expect(result.content).toContain('CALIBRATE.md');
    });

    it('documents bootstrap outputs for each supported runtime', () => {
        const result = generateReadme(createSampleInput());

        expect(result.content).toContain('CLAUDE.md');
        expect(result.content).toContain('.claude/skills/<skill-name>/SKILL.md');
        expect(result.content).toContain('AGENTS.md');
        expect(result.content).toContain('.agents/skills/<skill-name>/SKILL.md');
        expect(result.content).toContain('.agent/rules/*.md');
        expect(result.content).toContain('.agent/workflows/*.md');
    });
});
