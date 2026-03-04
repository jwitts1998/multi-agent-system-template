# Multi-Agent Development System — Starter Rules

## Project Overview

This project uses a multi-agent development system. Specialized AI agents collaborate on implementation, design, testing, and quality assurance.

**Status**: This is a freshly cloned starter. Run `./setup.sh` to configure for your specific project, which will replace this file with project-specific rules.

---

## How This System Works

### Agent Roles

Agents are perspectives, not separate processes. When working on a task, adopt the role specified in the task's `agent_roles` field:

- **Implementation Agent**: Write production code, follow architecture patterns, handle business logic
- **Quality Assurance Agent**: Review code for quality, security, and architecture compliance
- **Testing Agent**: Write tests, ensure coverage, validate behavior
- **Documentation Agent**: Generate and maintain documentation

### Task-Driven Development

Work is organized through task files:

- **Portfolio-level**: `tasks.yml` — milestones and high-level goals
- **Feature-level**: `tasks/*.yml` — detailed implementation tasks with `spec_refs`, `agent_roles`, and `acceptance_criteria`

### Workflow

1. Select a task with `status: todo` (prefer `priority: high`)
2. Read `spec_refs`, `description`, and `acceptance_criteria`
3. Check `agent_roles` — adopt the appropriate role
4. Implement following project conventions
5. Verify all `acceptance_criteria` are met
6. Propose `status: done` when complete

---

## Key Directories

```
docs/product_design/    — Product Design Blueprint (PDB)
docs/architecture/      — Architecture documentation
tasks/                  — Feature task files (tasks/*.yml)
.claude/agents/         — Subagent configurations
```

---

## Standards (Generic — Will Be Replaced by setup.sh)

### Code Quality
- Functions: small, focused, < 50 lines
- Comments: explain "why", not "what"
- Follow DRY principle
- Follow existing patterns in the codebase

### Security
- Never commit API keys, tokens, or credentials
- Use environment variables for secrets
- Validate all user input
- Use parameterized queries

### Testing
- Write tests alongside implementation
- Test behavior, not implementation details
- Follow AAA pattern (Arrange, Act, Assert)

### Clarify Before Proceeding

Ask for additional details when more information would materially improve your output. Prefer asking over guessing when extra context would reduce ambiguity, wrong assumptions, or rework. When to ask: ambiguity in scope/format, missing critical details, domain context that would change your approach, or high cost of being wrong. When not to ask: answer is discoverable, reasonable low-risk defaults exist, user said to proceed, or task is well-specified.

---

## Available Agents

Subagent configs are in `templates/subagents/`. After running `./setup.sh`, they'll be copied to `.claude/agents/`. Invoke with `@agent-name`.

### Ideation (for new ideas)
- `idea-to-pdb subagent` — Explore an idea and generate a Product Design Blueprint
- `@context-to-pdb` — Transform stakeholder context into a PDB (skip blank-slate discovery)
- `pdb-to-tasks subagent` — Decompose a PDB into epics and task files

### Generic (for development)
- `@code-reviewer` — Code quality, security, architecture review
- `test-writer subagent` — Test creation and coverage
- `debugger subagent` — Error investigation and fixes
- `designer subagent` — UI/UX, design system, accessibility
- `doc-generator subagent` — Documentation creation and maintenance
- `@security-auditor` — Security scanning and hardening
- `performance-optimizer subagent` — Performance analysis and optimization

### Specialists (domain expertise)
- `@figma-specialist` — Figma-to-code implementation, Code Connect, design system rules

### Ingestion (for existing codebases)
- `@codebase-auditor` — Analyze existing code structure
- `@gap-analysis` — Identify production-readiness gaps
- `@documentation-backfill` — Generate PDB from existing code

### Claude Code MCP Capabilities

This system integrates **30 Model Context Protocol (MCP) servers** organized across 9 tiers, providing specialized capabilities for each workflow phase. All MCPs are configured in `.mcp.json` with detailed setup instructions in `docs/MCP_SETUP_GUIDE.md`.

**Essential MCPs** (start here):
- **Context7** — Real-time library documentation (eliminates hallucinations)
- **Sequential Thinking** — Multi-step reasoning for complex problems
- **Figma** — Design-to-code with structural metadata + Code Connect
- **GitHub** — Repository management, PR reviews, CI/CD intelligence
- **Filesystem** — Local file operations across projects

**UI/UX Creative Stack** (addresses AI's frontend weaknesses):
- **Figma MCP** — Structural design intelligence, responsive constraints
- **Shadcn Registry** — 50+ production-ready accessible components
- **21st.dev Magic** — Modern UI patterns and creative layouts
- **Context7** — Latest framework docs (Next.js 15, React 19, Tailwind 4)

**Codebase Intelligence** (deep repo understanding):
- **TNG.sh** — Framework-aware auditor (finds N+1 queries, dead code, side effects)
- **Codebase Checkup** — 10-phase autonomous audit with fix plan generation
- **Code Indexer** — Local code search with ripgrep (monorepo support)

**Security & Quality** (secure at inception):
- **Snyk** — Auto-scan and patch vulnerabilities with smart-apply rules
- **SonarQube** — Code quality analysis and technical debt tracking
- **Sentry** — Production error monitoring with closed-loop debugging
- **Datadog** — Performance metrics and observability

**Task Orchestration** (workflow management):
- **Cyanheads Workflows** — Declarative YAML-based multi-step workflows
- **Task Orchestrator** — SQLite-backed persistent state across sessions
- **Linear** — Issue tracking and sprint management
- **Notion** — PDB storage and documentation

**Backend & Deployment** (dynamic stack support):
- **Supabase** — Quick backend scaffolding (auth, database, storage)
- **E2B** — Secure cloud sandboxes for code execution
- **Vercel** — Frontend deployment and environment management
- **SQLite** — Local database prototyping

**Full MCP Configuration**: See `.mcp.json` for all 30 servers organized by tier.
**Setup Guide**: See `docs/MCP_SETUP_GUIDE.md` for installation, API keys, and usage examples.

**Agent Skills**: In addition to MCPs, agents can use Claude Code skills via `/skill-name`. Create project-specific skills with the `create-skill` workflow.

---

## Instruction Priority

When agent instructions conflict with each other or with user requests, apply this hierarchy:

1. **Security and correctness** — never skip auth checks, input validation, or secret management
2. **User's explicit preferences** — override template defaults and agent suggestions
3. **Task acceptance criteria** — the task file defines "done"
4. **`CLAUDE.md` standards** — project-level conventions
5. **Agent-specific guidance** — the invoked agent's process and checklist
6. **Template defaults** — when nothing else applies

---

## Session Checklist

Before completing any task, verify:

- [ ] Task file updated with status and notes
- [ ] Relevant documentation updated
- [ ] Tests pass
- [ ] No hardcoded secrets or credentials
- [ ] Agent handoff notes added (if task has multiple `agent_roles`)
- [ ] Acceptance criteria reviewed and met

---

**To configure for your project**: Run `./setup.sh` from the repo root.
