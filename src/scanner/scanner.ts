/**
 * Repo Scanner — deterministic, read-only analysis
 * Authority: BRD §13, cli-pipeline skill
 *
 * Permission boundaries (MIGRATING state):
 * - ✅ Read repo structure, config files
 * - ✅ Safe commands: ls, cat, find
 * - ❌ No code execution, no source modification, no external API
 *
 * Deterministic: no LLM, no heuristic guessing beyond defined rules.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import type { ScanResult, Fact, Hypothesis, Question, PackageJsonPartial } from './types.js';

// ─── Known Framework Detection ──────────────────────────────────

const FRAMEWORK_MAP: Record<string, string> = {
    'next': 'Next.js',
    'nuxt': 'Nuxt',
    'react': 'React',
    'vue': 'Vue',
    'angular': 'Angular',
    'svelte': 'Svelte',
    'express': 'Express',
    'fastify': 'Fastify',
    'nestjs': 'NestJS',
    '@nestjs/core': 'NestJS',
    'hono': 'Hono',
    'django': 'Django',
    'flask': 'Flask',
    'fastapi': 'FastAPI',
};

const DB_MAP: Record<string, string> = {
    'pg': 'PostgreSQL',
    'mysql2': 'MySQL',
    'mongodb': 'MongoDB',
    'mongoose': 'MongoDB',
    'prisma': 'Prisma ORM',
    '@prisma/client': 'Prisma ORM',
    'typeorm': 'TypeORM',
    'drizzle-orm': 'Drizzle ORM',
    'sequelize': 'Sequelize',
    'sqlite3': 'SQLite',
    'better-sqlite3': 'SQLite',
    'redis': 'Redis',
    'ioredis': 'Redis',
};

const DEPLOY_FILES: Record<string, string> = {
    'Dockerfile': 'Docker',
    'docker-compose.yml': 'Docker Compose',
    'docker-compose.yaml': 'Docker Compose',
    'vercel.json': 'Vercel',
    'netlify.toml': 'Netlify',
    'fly.toml': 'Fly.io',
    'render.yaml': 'Render',
    'railway.json': 'Railway',
    'Procfile': 'Heroku',
    '.github/workflows': 'GitHub Actions',
};

const PACKAGE_MANAGER_LOCKFILES: Record<string, string> = {
    'package-lock.json': 'npm',
    'yarn.lock': 'yarn',
    'pnpm-lock.yaml': 'pnpm',
    'bun.lockb': 'bun',
};

// ─── Main Scanner ────────────────────────────────────────────────

export function scanRepo(repoPath: string): ScanResult {
    const facts: Fact[] = [];
    const hypotheses: Hypothesis[] = [];
    const openQuestions: Question[] = [];

    // ── 1. Package Manager Detection ─────────────────────────
    const pmResult = detectPackageManager(repoPath);
    if (pmResult) {
        facts.push(pmResult);
    }

    // ── 2. Package.json Analysis ─────────────────────────────
    const pkgJsonPath = join(repoPath, 'package.json');
    let pkgJson: PackageJsonPartial | null = null;

    if (existsSync(pkgJsonPath)) {
        try {
            pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as PackageJsonPartial;
            facts.push({
                category: 'Project Name',
                value: pkgJson.name ?? '(unnamed)',
                source: 'package.json',
            });
        } catch {
            hypotheses.push({
                category: 'Package JSON',
                value: 'package.json exists but could not be parsed',
                confidence: 50,
                source: 'package.json',
                critical: false,
            });
        }
    }

    // ── 3. Framework Detection ───────────────────────────────
    if (pkgJson) {
        const allDeps = {
            ...pkgJson.dependencies,
            ...pkgJson.devDependencies,
        };
        const detectedFrameworks = detectFromDeps(allDeps, FRAMEWORK_MAP);

        for (const fw of detectedFrameworks) {
            facts.push({
                category: 'Framework',
                value: `${fw.name} (${fw.version})`,
                source: 'package.json dependencies',
            });
        }

        // ── 4. Database Detection ────────────────────────────
        const detectedDBs = detectFromDeps(allDeps, DB_MAP);

        for (const db of detectedDBs) {
            // DB from deps is a hypothesis — might be unused
            hypotheses.push({
                category: 'Database',
                value: `${db.name} (${db.version})`,
                confidence: 65,
                source: 'package.json dependencies',
                critical: false,
            });
        }

        // ── 5. Run Commands ──────────────────────────────────
        if (pkgJson.scripts) {
            const importantScripts = ['dev', 'start', 'build', 'test', 'lint'];
            for (const script of importantScripts) {
                if (pkgJson.scripts[script]) {
                    facts.push({
                        category: 'Script',
                        value: `${script}: \`${pkgJson.scripts[script]}\``,
                        source: 'package.json scripts',
                    });
                }
            }
        }
    }

    // ── 6. Python Detection (fallback if no package.json) ────
    if (!pkgJson) {
        const pyFiles = ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'];
        for (const pyFile of pyFiles) {
            if (existsSync(join(repoPath, pyFile))) {
                facts.push({
                    category: 'Language',
                    value: 'Python',
                    source: pyFile,
                });
                break;
            }
        }
    }

    // ── 7. Monorepo Detection ────────────────────────────────
    const monoResult = detectMonorepo(repoPath, pkgJson);
    if (monoResult) {
        hypotheses.push(monoResult);
    }

    // ── 8. Deploy Config Detection ───────────────────────────
    const deployResults = detectDeployConfig(repoPath);
    for (const deploy of deployResults) {
        facts.push(deploy);
    }

    // ── 9. Generate Open Questions ───────────────────────────
    openQuestions.push(...generateQuestions(facts, hypotheses));

    return { facts, hypotheses, openQuestions };
}

// ─── Helper: Detect Package Manager ─────────────────────────────

function detectPackageManager(repoPath: string): Fact | null {
    for (const [lockfile, pm] of Object.entries(PACKAGE_MANAGER_LOCKFILES)) {
        if (existsSync(join(repoPath, lockfile))) {
            return {
                category: 'Package Manager',
                value: pm,
                source: lockfile,
            };
        }
    }
    // Fallback: if package.json exists but no lockfile
    if (existsSync(join(repoPath, 'package.json'))) {
        return {
            category: 'Package Manager',
            value: 'npm (assumed — no lockfile found)',
            source: 'package.json',
        };
    }
    return null;
}

// ─── Helper: Detect from Dependencies ───────────────────────────

interface DetectedDep {
    name: string;
    version: string;
}

function detectFromDeps(
    deps: Record<string, string> | undefined,
    mapping: Record<string, string>,
): DetectedDep[] {
    if (!deps) return [];

    const detected: DetectedDep[] = [];
    const seen = new Set<string>();

    for (const [depName, version] of Object.entries(deps)) {
        const mapped = mapping[depName];
        if (mapped && !seen.has(mapped)) {
            seen.add(mapped);
            detected.push({ name: mapped, version });
        }
    }

    return detected;
}

// ─── Helper: Detect Monorepo ────────────────────────────────────

function detectMonorepo(
    repoPath: string,
    pkgJson: PackageJsonPartial | null,
): Hypothesis | null {
    const signals: string[] = [];

    // Check workspaces field
    if (pkgJson?.workspaces) {
        signals.push('workspaces field in package.json');
    }

    // Check common monorepo dirs
    const monoDirs = ['apps', 'packages', 'libs', 'modules'];
    for (const dir of monoDirs) {
        const dirPath = join(repoPath, dir);
        if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
            signals.push(`/${dir}/ directory exists`);
        }
    }

    // Check lerna/nx/turbo
    const monoTools = ['lerna.json', 'nx.json', 'turbo.json'];
    for (const tool of monoTools) {
        if (existsSync(join(repoPath, tool))) {
            signals.push(`${tool} found`);
        }
    }

    if (signals.length === 0) return null;

    const confidence = Math.min(95, 50 + signals.length * 15);
    return {
        category: 'Monorepo',
        value: `YES — ${signals.join(', ')}`,
        confidence,
        source: signals.join(' + '),
        critical: true,  // Monorepo affects config significantly
    };
}

// ─── Helper: Detect Deploy Config ───────────────────────────────

function detectDeployConfig(repoPath: string): Fact[] {
    const results: Fact[] = [];

    for (const [file, platform] of Object.entries(DEPLOY_FILES)) {
        const fullPath = join(repoPath, file);
        if (existsSync(fullPath)) {
            results.push({
                category: 'Deploy',
                value: platform,
                source: file,
            });
        }
    }

    return results;
}

// ─── Helper: Generate Questions from Gaps ────────────────────────

function generateQuestions(facts: Fact[], hypotheses: Hypothesis[]): Question[] {
    const questions: Question[] = [];
    let qId = 1;

    const factCategories = new Set(facts.map((f) => f.category));

    // No deploy config found → ask
    if (!factCategories.has('Deploy')) {
        questions.push({
            id: `OQ${qId++}`,
            text: 'Deploy target là gì? (VPS, Vercel, Docker, etc.)',
            impact: 'Ảnh hưởng OPS config và deploy scripts',
            resolved: false,
        });
    }

    // Check if auth-related deps exist
    const hasAuth = facts.some((f) =>
        f.value.toLowerCase().includes('passport') ||
        f.value.toLowerCase().includes('auth') ||
        f.value.toLowerCase().includes('jwt'),
    ) || hypotheses.some((h) =>
        h.value.toLowerCase().includes('passport') ||
        h.value.toLowerCase().includes('auth'),
    );

    if (!hasAuth) {
        questions.push({
            id: `OQ${qId++}`,
            text: 'Có auth/login layer không?',
            impact: 'Ảnh hưởng SEC-lite config',
            resolved: false,
        });
    }

    // Monorepo detected → ask about entry point
    const monoHyp = hypotheses.find((h) => h.category === 'Monorepo');
    if (monoHyp) {
        questions.push({
            id: `OQ${qId++}`,
            text: 'Entry point chính của project là folder nào?',
            impact: 'Ảnh hưởng DEV-ENV commands và path references',
            resolved: false,
        });
    }

    return questions;
}
