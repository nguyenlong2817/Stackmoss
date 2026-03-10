/**
 * Intake Engine — Type definitions
 * Authority: BRD §8, FEATURES.md F2 IntakeResult contract
 */

// ─── Enums / Unions ──────────────────────────────────────────────

export type IntakeMode = 'fast' | 'interview';

export type Persona = 'BizLed' | 'DevLed' | 'Solo' | 'Newbie';

export type ProjectType = 'MVP' | 'Production' | 'InternalTool' | 'LibraryAPI';

export type Appetite = 'S' | 'M' | 'L';

// ─── Question Schema ─────────────────────────────────────────────

export type QuestionType = 'select' | 'text';

export interface QuestionChoice {
    label: string;
    value: string;
}

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    choices?: QuestionChoice[];
    required?: boolean;
    /** Sub-question asked immediately after this question */
    subQuestion?: Question;
}

// ─── Raw Answers ─────────────────────────────────────────────────

export type RawAnswers = Record<string, string | string[]>;

// ─── IntakeResult (contract from FEATURES.md F2) ─────────────────

export interface IntakeResult {
    mode: IntakeMode;
    answers: RawAnswers;
    skippedQuestions: string[];
    persona: Persona;
    projectType: ProjectType;
    roles: string[];
    autoAddedRoles: string[];
    firstFeature: { name: string; appetite: Appetite };
}
