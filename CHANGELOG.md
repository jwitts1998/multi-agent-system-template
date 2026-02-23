# Multi-Agent System Template - Changelog

## Version 2.2.0 - Agent Runtime, Evaluation, and Tooling (February 2026)

### Summary

Second research integration round covering the six biggest gaps identified after v2.1.0: agent orchestration, evaluation/testing, vector stores, guardrails/safety, structured output, and interoperability protocols. Added ~30 new repos across 6 categories with two new specialist templates and four template enhancements.

### New Content

1. **Research Document** (`docs/research/agent_runtime_tooling_landscape.md`)
   - Evaluation of ~30 open-source repos across 6 categories: agent orchestration, evaluation and testing, structured output, vector stores, agent safety/guardrails, and interoperability protocols
   - Each repo assessed for license, modularity, integration strategy, and recommendation tier
   - Recommended runtime stack architecture split by language: Python (LangGraph + DeepEval + DSPy) and TypeScript (Vercel AI SDK)

2. **Orchestration Specialist** (`templates/subagents/specialists/orchestration-specialist.md`)
   - New specialist for agent orchestration and runtime design
   - Python stack: LangGraph (primary, graph-based state machines) and CrewAI (simpler role-based alternative)
   - TypeScript stack: Vercel AI SDK (multi-provider toolkit with streaming and tool calling)
   - Agent handoff patterns, state management, structured output with Instructor
   - MCP and A2A protocol integration guidance
   - Reference alternatives: OpenAI Agents SDK, smolagents, PydanticAI

3. **Evaluation Specialist** (`templates/subagents/specialists/evaluation-specialist.md`)
   - New specialist for LLM and agent evaluation, testing, and prompt optimization
   - DeepEval (primary) with 14+ metrics: faithfulness, relevancy, hallucination, bias, toxicity
   - DSPy for programmatic prompt optimization (learnable programs replace manual prompt engineering)
   - AgentEvals for trajectory-level multi-step workflow evaluation
   - Evaluation pipeline patterns: offline batch eval, online monitoring, prompt regression testing, A/B testing
   - CI/CD integration and Langfuse observability connection

### Enhancements

4. **Memory System Templates** (`templates/memory/README.md`)
   - Added "Vector Store Options" section mapping memory tiers to retrieval infrastructure
   - Qdrant as primary (Apache-2.0, fastest at 4ms p50, scales to billions of vectors)
   - Chroma for prototyping and small-scale deployments
   - pgvector for PostgreSQL-native teams
   - When-to-adopt guidance for each option

5. **Security Auditor** (`templates/subagents/generic/security-auditor.md`)
   - Added "AI/Agent-Specific Security" checklist section with 8 new items
   - NeMo Guardrails (Apache-2.0, 4.7k stars) as primary AI guardrails framework
   - LlamaFirewall (Meta) for agent-specific security concerns
   - Covers: prompt injection, tool call validation, output filtering, autonomy boundaries, MCP tool poisoning, PII leakage, jailbreak detection, code generation safety

6. **React Specialist** (`templates/subagents/specialists/react-specialist.md`)
   - Added "Agent Runtime Layer" section with Vercel AI SDK guidance
   - Multi-provider setup, tool calling, streaming with React hooks
   - Structured output with Instructor integration
   - Code examples for generateText, useChat, and tool definitions

7. **Multi-Agent Workflow** (`templates/workflow/MULTI_AGENT_WORKFLOW.md`)
   - Added "Agent Interoperability Protocols" section
   - MCP for tool discovery and calling (already in use via Cursor plugins)
   - A2A (Agent2Agent Protocol) for cross-framework agent communication
   - MCP vs A2A comparison table: when to use each protocol

8. **System Explorer** (`tools/explorer/`)
   - Added 2 new specialist nodes (orchestration, evaluation)
   - Added 20 new research nodes across 6 subcategories: Orchestration, Evaluation, Structured Output, Vector Stores, Guardrails, Interoperability
   - Added 17 new relationship edges connecting new specialists and research repos

### New Files

- `docs/research/agent_runtime_tooling_landscape.md`
- `templates/subagents/specialists/orchestration-specialist.md`
- `templates/subagents/specialists/evaluation-specialist.md`

### Updated Files

- `templates/memory/README.md` -- Added vector store options section
- `templates/subagents/generic/security-auditor.md` -- Added AI guardrails section
- `templates/subagents/specialists/react-specialist.md` -- Added Vercel AI SDK runtime section
- `templates/workflow/MULTI_AGENT_WORKFLOW.md` -- Added interoperability protocols section
- `tools/explorer/src/data/nodes.ts` -- Added 22 new nodes
- `tools/explorer/src/data/edges.ts` -- Added 17 new edges
- `CHANGELOG.md` -- This entry

### Breaking Changes

None. All additions are backwards compatible.

---

## Version 2.1.0 - Agent UI, Memory Backends, and Observability (February 2026)

### Summary

Integrated findings from the Agent UI + Memory Stack research report into the template system. Enhanced existing specialist and memory templates with concrete library guidance, and created two new specialist templates for areas not previously covered (LLM observability, agent console UI).

### New Content

1. **Research Document** (`docs/research/agent_ui_memory_landscape.md`)
   - Evaluation of 20+ open-source repos across 7 categories: Flutter chat UI, web agent consoles, workflow visualization, multi-agent observability, context window management, long-term memory systems, and multi-agent frameworks
   - Each repo assessed for license, modularity, integration strategy, and recommendation tier
   - Recommended base stack architecture for mobile, web, and memory layers

2. **Observability Specialist** (`templates/subagents/specialists/observability-specialist.md`)
   - New specialist for LLM/agent observability: trace instrumentation, prompt management, evaluation pipelines, cost tracking
   - Recommends Langfuse (primary) and OpenLIT (alternative, OpenTelemetry-native)
   - Trace hierarchy patterns, metadata tagging, automated and human evaluation workflows
   - Cost attribution and budget alert guidance

3. **Agent Console Specialist** (`templates/subagents/specialists/agent-console-specialist.md`)
   - New specialist for building web-based agent dashboards and monitoring consoles
   - Composes assistant-ui + tool-ui + xyflow into a coherent agent console architecture
   - Tool approval workflow with risk-based approval levels and timeout handling
   - Graph view patterns (agent topology, execution DAG, custom node components)
   - Streaming patterns (SSE, WebSocket, optimistic updates)
   - Multi-agent dashboard with fleet status, metrics, and cost breakdown

4. **Context Strategy Example** (`templates/memory/context-strategy-example.md`)
   - Fill-in template for defining a project's context budget layer
   - Short/mid/long-term context tiers with token allocation guidance
   - Sliding window, rolling summarization, and memory retrieval strategies
   - Overflow handling priorities and monitoring metrics

### Enhancements

5. **Flutter Specialist** (`templates/subagents/specialists/flutter-specialist.md`)
   - Added "Conversational / Agent UI" section
   - flutter_chat_ui as recommended chat rendering layer (Apache-2.0, high modularity)
   - Domain model mapping pattern (AgentMessage -> Flyer message types)
   - Custom message types for tool results, structured cards, approval prompts
   - Streaming update patterns via message mutation
   - Provider abstraction interface for backend-agnostic agent UI
   - Extended integration checklist with agent UI items

6. **React Specialist** (`templates/subagents/specialists/react-specialist.md`)
   - Added "Agent Console UI" section with assistant-ui + tool-ui guidance
   - Added "Workflow Visualization" section with xyflow / React Flow guidance
   - Chat console architecture with TypeScript interfaces
   - Tool approval workflow pattern
   - Agent-as-node graph visualization pattern with code example
   - Extended integration checklist with agent console and graph view items

7. **Memory System Templates** (`templates/memory/README.md`)
   - Added "Backend Options" section mapping the three-tier model to concrete tooling
   - mem0 as recommended starting point for episodic and semantic tiers
   - graphiti as advanced option for temporal knowledge graphs
   - letta (MemGPT) as architecture reference for memory-first agents
   - Context budget strategy table with token allocation guidance per tier

### New Files

- `docs/research/agent_ui_memory_landscape.md`
- `templates/subagents/specialists/observability-specialist.md`
- `templates/subagents/specialists/agent-console-specialist.md`
- `templates/memory/context-strategy-example.md`

### Updated Files

- `templates/subagents/specialists/flutter-specialist.md` — Added conversational/agent UI section
- `templates/subagents/specialists/react-specialist.md` — Added agent console UI + workflow visualization sections
- `templates/memory/README.md` — Added backend options and context budget strategy
- `CHANGELOG.md` — This entry

### Breaking Changes

None. All additions are backwards compatible.

---

## Version 2.0.0 - Clone-and-Become Starter (February 2026)

### Summary

Major reframe: the repo is now designed to be cloned and become your project, not just a reference library you copy from. Added interactive setup script, PDB-to-tasks agent, variable validation, pruning workflow, and standardized all generic agents.

### Breaking Changes

- Repo now ships with root-level `.cursorrules` and `AGENTS.md` (generic starter versions). These are overwritten by `setup.sh` with project-specific versions.
- Generic subagents restructured with consistent section ordering.

### New Content

1. **Interactive Setup Script** (`setup.sh`)
   - Asks project type, language, framework, architecture interactively
   - Copies correct templates to root (`.cursorrules`, `AGENTS.md`, subagents, task files)
   - Replaces core template variables automatically
   - Prunes unused project-type templates
   - Creates project directory structure (`tasks/`, `docs/product_design/`, `.cursor/agents/`)
   - Reports remaining variables that need manual customization

2. **Root `.cursorrules`** (generic starter)
   - Works immediately after cloning — no setup required for basic Cursor functionality
   - Documents the multi-agent system, available agents, task workflow, and session checklist
   - Replaced by project-specific version when `setup.sh` runs

3. **Root `AGENTS.md`** (generic starter)
   - Defines all four base agent roles (Implementation, QA, Testing, Documentation)
   - Includes collaboration patterns, task integration, and handoff protocol
   - Replaced by project-specific version when `setup.sh` runs

4. **PDB-to-Tasks Agent** (`templates/subagents/ideation/pdb-to-tasks.md`)
   - Reads a PDB and decomposes it into epics, features, and `tasks/*.yml` files
   - Follows schema-first rule (data/API schema tasks before implementation)
   - Generates portfolio-level milestones in `tasks.yml`
   - Approval checkpoints at each stage (PDB summary, epic list, task outlines, full YAML)
   - Task sizing, dependency mapping, and `spec_refs` back to PDB sections

5. **Variable Validation Script** (`validate.sh`)
   - Scans project files for remaining `{{VARIABLE}}` placeholders
   - Reports file, line number, and variable name for each unresolved variable
   - Lists unique variables remaining
   - Returns non-zero exit code if variables remain (usable as pre-commit hook)

6. **Post-Setup Pruning Checklist** (in `docs/CUSTOMIZATION_GUIDE.md`)
   - "Always safe to remove" files (template-library scaffolding)
   - Per-project-type removal lists for unused templates
   - "Always keep" list of essential project files
   - "Optional — remove when confident" list

### Enhancements

7. **Standardized Generic Agent Structure** (all 7 agents)
   - Canonical section order: Frontmatter, Mission, Technology Context, When to Invoke, Process/Checklist, Output Format, Notes
   - Added Mission section to agents that lacked one
   - Added Technology Context to agents that lacked it
   - Added Output Format section to all agents
   - Consistent checklist formatting across all agents

### New Files

- `setup.sh` — Interactive project setup script
- `validate.sh` — Template variable validation script
- `.cursorrules` — Generic starter rules (root level)
- `AGENTS.md` — Generic starter agent definitions (root level)
- `templates/subagents/ideation/pdb-to-tasks.md` — PDB decomposition agent

### Updated Files

- `docs/CUSTOMIZATION_GUIDE.md` — Added pruning checklist section
- `templates/subagents/generic/code-reviewer.md` — Standardized structure
- `templates/subagents/generic/debugger.md` — Standardized structure
- `templates/subagents/generic/designer.md` — Standardized structure
- `templates/subagents/generic/doc-generator.md` — Standardized structure
- `templates/subagents/generic/performance-optimizer.md` — Standardized structure
- `templates/subagents/generic/security-auditor.md` — Standardized structure
- `templates/subagents/generic/test-writer.md` — Standardized structure
- `CHANGELOG.md` — This entry

---

## Version 1.3.0 - Ideation & Idea-to-PDB Support (February 2026)

### Summary

Added first-class support for net-new idea exploration and Product Design Blueprint (PDB) generation. Previously, Path A (greenfield) told users to "create a PDB first" but provided no tooling or guidance for that step. This release closes the gap with a dedicated guide and a new ideation subagent.

### New Content

1. **Idea to PDB Guide** (`docs/IDEA_TO_PDB.md`)
   - Complete workflow for going from a raw idea to a structured PDB
   - Covers idea exploration, PDB generation (lightweight and deep-dive), and integration with the template's task system
   - PDB quality checklist for validating output before implementation
   - Relationship map showing how ideation connects to ingestion, task files, and implementation agents

2. **Idea-to-PDB Agent** (`templates/subagents/ideation/idea-to-pdb.md`)
   - New subagent category: `ideation/`
   - Guides users from a one-paragraph idea to a structured PDB inside Cursor
   - Two-phase workflow: Idea Exploration (divergent) then PDB Generation (convergent)
   - Supports lightweight (MVP-focused) and deep-dive (comprehensive) depth modes
   - Session kickoff questions, approval checkpoints, and assumption labeling
   - Optional epic/feature/task outline output compatible with `tasks/*.yml` schema
   - Output saved to `docs/product_design/{{PROJECT_NAME}}_pdb.md`

### Enhancements

3. **SETUP_GUIDE.md** - Path A updated
   - Path A now references the Idea to PDB Guide and `@idea-to-pdb` agent
   - Added `Idea-to-PDB` to recommended agents for greenfield projects
   - Quick Decision Matrix updated with link to guide

4. **README.md** - Ideation support documented
   - Added "Special Capabilities for New Ideas" section
   - Added `ideation/` folder to file structure tree
   - Added `docs/IDEA_TO_PDB.md` to docs tree and documentation links

5. **Ingestion README** (`templates/subagents/ingestion/README.md`)
   - Added cross-reference to ideation agents for Path A users who land on ingestion docs

### New Files

- `docs/IDEA_TO_PDB.md`
- `templates/subagents/ideation/idea-to-pdb.md`

### Updated Files

- `SETUP_GUIDE.md` - Path A setup flow and decision matrix
- `README.md` - Key features, file structure, documentation links
- `CHANGELOG.md` - This entry
- `templates/subagents/ingestion/README.md` - Cross-reference to ideation

### Breaking Changes

None. All additions are backwards compatible.

---

## Version 1.2.0 - Feedback-Driven Improvements (February 2026)

### Summary

Improvements driven by real-world feedback from the Symposium project (see `feedback/symposium.md`). Focused on usability, onboarding, and gaps identified through production use of the template.

### New Content

1. **Task Lifecycle Example** (`templates/workflow/TASK_LIFECYCLE_EXAMPLE.md`)
   - End-to-end walkthrough of a task from `todo` to `done`
   - Shows handoff notes, status transitions, QA feedback loop, and final acceptance
   - Includes mermaid sequence diagram

2. **Memory System Templates** (`templates/memory/`)
   - Three-tier memory model: working, episodic, semantic
   - `README.md` with setup instructions and when-to-adopt guidance
   - `working-memory-example.md` -- sample session context file
   - `semantic-memory-example.md` -- sample validated patterns file

3. **Feedback System** (`feedback/`)
   - `README.md`, `TEMPLATE.md`, and `PASTE_IN_PROMPT.md` for collecting project feedback
   - First feedback entry: `symposium.md`

### Enhancements

4. **Minimal vs. Full Setup Guide** (in `docs/CUSTOMIZATION_GUIDE.md`)
   - Three-tier table: Minimal / Standard / Full with agent and subagent recommendations
   - Guidance on which components to skip for smaller projects

5. **Customization Checklist** (in `docs/CUSTOMIZATION_GUIDE.md`)
   - "Always replace" / "Always keep" / "Customize to fit" categories
   - Helps adopters know what to change vs. preserve

6. **Cursor Profiles Pattern** (in `docs/CUSTOMIZATION_GUIDE.md`)
   - Documents the optional `.cursor/` profile pattern for domain-focused sessions
   - Originated from Symposium feedback

7. **Agent Invocation in Practice** (in `templates/workflow/MULTI_AGENT_WORKFLOW.md`)
   - How to invoke agent roles in Cursor sessions
   - When to switch roles and how to use explicit prompts
   - Optional agent-router pattern for larger projects

8. **Session Checklist** (in all `.cursorrules` templates)
   - Global checklist added before "Tips for AI Agents" section
   - Base version + project-type-specific items (web, backend, full-stack, mobile)

9. **`backlog_ref` Field** (in `templates/tasks/TASK_SCHEMA_GUIDE.md` and `feature-task-template.yml`)
   - Optional field linking tasks to portfolio-level backlog items or milestones
   - Documented format and conventions

### Updated Files

- `templates/tasks/TASK_SCHEMA_GUIDE.md` -- added `backlog_ref` field and documentation
- `templates/tasks/feature-task-template.yml` -- added commented `backlog_ref` field
- `templates/workflow/MULTI_AGENT_WORKFLOW.md` -- added Agent Invocation section and lifecycle example link
- `templates/cursorrules/base-template.cursorrules` -- added Session Checklist
- `templates/cursorrules/web-app.cursorrules` -- added Session Checklist
- `templates/cursorrules/backend-service.cursorrules` -- added Session Checklist
- `templates/cursorrules/full-stack.cursorrules` -- added Session Checklist
- `templates/cursorrules/mobile-app.cursorrules` -- added Session Checklist
- `docs/CUSTOMIZATION_GUIDE.md` -- added Minimal vs. Full Setup, Customization Checklist, Cursor Profiles, memory link
- `README.md` -- added links to new content

### New Files

- `templates/workflow/TASK_LIFECYCLE_EXAMPLE.md`
- `templates/memory/README.md`
- `templates/memory/working-memory-example.md`
- `templates/memory/semantic-memory-example.md`
- `feedback/README.md`
- `feedback/TEMPLATE.md`
- `feedback/PASTE_IN_PROMPT.md`
- `feedback/symposium.md`

### Breaking Changes

None. All additions are backwards compatible.

---

## Version 1.1.0 - Project Maturity & Ingestion Support (January 2026)

### 🎯 Major Features Added

#### 1. Project Maturity Decision Paths

Added comprehensive decision framework for projects at different maturity levels:

- **Path A**: Net New Project (Greenfield) - Starting from scratch
- **Path B**: New Project with Design Docs - Have PDB, minimal code
- **Path C**: Existing Codebase with PDB - Mature, documented projects
- **Path D**: Existing Codebase - Documented (No PDB) - Has docs but no formal design
- **Path E**: Existing Codebase - Undocumented - Legacy/minimal documentation
- **Path F**: MVP/Prototype Import - Code from Replit, Bolt, V0, etc.

**Impact**: Template now supports ANY project state, not just greenfield projects.

#### 2. Ingestion & Modernization Layer

Added three specialized agents for reverse-engineering documentation from existing code:

**New Agents**:
1. **Codebase Auditor** (`templates/subagents/ingestion/codebase-auditor.md`)
   - Analyzes code structure and builds Codebase Knowledge Graph
   - Extracts architecture patterns, data models, APIs, dependencies
   - Performs preliminary security audit
   - Documents infrastructure and testing setup
   - Output: `docs/architecture/codebase_knowledge_graph.md`

2. **Gap Analysis** (`templates/subagents/ingestion/gap-analysis.md`)
   - Identifies security vulnerabilities (hardcoded secrets, missing auth)
   - Documents infrastructure gaps (no CI/CD, monitoring, backups)
   - Assesses test coverage and code quality
   - Creates prioritized modernization roadmap with severity levels
   - Output: `docs/architecture/gap_analysis_report.md`

3. **Documentation Backfill** (`templates/subagents/ingestion/documentation-backfill.md`)
   - Generates Product Design Blueprint (PDB) from existing code
   - Creates Technical Architecture Document (TAD) from code patterns
   - Marks inferences with confidence levels
   - Includes validation checklists for human review
   - Output: `docs/product_design/generated_pdb.md` + `docs/architecture/technical_architecture.md`

**Use Cases**:
- Import MVPs from rapid prototyping tools (Replit, Bolt, V0)
- Modernize legacy systems with missing documentation
- Add multi-agent system to existing projects without PDB
- Audit code for production readiness

#### 3. Enhanced Documentation

**PROJECT_QUESTIONNAIRE.md**:
- Added "Project Maturity & Documentation" section (Part 1B)
- Added codebase status questions (Net New / With PDB / Documented / Undocumented / MVP Import)
- Added questions about code origin and readiness blockers

**SETUP_GUIDE.md**:
- Added comprehensive "Project Maturity Decision Path" section with 6 paths
- Added "Quick Decision Matrix" table for easy path selection
- Added complete "Ingestion & Modernization Setup" section with:
  - Path D workflow (Documented, No PDB) - 1-3 days
  - Path E workflow (Undocumented) - 3-7 days
  - Path F workflow (MVP/Prototype Import) - 1-2 weeks
  - Detailed ingestion agent setup instructions
  - Post-ingestion workflow guidance

**README.md**:
- Updated Key Features to highlight project maturity support
- Added "Special Capabilities for Existing Projects" section
- Updated installation guidance for standalone use

**FAQ.md**:
- Added "Ingestion & Modernization Questions" section with 6 new Q&As:
  - What if I have existing code but no documentation?
  - Can this work with code from Replit, Bolt, or V0?
  - What's the difference between Codebase Auditor and Gap Analysis?
  - How accurate is auto-generated documentation?
  - Do I need ingestion agents for greenfield projects?
  - Can I run ingestion agents periodically?

**New Documentation**:
- `templates/subagents/ingestion/README.md` - Complete guide for using ingestion agents

### 📦 New Template Files

```
templates/subagents/ingestion/
├── README.md                           # Usage guide for ingestion agents
├── codebase-auditor.md                # Codebase analysis agent (796 lines)
├── gap-analysis.md                    # Production-readiness gap analysis
└── documentation-backfill.md          # PDB/TAD generation from code
```

### 🔄 Updated Template Files

- `PROJECT_QUESTIONNAIRE.md` - Added Part 1B: Project Maturity & Documentation
- `SETUP_GUIDE.md` - Added decision paths and ingestion workflows (~250 lines added)
- `README.md` - Updated features and capabilities
- `docs/FAQ.md` - Added ingestion Q&A section

### 💡 Key Improvements

1. **Universal Applicability**: Template now works for ANY project state, not just new projects
2. **MVP-to-Production Path**: Clear roadmap for hardening rapid prototypes
3. **Legacy System Support**: Systematic approach for modernizing undocumented codebases
4. **Documentation Generation**: AI-assisted reverse-engineering of design docs from code
5. **Security Focus**: Explicit security gap identification for existing code
6. **Validation Framework**: Built-in checklists ensure human review of AI-generated docs

### 🎯 Use Case Examples

**Before v1.1.0**:
- Could only use template for greenfield projects or well-documented existing projects
- No guidance for MVP imports or legacy code
- No tools for generating missing documentation

**After v1.1.0**:
- Import Replit/Bolt/V0 MVPs and get production roadmap
- Onboard legacy systems with comprehensive audit and gap analysis
- Generate PDB and TAD from any existing codebase
- Systematic modernization path with security prioritization

### 📊 Documentation Stats

- **Lines Added**: ~2,500+ across all documentation files
- **New Agent Templates**: 3 (Codebase Auditor, Gap Analysis, Documentation Backfill)
- **Decision Paths**: 6 (A-F) covering all project maturity levels
- **FAQ Additions**: 6 new questions in Ingestion & Modernization section

### 🚀 Breaking Changes

None. All additions are backwards compatible. Existing users can continue using Paths A, B, or C without changes.

### 🔮 Future Enhancements

Potential areas for expansion:
- Infrastructure-specific agents for cloud platforms (AWS, GCP, Azure)
- Database migration agents for schema evolution
- Performance profiling agents
- Automated modernization scripts
- CI/CD pipeline generation agents

---

## Version 1.0.0 - Initial Release (January 2026)

### Initial Features

- Universal templates for mobile, web, backend, and full-stack projects
- `.cursorrules` templates for 5 project types
- `AGENTS.md` templates for 5 project types
- Task schema templates (tasks.yml, feature templates, schema guide)
- Workflow documentation templates
- Generic subagent configs (6 agents)
- Specialist subagent configs (3 specialists)
- Complete documentation (Setup Guide, Questionnaire, FAQ, Troubleshooting)
- Example projects (4 complete examples)

---

**Maintained By**: Development Team
**License**: Open for use across projects
**Last Updated**: January 29, 2026
