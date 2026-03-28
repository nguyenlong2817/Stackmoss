/**
 * Tests: Claude Code compile layer
 */

import { describe, it, expect } from 'vitest';
import { compileClaudeCode, roleToSlug } from '../../src/compile/claude-code.js';

describe('Compile: Claude Code', () => {
    it('generates CLAUDE.md and runtime skill folders', () => {
        const result = compileClaudeCode(['PM', 'TL'], [], 'test-project');
        const paths = result.map((file) => file.path);

        expect(paths).toContain('CLAUDE.md');
        expect(paths).toContain('.claude/skills/skill-creator/SKILL.md');
        expect(paths).toContain('.claude/skills/product-manager/SKILL.md');
        expect(paths).toContain('.claude/skills/tech-lead/SKILL.md');
    });

    it('creates skill files under .claude/skills/<role>/SKILL.md', () => {
        const result = compileClaudeCode(['TL', 'DEV'], [], 'test-project');

        expect(result.some((file) => file.path === '.claude/skills/tech-lead/SKILL.md')).toBe(true);
        expect(result.some((file) => file.path === '.claude/skills/developer/SKILL.md')).toBe(true);
    });

    it('adds 3-9 support bundle for PM and TL skills', () => {
        const result = compileClaudeCode(['PM', 'TL'], [], 'test-project');
        const paths = result.map((file) => file.path);

        expect(paths).toContain('.claude/skills/product-manager/references/layer-map.md');
        expect(paths).toContain('.claude/skills/product-manager/data/research-cutoff.json');
        expect(paths).toContain('.claude/skills/tech-lead/scripts/validate-and-log.mjs');
        expect(paths).toContain('.claude/skills/tech-lead/data/validation-log.ndjson');
    });

    it('includes auto-added roles', () => {
        const result = compileClaudeCode(['TL', 'DEV'], ['SEC-lite'], 'test-project');
        const paths = result.map((file) => file.path);

        expect(paths).toContain('.claude/skills/security-auditor/SKILL.md');
    });

    it('deduplicates roles by base ID', () => {
        const result = compileClaudeCode(['QA(light)'], ['QA'], 'test-project');
        const qaPaths = result.filter((file) => file.path === '.claude/skills/quality-assurance/SKILL.md');

        expect(qaPaths).toHaveLength(1);
    });

    it('preserves QA(light) as test-only capability set', () => {
        const result = compileClaudeCode(['QA(light)'], [], 'my-app');
        const qaSkill = result.find((file) => file.path === '.claude/skills/quality-assurance/SKILL.md');

        expect(qaSkill?.content).toContain('QA-TEST');
        expect(qaSkill?.content).not.toContain('QA-REGRESSION');
    });

    it('includes project name in skill content', () => {
        const result = compileClaudeCode(['DEV'], [], 'my-app');
        const devSkill = result.find((file) => file.path === '.claude/skills/developer/SKILL.md');

        expect(devSkill?.content).toContain('my-app');
    });
});

describe('roleToSlug', () => {
    it('converts simple roles', () => {
        expect(roleToSlug('TL')).toBe('tech-lead');
        expect(roleToSlug('DEV')).toBe('developer');
        expect(roleToSlug('QA')).toBe('quality-assurance');
    });

    it('strips qualifiers', () => {
        expect(roleToSlug('QA(light)')).toBe('quality-assurance');
        expect(roleToSlug('TL(guide)')).toBe('tech-lead');
    });
});
