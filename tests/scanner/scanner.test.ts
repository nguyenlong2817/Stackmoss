/**
 * Tests: Repo Scanner
 * Authority: BRD §13
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { scanRepo } from '../../src/scanner/scanner.js';

const TEST_DIR = join(process.cwd(), '__test_scan_repo__');

function setupTestRepo(files: Record<string, string>): void {
    mkdirSync(TEST_DIR, { recursive: true });
    for (const [path, content] of Object.entries(files)) {
        const fullPath = join(TEST_DIR, path);
        const dir = fullPath.split(/[\\/]/).slice(0, -1).join('/');
        mkdirSync(dir, { recursive: true });
        writeFileSync(fullPath, content, 'utf-8');
    }
}

function cleanup(): void {
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

describe('Repo Scanner', () => {
    beforeEach(cleanup);
    afterEach(cleanup);

    it('detects npm from package-lock.json', () => {
        setupTestRepo({
            'package.json': '{"name":"test"}',
            'package-lock.json': '{}',
        });

        const result = scanRepo(TEST_DIR);
        const pmFact = result.facts.find((f) => f.category === 'Package Manager');
        expect(pmFact).toBeDefined();
        expect(pmFact!.value).toBe('npm');
    });

    it('detects pnpm from pnpm-lock.yaml', () => {
        setupTestRepo({
            'package.json': '{"name":"test"}',
            'pnpm-lock.yaml': '',
        });

        const result = scanRepo(TEST_DIR);
        const pmFact = result.facts.find((f) => f.category === 'Package Manager');
        expect(pmFact!.value).toBe('pnpm');
    });

    it('detects framework from dependencies', () => {
        setupTestRepo({
            'package.json': JSON.stringify({
                name: 'test',
                dependencies: { next: '^14.0.0' },
            }),
            'package-lock.json': '{}',
        });

        const result = scanRepo(TEST_DIR);
        const fwFact = result.facts.find((f) => f.category === 'Framework');
        expect(fwFact).toBeDefined();
        expect(fwFact!.value).toContain('Next.js');
    });

    it('detects database from dependencies as hypothesis', () => {
        setupTestRepo({
            'package.json': JSON.stringify({
                name: 'test',
                dependencies: { pg: '^8.0.0' },
            }),
            'package-lock.json': '{}',
        });

        const result = scanRepo(TEST_DIR);
        const dbHyp = result.hypotheses.find((h) => h.category === 'Database');
        expect(dbHyp).toBeDefined();
        expect(dbHyp!.value).toContain('PostgreSQL');
        expect(dbHyp!.confidence).toBeLessThan(100);
    });

    it('detects monorepo signals', () => {
        setupTestRepo({
            'package.json': JSON.stringify({
                name: 'test',
                workspaces: ['packages/*'],
            }),
            'package-lock.json': '{}',
            'packages/foo/index.ts': '',
        });

        const result = scanRepo(TEST_DIR);
        const monoHyp = result.hypotheses.find((h) => h.category === 'Monorepo');
        expect(monoHyp).toBeDefined();
        expect(monoHyp!.value).toContain('YES');
        expect(monoHyp!.critical).toBe(true);
    });

    it('detects deploy config', () => {
        setupTestRepo({
            'package.json': '{"name":"test"}',
            'package-lock.json': '{}',
            'Dockerfile': 'FROM node:18',
        });

        const result = scanRepo(TEST_DIR);
        const deployFact = result.facts.find((f) => f.category === 'Deploy');
        expect(deployFact).toBeDefined();
        expect(deployFact!.value).toBe('Docker');
    });

    it('extracts scripts from package.json', () => {
        setupTestRepo({
            'package.json': JSON.stringify({
                name: 'test',
                scripts: { dev: 'next dev', build: 'next build' },
            }),
            'package-lock.json': '{}',
        });

        const result = scanRepo(TEST_DIR);
        const scriptFacts = result.facts.filter((f) => f.category === 'Script');
        expect(scriptFacts.length).toBeGreaterThanOrEqual(2);
    });

    it('generates question when no deploy config found', () => {
        setupTestRepo({
            'package.json': '{"name":"test"}',
            'package-lock.json': '{}',
        });

        const result = scanRepo(TEST_DIR);
        const deployQ = result.openQuestions.find((q) =>
            q.text.toLowerCase().includes('deploy'),
        );
        expect(deployQ).toBeDefined();
    });

    it('handles empty repository', () => {
        setupTestRepo({});

        const result = scanRepo(TEST_DIR);
        expect(result.facts.length).toBe(0);
        expect(result.hypotheses.length).toBe(0);
    });

    it('detects Python projects', () => {
        setupTestRepo({
            'requirements.txt': 'flask==2.0.0',
        });

        const result = scanRepo(TEST_DIR);
        const langFact = result.facts.find((f) => f.category === 'Language');
        expect(langFact).toBeDefined();
        expect(langFact!.value).toBe('Python');
    });
});
