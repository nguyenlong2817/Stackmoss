/**
 * Command: stackmoss run <alias>
 * Phase C: Run a command alias from [DEV-ENV], create Patch Proposal on failure
 * Authority: BRD §12.1-12.2, cli-pipeline skill
 *
 * Pattern: parseArgs → checkState → execute → report
 */

import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { readState } from '../state-machine.js';
import { createProposal } from '../patch/index.js';
import type { RunResult, PatchFix } from '../patch/types.js';

// ─── Constants ───────────────────────────────────────────────────

const RUN_TIMEOUT_MS = 60_000; // 60s timeout

// ─── Types ───────────────────────────────────────────────────────

interface RunArgs {
    alias: string;
    projectPath: string;
    configPath: string;
}

// ─── Alias Resolution ────────────────────────────────────────────

/**
 * Resolve command alias from team.md [DEV-ENV] or package.json scripts.
 * Returns the actual shell command to run.
 */
export function resolveAlias(projectPath: string, alias: string): string | null {
    // 1. Try package.json scripts
    const pkgPath = join(projectPath, 'package.json');
    if (existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
                scripts?: Record<string, string>;
            };
            if (pkg.scripts?.[alias]) {
                return `npm run ${alias}`;
            }
        } catch { /* ignore */ }
    }

    // 2. Try team.md [DEV-ENV] section
    const teamPath = join(projectPath, 'team.md');
    if (existsSync(teamPath)) {
        const content = readFileSync(teamPath, 'utf-8');
        const devEnvMatch = content.match(/\[DEV-ENV\]([\s\S]*?)(?=\n##|\n\[|$)/);
        if (devEnvMatch) {
            // Look for alias in backtick commands
            const aliasPattern = new RegExp(`\\b${alias}\\b.*?:\s*\`([^\`]+)\``);
            const match = devEnvMatch[1].match(aliasPattern);
            if (match) return match[1];
        }
    }

    return null;
}

// ─── 4-method command pattern ────────────────────────────────────

export function parseArgs(alias: string | undefined): RunArgs {
    if (!alias || alias.trim().length === 0) {
        throw new Error('Alias is required. Usage: stackmoss run <alias>');
    }

    const projectPath = resolve('.');
    const configPath = join(projectPath, CONFIG_FILENAME);

    if (!existsSync(configPath)) {
        throw new Error(
            `No ${CONFIG_FILENAME} found in current directory.\n` +
            `   This command must be run inside a StackMoss project.`,
        );
    }

    return { alias: alias.trim(), projectPath, configPath };
}

export function checkState(configPath: string): void {
    const currentState = readState(configPath);

    if (currentState !== 'OPERATIONAL') {
        throw new Error(
            `Command 'run' is only available in OPERATIONAL state.\n` +
            `   Current state: ${currentState}.`,
        );
    }
}

export function execute(args: RunArgs): RunResult {
    const { alias, projectPath } = args;

    // Resolve alias to actual command
    const command = resolveAlias(projectPath, alias);

    if (!command) {
        throw new Error(
            `Unknown alias '${alias}'.\n` +
            `   Available: check package.json scripts or team.md [DEV-ENV].`,
        );
    }

    // Run the command
    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    try {
        const output = execSync(command, {
            cwd: projectPath,
            timeout: RUN_TIMEOUT_MS,
            encoding: 'utf-8',
            stdio: 'pipe',
        });
        stdout = output ?? '';
    } catch (error) {
        const execError = error as { status?: number; stdout?: string; stderr?: string };
        exitCode = execError.status ?? 1;
        stdout = execError.stdout ?? '';
        stderr = execError.stderr ?? '';
    }

    const success = exitCode === 0;
    const result: RunResult = {
        alias,
        command,
        exitCode,
        stdout: stdout.slice(0, 1000),
        stderr: stderr.slice(0, 1000),
        success,
        patchCreated: false,
    };

    // BRD §12.2: Create patch proposal on failure
    if (!success && stderr.length > 0) {
        const suggestedFix: PatchFix = {
            targetFile: 'team.md',
            section: '[DEV-ENV]',
            oldContent: `${alias}: \`${command}\``,
            newContent: `${alias}: \`${command}\` <!-- needs fix: exit code ${exitCode} -->`,
        };

        const proposal = createProposal(
            projectPath,
            'run_fail',
            command,
            stderr,
            suggestedFix,
        );

        result.patchCreated = true;
        result.patchId = proposal.id;
    }

    return result;
}

export function report(result: RunResult): void {
    if (result.success) {
        console.log(`\n✅ \`${result.alias}\` succeeded (exit code 0)`);
        if (result.stdout) {
            console.log('\n--- stdout ---');
            console.log(result.stdout);
        }
    } else {
        console.log(`\n❌ \`${result.alias}\` failed (exit code ${result.exitCode})`);
        if (result.stderr) {
            console.log('\n--- stderr ---');
            console.log(result.stderr);
        }
        if (result.patchCreated) {
            console.log(`\n📋 Patch Proposal created: ${result.patchId}`);
            console.log('   Run `stackmoss patch apply` or `stackmoss patch reject <reason>`');
        }
    }
}

/**
 * Full command handler
 */
export function handler(alias: string | undefined): void {
    const args = parseArgs(alias);
    checkState(args.configPath);
    const result = execute(args);
    report(result);
}
