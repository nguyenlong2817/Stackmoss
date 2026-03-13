/**
 * Command: stackmoss init [project_name]
 * Phase A/B bridge: bootstrap StackMoss in the current repository.
 *
 * UX goal:
 * - User stands in an existing repo root
 * - Runs `stackmoss init`
 * - StackMoss generates its files in place
 * - If the repo already has real content, auto-run inject to enter MIGRATING
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG_FILENAME } from '../config.js';
import { runIntake, reportIntake } from '../intake/index.js';
import { generateAllFiles } from '../templates/index.js';
import { compileTarget, DEFAULT_TARGET } from '../compile/index.js';
import { execute as injectExecute, report as reportInject } from './inject.js';
import { writeFilesAtomically } from './new.js';
import type { IntakeResult } from '../intake/types.js';
import type { TemplateInput } from '../templates/types.js';
import type { InjectResult } from './inject.js';

export interface InitCommandArgs {
    projectName: string;
}

export interface InitCommandResult {
    projectPath: string;
    configPath: string;
    projectName: string;
    intakeResult?: IntakeResult;
    generatedFiles: string[];
    autoInjectPlanned: boolean;
    injectResult?: InjectResult;
}

const STACKMOSS_VERSION = (() => {
    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const pkgPath = join(__dirname, '..', '..', 'package.json');
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };
        return pkg.version;
    } catch {
        return '0.6.1';
    }
})();

const RESERVED_STACKMOSS_PATHS = [
    CONFIG_FILENAME,
    'team.md',
    'FEATURES.md',
    'NORTH_STAR.md',
    'NON_GOALS.md',
    'OPEN_QUESTIONS.md',
    'README_AGENT_TEAM.md',
    'CLAUDE.md',
    'CALIBRATE.md',
    'calibrate-rule.md',
    'MIGRATION_REPORT.md',
    '.claude',
    '.cursor',
    '.roo',
    '.agents',
    '.stackmoss',
    'evals',
] as const;

const INIT_IGNORE_ENTRIES = new Set([
    '.git',
    '.gitignore',
    '.gitattributes',
    '.gitmodules',
    '.DS_Store',
    'Thumbs.db',
]);

export function parseArgs(name?: string): InitCommandArgs {
    const derived = basename(resolve('.'));
    const projectName = (name?.trim() || derived || 'stackmoss-project').trim();

    if (projectName.length === 0) {
        throw new Error('Project name is required. Usage: stackmoss init [project_name]');
    }

    if (projectName.length > 80) {
        throw new Error(`Project name too long (${projectName.length} chars, max 80).`);
    }

    return { projectName };
}

export function findReservedConflicts(projectPath: string): string[] {
    return RESERVED_STACKMOSS_PATHS.filter((path) => existsSync(join(projectPath, path)));
}

export function hasExistingRepoContent(projectPath: string): boolean {
    const entries = readdirSync(projectPath, { withFileTypes: true });
    return entries.some((entry) => !INIT_IGNORE_ENTRIES.has(entry.name));
}

export function checkState(): void {
    const projectPath = resolve('.');
    const conflicts = findReservedConflicts(projectPath);

    if (conflicts.length > 0) {
        throw new Error(
            'Current directory already contains StackMoss-managed paths: ' +
            conflicts.join(', ') +
            '. Remove or rename them before running `stackmoss init`.',
        );
    }
}

export function execute(args: InitCommandArgs): InitCommandResult {
    const projectPath = resolve('.');
    return {
        projectPath,
        configPath: join(projectPath, CONFIG_FILENAME),
        projectName: args.projectName,
        generatedFiles: [],
        autoInjectPlanned: hasExistingRepoContent(projectPath),
    };
}

export function report(result: InitCommandResult): void {
    console.log(`\n✅ StackMoss initialized in current repo: ${result.projectPath}`);

    if (result.intakeResult) {
        reportIntake(result.intakeResult);
    }

    if (result.generatedFiles.length > 0) {
        console.log('\n📄 Generated files:');
        for (const file of result.generatedFiles) {
            console.log(`   ${file}`);
        }
    }

    if (result.injectResult) {
        console.log('\n🔎 Existing repo content detected. Auto-running `stackmoss inject`...');
        reportInject(result.injectResult);
        return;
    }

    console.log('\n   State: GLOBAL');
    console.log('   Next step: lock BRD/NORTH_STAR, then ask Tech Lead to calibrate the team.');
}

export async function handler(name?: string): Promise<void> {
    const args = parseArgs(name);
    checkState();
    const result = execute(args);

    const intakeResult = await runIntake();
    result.intakeResult = intakeResult;

    const templateInput: TemplateInput = {
        projectName: args.projectName,
        version: STACKMOSS_VERSION,
        intake: intakeResult,
    };

    const templateFiles = generateAllFiles(templateInput);
    const compileFiles = compileTarget(
        DEFAULT_TARGET,
        intakeResult.roles,
        intakeResult.autoAddedRoles,
        args.projectName,
    );

    result.generatedFiles = writeFilesAtomically(result.projectPath, [...templateFiles, ...compileFiles]);

    if (result.autoInjectPlanned) {
        result.injectResult = injectExecute(result.projectPath, result.configPath);
    }

    report(result);
}
