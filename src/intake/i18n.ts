/**
 * Intake Engine — Internationalization (i18n)
 * Authority: F16 implementation plan
 *
 * String tables for en/vi. All intake questions and UI text
 * read from here. English is default.
 */

export type Language = 'en' | 'vi';

// ─── String Table Type ───────────────────────────────────────────

export interface I18nStrings {
    // Mode selection
    modeQuestion: string;
    modeFastLabel: string;
    modeInterviewLabel: string;
    // Fast mode
    fastModeHeader: string;
    // Interview mode
    interviewModeHeader: string;
    blockBiz: string;
    blockTech: string;
    blockTeam: string;
    // Questions
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
    q3Text: string;
    q3Internal: string;
    q3Vn: string;
    q3Global: string;
    q4FastText: string;
    q4Web: string;
    q4Mobile: string;
    q4Chat: string;
    q4Api: string;
    q5FastText: string;
    q5None: string;
    q5Pii: string;
    q5Finance: string;
    q5Compliance: string;
    q6Text: string;
    q6bText: string;
    appetiteS: string;
    appetiteM: string;
    appetiteL: string;
    ptText: string;
    ptMvp: string;
    ptProduction: string;
    ptInternalTool: string;
    ptLibraryApi: string;
    // Interview-only
    q4InterviewText: string;
    q4Free: string;
    q4Subscription: string;
    q4Usage: string;
    q4Unknown: string;
    q7Text: string;
    q7Local: string;
    q7Vps: string;
    q7Cloud: string;
    q7Unknown: string;
    q8Text: string;
    q8Cheapest: string;
    q8Balanced: string;
    q8Fastest: string;
    q9Text: string;
    q9Solo: string;
    q9SmallTeam: string;
    q9Outsource: string;
    q10Text: string;
    q10Speed: string;
    q10Stability: string;
    q10Both: string;
    q11Text: string;
    q11Sheets: string;
    q11Db: string;
    q11Crm: string;
    q11ExternalApi: string;
    q11None: string;
    // Completeness gate
    gateQ5Required: string;
    gateQ2Required: string;
    gateQ12Required: string;
    // Navigation
    backLabel: string;
    // Report
    reportHeader: string;
    reportMode: string;
    reportPersona: string;
    reportProject: string;
    reportRoles: string;
    reportAutoAdded: string;
    reportFeature: string;
    reportSkipped: string;
    // Errors
    cancelled: string;
}

// ─── English Strings ─────────────────────────────────────────────

const EN: I18nStrings = {
    modeQuestion: 'Setup speed?',
    modeFastLabel: '[F] Fast    ~3 min, 7 questions',
    modeInterviewLabel: '[I] Interview   ~10 min, 13 questions, better team',
    fastModeHeader: '🚀 Fast Mode — 7 questions, ~3 min',
    interviewModeHeader: '📝 Interview Mode — 13 questions, ~10 min',
    blockBiz: '📋 Block 1 — Business context',
    blockTech: '🔧 Block 2 — Technical constraints',
    blockTeam: '👥 Block 3 — Team & velocity',
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
    q3Text: 'Geographic scope?',
    q3Internal: 'Internal',
    q3Vn: 'Vietnam',
    q3Global: 'Global',
    q4FastText: 'Primary channel?',
    q4Web: 'Web',
    q4Mobile: 'Mobile',
    q4Chat: 'Chat (Zalo/FB/IG)',
    q4Api: 'API',
    q5FastText: 'Sensitive data?',
    q5None: 'None',
    q5Pii: 'PII',
    q5Finance: 'Financial',
    q5Compliance: 'Compliance',
    q6Text: 'First feature to ship?',
    q6bText: 'How long to ship?',
    appetiteS: '[S] A few days',
    appetiteM: '[M] 1-2 weeks',
    appetiteL: '[L] More than 2 weeks',
    ptText: 'Project type?',
    ptMvp: 'MVP — ship fast, test ideas',
    ptProduction: 'Production — stable, strong QA',
    ptInternalTool: 'Internal Tool — internal use',
    ptLibraryApi: 'Library / API — library or API service',
    q4InterviewText: 'Monetization?',
    q4Free: 'Free',
    q4Subscription: 'Subscription',
    q4Usage: 'Usage-based',
    q4Unknown: 'Not sure',
    q7Text: 'Deploy target?',
    q7Local: 'Local',
    q7Vps: 'VPS',
    q7Cloud: 'Cloud',
    q7Unknown: 'Not sure',
    q8Text: 'Budget for v1?',
    q8Cheapest: 'Cheapest',
    q8Balanced: 'Balanced',
    q8Fastest: 'Fastest',
    q9Text: 'Who maintains after launch?',
    q9Solo: 'Solo',
    q9SmallTeam: 'Small team',
    q9Outsource: 'Outsource',
    q10Text: 'Priority?',
    q10Speed: 'Ship fast',
    q10Stability: 'Ship stable',
    q10Both: 'Both',
    q11Text: 'Primary data source?',
    q11Sheets: 'Sheets/Docs',
    q11Db: 'Database',
    q11Crm: 'CRM',
    q11ExternalApi: 'External API',
    q11None: 'None yet',
    gateQ5Required: '\n⚠️  Data sensitivity (Q5) is required. Asking again.\n',
    gateQ2Required: '\n⚠️  Need to know who the product serves (Q2).\n',
    gateQ12Required: '\n⚠️  Need to know the first feature to ship (Q12).\n',
    backLabel: '← Back',
    reportHeader: '📊 Intake Summary',
    reportMode: 'Mode',
    reportPersona: 'Persona',
    reportProject: 'Project',
    reportRoles: 'Roles',
    reportAutoAdded: 'Auto-added',
    reportFeature: 'Feature',
    reportSkipped: 'Skipped',
    cancelled: '\n❌ Cancelled.\n',
};

// ─── Vietnamese Strings ──────────────────────────────────────────

const VI: I18nStrings = {
    modeQuestion: 'Bạn muốn setup nhanh hay chi tiết?',
    modeFastLabel: '[F] Fast    ~3 phút, 7 câu',
    modeInterviewLabel: '[I] Interview   ~10 phút, 13 câu, team tốt hơn',
    fastModeHeader: '🚀 Fast Mode — 7 câu hỏi, ~3 phút',
    interviewModeHeader: '📝 Interview Mode — 13 câu hỏi, ~10 phút',
    blockBiz: '📋 Block 1 — Bối cảnh biz',
    blockTech: '🔧 Block 2 — Constraint kỹ thuật',
    blockTeam: '👥 Block 3 — Team & velocity',
    q1Text: 'Bạn là ai trong dự án này?',
    q1BizLed: 'Biz lead',
    q1DevLed: 'Dev lead',
    q1Solo: 'Solo',
    q1Newbie: 'Không rõ',
    q2Text: 'Sản phẩm phục vụ ai?',
    q2Individual: 'Cá nhân',
    q2Sme: 'SME',
    q2Enterprise: 'Enterprise',
    q2Community: 'Cộng đồng',
    q3Text: 'Phạm vi địa lý?',
    q3Internal: 'Nội bộ',
    q3Vn: 'VN',
    q3Global: 'Global',
    q4FastText: 'Kênh chính?',
    q4Web: 'Web',
    q4Mobile: 'Mobile',
    q4Chat: 'Chat (Zalo/FB/IG)',
    q4Api: 'API',
    q5FastText: 'Data nhạy cảm?',
    q5None: 'Không',
    q5Pii: 'PII',
    q5Finance: 'Tài chính',
    q5Compliance: 'Compliance',
    q6Text: 'Feature đầu tiên muốn ship là gì?',
    q6bText: 'Cần bao lâu để ship?',
    appetiteS: '[S] Vài ngày',
    appetiteM: '[M] 1-2 tuần',
    appetiteL: '[L] Hơn 2 tuần',
    ptText: 'Dự án này thuộc loại nào?',
    ptMvp: 'MVP — ship nhanh, test ý tưởng',
    ptProduction: 'Production — ổn định, cần QA mạnh',
    ptInternalTool: 'Internal Tool — công cụ nội bộ',
    ptLibraryApi: 'Library / API — thư viện hoặc API service',
    q4InterviewText: 'Monetization?',
    q4Free: 'Free',
    q4Subscription: 'Subscription',
    q4Usage: 'Usage-based',
    q4Unknown: 'Chưa biết',
    q7Text: 'Deploy ở đâu?',
    q7Local: 'Local',
    q7Vps: 'VPS',
    q7Cloud: 'Cloud',
    q7Unknown: 'Chưa biết',
    q8Text: 'Budget để ship v1?',
    q8Cheapest: 'Rẻ nhất',
    q8Balanced: 'Cân bằng',
    q8Fastest: 'Nhanh nhất',
    q9Text: 'Ai maintain sau này?',
    q9Solo: 'Một mình',
    q9SmallTeam: 'Team nhỏ',
    q9Outsource: 'Outsource',
    q10Text: 'Ưu tiên?',
    q10Speed: 'Ship nhanh',
    q10Stability: 'Ship ổn định',
    q10Both: 'Cả hai',
    q11Text: 'Nguồn dữ liệu chính ở đâu?',
    q11Sheets: 'Sheets/Docs',
    q11Db: 'DB',
    q11Crm: 'CRM',
    q11ExternalApi: 'API bên ngoài',
    q11None: 'Chưa có',
    gateQ5Required: '\n⚠️  Data nhạy cảm (Q5) là bắt buộc. Hỏi lại một lần.\n',
    gateQ2Required: '\n⚠️  Cần biết sản phẩm phục vụ ai (Q2).\n',
    gateQ12Required: '\n⚠️  Cần biết feature đầu tiên muốn ship (Q12).\n',
    backLabel: '← Quay lại',
    reportHeader: '📊 Intake Summary',
    reportMode: 'Mode',
    reportPersona: 'Persona',
    reportProject: 'Project',
    reportRoles: 'Roles',
    reportAutoAdded: 'Auto-added',
    reportFeature: 'Feature',
    reportSkipped: 'Skipped',
    cancelled: '\n❌ Đã huỷ.\n',
};

// ─── String Table Map ────────────────────────────────────────────

const TABLES: Record<Language, I18nStrings> = { en: EN, vi: VI };

/** Global mutable language — set once at intake start */
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
