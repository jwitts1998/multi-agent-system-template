import type { WorkflowNode } from './workflow-nodes';

const P = { x: 0, y: 0 };

export const contextWorkflowNodes: WorkflowNode[] = [
  {
    id: 'ctx-pipeline-1',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 1,
      title: 'Context Ingestion',
      description:
        'Receive a stakeholder-provided context chunk (PRD excerpt, meeting notes, feature spec, research findings) and extract structured elements. The context-to-pdb agent parses the raw input, classifies completeness, and produces a tagged Context Summary.',
      agents: [{ name: 'context-to-pdb', role: 'ideation' }],
      substeps: [
        'Receive context chunk (pasted text or file)',
        'Extract problem statement, users, features, constraints',
        'Tag each element with [STAKEHOLDER]',
        'Classify completeness (High / Medium / Low)',
        'Produce structured Context Summary',
      ],
      artifact: 'Context Summary',
      phase: 'ingest',
      templateFiles: [
        'templates/subagents/ideation/context-to-pdb.md',
        'templates/stakeholder/STAKEHOLDER_CONTEXT_TEMPLATE.md',
      ],
      handoff:
        'Context Summary is reviewed and confirmed by the user. Tagged elements are ready for gap analysis.',
      examplePrompts: [
        {
          agent: '@context-to-pdb',
          prompt: '@context-to-pdb Here\'s a feature spec from our product manager:\n\n"We need a dashboard for sales teams to track pipeline metrics. Must integrate with Salesforce. Key metrics: deal velocity, win rate, forecast accuracy. Target users are sales managers and VPs. Need a working demo in 2 weeks for the board meeting."\n\nUse this as the baseline context and build a PDB from it.',
          context: 'Providing the raw stakeholder context directly lets the agent skip discovery. It will extract structured elements, identify gaps, and build the PDB from this baseline.',
        },
        {
          agent: '@context-to-pdb',
          prompt: '@context-to-pdb I have a filled-in stakeholder context template at docs/stakeholder/product_context.md. Read it and start the context-to-PDB workflow.',
          context: 'When using the structured template, the agent gets pre-organized context with source metadata, constraints, and success criteria already separated.',
        },
      ],
      tips: [
        'Paste the stakeholder\'s exact words — the agent preserves and tags the original language for traceability',
        'You can use the STAKEHOLDER_CONTEXT_TEMPLATE.md to pre-structure the context, but it\'s optional',
        'Include any constraints or deadlines the stakeholder mentioned — these shape the MVP scope',
      ],
    },
  },
  {
    id: 'ctx-pipeline-2',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 2,
      title: 'Gap Analysis',
      description:
        'Evaluate the context chunk against PDB requirements and identify missing or ambiguous elements. Ask targeted follow-up questions (not generic kickoff questions). Fill gaps with labeled inferences where possible.',
      agents: [{ name: 'context-to-pdb', role: 'ideation' }],
      substeps: [
        'Evaluate context against PDB section requirements',
        'Flag gaps: Found / Partial / Missing per section',
        'Generate targeted follow-up questions (max 5-7)',
        'Fill remaining gaps with [INFERRED] or [ASSUMPTION] tags',
        'Present gap analysis table for user approval',
      ],
      artifact: 'Gap Analysis Report',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/context-to-pdb.md',
      ],
      handoff:
        'Gap analysis is approved. All PDB sections have either stakeholder data, validated inferences, or acknowledged assumptions. Ready for PDB generation.',
      examplePrompts: [
        {
          agent: '@context-to-pdb',
          prompt: 'The context mentions "sales teams" but doesn\'t specify team size or technical sophistication. For the personas section:\n- Are these teams of 5-10 or 50+?\n- Do they currently use BI tools or just spreadsheets?\n- Is the VP persona a daily user or a weekly report consumer?',
          context: 'Targeted questions that reference what the context already says and ask for the specific delta are much more productive than generic discovery.',
        },
      ],
      tips: [
        'The agent asks targeted questions referencing the context — not generic kickoff questions',
        'Approve or correct [INFERRED] and [ASSUMPTION] tags before PDB generation',
        'If the context is too vague for a section, it\'s better to mark it [ASSUMPTION] than to pad with generic content',
      ],
    },
  },
  {
    id: 'ctx-pipeline-3',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 3,
      title: 'PDB Generation',
      description:
        'Generate a Product Design Blueprint from the validated context. Uses the same PDB structure as idea-to-pdb but defaults to Lightweight depth and preserves traceability tags ([STAKEHOLDER], [INFERRED], [ASSUMPTION]) throughout. Includes a Demo Specification section.',
      agents: [{ name: 'context-to-pdb', role: 'ideation' }],
      substeps: [
        'Generate FRD with tagged features',
        'Generate TAD based on technical signals',
        'Define data architecture and key entities',
        'Create user flows for core demo path',
        'Write Demo Specification (wow moment, known limitations)',
        'Build Traceability Matrix',
      ],
      artifact: 'PDB Document',
      artifactPath: 'docs/product_design/',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/context-to-pdb.md',
      ],
      handoff:
        'PDB is saved to docs/product_design/ with full traceability. Ready for task decomposition.',
      examplePrompts: [
        {
          agent: '@context-to-pdb',
          prompt: '@context-to-pdb Gap analysis is approved. Generate the PDB.\n\nUse Lightweight depth — this is a 2-week demo. Focus on the core sales pipeline dashboard flow.\n\nSave to docs/product_design/sales_dashboard_pdb.md',
          context: 'Specifying Lightweight depth and the demo timeline keeps the PDB focused on what matters for the MVP.',
        },
      ],
      tips: [
        'Default is Lightweight depth — request Deep-Dive only if you need production-grade specifications',
        'The Demo Specification section (unique to context-to-pdb) defines what the demo must show',
        'Review the Traceability Matrix to verify nothing was lost from the original context',
      ],
    },
  },
  {
    id: 'ctx-pipeline-4',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 4,
      title: 'Task Decomposition',
      description:
        'Decompose the PDB into a fast-track task plan optimized for speed to demo. Three phases: Foundation (schema, scaffolding), Core Demo Flow (minimum viable path), and Polish (UI refinement, demo data).',
      agents: [{ name: 'pdb-to-tasks', role: 'ideation' }],
      substeps: [
        'Read PDB and extract demo-critical features',
        'Propose Phase 0: Foundation tasks',
        'Propose Phase 1: Core Demo Flow tasks',
        'Propose Phase 2: Polish tasks',
        'Generate YAML task files with spec_refs',
      ],
      artifact: 'tasks/*.yml',
      artifactPath: 'tasks/',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/pdb-to-tasks.md',
        'templates/tasks/TASK_SCHEMA_GUIDE.md',
      ],
      handoff:
        'Task files written to tasks/. Focused on MVP/demo scope. Ready for architecture setup.',
      examplePrompts: [
        {
          agent: '@pdb-to-tasks',
          prompt: '@pdb-to-tasks Read docs/product_design/sales_dashboard_pdb.md and create a fast-track task plan.\n\nPhase 0: Schema & Salesforce integration setup\nPhase 1: Core dashboard with pipeline metrics (the demo path)\nPhase 2: Polish — charts, filters, responsive layout\n\nOptimize for speed to demo, not production completeness.',
          context: 'Framing tasks around demo phases keeps the team focused on demonstrable value rather than exhaustive feature coverage.',
        },
      ],
      tips: [
        'Keep Phase 1 laser-focused on the demo path from the PDB\'s Demo Specification',
        'Phase 0 should be minimal — only schema and scaffolding needed for the demo flow',
        'Phase 2 polish tasks are optional if time runs short',
      ],
    },
  },
  {
    id: 'ctx-pipeline-5',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 5,
      title: 'Domain Calibration',
      description:
        'Configure the domain micro-agent system for the product\'s business vertical. The calibrator reads the PDB and domain signals extracted during context ingestion, identifies core vs. supporting domains, and generates a domain-config.yml for task generation.',
      agents: [
        { name: 'vertical-calibrator', role: 'ideation' },
        { name: 'product-orchestrator', role: 'system' },
      ],
      substeps: [
        'Read PDB to extract vertical, value prop, and domain signals',
        'Present 15 domains — classify as core / supporting / not-applicable',
        'Calibrate AI applications per domain (critical / useful / skip)',
        'Set implementation priorities and identify AI differentiator',
        'Generate docs/architecture/domain-config.yml',
      ],
      artifact: 'domain-config.yml',
      artifactPath: 'docs/architecture/domain-config.yml',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/vertical-calibrator.md',
        'templates/subagents/system/product-orchestrator.md',
      ],
      handoff:
        'Domain configuration is saved. Task generation uses this to auto-populate domain_agents.',
      examplePrompts: [
        {
          agent: '@vertical-calibrator',
          prompt: '@vertical-calibrator Configure domain agents for this product. The PDB is at docs/product_design/app_pdb.md.',
          context: 'The calibrator reads the PDB to pre-fill domain suggestions based on extracted context signals.',
        },
      ],
      tips: [
        'Run after PDB generation but before task creation for best results',
        'Domain signals from context ingestion pre-fill the calibrator suggestions',
      ],
    },
  },
  {
    id: 'ctx-pipeline-6',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 6,
      title: 'Architecture Setup',
      description:
        'Establish the project foundation: schemas, scaffolding, API contracts, and infrastructure. Complete all Phase 0 tasks before feature development begins.',
      agents: [
        { name: 'Implementation Agent', role: 'agent-role' },
        { name: 'orchestration-specialist', role: 'specialist' },
      ],
      substeps: [
        'Schema & data model definition',
        'Project scaffolding & directory structure',
        'API contract stubs',
        'Third-party integration setup (if any)',
      ],
      artifact: 'Project Scaffolding',
      phase: 'build',
      templateFiles: [
        'templates/subagents/specialists/orchestration-specialist.md',
      ],
      handoff:
        'Scaffolding committed. Schemas defined. Integration stubs in place. Feature development tasks are unblocked.',
      examplePrompts: [
        {
          agent: 'Implementation Agent',
          prompt: 'Implement Phase 0 tasks from tasks/00_foundation.yml.\n\nStart with the data models, then set up the Salesforce API client. Follow .cursorrules for project conventions.',
          context: 'Phase 0 tasks are ordered by dependency — data models first, then API integrations that depend on them.',
        },
      ],
      tips: [
        'Keep scaffolding minimal — only what the demo flow needs',
        'If using third-party APIs, set up mock/stub responses for demo reliability',
      ],
    },
  },
  {
    id: 'ctx-pipeline-7',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 7,
      title: 'Feature Development',
      description:
        'Implement features following the task files, prioritizing the core demo flow. The Implementation Agent picks tasks in phase order, reads spec_refs, and builds the minimum viable path through the product.',
      agents: [
        { name: 'Implementation Agent', role: 'agent-role' },
        { name: 'debugger', role: 'generic' },
      ],
      substeps: [
        'Implement Phase 1 core demo flow tasks',
        'Build the primary user-facing screens',
        'Connect to data sources / APIs',
        'Handle critical-path error cases',
        'Add handoff notes for testing',
      ],
      artifact: 'Working Demo Code',
      phase: 'build',
      templateFiles: [
        'templates/subagents/generic/debugger.md',
      ],
      handoff:
        'Core demo flow is functional end-to-end. Ready for testing.',
      examplePrompts: [
        {
          agent: 'Implementation Agent',
          prompt: 'Implement the core dashboard page (task E01_T2_pipeline_dashboard).\n\nThis is the centerpiece of the demo. Spec refs point to PDB Section 3.2 and the Demo Specification.\n\nFocus on making this look impressive — it\'s the "wow moment" for the stakeholder.',
          context: 'For demo-driven development, prioritize visual impact and the core flow over edge case handling.',
        },
      ],
      tips: [
        'Build the demo path first — polish and edge cases come in Phase 2',
        'Use hardcoded or seed data if real integrations aren\'t ready yet',
        'Focus on the "wow moment" identified in the PDB Demo Specification',
      ],
    },
  },
  {
    id: 'ctx-pipeline-8',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 8,
      title: 'Testing',
      description:
        'Write tests that validate the core demo flow works end-to-end. Focus on the happy path and critical error scenarios — exhaustive coverage comes later.',
      agents: [
        { name: 'Testing Agent', role: 'agent-role' },
        { name: 'test-writer', role: 'generic' },
      ],
      substeps: [
        'Integration tests for the core demo flow',
        'Unit tests for critical business logic',
        'Smoke tests for key screens',
        'Verify demo data / seed data loads correctly',
      ],
      artifact: 'Test Suites',
      phase: 'verify',
      templateFiles: [
        'templates/subagents/generic/test-writer.md',
      ],
      handoff:
        'Core flow tests pass. Demo path is verified. Ready for quality review.',
      examplePrompts: [
        {
          agent: '@test-writer',
          prompt: '@test-writer Write integration tests for the demo flow:\n1. User logs in\n2. Dashboard loads with pipeline metrics\n3. User filters by date range\n4. Charts update with filtered data\n\nFocus on the happy path. Add one error scenario (API timeout).',
          context: 'For MVP demos, integration tests on the happy path provide more confidence than exhaustive unit tests.',
        },
      ],
      tips: [
        'Prioritize integration tests over unit tests for the demo path',
        'Make sure seed/demo data is part of the test setup',
        'A green test suite gives confidence for the stakeholder demo',
      ],
    },
  },
  {
    id: 'ctx-pipeline-9',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 9,
      title: 'Quality Review',
      description:
        'Focused review covering demo readiness: does the core flow work, does it look good, are there any embarrassing bugs? Lighter than production QA — focused on stakeholder impression.',
      agents: [
        { name: 'QA Agent', role: 'agent-role' },
        { name: 'code-reviewer', role: 'generic' },
        { name: 'designer', role: 'generic' },
      ],
      substeps: [
        'Walk through the demo flow end-to-end',
        'Check for visual polish and UI consistency',
        'Verify no crashes or unhandled errors in the demo path',
        'Review against stakeholder success criteria',
        'Flag issues: fix-before-demo vs. accept-for-now',
      ],
      artifact: 'Review Report',
      phase: 'verify',
      templateFiles: [
        'templates/subagents/generic/code-reviewer.md',
        'templates/subagents/generic/designer.md',
      ],
      handoff:
        'If critical issues found: route back to Feature Development. If demo-ready: proceed to Demo Package.',
      examplePrompts: [
        {
          agent: '@code-reviewer',
          prompt: '@code-reviewer Review the demo flow implementation.\n\nFocus on: crashes, data display errors, and anything that would embarrass us in front of the stakeholder.\n\nDon\'t flag code quality issues that don\'t affect the demo — we\'ll clean up after.',
          context: 'Demo reviews prioritize reliability and appearance over code quality. Technical debt is acceptable at this stage.',
        },
        {
          agent: '@designer',
          prompt: '@designer Review the dashboard UI for demo readiness.\n\nCheck: visual consistency, readable typography, responsive layout, loading states.\n\nThis needs to look professional, not perfect.',
          context: 'The design review for demos focuses on "does it look credible" rather than pixel-perfect adherence to a design system.',
        },
      ],
      tips: [
        'Walk through the exact demo script you\'ll show the stakeholder',
        'Test with realistic data — empty states and edge cases will appear in demos',
        'Fix only issues that affect the demo impression — save the rest for post-demo',
      ],
    },
  },
  {
    id: 'ctx-pipeline-10',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 10,
      title: 'Demo Package',
      description:
        'Prepare the final demo artifact: seed data loaded, demo script written, environment configured, known limitations documented. The output is a stakeholder-ready demonstration.',
      agents: [
        { name: 'Implementation Agent', role: 'agent-role' },
        { name: 'Documentation Agent', role: 'agent-role' },
      ],
      substeps: [
        'Load seed/sample data for the demo',
        'Write a demo script (what to show, in what order)',
        'Configure demo environment (local or deployed)',
        'Document known limitations and workarounds',
        'Run through the demo script once end-to-end',
        'Verify against Demo Specification from PDB',
      ],
      artifact: 'Demo Package',
      artifactPath: 'docs/demo/',
      phase: 'ship',
      templateFiles: [
        'templates/subagents/generic/doc-generator.md',
      ],
      handoff:
        'Demo is packaged and ready to present. Demo script, seed data, and limitation notes are documented. Ready for stakeholder review.',
      examplePrompts: [
        {
          agent: 'Documentation Agent',
          prompt: 'Create a demo script at docs/demo/demo_script.md.\n\nInclude:\n1. Setup instructions (how to start the demo)\n2. Walkthrough steps with expected results\n3. Talking points for each screen\n4. Known limitations to avoid or acknowledge\n5. Backup plan if something breaks during the demo',
          context: 'A written demo script ensures the presentation is smooth and all stakeholder success criteria are addressed in the walkthrough.',
        },
      ],
      tips: [
        'Practice the demo at least once — live demos always surface unexpected issues',
        'Have seed data that tells a compelling story (not just "test_user_1")',
        'Document the known limitations so you can address them proactively if asked',
        'If deploying, use a stable environment — don\'t demo from localhost if avoidable',
      ],
    },
  },
  {
    id: 'ctx-pipeline-11',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 11,
      title: 'Stakeholder Review',
      description:
        'Present the demo to the stakeholder. Capture feedback, new requirements, and scope changes. Route feedback back to Gap Analysis for iteration or mark the MVP as accepted.',
      agents: [
        { name: 'context-to-pdb', role: 'ideation' },
        { name: 'Documentation Agent', role: 'agent-role' },
      ],
      substeps: [
        'Present demo using the demo script',
        'Capture stakeholder feedback and reactions',
        'Classify feedback: bug / enhancement / new requirement / scope change',
        'Update PDB with new context (tagged [STAKEHOLDER])',
        'Decide: iterate (back to Gap Analysis) or accept MVP',
      ],
      artifact: 'Feedback Report',
      phase: 'operate',
      templateFiles: [
        'templates/subagents/ideation/context-to-pdb.md',
        'templates/stakeholder/STAKEHOLDER_CONTEXT_TEMPLATE.md',
      ],
      handoff:
        'If stakeholder accepts: MVP is complete. If feedback requires iteration: new context chunk feeds back to Gap Analysis (Stage 2) for the next cycle.',
      examplePrompts: [
        {
          agent: '@context-to-pdb',
          prompt: '@context-to-pdb The stakeholder reviewed the demo and provided feedback:\n\n"Love the pipeline view but need to add a forecast accuracy trend line. Also, the date filter should default to current quarter, not last 30 days. Can we add an export to PDF feature for board reports?"\n\nTreat this as a new context chunk. Update the PDB and create tasks for the next iteration.',
          context: 'Stakeholder feedback is just another context chunk. The same agent ingests it, gaps-analyzes it, and updates the PDB — creating a natural iteration loop.',
        },
      ],
      tips: [
        'Capture feedback verbatim — exact stakeholder words are more useful than paraphrased interpretations',
        'Classify each piece of feedback before acting on it — not everything needs to go into the next sprint',
        'Scope changes should go back through Gap Analysis, not directly into code',
        'If the stakeholder is happy, explicitly confirm "MVP accepted" and document it',
      ],
    },
  },
];
