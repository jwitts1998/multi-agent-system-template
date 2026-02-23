import type { WorkflowNode } from './workflow-nodes';

const P = { x: 0, y: 0 };

export const existingRepoNodes: WorkflowNode[] = [
  {
    id: 'existing-1',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 1,
      title: 'Install & Configure',
      description:
        'Copy template files into your existing project. Unlike the net-new workflow (clone-and-become), for existing projects you keep the template as a separate reference library and copy files in. Configure template variables to match your project.',
      agents: [],
      substeps: [
        'Clone the template to a central location',
        'Copy .cursorrules, AGENTS.md, and subagents into your project',
        'Copy task schema and workflow docs',
        'Replace {{VARIABLES}} with your project values',
        'Run validate.sh to check for remaining placeholders',
      ],
      artifact: 'Configured Project',
      artifactPath: './',
      phase: 'setup',
      templateFiles: [
        'templates/cursorrules/',
        'templates/agents/',
        'templates/subagents/',
        'validate.sh',
      ],
      handoff:
        'Project has .cursorrules, AGENTS.md, subagents, and task schema installed. Ready for codebase ingestion.',
      commands: [
        'git clone https://github.com/jwitts1998/multi-agent-system-template.git ~/dev/multi-agent-system-template',
        'export TEMPLATE_DIR=~/dev/multi-agent-system-template',
        'cd ~/dev/your-project',
        'cp $TEMPLATE_DIR/templates/cursorrules/full-stack.cursorrules .cursorrules',
        'cp $TEMPLATE_DIR/templates/agents/AGENTS-full-stack.md AGENTS.md',
        'mkdir -p tasks docs/product_design .cursor/agents/generic .cursor/agents/ingestion',
        'cp $TEMPLATE_DIR/templates/subagents/generic/*.md .cursor/agents/generic/',
        'cp $TEMPLATE_DIR/templates/subagents/ingestion/*.md .cursor/agents/ingestion/',
        'cp $TEMPLATE_DIR/templates/subagents/ideation/*.md .cursor/agents/ideation/',
        'sed -i \'\' "s/{{PROJECT_NAME}}/YourProject/g" .cursorrules AGENTS.md',
      ],
      tips: [
        'Choose the .cursorrules and AGENTS.md template that matches your project type (web-app, mobile-app, backend-service, full-stack)',
        'You can copy validate.sh from the template to check for remaining {{VARIABLES}}',
        'Add $TEMPLATE_DIR to your shell profile so you can reference it later',
      ],
    },
  },
  {
    id: 'existing-2',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 2,
      title: 'Codebase Audit',
      description:
        'Run the codebase auditor agent to build a comprehensive knowledge graph of your existing code. It maps all modules, data models, API routes, dependencies, architecture patterns, and inter-module relationships.',
      agents: [{ name: 'codebase-auditor', role: 'ingestion' }],
      substeps: [
        'Scan all source files and directories',
        'Map module dependencies and relationships',
        'Document data models and database schema',
        'Catalog API routes and endpoints',
        'Identify architecture patterns in use',
      ],
      artifact: 'Knowledge Graph',
      artifactPath: 'docs/architecture/codebase_knowledge_graph.md',
      phase: 'ingest',
      templateFiles: [
        'templates/subagents/ingestion/codebase-auditor.md',
      ],
      handoff:
        'Knowledge graph saved to docs/architecture/. Provides the foundation for gap analysis and PDB generation.',
      examplePrompts: [
        {
          agent: '@codebase-auditor',
          prompt: '@codebase-auditor Perform a comprehensive codebase audit of this project.\n\nStack: Next.js + TypeScript, Prisma + PostgreSQL, Stripe integration\n\nBuild a knowledge graph covering: all modules, data models, API routes, third-party integrations, dependencies, and architecture patterns.\n\nSave to docs/architecture/codebase_knowledge_graph.md',
          context: 'Telling the auditor your stack upfront helps it interpret framework-specific patterns correctly (e.g., Next.js App Router vs Pages Router).',
        },
      ],
      tips: [
        'The more accurately you describe your stack, the better the audit quality',
        'This step can take a while on large codebases — let the agent work through it',
        'Review the knowledge graph for accuracy before proceeding to gap analysis',
      ],
    },
  },
  {
    id: 'existing-3',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 3,
      title: 'Gap Analysis',
      description:
        'Analyze the codebase knowledge graph to identify gaps across 9 categories: security, infrastructure, testing, documentation, error handling, data integrity, performance, compliance, and observability. Gaps are prioritized by severity.',
      agents: [{ name: 'gap-analysis', role: 'ingestion' }],
      substeps: [
        'Read codebase knowledge graph',
        'Analyze across 9 gap categories',
        'Identify security vulnerabilities',
        'Assess test coverage gaps',
        'Prioritize by severity (critical/high/medium/low)',
      ],
      artifact: 'Gap Analysis Report',
      artifactPath: 'docs/architecture/gap_analysis_report.md',
      phase: 'ingest',
      templateFiles: [
        'templates/subagents/ingestion/gap-analysis.md',
      ],
      handoff:
        'Gap analysis report saved. Critical gaps become Phase 0 tasks. Report feeds into PDB generation for accurate documentation.',
      examplePrompts: [
        {
          agent: '@gap-analysis',
          prompt: '@gap-analysis Analyze the codebase knowledge graph at docs/architecture/codebase_knowledge_graph.md.\n\nIdentify gaps across all 9 categories. Prioritize by severity.\n\nPay special attention to security vulnerabilities and missing test coverage — these are blocking for production.',
          context: 'Referencing the knowledge graph path ensures the agent reads the audit output. Calling out priority areas (security, testing) focuses the analysis.',
        },
      ],
      tips: [
        'Critical severity items should become Phase 0 tasks — fix these before building new features',
        'The gap report drives your initial task priorities when you reach task decomposition',
        'Don\'t be alarmed by a long gap list — most existing projects have significant gaps when first audited',
      ],
    },
  },
  {
    id: 'existing-4',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 4,
      title: 'PDB Generation',
      description:
        'Generate a Product Design Blueprint (PDB) and Technical Architecture Document (TAD) from the codebase knowledge graph and gap analysis. Since you have code but no formal design docs, this reverse-engineers the PDB from what exists. Inferences are tagged with confidence levels.',
      agents: [{ name: 'documentation-backfill', role: 'ingestion' }],
      substeps: [
        'Read knowledge graph and gap analysis',
        'Generate Product Design Blueprint',
        'Generate Technical Architecture Document',
        'Tag inferences with confidence levels',
        'Add validation checklists for uncertain sections',
      ],
      artifact: 'Generated PDB + TAD',
      artifactPath: 'docs/product_design/generated_pdb.md',
      phase: 'ingest',
      templateFiles: [
        'templates/subagents/ingestion/documentation-backfill.md',
      ],
      handoff:
        'Generated PDB and TAD saved to docs/. Contains [INFERRED] and [ASSUMPTION] tags that need human validation in the next stage.',
      examplePrompts: [
        {
          agent: '@documentation-backfill',
          prompt: '@documentation-backfill Generate a Product Design Blueprint (PDB) and Technical Architecture Document (TAD) from:\n- docs/architecture/codebase_knowledge_graph.md\n- docs/architecture/gap_analysis_report.md\n\nMark all inferences with confidence levels ([HIGH], [MEDIUM], [LOW]).\nAdd [ASSUMPTION] tags where business context is missing.\nInclude validation checklists for each section.',
          context: 'Asking for confidence tags and validation checklists ensures you know which parts of the generated PDB need human review vs. which are reliably derived from code.',
        },
      ],
      tips: [
        'The generated PDB will have gaps in business context — the code shows "what" but not always "why"',
        'Don\'t skip the validation step — [ASSUMPTION] tags need human correction',
        'The TAD is usually more accurate than the FRD since it\'s derived directly from code structure',
      ],
    },
  },
  {
    id: 'existing-5',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 5,
      title: 'Validate PDB',
      description:
        'Review the generated PDB for accuracy. Correct wrong inferences, add missing business context, validate data models against actual database schema, and verify API contracts match real endpoints. Rename from generated_pdb.md to your project PDB.',
      agents: [],
      substeps: [
        'Review product overview accuracy',
        'Verify all major features documented',
        'Validate data models match actual schema',
        'Verify API contracts match endpoints',
        'Add business context (the "why")',
        'Correct wrong inferences',
      ],
      artifact: 'Validated PDB',
      artifactPath: 'docs/product_design/',
      phase: 'ingest',
      templateFiles: [],
      handoff:
        'Validated PDB is the source of truth for downstream agents. Rename and commit before proceeding to task decomposition.',
      commands: [
        'mv docs/product_design/generated_pdb.md docs/product_design/yourproject_pdb.md',
      ],
      tips: [
        'This is a manual step — you are the domain expert, not the agent',
        'Focus on [ASSUMPTION] and [LOW] confidence sections first',
        'Add the business context that code can\'t express: why decisions were made, what trade-offs were chosen',
        'The validated PDB becomes the source of truth — invest time here',
      ],
    },
  },
  {
    id: 'existing-6',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 6,
      title: 'Task Decomposition',
      description:
        'Decompose the validated PDB into phased tasks. For existing projects, Phase 0 addresses critical gaps from the gap analysis, Phase 1 improves existing features, and Phase 2+ adds new features. The gap report drives initial priorities.',
      agents: [{ name: 'pdb-to-tasks', role: 'ideation' }],
      substeps: [
        'Read validated PDB and gap analysis report',
        'Create Phase 0 tasks for critical gaps',
        'Create Phase 1 tasks for existing feature improvements',
        'Create Phase 2+ tasks for new features',
        'Set spec_refs and agent_roles on every task',
      ],
      artifact: 'tasks/*.yml',
      artifactPath: 'tasks/',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/pdb-to-tasks.md',
        'templates/tasks/TASK_SCHEMA_GUIDE.md',
      ],
      handoff:
        'Task files written to tasks/. Phase 0 gap-fix tasks are highest priority. Ready for development.',
      examplePrompts: [
        {
          agent: '@pdb-to-tasks',
          prompt: '@pdb-to-tasks Read the validated PDB at docs/product_design/shopfront_pdb.md and decompose it into epics and task files.\n\nAlso read docs/architecture/gap_analysis_report.md for critical gaps.\n\nPhase ordering:\n- Phase 0: Critical gap fixes (security, missing auth, rate limiting)\n- Phase 1: Existing feature improvements from PDB\n- Phase 2: New features from PDB\n\nEach task must have spec_refs back to PDB sections AND gap report items.',
          context: 'For existing projects, always reference BOTH the PDB and gap analysis. Phase 0 gap fixes ensure you address security and stability issues before building new features.',
        },
      ],
      tips: [
        'Phase 0 tasks from the gap analysis should always come first — they fix existing risks',
        'Existing feature improvements (Phase 1) often unblock new features (Phase 2)',
        'Each task\'s spec_refs should point to both PDB sections and gap report items when applicable',
      ],
    },
  },
  {
    id: 'existing-7',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 7,
      title: 'Gap Fix Development',
      description:
        'Address Phase 0 critical gaps identified in the gap analysis. These are typically security fixes, missing error handling, test coverage gaps, and infrastructure issues. Fix these before building new features.',
      agents: [
        { name: 'Implementation Agent', role: 'agent-role' },
        { name: 'security-auditor', role: 'generic' },
      ],
      substeps: [
        'Work through Phase 0 tasks by priority',
        'Fix security vulnerabilities first',
        'Add missing error handling and validation',
        'Improve test coverage to target threshold',
        'Have security-auditor verify each fix',
      ],
      artifact: 'Hardened Codebase',
      phase: 'build',
      templateFiles: [
        'templates/subagents/generic/security-auditor.md',
        'templates/subagents/generic/code-reviewer.md',
      ],
      handoff:
        'All critical and high-severity gaps addressed. Codebase is hardened. Safe to proceed with new feature development.',
      examplePrompts: [
        {
          agent: 'Implementation Agent',
          prompt: 'Implement task E00_T1_fix_hardcoded_secrets from tasks/00_phase0_gap_fixes.yml.\n\nSpec refs:\n- Gap: docs/architecture/gap_analysis_report.md — Critical Issues\n- PDB: docs/product_design/shopfront_pdb.md — Section 4: Security\n\nMove all hardcoded API keys to environment variables. Create .env.example with all required variables.',
          context: 'For gap-fix tasks, always reference both the gap report item and the PDB security section. This gives the agent full context on the issue and the expected security architecture.',
        },
        {
          agent: '@security-auditor',
          prompt: '@security-auditor Verify the hardcoded secrets fix in the latest commit.\n\nConfirm:\n- No secrets remain in source code (grep for common patterns)\n- .env.example exists with all required variables\n- .gitignore includes .env files\n- No secrets in git history (check recent commits)',
          context: 'Always have the security auditor verify security-related fixes. Provide specific verification criteria so it doesn\'t just rubber-stamp the change.',
        },
      ],
      tips: [
        'Fix critical severity items first — they represent active security risks',
        'Always pair security fixes with security-auditor verification',
        'Don\'t skip test coverage gaps — they compound as you add new features',
      ],
    },
  },
  {
    id: 'existing-8',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 8,
      title: 'Feature Development',
      description:
        'With gaps fixed, proceed to Phase 1 (existing feature improvements) and Phase 2+ (new features). This follows the same pattern as the net-new workflow: pick tasks, implement, test, review.',
      agents: [
        { name: 'Implementation Agent', role: 'agent-role' },
        { name: 'test-writer', role: 'generic' },
        { name: 'code-reviewer', role: 'generic' },
      ],
      substeps: [
        'Pick task from tasks/*.yml by priority',
        'Read spec_refs and acceptance criteria',
        'Implement following .cursorrules patterns',
        'Write tests for the feature',
        'Submit for code review',
      ],
      artifact: 'Production Code + Tests',
      phase: 'build',
      templateFiles: [
        'templates/subagents/generic/test-writer.md',
        'templates/subagents/generic/code-reviewer.md',
      ],
      handoff:
        'Features implemented, tested, and reviewed. Ready for documentation and production readiness assessment.',
      examplePrompts: [
        {
          agent: 'Implementation Agent',
          prompt: 'Implement task E01_T3_improve_checkout from tasks/04_checkout_flow.yml.\n\nSpec refs:\n- PDB Section 3.5: Checkout Flow Requirements\n- PDB Section 5.3: Checkout Wireframes\n\nFollow .cursorrules patterns. Ensure all acceptance criteria are met. Add handoff notes for QA when complete.',
          context: 'Same invocation pattern as net-new development. Reference the task ID, spec_refs, and .cursorrules. Always request handoff notes.',
        },
        {
          agent: '@test-writer',
          prompt: '@test-writer Write tests for the improved checkout flow.\n\nAcceptance criteria from tasks/04_checkout_flow.yml:\n- Payment processes within 3 seconds\n- Error states show user-friendly messages\n- Cart persists across sessions\n\nWrite integration tests for the full checkout user flow.',
          context: 'Copy acceptance criteria directly from the task file. Integration tests validate the full user flow, not just individual functions.',
        },
      ],
      tips: [
        'Existing feature improvements (Phase 1) often reveal additional gaps — add them as tasks',
        'Follow the same implement → test → review cycle as net-new development',
        'Keep the PDB updated as you discover things the generated version missed',
      ],
    },
  },
  {
    id: 'existing-9',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 9,
      title: 'Quality & Ship',
      description:
        'Final quality gate and production readiness assessment. Run documentation generation, security audit, performance review, and comprehensive gap analysis. Ensure all critical items are resolved before shipping.',
      agents: [
        { name: 'QA Agent', role: 'agent-role' },
        { name: 'doc-generator', role: 'generic' },
        { name: 'gap-analysis', role: 'ingestion' },
        { name: 'security-auditor', role: 'generic' },
      ],
      substeps: [
        'Generate/update documentation',
        'Final security audit',
        'Production gap analysis (re-run)',
        'Verify all critical gaps resolved',
        'Commit and deploy',
      ],
      artifact: 'Production-Ready System',
      artifactPath: 'docs/architecture/gap_analysis_report.md',
      phase: 'ship',
      templateFiles: [
        'templates/subagents/generic/doc-generator.md',
        'templates/subagents/ingestion/gap-analysis.md',
        'templates/subagents/generic/security-auditor.md',
      ],
      handoff:
        'System is production-ready with documentation, security clearance, and all critical gaps resolved.',
      examplePrompts: [
        {
          agent: '@gap-analysis',
          prompt: '@gap-analysis Re-run the full 9-category production readiness assessment.\n\nCompare against the original gap report at docs/architecture/gap_analysis_report.md.\n\nHighlight: which gaps were resolved, which remain, and any new gaps introduced during development.',
          context: 'Re-running gap analysis after development lets you compare before/after. This proves your gap-fix work was effective and catches any new issues.',
        },
        {
          agent: '@doc-generator',
          prompt: '@doc-generator Generate comprehensive documentation for all changes made during this development cycle.\n\nUpdate: README, API docs, architecture docs.\nCompare implementation against PDB and note any deviations.',
          context: 'Documentation should reflect what was actually built, which may differ from the PDB. Noting deviations keeps the PDB honest.',
        },
      ],
      tips: [
        'Re-run gap analysis to verify critical items are actually resolved',
        'Update the PDB to reflect what was built — it\'s a living document',
        'The multi-agent workflow continues for ongoing development — repeat stages 8-9 for each new feature cycle',
      ],
    },
  },
];
