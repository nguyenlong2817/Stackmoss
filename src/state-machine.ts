/**
 * State Machine — 3 states with command permission boundaries
 * Authority: BRD §6, cli-pipeline skill
 *
 * GLOBAL ──[inject]──▶ MIGRATING ──[resolve + promote]──▶ OPERATIONAL
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { CONFIG_FILENAME, type StackMossConfig } from './config.js';

// ─── States ───────────────────────────────────────────────────────

export type State = 'GLOBAL' | 'MIGRATING' | 'OPERATIONAL';

export const STATES: readonly State[] = ['GLOBAL', 'MIGRATING', 'OPERATIONAL'] as const;

// ─── Command → Allowed States mapping ────────────────────────────

/**
 * Maps each CLI command to the states in which it is allowed.
 * - `new` is special: it creates a project, doesn't require existing state
 * - Phase B commands: inject (GLOBAL), resolve/promote (MIGRATING)
 * - Phase C commands: run, check, patch, upgrade (OPERATIONAL)
 */
export const COMMAND_STATE_MAP: Record<string, readonly State[]> = {
    // Phase A
    new: [],  // special: no state required (creates new project)
    init: [], // special: bootstraps current repo, no state required

    // Phase B
    inject: ['GLOBAL'],
    resolve: ['MIGRATING'],
    promote: ['MIGRATING'],

    // Phase C
    run: ['OPERATIONAL'],
    check: ['OPERATIONAL'],
    patch: ['OPERATIONAL'],
    upgrade: ['OPERATIONAL'],
};

// ─── Validation ──────────────────────────────────────────────────

export class StateValidationError extends Error {
    constructor(
        public readonly command: string,
        public readonly currentState: State,
        public readonly allowedStates: readonly State[],
    ) {
        const allowed = allowedStates.join(', ');
        super(
            `Command '${command}' is not available in ${currentState} state. ` +
            `Allowed in: ${allowed}.`,
        );
        this.name = 'StateValidationError';
    }
}

/**
 * Validates that a command is allowed in the current state.
 * Throws StateValidationError if not.
 */
export function validateState(command: string, currentState: State): void {
    const allowed = COMMAND_STATE_MAP[command];

    if (!allowed) {
        throw new Error(`Unknown command: '${command}'`);
    }

    // `new` is state-independent (empty allowed array = skip check)
    if (allowed.length === 0) {
        return;
    }

    if (!allowed.includes(currentState)) {
        throw new StateValidationError(command, currentState, allowed);
    }
}

// ─── State I/O ───────────────────────────────────────────────────

/**
 * Read current state from a stackmoss.config.json file.
 */
export function readState(configPath: string): State {
    const raw = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw) as StackMossConfig;

    if (!STATES.includes(config.state)) {
        throw new Error(`Invalid state '${config.state}' in ${CONFIG_FILENAME}`);
    }

    return config.state;
}

// ─── State Transitions ───────────────────────────────────────────

const VALID_TRANSITIONS: Record<State, State | null> = {
    GLOBAL: 'MIGRATING',
    MIGRATING: 'OPERATIONAL',
    OPERATIONAL: null,  // No further transitions
};

/**
 * Transition state in config file.
 * Validates that the transition is legal before writing.
 */
export function transitionState(
    configPath: string,
    expectedFrom: State,
    to: State,
): void {
    const current = readState(configPath);

    if (current !== expectedFrom) {
        throw new Error(
            `Cannot transition: expected state '${expectedFrom}' but found '${current}'.`,
        );
    }

    const allowed = VALID_TRANSITIONS[current];
    if (allowed !== to) {
        throw new Error(
            `Invalid state transition: ${current} → ${to}. ` +
            (allowed ? `Only ${current} → ${allowed} is allowed.` : `${current} has no further transitions.`),
        );
    }

    writeState(configPath, to);
}

/**
 * Write new state to config file (preserving other fields).
 */
export function writeState(configPath: string, newState: State): void {
    const raw = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw) as Record<string, unknown>;
    config.state = newState;
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}
