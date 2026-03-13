/**
 * Tests: Antigravity Compile Target (atomic capability split)
 * Authority: BRD §15.1
 */

import { describe, it, expect } from 'vitest';
import { compileAntigravity, capabilityToSlug } from '../../src/compile/antigravity.js';

describe('Antigravity Compile Target', () => {
    describe('capabilityToSlug', () => {
        it('converts TL-ARCH to tech-lead--arch', () => {
            expect(capabilityToSlug('TL-ARCH')).toBe('tech-lead--arch');
        });

        it('converts DEV-IMPL to developer--impl', () => {
            expect(capabilityToSlug('DEV-IMPL')).toBe('developer--impl');
        });

        it('converts QA-TEST to quality-assurance--test', () => {
            expect(capabilityToSlug('QA-TEST')).toBe('quality-assurance--test');
        });

        it('converts SEC-SCAN to security--scan', () => {
            expect(capabilityToSlug('SEC-SCAN')).toBe('security--scan');
        });
    });

    describe('compileAntigravity', () => {
        it('creates one SKILL.md per capability', () => {
            const files = compileAntigravity(['TL(guide)'], [], 'test-project');

            // TL has 4 capabilities: ARCH, REVIEW, CONTEXT, PLAN
            expect(files.length).toBe(4);
        });

        it('outputs to .agents/skills/<slug>/SKILL.md', () => {
            const files = compileAntigravity(['DEV'], [], 'test-project');

            for (const file of files) {
                expect(file.path).toMatch(/^\.agents\/skills\/.+\/SKILL\.md$/);
            }
        });

        it('generates correct folder names per BRD §15.1', () => {
            const files = compileAntigravity(['TL(guide)'], [], 'test-project');
            const paths = files.map((f) => f.path);

            expect(paths).toContain('.agents/skills/tech-lead--arch/SKILL.md');
            expect(paths).toContain('.agents/skills/tech-lead--review/SKILL.md');
            expect(paths).toContain('.agents/skills/tech-lead--context/SKILL.md');
            expect(paths).toContain('.agents/skills/tech-lead--plan/SKILL.md');
        });

        it('includes YAML frontmatter with name and description', () => {
            const files = compileAntigravity(['DEV'], [], 'test-project');
            const implSkill = files.find((f) => f.path.includes('developer--impl'));

            expect(implSkill!.content).toContain('---');
            expect(implSkill!.content).toContain('name: developer--impl');
            expect(implSkill!.content).toContain('description:');
        });

        it('includes budget in skill content', () => {
            const files = compileAntigravity(['TL(guide)'], [], 'test-project');
            const archSkill = files.find((f) => f.path.includes('tech-lead--arch'));

            expect(archSkill!.content).toContain('280 words');
        });

        it('deduplicates roles', () => {
            const files = compileAntigravity(['DEV', 'DEV'], ['DEV'], 'test-project');
            // DEV has 3 capabilities: IMPL, ENV, DEBUG
            expect(files.length).toBe(3);
        });

        it('handles multiple roles', () => {
            const files = compileAntigravity(['TL(guide)', 'DEV'], [], 'test-project');
            // TL=4 + DEV=3 = 7
            expect(files.length).toBe(7);
        });

        it('handles auto-added roles', () => {
            const files = compileAntigravity([], ['SEC-lite'], 'test-project');
            // SEC has 1 capability: SCAN
            expect(files.length).toBe(1);
            expect(files[0].path).toContain('security--scan');
        });

        it('keeps QA(light) variant from emitting regression skill', () => {
            const files = compileAntigravity(['QA(light)'], [], 'test-project');
            const paths = files.map((file) => file.path);

            expect(paths).toContain('.agents/skills/quality-assurance--test/SKILL.md');
            expect(paths).not.toContain('.agents/skills/quality-assurance--regression/SKILL.md');
        });

        it('handles unknown roles with fallback', () => {
            const files = compileAntigravity(['CUSTOM'], [], 'test-project');
            expect(files.length).toBe(1);
            expect(files[0].path).toContain('.agents/skills/custom/SKILL.md');
        });
    });
});
