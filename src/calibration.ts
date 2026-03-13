/**
 * Calibration readiness helpers.
 *
 * Runtime enforcement should not extend stackmoss.config.json, so readiness is
 * inferred from replace-only markers inside team.md.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const CALIBRATION_PENDING_MARKER =
    'Calibration status: bootstrap pending TL recalibration after BRD lock + repo scan';
export const CALIBRATION_DONE_PREFIX = 'Calibration status: calibrated';

function extractProjectFactsBlock(teamContent: string): string {
    const match = teamContent.match(/## PROJECT_FACTS([\s\S]*)$/);
    return match ? match[1] : '';
}

export function needsCalibration(teamContent: string): boolean {
    if (teamContent.includes(CALIBRATION_DONE_PREFIX)) {
        return false;
    }

    if (teamContent.includes(CALIBRATION_PENDING_MARKER)) {
        return true;
    }

    return extractProjectFactsBlock(teamContent).includes('TBD');
}

export function getCalibrationWarning(projectPath: string): string | null {
    const teamPath = join(projectPath, 'team.md');
    if (!existsSync(teamPath)) {
        return null;
    }

    const teamContent = readFileSync(teamPath, 'utf-8');
    if (!needsCalibration(teamContent)) {
        return null;
    }

    return 'Team config is still in bootstrap calibration state. Ask Tech Lead to scan the repo, replace stale facts in team.md, and confirm the patch before relying on runtime rules.';
}
