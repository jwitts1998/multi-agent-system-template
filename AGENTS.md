# Multi-Agent Development Guide

## Overview

This document defines specialized development agents for this project. Agents are perspectives you adopt when working on tasks — each has distinct responsibilities and quality standards.

**Status**: This is the generic starter version. Run `./setup.sh` to generate a project-specific version with your tech stack and architecture details.

---

## Agent Roles

### Implementation Agent
**Primary Role**: Core development and implementation specialist

**Responsibilities**:
- Write production-ready code following architecture patterns
- Implement features according to specifications
- Follow conventions defined in `.cursorrules`
- Create and maintain services, business logic, and data models
- Handle error cases and edge cases

**When to Use**: Feature implementation, bug fixes, refactoring, architecture decisions

**Checklist**:
- [ ] Architecture pattern followed
- [ ] Code follows style guidelines from `.cursorrules`
- [ ] Error handling and edge cases covered
- [ ] No hardcoded secrets or API keys
- [ ] Acceptance criteria met

---

### Quality Assurance Agent
**Primary Role**: Code review and quality enforcement specialist

**Responsibilities**:
- Review code for style, maintainability, and architecture compliance
- Check for security patterns and vulnerabilities
- Validate error handling and edge cases
- Ensure tests cover main functionality
- Verify documentation is updated

**When to Use**: After implementation, before merging, regular quality audits, security reviews

**Checklist**:
- [ ] Code quality meets standards
- [ ] Security best practices followed
- [ ] Architecture patterns adhered to
- [ ] No code duplication or anti-patterns
- [ ] Performance considerations addressed
- [ ] Documentation adequate

---

### Testing Agent
**Primary Role**: Test coverage and QA automation specialist

**Responsibilities**:
- Write unit tests for business logic
- Create integration tests for features
- Ensure test coverage meets project standards
- Create test data and mocks
- Review code for testability

**When to Use**: Test creation, coverage validation, bug reproduction, regression testing

**Checklist**:
- [ ] Unit tests for business logic
- [ ] Integration tests for features
- [ ] Tests are fast, deterministic, and reliable
- [ ] Edge cases and error scenarios tested
- [ ] Tests follow existing patterns

---

### Documentation Agent
**Primary Role**: Documentation generation and maintenance specialist

**Responsibilities**:
- Create inline code documentation
- Generate markdown documentation in `docs/`
- Document APIs and schemas
- Create usage examples
- Keep documentation current with code changes

**When to Use**: Documenting new features, creating API docs, after significant code changes

**Checklist**:
- [ ] Public functions/classes documented
- [ ] Feature documented in `docs/` if significant
- [ ] API documentation updated (if applicable)
- [ ] Examples provided for complex functionality

---

## Agent Collaboration Patterns

### Sequential Feature Implementation (Recommended)
1. **Implementation Agent** — implements feature
2. **Quality Assurance Agent** — reviews code quality
3. **Testing Agent** — creates tests
4. **Documentation Agent** — adds documentation

### Parallel Independent Work
- Multiple Implementation Agents on independent features
- Testing Agent on previously completed features

### Single-Agent Specialized Work
- One agent handles entire task (no handoff needed)

---

## Task Integration

Tasks in `tasks/*.yml` include an `agent_roles` field:

```yaml
- id: FEATURE_T1_example
  title: "Implement example feature"
  agent_roles: [implementation, quality_assurance, testing]
  spec_refs:
    - "PDB: docs/product_design/app_pdb.md — Section 3"
  acceptance_criteria:
    - "Feature works as specified"
    - "Tests cover main scenarios"
```

### Agent Role Values
- `implementation` — Implementation Agent
- `quality_assurance` — Quality Assurance Agent
- `testing` — Testing Agent
- `documentation` — Documentation Agent

---

## Handoff Protocol

When multiple agents work on the same task:

1. **First Agent**: Complete work, add notes: "Implementation complete. Ready for QA."
2. **Next Agent**: Review previous work, complete their portion, add notes
3. **Final Agent**: Validate all acceptance criteria, propose `status: done`

---

## Using Cursor Plugins and Skills

Installed Cursor plugins provide **agent skills** and **MCP tools** that any agent can use when relevant to a task. Prefer these over manual approaches when they apply.

**Role-specific guidance**:
- **Implementation Agent**: Use workflow skills (brainstorming, writing-plans, TDD) when starting features. Use Context7 or docs-lookup for library API reference. Use Figma skills when implementing from designs.
- **Quality Assurance Agent**: Use code-review workflow skills for structured reviews. Use BrowserStack for cross-browser and accessibility testing. Use verification-before-completion before signing off.
- **Testing Agent**: Use BrowserStack Automate / App Automate for cross-platform test runs. Use Percy for visual regression testing. Use systematic-debugging when investigating test failures.
- **Documentation Agent**: Use Context7 docs-lookup for accurate library references. Use web search for current best practices. Use continual-learning to surface recurring patterns from past sessions.

See `docs/CURSOR_PLUGINS.md` for the complete list of available capabilities.

---

## Getting Started

1. **Select a task**: Open `tasks/*.yml`, find `status: todo` with `priority: high`
2. **Check agent_roles**: Adopt the appropriate role
3. **Read context**: Review `spec_refs`, `description`, `acceptance_criteria`
4. **Work**: Follow role-specific responsibilities
5. **Update**: Propose status change when complete
