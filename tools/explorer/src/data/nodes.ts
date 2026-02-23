import type { Node } from '@xyflow/react';

export type NodeCategory =
  | 'agent-role'
  | 'generic'
  | 'specialist'
  | 'ideation'
  | 'ingestion'
  | 'memory'
  | 'research'
  | 'config'
  | 'workflow'
  | 'task';

export type ResearchTier = 1 | 2 | 3;

export interface ExplorerNodeData {
  name: string;
  description: string;
  filePath?: string;
  category: NodeCategory;
  tier?: ResearchTier;
  license?: string;
  repoUrl?: string;
  subcategory?: string;
  [key: string]: unknown;
}

export type ExplorerNode = Node<ExplorerNodeData>;

const P = { x: 0, y: 0 };

export const nodes: ExplorerNode[] = [
  // ── Agent Roles ──
  { id: 'role-impl', type: 'agentNode', position: P, data: { name: 'Implementation Agent', description: 'Core development and implementation specialist. Writes production-ready code following architecture patterns.', category: 'agent-role', subcategory: 'Base Role' } },
  { id: 'role-qa', type: 'agentNode', position: P, data: { name: 'QA Agent', description: 'Code review and quality enforcement specialist. Reviews code for style, security, and architecture compliance.', category: 'agent-role', subcategory: 'Base Role' } },
  { id: 'role-test', type: 'agentNode', position: P, data: { name: 'Testing Agent', description: 'Test coverage and QA automation specialist. Writes unit and integration tests.', category: 'agent-role', subcategory: 'Base Role' } },
  { id: 'role-doc', type: 'agentNode', position: P, data: { name: 'Documentation Agent', description: 'Documentation generation and maintenance specialist. Creates inline docs, markdown docs, and API docs.', category: 'agent-role', subcategory: 'Base Role' } },

  // ── Generic Subagents ──
  { id: 'gen-code-reviewer', type: 'agentNode', position: P, data: { name: 'code-reviewer', description: 'Reviews code for style, maintainability, security patterns, and architecture compliance.', filePath: 'templates/subagents/generic/code-reviewer.md', category: 'generic' } },
  { id: 'gen-debugger', type: 'agentNode', position: P, data: { name: 'debugger', description: 'Expert debugging specialist for errors, test failures, and unexpected behavior.', filePath: 'templates/subagents/generic/debugger.md', category: 'generic' } },
  { id: 'gen-test-writer', type: 'agentNode', position: P, data: { name: 'test-writer', description: 'Expert test writing and QA automation specialist. Creates tests and ensures coverage.', filePath: 'templates/subagents/generic/test-writer.md', category: 'generic' } },
  { id: 'gen-doc-generator', type: 'agentNode', position: P, data: { name: 'doc-generator', description: 'Documentation generation and maintenance specialist.', filePath: 'templates/subagents/generic/doc-generator.md', category: 'generic' } },
  { id: 'gen-security-auditor', type: 'agentNode', position: P, data: { name: 'security-auditor', description: 'Security scanning and hardening specialist for auth, data handling, and APIs.', filePath: 'templates/subagents/generic/security-auditor.md', category: 'generic' } },
  { id: 'gen-perf-optimizer', type: 'agentNode', position: P, data: { name: 'performance-optimizer', description: 'Performance analysis and optimization specialist for critical code paths.', filePath: 'templates/subagents/generic/performance-optimizer.md', category: 'generic' } },
  { id: 'gen-designer', type: 'agentNode', position: P, data: { name: 'designer', description: 'UI/UX and design system specialist. Enforces accessibility, responsiveness, and brand consistency.', filePath: 'templates/subagents/generic/designer.md', category: 'generic' } },

  // ── Specialist Subagents ──
  { id: 'spec-flutter', type: 'agentNode', position: P, data: { name: 'flutter-specialist', description: 'Expert Flutter/Dart specialist. Riverpod, Material 3, Firebase, and conversational agent UI.', filePath: 'templates/subagents/specialists/flutter-specialist.md', category: 'specialist' } },
  { id: 'spec-react', type: 'agentNode', position: P, data: { name: 'react-specialist', description: 'Expert React/TypeScript specialist. Agent console UI, workflow visualization with xyflow.', filePath: 'templates/subagents/specialists/react-specialist.md', category: 'specialist' } },
  { id: 'spec-node', type: 'agentNode', position: P, data: { name: 'node-specialist', description: 'Expert Node.js/Express specialist. API implementation, middleware, backend services.', filePath: 'templates/subagents/specialists/node-specialist.md', category: 'specialist' } },
  { id: 'spec-observability', type: 'agentNode', position: P, data: { name: 'observability-specialist', description: 'LLM/agent observability specialist. Trace instrumentation, prompt management, evaluation pipelines, cost tracking.', filePath: 'templates/subagents/specialists/observability-specialist.md', category: 'specialist' } },
  { id: 'spec-agent-console', type: 'agentNode', position: P, data: { name: 'agent-console-specialist', description: 'Web-based agent dashboard specialist. Composes assistant-ui + tool-ui + xyflow for agent consoles.', filePath: 'templates/subagents/specialists/agent-console-specialist.md', category: 'specialist' } },
  { id: 'spec-orchestration', type: 'agentNode', position: P, data: { name: 'orchestration-specialist', description: 'Agent orchestration and runtime specialist. LangGraph, CrewAI, Vercel AI SDK. Handoffs, state management, tool calling.', filePath: 'templates/subagents/specialists/orchestration-specialist.md', category: 'specialist' } },
  { id: 'spec-evaluation', type: 'agentNode', position: P, data: { name: 'evaluation-specialist', description: 'LLM/agent evaluation specialist. DeepEval, DSPy, prompt optimization, regression testing, quality metrics.', filePath: 'templates/subagents/specialists/evaluation-specialist.md', category: 'specialist' } },

  // ── Ideation Pipeline ──
  { id: 'idea-to-pdb', type: 'agentNode', position: P, data: { name: 'idea-to-pdb', description: 'Guides from a raw product idea to a structured Product Design Blueprint (PDB). Two-phase workflow: Idea Exploration then PDB Generation.', filePath: 'templates/subagents/ideation/idea-to-pdb.md', category: 'ideation' } },
  { id: 'pdb-to-tasks', type: 'agentNode', position: P, data: { name: 'pdb-to-tasks', description: 'Decomposes a PDB into epics, features, and tasks/*.yml files ready for multi-agent development.', filePath: 'templates/subagents/ideation/pdb-to-tasks.md', category: 'ideation' } },

  // ── Ingestion Pipeline ──
  { id: 'ing-auditor', type: 'agentNode', position: P, data: { name: 'codebase-auditor', description: 'Scans existing codebase to build Codebase Knowledge Graph. Extracts architecture, data models, APIs.', filePath: 'templates/subagents/ingestion/codebase-auditor.md', category: 'ingestion' } },
  { id: 'ing-gap', type: 'agentNode', position: P, data: { name: 'gap-analysis', description: 'Identifies security flaws, infrastructure gaps, and production-readiness issues.', filePath: 'templates/subagents/ingestion/gap-analysis.md', category: 'ingestion' } },
  { id: 'ing-backfill', type: 'agentNode', position: P, data: { name: 'documentation-backfill', description: 'Generates PDB and Technical Architecture Document from existing code.', filePath: 'templates/subagents/ingestion/documentation-backfill.md', category: 'ingestion' } },

  // ── Memory System ──
  { id: 'mem-working', type: 'memoryNode', position: P, data: { name: 'Working Memory', description: 'Current session context. Sliding window of recent turns with token budget. Single-session lifespan.', filePath: 'templates/memory/working-memory-example.md', category: 'memory', subcategory: 'Tier 1' } },
  { id: 'mem-episodic', type: 'memoryNode', position: P, data: { name: 'Episodic Memory', description: 'Session logs and decision history. Archived per-session. Backed by mem0 for programmatic access.', filePath: 'templates/memory/README.md', category: 'memory', subcategory: 'Tier 2' } },
  { id: 'mem-semantic', type: 'memoryNode', position: P, data: { name: 'Semantic Memory', description: 'Validated patterns and rules. Permanent lifespan. Backed by mem0 facts or graphiti knowledge graphs.', filePath: 'templates/memory/semantic-memory-example.md', category: 'memory', subcategory: 'Tier 3' } },
  { id: 'mem-context-strategy', type: 'memoryNode', position: P, data: { name: 'Context Strategy', description: 'Token budget allocation across short/mid/long-term tiers. Sliding window, summarization, retrieval.', filePath: 'templates/memory/context-strategy-example.md', category: 'memory', subcategory: 'Strategy' } },

  // ── Workflow ──
  { id: 'wf-multi-agent', type: 'configNode', position: P, data: { name: 'Multi-Agent Workflow', description: 'How specialized agents collaborate: sequential, parallel, and review-based patterns.', filePath: 'templates/workflow/MULTI_AGENT_WORKFLOW.md', category: 'workflow' } },
  { id: 'wf-dev', type: 'configNode', position: P, data: { name: 'Development Workflow', description: 'General development workflow independent of agent assignments.', filePath: 'templates/workflow/DEVELOPMENT_WORKFLOW.md', category: 'workflow' } },
  { id: 'wf-lifecycle', type: 'configNode', position: P, data: { name: 'Task Lifecycle Example', description: 'End-to-end walkthrough of a task from todo to done with handoff notes.', filePath: 'templates/workflow/TASK_LIFECYCLE_EXAMPLE.md', category: 'workflow' } },

  // ── Task System ──
  { id: 'task-schema', type: 'configNode', position: P, data: { name: 'Task Schema Guide', description: 'Documentation for task tracking schema. Portfolio-level and per-feature task structures.', filePath: 'templates/tasks/TASK_SCHEMA_GUIDE.md', category: 'task' } },
  { id: 'task-feature-tpl', type: 'configNode', position: P, data: { name: 'Feature Task Template', description: 'Template YAML for feature-level tasks with agent_roles, spec_refs, acceptance_criteria.', filePath: 'templates/tasks/feature-task-template.yml', category: 'task' } },
  { id: 'task-portfolio', type: 'configNode', position: P, data: { name: 'Portfolio Schema', description: 'Template YAML for portfolio-level milestones and gap tracking.', filePath: 'templates/tasks/tasks-schema.yml', category: 'task' } },

  // ── Config Templates ──
  { id: 'cfg-base', type: 'configNode', position: P, data: { name: '.cursorrules (base)', description: 'Base template with generic project structure, standards, and session checklist.', filePath: 'templates/cursorrules/base-template.cursorrules', category: 'config', subcategory: 'cursorrules' } },
  { id: 'cfg-web', type: 'configNode', position: P, data: { name: '.cursorrules (web)', description: 'Web application template. React/Vue/Angular patterns, responsive design, SPA conventions.', filePath: 'templates/cursorrules/web-app.cursorrules', category: 'config', subcategory: 'cursorrules' } },
  { id: 'cfg-backend', type: 'configNode', position: P, data: { name: '.cursorrules (backend)', description: 'Backend service/API template. REST/GraphQL patterns, database access, middleware.', filePath: 'templates/cursorrules/backend-service.cursorrules', category: 'config', subcategory: 'cursorrules' } },
  { id: 'cfg-fullstack', type: 'configNode', position: P, data: { name: '.cursorrules (full-stack)', description: 'Full-stack application template combining frontend and backend conventions.', filePath: 'templates/cursorrules/full-stack.cursorrules', category: 'config', subcategory: 'cursorrules' } },
  { id: 'cfg-mobile', type: 'configNode', position: P, data: { name: '.cursorrules (mobile)', description: 'Mobile app template. Flutter/React Native patterns, platform-specific conventions.', filePath: 'templates/cursorrules/mobile-app.cursorrules', category: 'config', subcategory: 'cursorrules' } },
  { id: 'cfg-agents-base', type: 'configNode', position: P, data: { name: 'AGENTS.md (base)', description: 'Base agent definitions with 4 core roles and collaboration patterns.', filePath: 'templates/agents/AGENTS-base.md', category: 'config', subcategory: 'agents' } },

  // ── Research: Flutter UI ──
  { id: 'res-flutter-chat-ui', type: 'researchNode', position: P, data: { name: 'flutter_chat_ui', description: 'Production-grade chat rendering with clean message models, custom types, and theming.', category: 'research', tier: 1, license: 'Apache-2.0', repoUrl: 'https://github.com/flyerhq/flutter_chat_ui', subcategory: 'Flutter UI' } },
  { id: 'res-local-llm-flutter', type: 'researchNode', position: P, data: { name: 'local-llm-flutter-chat', description: 'Provider abstraction examples, streaming UX patterns, model switching.', category: 'research', tier: 3, license: 'BSD-3-Clause', repoUrl: 'https://github.com/extrawest/local-llm-flutter-chat', subcategory: 'Flutter UI' } },
  { id: 'res-pocketllm', type: 'researchNode', position: P, data: { name: 'PocketLLM', description: 'Modern AI chat UX reference with good conversation management patterns.', category: 'research', tier: 3, license: 'Verify', repoUrl: 'https://github.com/PocketLLM/PocketLLM', subcategory: 'Flutter UI' } },
  { id: 'res-llmchat', type: 'researchNode', position: P, data: { name: 'LLMChat', description: 'Clean backend/frontend separation with streaming via API. Full-stack reference.', category: 'research', tier: 3, license: 'MIT', repoUrl: 'https://github.com/c0sogi/LLMChat', subcategory: 'Flutter UI' } },

  // ── Research: Web Console ──
  { id: 'res-assistant-ui', type: 'researchNode', position: P, data: { name: 'assistant-ui', description: 'ChatGPT-style UI primitives with message streaming and tool output rendering.', category: 'research', tier: 1, license: 'MIT', repoUrl: 'https://github.com/assistant-ui/assistant-ui', subcategory: 'Web Console' } },
  { id: 'res-tool-ui', type: 'researchNode', position: P, data: { name: 'tool-ui', description: 'Structured tool result components: tables, receipts, approval forms, confirmations.', category: 'research', tier: 1, license: 'MIT', repoUrl: 'https://github.com/assistant-ui/tool-ui', subcategory: 'Web Console' } },
  { id: 'res-ai-chatbot', type: 'researchNode', position: P, data: { name: 'vercel/ai-chatbot', description: 'Complete Next.js + Vercel AI SDK chatbot template.', category: 'research', tier: 3, license: 'MIT', repoUrl: 'https://github.com/vercel/ai-chatbot', subcategory: 'Web Console' } },
  { id: 'res-open-webui', type: 'researchNode', position: P, data: { name: 'open-webui', description: 'Full-featured web UI. Reference only due to mixed license + branding requirement.', category: 'research', tier: 3, license: 'Mixed', repoUrl: 'https://github.com/open-webui/open-webui', subcategory: 'Web Console' } },

  // ── Research: Visualization ──
  { id: 'res-xyflow', type: 'researchNode', position: P, data: { name: 'xyflow (React Flow)', description: 'Node-and-edge graph UI engine. Agent graphs, execution DAGs, topology maps.', category: 'research', tier: 1, license: 'MIT', repoUrl: 'https://github.com/xyflow/xyflow', subcategory: 'Visualization' } },
  { id: 'res-react-diagrams', type: 'researchNode', position: P, data: { name: 'react-diagrams', description: 'Generalized diagram engine. Alternative to React Flow.', category: 'research', tier: 3, license: 'MIT', repoUrl: 'https://github.com/projectstorm/react-diagrams', subcategory: 'Visualization' } },
  { id: 'res-langflow', type: 'researchNode', position: P, data: { name: 'langflow', description: 'Full workflow builder product with active releases. Reference UX patterns.', category: 'research', tier: 3, license: 'MIT', repoUrl: 'https://github.com/langflow-ai/langflow', subcategory: 'Visualization' } },
  { id: 'res-flowise', type: 'researchNode', position: P, data: { name: 'Flowise', description: 'Drag-and-drop workflow builder. Reference for workflow builder UX.', category: 'research', tier: 3, license: 'Apache-2.0', repoUrl: 'https://github.com/FlowiseAI/Flowise', subcategory: 'Visualization' } },

  // ── Research: Observability ──
  { id: 'res-langfuse', type: 'researchNode', position: P, data: { name: 'langfuse', description: 'LLM traces, prompt management, evaluation runs, team collaboration. Top observability choice.', category: 'research', tier: 1, license: 'MIT', repoUrl: 'https://github.com/langfuse/langfuse', subcategory: 'Observability' } },
  { id: 'res-openlit', type: 'researchNode', position: P, data: { name: 'openlit', description: 'OpenTelemetry-native LLM observability. Strong Langfuse alternative.', category: 'research', tier: 2, license: 'Apache-2.0', repoUrl: 'https://github.com/openlit/openlit', subcategory: 'Observability' } },
  { id: 'res-phoenix', type: 'researchNode', position: P, data: { name: 'Arize Phoenix', description: 'Strong evaluation tooling. ELv2 license may restrict SaaS resale.', category: 'research', tier: 3, license: 'ELv2', repoUrl: 'https://github.com/Arize-ai/phoenix', subcategory: 'Observability' } },

  // ── Research: Memory ──
  { id: 'res-mem0', type: 'researchNode', position: P, data: { name: 'mem0', description: 'Universal memory layer abstraction. Agent-focused. Strong base memory layer.', category: 'research', tier: 1, license: 'Apache-2.0', repoUrl: 'https://github.com/mem0ai/mem0', subcategory: 'Memory' } },
  { id: 'res-graphiti', type: 'researchNode', position: P, data: { name: 'graphiti', description: 'Temporal knowledge graph memory. Evolving facts over time.', category: 'research', tier: 2, license: 'Apache-2.0', repoUrl: 'https://github.com/getzep/graphiti', subcategory: 'Memory' } },
  { id: 'res-letta', type: 'researchNode', position: P, data: { name: 'letta (MemGPT)', description: 'Memory-first agent architecture. Reference for stateful agent design.', category: 'research', tier: 3, license: 'Apache-2.0', repoUrl: 'https://github.com/letta-ai/letta', subcategory: 'Memory' } },

  // ── Research: Frameworks ──
  { id: 'res-autogen', type: 'researchNode', position: P, data: { name: 'autogen', description: 'Multi-agent orchestration framework from Microsoft.', category: 'research', tier: 3, license: 'MIT', repoUrl: 'https://github.com/microsoft/autogen', subcategory: 'Frameworks' } },
  { id: 'res-autogen-ui', type: 'researchNode', position: P, data: { name: 'autogen-ui', description: 'Reference UI for multi-agent chat systems.', category: 'research', tier: 3, license: 'MIT', repoUrl: 'https://github.com/victordibia/autogen-ui', subcategory: 'Frameworks' } },

  // ── Research: Orchestration ──
  { id: 'res-langgraph', type: 'researchNode', position: P, data: { name: 'LangGraph', description: 'Graph-based state machines for complex multi-agent workflows. Checkpointing, human-in-the-loop, parallel execution.', category: 'research', tier: 1, license: 'MIT', repoUrl: 'https://github.com/langchain-ai/langgraph', subcategory: 'Orchestration' } },
  { id: 'res-crewai', type: 'researchNode', position: P, data: { name: 'CrewAI', description: 'Role-based multi-agent teams. Agents with personas, goals, backstories. Simpler alternative to LangGraph.', category: 'research', tier: 1, license: 'MIT', repoUrl: 'https://github.com/crewAIInc/crewAI', subcategory: 'Orchestration' } },
  { id: 'res-vercel-ai', type: 'researchNode', position: P, data: { name: 'Vercel AI SDK', description: 'TypeScript multi-provider toolkit. Streaming, tool calling, structured output. 20+ LLM providers.', category: 'research', tier: 1, license: 'Apache-2.0', repoUrl: 'https://github.com/vercel/ai', subcategory: 'Orchestration' } },
  { id: 'res-openai-agents', type: 'researchNode', position: P, data: { name: 'OpenAI Agents SDK', description: 'Lightweight multi-agent workflows with handoffs, guardrails, and MCP support.', category: 'research', tier: 2, license: 'MIT', repoUrl: 'https://github.com/openai/openai-agents-python', subcategory: 'Orchestration' } },
  { id: 'res-smolagents', type: 'researchNode', position: P, data: { name: 'smolagents', description: 'Minimal code-first agents from HuggingFace. ~1000 lines core. Model-agnostic.', category: 'research', tier: 2, license: 'Apache-2.0', repoUrl: 'https://github.com/huggingface/smolagents', subcategory: 'Orchestration' } },
  { id: 'res-pydantic-ai', type: 'researchNode', position: P, data: { name: 'PydanticAI', description: 'Type-safe Python agent framework with Pydantic validation. MCP and A2A support.', category: 'research', tier: 2, license: 'MIT', repoUrl: 'https://github.com/pydantic/pydantic-ai', subcategory: 'Orchestration' } },

  // ── Research: Evaluation ──
  { id: 'res-deepeval', type: 'researchNode', position: P, data: { name: 'DeepEval', description: 'Comprehensive LLM evaluation. 14+ metrics: faithfulness, relevancy, hallucination, bias, toxicity. CI/CD integration.', category: 'research', tier: 1, license: 'Apache-2.0', repoUrl: 'https://github.com/confident-ai/deepeval', subcategory: 'Evaluation' } },
  { id: 'res-dspy', type: 'researchNode', position: P, data: { name: 'DSPy', description: 'Programmatic prompt optimization from Stanford. Learnable programs replace manual prompt engineering.', category: 'research', tier: 1, license: 'MIT', repoUrl: 'https://github.com/stanfordnlp/dspy', subcategory: 'Evaluation' } },
  { id: 'res-agentevals', type: 'researchNode', position: P, data: { name: 'AgentEvals', description: 'Trajectory-level evaluation for multi-step agent workflows. Python and TypeScript.', category: 'research', tier: 2, license: 'MIT', repoUrl: 'https://github.com/langchain-ai/agentevals', subcategory: 'Evaluation' } },

  // ── Research: Structured Output ──
  { id: 'res-instructor', type: 'researchNode', position: P, data: { name: 'Instructor', description: 'Type-safe structured extraction from LLMs via Pydantic. Multi-language. 3M+ monthly downloads.', category: 'research', tier: 1, license: 'MIT', repoUrl: 'https://github.com/instructor-ai/instructor', subcategory: 'Structured Output' } },

  // ── Research: Vector Stores ──
  { id: 'res-qdrant', type: 'researchNode', position: P, data: { name: 'Qdrant', description: 'Fastest open-source vector DB (4ms p50). Rust-based. Scales to billions of vectors.', category: 'research', tier: 1, license: 'Apache-2.0', repoUrl: 'https://github.com/qdrant/qdrant', subcategory: 'Vector Stores' } },
  { id: 'res-chroma', type: 'researchNode', position: P, data: { name: 'Chroma', description: 'Developer-friendly vector store. Embeds directly into apps. Good for prototyping.', category: 'research', tier: 2, license: 'Apache-2.0', repoUrl: 'https://github.com/chroma-core/chroma', subcategory: 'Vector Stores' } },
  { id: 'res-pgvector', type: 'researchNode', position: P, data: { name: 'pgvector', description: 'Vector search as a PostgreSQL extension. SQL interface with joins to relational data.', category: 'research', tier: 2, license: 'PostgreSQL', repoUrl: 'https://github.com/pgvector/pgvector', subcategory: 'Vector Stores' } },

  // ── Research: Guardrails ──
  { id: 'res-nemo-guardrails', type: 'researchNode', position: P, data: { name: 'NeMo Guardrails', description: 'Programmable guardrails for LLM systems. Input/output rails, topical containment, jailbreak detection.', category: 'research', tier: 1, license: 'Apache-2.0', repoUrl: 'https://github.com/NVIDIA/NeMo-Guardrails', subcategory: 'Guardrails' } },
  { id: 'res-llamafirewall', type: 'researchNode', position: P, data: { name: 'LlamaFirewall', description: 'Meta agent security. PromptGuard 2, Agent Alignment Checks, CodeShield.', category: 'research', tier: 2, license: 'Apache-2.0', repoUrl: 'https://github.com/meta-llama/PurpleLlama', subcategory: 'Guardrails' } },

  // ── Research: Interoperability ──
  { id: 'res-a2a', type: 'researchNode', position: P, data: { name: 'A2A Protocol', description: 'Agent2Agent interoperability standard from Google/Linux Foundation. JSON-RPC 2.0 over HTTP.', category: 'research', tier: 1, license: 'Apache-2.0', repoUrl: 'https://github.com/google/A2A', subcategory: 'Interoperability' } },
  { id: 'res-mcp', type: 'researchNode', position: P, data: { name: 'MCP', description: 'Model Context Protocol for tool discovery and calling. Python and TypeScript SDKs.', category: 'research', tier: 1, license: 'MIT', repoUrl: 'https://github.com/modelcontextprotocol', subcategory: 'Interoperability' } },
];

export const categoryMeta: Record<NodeCategory, { label: string; color: string }> = {
  'agent-role': { label: 'Agent Roles', color: '#3b82f6' },
  'generic':    { label: 'Generic Subagents', color: '#60a5fa' },
  'specialist': { label: 'Specialists', color: '#818cf8' },
  'ideation':   { label: 'Ideation Pipeline', color: '#2dd4bf' },
  'ingestion':  { label: 'Ingestion Pipeline', color: '#f59e0b' },
  'memory':     { label: 'Memory System', color: '#a78bfa' },
  'research':   { label: 'Research Repos', color: '#34d399' },
  'config':     { label: 'Configuration', color: '#f472b6' },
  'workflow':   { label: 'Workflows', color: '#a1a1aa' },
  'task':       { label: 'Task System', color: '#d97706' },
};
