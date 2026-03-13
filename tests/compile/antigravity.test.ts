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
    });

    it('creates one SKILL.md per capability plus shared rules/workflows', () => {
        const files = compileAntigravity(['TL(guide)'], [], 'test-project');
        expect(files.length).toBe(6);
    });

    it('outputs only .agent workspace paths', () => {
        const files = compileAntigravity(['DEV'], [], 'test-project');
        expect(files.every((file) => file.path.startsWith('.agent/'))).toBe(true);
    });

    it('generates shared rules and workflows', () => {
        const files = compileAntigravity(['DEV'], [], 'test-project');
        const paths = files.map((file) => file.path);

        expect(paths).toContain('.agent/rules/team-bootstrap.md');
        expect(paths).toContain('.agent/workflows/calibrate-team.md');
    });

    it('generates correct skill folder names per capability', () => {
        const files = compileAntigravity(['TL(guide)'], [], 'test-project');
        const paths = files.map((file) => file.path);

        expect(paths).toContain('.agent/skills/tech-lead--arch/SKILL.md');
        expect(paths).toContain('.agent/skills/tech-lead--review/SKILL.md');
        expect(paths).toContain('.agent/skills/tech-lead--context/SKILL.md');
        expect(paths).toContain('.agent/skills/tech-lead--plan/SKILL.md');
    });

    it('includes yaml frontmatter with name and description', () => {
        const files = compileAntigravity(['DEV'], [], 'test-project');
        const implSkill = files.find((file) => file.path === '.agent/skills/developer--impl/SKILL.md');

        expect(implSkill!.content).toContain('---');
        expect(implSkill!.content).toContain('name: developer--impl');
        expect(implSkill!.content).toContain('description:');
    });

    it('keeps QA(light) variant from emitting regression skill', () => {
        const files = compileAntigravity(['QA(light)'], [], 'test-project');
        const paths = files.map((file) => file.path);

        expect(paths).toContain('.agent/skills/quality-assurance--test/SKILL.md');
        expect(paths).not.toContain('.agent/skills/quality-assurance--regression/SKILL.md');
    });
});
