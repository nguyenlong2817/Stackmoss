/**
 * StackMoss Config — schema and defaults for stackmoss.config.json
 * Authority: BRD §9.1
 */

export const CONFIG_FILENAME = 'stackmoss.config.json';

export interface StackMossConfig {
    schemaVersion: string;
    state: 'GLOBAL' | 'MIGRATING' | 'OPERATIONAL';
    projectName: string;
    createdAt: string;
}

export function createDefaultConfig(projectName: string): StackMossConfig {
    return {
        schemaVersion: '1.0',
        state: 'GLOBAL',
        projectName,
        createdAt: new Date().toISOString(),
    };
}
