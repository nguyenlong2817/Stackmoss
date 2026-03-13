import { describe, it, expect } from 'vitest';
import { compileCursor } from '../../src/compile/cursor.js';

const TEST_ROLES = ['TL(guide)', 'DEV', 'QA(light)'];
const AUTO_ROLES = ['SEC-lite'];

describe('Cursor Compile Target', () => {
    it('generates native skill files in .cursor/skills/', () => {
        const files = compileCursor(TEST_ROLES, AUTO_ROLES, 'test-project');

        for (const file of files) {
            expect(file.path).toMatch(/^\.cursor\/skills\/.+\/SKILL\.md$/);
        }
    });

    it('includes stackmoss bootstrap skill', () => {
        const files = compileCursor(TEST_ROLES, [], 'test-project');
        expect(files.some((file) => file.path === '.cursor/skills/stackmoss-bootstrap/SKILL.md')).toBe(true);
    });

    it('includes yaml frontmatter with matching name field', () => {
        const files = compileCursor(['DEV'], [], 'test-project');
        const devSkill = files.find((file) => file.path === '.cursor/skills/developer/SKILL.md');

        expect(devSkill).toBeDefined();
        expect(devSkill!.content).toContain('---');
        expect(devSkill!.content).toContain('name: developer');
        expect(devSkill!.content).toContain('description:');
    });

    it('includes capabilities in role files', () => {
        const files = compileCursor(['TL(guide)'], [], 'test-project');
        const tlSkill = files.find((file) => file.path === '.cursor/skills/tech-lead/SKILL.md');

        expect(tlSkill).toBeDefined();
        expect(tlSkill!.content).toContain('TL-ARCH');
        expect(tlSkill!.content).toContain('TL-REVIEW');
    });

    it('deduplicates roles', () => {
        const files = compileCursor(['DEV', 'DEV'], ['DEV'], 'test-project');
        const devFiles = files.filter((file) => file.path === '.cursor/skills/developer/SKILL.md');
        expect(devFiles).toHaveLength(1);
    });

    it('handles unknown roles gracefully', () => {
        const files = compileCursor(['CUSTOM_ROLE'], [], 'test-project');
        const customFile = files.find((file) => file.path === '.cursor/skills/custom/SKILL.md');

        expect(customFile).toBeDefined();
        expect(customFile!.content).toContain('CUSTOM_ROLE');
    });

    it('includes TL-led maintenance rules in bootstrap and TL skills', () => {
        const files = compileCursor(['TL'], [], 'test-project');
        const bootstrap = files.find((file) => file.path === '.cursor/skills/stackmoss-bootstrap/SKILL.md');
        const tlSkill = files.find((file) => file.path === '.cursor/skills/tech-lead/SKILL.md');

        expect(bootstrap!.content).toContain('Tech Lead is the single writer for shared config');
        expect(tlSkill!.content).toContain('Prepare replace-only config patches');
    });
});
