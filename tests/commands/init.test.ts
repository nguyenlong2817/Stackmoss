import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
    parseArgs,
    checkState,
    execute,
    findReservedConflicts,
    hasExistingRepoContent,
} from '../../src/commands/init.js';
import { CONFIG_FILENAME } from '../../src/config.js';

const TEST_DIR = resolve('__test_init_cmd__');
const originalCwd = process.cwd();

describe('Command: init', () => {
    beforeEach(() => {
        if (existsSync(TEST_DIR)) {
            rmSync(TEST_DIR, { recursive: true, force: true });
        }
        mkdirSync(TEST_DIR, { recursive: true });
        process.chdir(TEST_DIR);
    });

    afterEach(() => {
        process.chdir(originalCwd);
        if (existsSync(TEST_DIR)) {
            rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    it('derives project name from current folder when omitted', () => {
        expect(parseArgs()).toEqual({ projectName: '__test_init_cmd__' });
    });

    it('accepts an explicit project name override', () => {
        expect(parseArgs('chonai')).toEqual({ projectName: 'chonai' });
    });

    it('detects reserved StackMoss path conflicts', () => {
        writeFileSync(join(TEST_DIR, CONFIG_FILENAME), '{}', 'utf-8');
        expect(findReservedConflicts(TEST_DIR)).toContain(CONFIG_FILENAME);
    });

    it('rejects init when StackMoss files already exist', () => {
        writeFileSync(join(TEST_DIR, 'team.md'), '# existing', 'utf-8');
        expect(() => checkState()).toThrow('StackMoss-managed paths');
    });

    it('marks empty git repo as not needing auto-inject', () => {
        mkdirSync(join(TEST_DIR, '.git'), { recursive: true });
        expect(hasExistingRepoContent(TEST_DIR)).toBe(false);
    });

    it('marks real repo content as needing auto-inject', () => {
        writeFileSync(join(TEST_DIR, 'package.json'), '{"name":"chonai"}', 'utf-8');
        expect(hasExistingRepoContent(TEST_DIR)).toBe(true);
    });

    it('uses current directory as project path', () => {
        writeFileSync(join(TEST_DIR, 'package.json'), '{"name":"chonai"}', 'utf-8');
        const result = execute({ projectName: 'chonai' });

        expect(result.projectPath).toBe(TEST_DIR);
        expect(result.configPath).toBe(join(TEST_DIR, CONFIG_FILENAME));
        expect(result.autoInjectPlanned).toBe(true);
    });
});
