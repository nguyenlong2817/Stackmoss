import { describe, it, expect } from 'vitest';
import { compileTarget } from '../../src/compile/index.js';

describe('Compile Target Dispatcher', () => {
    it('supports Roo target output', () => {
        const files = compileTarget('Roo', ['DEV'], [], 'demo');

        expect(files.length).toBeGreaterThan(0);
        expect(files[0].path).toMatch(/^\.roo\/skills\//);
    });
});
