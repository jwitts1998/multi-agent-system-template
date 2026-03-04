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

### Cursor Plugins and Skills

Agents have access to **agent skills** and **MCP tools** provided by installed Claude Code skills. Use them when relevant — for example, web search for research, Context7 for library docs, BrowserStack for cross-browser testing, Figma skills for design-to-code, and workflow skills for structured plans and code review.

**Permissions**: Agents may leverage existing skills and create new ones at any time. Use `/skill-name` when a task would benefit. Use the `create-skill` workflow to author project-specific skills. Update `docs/CLAUDE_CODE_CAPABILITIES.md` after adding capabilities.

**Antigravity Awesome Skills**: If installed (`./scripts/install-antigravity-skills.sh`), 946+ skills are in `.claude/skills/`. Project config agents can run the install script during setup or when requested. See `docs/CLAUDE_CODE_CAPABILITIES.md`.

See `docs/CLAUDE_CODE_CAPABILITIES.md` for the full list of available capabilities.

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
