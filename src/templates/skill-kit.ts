import type { GeneratedFile, TemplateInput } from './types.js';

interface RoleTemplate {
    slug: string;
    title: string;
    mission: string;
    trigger: string;
    deliverables: string[];
    mustTest: string[];
}

const ROLE_TEMPLATES: RoleTemplate[] = [
    {
        slug: 'developer',
        title: 'Developer',
        mission: 'Implement feature slices with deterministic verification and minimal blast radius.',
        trigger: 'Use for application code implementation, refactor, and bug fixes inside one module boundary.',
        deliverables: ['implementation plan', 'code diff summary', 'verification evidence'],
        mustTest: ['targeted unit tests', 'feature acceptance path'],
    },
    {
        slug: 'frontend',
        title: 'Frontend',
        mission: 'Ship UI behavior, state handling, and user-facing reliability across device sizes.',
        trigger: 'Use for component/page implementation, interaction logic, styling integration, and accessibility fixes.',
        deliverables: ['UI scope checklist', 'component changeset summary', 'responsive and a11y verification notes'],
        mustTest: ['component-level tests', 'critical interaction smoke tests'],
    },
    {
        slug: 'backend',
        title: 'Backend',
        mission: 'Deliver API and service logic that is correct, observable, and safe to evolve.',
        trigger: 'Use for endpoint changes, domain service logic, persistence access, and contract updates.',
        deliverables: ['API contract delta', 'data impact notes', 'rollback and migration notes'],
        mustTest: ['service or integration tests', 'contract or schema compatibility checks'],
    },
    {
        slug: 'devops',
        title: 'DevOps',
        mission: 'Keep build, deploy, and runtime operations stable while improving delivery speed.',
        trigger: 'Use for CI/CD pipelines, infra config, deployment automation, and runtime diagnostics.',
        deliverables: ['pipeline or infra change plan', 'operational risk list', 'deploy verification checklist'],
        mustTest: ['pipeline smoke checks', 'deployment and rollback validation'],
    },
    {
        slug: 'qa',
        title: 'Quality Assurance',
        mission: 'Protect release quality with acceptance checks, regression coverage, and risk-focused testing.',
        trigger: 'Use for acceptance verification, regression strategy, exploratory checks, and release gates.',
        deliverables: ['test scope matrix', 'defect evidence and severity', 'ship or block verdict'],
        mustTest: ['acceptance criteria checks', 'high-risk regression suite'],
    },
    {
        slug: 'uiux',
        title: 'UIUX Designer',
        mission: 'Improve product clarity and usability through structured UX decisions and design quality reviews.',
        trigger: 'Use for flow design, information architecture, interaction design, and visual quality audit.',
        deliverables: ['design decision rationale', 'wireframe or flow notes', 'usability risk checklist'],
        mustTest: ['critical user journey walkthrough', 'accessibility and readability audit'],
    },
    {
        slug: 'security',
        title: 'Security',
        mission: 'Reduce exploit surface and protect sensitive flows with pragmatic controls.',
        trigger: 'Use for auth, permission boundaries, secret handling, dependency risk, and abuse-path checks.',
        deliverables: ['threat and abuse notes', 'security control checklist', 'residual risk statement'],
        mustTest: ['auth and permission boundary checks', 'secret exposure and dependency scan'],
    },
    {
        slug: 'data-engineer',
        title: 'Data Engineer',
        mission: 'Maintain trustworthy data flow from ingestion to transformation and downstream consumption.',
        trigger: 'Use for ETL or ELT pipelines, data contracts, warehouse models, and data quality checks.',
        deliverables: ['pipeline contract notes', 'schema evolution plan', 'data quality evidence'],
        mustTest: ['pipeline run validation', 'freshness and quality assertions'],
    },
    {
        slug: 'ml-engineer',
        title: 'ML Engineer',
        mission: 'Ship reliable model training and inference workflows with measurable behavior.',
        trigger: 'Use for model training loops, evaluation harnesses, inference APIs, and monitoring setup.',
        deliverables: ['experiment or model change summary', 'evaluation metrics report', 'serving risk notes'],
        mustTest: ['model metric regression checks', 'inference path smoke tests'],
    },
    {
        slug: 'docs',
        title: 'Documentation',
        mission: 'Keep operational and product documentation accurate, concise, and shippable.',
        trigger: 'Use for README, runbooks, release notes, onboarding docs, and API usage guides.',
        deliverables: ['doc scope update', 'audience-targeted deliverable', 'fact verification checklist'],
        mustTest: ['command or path validity checks', 'cross-link and consistency review'],
    },
];

function renderRoleTemplate(role: RoleTemplate): string {
    return `# Role Template: ${role.title}

## Mission
- ${role.mission}

## Trigger Guidance
- ${role.trigger}
- Avoid use when scope is better handled by Product Manager, Tech Lead, or Skill Creator.

## Core Workflow
1. Confirm scope, boundaries, and acceptance criteria.
2. Plan minimal change with explicit dependencies.
3. Execute with evidence-first reporting.
4. Validate outcomes and summarize residual risks.

## Deliverables
${role.deliverables.map((item) => `- ${item}`).join('\n')}

## Validation Baseline
${role.mustTest.map((item) => `- ${item}`).join('\n')}

## Runtime Adaptation Notes
- Claude: generate under .claude/skills/<role>/...
- Codex: generate under .agents/skills/<role>/...
- Antigravity: generate under .agent/skills/<role>/...

## Quality Bar
- Avoid generic instructions; include role-specific decisions and anti-patterns.
- Include explicit blocked-state behavior when validation cannot run.
- Keep logs free of secrets and sensitive payloads.
`;
}

function renderRoleIndex(): string {
    const rows = ROLE_TEMPLATES.map((role) => `| ${role.slug} | ${role.title} | roles/${role.slug}.template.md |`);
    return `# Skill Kit Role Index

This folder is the template-first source for skill-creator.

Use order:
1. Pick the closest role template from this index.
2. Adapt to BRD and runtime boundary.
3. Research open-source sources only if template coverage is insufficient.

| Role Key | Role Name | Template |
|:--|:--|:--|
${rows.join('\n')}
`;
}

function renderSharedSkillTemplate(): string {
    return `---
name: <skill-name>
description: <what this skill does + when to trigger + boundaries>
---

# <Skill Title>

## Mission
- <role mission>

## Activation Rules
- Use when: <high-signal triggers>
- Do not use when: <out-of-scope conditions>

## Operating Workflow
1. <step one>
2. <step two>
3. <step three>

## Deliverables
- <artifact>
- <artifact>

## Validation
- Command(s): <cmd>
- Evidence: command output and pass or fail summary.

## Blocked State
- If validation cannot run, ask owner questions and return blocked status.
`;
}

function renderRoleBlueprint(): string {
    return `# Role Skill Blueprint

## Header
- role_name:
- runtime_root:
- owner:
- version:

## Layer 1: Trigger Metadata
- trigger_description:
- trigger_examples:
- non_trigger_examples:

## Layer 2: Core Instruction
- mission:
- decision_mandate:
- operating_model:
- playbooks:
- anti_patterns:
- deliverables:
- validation_logic:
- blocked_logic:

## Layer 3 to 9: Supporting Layers
- references:
- examples:
- scripts:
- assets_templates:
- contracts_qc:
- governance:
- research_cutoff:
- validation_evidence:
`;
}

function renderOwnerQuestions(): string {
    return `# Owner Questions

## Quick Intake (3)
1. Which role should be generated?
2. Which runtime root is target?
3. What one acceptance command proves this iteration is usable?

## Interview Intake (8-10)
1. What outcome should this role own?
2. What are top trigger scenarios?
3. What is explicitly out of scope?
4. Which decisions are autonomous?
5. Which decisions require owner approval?
6. Which artifacts must always be produced?
7. Which command validates behavior?
8. What fallback is acceptable when validation fails?
9. What sensitive data must never be logged?
10. What quality bar defines ready vs blocked?
`;
}

function renderValidationMatrix(): string {
    return `# Validation Matrix

| Check | Type | Command or Method | Evidence |
|:--|:--|:--|:--|
| Structure | Static | verify required files exist | file list |
| Trigger Quality | Static | review metadata trigger scope | trigger notes |
| Behavior | Executable | run smoke command | stdout/stderr and exit code |
| Failure Handling | Executable | run negative case | logged failure with remediation |
| Boundary | Static | runtime path check | path validation note |
`;
}

function renderOutputContract(): string {
    return `# Output Contract

- Return concise status summary.
- Include validation command and pass or fail outcome.
- If failed, include remediation proposal and blocked reason.
- Include unresolved risks and owner follow-up questions when needed.
`;
}

function renderRuntimeBoundaryChecklist(): string {
    return `# Runtime Boundary Checklist

- [ ] Target runtime confirmed (.claude, .agents, or .agent)
- [ ] No files generated outside selected runtime root
- [ ] Output paths validated before write
- [ ] Cross-runtime references are informational only
`;
}

function renderSourcesRegistry(): string {
    return `# Sources Registry (Research Fallback)

Use this list only when local templates are insufficient for the requested domain.

## Preferred Sources
- https://github.com/obra/superpowers
- https://github.com/VRSEN/agency-swarm
- https://platform.openai.com/docs/guides/agents
- https://github.com/modelcontextprotocol

## Optional Domain Sources
- https://github.com/microsoft/autogen
- https://github.com/langchain-ai/langgraph
- https://github.com/crewAIInc/crewAI

## Policy
- Template-first, research-second.
- Keep runtime boundary strict while adapting external ideas.
- Record updated cutoff date in runtime skill data when sources are used.
`;
}

function renderRuntimeAdapter(runtime: 'claude' | 'codex' | 'antigravity'): string {
    const runtimeRoot = runtime === 'claude'
        ? '.claude/skills/*'
        : runtime === 'codex'
            ? '.agents/skills/*'
            : '.agent/skills/*';

    return `# Runtime Adapter: ${runtime}

## Target Root
- ${runtimeRoot}

## Required Mapping
- role template -> runtime skill folder
- shared templates -> assets/templates
- contracts -> contracts/*
- governance -> governance/*
- evidence -> data/*

## Guardrails
- never generate skills outside ${runtimeRoot}
- keep instructions runtime-agnostic except path and config conventions
`;
}

export function generateSkillKit(_input: TemplateInput): GeneratedFile[] {
    const files: GeneratedFile[] = [
        { path: '.stackmoss/skill-kit/ROLE_INDEX.md', content: renderRoleIndex() },
        { path: '.stackmoss/skill-kit/shared/SKILL.template.md', content: renderSharedSkillTemplate() },
        { path: '.stackmoss/skill-kit/shared/role-skill-blueprint.md', content: renderRoleBlueprint() },
        { path: '.stackmoss/skill-kit/shared/owner-questions.md', content: renderOwnerQuestions() },
        { path: '.stackmoss/skill-kit/shared/validation-matrix.md', content: renderValidationMatrix() },
        { path: '.stackmoss/skill-kit/shared/output-contract.md', content: renderOutputContract() },
        { path: '.stackmoss/skill-kit/shared/runtime-boundary-checklist.md', content: renderRuntimeBoundaryChecklist() },
        { path: '.stackmoss/skill-kit/sources-registry.md', content: renderSourcesRegistry() },
        { path: '.stackmoss/skill-kit/runtime-adapters/claude.md', content: renderRuntimeAdapter('claude') },
        { path: '.stackmoss/skill-kit/runtime-adapters/codex.md', content: renderRuntimeAdapter('codex') },
        { path: '.stackmoss/skill-kit/runtime-adapters/antigravity.md', content: renderRuntimeAdapter('antigravity') },
    ];

    for (const role of ROLE_TEMPLATES) {
        files.push({
            path: `.stackmoss/skill-kit/roles/${role.slug}.template.md`,
            content: renderRoleTemplate(role),
        });
    }

    return files;
}

