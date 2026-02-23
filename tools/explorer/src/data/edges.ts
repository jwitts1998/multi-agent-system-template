import type { Edge } from '@xyflow/react';

export const edges: Edge[] = [
  // ── Agent Roles delegate to Generic Subagents ──
  { id: 'e-role-qa-cr', source: 'role-qa', target: 'gen-code-reviewer', label: 'delegates', type: 'smoothstep' },
  { id: 'e-role-qa-sa', source: 'role-qa', target: 'gen-security-auditor', type: 'smoothstep' },
  { id: 'e-role-impl-dbg', source: 'role-impl', target: 'gen-debugger', type: 'smoothstep' },
  { id: 'e-role-impl-perf', source: 'role-impl', target: 'gen-perf-optimizer', type: 'smoothstep' },
  { id: 'e-role-impl-des', source: 'role-impl', target: 'gen-designer', type: 'smoothstep' },
  { id: 'e-role-test-tw', source: 'role-test', target: 'gen-test-writer', type: 'smoothstep' },
  { id: 'e-role-doc-dg', source: 'role-doc', target: 'gen-doc-generator', type: 'smoothstep' },

  // ── Agent Roles delegate to Specialists ──
  { id: 'e-role-impl-flutter', source: 'role-impl', target: 'spec-flutter', label: 'specializes', type: 'smoothstep' },
  { id: 'e-role-impl-react', source: 'role-impl', target: 'spec-react', type: 'smoothstep' },
  { id: 'e-role-impl-node', source: 'role-impl', target: 'spec-node', type: 'smoothstep' },
  { id: 'e-role-impl-obs', source: 'role-impl', target: 'spec-observability', type: 'smoothstep' },
  { id: 'e-role-impl-ac', source: 'role-impl', target: 'spec-agent-console', type: 'smoothstep' },
  { id: 'e-role-impl-orch', source: 'role-impl', target: 'spec-orchestration', type: 'smoothstep' },
  { id: 'e-role-qa-eval', source: 'role-qa', target: 'spec-evaluation', type: 'smoothstep' },

  // ── Ideation Pipeline ──
  { id: 'e-idea-pdb', source: 'idea-to-pdb', target: 'pdb-to-tasks', label: 'produces PDB', animated: true, type: 'smoothstep' },
  { id: 'e-pdb-tasks', source: 'pdb-to-tasks', target: 'task-feature-tpl', label: 'generates tasks', type: 'smoothstep' },

  // ── Ingestion Pipeline ──
  { id: 'e-ing-audit-gap', source: 'ing-auditor', target: 'ing-gap', label: 'feeds into', animated: true, type: 'smoothstep' },
  { id: 'e-ing-gap-backfill', source: 'ing-gap', target: 'ing-backfill', label: 'feeds into', animated: true, type: 'smoothstep' },

  // ── Memory System internal links ──
  { id: 'e-mem-w-ctx', source: 'mem-working', target: 'mem-context-strategy', label: 'uses', type: 'smoothstep' },
  { id: 'e-mem-e-ctx', source: 'mem-episodic', target: 'mem-context-strategy', type: 'smoothstep' },
  { id: 'e-mem-s-ctx', source: 'mem-semantic', target: 'mem-context-strategy', type: 'smoothstep' },

  // ── Specialists recommend Research Repos ──
  { id: 'e-spec-flutter-res', source: 'spec-flutter', target: 'res-flutter-chat-ui', label: 'recommends', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-react-aui', source: 'spec-react', target: 'res-assistant-ui', label: 'recommends', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-react-tui', source: 'spec-react', target: 'res-tool-ui', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-react-xy', source: 'spec-react', target: 'res-xyflow', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-ac-aui', source: 'spec-agent-console', target: 'res-assistant-ui', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-ac-tui', source: 'spec-agent-console', target: 'res-tool-ui', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-ac-xy', source: 'spec-agent-console', target: 'res-xyflow', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-ac-lf', source: 'spec-agent-console', target: 'res-langfuse', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-obs-lf', source: 'spec-observability', target: 'res-langfuse', label: 'recommends', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-obs-ol', source: 'spec-observability', target: 'res-openlit', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },

  // ── Memory tiers backed by Research Repos ──
  { id: 'e-mem-e-mem0', source: 'mem-episodic', target: 'res-mem0', label: 'backed by', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-mem-s-mem0', source: 'mem-semantic', target: 'res-mem0', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-mem-s-graphiti', source: 'mem-semantic', target: 'res-graphiti', label: 'advanced', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },

  // ── Workflow connects to Agent Roles ──
  { id: 'e-wf-roles', source: 'wf-multi-agent', target: 'role-impl', label: 'orchestrates', type: 'smoothstep' },
  { id: 'e-wf-roles-qa', source: 'wf-multi-agent', target: 'role-qa', type: 'smoothstep' },
  { id: 'e-wf-roles-test', source: 'wf-multi-agent', target: 'role-test', type: 'smoothstep' },
  { id: 'e-wf-roles-doc', source: 'wf-multi-agent', target: 'role-doc', type: 'smoothstep' },

  // ── Task system connections ──
  { id: 'e-task-schema-tpl', source: 'task-schema', target: 'task-feature-tpl', label: 'defines', type: 'smoothstep' },
  { id: 'e-task-schema-port', source: 'task-schema', target: 'task-portfolio', type: 'smoothstep' },
  { id: 'e-wf-lifecycle-task', source: 'wf-lifecycle', target: 'task-schema', label: 'follows', type: 'smoothstep' },

  // ── Config targets ──
  { id: 'e-cfg-base-agents', source: 'cfg-base', target: 'cfg-agents-base', label: 'paired with', type: 'smoothstep' },

  // ── Orchestration specialist recommends Research Repos ──
  { id: 'e-spec-orch-lg', source: 'spec-orchestration', target: 'res-langgraph', label: 'recommends', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-orch-crew', source: 'spec-orchestration', target: 'res-crewai', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-orch-vai', source: 'spec-orchestration', target: 'res-vercel-ai', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-orch-inst', source: 'spec-orchestration', target: 'res-instructor', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },

  // ── Evaluation specialist recommends Research Repos ──
  { id: 'e-spec-eval-de', source: 'spec-evaluation', target: 'res-deepeval', label: 'recommends', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-eval-dspy', source: 'spec-evaluation', target: 'res-dspy', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-eval-ae', source: 'spec-evaluation', target: 'res-agentevals', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-spec-eval-inst', source: 'spec-evaluation', target: 'res-instructor', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },

  // ── React specialist recommends Vercel AI SDK ──
  { id: 'e-spec-react-vai', source: 'spec-react', target: 'res-vercel-ai', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },

  // ── Memory tiers backed by Vector Stores ──
  { id: 'e-mem-e-qdrant', source: 'mem-episodic', target: 'res-qdrant', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-mem-s-qdrant', source: 'mem-semantic', target: 'res-qdrant', label: 'retrieval via', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },

  // ── Security auditor recommends Guardrails ──
  { id: 'e-sec-nemo', source: 'gen-security-auditor', target: 'res-nemo-guardrails', label: 'recommends', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-sec-llama', source: 'gen-security-auditor', target: 'res-llamafirewall', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },

  // ── Workflow connects to Interoperability Protocols ──
  { id: 'e-wf-a2a', source: 'wf-multi-agent', target: 'res-a2a', label: 'protocol', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },
  { id: 'e-wf-mcp', source: 'wf-multi-agent', target: 'res-mcp', style: { strokeDasharray: '5,5' }, type: 'smoothstep' },

  // ── Research repo relationships ──
  { id: 'e-res-aui-tui', source: 'res-assistant-ui', target: 'res-tool-ui', label: 'pairs with', type: 'smoothstep' },
];
