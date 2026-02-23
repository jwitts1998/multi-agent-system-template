import type { Node } from '@xyflow/react';

export interface PipelineAgent {
  name: string;
  role: string;
}

export interface ExamplePrompt {
  agent: string;
  prompt: string;
  context?: string;
}

export interface PipelineNodeData {
  stageNumber: number;
  title: string;
  description: string;
  agents: PipelineAgent[];
  substeps: string[];
  artifact: string;
  artifactPath?: string;
  phase: 'setup' | 'ideate' | 'build' | 'verify' | 'ship' | 'ingest';
  templateFiles: string[];
  handoff: string;
  commands?: string[];
  examplePrompts?: ExamplePrompt[];
  tips?: string[];
  [key: string]: unknown;
}

export type WorkflowNode = Node<PipelineNodeData>;

const P = { x: 0, y: 0 };

export const workflowNodes: WorkflowNode[] = [
  {
    id: 'pipeline-1',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 1,
      title: 'Clone & Setup',
      description:
        'Clone the template repository and run the interactive setup script. The script asks for your project name, type, language, framework, and architecture — then configures .cursorrules, AGENTS.md, subagents, and task files automatically.',
      agents: [],
      substeps: [
        'Clone the template repository',
        'Run the interactive setup script',
        'Answer project configuration prompts',
        'Review generated .cursorrules and AGENTS.md',
        'Run validation to check for remaining variables',
      ],
      artifact: 'Configured Project',
      artifactPath: './',
      phase: 'setup',
      templateFiles: [
        'setup.sh',
        'validate.sh',
        'PROJECT_QUESTIONNAIRE.md',
      ],
      handoff:
        'Project directory is configured with .cursorrules, AGENTS.md, subagents, and task schema. Ready for ideation.',
      commands: [
        'git clone https://github.com/jwitts1998/multi-agent-system-template.git my-project',
        'cd my-project',
        './setup.sh',
        './validate.sh',
      ],
      tips: [
        'Choose your project type carefully — it determines which .cursorrules and AGENTS.md templates get installed',
        'The setup script offers to prune unused template files — say yes to keep the repo clean',
        'Run validate.sh after setup to find any {{VARIABLES}} that still need manual customization',
      ],
    },
  },
  {
    id: 'pipeline-2',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 2,
      title: 'Idea Exploration',
      description:
        'Transform a raw product idea into a structured summary. The idea-to-pdb agent asks kickoff questions, explores the problem space, identifies target users, surfaces risks, and produces a concise idea summary ready for detailed product design.',
      agents: [{ name: 'idea-to-pdb', role: 'ideation' }],
      substeps: [
        'Kickoff questions (problem, users, differentiator)',
        'Problem definition & market context',
        'Target users & personas',
        'Value proposition validation',
        'Risk surface analysis',
      ],
      artifact: 'Idea Summary',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/idea-to-pdb.md',
        'docs/IDEA_TO_PDB.md',
      ],
      handoff:
        'Idea Summary document is reviewed and approved, then fed into the next stage for full PDB generation.',
      examplePrompts: [
        {
          agent: '@idea-to-pdb',
          prompt: '@idea-to-pdb I have an idea for a fitness tracking app.\n\nTarget users: casual gym-goers who want simple progress tracking\nKey differentiator: AI-powered workout suggestions based on past performance\nMonetization: freemium with premium AI coaching tier\n\nStart with idea exploration — help me pressure-test this concept before we build a full PDB.',
          context: 'Providing target users, differentiator, and monetization upfront lets the agent skip basic discovery and go deeper on validation and risk analysis.',
        },
        {
          agent: '@idea-to-pdb',
          prompt: '@idea-to-pdb I want to build a collaborative document editor for small teams.\n\nI\'m not sure about the target market yet. Start with the kickoff questions to help me refine the idea.',
          context: 'When your idea is still rough, ask the agent to lead with kickoff questions. It will guide you through structured discovery.',
        },
      ],
      tips: [
        'Be honest about what you don\'t know — the agent\'s risk analysis is more useful when you flag uncertainties',
        'Review the Idea Summary carefully before moving to PDB generation — changes are much cheaper at this stage',
      ],
    },
  },
  {
    id: 'pipeline-3',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 3,
      title: 'Product Design Blueprint',
      description:
        'Generate a comprehensive Product Design Blueprint (PDB) from the approved idea summary. Covers functional requirements, technical architecture, data models, system flows, UX/UI specification, and optionally Figma prompts and task outlines.',
      agents: [{ name: 'idea-to-pdb', role: 'ideation' }],
      substeps: [
        'Functional Requirements Document (FRD)',
        'Technical Architecture Document (TAD)',
        'Data architecture & models',
        'System flows & API contracts',
        'UX/UI design specification',
      ],
      artifact: 'PDB Document',
      artifactPath: 'docs/product_design/',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/idea-to-pdb.md',
        'templates/research/RESEARCH_CONTEXT_TEMPLATE.md',
      ],
      handoff:
        'Completed PDB is saved to docs/product_design/ and referenced by downstream agents via spec_refs in task files.',
      examplePrompts: [
        {
          agent: '@idea-to-pdb',
          prompt: '@idea-to-pdb The idea exploration is complete and approved. Now generate the full Product Design Blueprint.\n\nUse the Deep-Dive depth — I want comprehensive FRD, TAD, data models, and UX specification.\n\nSave the output to docs/product_design/fittracker_pdb.md',
          context: 'Specifying "Deep-Dive depth" triggers the most comprehensive PDB variant with all sections. Always specify the output path so downstream agents can find it.',
        },
        {
          agent: '@idea-to-pdb',
          prompt: '@idea-to-pdb Generate a Lightweight PDB from the approved idea summary.\n\nThis is an MVP — focus on core FRD and TAD only. Skip detailed UX spec and AI architecture sections for now.',
          context: 'Use Lightweight depth for MVPs or prototypes. You can always upgrade to Deep-Dive later when the concept is validated.',
        },
      ],
      tips: [
        'Choose between Lightweight (MVP) and Deep-Dive (full product) based on your stage',
        'The PDB becomes the single source of truth — all downstream agents reference it via spec_refs',
        'Commit the PDB to version control so agents can always find it',
      ],
    },
  },
  {
    id: 'pipeline-4',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 4,
      title: 'Task Decomposition',
      description:
        'Decompose the PDB into epics, features, and actionable task files. Each task includes agent_roles, spec_refs back to PDB sections, acceptance criteria, and dependency ordering. Schema-first tasks block implementation.',
      agents: [{ name: 'pdb-to-tasks', role: 'ideation' }],
      substeps: [
        'Read & summarize PDB',
        'Propose epic list by phase',
        'Generate task outlines for approval',
        'Produce full YAML task files',
        'Update portfolio-level milestones',
      ],
      artifact: 'tasks/*.yml',
      artifactPath: 'tasks/',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/pdb-to-tasks.md',
        'templates/tasks/TASK_SCHEMA_GUIDE.md',
        'templates/tasks/feature-task-template.yml',
      ],
      handoff:
        'Task YAML files are written to tasks/. Each task has agent_roles and spec_refs, ready for agents to pick up.',
      examplePrompts: [
        {
          agent: '@pdb-to-tasks',
          prompt: '@pdb-to-tasks Read docs/product_design/fittracker_pdb.md and decompose it into epics and task files.\n\nOrganize by phase:\n- Phase 0: Schema & data models (must complete first)\n- Phase 1: Core features (auth, tracking, dashboard)\n- Phase 2: AI features (workout suggestions)\n- Phase 3: Polish (onboarding, notifications)\n\nEach task must have spec_refs back to the PDB section it implements.',
          context: 'Providing an explicit phase ordering ensures schema-first development. The agent maps each task back to PDB sections via spec_refs so implementation agents always have context.',
        },
      ],
      tips: [
        'Review the epic list before the agent generates full YAML — it\'s easier to restructure at the outline stage',
        'Schema-first tasks (data models, API contracts) should always be Phase 0',
        'Each task needs agent_roles to indicate which agents should work on it',
      ],
    },
  },
  {
    id: 'pipeline-5',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 5,
      title: 'Architecture Setup',
      description:
        'Establish the project foundation: define data schemas, set up API contracts, configure infrastructure, and complete all Phase 0 schema-first tasks before feature work begins.',
      agents: [
        { name: 'Implementation Agent', role: 'agent-role' },
        { name: 'orchestration-specialist', role: 'specialist' },
      ],
      substeps: [
        'Schema & data model definition',
        'API contract design',
        'Project scaffolding & directory structure',
        'Infrastructure & environment setup',
      ],
      artifact: 'Project Scaffolding',
      phase: 'build',
      templateFiles: [
        'templates/subagents/specialists/orchestration-specialist.md',
        'templates/workflow/MULTI_AGENT_WORKFLOW.md',
      ],
      handoff:
        'Scaffolding, schemas, and API contracts are committed. Feature implementation tasks are unblocked.',
      examplePrompts: [
        {
          agent: 'Implementation Agent',
          prompt: 'Implement task E00_T1_define_data_models from tasks/00_schema_setup.yml.\n\nRead the spec_refs for the data architecture section of the PDB. Define all database models, relationships, and migrations. Follow the patterns in .cursorrules.',
          context: 'Referencing the specific task ID and file ensures the agent reads the acceptance criteria and spec_refs. Mentioning .cursorrules reminds it to follow project conventions.',
        },
        {
          agent: '@orchestration-specialist',
          prompt: '@orchestration-specialist Review the TAD section of docs/product_design/fittracker_pdb.md and recommend the optimal project structure, state management approach, and API layer architecture for this stack.',
          context: 'The orchestration specialist helps with high-level architecture decisions before you start building features.',
        },
      ],
      tips: [
        'Complete all schema-first tasks before starting feature development',
        'Commit scaffolding early — it gives other agents a stable foundation to build on',
      ],
    },
  },
  {
    id: 'pipeline-6',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 6,
      title: 'Feature Development',
      description:
        'Implement features following the task files. The Implementation Agent picks high-priority tasks, reads spec_refs, writes production code following .cursorrules conventions, and adds handoff notes for QA.',
      agents: [
        { name: 'Implementation Agent', role: 'agent-role' },
        { name: 'react-specialist', role: 'specialist' },
        { name: 'flutter-specialist', role: 'specialist' },
        { name: 'debugger', role: 'generic' },
      ],
      substeps: [
        'Select high-priority task from tasks/*.yml',
        'Read spec_refs & acceptance criteria',
        'Implement feature code',
        'Handle edge cases & errors',
        'Add handoff notes for next agent',
      ],
      artifact: 'Production Code',
      phase: 'build',
      templateFiles: [
        'templates/subagents/specialists/react-specialist.md',
        'templates/subagents/specialists/flutter-specialist.md',
        'templates/subagents/generic/debugger.md',
      ],
      handoff:
        'Implementation complete with handoff notes. Task status updated to "in-review". Ready for testing and quality review.',
      examplePrompts: [
        {
          agent: 'Implementation Agent',
          prompt: 'Implement task E01_T3_user_dashboard from tasks/03_core_features.yml.\n\nSpec refs:\n- PDB Section 3.2: Dashboard Requirements\n- PDB Section 5.1: Dashboard Wireframes\n\nFollow .cursorrules for component patterns. When complete, update the task status to "in-review" and add handoff notes for QA.',
          context: 'Always reference the specific task ID, spec_refs, and explicitly ask for status updates and handoff notes. This creates an audit trail for QA.',
        },
        {
          agent: '@react-specialist',
          prompt: '@react-specialist Review my implementation of the dashboard component.\n\nCheck for: React best practices, proper hook usage, state management patterns per .cursorrules, accessibility, and performance.\n\nSuggest improvements before I hand off to QA.',
          context: 'Invoke framework-specific specialists for code that needs stack expertise. They catch framework anti-patterns the general Implementation Agent might miss.',
        },
        {
          agent: '@debugger',
          prompt: '@debugger The dashboard is throwing a hydration mismatch error in Next.js.\n\nError: "Text content does not match server-rendered HTML"\nFile: src/components/Dashboard.tsx line 47\n\nHelp me find the root cause and fix it.',
          context: 'Give the debugger the exact error message, file, and line number. The more specific the context, the faster it resolves the issue.',
        },
      ],
      tips: [
        'Work through tasks in priority order — don\'t skip ahead to fun features',
        'Always include handoff notes when marking a task complete',
        'Use framework specialists for stack-specific guidance',
      ],
    },
  },
  {
    id: 'pipeline-7',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 7,
      title: 'Testing & Evaluation',
      description:
        'Write tests that validate behavior, not implementation. Unit tests for business logic, integration tests for user flows, and LLM evaluation pipelines for AI features. Coverage targets from .cursorrules are verified.',
      agents: [
        { name: 'Testing Agent', role: 'agent-role' },
        { name: 'test-writer', role: 'generic' },
        { name: 'evaluation-specialist', role: 'specialist' },
      ],
      substeps: [
        'Unit tests for business logic',
        'Integration tests for user flows',
        'LLM evaluation (if applicable)',
        'Coverage analysis & gap identification',
      ],
      artifact: 'Test Suites',
      phase: 'verify',
      templateFiles: [
        'templates/subagents/generic/test-writer.md',
        'templates/subagents/specialists/evaluation-specialist.md',
      ],
      handoff:
        'Test suites committed, coverage report generated. Ready for quality review.',
      examplePrompts: [
        {
          agent: '@test-writer',
          prompt: '@test-writer Write tests for the user dashboard feature (task E01_T3).\n\nAcceptance criteria from the task file:\n- Dashboard loads user stats within 2 seconds\n- Charts render with real data from the API\n- Empty state shows onboarding prompt\n\nWrite unit tests for the business logic and integration tests for the user flows. Target the coverage threshold in .cursorrules.',
          context: 'Copy acceptance criteria from the task file into the prompt so the test-writer validates exactly what was specified. Referencing .cursorrules ensures coverage targets are met.',
        },
        {
          agent: '@evaluation-specialist',
          prompt: '@evaluation-specialist Set up an evaluation pipeline for the AI workout suggestion feature.\n\nEvaluate: relevance, safety, and personalization quality.\nReference: PDB Section 4.2 — AI Architecture.\n\nCreate baseline metrics we can track over time.',
          context: 'Use the evaluation specialist only for AI/LLM features. It creates structured eval pipelines with metrics, not just unit tests.',
        },
      ],
      tips: [
        'Test behavior, not implementation — tests should survive refactors',
        'Integration tests are more valuable than unit tests for most features',
        'Run the full test suite before handing off to QA',
      ],
    },
  },
  {
    id: 'pipeline-8',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 8,
      title: 'Quality Review',
      description:
        'Multi-perspective review covering code quality, security, performance, and design. Critical issues are sent back for development. The QA Agent coordinates code-reviewer, security-auditor, performance-optimizer, and designer.',
      agents: [
        { name: 'QA Agent', role: 'agent-role' },
        { name: 'code-reviewer', role: 'generic' },
        { name: 'security-auditor', role: 'generic' },
        { name: 'perf-optimizer', role: 'generic' },
        { name: 'designer', role: 'generic' },
      ],
      substeps: [
        'Code review (quality & patterns)',
        'Security audit & guardrails',
        'Performance optimization check',
        'Design & accessibility review',
        'Issue triage: fix vs. accept',
      ],
      artifact: 'Review Reports',
      phase: 'verify',
      templateFiles: [
        'templates/subagents/generic/code-reviewer.md',
        'templates/subagents/generic/security-auditor.md',
        'templates/subagents/generic/performance-optimizer.md',
        'templates/subagents/generic/designer.md',
      ],
      handoff:
        'If critical issues found: task sent back to Feature Development with feedback. If approved: proceed to Documentation.',
      examplePrompts: [
        {
          agent: '@code-reviewer',
          prompt: '@code-reviewer Review the dashboard implementation (src/components/Dashboard.tsx, src/hooks/useDashboard.ts, src/api/dashboard.ts).\n\nCheck against .cursorrules conventions. Flag any patterns that don\'t match the project standards.',
          context: 'List specific files for focused review. Mentioning .cursorrules tells the reviewer which standards to enforce.',
        },
        {
          agent: '@security-auditor',
          prompt: '@security-auditor Audit the authentication flow and API route handlers.\n\nFocus on: input validation, authorization checks, rate limiting, and secret management.\n\nReference PDB Section 4: Security Architecture for required guardrails.',
          context: 'Direct the security auditor to specific areas and reference the PDB security section. Generic "audit everything" prompts produce surface-level results.',
        },
        {
          agent: '@performance-optimizer',
          prompt: '@performance-optimizer Profile the dashboard page load. Currently takes ~3s, target is under 1s.\n\nAnalyze: bundle size, API waterfall, render performance, and image optimization.',
          context: 'Give concrete performance numbers (current vs. target) so the optimizer can prioritize the highest-impact fixes.',
        },
      ],
      tips: [
        'Run security audit on every feature that handles user data or authentication',
        'Critical issues go back to Stage 6 — don\'t ship with known security gaps',
        'Performance review is optional for internal tools but critical for user-facing features',
      ],
    },
  },
  {
    id: 'pipeline-9',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 9,
      title: 'Documentation',
      description:
        'Generate and maintain documentation at all levels: inline code docs, project-level markdown, API references, and architecture documentation. Keeps docs current with code.',
      agents: [
        { name: 'Documentation Agent', role: 'agent-role' },
        { name: 'doc-generator', role: 'generic' },
      ],
      substeps: [
        'Inline code documentation',
        'API reference generation',
        'Architecture docs update',
        'User guides & examples',
      ],
      artifact: 'docs/',
      artifactPath: 'docs/',
      phase: 'ship',
      templateFiles: ['templates/subagents/generic/doc-generator.md'],
      handoff:
        'Documentation committed to docs/. README updated. Architecture diagrams current. Ready for production readiness check.',
      examplePrompts: [
        {
          agent: '@doc-generator',
          prompt: '@doc-generator Generate API documentation for all endpoints in src/api/.\n\nInclude: endpoint URL, method, request/response schemas, authentication requirements, and example curl commands.\n\nReference PDB Section 3.4: API Contracts for the expected contract.',
          context: 'Specifying the output format (curl examples, schemas) produces documentation that developers can actually use, not just auto-generated stubs.',
        },
        {
          agent: '@doc-generator',
          prompt: '@doc-generator Update the architecture documentation in docs/architecture/ to reflect the current implementation.\n\nCompare against the TAD in the PDB and note any deviations. Add Mermaid diagrams for the system architecture and data flow.',
          context: 'Asking the agent to compare implementation against the PDB catches architectural drift early.',
        },
      ],
      tips: [
        'Generate docs after features are stable — documenting in-progress work creates maintenance burden',
        'Architecture docs should include Mermaid diagrams for visual clarity',
      ],
    },
  },
  {
    id: 'pipeline-10',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 10,
      title: 'Production Readiness',
      description:
        'Final production readiness assessment. Gap analysis identifies remaining issues across security, infrastructure, testing, and compliance. Observability is configured. A production checklist gates the release.',
      agents: [
        { name: 'gap-analysis', role: 'ingestion' },
        { name: 'observability-specialist', role: 'specialist' },
        { name: 'security-auditor', role: 'generic' },
      ],
      substeps: [
        'Gap analysis (9 categories)',
        'Production readiness checklist',
        'Monitoring & observability setup',
        'Deployment verification',
      ],
      artifact: 'Production System',
      artifactPath: 'docs/architecture/gap_analysis_report.md',
      phase: 'ship',
      templateFiles: [
        'templates/subagents/ingestion/gap-analysis.md',
        'templates/subagents/specialists/observability-specialist.md',
      ],
      handoff:
        'Gap analysis report generated. Production checklist complete. System is production-ready.',
      examplePrompts: [
        {
          agent: '@gap-analysis',
          prompt: '@gap-analysis Run a full 9-category production readiness assessment on this project.\n\nCategories: Security, Infrastructure, Testing, Documentation, Error Handling, Data Integrity, Performance, Compliance, Observability.\n\nPrioritize findings by severity (critical > high > medium > low).',
          context: 'Listing all 9 categories ensures comprehensive coverage. The severity prioritization helps you focus on blocking issues before nice-to-haves.',
        },
        {
          agent: '@observability-specialist',
          prompt: '@observability-specialist Set up monitoring and alerting for production.\n\nConfigure: health checks, error rate alerts, latency monitoring, and structured logging.\n\nReference the infrastructure section of the PDB for deployment targets.',
          context: 'The observability specialist handles the operational side — monitoring, alerting, and logging — that developers often skip.',
        },
      ],
      tips: [
        'Don\'t skip gap analysis — it catches issues that individual reviews miss',
        'Address all "critical" severity items before deploying',
        'Set up observability before you need it, not after an incident',
      ],
    },
  },
];
