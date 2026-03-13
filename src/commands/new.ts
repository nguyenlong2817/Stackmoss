/**
 * Command: stackmoss new <project_name>
 * Phase A: Create workspace idea-first (chưa có repo)
 * Authority: BRD §7, §8, §9
 *
 * Pattern: parseArgs → checkState → execute → intake → generate → compile → report
 * (per cli-pipeline skill)
 */

import { existsSync, mkdirSync, writeFileSync, renameSync, rmSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG_FILENAME } from '../config.js';
import { runIntake, reportIntake } from '../intake/index.js';
import { generateAllFiles } from '../templates/index.js';
import { compileTarget, DEFAULT_TARGET } from '../compile/index.js';
import type { IntakeResult } from '../intake/types.js';
import type { GeneratedFile, TemplateInput } from '../templates/types.js';

// ─── Types ───────────────────────────────────────────────────────

export interface NewCommandArgs {
    projectName: string;
}

export interface NewCommandResult {
    projectPath: string;
    configPath: string;
    intakeResult?: IntakeResult;
    generatedFiles: string[];
}

// ─── Constants ───────────────────────────────────────────────────

const STACKMOSS_VERSION = (() => {
    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const pkgPath = join(__dirname, '..', '..', 'package.json');
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };
        return pkg.version;
    } catch {
        return '0.6.0';
    }
})();

// ─── Validation regex: valid folder name ─────────────────────────

const VALID_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const RESERVED_WINDOWS_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;

// ─── 4-method command pattern ────────────────────────────────────

/**
 * Validate CLI arguments for `new` command.
 */
export function parseArgs(name: string | undefined): NewCommandArgs {
    if (!name || name.trim().length === 0) {
        throw new Error('Project name is required. Usage: stackmoss new <project_name>');
    }

    const projectName = name.trim();

    if (!VALID_NAME_REGEX.test(projectName)) {
        throw new Error(
            `Invalid project name '${projectName}'. ` +
            'Use only letters, numbers, dots, hyphens, and underscores. ' +
            'Must start with a letter or number.',
        );
    }

    if (RESERVED_WINDOWS_NAMES.test(projectName)) {
        throw new Error(`Invalid project name '${projectName}'. Reserved device names are not allowed.`);
    }

    if (projectName.length > 64) {
        throw new Error(
            `Project name too long (${projectName.length} chars, max 64).`,
        );
    }

    return { projectName };
}

/**
 * Check preconditions: target folder must not exist.
 * `new` command doesn't require state check (creates new project).
 */
export function checkState(args: NewCommandArgs): void {
    const projectPath = resolve(args.projectName);

    if (existsSync(projectPath)) {
        throw new Error(
            `Folder '${args.projectName}' already exists. ` +
            'Choose a different name or remove the existing folder.',
        );
    }
}

/**
 * Write all generated files atomically.
 *
 * Strategy: write all to .tmp suffixed files first,
 * then rename all at once. On error, cleanup all temp files.
 */
export function writeFilesAtomically(
    projectPath: string,
    files: GeneratedFile[],
): string[] {
    const tempPaths: string[] = [];
    const finalPaths: string[] = [];
    const renamedCount = { value: 0 };

    try {
        // Phase 1: Write all to temp files
        for (const file of files) {
            const finalPath = join(projectPath, file.path);
            const tempPath = finalPath + '.tmp';

            // Ensure directory exists
            const dir = dirname(finalPath);
            mkdirSync(dir, { recursive: true });

            writeFileSync(tempPath, file.content, 'utf-8');
            tempPaths.push(tempPath);
            finalPaths.push(finalPath);
        }

        // Phase 2: Rename all temp → final (atomic on most filesystems)
        for (let i = 0; i < tempPaths.length; i++) {
            renameSync(tempPaths[i], finalPaths[i]);
            renamedCount.value++;
        }

        return files.map((f) => f.path);
    } catch (error) {
        // Rollback: reverse already-renamed files, then delete remaining temps
        for (let i = 0; i < renamedCount.value; i++) {
            try { rmSync(finalPaths[i], { force: true }); } catch { /* ignore */ }
        }
        for (let i = renamedCount.value; i < tempPaths.length; i++) {
            try { rmSync(tempPaths[i], { force: true }); } catch { /* ignore */ }
        }
        throw error;
    }
}

/**
 * Execute: create project folder.
 */
export function execute(args: NewCommandArgs): NewCommandResult {
    const projectPath = resolve(args.projectName);

    if (existsSync(projectPath)) {
        throw new Error(
            `Folder '${args.projectName}' already exists. ` +
            'Choose a different name or remove the existing folder.',
        );
    }

    mkdirSync(projectPath);

    return {
        projectPath,
        configPath: join(projectPath, CONFIG_FILENAME),
        generatedFiles: [],
    };
}

/**
 * Report success to user.
 */
export function report(result: NewCommandResult): void {
    console.log(`\n✅ Project created: ${result.projectPath}`);
    console.log(`   State: GLOBAL`);

    if (result.intakeResult) {
        reportIntake(result.intakeResult);
    }

    if (result.generatedFiles.length > 0) {
        console.log('\n📄 Generated files:');
        for (const file of result.generatedFiles) {
            console.log(`   ${file}`);
        }
    }
}

/**
 * Full command handler: parseArgs → checkState → execute → intake → generate → compile → report
 */
export async function handler(name: string | undefined): Promise<void> {
    const args = parseArgs(name);
    checkState(args);
    const result = execute(args);

    // Run intake engine (interactive Q&A)
    try {
        const intakeResult = await runIntake();
        result.intakeResult = intakeResult;

        // Build template input
        const templateInput: TemplateInput = {
            projectName: args.projectName,
            version: STACKMOSS_VERSION,
            intake: intakeResult,
        };

        // Generate all template files
        const templateFiles = generateAllFiles(templateInput);

        // Compile to Claude Code target
        const compileFiles = compileTarget(
            DEFAULT_TARGET,
            intakeResult.roles,
            intakeResult.autoAddedRoles,
            args.projectName,
        );

        // Atomic write: all files at once
        const allFiles = [...templateFiles, ...compileFiles];
        result.generatedFiles = writeFilesAtomically(result.projectPath, allFiles);

    } catch (error) {
        // If intake/generate failed, clean up the project folder
        const msg = (error as Error).message ?? '';
        if (msg.includes('User force closed') || msg.includes('ExitPromptError')) {
            console.log('\n❌ Cancelled.\n');
        } else {
            console.error('\n⚠️  Setup cancelled or failed. Cleaning up...');
            console.error(`   Error: ${msg}`);
        }
        try { rmSync(result.projectPath, { recursive: true, force: true }); } catch { /* ignore */ }
        return;
    }

    report(result);
}
