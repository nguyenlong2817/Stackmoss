import { describe, it, expect } from 'vitest';
import { compileClaudeCodeV2 } from '../../src/compile/claude-code.js';

const TEST_ROLES = ['TL(guide)', 'DEV', 'QA(light)'];
const AUTO_ROLES = ['SEC-lite'];

describe('Claude Code V2 Compile Target', () => {
    it('generates CLAUDE.md at root', () => {
        const files = compileClaudeCodeV2(TEST_ROLES, AUTO_ROLES, 'test-project');

        const claudeMd = files.find((file) => file.path === 'CLAUDE.md');
        expect(claudeMd).toBeDefined();
        expect(claudeMd!.content).toContain('# test-project');
    });

    it('generates .claude/skills/<role>/SKILL.md files', () => {
        const files = compileClaudeCodeV2(TEST_ROLES, [], 'test-project');

        const skillFiles = files.filter((file) => file.path.startsWith('.claude/skills/') && file.path.endsWith('/SKILL.md'));
        expect(skillFiles).toHaveLength(5);
        expect(skillFiles.every((file) => file.path.endsWith('/SKILL.md'))).toBe(true);
        expect(skillFiles.some((file) => file.path === '.claude/skills/skill-creator/SKILL.md')).toBe(true);
    });

    it('CLAUDE.md references role skill files', () => {
        const files = compileClaudeCodeV2(['DEV'], [], 'test-project');
        const claudeMd = files.find((file) => file.path === 'CLAUDE.md');

        expect(claudeMd!.content).toContain('.claude/skills/developer/SKILL.md');
    });

    it('role skills include yaml frontmatter and capabilities', () => {
        const files = compileClaudeCodeV2(['TL(guide)'], [], 'test-project');
        const tlSkill = files.find((file) => file.path === '.claude/skills/tech-lead/SKILL.md');

        expect(tlSkill).toBeDefined();
        expect(tlSkill!.content).toContain('---');
        expect(tlSkill!.content).toContain('name: tech-lead');
        expect(tlSkill!.content).toContain('TL-ARCH');
        expect(tlSkill!.content).toContain('Budget:');
        expect(tlSkill!.content).toContain('ROLE_SKILL_OVERRIDES.md');
    });

    it('includes auto-added roles', () => {
        const files = compileClaudeCodeV2([], ['SEC-lite'], 'test-project');
        expect(files.some((file) => file.path === '.claude/skills/security-auditor/SKILL.md')).toBe(true);
    });

    it('deduplicates roles', () => {
        const files = compileClaudeCodeV2(['DEV', 'DEV'], ['DEV'], 'test-project');
        const devSkills = files.filter((file) => file.path === '.claude/skills/developer/SKILL.md');
        expect(devSkills).toHaveLength(1);
    });

    it('embeds TL-led maintenance rules in root and TL skill', () => {
        const files = compileClaudeCodeV2(['TL(guide)', 'DEV'], [], 'test-project');
        const claudeMd = files.find((file) => file.path === 'CLAUDE.md');
        const tlSkill = files.find((file) => file.path === '.claude/skills/tech-lead/SKILL.md');

        expect(claudeMd!.content).toContain('Tech Lead mode');
        expect(claudeMd!.content).toContain('.claude/skills/stackmoss-methodology/SKILL.md');
        expect(tlSkill!.content).toContain('single writer for shared team config');
        expect(tlSkill!.content).toContain('Ask the user before applying any shared config patch');
        expect(tlSkill!.content).toContain('shared StackMoss methodology guidance');
    });

    it('emits one shared methodology skill with adapted modules', () => {
        const files = compileClaudeCodeV2(['TL', 'DEV', 'QA(light)'], [], 'test-project');
        const methodology = files.find((file) => file.path === '.claude/skills/stackmoss-methodology/SKILL.md');

        expect(methodology).toBeDefined();
        expect(methodology!.content).toContain('StackMoss Methodology');
        expect(methodology!.content).toContain('TDD Cycle');
        expect(methodology!.content).toContain('Systematic Debugging');
        expect(methodology!.content).toContain('Review Reception');
    });
});
