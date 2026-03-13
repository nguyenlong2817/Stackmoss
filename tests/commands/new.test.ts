import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync } from 'node:fs';
import { rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseArgs, checkState, execute } from '../../src/commands/new.js';
import { CONFIG_FILENAME } from '../../src/config.js';

const TEST_DIR = resolve('__test_new_cmd__');

describe('Command: new', () => {
    // Cleanup before and after each test
    beforeEach(() => {
        if (existsSync(TEST_DIR)) {
            rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    afterEach(() => {
        if (existsSync(TEST_DIR)) {
            rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    describe('parseArgs', () => {
        it('should return projectName for valid input', () => {
            expect(parseArgs('my-project')).toEqual({ projectName: 'my-project' });
        });

        it('should trim whitespace', () => {
            expect(parseArgs('  my-project  ')).toEqual({ projectName: 'my-project' });
        });

        it('should throw for empty name', () => {
            expect(() => parseArgs('')).toThrow('Project name is required');
        });

        it('should throw for undefined name', () => {
            expect(() => parseArgs(undefined)).toThrow('Project name is required');
        });

        it('should throw for invalid characters', () => {
            expect(() => parseArgs('my project')).toThrow('Invalid project name');
            expect(() => parseArgs('my/project')).toThrow('Invalid project name');
            expect(() => parseArgs('../escape')).toThrow('Invalid project name');
        });

        it('should throw for reserved Windows device names', () => {
            expect(() => parseArgs('CON')).toThrow('Reserved device names');
            expect(() => parseArgs('NUL')).toThrow('Reserved device names');
            expect(() => parseArgs('PRN')).toThrow('Reserved device names');
        });

        it('should accept valid names with dots, hyphens, underscores', () => {
            expect(() => parseArgs('my-project')).not.toThrow();
            expect(() => parseArgs('my_project')).not.toThrow();
            expect(() => parseArgs('my.project')).not.toThrow();
            expect(() => parseArgs('project123')).not.toThrow();
        });
    });

    describe('checkState', () => {
        it('should pass if folder does not exist', () => {
            expect(() => checkState({ projectName: '__test_nonexistent__' })).not.toThrow();
        });

        it('should throw if folder already exists', () => {
            mkdirSync(TEST_DIR, { recursive: true });
            expect(() => checkState({ projectName: '__test_new_cmd__' })).toThrow('already exists');
        });
    });

    describe('execute', () => {
        it('should create project folder', () => {
            const args = { projectName: '__test_new_cmd__' };
            const result = execute(args);

            expect(existsSync(result.projectPath)).toBe(true);
            expect(result.projectPath).toBe(TEST_DIR);
        });

        it('should set configPath in result', () => {
            const args = { projectName: '__test_new_cmd__' };
            const result = execute(args);

            expect(result.configPath).toBe(join(TEST_DIR, CONFIG_FILENAME));
        });

        it('should initialize empty generatedFiles array', () => {
            const args = { projectName: '__test_new_cmd__' };
            const result = execute(args);

            expect(result.generatedFiles).toEqual([]);
        });

        it('should reject execute if folder appears after checkState', () => {
            const args = { projectName: '__test_new_cmd__' };
            checkState(args);
            mkdirSync(TEST_DIR, { recursive: true });

            expect(() => execute(args)).toThrow('already exists');
        });
    });
});
