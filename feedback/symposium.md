# Template Feedback

## Project Info

- **Project name**: Symposium
- **Project type**: Backend / data platform (multi-vertical analytics for alternative/collectible assets: Art, Comics, Wine; GCP, Python, Terraform, BigQuery, Cloud Functions/Run/Workflows)
- **Template version or date used**: Unknown (adopted circa January 2026 per doc dates)

## Template Components Used

Which parts of the template were applied? Check all that apply.

- [x] `.cursorrules`
- [x] `AGENTS.md`
- [x] Task schema / task files
- [x] Workflow docs (multi-agent workflow, development workflow)
- [x] Subagents — generic (code-reviewer, debugger, designer, etc.)
- [x] Subagents — specialists (terraform, dataform, langgraph; plus ml-data-science, iac-agent)
- [x] Ingestion agents (codebase-auditor, gap-analysis, documentation-backfill)
- [x] Other: Coordination layer (agent-router, system agents), tiered memory (working/episodic/semantic), `docs/platform/TASK_SCHEMA.md`, project-specific Cursor profiles (`.cursor/analytics_profile.json`, `.cursor/christies_profile.json`), `.cursor/tasks.yml` for common commands

## How the Template Was Used

**Setup approach**: The template was heavily customized for a GCP/data-platform context. `.cursorrules` was extended with Symposium-specific sections: project overview, platform vs. vendor architecture, medallion (Bronze/Silver/Gold) patterns, security/secrets, documentation hygiene, and a full **task tracking system** (Section 7) and **multi-agent system** (Section 9) that reference `AGENTS.md`, task files, workflow patterns, subagent configs, and handoff protocol. Context rules include `docs/**`, `infra/**`, `src/**`, `.cursor/**` and exclude `node_modules`, `venv`, `archive`.

**Agent roles**: Six domain roles were defined in `AGENTS.md`—Implementation, Data Quality, Infrastructure, Quality Assurance, Testing, Documentation—each with responsibilities, "When to Use," knowledge areas, role-specific checklists, and special instructions tied to `.cursorrules` and vendor docs (e.g., Christie's as canonical example). These map to `agent_roles` in task YAML (e.g., `implementation`, `data_quality`, `infrastructure`, `testing`, `documentation`).

**Task system**: A two-level system is documented: portfolio level (`docs/backlog.md`) and feature level (`tasks/*.yml`). The project adopted a formal task schema in `docs/platform/TASK_SCHEMA.md` (epic/feature/context/defaults/tasks, task fields including `id`, `title`, `type`, `status`, `priority`, `spec_refs`, `description`, `code_areas`, `acceptance_criteria`, `tests`, `blocked_by`, `blocks`) and uses five task files (e.g., `00_phase0_build_prep.yml`, `01_phase1_foundation.yml`, `02_comics_vertical_ingestion.yml`). Tasks use IDs like `E02_T1_define_comics_schema`, `E02_T2_implement_gocollect_connector`, with `agent_roles` and `spec_refs` to PDB and docs. Schema-first rule is explicit: data/API schemas before implementation.

**Workflow docs**: `docs/workflow/MULTI_AGENT_WORKFLOW.md` and `docs/workflow/DEVELOPMENT_WORKFLOW.md` describe the coordination layer (agent router), agent roles summary, four workflow patterns (Sequential Feature Implementation, Parallel Independent Work, Infrastructure-First, Schema-First), task selection process, and handoff protocol—aligned with `AGENTS.md`.

**Subagents**: Generic and specialist subagents are under `.cursor/agents/`: `generic/` (code-reviewer, test-writer, debugger, security-auditor, doc-generator, performance-optimizer, designer, feature-designer), `specialists/` (terraform-specialist, dataform-specialist, langgraph-specialist, ml-data-science), `ingestion/` (codebase-auditor, gap-analysis, documentation-backfill). System agents under `.cursor/agents/system/` include agent-router, query-enrichment, requirements-agent, task-orchestrator, qa-verification, security-agent, scalability-optimizer, sso-veto, logging-observability, meta-optimizer, doc-curator, iac-agent. Each subagent is a markdown file with frontmatter (`name`, `description`), technology context, and checklists or patterns (e.g., code-reviewer's security/architecture checklist; terraform-specialist's directory structure and HCL snippets).

**Coordination and memory**: The agent-router is the single entry point; it triages intent and delegates using a layer matrix (Layer 1: query-enrichment, designer, feature-designer, requirements-agent; Layer 2: implementation, code-reviewer, test-writer; Layer 3: security-agent, scalability-optimizer, sso-veto; Layer 4: iac-agent, logging-observability, doc-curator, meta-optimizer). Schema-first and medallion enforcement are explicit in the router. A tiered memory system is documented in `docs/memory/README.md` (working / episodic / semantic) with governance in `docs/memory/SYSTEM_GOVERNANCE.md`.

**Agents used most**: Implementation, Data Quality, Infrastructure, and Testing appear most in task `agent_roles`; code-reviewer and specialist subagents (e.g., terraform-specialist) are referenced in the router and checklists.

## What Worked Well

- **Single source of truth for agent roles**: `AGENTS.md` plus the "Multi-agent development system" section in `.cursorrules` (Section 9) give a clear list of roles and subagent names. New contributors and AI sessions can quickly see which role does what and where to look (e.g., "Data Quality Agent → `data_model_specs.md`").
- **Task–agent binding**: Putting `agent_roles` on each task (e.g., `E02_T2_implement_gocollect_connector` with `implementation`, `data_quality`, `infrastructure`, `testing`) makes it obvious which agents are responsible and supports sequential/parallel patterns described in the workflow docs.
- **Formal task schema**: `docs/platform/TASK_SCHEMA.md` defines epic/task structure, field semantics, task ID conventions, spec refs format, schema-first rule, and status management. That reduces ambiguity when creating or updating `tasks/*.yml` and keeps task files consistent across epics.
- **Schema-first and medallion in one place**: Both `.cursorrules` and the agent-router (and SYSTEM_GOVERNANCE) repeat the same rules (schema docs first, Bronze→Silver→Gold, audit fields). That redundancy reinforces behavior and makes it easy to enforce in handoffs.
- **Role-specific checklists**: Each agent in `AGENTS.md` has a concrete checklist (e.g., Data Quality: "Schema matches data_model_specs.md", "Audit fields present"; Infrastructure: "Terraform follows project conventions", "Secrets in Secret Manager"). The code-reviewer subagent extends this with a detailed review checklist (security, architecture, performance). These are actionable and easy to follow.
- **Subagent markdown format**: Short frontmatter plus sections (context, when to use, checklist or patterns) keeps subagents scannable and editable without touching code.
- **Workflow patterns as named recipes**: "Sequential Feature Implementation," "Schema-First," "Infrastructure-First," and "Parallel Independent Work" in both `AGENTS.md` and `MULTI_AGENT_WORKFLOW.md` give a clear playbook for how to chain agents on a task.
- **Router delegation matrix**: The agent-router's table (keyword → intent → first agent) and layer breakdown make routing predictable and documentable.

## Pain Points or Gaps

- **Task schema doesn't document `agent_roles`**: `docs/platform/TASK_SCHEMA.md` defines many task fields but does not list `agent_roles`. The project uses `agent_roles` throughout task files and it's described in `AGENTS.md` and `DEVELOPMENT_WORKFLOW.md`. New maintainers or tooling that rely only on TASK_SCHEMA.md could miss this field or its allowed values.
- **Router vs. "primary assistant"**: The router is described as the single entry point and delegates to "implementation (primary assistant)" and others. It's not always clear in a Cursor session whether the user is talking to "the router" or "the implementation agent," or how to explicitly invoke the router vs. a specific agent. A short "how to invoke" or "who am I talking to?" note in the template could help.
- **Handoff protocol is manual**: Handoff is described as "update task with notes" and "propose status update." There's no automated handoff or shared state (e.g., a single handoff file or convention for "ready for X agent"). In practice, handoffs rely on humans or the same AI session reading the task file and notes.
- **Memory system usage**: Working/episodic/semantic tiers and SYSTEM_GOVERNANCE are documented, but there are no examples of what a "session log" or "validated pattern" looks like in `docs/memory/`. Template examples or a sample working-memory file would make the memory system easier to adopt.
- **Many system agents**: The system layer has many agents (router, query-enrichment, requirements-agent, task-orchestrator, qa-verification, security-agent, scalability-optimizer, sso-veto, logging-observability, meta-optimizer, doc-curator, iac-agent). For a smaller team or simpler pipeline, this can feel heavy; a "minimal" vs. "full" setup guide would help.
- **No explicit link from tasks to backlog**: TASK_SCHEMA.md says backlog items "may reference epic task files" and task files "reference backlog items in spec_refs when relevant," but there's no standard field (e.g., `backlog_id`) or example of a backlog entry that points to a specific task file or task ID. The relationship is described but not formalized in the schema.

## Suggested Improvements

- **Document `agent_roles` in the task schema**: Add an optional `agent_roles` field to TASK_SCHEMA.md with allowed values (`implementation`, `data_quality`, `infrastructure`, `quality_assurance`, `testing`, `documentation`) and a one-line description (e.g., "Agents that should work on this task; used for handoff and workflow patterns"). Optionally reference `AGENTS.md` for definitions.
- **Provide a minimal agent set**: In the template, add a "Minimal setup" section: e.g., router + implementation + code-reviewer + one specialist (e.g., terraform). Document which system agents can be skipped or merged for smaller projects.
- **Add memory examples**: In the template's `docs/memory/` (or a template `feedback/` or `examples/`), add one sample working-memory file (e.g., session summary + delegation log) and one semantic-memory snippet (e.g., "Always use Secret Manager for API keys") so adopters see the expected format and level of detail.
- **Clarify "who is responding"**: Add a short subsection to the router or to the template's "Getting started": e.g., "In a typical Cursor chat, you are talking to the primary assistant; mention 'route this' or 'hand off to data quality' to trigger router-style delegation." Or suggest a convention (e.g., "@agent-router" or a rule) to explicitly invoke the router.
- **Optional backlog–task link**: In the task schema, add an optional field such as `backlog_ref: "BACKLOG-42"` or document a single standard `spec_ref` format for backlog items (e.g., `"Backlog: docs/backlog.md#milestone-2"`) so tooling or agents can resolve task ↔ backlog links consistently.
- **One end-to-end example**: Include a single end-to-end example in the template: one task from `todo` → `in_progress` → `done` with sample task notes, handoff messages, and which agents would touch it (e.g., "Implement GoCollect connector" with implementation → data_quality → infrastructure → testing → documentation). This would live in workflow docs or a template `examples/` folder.

## Additional Notes

- **Domain-specific customization is high**: Symposium's `.cursorrules` and agents are deeply tailored (medallion, GCP, Christie's as canonical vendor, schema-first, audit fields). The template's value was in providing the *structure* (roles, task schema, workflow patterns, subagent layout, router idea); the content was almost entirely project-specific. A "template customization checklist" (what to replace vs. what to keep) could help other projects adopt faster.
- **Cursor profiles**: The project uses `.cursor/analytics_profile.json` and `.cursor/christies_profile.json` for "instruction profiles" before big changes. These are referenced in `.cursorrules` but not part of the standard multi-agent template; they complement the agent system by focusing the main assistant on a vertical or concern. Worth mentioning in the template as an optional "profiles + agents" pattern.
- **Checklist in .cursorrules**: The root checklist (run commands from `.cursor/tasks.yml`, update INDEX_FOR_AI/backlog, verify tests, no secrets, agent_roles and schema-first) ties the task system and agent roles back to daily behavior. Keeping a short, global checklist in the template would help other projects get the same "always consider this" behavior.
