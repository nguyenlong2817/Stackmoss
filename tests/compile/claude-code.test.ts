/**
 * Tests: Claude Code compile layer
 * Authority: BRD §15
 */

import { describe, it, expect } from 'vitest';
import { compileClaudeCode, roleToSlug } from '../../src/compile/claude-code.js';

describe('Compile: Claude Code', () => {
    it('generates 1 file per role', () => {
        const roles = ['TL', 'DEV', 'QA'];
        const result = compileClaudeCode(roles, [], 'test-project');

        expect(result).toHaveLength(3);
    });

    it('generates files in .claude/skills/ path', () => {
        const roles = ['TL', 'DEV'];
        const result = compileClaudeCode(roles, [], 'test-project');

        for (const file of result) {
            expect(file.path).toMatch(/^\.claude\/skills\/.+\.skill\.md$/);
        }
    });

    it('uses lowercase role slug for filename', () => {
        const roles = ['TL', 'BA', 'DEV'];
        const result = compileClaudeCode(roles, [], 'test-project');

        const paths = result.map((f) => f.path);
        expect(paths).toContain('.claude/skills/tl.skill.md');
        expect(paths).toContain('.claude/skills/ba.skill.md');
        expect(paths).toContain('.claude/skills/dev.skill.md');
    });

    it('handles qualified roles (e.g. QA(light))', () => {
        const roles = ['QA(light)', 'TL(guide)'];
        const result = compileClaudeCode(roles, [], 'test-project');

        const paths = result.map((f) => f.path);
        expect(paths).toContain('.claude/skills/qa.skill.md');
        expect(paths).toContain('.claude/skills/tl.skill.md');
    });

    it('includes capabilities in skill files', () => {
        const roles = ['TL'];
        const result = compileClaudeCode(roles, [], 'test-project');

        expect(result[0].content).toContain('TL-ARCH');
        expect(result[0].content).toContain('TL-REVIEW');
        expect(result[0].content).toContain('220 words');
    });

    it('includes auto-added roles', () => {
        const roles = ['TL', 'DEV'];
        const result = compileClaudeCode(roles, ['SEC-lite'], 'test-project');

        const paths = result.map((f) => f.path);
        expect(paths).toContain('.claude/skills/sec.skill.md');
    });

    it('deduplicates roles by base ID', () => {
        const roles = ['QA(light)'];
        const result = compileClaudeCode(roles, ['QA'], 'test-project');

        const qaPaths = result.filter((f) => f.path.includes('qa'));
        expect(qaPaths).toHaveLength(1);
    });

    it('includes project name in skill content', () => {
        const result = compileClaudeCode(['DEV'], [], 'my-app');

        expect(result[0].content).toContain('my-app');
    });
});

describe('roleToSlug', () => {
    it('converts simple roles', () => {
        expect(roleToSlug('TL')).toBe('tl');
        expect(roleToSlug('DEV')).toBe('dev');
        expect(roleToSlug('QA')).toBe('qa');
    });

    it('strips qualifiers', () => {
        expect(roleToSlug('QA(light)')).toBe('qa');
        expect(roleToSlug('TL(guide)')).toBe('tl');
    });
});
