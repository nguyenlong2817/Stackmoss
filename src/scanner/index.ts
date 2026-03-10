/**
 * Scanner barrel export
 */

export { scanRepo } from './scanner.js';
export { renderMigrationReport, parseMigrationReport, MIGRATION_REPORT_FILENAME } from './report.js';
export type { ScanResult, Fact, Hypothesis, Question, PackageJsonPartial } from './types.js';
export type { ParsedReport } from './report.js';
