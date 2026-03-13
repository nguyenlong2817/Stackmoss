/**
 * Tests: Claude Code V2 Compile Target (official format)
 * Authority: BRD §15
 */

import { describe, it, expect } from 'vitest';
import { compileClaudeCodeV2 } from '../../src/compile/claude-code.js';

const TEST_ROLES = ['TL(guide)', 'DEV', 'QA(light)'];
const AUTO_ROLES = ['SEC-lite'];

describe('Claude Code V2 Compile Target', () => {
    it('generates CLAUDE.md at root', () => {
        const files = compileClaudeCodeV2(TEST_ROLES, AUTO_ROLES, 'test-project');

        const claudeMd = files.find((f) => f.path === 'CLAUDE.md');
        expect(claudeMd).toBeDefined();
        expect(claudeMd!.content).toContain('# test-project');
    });

    it('generates .claude/rules/<role>.md files', () => {
        const files = compileClaudeCodeV2(TEST_ROLES, [], 'test-project');

        const ruleFiles = files.filter((f) => f.path.startsWith('.claude/rules/'));
        expect(ruleFiles.length).toBe(3); // TL, DEV, QA
    });

    it('CLAUDE.md references role rule files', () => {
        const files = compileClaudeCodeV2(['DEV'], [], 'test-project');

        const claudeMd = files.find((f) => f.path === 'CLAUDE.md')!;
        expect(claudeMd.content).toContain('.claude/rules/dev.md');
    });

    it('role rules include capabilities', () => {
        const files = compileClaudeCodeV2(['TL(guide)'], [], 'test-project');

        const tlRule = files.find((f) => f.path === '.claude/rules/tl.md');
        expect(tlRule).toBeDefined();
        expect(tlRule!.content).toContain('TL-ARCH');
        expect(tlRule!.content).toContain('Budget:');
    });

    it('includes auto-added roles', () => {
        const files = compileClaudeCodeV2([], ['SEC-lite'], 'test-project');

        const secRule = files.find((f) => f.path === '.claude/rules/sec.md');
        expect(secRule).toBeDefined();
    });

    it('deduplicates roles', () => {
        const files = compileClaudeCodeV2(['DEV', 'DEV'], ['DEV'], 'test-project');
        const devRules = files.filter((f) => f.path === '.claude/rules/dev.md');
        expect(devRules.length).toBe(1);
    });

    it('CLAUDE.md includes team roles section', () => {
        const files = compileClaudeCodeV2(TEST_ROLES, [], 'test-project');

        const claudeMd = files.find((f) => f.path === 'CLAUDE.md')!;
        expect(claudeMd.content).toContain('## Team Roles');
        expect(claudeMd.content).toContain('Tech Lead');
        expect(claudeMd.content).toContain('Developer');
    });

    it('embeds team maintenance contract in root and TL rule', () => {
        const files = compileClaudeCodeV2(['TL(guide)', 'DEV'], [], 'test-project');

        const claudeMd = files.find((f) => f.path === 'CLAUDE.md')!;
        const tlRule = files.find((f) => f.path === '.claude/rules/tl.md')!;

        expect(claudeMd.content).toContain('## Team Maintenance');
        expect(claudeMd.content).toContain('Tech Lead must recalibrate the team');
        expect(tlRule.content).toContain('Tech Lead is the single writer for shared team config');
        expect(tlRule.content).toContain('Ask the user before applying any config patch');
    });
});
