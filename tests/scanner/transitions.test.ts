/**
 * Tests: State Machine — Phase B transitions
 * (Extends existing state-machine.test.ts with transition tests)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { transitionState, writeState, readState } from '../../src/state-machine.js';

const TEST_DIR = join(process.cwd(), '__test_transitions__');
const CONFIG_PATH = join(TEST_DIR, 'stackmoss.config.json');

function writeConfig(state: string): void {
    mkdirSync(TEST_DIR, { recursive: true });
    writeFileSync(CONFIG_PATH, JSON.stringify({
        schemaVersion: '1.0',
        state,
        projectName: 'test',
        createdAt: '2026-01-01T00:00:00Z',
    }, null, 2), 'utf-8');
}

function cleanup(): void {
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

describe('State Transitions', () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    it('transitions GLOBAL → MIGRATING', () => {
        writeConfig('GLOBAL');

        transitionState(CONFIG_PATH, 'GLOBAL', 'MIGRATING');

        expect(readState(CONFIG_PATH)).toBe('MIGRATING');
    });

    it('transitions MIGRATING → OPERATIONAL', () => {
        writeConfig('MIGRATING');

        transitionState(CONFIG_PATH, 'MIGRATING', 'OPERATIONAL');

        expect(readState(CONFIG_PATH)).toBe('OPERATIONAL');
    });

    it('rejects wrong expected state', () => {
        writeConfig('MIGRATING');

        expect(() => {
            transitionState(CONFIG_PATH, 'GLOBAL', 'MIGRATING');
        }).toThrow('expected state');
    });

    it('rejects invalid transition GLOBAL → OPERATIONAL', () => {
        writeConfig('GLOBAL');

        expect(() => {
            transitionState(CONFIG_PATH, 'GLOBAL', 'OPERATIONAL');
        }).toThrow('Invalid state transition');
    });

    it('rejects transition from OPERATIONAL', () => {
        writeConfig('OPERATIONAL');

        expect(() => {
            transitionState(CONFIG_PATH, 'OPERATIONAL', 'GLOBAL');
        }).toThrow('Invalid state transition');
    });

    it('writeState preserves other fields', () => {
        writeConfig('GLOBAL');

        writeState(CONFIG_PATH, 'MIGRATING');

        const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
        expect(raw.state).toBe('MIGRATING');
        expect(raw.projectName).toBe('test');
        expect(raw.schemaVersion).toBe('1.0');
    });
});
