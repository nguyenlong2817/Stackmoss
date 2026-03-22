/**
 * Deep Role Skill Content
 * Authority: superpowers vendor format (Iron Law → Process → Examples → Anti-patterns → Checklist)
 *
 * Each role gets real technical depth beyond governance.
 * TL calibration can enrich these with project-specific stack patterns.
 */

// ─── Skill Content Registry ─────────────────────────────────────

export interface RoleSkillContent {
    ironLaw: string;
    whenToUse: string[];
    process: string;
    goodBad?: string;
    antiPatterns: string[];
    checklist: string[];
}

const SKILL_CONTENT: Record<string, RoleSkillContent> = {

    // ═══════════════════════════════════════════════════════════════
    // LEADERSHIP
    // ═══════════════════════════════════════════════════════════════

    TL: {
        ironLaw: 'NO ARCHITECTURE DECISION WITHOUT A WRITTEN ADR FIRST',
        whenToUse: [
            'Architecture decisions affecting >1 module',
            'Code review before merge to main',
            'Team topology changes or role reassignment',
            'Sprint planning and feature decomposition',
            'Repo calibration after BRD changes',
        ],
        process: `### Architecture Decision Process
1. **Identify the decision** — what are we deciding and why now?
2. **List constraints** — budget, timeline, team skills, existing tech debt
3. **Enumerate options** — at least 2 alternatives, never just "the obvious one"
4. **Evaluate trade-offs** — latency, cost, complexity, maintainability
5. **Write ADR** — status, context, decision, consequences
6. **Review with team** — get at least one dissenting opinion before finalizing
7. **Communicate** — update CONTEXT.md, notify affected roles

### Code Review Protocol
- Review for correctness first, style second
- Check: does this change respect capability budgets?
- Verify: are tests present and meaningful (not just coverage)?
- Confirm: does the change align with current ADR decisions?
- Block merges that bypass QA or skip required checks`,
        goodBad: `**Good ADR:**
\`\`\`markdown
## ADR-003: Use PostgreSQL over MongoDB
Status: Accepted
Context: Our data is relational (users → orders → items). We need ACID transactions for payments.
Decision: PostgreSQL 16 with Prisma ORM.
Consequences: Team needs Prisma knowledge. Migration tooling required.
\`\`\`

**Bad ADR:**
\`\`\`markdown
## ADR-003: Database
We'll use Postgres because it's better.
\`\`\``,
        antiPatterns: [
            'Decision by committee — one person owns each ADR, others review',
            'Architecture astronaut — designing for problems that don\'t exist yet',
            'Big bang rewrites — prefer incremental migration with feature flags',
            'Reviewing code you didn\'t understand — ask questions first',
            'Approving PRs without running tests locally',
        ],
        checklist: [
            'Every architecture decision has a written ADR',
            'ADR includes at least 2 alternatives considered',
            'Code review checks capability budgets',
            'CONTEXT.md is current after every feature',
            'No merge without passing CI + QA sign-off',
        ],
    },

    PM: {
        ironLaw: 'NO FEATURE SHIPS WITHOUT A CLEAR SUCCESS METRIC',
        whenToUse: [
            'Product scope is unclear — user needs help defining what to build',
            'BRD does not exist yet and needs to be created from scratch',
            'BRD is a draft and needs finalization before development begins',
            'Defining or updating the product roadmap',
            'Prioritizing backlog items using impact-driven frameworks',
            'Evaluating feature trade-offs and cost-benefit',
            'Preparing stakeholder demos or status reports',
            'Go/no-go decisions for feature releases',
        ],
        process: `### BRD Discovery Process (Pre-BRD)
Use this when the user has no BRD or only a rough idea:
1. **Problem framing** — what pain point does this solve? Who feels the pain?
2. **Solution hypothesis** — how do we believe this solves the problem?
3. **Target user** — who specifically uses this? (persona, not "everyone")
4. **Scope boundaries** — what is IN scope for v1, what is explicitly OUT?
5. **Success metric** — what single metric proves this worked? (activation rate, revenue, time saved)
6. **Constraints** — budget, timeline, regulatory, team skill limitations
7. **Write BRD** — compile into structured doc: Problem, Solution, Scope, Non-Goals, Success Criteria, Constraints
8. **Review and lock** — walk through with stakeholders, adjust, then mark as LOCKED

### Stakeholder Interview Template
When the user is unsure about scope, ask these in order:
- "What problem are you trying to solve?"
- "Who is the primary user and what do they need?"
- "What would make you consider v1 successful?"
- "What are you explicitly NOT building in this phase?"
- "What is the deadline or budget constraint?"
- "Are there regulatory or compliance requirements?"

### Feature Prioritization (RICE Framework)
1. **Reach** — how many users does this affect per quarter?
2. **Impact** — how much does this move the needle? (3=massive, 2=high, 1=medium, 0.5=low)
3. **Confidence** — how sure are we about reach/impact? (100%/80%/50%)
4. **Effort** — how many person-weeks? (smaller = better)
5. **Score** = (Reach × Impact × Confidence) / Effort
6. **Stack rank** — highest RICE score wins, with strategic overrides documented

### MVP Scoping Checklist
- [ ] Core user flow identified (max 3 flows for v1)
- [ ] Each flow has measurable success criteria
- [ ] Non-goals are explicit and documented
- [ ] Technical feasibility confirmed by Tech Lead
- [ ] Timeline estimated with appetite sizing (XS/S/M/L/XL)

### Release Readiness Checklist
- Feature meets acceptance criteria (verified by QA)
- Success metric is instrumented and dashboarded
- Rollback plan documented
- Stakeholder demo completed
- Release notes drafted`,
        goodBad: `**Good BRD scope:**
\`\`\`markdown
## Problem
Small merchants cannot accept online vouchers because existing platforms charge 15-30% commissions.

## Solution
A self-service voucher platform where merchants set their own pricing (0-5% fee).

## v1 Scope
- Merchant signup and store creation
- Voucher creation with QR codes
- Customer purchase and redemption

## Non-Goals (v1)
- Analytics dashboard (v2)
- Multi-currency support (v3)
- Affiliate program (future)

## Success Metric
10 active merchants with ≥50 vouchers sold in first month.
\`\`\`

**Bad BRD scope:**
\`\`\`markdown
Build a voucher platform. It should be easy to use and have lots of features.
\`\`\``,
        antiPatterns: [
            'Starting development without a locked BRD — scope will drift',
            'HiPPO decisions — highest paid person\'s opinion overriding data',
            'Feature factory — shipping features without measuring outcomes',
            'Scope creep — "just one more thing" without adjusting timeline',
            'Vanity metrics — tracking signups instead of activation/retention',
            'Skipping non-goals — everything is in scope until you say it\'s not',
            'Proxy metrics — optimizing what\'s easy to measure, not what matters',
        ],
        checklist: [
            'BRD exists and is marked LOCKED before any development begins',
            'Every feature has a measurable success metric',
            'Non-goals are explicit and reviewed with Tech Lead',
            'Backlog is prioritized with documented rationale',
            'Stakeholders are aligned before development starts',
            'Release has a rollback plan',
            'Post-launch review is scheduled',
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    // BUSINESS
    // ═══════════════════════════════════════════════════════════════

    BA: {
        ironLaw: 'NO DEVELOPMENT WITHOUT TESTABLE ACCEPTANCE CRITERIA',
        whenToUse: [
            'Requirements are unclear or conflicting',
            'New feature needs formal acceptance criteria',
            'Stakeholder interviews to elicit hidden requirements',
            'Gap analysis between BRD and implementation',
        ],
        process: `### Requirements Elicitation
1. **Stakeholder map** — who has input, who has authority, who is affected?
2. **As-is analysis** — what exists today? What are the pain points?
3. **To-be definition** — what should the future state look like?
4. **Gap identification** — delta between as-is and to-be
5. **Acceptance criteria** — Given/When/Then for every user story
6. **Edge cases** — what happens when input is invalid, empty, huge, concurrent?

### Acceptance Criteria Format (Given/When/Then)
\`\`\`
Given: [precondition — system state before action]
When:  [action — what the user does]
Then:  [outcome — observable result]
\`\`\``,
        antiPatterns: [
            'Vague acceptance criteria — "it should work well" is not testable',
            'Gold plating — adding requirements nobody asked for',
            'Assumption-driven development — assuming you know what users want',
            'Missing edge cases — only writing happy path criteria',
        ],
        checklist: [
            'Every user story has Given/When/Then acceptance criteria',
            'Edge cases and error scenarios are documented',
            'Stakeholders have reviewed and signed off on requirements',
            'Requirements trace back to BRD objectives',
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    // ENGINEERING
    // ═══════════════════════════════════════════════════════════════

    FE: {
        ironLaw: 'NO UI COMPONENT WITHOUT A STORYBOOK/TEST CASE FIRST',
        whenToUse: [
            'Building UI components, pages, or interactive elements',
            'Implementing design tokens, CSS architecture, or responsive layouts',
            'Accessibility audits — ARIA, keyboard nav, screen readers',
            'Performance optimization — bundle size, LCP, CLS',
        ],
        process: `### Component Development Workflow
1. **Design review** — understand the spec from UIUX, identify tokens and variants
2. **Write component test** — test renders, accepts props, handles interactions
3. **Build component** — semantic HTML first, then style, then interactivity
4. **Accessibility pass** — keyboard nav, ARIA labels, focus management, color contrast
5. **Responsive pass** — mobile-first, breakpoints, touch targets (min 44×44px)
6. **Performance check** — no layout shifts, lazy-load below fold, minimize re-renders

### CSS Architecture Rules
- Use design tokens (not magic numbers): \`var(--spacing-md)\` not \`16px\`
- Component-scoped styles (CSS modules, scoped, or BEM)
- No \`!important\` — fix specificity at the source
- Mobile-first media queries: min-width, not max-width`,
        antiPatterns: [
            'Div soup — use semantic HTML (nav, main, section, article, aside)',
            'Inline styles — use design tokens via CSS variables or theme',
            'Missing alt text — every img needs descriptive alt or role="presentation"',
            'Click-only interactions — all interactive elements must work with keyboard',
            'Testing implementation details — test behavior, not DOM structure',
        ],
        checklist: [
            'Component has unit test covering render + interactions',
            'All interactive elements are keyboard accessible',
            'ARIA labels are present where semantic HTML is insufficient',
            'Design tokens used (no hardcoded colors/sizes)',
            'Responsive from 320px to 1920px verified',
            'No layout shifts (CLS < 0.1)',
        ],
    },

    BE: {
        ironLaw: 'NO ENDPOINT WITHOUT INPUT VALIDATION AND ERROR HANDLING',
        whenToUse: [
            'Implementing REST/GraphQL endpoints, DTOs, or service logic',
            'Designing database schemas, writing migrations, or optimizing queries',
            'Implementing auth flows, session management, RBAC, or tokens',
        ],
        process: `### API Endpoint Checklist
1. **Input validation** — validate all inputs at the boundary (DTO/schema)
2. **Authorization** — check permissions before business logic
3. **Business logic** — pure functions where possible, side effects at edges
4. **Error handling** — consistent error format, proper HTTP status codes
5. **Logging** — structured logs with correlation IDs, no PII in logs
6. **Response shape** — consistent envelope, pagination, HATEOAS links if REST

### Database Patterns
- Migrations are additive — never drop columns in production
- Use transactions for multi-table writes
- Index columns used in WHERE, JOIN, ORDER BY
- N+1 query detection — use eager loading or dataloaders
- Soft deletes for user-facing data (deletedAt timestamp)`,
        antiPatterns: [
            'Fat controllers — business logic belongs in services, not route handlers',
            'Trusting client input — validate everything server-side',
            'Catch-all error handlers — handle specific errors, log unexpected ones',
            'Raw SQL in controllers — use query builders or ORM',
            'Leaking internal errors — return generic message, log full detail',
        ],
        checklist: [
            'All inputs validated with DTO/schema before processing',
            'Error responses use consistent format with proper status codes',
            'Database queries are N+1 free',
            'Migrations are reversible and additive',
            'Auth middleware protects all non-public endpoints',
            'Structured logging with correlation IDs',
        ],
    },

    FS: {
        ironLaw: 'NO API INTEGRATION WITHOUT A CONTRACT TEST',
        whenToUse: [
            'Wiring API calls to UI — state management, data fetching',
            'Scaffolding new modules — routing, build config, project setup',
            'Performance optimization — SSR/SSG, caching, bundle splitting',
        ],
        process: `### Integration Workflow
1. **Define contract** — agree on API shape (types/schema) before building
2. **Build API** — endpoint with validation, tests, mock data
3. **Build UI** — component consuming the API, with loading/error states
4. **Contract test** — verify API response matches TypeScript types
5. **E2E test** — full flow from UI action to DB mutation and back

### State Management Rules
- Server state (API data) → use query library (React Query, SWR, tRPC)
- Client state (UI state) → use framework state (useState, signals, stores)
- Never duplicate server state in client stores
- Optimistic updates need rollback on failure`,
        antiPatterns: [
            'Backend-for-frontend bloat — keep BFF thin, push logic to services',
            'Prop drilling 5+ levels — use context or state management',
            'Mixing server and client state — they have different lifecycles',
            'No loading states — every async action needs loading + error UI',
        ],
        checklist: [
            'API contract is defined as TypeScript types shared between FE/BE',
            'Loading, error, and empty states are handled in UI',
            'Server state managed by query library, not manual stores',
            'Contract tests verify API response matches types',
        ],
    },

    MOBILE: {
        ironLaw: 'NO RELEASE WITHOUT TESTING ON REAL DEVICE',
        whenToUse: [
            'Building native screens, navigation flows, or platform-specific UI',
            'Optimizing app size, memory usage, or battery consumption',
            'Integrating camera, GPS, storage, push notifications, or permissions',
        ],
        process: `### Mobile Development Workflow
1. **Platform check** — which platforms? iOS, Android, or both?
2. **Offline-first** — design data layer assuming no network
3. **Permission flow** — request permissions contextually, explain why
4. **Performance budget** — app size < 50MB, cold start < 2s, 60fps scrolling
5. **Deep linking** — universal links (iOS) / app links (Android) from day 1
6. **App store review** — follow Apple/Google guidelines proactively

### Offline-First Patterns
- Local DB (SQLite/Realm) as source of truth
- Sync queue for pending mutations
- Conflict resolution strategy (last-write-wins or manual merge)
- UI shows sync status (synced, pending, conflict)`,
        antiPatterns: [
            'Emulator-only testing — real devices have different performance',
            'Requesting all permissions at launch — ask contextually when needed',
            'Blocking UI on network — assume offline, sync in background',
            'Ignoring memory leaks — profile with Instruments/Android Profiler',
            'Hardcoding dimensions — use responsive layout (flexbox, constraints)',
        ],
        checklist: [
            'Tested on real devices (not just emulator)',
            'Offline mode works — data persists, UI is usable',
            'Permissions requested contextually with explanation',
            'App size within budget, cold start < 2s',
            'Deep links configured and tested',
        ],
    },

    DEVOPS: {
        ironLaw: 'NO DEPLOY WITHOUT ROLLBACK PLAN',
        whenToUse: [
            'Setting up CI/CD pipelines, GitHub Actions, or build automation',
            'Writing Dockerfiles, Compose configs, Terraform, or cloud infra',
            'Setting up logging, alerting, health checks, or APM',
        ],
        process: `### CI/CD Pipeline Standards
1. **Build** — deterministic builds (lock files, pinned versions)
2. **Test** — unit + integration tests gate every PR
3. **Lint** — code quality checks (ESLint, Prettier, type check)
4. **Security** — dependency audit, secret scanning
5. **Deploy staging** — auto-deploy to staging on merge to main
6. **Deploy production** — manual approval or canary rollout
7. **Monitor** — health checks, error rate alerts, rollback triggers

### Docker Best Practices
- Multi-stage builds — separate build and runtime stages
- Non-root user — never run as root in production
- .dockerignore — exclude node_modules, .git, .env
- Health check — HEALTHCHECK instruction in Dockerfile
- Pin base image versions — \`node:20.11-alpine\`, not \`node:latest\``,
        antiPatterns: [
            'YOLO deploys — deploying directly to production without staging',
            'Secret in code — use environment variables or secret managers',
            'Snowflake servers — everything must be reproducible from config',
            'Alert fatigue — too many alerts = no alerts. Be selective.',
            'No rollback plan — every deploy must have a documented undo path',
        ],
        checklist: [
            'CI runs tests, lint, and security audit on every PR',
            'Staging environment mirrors production',
            'Rollback procedure documented and tested',
            'Secrets are in vault/env vars, never in code or images',
            'Health checks configured for all services',
            'Monitoring dashboards show error rate, latency, throughput',
        ],
    },

    DATA: {
        ironLaw: 'NO PIPELINE WITHOUT DATA VALIDATION AT EVERY BOUNDARY',
        whenToUse: [
            'Building data ingestion pipelines, transformations, or batch jobs',
            'Designing data models, warehouse schemas, or analytics tables',
            'Implementing data quality checks, anomaly detection, or testing',
        ],
        process: `### ETL Pipeline Standards
1. **Extract** — idempotent reads, handle partial failures, log source metadata
2. **Validate** — schema validation at ingestion boundary (reject bad data early)
3. **Transform** — pure functions, no side effects, reproducible from inputs
4. **Load** — atomic writes, upsert patterns, partition by date/source
5. **Monitor** — row counts, null rates, freshness SLAs, anomaly detection

### Schema Evolution Rules
- Additive changes only — new columns with defaults, never remove
- Version your schemas — schema registry or migration table
- Backward compatibility — old consumers must work with new schema
- Document every field — what it means, units, allowed values, nullability`,
        antiPatterns: [
            'Schema-on-read — validate at ingestion, not at query time',
            'Silent data corruption — validate row counts, checksums, nulls',
            'Pipeline without monitoring — if you can\'t see it fail, it\'s failing',
            'Hardcoded credentials — use IAM roles or secret managers',
        ],
        checklist: [
            'Schema validation at every pipeline boundary',
            'Row count and null rate monitoring in place',
            'Pipeline is idempotent (re-running produces same result)',
            'Schema changes are backward compatible',
            'Data freshness SLA defined and alerted',
        ],
    },

    MLE: {
        ironLaw: 'NO MODEL DEPLOYMENT WITHOUT AN EVAL HARNESS',
        whenToUse: [
            'Training models, running experiments, or tuning hyperparameters',
            'Deploying models to production, building inference APIs',
            'Building monitoring dashboards, drift detectors, or retraining triggers',
        ],
        process: `### ML Experiment Workflow
1. **Hypothesis** — what are we testing and what metric will improve?
2. **Data prep** — reproducible splits (train/val/test), version datasets
3. **Baseline** — establish baseline performance before experimenting
4. **Train** — log all hyperparams, metrics, artifacts (MLflow/W&B)
5. **Evaluate** — eval harness with held-out test set, multiple metrics
6. **Compare** — is improvement statistically significant?
7. **Ship or discard** — only deploy if eval passes threshold

### Model Deployment Checklist
- Inference latency SLA defined and tested
- Input validation (reject malformed inputs before inference)
- A/B testing or shadow mode before full rollout
- Monitoring: prediction distribution, latency, error rate
- Rollback: ability to revert to previous model version in < 5 min`,
        antiPatterns: [
            'Training on test data — strict train/val/test separation',
            'Metric gaming — optimizing proxy metrics instead of business outcome',
            'No versioning — every experiment must be reproducible',
            'Deploy and forget — models decay, monitor and retrain regularly',
        ],
        checklist: [
            'Experiment is logged with hyperparams and metrics',
            'Eval harness runs on held-out test set',
            'Model passes latency SLA before deployment',
            'Monitoring tracks prediction distribution and drift',
            'Rollback to previous model is tested and documented',
        ],
    },

    DEV: {
        ironLaw: 'NO CODE WITHOUT A FAILING TEST FIRST',
        whenToUse: [
            'Implementing features from acceptance criteria',
            'Debugging errors or unexpected behavior',
            'Environment setup, command knowledge, and local tooling',
        ],
        process: `### Implementation Workflow (TDD)
1. **Read acceptance criteria** — understand what "done" means
2. **Write failing test** — smallest test that proves the feature is missing
3. **Watch it fail** — confirm test fails for the right reason
4. **Write minimal code** — just enough to pass the test
5. **Watch it pass** — confirm all tests green
6. **Refactor** — clean up while keeping tests green
7. **Commit** — small, focused commits with descriptive messages

### Debug Protocol
1. Read error messages completely — they often contain the answer
2. Reproduce consistently — if you can't trigger it reliably, gather more data
3. Check recent changes — git diff, recent commits
4. Form hypothesis — "I think X because Y"
5. Test minimally — one variable at a time
6. Fix at root cause — not at symptom`,
        antiPatterns: [
            'Code before test — if you didn\'t see it fail, you don\'t know it tests anything',
            'Big bang commits — commit after each test/implementation cycle',
            'Copy-paste programming — extract shared logic into functions',
            'Catch-all exceptions — handle specific errors, log unexpected ones',
        ],
        checklist: [
            'Every new function has a test that was written first',
            'Tests are green before committing',
            'Commit messages describe what changed and why',
            'No TODO comments without a linked issue',
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    // DESIGN
    // ═══════════════════════════════════════════════════════════════

    UIUX: {
        ironLaw: 'NO DESIGN HANDOFF WITHOUT A USABILITY REVIEW',
        whenToUse: [
            'Defining design tokens — colors, typography, spacing, elevation',
            'Creating wireframes or interactive prototypes',
            'Reviewing implemented UI against design specs and heuristics',
        ],
        process: `### Design Token System
1. **Colors** — semantic names (--color-primary, --color-error), not hex values
2. **Typography** — scale with ratios (1.25 or 1.333), max 4 sizes per page
3. **Spacing** — 4px base grid (4, 8, 12, 16, 24, 32, 48, 64)
4. **Elevation** — shadow levels (0-4), consistent across components
5. **Motion** — easing curves and durations (150ms micro, 300ms transition, 500ms page)

### Usability Heuristics (Nielsen)
1. System status visibility — user always knows what's happening
2. Match real world — use familiar language and concepts
3. User control — undo, redo, cancel, go back
4. Consistency — same action = same result everywhere
5. Error prevention — constrain inputs, confirm destructive actions`,
        antiPatterns: [
            'Designing in isolation — involve engineering early for feasibility',
            'Pixel-perfect handoff without responsive specs — design for breakpoints',
            'Ignoring edge cases — empty states, loading, error, long text, RTL',
            'Too many typefaces — max 2 font families per project',
        ],
        checklist: [
            'Design tokens documented and shared with engineering',
            'All states covered: default, hover, active, disabled, loading, error, empty',
            'Responsive breakpoints specified (mobile, tablet, desktop)',
            'Color contrast meets WCAG AA (4.5:1 text, 3:1 large text)',
            'Interactive prototype tested with 3+ users before handoff',
        ],
    },

    BRAND: {
        ironLaw: 'NO ASSET WITHOUT BRAND GUIDELINE COMPLIANCE',
        whenToUse: [
            'Defining brand colors, typography, logo usage, or tone of voice',
            'Creating illustrations, icons, social media graphics, or marketing visuals',
            'Documenting brand standards, asset usage rules, or voice guidelines',
        ],
        process: `### Brand Identity Development
1. **Audit** — what exists today? Collect all brand touchpoints
2. **Strategy** — brand positioning, values, personality attributes
3. **Visual identity** — logo, colors, typography, imagery style
4. **Voice & tone** — how the brand speaks (formal/casual, technical/friendly)
5. **Guidelines** — document all rules with do/don't examples
6. **Asset library** — organized, versioned, accessible to all team members

### Logo Usage Rules
- Minimum clear space around logo (usually 1x the logo mark height)
- Minimum size for legibility (print and digital)
- Approved color variations (full color, mono, reversed)
- Prohibited modifications (stretching, rotating, recoloring)`,
        antiPatterns: [
            'Brand by committee — one person owns brand decisions',
            'Inconsistent application — same logo in different sizes/colors/contexts',
            'Missing dark mode variants — always provide light and dark versions',
            'No asset versioning — old logos floating around in presentations',
        ],
        checklist: [
            'Brand guidelines document is published and accessible',
            'Logo files provided in SVG, PNG (1x, 2x, 3x), and dark/light variants',
            'Color palette includes primary, secondary, neutral, semantic (error, success)',
            'Typography scale matches UI design tokens',
            'Tone of voice guide with real copy examples',
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    // QUALITY
    // ═══════════════════════════════════════════════════════════════

    QA: {
        ironLaw: 'NO FEATURE MARKED DONE WITHOUT QA SIGN-OFF',
        whenToUse: [
            'After implementation — verifying acceptance criteria are met',
            'Before release — regression testing across affected areas',
            'Edge case discovery — what breaks when inputs are unexpected?',
        ],
        process: `### Test Strategy (Testing Pyramid)
1. **Unit tests** (70%) — fast, isolated, test one function/module
2. **Integration tests** (20%) — test module boundaries (API + DB, UI + API)
3. **E2E tests** (10%) — critical user journeys only (login → purchase → receipt)

### Edge Case Discovery
- **Boundaries**: 0, 1, max, max+1, negative
- **Types**: null, undefined, empty string, empty array, wrong type
- **Timing**: concurrent requests, rapid clicks, timeout
- **Size**: very long strings, large file uploads, many items
- **State**: logged out, expired session, mid-migration, offline

### Regression Prevention
- Every bug fix needs a regression test
- Regression suite runs on every PR
- Track test coverage trends (not absolute numbers)`,
        antiPatterns: [
            'Testing only happy path — edge cases is where bugs live',
            'Flaky tests — fix immediately, don\'t skip or retry',
            'Testing implementation — test behavior, not how it works',
            'Manual-only testing — automate everything repeatable',
        ],
        checklist: [
            'Acceptance criteria verified with automated tests',
            'Edge cases tested (boundaries, nulls, concurrency)',
            'Regression suite passes on PR',
            'No flaky tests in CI',
            'Bug fixes have regression tests',
        ],
    },

    PE: {
        ironLaw: 'NO PROMPT SHIPS WITHOUT EVAL AGAINST GOLDEN SET',
        whenToUse: [
            'Writing or refining system prompts, few-shot examples',
            'Building eval cases, grading rubrics, or benchmark suites',
            'Building multi-step LLM chains, tool-use flows, or agent routing',
        ],
        process: `### Prompt Engineering Workflow
1. **Define task** — clear input→output specification with examples
2. **Write golden set** — 10-20 input/expected-output pairs (diverse, edge cases)
3. **Draft prompt** — system prompt + few-shot examples
4. **Run eval** — score against golden set (exact match, LLM-as-judge, rubric)
5. **Iterate** — adjust prompt, re-eval, compare scores
6. **Ship** — only if eval score meets threshold (define before starting)

### Prompt Structure
\`\`\`
<role>You are a [specific role] that [specific behavior].</role>
<constraints>
- Always [do X]
- Never [do Y]
- When unsure, [fallback behavior]
</constraints>
<format>Respond in [specific format]</format>
<examples>
Input: [example input]
Output: [example output]
</examples>
\`\`\``,
        antiPatterns: [
            'Vibes-based evaluation — always use a scoring rubric',
            'Testing on training examples — eval set must be held out',
            'Prompt bloat — shorter prompts often work better',
            'Single metric — use multiple eval dimensions (accuracy, format, safety)',
        ],
        checklist: [
            'Golden set has 10+ diverse examples with expected outputs',
            'Eval harness runs automatically before prompt deploy',
            'Eval score meets defined threshold',
            'Prompt is versioned in source control',
            'Chain/agent has fallback behavior for unexpected LLM output',
        ],
    },

    // ═══════════════════════════════════════════════════════════════
    // OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    DOCS: {
        ironLaw: 'NO FEATURE SHIPS WITHOUT UPDATED DOCUMENTATION',
        whenToUse: [
            'After a feature is complete — update README, API docs, changelog',
            'At the end of a feature cycle — generate changelog entry',
            'When onboarding new team members — keep runbooks current',
        ],
        process: `### Documentation Standards
1. **README** — project purpose, quick start (< 5 min to run), architecture overview
2. **API docs** — every endpoint documented (method, path, params, response, errors)
3. **Changelog** — [Keep a Changelog](https://keepachangelog.com) format
4. **Runbooks** — step-by-step for deployment, rollback, incident response
5. **ADRs** — architecture decision records (maintained by TL)

### Writing Guide
- Lead with the most important information
- Use code examples, not just descriptions
- Show the command, show the output
- Link to related docs, don't duplicate`,
        antiPatterns: [
            'Documentation as afterthought — write docs alongside code',
            'Stale docs — outdated docs are worse than no docs',
            'Wall of text — use headers, code blocks, tables, diagrams',
            'Documenting implementation — document behavior and usage',
        ],
        checklist: [
            'README has working quick start instructions',
            'API endpoints are documented with examples',
            'Changelog is updated with every release',
            'Runbooks are tested (someone else can follow them)',
        ],
    },

    SEC: {
        ironLaw: 'NO DEPLOY TOUCHING AUTH OR PII WITHOUT SECURITY REVIEW',
        whenToUse: [
            'Before any feature touching auth, PII, or financial data',
            'Dependency audit — checking for known vulnerabilities',
            'Access control review — RBAC, permissions, token scopes',
        ],
        process: `### Security Review Checklist
1. **Auth** — tokens expire, refresh tokens rotate, sessions invalidate on password change
2. **Input** — all user input sanitized (XSS, SQL injection, path traversal)
3. **Secrets** — no secrets in code, env vars, or logs. Use secret managers.
4. **Dependencies** — \`npm audit\`, Snyk, or Dependabot. Fix critical/high immediately.
5. **Access** — principle of least privilege. No admin-by-default.
6. **Data** — PII encrypted at rest and in transit. Retention policies defined.

### OWASP Top 10 Quick Reference
- Injection — parameterized queries, never string concatenation
- Broken auth — MFA, rate limiting, secure session management
- Sensitive data exposure — TLS everywhere, encrypt at rest
- XSS — output encoding, CSP headers
- CSRF — SameSite cookies, CSRF tokens for state-changing operations`,
        antiPatterns: [
            'Security through obscurity — assume attackers know your code',
            'Hardcoded secrets — use environment variables or vault',
            'Trusting client-side validation — always validate server-side',
            'Ignoring npm audit — fix or document suppressions',
        ],
        checklist: [
            'No secrets in source code or logs',
            'All user input validated and sanitized server-side',
            'npm audit shows no critical/high vulnerabilities',
            'Auth tokens expire and are rotated properly',
            'PII encrypted at rest and in transit',
        ],
    },

    OPS: {
        ironLaw: 'NO INFRASTRUCTURE CHANGE WITHOUT PLAN AND ROLLBACK',
        whenToUse: [
            'Before deploy or infrastructure changes',
            'Setting up monitoring, alerting, or health checks',
        ],
        process: `### Deploy Process
1. **Plan** — what changes, what could break, what's the rollback?
2. **Stage** — deploy to staging, verify health checks and smoke tests
3. **Canary** — deploy to small subset of production traffic
4. **Monitor** — watch error rates, latency, resource usage for 15 min
5. **Full rollout** — if metrics are stable, proceed
6. **Post-deploy** — verify monitoring dashboards, update status page`,
        antiPatterns: [
            'Friday deploys — deploy early in the week when the team is available',
            'No monitoring — if you can\'t see it break, you can\'t fix it',
            'Manual processes — automate everything repeatable',
        ],
        checklist: [
            'Rollback plan documented before deploy',
            'Staging verified before production',
            'Monitoring dashboards show key metrics',
            'Alerts configured for error rate and latency spikes',
        ],
    },
};

// ─── Public API ──────────────────────────────────────────────────

/**
 * Get deep skill content for a role.
 * Returns undefined for unknown roles (falls back to governance-only).
 */
export function getSkillContent(roleId: string): RoleSkillContent | undefined {
    return SKILL_CONTENT[roleId];
}

/**
 * Render deep skill content as markdown for inclusion in SKILL.md.
 * This is prepended to the governance section (capabilities, budgets, doNotUse).
 */
export function renderDeepSkillContent(roleId: string): string {
    const content = getSkillContent(roleId);
    if (!content) return '';

    let md = '';

    md += `## Iron Law\n\n\`\`\`\n${content.ironLaw}\n\`\`\`\n\n`;

    md += `## When to Use\n\n`;
    md += content.whenToUse.map((w) => `- ${w}`).join('\n');
    md += '\n\n';

    md += content.process;
    md += '\n\n';

    if (content.goodBad) {
        md += content.goodBad;
        md += '\n\n';
    }

    md += `## Anti-Patterns\n\n`;
    md += content.antiPatterns.map((a) => `- ${a}`).join('\n');
    md += '\n\n';

    md += `## Verification Checklist\n\n`;
    md += content.checklist.map((c) => `- [ ] ${c}`).join('\n');
    md += '\n';

    return md;
}

export function renderRoleOverrideGuidance(roleId: string): string {
    return `## Project-Specific Overrides

- Read \`ROLE_SKILL_OVERRIDES.md\` before acting.
- Apply the \`[${roleId}]\` section as the persistent project-specific delta for this role.
- If the override file conflicts with stale generated examples, prefer the verified override file and report the drift to Tech Lead.

`;
}
