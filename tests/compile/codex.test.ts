import { describe, it, expect } from 'vitest';
import { compileCodex } from '../../src/compile/codex.js';

describe('Codex Compile Target', () => {
    it('generates AGENTS.md and Codex project skills', () => {
        const files = compileCodex(['TL', 'DEV'], ['SEC-lite'], 'demo');
        const agents = files.find((file) => file.path === 'AGENTS.md');
        const tlSkill = files.find((file) => file.path === '.agents/skills/tech-lead/SKILL.md');
        const devSkill = files.find((file) => file.path === '.agents/skills/developer/SKILL.md');
        const secSkill = files.find((file) => file.path === '.agents/skills/security-auditor/SKILL.md');

        expect(agents).toBeDefined();
        expect(tlSkill).toBeDefined();
        expect(devSkill).toBeDefined();
        expect(secSkill).toBeDefined();
        expect(agents!.content).toContain('Tech Lead-first workflow');
        expect(agents!.content).toContain('AGENTS.md');
        expect(agents!.content).toContain('ROLE_SKILL_OVERRIDES.md');
        expect(agents!.content).toContain('.agents/skills/<skill-name>/SKILL.md');
        expect(agents!.content).toContain('.stackmoss/skill-kit/ROLE_INDEX.md');
        expect(agents!.content).toContain('- TL');
        expect(agents!.content).toContain('- DEV');
        expect(agents!.content).toContain('- SEC');
        expect(agents!.content).toContain('## Methodology');
        expect(agents!.content).toContain('TDD Cycle');
        expect(agents!.content).toContain('Adapted from selected Superpowers ideas');
    });
});
