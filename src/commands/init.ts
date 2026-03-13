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
import { compileBootstrapTargets } from '../compile/index.js';
import { execute as injectExecute } from './inject.js';
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
        return '0.6.4';
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
    'AGENTS.md',
    'CLAUDE.md',
    'CALIBRATE.md',
    'calibrate-rule.md',
    'MIGRATION_REPORT.md',
    '.github/copilot-instructions.md',
    '.github/instructions/team-bootstrap.instructions.md',
    '.claude',
    '.cursor',
    '.roo',
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
        console.log('\n📄 Generated files:');
        for (const file of result.generatedFiles) {
            console.log(`   ${file}`);
        }
    }

    console.log('\n🤖 Bootstrap runtime outputs generated:');
    console.log('   - Claude Code: CLAUDE.md + .claude/skills/');
    console.log('   - Cursor: .cursor/skills/');
    console.log('   - VS Code / Copilot: .github/copilot-instructions.md');
    console.log('   - Codex: AGENTS.md');
    console.log('   - Antigravity: .agent/{skills,rules,workflows}');

    if (result.injectResult) {
        console.log('\n🔎 Existing repo facts were scanned and written to MIGRATION_REPORT.md.');
    } else {
        console.log('\n🔎 Repo scan was skipped because the directory looked empty.');
    }

    console.log('\n👉 Recommended next step: open your IDE/CLI and chat with Tech Lead first.');
    console.log('   Prompt: "Tech Lead, scan this repo, ask any follow-up questions needed, then calibrate the team using the StackMoss bootstrap config. Do not apply shared config patches before asking me."');
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
    }

    report(result);
}
