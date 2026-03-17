export type Language = 'en' | 'vi';

export interface I18nStrings {
    modeQuestion: string;
    modeFastLabel: string;
    modeInterviewLabel: string;
    fastModeHeader: string;
    interviewModeHeader: string;
    blockBiz: string;
    blockTech: string;
    blockTeam: string;
    q1Text: string;
    q1BizLed: string;
    q1DevLed: string;
    q1Solo: string;
    q1Newbie: string;
    q2Text: string;
    q2Individual: string;
    q2Sme: string;
    q2Enterprise: string;
    q2Community: string;
    q3BrdText: string;
    q3BrdLocked: string;
    q3BrdDraft: string;
    q3BrdNone: string;
    q4IdeaText: string;
    q5DomainText: string;
    q6DataText: string;
    q6None: string;
    q6Pii: string;
    q6Finance: string;
    q6Compliance: string;
    q6RepoText: string;
    q6RepoExisting: string;
    q6RepoGreenfield: string;
    q7DataText: string;
    q7None: string;
    q7Pii: string;
    q7Finance: string;
    q7Compliance: string;
    q8DeployText: string;
    q8Local: string;
    q8Vps: string;
    q8Cloud: string;
    q8Unknown: string;
    q9Text: string;
    q9Solo: string;
    q9SmallTeam: string;
    q9Outsource: string;
    q10SuccessText: string;
    q11StackText: string;
    q11Known: string;
    q11Partial: string;
    q11Unknown: string;
    ptText: string;
    ptMvp: string;
    ptProduction: string;
    ptInternalTool: string;
    ptLibraryApi: string;
    gateAudienceRequired: string;
    gateSuccessRequired: string;
    backLabel: string;
    reportHeader: string;
    reportMode: string;
    reportPersona: string;
    reportProject: string;
    reportRoles: string;
    reportAutoAdded: string;
    reportFeature: string;
    reportSkipped: string;
    reportBrd: string;
    qRolesText: string;
    cancelled: string;
}

const EN: I18nStrings = {
    modeQuestion: 'Setup speed?',
    modeFastLabel: '[F] Fast    ~3 min, bootstrap only',
    modeInterviewLabel: '[I] Interview   ~10 min, better pre-BRD discovery',
    fastModeHeader: 'Fast Mode - 7 questions, bootstrap only',
    interviewModeHeader: 'Interview Mode - deeper discovery before team shaping',
    blockBiz: 'Block 1 - Product framing',
    blockTech: 'Block 2 - Repo and delivery context',
    blockTeam: 'Block 3 - Team readiness',
    q1Text: 'Your role in this project?',
    q1BizLed: 'Biz lead',
    q1DevLed: 'Dev lead',
    q1Solo: 'Solo',
    q1Newbie: 'Not sure',
    q2Text: 'Who is the product for?',
    q2Individual: 'Individuals',
    q2Sme: 'SME',
    q2Enterprise: 'Enterprise',
    q2Community: 'Community',
    q3BrdText: 'BRD status?',
    q3BrdLocked: 'Locked BRD already exists',
    q3BrdDraft: 'BRD exists but is still draft',
    q3BrdNone: 'No BRD yet',
    q4IdeaText: 'What is the product idea?',
    q5DomainText: 'What domain is this in?',
    q6DataText: 'Sensitive data level?',
    q6None: 'None',
    q6Pii: 'PII',
    q6Finance: 'Financial',
    q6Compliance: 'Compliance',
    q6RepoText: 'What repo state are we starting from?',
    q6RepoExisting: 'Existing repo with code',
    q6RepoGreenfield: 'Greenfield / empty repo',
    q7DataText: 'Sensitive data level?',
    q7None: 'None',
    q7Pii: 'PII',
    q7Finance: 'Financial',
    q7Compliance: 'Compliance',
    q8DeployText: 'Expected deploy target?',
    q8Local: 'Local only',
    q8Vps: 'VPS',
    q8Cloud: 'Cloud',
    q8Unknown: 'Not sure yet',
    q9Text: 'Who maintains this after launch?',
    q9Solo: 'Solo',
    q9SmallTeam: 'Small team',
    q9Outsource: 'Outsource',
    q10SuccessText: 'What would make v1 successful?',
    q11StackText: 'How clear is the intended stack today?',
    q11Known: 'Known',
    q11Partial: 'Partially known',
    q11Unknown: 'Still unknown',
    ptText: 'Project type?',
    ptMvp: 'MVP - ship fast, test ideas',
    ptProduction: 'Production - stable, stronger QA',
    ptInternalTool: 'Internal Tool',
    ptLibraryApi: 'Library / API',
    gateAudienceRequired: '\nNeed to know who the product serves (Q2).\n',
    gateSuccessRequired: '\nNeed a success signal for v1 (Q10).\n',
    backLabel: '<- Back',
    reportHeader: 'Intake Summary',
    reportMode: 'Mode',
    reportPersona: 'Persona',
    reportProject: 'Project',
    reportRoles: 'Roles',
    reportAutoAdded: 'Auto-added',
    reportFeature: 'Bootstrap F1',
    reportSkipped: 'Skipped',
    reportBrd: 'BRD',
    qRolesText: 'Which roles do you want on your team? (Space = toggle, Enter = confirm)',
    cancelled: '\nCancelled.\n',
};

const VI: I18nStrings = {
    modeQuestion: 'Ban muon setup nhanh hay chi tiet?',
    modeFastLabel: '[F] Fast    ~3 phut, bootstrap only',
    modeInterviewLabel: '[I] Interview   ~10 phut, phu hop khi chua lock BRD',
    fastModeHeader: 'Fast Mode - 7 cau hoi, bootstrap only',
    interviewModeHeader: 'Interview Mode - discovery sau hon truoc khi shape team',
    blockBiz: 'Block 1 - Product framing',
    blockTech: 'Block 2 - Repo va delivery context',
    blockTeam: 'Block 3 - Team readiness',
    q1Text: 'Ban la ai trong du an nay?',
    q1BizLed: 'Biz lead',
    q1DevLed: 'Dev lead',
    q1Solo: 'Solo',
    q1Newbie: 'Khong ro',
    q2Text: 'San pham phuc vu ai?',
    q2Individual: 'Ca nhan',
    q2Sme: 'SME',
    q2Enterprise: 'Enterprise',
    q2Community: 'Cong dong',
    q3BrdText: 'BRD dang o trang thai nao?',
    q3BrdLocked: 'Da co BRD va da lock',
    q3BrdDraft: 'Da co BRD nhung van la draft',
    q3BrdNone: 'Chua co BRD',
    q4IdeaText: 'Idea cua san pham la gi?',
    q5DomainText: 'Linh vuc cua idea nay la gi?',
    q6DataText: 'Muc do data nhay cam?',
    q6None: 'Khong',
    q6Pii: 'PII',
    q6Finance: 'Tai chinh',
    q6Compliance: 'Compliance',
    q6RepoText: 'Repo hien tai dang o trang thai nao?',
    q6RepoExisting: 'Da co repo va co code',
    q6RepoGreenfield: 'Repo rong / greenfield',
    q7DataText: 'Muc do data nhay cam?',
    q7None: 'Khong',
    q7Pii: 'PII',
    q7Finance: 'Tai chinh',
    q7Compliance: 'Compliance',
    q8DeployText: 'Ky vong deploy o dau?',
    q8Local: 'Chi local',
    q8Vps: 'VPS',
    q8Cloud: 'Cloud',
    q8Unknown: 'Chua ro',
    q9Text: 'Ai se maintain sau khi launch?',
    q9Solo: 'Mot minh',
    q9SmallTeam: 'Team nho',
    q9Outsource: 'Outsource',
    q10SuccessText: 'Dau hieu nao cho thay v1 thanh cong?',
    q11StackText: 'Muc do ro rang cua stack hien tai?',
    q11Known: 'Da ro',
    q11Partial: 'Moi ro mot phan',
    q11Unknown: 'Chua ro',
    ptText: 'Du an nay thuoc loai nao?',
    ptMvp: 'MVP - ship nhanh, test y tuong',
    ptProduction: 'Production - on dinh, QA manh hon',
    ptInternalTool: 'Internal Tool',
    ptLibraryApi: 'Library / API',
    gateAudienceRequired: '\nCan biet san pham phuc vu ai (Q2).\n',
    gateSuccessRequired: '\nCan co dau hieu thanh cong cho v1 (Q10).\n',
    backLabel: '<- Quay lai',
    reportHeader: 'Intake Summary',
    reportMode: 'Mode',
    reportPersona: 'Persona',
    reportProject: 'Project',
    reportRoles: 'Roles',
    reportAutoAdded: 'Auto-added',
    reportFeature: 'Bootstrap F1',
    reportSkipped: 'Skipped',
    reportBrd: 'BRD',
    qRolesText: 'Ban muon nhung role nao trong team? (Space = chon/bo, Enter = xac nhan)',
    cancelled: '\nDa huy.\n',
};

const TABLES: Record<Language, I18nStrings> = { en: EN, vi: VI };
let currentLanguage: Language = 'en';

export function setLanguage(lang: Language): void {
    currentLanguage = lang;
}

export function getLanguage(): Language {
    return currentLanguage;
}

export function t(): I18nStrings {
    return TABLES[currentLanguage];
}
