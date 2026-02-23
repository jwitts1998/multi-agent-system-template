import type { Node } from '@xyflow/react';

export interface PipelineAgent {
  name: string;
  role: string;
}

export interface PipelineNodeData {
  stageNumber: number;
  title: string;
  description: string;
  agents: PipelineAgent[];
  substeps: string[];
  artifact: string;
  artifactPath?: string;
  phase: 'ideate' | 'build' | 'verify' | 'ship';
  templateFiles: string[];
  handoff: string;
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
      title: 'Ideation',
      description:
        'Transform a raw product idea into a structured summary. The idea-to-pdb agent asks kickoff questions, explores the problem space, identifies target users, surfaces risks, and produces a concise idea summary ready for detailed product design.',
      agents: [{ name: 'idea-to-pdb', role: 'ideation' }],
      substeps: [
        'Kickoff questions',
        'Problem definition',
        'Target users & personas',
        'Value proposition',
        'Risk surface analysis',
      ],
      artifact: 'Idea Summary',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/idea-to-pdb.md',
        'docs/IDEA_TO_PDB.md',
      ],
      handoff:
        'Idea Summary document is reviewed and approved, then fed into Phase 2 of the same agent for full PDB generation.',
    },
  },
  {
    id: 'pipeline-2',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 2,
      title: 'Product Design',
      description:
        'Generate a comprehensive Product Design Blueprint (PDB) from the approved idea summary. Covers functional requirements, technical architecture, data models, system flows, UX/UI specification, and optionally Figma prompts and task outlines.',
      agents: [{ name: 'idea-to-pdb', role: 'ideation' }],
      substeps: [
        'Functional Requirements (FRD)',
        'Technical Architecture (TAD)',
        'Data architecture & models',
        'AI architecture (if applicable)',
        'UX/UI design specification',
      ],
      artifact: 'PDB Document',
      artifactPath: 'docs/product_design/{{PROJECT_NAME}}_pdb.md',
      phase: 'ideate',
      templateFiles: [
        'templates/subagents/ideation/idea-to-pdb.md',
        'templates/research/RESEARCH_CONTEXT_TEMPLATE.md',
      ],
      handoff:
        'Completed PDB is saved to docs/product_design/ and referenced by downstream agents via spec_refs in task files.',
    },
  },
  {
    id: 'pipeline-3',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 3,
      title: 'Task Decomposition',
      description:
        'Decompose the PDB into epics, features, and actionable task files. Each task includes agent_roles, spec_refs back to PDB sections, acceptance criteria, and dependency ordering. Schema-first tasks block implementation.',
      agents: [{ name: 'pdb-to-tasks', role: 'ideation' }],
      substeps: [
        'Read & summarize PDB',
        'Propose epic list by phase',
        'Generate task outlines',
        'Produce full YAML task files',
        'Update portfolio milestones',
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
    },
  },
  {
    id: 'pipeline-4',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 4,
      title: 'Architecture Setup',
      description:
        'Establish the project foundation: select orchestration framework, define data schemas, set up API contracts, and configure infrastructure. Schema-first tasks are completed before feature work begins.',
      agents: [
        { name: 'Implementation Agent', role: 'agent-role' },
        { name: 'orchestration-specialist', role: 'specialist' },
      ],
      substeps: [
        'Framework selection',
        'Schema & data model definition',
        'API contract design',
        'Infrastructure setup',
      ],
      artifact: 'Project Scaffolding',
      phase: 'build',
      templateFiles: [
        'templates/subagents/specialists/orchestration-specialist.md',
        'templates/workflow/MULTI_AGENT_WORKFLOW.md',
      ],
      handoff:
        'Scaffolding, schemas, and API contracts are committed. Feature implementation tasks are unblocked.',
    },
  },
  {
    id: 'pipeline-5',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 5,
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
        'Select high-priority task',
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
        'Implementation complete with handoff notes. Task status updated. Ready for testing and quality review.',
    },
  },
  {
    id: 'pipeline-6',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 6,
      title: 'Testing & Evaluation',
      description:
        'Write tests that validate behavior, not implementation. Unit tests for business logic, integration tests for user flows, and LLM evaluation pipelines for AI features. Coverage targets are verified.',
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
      artifact: 'Test Suites & Eval Reports',
      phase: 'verify',
      templateFiles: [
        'templates/subagents/generic/test-writer.md',
        'templates/subagents/specialists/evaluation-specialist.md',
      ],
      handoff:
        'Test suites committed, coverage report generated. Evaluation baselines established for AI features. Ready for quality review.',
    },
  },
  {
    id: 'pipeline-7',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 7,
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
        'Performance optimization',
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
        'If critical issues found: task sent back to Development (stage 5) with feedback. If approved: proceed to Documentation.',
    },
  },
  {
    id: 'pipeline-8',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 8,
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
    },
  },
  {
    id: 'pipeline-9',
    type: 'pipelineNode',
    position: P,
    data: {
      stageNumber: 9,
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
    },
  },
];
