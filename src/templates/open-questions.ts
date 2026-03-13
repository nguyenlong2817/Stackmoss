import type { GeneratedFile, TemplateInput } from './types.js';

const FAST_LABELS: Record<string, string> = {
    Q1: 'Ban la ai trong du an?',
    Q2: 'San pham phuc vu ai?',
    Q3: 'BRD dang o trang thai nao?',
    Q4: 'Idea cua san pham la gi?',
    Q5: 'Linh vuc cua idea nay la gi?',
    Q6: 'Data nhay cam?',
    Q_PT: 'Loai du an?',
};

const INTERVIEW_LABELS: Record<string, string> = {
    Q1: 'Ban la ai trong du an?',
    Q2: 'San pham phuc vu ai?',
    Q3: 'BRD dang o trang thai nao?',
    Q4: 'Idea cua san pham la gi?',
    Q5: 'Linh vuc cua idea nay la gi?',
    Q6: 'Repo hien tai dang o trang thai nao?',
    Q7: 'Data nhay cam?',
    Q8: 'Deploy o dau?',
    Q9: 'Ai se maintain sau launch?',
    Q10: 'Dau hieu nao cho thay v1 thanh cong?',
    Q11: 'Muc do ro rang cua stack?',
    Q_PT: 'Loai du an?',
};

export function generateOpenQuestions(input: TemplateInput): GeneratedFile | null {
    const { projectName, intake } = input;
    const labels = intake.mode === 'interview' ? INTERVIEW_LABELS : FAST_LABELS;

    if (intake.skippedQuestions.length === 0) {
        return null;
    }

    const items = intake.skippedQuestions
        .map((questionId) => `- [ ] ${questionId}: ${labels[questionId] ?? questionId}`)
        .join('\n');

    return {
        path: 'OPEN_QUESTIONS.md',
        content: `# Open Questions - ${projectName}
_Tao khi co cau hoi bi skip hoac chua duoc confirm._

## Chua duoc tra loi
${items}

## Da duoc tra loi
_(se duoc move xuong day sau khi confirm)_
`,
    };
}
