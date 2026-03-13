import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execute as injectExecute, syncProjectFacts } from '../../src/commands/inject.js';

const TEST_DIR = join(process.cwd(), '__test_inject__');
const CONFIG_PATH = join(TEST_DIR, 'stackmoss.config.json');
const TEAM_PATH = join(TEST_DIR, 'team.md');

function cleanup(): void {
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

function writeBaseProject(): void {
    mkdirSync(TEST_DIR, { recursive: true });
    writeFileSync(CONFIG_PATH, JSON.stringify({
        schemaVersion: '1.0',
        state: 'GLOBAL',
        projectName: 'test',
        createdAt: '2026-01-01T00:00:00Z',
    }, null, 2), 'utf-8');
    writeFileSync(TEAM_PATH, `# Team Config — test

## PROJECT_FACTS
> Section này được inject và update bởi stackmoss inject/patch.
> stackmoss upgrade KHÔNG được touch section này.

### Environment (populated by inject)
- Package manager: TBD
- Run command: TBD
- Build command: TBD
- Test command: TBD
- Known paths: TBD

### Tech Stack (populated by inject)
- Framework: TBD
- Database: TBD
- Deploy target: TBD

### Known Issues (populated by patch)
_(trống khi init, được update dần)_
`, 'utf-8');
}

describe('Inject Command', () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    it('syncProjectFacts fills detected values into PROJECT_FACTS placeholders', () => {
        writeBaseProject();

        const updated = syncProjectFacts(readFileSync(TEAM_PATH, 'utf-8'), {
            facts: [
                { category: 'Package Manager', value: 'npm', source: 'package-lock.json' },
                { category: 'Framework', value: 'React (^19.0.0)', source: 'package.json dependencies' },
                { category: 'Deploy', value: 'Vercel', source: 'vercel.json' },
                { category: 'Script', value: 'dev: `vite`', source: 'package.json scripts' },
                { category: 'Script', value: 'build: `vite build`', source: 'package.json scripts' },
                { category: 'Script', value: 'test: `vitest run`', source: 'package.json scripts' },
            ],
            hypotheses: [
                { category: 'Database', value: 'PostgreSQL (^8)', confidence: 65, source: 'deps', critical: false },
                { category: 'Monorepo', value: 'YES — /apps/ directory exists, /packages/ directory exists', confidence: 80, source: 'dirs', critical: true },
            ],
            openQuestions: [],
        });

        expect(updated).toContain('- Package manager: npm');
        expect(updated).toContain('- Run command: `vite`');
        expect(updated).toContain('- Build command: `vite build`');
        expect(updated).toContain('- Test command: `vitest run`');
        expect(updated).toContain('- Known paths: /apps/, /packages/');
        expect(updated).toContain('- Framework: React (^19.0.0)');
        expect(updated).toContain('- Database: PostgreSQL (^8)');
        expect(updated).toContain('- Deploy target: Vercel');
    });

    it('execute writes migration report, syncs PROJECT_FACTS, and transitions state', () => {
        writeBaseProject();
        writeFileSync(join(TEST_DIR, 'package.json'), JSON.stringify({
            name: 'demo',
            scripts: {
                dev: 'vite',
                build: 'vite build',
                test: 'vitest run',
            },
            dependencies: {
                react: '^19.0.0',
                pg: '^8.0.0',
            },
        }, null, 2), 'utf-8');
        writeFileSync(join(TEST_DIR, 'package-lock.json'), '{}', 'utf-8');
        writeFileSync(join(TEST_DIR, 'vercel.json'), '{}', 'utf-8');

        const result = injectExecute(TEST_DIR, CONFIG_PATH);

        expect(existsSync(result.reportPath)).toBe(true);

        const updatedTeam = readFileSync(TEAM_PATH, 'utf-8');
        expect(updatedTeam).toContain('- Package manager: npm');
        expect(updatedTeam).toContain('- Run command: `vite`');
        expect(updatedTeam).toContain('- Build command: `vite build`');
        expect(updatedTeam).toContain('- Test command: `vitest run`');
        expect(updatedTeam).toContain('- Framework: React (^19.0.0)');
        expect(updatedTeam).toContain('- Database: PostgreSQL (^8.0.0)');
        expect(updatedTeam).toContain('- Deploy target: Vercel');

        const updatedConfig = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as { state: string };
        expect(updatedConfig.state).toBe('MIGRATING');
    });
});
