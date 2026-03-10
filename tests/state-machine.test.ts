import { describe, it, expect } from 'vitest';
import {
    validateState,
    StateValidationError,
    COMMAND_STATE_MAP,
    STATES,
    type State,
} from '../src/state-machine.js';

describe('State Machine', () => {
    describe('STATES', () => {
        it('should have exactly 3 states', () => {
            expect(STATES).toHaveLength(3);
            expect(STATES).toContain('GLOBAL');
            expect(STATES).toContain('MIGRATING');
            expect(STATES).toContain('OPERATIONAL');
        });
    });

    describe('COMMAND_STATE_MAP', () => {
        it('should have all commands mapped', () => {
            const commands = ['new', 'inject', 'resolve', 'promote', 'run', 'check', 'patch', 'upgrade'];
            for (const cmd of commands) {
                expect(COMMAND_STATE_MAP).toHaveProperty(cmd);
            }
        });

        it('should allow `new` in any state (empty allowed array)', () => {
            expect(COMMAND_STATE_MAP['new']).toEqual([]);
        });

        it('should allow `inject` only in GLOBAL', () => {
            expect(COMMAND_STATE_MAP['inject']).toEqual(['GLOBAL']);
        });

        it('should allow `resolve` and `promote` only in MIGRATING', () => {
            expect(COMMAND_STATE_MAP['resolve']).toEqual(['MIGRATING']);
            expect(COMMAND_STATE_MAP['promote']).toEqual(['MIGRATING']);
        });

        it('should allow Phase C commands only in OPERATIONAL', () => {
            for (const cmd of ['run', 'check', 'patch', 'upgrade']) {
                expect(COMMAND_STATE_MAP[cmd]).toEqual(['OPERATIONAL']);
            }
        });
    });

    describe('validateState', () => {
        it('should NOT throw for `new` regardless of state', () => {
            for (const state of STATES) {
                expect(() => validateState('new', state)).not.toThrow();
            }
        });

        it('should NOT throw for `inject` in GLOBAL state', () => {
            expect(() => validateState('inject', 'GLOBAL')).not.toThrow();
        });

        it('should throw StateValidationError for `inject` in MIGRATING', () => {
            expect(() => validateState('inject', 'MIGRATING')).toThrow(StateValidationError);
        });

        it('should throw StateValidationError for `inject` in OPERATIONAL', () => {
            expect(() => validateState('inject', 'OPERATIONAL')).toThrow(StateValidationError);
        });

        it('should NOT throw for `resolve` in MIGRATING', () => {
            expect(() => validateState('resolve', 'MIGRATING')).not.toThrow();
        });

        it('should throw for `resolve` in GLOBAL', () => {
            expect(() => validateState('resolve', 'GLOBAL')).toThrow(StateValidationError);
        });

        it('should throw for `run` in GLOBAL', () => {
            expect(() => validateState('run', 'GLOBAL')).toThrow(StateValidationError);
        });

        it('should NOT throw for `run` in OPERATIONAL', () => {
            expect(() => validateState('run', 'OPERATIONAL')).not.toThrow();
        });

        it('should throw for unknown command', () => {
            expect(() => validateState('unknown', 'GLOBAL')).toThrow('Unknown command');
        });

        it('should include command and state info in error message', () => {
            try {
                validateState('inject', 'OPERATIONAL');
                expect.fail('Should have thrown');
            } catch (error) {
                const e = error as StateValidationError;
                expect(e.command).toBe('inject');
                expect(e.currentState).toBe('OPERATIONAL');
                expect(e.allowedStates).toEqual(['GLOBAL']);
                expect(e.message).toContain('inject');
                expect(e.message).toContain('OPERATIONAL');
                expect(e.message).toContain('GLOBAL');
            }
        });

        // BRD §6: each Phase C command should be blocked in GLOBAL
        it.each(['run', 'check', 'patch', 'upgrade'])(
            'should block "%s" in GLOBAL state',
            (cmd) => {
                expect(() => validateState(cmd, 'GLOBAL' as State)).toThrow(StateValidationError);
            },
        );
    });
});
