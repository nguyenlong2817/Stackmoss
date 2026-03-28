import { describe, it, expect } from 'vitest';
import { compileBootstrapTargets, compileTarget } from '../../src/compile/index.js';

describe('Compile Target Dispatcher', () => {
    it('supports only ClaudeCode, Codex, and Antigravity targets', () => {
        expect(() => compileTarget('ClaudeCode', ['TL'], [], 'demo')).not.toThrow();
        expect(() => compileTarget('Codex', ['TL'], [], 'demo')).not.toThrow();
        expect(() => compileTarget('Antigravity', ['TL'], [], 'demo')).not.toThrow();
    });

    it('generates bootstrap outputs for the 3 runtimes', () => {
        const files = compileBootstrapTargets(['PM', 'TL'], [], 'demo');
        const paths = files.map((file) => file.path);
        const uniquePaths = new Set(paths);

        expect(paths).toContain('CLAUDE.md');
        expect(paths).toContain('AGENTS.md');
        expect(paths).toContain('.agents/skills/stackmoss-bootstrap/SKILL.md');
        expect(paths).toContain('.claude/skills/stackmoss-methodology/SKILL.md');
        expect(paths).toContain('.claude/skills/skill-creator/SKILL.md');
        expect(paths).toContain('.agents/skills/skill-creator/SKILL.md');
        expect(paths).toContain('.agent/rules/methodology.md');
        expect(paths).toContain('.agent/skills/tech-lead/SKILL.md');
        expect(paths).toContain('.agent/skills/product-manager/SKILL.md');
        expect(paths.some((path) => path.startsWith('.cursor/'))).toBe(false);
        expect(paths.some((path) => path.startsWith('.roo/'))).toBe(false);
        expect(paths.some((path) => path.startsWith('.github/copilot'))).toBe(false);
        expect(uniquePaths.size).toBe(paths.length);
    });
});