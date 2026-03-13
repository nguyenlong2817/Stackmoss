/**
 * Tests: Migration Report Renderer + Parser
 * Authority: BRD §9.5
 */

import { describe, it, expect } from 'vitest';
import { renderMigrationReport, parseMigrationReport } from '../../src/scanner/report.js';
import type { ScanResult } from '../../src/scanner/types.js';

function createScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
    return {
        facts: overrides.facts ?? [
            { category: 'Package Manager', value: 'npm', source: 'package-lock.json' },
            { category: 'Framework', value: 'Next.js (^14.0.0)', source: 'package.json dependencies' },
        ],
        hypotheses: overrides.hypotheses ?? [
            { category: 'Database', value: 'PostgreSQL (^8.0.0)', confidence: 65, source: 'package.json', critical: false },
        ],
        openQuestions: overrides.openQuestions ?? [
            { id: 'OQ1', text: 'Deploy target?', impact: 'OPS config', resolved: false },
        ],
    };
}

describe('Migration Report Renderer', () => {
    it('renders report with correct structure', () => {
        const report = renderMigrationReport('test-project', createScanResult());

        expect(report).toContain('# Migration Report — test-project');
        expect(report).toContain('## FACTS (confidence: high)');
        expect(report).toContain('## HYPOTHESES (confidence: medium');
        expect(report).toContain('## OPEN QUESTIONS');
    });

    it('includes facts with source', () => {
        const report = renderMigrationReport('test', createScanResult());

        expect(report).toContain('**Package Manager:** npm');
        expect(report).toContain('from package-lock.json');
    });

    it('includes hypotheses with confidence', () => {
        const report = renderMigrationReport('test', createScanResult());

        expect(report).toContain('**Database:** PostgreSQL');
        expect(report).toContain('confidence: 65%');
    });

    it('marks critical hypotheses', () => {
        const result = createScanResult({
            hypotheses: [{
                category: 'Monorepo',
                value: 'YES',
                confidence: 72,
                source: 'workspaces',
                critical: true,
            }],
        });

        const report = renderMigrationReport('test', result);
        expect(report).toContain('⚠️ CRITICAL');
    });

    it('renders unresolved questions as checkboxes', () => {
        const report = renderMigrationReport('test', createScanResult());

        expect(report).toContain('- [ ] **[OQ1]**');
        expect(report).toContain('Deploy target?');
    });

    it('renders resolved questions as checked', () => {
        const result = createScanResult({
            openQuestions: [
                { id: 'OQ1', text: 'Deploy target?', impact: 'OPS', resolved: true, answer: 'Vercel' },
            ],
        });

        const report = renderMigrationReport('test', result);
        expect(report).toContain('- [x] **[OQ1]**');
        expect(report).toContain('→ Vercel');
    });

    it('renders empty results gracefully', () => {
        const result = createScanResult({
            facts: [],
            hypotheses: [],
            openQuestions: [],
        });

        const report = renderMigrationReport('test', result);
        expect(report).toContain('No facts detected');
        expect(report).toContain('No hypotheses generated');
        expect(report).toContain('No open questions');
    });

    it('includes promote instruction in footer', () => {
        const report = renderMigrationReport('test', createScanResult());
        expect(report).toContain('stackmoss promote --confirm');
    });
});

describe('Migration Report Parser', () => {
    it('detects unresolved questions', () => {
        const report = renderMigrationReport('test', createScanResult());
        const parsed = parseMigrationReport(report);

        expect(parsed.hasUnresolvedQuestions).toBe(true);
        expect(parsed.unresolvedCount).toBe(1);
    });

    it('detects resolved questions', () => {
        const result = createScanResult({
            openQuestions: [
                { id: 'OQ1', text: 'Q1?', impact: 'test', resolved: true, answer: 'Yes' },
            ],
        });
        const report = renderMigrationReport('test', result);
        const parsed = parseMigrationReport(report);

        expect(parsed.hasUnresolvedQuestions).toBe(false);
        expect(parsed.resolvedCount).toBe(1);
    });

    it('detects critical low-confidence hypotheses', () => {
        const result = createScanResult({
            hypotheses: [{
                category: 'Monorepo',
                value: 'YES',
                confidence: 55,
                source: 'apps/ folder',
                critical: true,
            }],
        });
        const report = renderMigrationReport('test', result);
        const parsed = parseMigrationReport(report);

        expect(parsed.hasCriticalLowConfidence).toBe(true);
    });

    it('passes when critical hypotheses have high confidence', () => {
        const result = createScanResult({
            hypotheses: [{
                category: 'Monorepo',
                value: 'YES',
                confidence: 85,
                source: 'workspaces + packages/',
                critical: true,
            }],
        });
        const report = renderMigrationReport('test', result);
        const parsed = parseMigrationReport(report);

        expect(parsed.hasCriticalLowConfidence).toBe(false);
    });

    it('treats decimal critical confidence below 80 as blocking', () => {
        const report = `# Migration Report — test

## HYPOTHESES (confidence: medium, cần verify)
- **Monorepo:** YES (confidence: 79.9%) ⚠️ CRITICAL — from apps/

## OPEN QUESTIONS (cần human confirm trước khi promote)
_No open questions — all clear for promote._
`;

        const parsed = parseMigrationReport(report);
        expect(parsed.hasCriticalLowConfidence).toBe(true);
    });

    it('counts unresolved items only inside OPEN QUESTIONS', () => {
        const report = `# Migration Report — test

## FACTS (confidence: high)
- [ ] **[NOT_A_QUESTION]** checklist item in facts

## OPEN QUESTIONS (cần human confirm trước khi promote)
_No open questions — all clear for promote._
`;

        const parsed = parseMigrationReport(report);
        expect(parsed.unresolvedCount).toBe(0);
        expect(parsed.hasUnresolvedQuestions).toBe(false);
    });

    it('handles report with no questions', () => {
        const result = createScanResult({ openQuestions: [] });
        const report = renderMigrationReport('test', result);
        const parsed = parseMigrationReport(report);

        expect(parsed.hasUnresolvedQuestions).toBe(false);
        expect(parsed.unresolvedCount).toBe(0);
    });
});
