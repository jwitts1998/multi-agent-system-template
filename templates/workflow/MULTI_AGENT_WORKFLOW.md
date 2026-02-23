# Multi-Agent Development Workflow

**Date**: January 2026  
**Status**: Active

## 🎯 Purpose

This document describes how specialized development agents collaborate to implement features efficiently while maintaining code quality and consistency.

---

## 🤖 Agent Roles Summary

See `AGENTS.md` for detailed agent responsibilities. Common roles:

- **Implementation Agent**: Business logic, services, core functionality
- **UI/UX Agent** (Frontend): Design system, accessibility, user experience
- **Quality Assurance Agent**: Code review, security, architecture compliance
- **Testing Agent**: Test coverage, QA automation
- **Documentation Agent**: Code docs, architecture docs, API docs

---

## 🔄 Workflow Patterns

### Pattern 1: Sequential Feature Implementation (Recommended)

**Use Case**: New feature with complete development lifecycle

**Workflow**:
1. **{{FIRST_AGENT}}** → Initial implementation or design
2. **{{SECOND_AGENT}}** → Review or build upon first agent's work
3. **Testing Agent** → Write comprehensive tests
4. **Documentation Agent** → Add documentation

**Example Task**:
```yaml
- id: FEATURE_T1_user_profile
  title: "Implement user profile feature"
  agent_roles: [{{AGENT_ROLE_1}}, {{AGENT_ROLE_2}}, testing, documentation]
  description: >
    Full feature: {{WORKFLOW_DESCRIPTION}}
```

### Pattern 2: Parallel Independent Work

**Use Case**: Independent tasks that don't block each other

**Workflow**:
- **Agent A** → Works on feature/task A
- **Agent B** → Works on feature/task B simultaneously
- **Agent C** → Works on feature/task C simultaneously

### Pattern 3: Review-Based Collaboration

**Use Case**: Implementation followed by multi-perspective review

**Workflow**:
1. **Implementation Agent** → Implements feature
2. **Quality Assurance Agent** → Reviews code quality
3. **Testing Agent** → Reviews test coverage and creates missing tests
4. **Documentation Agent** → Reviews and updates documentation

---

## 📋 Task Selection Process

1. **Open relevant task file**: `tasks/*.yml` for the feature
2. **Find a task**: Look for `status: todo` with `priority: high`
3. **Check agent_roles**: Verify your agent type matches
4. **Read context**: Review `spec_refs`, `description`, `acceptance_criteria`
5. **Check dependencies**: Ensure `blocked_by` tasks are complete
6. **Propose status change**: Suggest `status: in_progress` before starting
7. **Work on task**: Follow agent-specific responsibilities
8. **Update task**: Propose `status: done` when acceptance criteria are met

---

## 🤝 Agent Handoff Protocol

When multiple agents work on the same task:

1. **First Agent**:
   - Complete their portion
   - Update task notes: "{{AGENT_NAME}}: {{WORK_COMPLETED}}. Ready for {{NEXT_AGENT}}."
   - Propose status update if appropriate

2. **Subsequent Agents**:
   - Review previous work
   - Complete their portion
   - Update task with progress
   - Hand off to next agent or mark complete

3. **Final Agent**:
   - Validate all acceptance criteria
   - Ensure all previous work is integrated
   - Propose `status: done`

---

## 🎙️ Agent Invocation in Practice

In a typical Cursor (or other AI assistant) session, you are always talking to a single AI assistant. Agent "roles" are not separate processes -- they are perspectives enforced by context files (`.cursorrules`, `AGENTS.md`, task `agent_roles`).

### How to Invoke a Specific Agent Role

Reference the role explicitly in your prompt:

- "Act as the **Testing Agent** and review the test coverage for this feature."
- "As the **Documentation Agent**, update the API docs for the new endpoint."
- "Switch to the **Quality Assurance Agent** perspective and review this PR."

The AI will adopt that role's responsibilities and checklist from `AGENTS.md`.

### When to Switch Roles

Follow the handoff protocol above. After completing your portion of a task:

1. Add handoff notes to the task (e.g., "Implementation: endpoint created. Ready for Testing Agent.")
2. In your next prompt, invoke the next agent role explicitly.
3. The AI will review the previous work through the new role's lens.

### Projects with a Coordination Layer

For larger projects, you may add an **agent-router** that acts as a single entry point. The router triages intent and delegates to the appropriate agent role. To use this pattern:

- Create a router subagent (e.g., `.cursor/agents/system/agent-router.md`) with a delegation matrix mapping keywords/intents to agent roles.
- Invoke the router with "Route this to the right agent" or use a convention like "@agent-router" in your prompt.
- The router will suggest which agent role should handle the request.

This is optional and most useful for teams with many agents and complex workflows. See the "Full Setup" tier in the [Customization Guide](../../docs/CUSTOMIZATION_GUIDE.md) for more details.

---

## Agent Interoperability Protocols

When agents need to access external tools or communicate with agents built on different frameworks, use these open standards.

### MCP (Model Context Protocol)

**Standard for tool discovery and calling.**

MCP defines how agents discover and invoke tools exposed by servers. Python SDK (21.8k stars), TypeScript SDK (11.7k stars). Already integrated into this template system via Cursor plugins.

For your own project, expose project-specific tools as MCP servers so any MCP-compatible agent or IDE can use them:

1. Define tools as functions with typed parameters
2. Wrap them in an MCP server (stdio or HTTP transport)
3. Register the server in agent configuration
4. Agents discover and call tools through the MCP protocol

Use MCP when: agents need to access project-specific tools, APIs, databases, or file systems through a standardized interface.

### A2A (Agent2Agent Protocol)

**Standard for cross-framework agent communication.**

[google/A2A](https://github.com/google/A2A) -- Apache-2.0, 21.9k stars. Donated to the Linux Foundation by Google. Python, TypeScript, and Java SDKs.

A2A enables agents built with different frameworks (LangGraph, CrewAI, custom) to collaborate on tasks:

- **Agent Cards**: JSON descriptors that advertise an agent's capabilities, input/output formats, and endpoint URL
- **Task lifecycle**: Agents send task requests and receive results (or stream partial results via SSE)
- **Transport**: JSON-RPC 2.0 over HTTP(S), supporting synchronous, streaming, and asynchronous push notification modes

Use A2A when: agents built with different frameworks or running in different services need to delegate tasks to each other. For example, a LangGraph orchestrator delegating a code review subtask to a CrewAI-based QA agent running as a separate service.

### MCP vs A2A

| Concern | Use MCP | Use A2A |
|---------|---------|---------|
| Agent needs to call a tool or API | Yes | No |
| Agent needs to delegate a task to another agent | No | Yes |
| Agents are in the same process/framework | MCP for tools | Not needed |
| Agents are in different services/frameworks | MCP for tools | A2A for delegation |

Both protocols are complementary. A project may use MCP for tool access and A2A for inter-agent task delegation simultaneously.

See `docs/research/agent_runtime_tooling_landscape.md` Section 6 for full evaluation of interoperability protocols.

---

## ✅ Quality Assurance

### Agent-Specific Checklists

See `AGENTS.md` for complete checklists. Key items:

**Implementation Agent**:
- [ ] Architecture pattern followed
- [ ] Code follows style guidelines
- [ ] Error handling and edge cases covered
- [ ] No hardcoded secrets

**UI/UX Agent** (if applicable):
- [ ] Design system tokens used
- [ ] Responsive design implemented
- [ ] Accessibility requirements met
- [ ] Visual consistency maintained

**Quality Assurance Agent**:
- [ ] Code quality meets standards
- [ ] Security best practices followed
- [ ] Architecture patterns adhered to
- [ ] Performance considerations addressed

**Testing Agent**:
- [ ] Unit tests for business logic
- [ ] Integration tests for features
- [ ] Tests are fast and deterministic
- [ ] Coverage meets target ({{TEST_COVERAGE_TARGET}}%)

**Documentation Agent**:
- [ ] Code documentation present
- [ ] Feature documented in `docs/`
- [ ] API documentation updated (if applicable)
- [ ] Examples provided

---

## 💡 Best Practices

### Do's ✅

1. Start with context (read task file, spec_refs, related docs)
2. Propose status changes rather than silently applying
3. Document decisions in task notes or documentation
4. Follow existing patterns in codebase
5. Coordinate through task comments when multiple agents involved

### Don'ts ❌

1. Don't skip reading context before starting
2. Don't mark tasks complete without meeting all acceptance criteria
3. Don't ignore agent_roles assignments
4. Don't work on blocked tasks
5. Don't bypass quality checks

---

## 🔗 Related Documentation

- **AGENTS.md**: Detailed agent role definitions
- **.cursorrules**: Architecture and code standards
- **TASK_SCHEMA_GUIDE.md**: Task file schema documentation
- **[TASK_LIFECYCLE_EXAMPLE.md](./TASK_LIFECYCLE_EXAMPLE.md)**: End-to-end walkthrough of a task from `todo` to `done` with handoff notes

---

**Last Updated**: {{DATE}}
