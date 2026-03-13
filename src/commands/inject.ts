/**
 * Command: stackmoss inject
 * Phase B: Scan existing repo, create MIGRATION_REPORT.md
 * Authority: BRD §7, §13, cli-pipeline skill
 *
 * Pattern: parseArgs → checkState → execute → report
 *
 * Permission boundaries (MIGRATING state):
 * - ✅ Read repo structure, config files
 * - ✅ Write to .agents/ in project
 * - ❌ No code execution, no source modification
 */

import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { readState, transitionState } from '../state-machine.js';
import { scanRepo, renderMigrationReport, MIGRATION_REPORT_FILENAME } from '../scanner/index.js';
import type { ScanResult } from '../scanner/types.js';

// ─── Types ───────────────────────────────────────────────────────

export interface InjectResult {
    projectPath: string;
    configPath: string;
    scanResult: ScanResult;
    reportPath: string;
    teamPath?: string;
}

function findFact(scanResult: ScanResult, category: string): string | undefined {
    return scanResult.facts.find((fact) => fact.category === category)?.value;
}

function findScript(scanResult: ScanResult, scriptName: string): string | undefined {
    const scriptValue = scanResult.facts
        .filter((fact) => fact.category === 'Script')
        .map((fact) => fact.value)
        .find((value) => value.startsWith(`${scriptName}:`));

    if (!scriptValue) {
        return undefined;
    }

    return scriptValue.replace(new RegExp(`^${scriptName}:\\s*`), '');
}

function findDatabase(scanResult: ScanResult): string | undefined {
    return scanResult.hypotheses.find((hypothesis) => hypothesis.category === 'Database')?.value;
}

function findKnownPaths(scanResult: ScanResult): string | undefined {
    const monorepo = scanResult.hypotheses.find((hypothesis) => hypothesis.category === 'Monorepo');
    if (!monorepo) {
        return undefined;
    }

    const paths = Array.from(monorepo.value.matchAll(/\/[a-zA-Z0-9._-]+\//g))
        .map((match) => match[0]);

    return paths.length > 0 ? paths.join(', ') : undefined;
}

function replaceProjectFactsLine(
    content: string,
    label: string,
    value: string,
): string {
    const linePattern = new RegExp(`- ${label}: .*`, 'g');
    if (linePattern.test(content)) {
        return content.replace(linePattern, `- ${label}: ${value}`);
    }

    return content;
}

export function syncProjectFacts(teamContent: string, scanResult: ScanResult): string {
    let updated = teamContent;

    const packageManager = findFact(scanResult, 'Package Manager');
    const framework = findFact(scanResult, 'Framework');
    const deploy = findFact(scanResult, 'Deploy');
    const runCommand = findScript(scanResult, 'dev') ?? findScript(scanResult, 'start');
    const buildCommand = findScript(scanResult, 'build');
    const testCommand = findScript(scanResult, 'test');
    const database = findDatabase(scanResult);
    const knownPaths = findKnownPaths(scanResult);

    if (packageManager) {
        updated = replaceProjectFactsLine(updated, 'Package manager', packageManager);
    }
    if (runCommand) {
        updated = replaceProjectFactsLine(updated, 'Run command', runCommand);
    }
    if (buildCommand) {
        updated = replaceProjectFactsLine(updated, 'Build command', buildCommand);
    }
    if (testCommand) {
        updated = replaceProjectFactsLine(updated, 'Test command', testCommand);
    }
    if (knownPaths) {
        updated = replaceProjectFactsLine(updated, 'Known paths', knownPaths);
    }
    if (framework) {
        updated = replaceProjectFactsLine(updated, 'Framework', framework);
    }
    if (database) {
        updated = replaceProjectFactsLine(updated, 'Database', database);
    }
    if (deploy) {
        updated = replaceProjectFactsLine(updated, 'Deploy target', deploy);
    }

    return updated;
}

// ─── 4-method command pattern ────────────────────────────────────

/**
 * Validate: must be run inside a StackMoss project directory.
 */
export function parseArgs(): { projectPath: string; configPath: string } {
    const projectPath = resolve('.');
    const configPath = join(projectPath, CONFIG_FILENAME);

    if (!existsSync(configPath)) {
        throw new Error(
            `No ${CONFIG_FILENAME} found in current directory.\n` +
            `   Run 'stackmoss new <project_name>' first to create a project.`,
        );
    }

    return { projectPath, configPath };
}

/**
 * Check: must be in GLOBAL state.
 */
export function checkState(configPath: string): void {
    const currentState = readState(configPath);

    if (currentState !== 'GLOBAL') {
        throw new Error(
            `Command 'inject' is only available in GLOBAL state.\n` +
            `   Current state: ${currentState}.` +
            (currentState === 'MIGRATING'
                ? ' Already injected — use `stackmoss resolve` to answer questions.'
                : ''),
        );
    }
}

/**
 * Execute: scan repo → generate report → transition state.
 */
export function execute(
    projectPath: string,
    configPath: string,
): InjectResult {
    // 1. Scan repo
    const projectName = projectPath.split(/[\\/]/).pop() ?? 'unknown';
    const scanResult = scanRepo(projectPath);

    // 2. Generate MIGRATION_REPORT.md
    const reportContent = renderMigrationReport(projectName, scanResult);
    const reportPath = join(projectPath, MIGRATION_REPORT_FILENAME);
    writeFileSync(reportPath, reportContent, 'utf-8');

    // 3. Sync team.md PROJECT_FACTS from detected repo facts
    const teamPath = join(projectPath, 'team.md');
    if (existsSync(teamPath)) {
        const teamContent = readFileSync(teamPath, 'utf-8');
        const updatedTeam = syncProjectFacts(teamContent, scanResult);
        if (updatedTeam !== teamContent) {
            writeFileSync(teamPath, updatedTeam, 'utf-8');
        }
    }

    // 4. Ensure .agents/ directory exists in project
    const agentsDir = join(projectPath, '.agents');
    if (!existsSync(agentsDir)) {
        mkdirSync(agentsDir, { recursive: true });
    }

    // 5. Transition state: GLOBAL → MIGRATING
    transitionState(configPath, 'GLOBAL', 'MIGRATING');

    return {
        projectPath,
        configPath,
        scanResult,
        reportPath,
        teamPath: existsSync(teamPath) ? teamPath : undefined,
    };
}

/**
 * Report: print summary to user.
 */
export function report(result: InjectResult): void {
    const { scanResult } = result;

    console.log('\n✅ Repo scanned and MIGRATION_REPORT.md generated.');
    console.log(`   State: GLOBAL → MIGRATING`);
    console.log('');
    console.log(`   📊 Facts found: ${scanResult.facts.length}`);
    console.log(`   🔍 Hypotheses: ${scanResult.hypotheses.length}`);
    console.log(`   ❓ Open questions: ${scanResult.openQuestions.length}`);
    console.log('');

    if (scanResult.openQuestions.length > 0) {
        console.log('   Next steps:');
        console.log('   1. Review MIGRATION_REPORT.md');
        console.log('   2. Run `stackmoss resolve` to answer open questions');
        console.log('   3. Run `stackmoss promote --confirm` when ready');
    } else {
        console.log('   No open questions — ready to promote!');
        console.log('   Run `stackmoss promote --confirm` to go OPERATIONAL.');
    }
}

/**
 * Full command handler: parseArgs → checkState → execute → report
 */
export function handler(): void {
    const { projectPath, configPath } = parseArgs();
    checkState(configPath);
    const result = execute(projectPath, configPath);
    report(result);
}
