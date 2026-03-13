import { createRequire } from 'node:module';
import { Command } from 'commander';
import { handler as newHandler } from './commands/new.js';
import { handler as initHandler } from './commands/init.js';
import { handler as injectHandler } from './commands/inject.js';
import { handler as resolveHandler } from './commands/resolve.js';
import { handler as promoteHandler } from './commands/promote.js';
import { handler as runHandler } from './commands/run.js';
import { handler as checkHandler } from './commands/check.js';
import { handler as patchHandler } from './commands/patch.js';
import { handler as upgradeHandler } from './commands/upgrade.js';
import { createStubHandler } from './commands/stub.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

const program = new Command();

program
    .name('stackmoss')
    .description('Agent Team Config generator — scaffold agent teams for AI-assisted development')
    .version(pkg.version);

// ─── Phase A Commands ────────────────────────────────────────────

program
    .command('new <project_name>')
    .description('Create a new StackMoss project workspace')
    .action(async (projectName: string) => {
        try {
            await newHandler(projectName);
        } catch (error) {
            console.error(`❌ ${(error as Error).message}`);
            process.exit(1);
        }
    });

program
    .command('init [project_name]')
    .description('Initialize StackMoss in the current repository')
    .action(async (projectName?: string) => {
        try {
            await initHandler(projectName);
        } catch (error) {
            console.error(`❌ ${(error as Error).message}`);
            process.exit(1);
        }
    });

// ─── Phase B Commands ────────────────────────────────────────────

program
    .command('inject')
    .description('Scan repo and create MIGRATION_REPORT (Phase B)')
    .action(() => {
        try {
            injectHandler();
        } catch (error) {
            console.error(`❌ ${(error as Error).message}`);
            process.exit(1);
        }
    });

program
    .command('resolve')
    .description('Answer open questions from migration report (Phase B)')
    .action(async () => {
        try {
            await resolveHandler();
        } catch (error) {
            console.error(`❌ ${(error as Error).message}`);
            process.exit(1);
        }
    });

program
    .command('promote')
    .option('--confirm', 'Confirm promotion to OPERATIONAL state')
    .description('Promote from MIGRATING to OPERATIONAL (Phase B)')
    .action((options: { confirm?: boolean }) => {
        try {
            promoteHandler(options);
        } catch (error) {
            console.error(`❌ ${(error as Error).message}`);
            process.exit(1);
        }
    });

// ─── Phase C Commands ────────────────────────────────────────────

program
    .command('run <alias>')
    .description('Run a command with patch proposal on failure (Phase C)')
    .action((alias: string) => {
        try {
            runHandler(alias);
        } catch (error) {
            console.error(`❌ ${(error as Error).message}`);
            process.exit(1);
        }
    });

program
    .command('check')
    .description('Sanity check config and create patch proposals (Phase C)')
    .action(() => {
        try {
            checkHandler();
        } catch (error) {
            console.error(`❌ ${(error as Error).message}`);
            process.exit(1);
        }
    });

program
    .command('patch <action>')
    .description('Apply or reject a patch proposal (Phase C)')
    .argument('[args...]', 'Additional arguments')
    .action((action: string, args: string[]) => {
        try {
            patchHandler(action, args);
        } catch (error) {
            console.error(`❌ ${(error as Error).message}`);
            process.exit(1);
        }
    });

program
    .command('upgrade')
    .option('--apply', 'Apply the upgrade without interactive confirm')
    .description('Merge CONSTITUTION updates, keep project facts (Phase C)')
    .action((options: { apply?: boolean }) => {
        try {
            upgradeHandler(options);
        } catch (error) {
            console.error(`❌ ${(error as Error).message}`);
            process.exit(1);
        }
    });

export { program };

export function run(): void {
    program.parse();
}
