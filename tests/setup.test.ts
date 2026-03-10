import { describe, it, expect } from 'vitest';
import { program } from '../src/index.js';

describe('StackMoss CLI', () => {
    it('should have correct name', () => {
        expect(program.name()).toBe('stackmoss');
    });

    it('should have a version defined', () => {
        expect(program.version()).toBeDefined();
        expect(program.version()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have a description', () => {
        expect(program.description()).toContain('Agent Team Config');
    });
});
