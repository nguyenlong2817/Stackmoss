/**
 * Tests: Run Command calibration warning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execute as runExecute } from '../../src/commands/run.js';

const TEST_DIR = join(process.cwd(), '__test_run__');
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

    writeFileSync(join(TEST_DIR, 'package.json'), JSON.stringify({
        name: 'run-test',
        version: '1.0.0',
        scripts: {
            ok: 'node -e "process.stdout.write(\'ok\')"',
        },
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

describe('Run Command', () => {
    beforeEach(() => {
        cleanup();
        process.chdir(originalCwd);
    });

    afterEach(() => {
        process.chdir(originalCwd);
        cleanup();
    });

    it('returns a calibration warning when team config is still bootstrap-only', () => {
        setup();
        process.chdir(TEST_DIR);

        const result = runExecute({
            alias: 'ok',
            projectPath: TEST_DIR,
            configPath: join(TEST_DIR, 'stackmoss.config.json'),
        });

        expect(result.success).toBe(true);
        expect(result.warnings[0]).toContain('bootstrap calibration state');
    });
});
