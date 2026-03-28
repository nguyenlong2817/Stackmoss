import type { RepoMapResult } from '../scanner/repo-map.js';
import type { GeneratedFile, TemplateInput } from './types.js';

interface MatrixRow {
    module: string;
    owns: string;
    dependsOn: string;
    usedBy: string;
    impact: string;
    mustTest: string;
}

function toTopLevelModule(path: string): string {
    return path.split('/')[0] ?? path;
}

function collectTopLevelModules(result: RepoMapResult): string[] {
    const modules = new Set<string>();
    for (const dir of result.dirAnnotations) {
        const top = toTopLevelModule(dir.path);
        if (top && top !== '.') {
            modules.add(top);
        }
    }
    if (modules.size === 0) {
        modules.add('src');
    }
    return [...modules].sort((a, b) => a.localeCompare(b));
}

function findPurpose(result: RepoMapResult, module: string): string {
    const exact = result.dirAnnotations.find((dir) => dir.path === module);
    if (exact?.purpose) return exact.purpose;

    const partial = result.dirAnnotations.find((dir) => toTopLevelModule(dir.path) === module && dir.purpose);
    return partial?.purpose || 'Core module logic';
}

function joinOrDash(items: string[]): string {
    if (items.length === 0) return '-';
    return items.join(', ');
}

function deriveMustTest(module: string): string {
    const value = module.toLowerCase();
    if (['api', 'routes', 'controllers', 'backend'].includes(value)) {
        return 'API smoke + integration checks';
    }
    if (['components', 'pages', 'frontend', 'ui'].includes(value)) {
        return 'UI interaction + responsive checks';
    }
    if (['db', 'database', 'migrations', 'prisma'].includes(value)) {
        return 'migration safety + data compatibility checks';
    }
    if (['scripts', 'tools', 'devops'].includes(value)) {
        return 'command run smoke + pipeline checks';
    }
    return 'targeted unit + impacted integration path checks';
}

function buildMatrixRows(result: RepoMapResult): MatrixRow[] {
    const modules = collectTopLevelModules(result);

    return modules.map((module) => {
        const dependsOn = result.moduleDeps
            .filter((dep) => toTopLevelModule(dep.from) === module)
            .map((dep) => toTopLevelModule(dep.to))
            .filter((value, index, arr) => arr.indexOf(value) === index)
            .sort((a, b) => a.localeCompare(b));

        const usedBy = result.moduleDeps
            .filter((dep) => toTopLevelModule(dep.to) === module)
            .map((dep) => toTopLevelModule(dep.from))
            .filter((value, index, arr) => arr.indexOf(value) === index)
            .sort((a, b) => a.localeCompare(b));

        const impact = usedBy.length > 0
            ? `Changes can break ${usedBy.join(', ')}`
            : 'Changes mainly affect local module behavior';

        return {
            module,
            owns: findPurpose(result, module),
            dependsOn: joinOrDash(dependsOn),
            usedBy: joinOrDash(usedBy),
            impact,
            mustTest: deriveMustTest(module),
        };
    });
}

function renderArchitectureOverview(result: RepoMapResult): string[] {
    const lines: string[] = [];
    lines.push('## Architecture Overview');
    lines.push('');
    lines.push(`- Type: ${result.archType}`);
    if (result.languages.length > 0) {
        const langs = result.languages.slice(0, 3).map((lang) => `${lang.name} (${lang.percentage}%)`).join(', ');
        lines.push(`- Primary languages: ${langs}`);
    }
    if (result.entryPoints.length > 0) {
        const entries = result.entryPoints.slice(0, 6).map((entry) => `\`${entry}\``).join(', ');
        lines.push(`- Entry points: ${entries}`);
    }
    if (result.patterns.length > 0) {
        lines.push(`- Detected patterns: ${result.patterns.join(', ')}`);
    }
    lines.push('');
    return lines;
}

function renderMatrix(rows: MatrixRow[]): string[] {
    const lines: string[] = [];
    lines.push('## Module Matrix');
    lines.push('');
    lines.push('| Module | Owns | Depends On | Used By | Impact When Changed | Must Test |');
    lines.push('|:--|:--|:--|:--|:--|:--|');
    for (const row of rows) {
        lines.push(`| \`${row.module}\` | ${row.owns} | ${row.dependsOn} | ${row.usedBy} | ${row.impact} | ${row.mustTest} |`);
    }
    lines.push('');
    return lines;
}

function renderCriticalFlows(result: RepoMapResult): string[] {
    const lines: string[] = [];
    lines.push('## Critical Flows');
    lines.push('');

    const deps = result.moduleDeps
        .map((dep) => `${toTopLevelModule(dep.from)} -> ${toTopLevelModule(dep.to)}`)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 10);

    if (deps.length === 0) {
        lines.push('- (No explicit module dependency edges detected. Add key flows manually as repo evolves.)');
    } else {
        for (const dep of deps) {
            lines.push(`- ${dep}`);
        }
    }

    lines.push('');
    return lines;
}

function renderChangeRules(): string[] {
    return [
        '## Change Rules',
        '',
        '- Update this file when module boundaries, dependencies, entry points, or critical flows change.',
        '- Do not rewrite the whole file for small edits. Patch only impacted rows and flow lines.',
        '- Before modifying a module, read its row and all rows listed in `Used By` and `Depends On`.',
        '- After code changes, update `Must Test` evidence in your workflow notes.',
        '',
    ];
}

export function generateCodeMap(result: RepoMapResult, projectName: string): GeneratedFile {
    const lines: string[] = [];
    lines.push(`# Code Map - ${projectName}`);
    lines.push('');
    lines.push('> Auto-generated by `stackmoss map` and maintained by agents.');
    lines.push('> Purpose: show module relationships and likely impact when a module changes.');
    lines.push('');

    lines.push(...renderArchitectureOverview(result));
    lines.push(...renderMatrix(buildMatrixRows(result)));
    lines.push(...renderCriticalFlows(result));
    lines.push(...renderChangeRules());

    return {
        path: 'CODE_MAP.md',
        content: `${lines.join('\n')}\n`,
    };
}

export function generateCodeMapSkeleton(input: TemplateInput): GeneratedFile {
    const lines: string[] = [];
    lines.push(`# Code Map - ${input.projectName}`);
    lines.push('');
    lines.push('> Bootstrap skeleton. Update after implementation starts and module boundaries become real.');
    lines.push('');
    lines.push('## Architecture Overview');
    lines.push('');
    lines.push('- Type: bootstrap workspace');
    lines.push(`- BRD status: ${input.intake.brdStatus}`);
    lines.push('- Entry points: (to be filled)');
    lines.push('');
    lines.push('## Module Matrix');
    lines.push('');
    lines.push('| Module | Owns | Depends On | Used By | Impact When Changed | Must Test |');
    lines.push('|:--|:--|:--|:--|:--|:--|');
    lines.push('| `src` | Core application logic | - | - | Changes affect primary app behavior | targeted unit + integration path checks |');
    lines.push('| `tests` | Verification and regression coverage | src | - | Changes can hide defects or increase false positives | smoke + critical regression suite |');
    lines.push('');
    lines.push('## Critical Flows');
    lines.push('');
    lines.push('- intake -> PM lock BRD -> TL plan -> implementation lanes');
    lines.push('');
    lines.push('## Change Rules');
    lines.push('');
    lines.push('- Update only impacted rows when structure or dependencies change.');
    lines.push('- Before editing a module, inspect `Depends On` and `Used By` first.');
    lines.push('- Keep this file concise and factual; avoid historical logs.');
    lines.push('');

    return {
        path: 'CODE_MAP.md',
        content: `${lines.join('\n')}\n`,
    };
}

