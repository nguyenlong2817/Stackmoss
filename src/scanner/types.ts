/**
 * Scanner Types — data structures for repo scanning
 * Authority: BRD §9.5, §13
 */

// ─── Scan Result ─────────────────────────────────────────────────

export interface ScanResult {
    /** High confidence — verified from actual file content */
    facts: Fact[];
    /** Medium confidence — heuristic-based, needs verify */
    hypotheses: Hypothesis[];
    /** Needs human confirm before promote */
    openQuestions: Question[];
}

// ─── Individual Items ────────────────────────────────────────────

export interface Fact {
    category: string;
    value: string;
    /** Which file/path this was read from */
    source: string;
}

export interface Hypothesis {
    category: string;
    value: string;
    /** 0-100, hypotheses < 80% on critical items block promote */
    confidence: number;
    source: string;
    critical: boolean;
}

export interface Question {
    id: string;
    text: string;
    /** What this affects in the config */
    impact: string;
    resolved: boolean;
    answer?: string;
}

// ─── Package.json partial ────────────────────────────────────────

export interface PackageJsonPartial {
    name?: string;
    version?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    workspaces?: string[] | { packages: string[] };
}
