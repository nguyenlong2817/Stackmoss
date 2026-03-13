/**
 * Centralized Capability Budgets
 * Authority: BRD §12.4
 *
 * Single source of truth for:
 * - default generation budgets
 * - hard max enforcement budgets
 * - role variant → capability mapping
 */

export const CAPABILITY_DEFAULT_BUDGETS: Record<string, number> = {
    'TL-ARCH': 220,
    'TL-REVIEW': 180,
    'TL-CONTEXT': 150,
    'TL-PLAN': 160,
    'BA-REQ': 180,
    'BA-AC': 150,
    'DEV-IMPL': 200,
    'DEV-ENV': 160,
    'DEV-DEBUG': 150,
    'QA-TEST': 150,
    'QA-REGRESSION': 120,
    'DOCS-README': 130,
    'DOCS-CHANGELOG': 100,
    'SEC-SCAN': 140,
    'OPS-DEPLOY': 140,
};

export const CAPABILITY_MAX_BUDGETS: Record<string, number> = {
    'TL-ARCH': 280,
    'TL-REVIEW': 220,
    'TL-CONTEXT': 180,
    'TL-PLAN': 200,
    'BA-REQ': 220,
    'BA-AC': 180,
    'DEV-IMPL': 260,
    'DEV-ENV': 200,
    'DEV-DEBUG': 180,
    'QA-TEST': 180,
    'QA-REGRESSION': 150,
    'DOCS-README': 160,
    'DOCS-CHANGELOG': 130,
    'SEC-SCAN': 180,
    'OPS-DEPLOY': 180,
};

// Backward-compatible alias for max budgets, used by enforcement paths.
export const CAPABILITY_BUDGETS = CAPABILITY_MAX_BUDGETS;

export const TEAM_TOTAL_MAX = 1800;

export const ROLE_CAPABILITIES: Record<string, string[]> = {
    TL: ['TL-ARCH', 'TL-REVIEW', 'TL-CONTEXT', 'TL-PLAN'],
    'TL(guide)': ['TL-ARCH', 'TL-REVIEW', 'TL-CONTEXT', 'TL-PLAN'],
    BA: ['BA-REQ', 'BA-AC'],
    DEV: ['DEV-IMPL', 'DEV-ENV', 'DEV-DEBUG'],
    'DEV(small)': ['DEV-IMPL', 'DEV-ENV', 'DEV-DEBUG'],
    QA: ['QA-TEST', 'QA-REGRESSION'],
    'QA(light)': ['QA-TEST'],
    'QA(strong)': ['QA-TEST', 'QA-REGRESSION'],
    'QA(checklist)': ['QA-TEST'],
    DOCS: ['DOCS-README', 'DOCS-CHANGELOG'],
    'SEC-lite': ['SEC-SCAN'],
    OPS: ['OPS-DEPLOY'],
    'OPS(light)': ['OPS-DEPLOY'],
    'OPS-lite': ['OPS-DEPLOY'],
};

export interface CapabilityBlock {
    id: string;
    content: string;
}

export function getDefaultBudget(capabilityId: string): number | undefined {
    return CAPABILITY_DEFAULT_BUDGETS[capabilityId];
}

export function getMaxBudget(capabilityId: string): number | undefined {
    return CAPABILITY_MAX_BUDGETS[capabilityId];
}

export function getCapabilities(roleId: string): string[] {
    return ROLE_CAPABILITIES[roleId] ?? [];
}

export function getCapabilitiesForRole(roleId: string): string[] {
    const direct = ROLE_CAPABILITIES[roleId];
    if (direct) {
        return [...direct];
    }

    const baseRole = roleId.match(/^([A-Z]+)/)?.[1];
    if (baseRole && ROLE_CAPABILITIES[baseRole]) {
        return [...ROLE_CAPABILITIES[baseRole]];
    }

    return [];
}

export function extractCapabilityBlocks(teamContent: string): CapabilityBlock[] {
    const lines = teamContent.split('\n');
    const blocks: CapabilityBlock[] = [];

    let currentId: string | null = null;
    let currentLines: string[] = [];

    const flush = (): void => {
        if (!currentId) {
            return;
        }

        blocks.push({
            id: currentId,
            content: currentLines.join('\n').trim(),
        });
        currentId = null;
        currentLines = [];
    };

    for (const line of lines) {
        const capabilityStart = line.match(/^- \[([A-Z][A-Z-]+)\]/);
        const sectionBoundary = line.startsWith('## ') || line === '---';

        if (capabilityStart) {
            flush();
            currentId = capabilityStart[1];
            currentLines = [line];
            continue;
        }

        if (currentId && sectionBoundary) {
            flush();
        }

        if (currentId) {
            currentLines.push(line);
        }
    }

    flush();
    return blocks;
}
