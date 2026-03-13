import { describe, it, expect } from 'vitest';
import { compileCodex } from '../../src/compile/codex.js';

describe('Codex Compile Target', () => {
    it('generates AGENTS.md at repo root', () => {
        const files = compileCodex(['TL', 'DEV'], ['SEC-lite'], 'demo');
        const agents = files.find((file) => file.path === 'AGENTS.md');

        expect(agents).toBeDefined();
        expect(agents!.content).toContain('Tech Lead-first workflow');
        expect(agents!.content).toContain('AGENTS.md');
        expect(agents!.content).toContain('- TL');
        expect(agents!.content).toContain('- DEV');
        expect(agents!.content).toContain('- SEC');
    });
});
