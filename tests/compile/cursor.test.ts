/**
 * Tests: Cursor Compile Target
 * Authority: BRD §15
 */

import { describe, it, expect } from 'vitest';
import { compileCursor } from '../../src/compile/cursor.js';

const TEST_ROLES = ['TL(guide)', 'DEV', 'QA(light)'];
const AUTO_ROLES = ['SEC-lite'];

describe('Cursor Compile Target', () => {
    it('generates .mdc files in .cursor/rules/', () => {
        const files = compileCursor(TEST_ROLES, AUTO_ROLES, 'test-project');

        for (const file of files) {
            expect(file.path).toMatch(/^\.cursor\/rules\/.+\.mdc$/);
        }
    });

    it('includes always-on rules (constitution, project-facts, working-contract)', () => {
        const files = compileCursor(TEST_ROLES, [], 'test-project');
        const paths = files.map((f) => f.path);

        expect(paths).toContain('.cursor/rules/constitution.mdc');
        expect(paths).toContain('.cursor/rules/project-facts.mdc');
        expect(paths).toContain('.cursor/rules/working-contract.mdc');
    });

    it('includes YAML frontmatter with alwaysApply', () => {
        const files = compileCursor(TEST_ROLES, [], 'test-project');

        const constitution = files.find((f) => f.path.includes('constitution'));
        expect(constitution!.content).toContain('---');
        expect(constitution!.content).toContain('alwaysApply: true');
    });

    it('generates role-level rules with alwaysApply: false', () => {
        const files = compileCursor(['DEV'], [], 'test-project');

        const devRule = files.find((f) => f.path.includes('dev.mdc'));
        expect(devRule).toBeDefined();
        expect(devRule!.content).toContain('alwaysApply: false');
        expect(devRule!.content).toContain('description:');
    });

    it('includes capabilities in role files', () => {
        const files = compileCursor(['TL(guide)'], [], 'test-project');

        const tlRule = files.find((f) => f.path.includes('tl.mdc'));
        expect(tlRule!.content).toContain('TL-ARCH');
        expect(tlRule!.content).toContain('TL-REVIEW');
    });

    it('deduplicates roles', () => {
        const files = compileCursor(['DEV', 'DEV'], ['DEV'], 'test-project');
        const devFiles = files.filter((f) => f.path.includes('dev.mdc'));
        expect(devFiles.length).toBe(1);
    });

    it('handles unknown roles gracefully', () => {
        const files = compileCursor(['CUSTOM_ROLE'], [], 'test-project');
        const customFile = files.find((f) => f.path.includes('custom.mdc'));
        expect(customFile).toBeDefined();
        expect(customFile!.content).toContain('CUSTOM_ROLE');
    });
});
