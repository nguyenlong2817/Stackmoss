/**
 * Stub command factory — creates placeholder commands for Phase B/C
 * that report "command not available" in current state.
 *
 * In F1, only `new` is implemented. All other commands are stubs
 * that report they are not available regardless of state.
 *
 * Authority: BRD §7 (CLI Commands), cli-pipeline skill
 */

import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { readState, type State } from '../state-machine.js';

/**
 * Creates a command handler that:
 * 1. Reads current state from stackmoss.config.json in CWD
 * 2. Reports "command not available in [state] state"
 *
 * In F1, all non-`new` commands are stubs. State validation
 * logic exists in state-machine.ts for when these commands
 * get fully implemented in later features.
 */
export function createStubHandler(commandName: string): () => void {
    return (): void => {
        const configPath = resolve(join('.', CONFIG_FILENAME));

        // Check if we're in a StackMoss project
        if (!existsSync(configPath)) {
            console.error(
                `❌ No ${CONFIG_FILENAME} found in current directory.\n` +
                `   Run 'stackmoss new <project_name>' first to create a project.`,
            );
            process.exit(1);
        }

        // Read current state
        let currentState: State;
        try {
            currentState = readState(configPath);
        } catch (error) {
            console.error(`❌ Failed to read config: ${(error as Error).message}`);
            process.exit(1);
        }

        // F1: all stubs report not available in current state
        console.error(
            `❌ Command '${commandName}' is not available in ${currentState} state.`,
        );
        process.exit(1);
    };
}
