import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('@inquirer/prompts', () => ({
    select: vi.fn(),
    input: vi.fn(),
}));

import { select, input } from '@inquirer/prompts';
import { execute as resolveExecute } from '../../src/commands/resolve.js';

const mockSelect = vi.mocked(select);
const mockInput = vi.mocked(input);

const TEST_DIR = join(process.cwd(), '__test_resolve__');
const REPORT_PATH = join(TEST_DIR, 'MIGRATION_REPORT.md');

function cleanup(): void {
    if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

describe('Resolve Command', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();
        mkdirSync(TEST_DIR, { recursive: true });
    });

    afterEach(() => {
        cleanup();
    });

    it('moves answered items into the resolved section', async () => {
        writeFileSync(REPORT_PATH, `# Migration Report — test

## OPEN QUESTIONS (cần human confirm trước khi promote)
- [ ] **[OQ1]** Deploy target? _(OPS)_
`, 'utf-8');

        mockSelect.mockResolvedValueOnce('answer');
        mockInput.mockResolvedValueOnce('Vercel');

        const result = await resolveExecute(REPORT_PATH);

        expect(result.resolvedThisSession).toBe(1);

        const updated = readFileSync(REPORT_PATH, 'utf-8');
        expect(updated).not.toContain('- [ ] **[OQ1]**');
        expect(updated).toContain('### Đã trả lời');
        expect(updated).toContain('- [x] **[OQ1]** Deploy target? → Vercel');
    });
});
