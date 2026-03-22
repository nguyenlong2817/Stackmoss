/**
 * Compile Layer: Claude Code Targets
 * Authority:
 * - Claude Code skills docs (.claude/skills/<skill-name>/SKILL.md)
 * - CLAUDE.md repo guidance
 */

import type { GeneratedFile } from '../templates/types.js';
import { extractRoleId } from '../templates/team.js';
import { getCapabilitiesForRole, getDefaultBudget } from '../budgets.js';
import {
    renderMethodologyReference,
    renderSharedMethodologySkill,
} from './methodology.js';
import { uniqueRoleIds, uniqueRoles } from './utils.js';
import { renderDeepSkillContent, renderRoleOverrideGuidance } from './role-skills.js';

interface SkillCapability {
    id: string;
    name: string;
    budget: number;
    trigger: string;
    doNotUse: string;
}

export const ROLE_RUNTIME_NAMES: Record<string, string> = {
    TL: 'tech-lead',
    BA: 'business-analyst',
    DEV: 'developer',
    FE: 'frontend',
    BE: 'backend',
    FS: 'fullstack',
    MOBILE: 'mobile',
    DEVOPS: 'devops-engineer',
    DATA: 'data-engineer',
    PE: 'prompt-engineer',
    UIUX: 'ui-ux',
    PM: 'product-manager',
    MLE: 'ml-engineer',
    BRAND: 'brand-designer',
    QA: 'quality-assurance',
    DOCS: 'documentation',
    SEC: 'security-auditor',
    OPS: 'devops',
};

function getRoleMaintenance(roleStr: string): string[] {
    const baseId = extractRoleId(roleStr);

    if (baseId === 'TL') {
        return [
            'Confirm BRD or NORTH_STAR is locked before implementation; if not, turn F1 into locking scope and constraints.',
            'Scan the repo, ask focused follow-up questions, and recalibrate the team to the real stack, topology, and delivery lanes.',
            'Act as the single writer for shared team config and prepare replace-only patches when facts change.',
            'Ask the user before applying any shared config patch.',
        ];
    }

    return [
        'Do not edit shared team config directly.',
        'When you verify a command, path, test flow, or deploy fact, send that verified signal to Tech Lead.',
        'Never append memory logs to shared config.',
    ];
}

export const ROLE_CAPABILITIES: Record<string, { name: string; capabilities: SkillCapability[] }> = {
    TL: {
        name: 'Tech Lead',
        capabilities: [
            { id: 'TL-ARCH', name: 'Architecture decisions & ADR', budget: getDefaultBudget('TL-ARCH') ?? 220, trigger: 'Use when architecture decisions, repo calibration, tech stack evaluation, dependency trade-offs, or team topology changes are needed — even when the user does not explicitly say "architecture." Also activate for ADR writing, cross-module design reviews, and any decision affecting more than one module or service boundary.', doNotUse: 'Do not use for isolated single-file implementation or debugging within one module.' },
            { id: 'TL-REVIEW', name: 'Code review & merge gates', budget: getDefaultBudget('TL-REVIEW') ?? 180, trigger: 'Use when code needs review before merge, deploy, or release. Activate whenever a PR is submitted, a diff is shared, or the user asks for feedback on code quality, test coverage, or security posture of a changeset.', doNotUse: 'Do not use for first-draft implementation or initial feature coding.' },
            { id: 'TL-CONTEXT', name: 'Maintain CONTEXT.md & FEATURES.md', budget: getDefaultBudget('TL-CONTEXT') ?? 150, trigger: 'Use after completing a feature, closing a milestone, resolving a major bug, or making an architecture decision. Also activate when the user asks to update project status, track progress, or reflect completed work in documentation.', doNotUse: 'Do not use mid-task when implementation is still in progress.' },
            { id: 'TL-PLAN', name: 'Break down features & assign subtasks', budget: getDefaultBudget('TL-PLAN') ?? 160, trigger: 'Use at the start of each feature cycle, when reshaping delivery lanes, when the user says "plan", "break down", "decompose", or "what should we build next." Also activate for sprint planning, backlog grooming, and task assignment across roles.', doNotUse: 'Do not use during isolated coding work within a single task.' },
        ],
    },
    BA: {
        name: 'Business Analyst',
        capabilities: [
            { id: 'BA-REQ', name: 'Requirements elicitation & clarification', budget: getDefaultBudget('BA-REQ') ?? 180, trigger: 'Use when requirements are unclear, conflicting, incomplete, or when the user is unsure what to build. Also activate when stakeholder needs differ, when translating business goals into technical requirements, or when performing gap analysis between what exists and what is needed.', doNotUse: 'Do not use for technical architecture decisions or code implementation.' },
            { id: 'BA-AC', name: 'Acceptance criteria writing', budget: getDefaultBudget('BA-AC') ?? 150, trigger: 'Use at feature start to define pass/fail criteria, when the user says "how do we know it works", "what does done look like", or when writing Given/When/Then scenarios. Also activate when reviewing feature completeness or verifying that implementation matches business intent.', doNotUse: 'Do not use during active code implementation.' },
        ],
    },
    DEV: {
        name: 'Developer',
        capabilities: [
            { id: 'DEV-IMPL', name: 'Feature implementation', budget: getDefaultBudget('DEV-IMPL') ?? 200, trigger: 'Use when implementing code for a feature, writing new functions or modules, refactoring existing code, or building functionality from acceptance criteria. Activate whenever the user asks to "build", "implement", "code", "create", or "add" a feature — even if they do not say "implement" explicitly.', doNotUse: 'Do not use for cross-module architecture decisions (use TL-ARCH) or business requirement clarification (use BA-REQ).' },
            { id: 'DEV-ENV', name: 'Environment & command knowledge', budget: getDefaultBudget('DEV-ENV') ?? 160, trigger: 'Use when running commands, checking file paths, managing the local environment, installing dependencies, configuring tools, or troubleshooting build and toolchain issues. Activate for npm/pnpm/yarn commands, Docker setup, environment variable configuration, and CI/CD runner debugging.', doNotUse: 'Do not use for business logic decisions or product prioritization.' },
            { id: 'DEV-DEBUG', name: 'Debug & error resolution', budget: getDefaultBudget('DEV-DEBUG') ?? 150, trigger: 'Use when debugging errors, stack traces, unexpected behavior, test failures, or runtime exceptions. Activate when the user shares an error message, asks "why is this broken", or when something that previously worked has stopped working. Also activate for performance issues and memory leak investigation.', doNotUse: 'Do not use for new feature planning or architecture design.' },
        ],
    },
    QA: {
        name: 'Quality Assurance',
        capabilities: [
            { id: 'QA-TEST', name: 'Test & verify acceptance criteria', budget: getDefaultBudget('QA-TEST') ?? 150, trigger: 'Use after implementation to verify that a feature works against its acceptance criteria. Activate when the user asks to "test", "verify", "check if it works", or when validating edge cases, input boundaries, error handling, and cross-browser/cross-device behavior.', doNotUse: 'Do not use during feature planning or initial implementation.' },
            { id: 'QA-REGRESSION', name: 'Regression checklist', budget: getDefaultBudget('QA-REGRESSION') ?? 120, trigger: 'Use before marking a feature as done, before release, or after any significant refactor. Activate when the user asks "did we break anything", "is it safe to ship", or when running the full test suite to detect side effects from recent changes.', doNotUse: 'Do not use for new feature development or design.' },
        ],
    },
    DOCS: {
        name: 'Documentation',
        capabilities: [
            { id: 'DOCS-README', name: 'README & runbook updates', budget: getDefaultBudget('DOCS-README') ?? 130, trigger: 'Use after a feature is done or when the user asks to update documentation, write a README, maintain runbooks, or document API usage. Also activate when onboarding instructions, quick-start guides, or deployment runbooks need updating after infrastructure or feature changes.', doNotUse: 'Do not use during active implementation while code is still changing.' },
            { id: 'DOCS-CHANGELOG', name: 'Changelog', budget: getDefaultBudget('DOCS-CHANGELOG') ?? 100, trigger: 'Use at the end of a feature cycle, before a release, or when the user asks to log what changed. Activate for generating release notes, summarizing shipped work, or maintaining CHANGELOG.md.', doNotUse: 'Do not use mid-feature when implementation is ongoing.' },
        ],
    },
    SEC: {
        name: 'Security-lite',
        capabilities: [
            { id: 'SEC-SCAN', name: 'Basic security check', budget: getDefaultBudget('SEC-SCAN') ?? 140, trigger: 'Use before any feature touching authentication, authorization, PII, financial data, payments, or user credentials. Also activate when the user mentions security concerns, dependency vulnerabilities, secret management, CORS, CSRF, XSS, SQL injection, or asks "is this secure." Trigger proactively when code handles passwords, tokens, API keys, or sensitive user data.', doNotUse: 'Do not use for features with no security-sensitive data or access control implications.' },
        ],
    },
    OPS: {
        name: 'DevOps-lite',
        capabilities: [
            { id: 'OPS-DEPLOY', name: 'Deploy & infra checks', budget: getDefaultBudget('OPS-DEPLOY') ?? 140, trigger: 'Use before deploy, infrastructure changes, server configuration, or environment provisioning. Activate when the user mentions deployment, hosting, DNS, SSL, load balancing, scaling, or asks "how do I ship this." Also trigger for health check setup, monitoring configuration, and rollback planning.', doNotUse: 'Do not use for application feature development or business logic.' },
        ],
    },
    FE: {
        name: 'Frontend Developer',
        capabilities: [
            { id: 'FE-UI', name: 'Component & layout implementation', budget: getDefaultBudget('FE-UI') ?? 200, trigger: 'Use when building UI components, pages, interactive elements, forms, modals, or navigation. Activate when the user asks to create or modify anything visual — buttons, cards, lists, tables, layouts, or page structure — even if they do not say "frontend" explicitly.', doNotUse: 'Do not use for API endpoints, database work, or backend service logic.' },
            { id: 'FE-STYLE', name: 'CSS, design system & theming', budget: getDefaultBudget('FE-STYLE') ?? 160, trigger: 'Use when implementing design tokens, CSS architecture, responsive layouts, theming, dark mode, or visual polish. Activate when the user mentions styling, colors, fonts, spacing, breakpoints, or asks to make something "look better" or match a design spec.', doNotUse: 'Do not use for backend logic or API design.' },
            { id: 'FE-A11Y', name: 'Accessibility & responsive design', budget: getDefaultBudget('FE-A11Y') ?? 120, trigger: 'Use when auditing or fixing accessibility (a11y), ARIA labels, keyboard navigation, screen reader support, color contrast, focus management, or mobile responsiveness. Activate when the user mentions WCAG compliance, touch targets, or asks if the UI works on different screen sizes.', doNotUse: 'Do not use for first-draft implementation when accessibility is not the primary focus.' },
        ],
    },
    BE: {
        name: 'Backend Developer',
        capabilities: [
            { id: 'BE-API', name: 'API endpoints & business logic', budget: getDefaultBudget('BE-API') ?? 200, trigger: 'Use when implementing REST or GraphQL endpoints, DTOs, service logic, middleware, or server-side business rules. Activate when the user asks to create a route, handle a request, build an API, or write server-side validation — even if they just say "backend" or "API."', doNotUse: 'Do not use for UI components, CSS styling, or client-side interactivity.' },
            { id: 'BE-DB', name: 'Database schema, migrations & queries', budget: getDefaultBudget('BE-DB') ?? 180, trigger: 'Use when designing database schemas, writing migrations, optimizing queries, setting up indexes, or working with ORMs like Prisma, TypeORM, or Sequelize. Activate when the user mentions tables, columns, relations, SQL, or asks about data modeling and persistence.', doNotUse: 'Do not use for frontend work or UI data binding.' },
            { id: 'BE-AUTH', name: 'Authentication & authorization', budget: getDefaultBudget('BE-AUTH') ?? 160, trigger: 'Use when implementing auth flows, login, signup, session management, JWT handling, RBAC, OAuth, SSO, or token refresh logic. Activate when the user mentions permissions, roles, access control, or asks "who can access this" — even in non-auth-specific contexts where access control is a side concern.', doNotUse: 'Do not use for features with no authentication or authorization implications.' },
        ],
    },
    FS: {
        name: 'Fullstack Developer',
        capabilities: [
            { id: 'FS-INTEGRATE', name: 'API-to-UI integration & data flow', budget: getDefaultBudget('FS-INTEGRATE') ?? 200, trigger: 'Use when wiring API calls to UI, handling state management, data fetching, or connecting frontend components to backend services. Activate when the user works across both client and server — React Query hooks calling API routes, form submissions, real-time updates, or any task that spans the FE/BE boundary.', doNotUse: 'Do not use for cross-module architecture decisions (use TL-ARCH).' },
            { id: 'FS-SCAFFOLD', name: 'Project setup & boilerplate', budget: getDefaultBudget('FS-SCAFFOLD') ?? 160, trigger: 'Use when scaffolding new modules, setting up routing, configuring build tools, initializing a new project, or establishing folder structure. Activate when the user says "set up", "initialize", "scaffold", "create project", or configures ESLint, Prettier, TypeScript, or bundler settings.', doNotUse: 'Do not use mid-feature when project structure is already established.' },
            { id: 'FS-OPTIMIZE', name: 'Performance & caching', budget: getDefaultBudget('FS-OPTIMIZE') ?? 140, trigger: 'Use when optimizing load times, bundle size, caching strategies, SSR/SSG, code splitting, lazy loading, or reducing re-renders. Activate when the user reports slow page loads, large bundle sizes, or asks to improve performance metrics like LCP, FID, or CLS.', doNotUse: 'Do not use for first-pass implementation where performance is not the primary concern.' },
        ],
    },
    MOBILE: {
        name: 'Mobile Developer',
        capabilities: [
            { id: 'MOBILE-NATIVE', name: 'Platform UI & navigation', budget: getDefaultBudget('MOBILE-NATIVE') ?? 200, trigger: 'Use when building native mobile screens, navigation flows, tab bars, drawers, or platform-specific UI for iOS or Android. Activate when the user works in React Native, Expo, Swift, Kotlin, or Flutter — or mentions mobile app screens, gestures, deep linking, or platform-specific behavior.', doNotUse: 'Do not use for web-only features or browser-based UI.' },
            { id: 'MOBILE-PERF', name: 'Bundle size, memory & battery', budget: getDefaultBudget('MOBILE-PERF') ?? 150, trigger: 'Use when optimizing mobile app size, reducing memory leaks, improving battery consumption, or profiling frame rate drops. Activate when the user reports slow app startup, jank during scrolling, or when app store size limits are a concern.', doNotUse: 'Do not use for initial feature implementation where performance is not the focus.' },
            { id: 'MOBILE-DEVICE', name: 'Sensors, storage & permissions', budget: getDefaultBudget('MOBILE-DEVICE') ?? 140, trigger: 'Use when integrating device capabilities — camera, GPS, accelerometer, local storage, push notifications, biometric auth, or permission request flows. Activate when the user needs to access hardware features or manage OS-level permissions on iOS or Android.', doNotUse: 'Do not use for UI layout work that does not involve device hardware.' },
        ],
    },
    DEVOPS: {
        name: 'DevOps Engineer',
        capabilities: [
            { id: 'DEVOPS-CI', name: 'CI/CD pipeline & build automation', budget: getDefaultBudget('DEVOPS-CI') ?? 180, trigger: 'Use when setting up GitHub Actions, GitLab CI, build pipelines, automated testing workflows, or deployment automation. Activate when the user mentions CI/CD, pipeline failures, build caching, artifact publishing, or automated quality gates.', doNotUse: 'Do not use for application feature code or business logic.' },
            { id: 'DEVOPS-INFRA', name: 'Docker, K8s & cloud infrastructure', budget: getDefaultBudget('DEVOPS-INFRA') ?? 160, trigger: 'Use when writing Dockerfiles, Docker Compose configs, Kubernetes manifests, Terraform, Pulumi, or cloud service setup (AWS, GCP, Azure, Vercel, Railway). Activate when the user asks about containerization, orchestration, infrastructure as code, or cloud resource provisioning.', doNotUse: 'Do not use for application business logic or feature implementation.' },
            { id: 'DEVOPS-MONITOR', name: 'Logging, alerting & observability', budget: getDefaultBudget('DEVOPS-MONITOR') ?? 140, trigger: 'Use when setting up log aggregation, structured logging, health checks, alerting rules, APM, or dashboards. Activate when the user asks about monitoring, error tracking (Sentry, Datadog), uptime checks, or wants to understand production behavior through observability tooling.', doNotUse: 'Do not use for application feature development or UI work.' },
        ],
    },
    DATA: {
        name: 'Data Engineer',
        capabilities: [
            { id: 'DATA-PIPELINE', name: 'ETL, ingestion & transformation', budget: getDefaultBudget('DATA-PIPELINE') ?? 180, trigger: 'Use when building data ingestion pipelines, ETL/ELT jobs, data transformations, batch processing, or streaming data flows. Activate when the user mentions data import, CSV/JSON processing, scheduled data jobs, or asks to move data between systems.', doNotUse: 'Do not use for UI or REST API endpoint work.' },
            { id: 'DATA-MODEL', name: 'Schema design & normalization', budget: getDefaultBudget('DATA-MODEL') ?? 160, trigger: 'Use when designing data warehouse schemas, analytics tables, dimensional models, or data lake organization. Activate when the user works on reporting databases, star/snowflake schemas, or asks about normalization for analytical workloads.', doNotUse: 'Do not use for OLTP application schemas — use BE-DB instead.' },
            { id: 'DATA-QUALITY', name: 'Data validation & monitoring', budget: getDefaultBudget('DATA-QUALITY') ?? 140, trigger: 'Use when implementing data quality checks, anomaly detection, data freshness monitoring, row count validation, or schema drift detection. Activate when the user asks about data reliability, missing values, stale data, or data pipeline health.', doNotUse: 'Do not use for application-level unit or integration testing — use QA instead.' },
        ],
    },
    PE: {
        name: 'Prompt Engineer',
        capabilities: [
            { id: 'PE-PROMPT', name: 'System prompt design & iteration', budget: getDefaultBudget('PE-PROMPT') ?? 180, trigger: 'Use when writing or refining system prompts, few-shot examples, instruction tuning, or prompt templates. Activate when the user works with LLM prompts, asks to improve AI output quality, or iterates on prompt structure for any model (GPT, Claude, Gemini, local models).', doNotUse: 'Do not use for non-LLM features or traditional code logic.' },
            { id: 'PE-EVAL', name: 'Eval harness & benchmarking', budget: getDefaultBudget('PE-EVAL') ?? 150, trigger: 'Use when building eval cases, grading rubrics, golden sets, or benchmark suites for LLM outputs. Activate when the user asks to measure prompt quality, compare model outputs, or establish quality baselines for AI-generated content.', doNotUse: 'Do not use for application-level unit or integration testing — use QA instead.' },
            { id: 'PE-CHAIN', name: 'Chain & agent orchestration', budget: getDefaultBudget('PE-CHAIN') ?? 140, trigger: 'Use when building multi-step LLM chains, tool-use flows, agent routing logic, RAG pipelines, or function-calling orchestration. Activate when the user designs workflows where an LLM calls tools, chains multiple prompts, or routes between specialized agents.', doNotUse: 'Do not use for simple single-request API calls without LLM orchestration.' },
        ],
    },
    UIUX: {
        name: 'UI/UX Designer',
        capabilities: [
            { id: 'UIUX-DESIGN', name: 'Design system tokens & wireframes', budget: getDefaultBudget('UIUX-DESIGN') ?? 180, trigger: 'Use when defining color palettes, typography scales, spacing tokens, elevation levels, or page wireframes. Activate when the user asks about design systems, visual consistency, component libraries, or wants to establish design foundations before implementation.', doNotUse: 'Do not use for writing implementation code — hand off to FE for coding.' },
            { id: 'UIUX-PROTO', name: 'Interactive prototype & animation', budget: getDefaultBudget('UIUX-PROTO') ?? 160, trigger: 'Use when building click-through prototypes, micro-animations, interaction specs, or motion design. Activate when the user wants to visualize a flow before coding, test user journeys, or define transition and animation behavior.', doNotUse: 'Do not use for production application code.' },
            { id: 'UIUX-REVIEW', name: 'Usability audit & heuristic review', budget: getDefaultBudget('UIUX-REVIEW') ?? 140, trigger: 'Use when reviewing implemented UI against design specs, Nielsen heuristics, or user flow expectations. Activate when the user asks "does this look right", "is the UX good", or requests design QA on shipped features.', doNotUse: 'Do not use for functional testing of code behavior — use QA instead.' },
        ],
    },
    PM: {
        name: 'Product Manager',
        capabilities: [
            { id: 'PM-BRD', name: 'BRD discovery, brainstorming & finalization', budget: getDefaultBudget('PM-BRD') ?? 250, trigger: 'Use when the user has no BRD, only a rough idea, or a draft product spec that needs finalization. Activate when the user says "I don\'t know what to build", "help me scope this", "what should v1 include", "define the product", or any question about problem framing, target users, MVP boundaries, or non-goals. Also activate when the BRD status is draft or none and the user wants to start development — redirect to BRD finalization first.', doNotUse: 'Do not use when BRD is already locked and the user is asking about implementation. For technical scoping after BRD is locked, use TL-ARCH or TL-PLAN instead.' },
            { id: 'PM-ROADMAP', name: 'Roadmap & feature prioritization', budget: getDefaultBudget('PM-ROADMAP') ?? 180, trigger: 'Use when defining the product roadmap, prioritizing the backlog, scoping feature releases, or deciding what to build next. Activate when the user asks about product strategy, feature sequencing, MVP scope, or quarterly planning — even if they do not explicitly say "roadmap."', doNotUse: 'Do not use for technical architecture decisions — use TL-ARCH instead.' },
            { id: 'PM-PRIORITIZE', name: 'Impact analysis & trade-off decisions', budget: getDefaultBudget('PM-PRIORITIZE') ?? 150, trigger: 'Use when evaluating feature trade-offs, cost-benefit analysis, RICE scoring, go/no-go decisions, or comparing competing priorities. Activate when the user asks "should we build this", "is this worth it", or weighs effort against impact.', doNotUse: 'Do not use for implementation planning or code-level task breakdown.' },
            { id: 'PM-STAKEHOLDER', name: 'Stakeholder communication & alignment', budget: getDefaultBudget('PM-STAKEHOLDER') ?? 150, trigger: 'Use when preparing status reports, demo scripts, stakeholder presentations, release communications, or alignment documents. Activate when the user needs to communicate progress, decisions, or plans to non-technical stakeholders.', doNotUse: 'Do not use for technical documentation — use DOCS instead.' },
        ],
    },
    MLE: {
        name: 'ML Engineer',
        capabilities: [
            { id: 'MLE-TRAIN', name: 'Model training & experiment tracking', budget: getDefaultBudget('MLE-TRAIN') ?? 220, trigger: 'Use when training ML models, running experiments, tuning hyperparameters, managing datasets, or tracking experiment results with MLflow/W&B. Activate when the user works on model development, data preprocessing for training, cross-validation, or feature engineering.', doNotUse: 'Do not use for prompt engineering or LLM instruction tuning — use PE instead.' },
            { id: 'MLE-DEPLOY', name: 'Model serving & inference pipeline', budget: getDefaultBudget('MLE-DEPLOY') ?? 180, trigger: 'Use when deploying trained models to production, building inference APIs, optimizing model latency, setting up model versioning, or configuring A/B testing for model variants. Activate when the user asks about serving models, batch inference, or real-time prediction endpoints.', doNotUse: 'Do not use for general REST API development — use BE instead.' },
            { id: 'MLE-MONITOR', name: 'Model monitoring & drift detection', budget: getDefaultBudget('MLE-MONITOR') ?? 150, trigger: 'Use when building model monitoring dashboards, drift detectors, prediction distribution tracking, or automated retraining triggers. Activate when the user asks about model performance degradation, data drift, concept drift, or model freshness.', doNotUse: 'Do not use for infrastructure monitoring — use DEVOPS-MONITOR instead.' },
        ],
    },
    BRAND: {
        name: 'Brand / Graphic Designer',
        capabilities: [
            { id: 'BRAND-IDENTITY', name: 'Brand identity & style guide', budget: getDefaultBudget('BRAND-IDENTITY') ?? 180, trigger: 'Use when defining brand colors, typography, logo usage, tone of voice, or visual identity. Activate when the user asks about branding, visual consistency, logo guidelines, or establishing how the product should "look and feel" across touchpoints.', doNotUse: 'Do not use for UI component design or wireframes — use UIUX instead.' },
            { id: 'BRAND-ASSETS', name: 'Visual asset creation', budget: getDefaultBudget('BRAND-ASSETS') ?? 160, trigger: 'Use when creating illustrations, custom icons, social media graphics, marketing visuals, or presentation templates. Activate when the user needs visual content for marketing, branding campaigns, or product packaging.', doNotUse: 'Do not use for wireframes, prototypes, or interaction design — use UIUX instead.' },
            { id: 'BRAND-GUIDE', name: 'Brand guideline documentation', budget: getDefaultBudget('BRAND-GUIDE') ?? 140, trigger: 'Use when documenting brand standards, asset usage rules, brand voice guidelines, or creating a brand book. Activate when the user wants to formalize how the brand should be used across teams and channels.', doNotUse: 'Do not use for technical product documentation — use DOCS instead.' },
        ],
    },
};

export function roleToSlug(role: string): string {
    const baseId = extractRoleId(role);
    return ROLE_RUNTIME_NAMES[baseId] ?? baseId.toLowerCase();
}

function getRoleDefinition(roleStr: string): { name: string; capabilities: SkillCapability[] } | undefined {
    const baseId = extractRoleId(roleStr);
    const def = ROLE_CAPABILITIES[baseId];

    if (!def) {
        return undefined;
    }

    const allowedCapabilities = new Set(getCapabilitiesForRole(roleStr));
    return {
        name: def.name,
        capabilities: def.capabilities.filter(
            (cap) => allowedCapabilities.size === 0 || allowedCapabilities.has(cap.id),
        ),
    };
}

function renderSkillBody(roleStr: string, projectName: string): string {
    const baseId = extractRoleId(roleStr);
    const def = getRoleDefinition(roleStr);

    if (!def) {
        return `# ${roleStr} - ${projectName}

## When to Use
- Use when tasks for this role are explicitly requested.

## Instructions
- Read team.md before acting.
`;
    }

    const deepContent = renderDeepSkillContent(baseId);
    const capLines = def.capabilities.map((cap) =>
        `### ${cap.id}: ${cap.name}
- Budget: ${cap.budget} words
- Trigger: ${cap.trigger}
- Do not use: ${cap.doNotUse}`,
    ).join('\n\n');

    return `# ${def.name} - ${projectName}

${deepContent}${renderRoleOverrideGuidance(baseId)}## Capabilities

${capLines}

## Config Maintenance
${getRoleMaintenance(roleStr).map((line) => `- ${line}`).join('\n')}

## Shared Methodology
- ${renderMethodologyReference()}

`;
}

export function renderSkillFile(roleStr: string, projectName: string): string {
    const slug = roleToSlug(roleStr);
    const def = getRoleDefinition(roleStr);
    const description = def
        ? `${def.name} role for ${projectName}. Use when ${def.name.toLowerCase()} work is needed.`
        : `${roleStr} role for ${projectName}.`;

    return `---
name: ${slug}
description: ${description}
---

${renderSkillBody(roleStr, projectName)}`;
}

function renderClaudeMd(roles: string[], projectName: string): string {
    const lines = [
        `# ${projectName}`,
        '_Agent team bootstrap generated by StackMoss._',
        '',
        '## First Session Policy',
        '- Read team.md, FEATURES.md, NORTH_STAR.md, and NON_GOALS.md before acting.',
        '- Read ROLE_SKILL_OVERRIDES.md for persistent project-specific role calibration before changing role behavior.',
        '- Confirm BRD or NORTH_STAR is locked before real feature delivery.',
        '- If the BRD is not locked, turn F1 into locking scope, constraints, and success criteria.',
        '- Begin in Tech Lead mode: scan the repo, ask follow-up questions, and calibrate the team before implementation.',
        '- Shared config changes are replace-only and require user confirmation before apply.',
        '- Never persist secrets, tokens, passwords, or private keys in generated skill files or repo guidance.',
        '',
        '## Claude Code Skill Layout',
        '- Project skills live in .claude/skills/<skill-name>/SKILL.md.',
        '- Keep CLAUDE.md for repo-wide guidance and use skill folders for role behavior.',
        '',
        '## Team Skills',
    ];

    lines.push('- Shared methodology: .claude/skills/stackmoss-methodology/SKILL.md');

    for (const role of roles) {
        const baseId = extractRoleId(role);
        const roleName = ROLE_CAPABILITIES[baseId]?.name ?? role;
        lines.push(`- ${roleName}: .claude/skills/${roleToSlug(role)}/SKILL.md`);
    }

    lines.push('');

    return `${lines.join('\n')}\n`;
}

/**
 * Legacy Claude Code target preserved for compatibility.
 */
export function compileClaudeCode(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    return uniqueRoles(roles, autoAddedRoles).map((role) => ({
        path: `.claude/skills/${roleToSlug(role)}.skill.md`,
        content: renderSkillBody(role, projectName),
    }));
}

/**
 * Official Claude Code bootstrap:
 * - CLAUDE.md at repo root
 * - .claude/skills/<skill-name>/SKILL.md
 */
export function compileClaudeCodeV2(
    roles: string[],
    autoAddedRoles: string[],
    projectName: string,
): GeneratedFile[] {
    const allRoles = uniqueRoles(roles, autoAddedRoles);
    const roleIds = uniqueRoleIds(roles, autoAddedRoles);
    const files: GeneratedFile[] = [
        {
            path: 'CLAUDE.md',
            content: renderClaudeMd(allRoles, projectName),
        },
        {
            path: '.claude/skills/stackmoss-methodology/SKILL.md',
            content: renderSharedMethodologySkill(projectName, roleIds, 'Claude Code'),
        },
    ];

    for (const role of allRoles) {
        files.push({
            path: `.claude/skills/${roleToSlug(role)}/SKILL.md`,
            content: renderSkillFile(role, projectName),
        });
    }

    return files;
}
