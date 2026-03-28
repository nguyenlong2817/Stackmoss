/**
 * Command: stackmoss map
 * Generate or refresh CODE_MAP.md — structural + impact overview of the repository.
 *
 * Pattern: parseArgs → checkState → execute → report
 * (per cli-pipeline skill)
 */

import { existsSync, writeFileSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { CONFIG_FILENAME } from '../config.js';
import { generateRepoMap as scanRepoMap } from '../scanner/repo-map.js';
import { generateCodeMap as renderCodeMap } from '../templates/code-map.js';

// ─── Types ──────────────────────────────────────────────────────

export interface MapCommandArgs {
    depth: number;
}

export interface MapCommandResult {
    projectPath: string;
    codeMapPath: string;
    dirCount: number;
    langCount: number;
    configCount: number;
    patternCount: number;
    wasRefresh: boolean;
}

// ─── 4-method command pattern ───────────────────────────────────

export function parseArgs(options: { depth?: number }): MapCommandArgs {
    const depth = options.depth ?? 3;

    if (depth < 1 || depth > 6) {
        throw new Error('Depth must be between 1 and 6.');
    }

    return { depth };
}

export function checkState(): void {
    const projectPath = resolve('.');
    const configPath = join(projectPath, CONFIG_FILENAME);

    if (!existsSync(configPath)) {
        throw new Error(
            'No StackMoss project found in current directory. ' +
            'Run `stackmoss init` or `stackmoss new` first.',
        );
    }
}

export function execute(args: MapCommandArgs): MapCommandResult {
    const projectPath = resolve('.');
    const codeMapPath = join(projectPath, 'CODE_MAP.md');
    const wasRefresh = existsSync(codeMapPath);

    // Scan
    const result = scanRepoMap(projectPath, args.depth);

    // Render
    const projectName = basename(projectPath);
    const file = renderCodeMap(result, projectName);

    // Write
    writeFileSync(codeMapPath, file.content, 'utf-8');

    return {
        projectPath,
        codeMapPath,
        dirCount: result.dirAnnotations.length,
        langCount: result.languages.length,
        configCount: result.configFiles.length,
        patternCount: result.patterns.length,
        wasRefresh,
    };
}

export function report(result: MapCommandResult): void {
    const action = result.wasRefresh ? 'Refreshed' : 'Generated';
    console.log(`\n✅ ${action} CODE_MAP.md`);
    console.log(`   📁 ${result.dirCount} directories annotated`);
    console.log(`   🔤 ${result.langCount} languages detected`);
    console.log(`   ⚙️  ${result.configCount} config files found`);
    console.log(`   🏗️  ${result.patternCount} architecture patterns identified`);
    console.log(`\n   Path: ${result.codeMapPath}`);
}

export function handler(options: { depth?: number }): void {
    const args = parseArgs(options);
    checkState();
    const result = execute(args);
    report(result);
}
