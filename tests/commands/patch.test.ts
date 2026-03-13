/**
 * Tests: Patch Command calibration warning
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execute as patchExecute } from '../../src/commands/patch.js';

const TEST_DIR = join(process.cwd(), '__test_patch_command__');
const originalCwd = process.cwd();

function cleanup(): void {
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

function setup(): void {
    mkdirSync(TEST_DIR, { recursive: true });

    writeFileSync(join(TEST_DIR, 'stackmoss.config.json'), JSON.stringify({
        schemaVersion: '1.0',
        state: 'OPERATIONAL',
    }, null, 2), 'utf-8');

    writeFileSync(join(TEST_DIR, 'team.md'), `# Team
## CONSTITUTION
Rules here.

## ROLES
TL, DEV

## WORKING CONTRACT
### Config Maintenance
- Calibration status: bootstrap pending TL recalibration after BRD lock + repo scan

## PROJECT_FACTS
- Package manager: TBD
`, 'utf-8');
}

describe('Patch Command', () => {
    beforeEach(() => {
        cleanup();
        process.chdir(originalCwd);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        process.chdir(originalCwd);
        cleanup();
    });

    it('warns when listing patches before TL calibration is completed', () => {
        setup();
        process.chdir(TEST_DIR);

        const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        patchExecute(TEST_DIR, 'list');

        const output = spy.mock.calls.map((call) => call.join(' ')).join('\n');
        expect(output).toContain('bootstrap calibration state');
        expect(output).toContain('No patch proposals found');
    });
});
