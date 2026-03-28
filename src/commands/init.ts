/**
 * Command: stackmoss init [project_name]
 * Phase A/B bridge: bootstrap StackMoss in the current repository.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG_FILENAME } from '../config.js';
import { runIntake, reportIntake } from '../intake/index.js';
import type { IntakeResult } from '../intake/types.js';
import { compileBootstrapTargets } from '../compile/index.js';
import { generateAllFiles } from '../templates/index.js';
import type { TemplateInput } from '../templates/types.js';
import { getReadmePath } from '../user-guidance.js';
import type { InjectResult } from './inject.js';
import { execute as injectExecute } from './inject.js';
import { writeFilesAtomically } from './new.js';
import { generateRepoMap as scanRepoMap } from '../scanner/repo-map.js';
import { generateRepoMap as renderRepoMap } from '../templates/repo-map.js';

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
        return '0.7.0';
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
    'ROLE_SKILL_OVERRIDES.md',
    'AGENTS.md',
    'CLAUDE.md',
    'CALIBRATE.md',
    'calibrate-rule.md',
    'MIGRATION_REPORT.md',
    'REPO_MAP.md',
    '.github/copilot-instructions.md',
    '.github/instructions/team-bootstrap.instructions.md',
    '.claude',
    '.agents',
    '.agent',
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
        console.log('\nGenerated files:');
        for (const file of result.generatedFiles) {
            console.log(`   ${file}`);
        }
    }

    console.log('\nBootstrap runtime outputs generated:');
    console.log('   - Claude Code: CLAUDE.md + .claude/skills/');
    console.log('   - Codex: AGENTS.md + .agents/skills/');
    console.log('   - Antigravity: .agent/{skills,rules,workflows}');

    if (result.injectResult) {
        console.log('\nExisting repo facts were scanned and written to MIGRATION_REPORT.md.');
    } else {
        console.log('\nRepo scan was skipped because the directory looked empty.');
    }

    console.log(`\nSee ${getReadmePath()} for the localized setup playbook.`);
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
    const compileFiles = compileBootstrapTargets(
        intakeResult.roles,
        intakeResult.autoAddedRoles,
        args.projectName,
    );

    result.generatedFiles = writeFilesAtomically(result.projectPath, [...templateFiles, ...compileFiles]);

    if (result.autoInjectPlanned) {
        result.injectResult = injectExecute(result.projectPath, result.configPath);

        // Generate REPO_MAP.md for existing repos
        const repoMapResult = scanRepoMap(result.projectPath);
        const repoMapFile = renderRepoMap(repoMapResult, args.projectName);
        result.generatedFiles.push(
            ...writeFilesAtomically(result.projectPath, [repoMapFile]),
        );
    }

    report(result);
}
