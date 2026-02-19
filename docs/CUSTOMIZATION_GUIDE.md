# Customization Guide

**Version**: 1.0.0  
**Last Updated**: January 2026

## 📖 Overview

This guide explains how to customize the multi-agent system templates for your specific project needs.

---

## 🎨 Customization Levels

### Level 1: Minimal (Variable Replacement Only)

Replace template variables with your project values.

**Time**: 15-30 minutes  
**Effort**: Low  
**When**: Standard project that fits templates well

### Level 2: Moderate (Adjust Templates)

Replace variables + modify sections to fit your architecture and patterns.

**Time**: 1-2 hours  
**Effort**: Medium  
**When**: Project with some unique patterns or requirements

### Level 3: Extensive (Heavily Customize)

Deep customization of all templates to match your specific needs.

**Time**: 3-4 hours  
**Effort**: High  
**When**: Project with unique architecture, tech stack, or requirements

---

## 📏 Agent Scale: Minimal vs. Full Setup

Choose how many agents and subagents to adopt based on your team size and project complexity.

| Tier | Agent Roles | Subagents | When to Use |
|------|-------------|-----------|-------------|
| **Minimal** | Implementation + QA (2 roles) | code-reviewer + 1 specialist | Small team, simple project, getting started |
| **Standard** | All 4 base roles (Implementation, QA, Testing, Documentation) | code-reviewer, test-writer, debugger, doc-generator + 1-2 specialists | Most projects, recommended default |
| **Full** | All base + project-type roles | All generic + specialists + ingestion agents | Large team, complex platform, multi-vertical |

### Minimal Setup

Start here if you are new to the template or have a small project:

- **`AGENTS.md`**: Keep only Implementation Agent and Quality Assurance Agent
- **Subagents**: `code-reviewer` + one specialist matching your stack (e.g., `node-specialist`, `react-specialist`, `flutter-specialist`)
- **Task schema**: Use the full schema -- it works fine with fewer agents (just assign fewer `agent_roles` per task)
- **Skip**: Ingestion agents (unless importing existing code), workflow docs (add later as team grows)

### Standard Setup

Recommended for most projects once you are comfortable with the system:

- **`AGENTS.md`**: All four base roles (Implementation, QA, Testing, Documentation)
- **Subagents**: Generic set (code-reviewer, test-writer, debugger, doc-generator) + one or two specialists
- **Workflow docs**: Add `MULTI_AGENT_WORKFLOW.md` and `DEVELOPMENT_WORKFLOW.md`
- **Task schema**: Full schema with `agent_roles` on every task

### Full Setup

For large teams, complex platforms, or projects that need coordination across many concerns:

- **`AGENTS.md`**: All base roles + project-type-specific roles (e.g., `database`, `security`, `api`, `frontend`)
- **Subagents**: All generic + all relevant specialists + ingestion agents
- **Coordination**: Optionally add a coordination layer (agent-router) and system agents for routing, query enrichment, and governance. See [feedback/symposium.md](../feedback/symposium.md) for an example of a full coordination layer.
- **Memory system**: Consider adding a tiered memory system for multi-session continuity. See [templates/memory/](../templates/memory/) for examples.

---

## 🔧 Component Customization

### `.cursorrules` Customization

**Required Variables**:
- `{{PROJECT_NAME}}` - Your project name
- `{{PROJECT_DESCRIPTION}}` - One-sentence description
- `{{PRIMARY_LANGUAGE}}` - Main language
- `{{FRAMEWORK}}` - Primary framework
- `{{ARCHITECTURE_PATTERN}}` - Architecture style

**Common Customizations**:

1. **Add Project-Specific Patterns**:
```markdown
## Custom Patterns for {{PROJECT_NAME}}

### API Client Pattern
- Always use ApiClient singleton
- Wrap responses in Result<T, Error> type
- Implement retry logic with exponential backoff
```

2. **Add Security Requirements**:
```markdown
## Security Requirements

### API Key Management
- Use AWS Secrets Manager
- Rotate keys every 90 days
- Never log API keys
```

3. **Add Testing Standards**:
```markdown
## Testing Strategy

### Contract Testing
- Use Pact for consumer-driven contracts
- Test all API integrations
- Run contract tests in CI/CD
```

### `AGENTS.md` Customization

**Add Custom Agent Roles**:

```markdown
### Deployment Agent
**Primary Role**: Deployment automation and release management

**Responsibilities**:
- Manage deployment pipelines
- Create release notes
- Handle rollbacks
- Monitor post-deployment

**When to Use**: Deployment tasks, release management
```

**Adjust Agent Responsibilities**:

Add project-specific items to existing agent checklists:

```markdown
### Implementation Agent Checklist
- [ ] Architecture pattern followed
- [ ] YOUR_CUSTOM_CHECK_1
- [ ] YOUR_CUSTOM_CHECK_2
```

### Task Schema Customization

**Add Custom Fields**:

```yaml
tasks:
  - id: TASK_T1
    # Standard fields
    # ... 
    # Custom fields
    estimated_hours: 8
    complexity: high
    risk_level: medium
    deployment_env: [dev, staging]
```

**Add Custom Agent Roles**:

```yaml
agent_roles:
  - implementation
  - deployment      # Custom role
  - monitoring      # Custom role
```

### Subagent Customization

**Create Custom Subagents**:

```markdown
---
name: deployment-specialist
description: Expert in CI/CD, Docker, Kubernetes deployment. Use proactively for deployment tasks.
---

You are a deployment specialist for {{PROJECT_NAME}}.

## Deployment Process

1. Build Docker images
2. Run integration tests
3. Deploy to staging
4. Run smoke tests
5. Deploy to production

## Rollback Procedure

[Your rollback steps]
```

**Customize Existing Subagents**:

Add project-specific sections:

```markdown
## Special Instructions for {{PROJECT_NAME}}

- Use project's custom logging framework
- Follow naming conventions for containers
- Always tag images with git SHA
- Deploy during maintenance windows only
```

---

## 💡 Customization Examples

### Example 1: Microservices Architecture

**Changes needed**:

**.cursorrules**:
```markdown
## Architecture: Microservices

### Service Communication
- Use gRPC for inter-service communication
- Implement circuit breakers
- Use service mesh (Istio)

### Service Structure
```
project/
├── services/
│   ├── auth-service/
│   ├── user-service/
│   └── payment-service/
```
```

**AGENTS.md** - Add agents:
```markdown
### Service Integration Agent
Handles inter-service communication and API contracts.

### Infrastructure Agent
Manages Kubernetes, service mesh, and infrastructure as code.
```

### Example 2: Monorepo with Multiple Apps

**Changes needed**:

**.cursorrules**:
```markdown
## Monorepo Structure
```
project/
├── apps/
│   ├── mobile/      # React Native
│   ├── web/         # Next.js
│   └── admin/       # React
├── packages/
│   ├── shared/      # Shared code
│   └── ui/          # UI components
```

### Workspace Guidelines
- Shared code in packages/
- Each app is independent
- Shared types in packages/shared/types/
```

**AGENTS.md** - Adjust for monorepo:
```markdown
### Cross-Platform Agent
Ensures consistency across mobile, web, and admin apps.
```

---

## ✅ Customization Checklist

Use this checklist when adopting the template. It clarifies what must be replaced, what should be kept as-is, and what to adapt to your project.

### Always Replace (project-specific content)

- [ ] All `{{VARIABLE}}` placeholders (search for `{{` to find them)
- [ ] Project name, description, and philosophy
- [ ] Tech stack, framework, and language references
- [ ] Architecture patterns and directory structure
- [ ] Security requirements and secrets management approach
- [ ] Testing frameworks and coverage targets
- [ ] Example code snippets (replace with your stack's patterns)

### Always Keep (template structure)

- [ ] Agent role definition format (responsibilities, "When to Use", checklist sections)
- [ ] Task schema field names and status values (`todo`, `in_progress`, `blocked`, `done`)
- [ ] Workflow pattern names (Sequential, Parallel, Review-Based) and handoff protocol format
- [ ] Subagent markdown format (frontmatter with `name`/`description` + sections)
- [ ] Task ID convention (`FEATURE_T{N}_{name}`)
- [ ] `spec_refs` format for linking tasks to documentation

### Customize to Fit (adapt but don't remove)

- [ ] Agent checklists -- add project-specific items, keep universal ones (e.g., "no hardcoded secrets")
- [ ] Workflow patterns -- add new patterns if needed (e.g., "Schema-First", "Infrastructure-First"), keep the base set
- [ ] Specialist subagents -- swap for your stack (e.g., replace `flutter-specialist` with `terraform-specialist`)
- [ ] Agent roles in `AGENTS.md` -- add domain-specific roles (e.g., Data Quality, Infrastructure), keep the four base roles
- [ ] Code review checklist -- add project-specific checks, keep universal ones

---

## ⚠️ Common Pitfalls

### Don't Over-Customize Initially

Start minimal, add customizations as needed.

❌ **Bad**: Spend hours adding every possible edge case upfront  
✅ **Good**: Start with variables, add custom sections as you encounter needs

### Don't Break Template Structure

Keep the structure intact, add within sections.

❌ **Bad**: Completely restructure `.cursorrules`  
✅ **Good**: Add custom sections within existing structure

### Don't Leave Variables Unfilled

Search for `{{` to find remaining variables.

❌ **Bad**: Commit files with `{{PROJECT_NAME}}`  
✅ **Good**: Replace all variables before committing

---

## 🔍 Validation

### Check Your Customizations

1. **Variable Check**: Search for `{{` - should find none
2. **Syntax Check**: Verify YAML is valid
3. **Link Check**: Verify all `spec_refs` point to real files
4. **Agent Role Check**: All `agent_roles` are defined in `AGENTS.md`

### Test Your Setup

1. **Manual Test**: Ask AI to review a file using your `.cursorrules`
2. **Agent Test**: Invoke a subagent and verify it uses project context
3. **Task Test**: Have AI select and work on a task

---

## 🚀 Advanced Patterns

### Optional: Cursor Profiles

For projects with multiple domains, verticals, or concerns, you can create **instruction profile** files in `.cursor/` that pre-load domain-specific context before a session. This narrows the AI assistant's focus to a particular area.

**Example**: A multi-vertical analytics platform might have:

```
.cursor/
├── analytics_profile.json     # Focus on analytics pipeline concerns
├── vendor_profile.json        # Focus on vendor integration concerns
└── infra_profile.json         # Focus on infrastructure concerns
```

Each profile contains key context -- relevant docs, conventions, and priorities for that domain. Reference the active profile at the start of a session (e.g., "Load the analytics profile for this session") to give the assistant targeted context.

This pattern complements the agent system: agents define *what roles exist*, while profiles define *what domain the session focuses on*. Profiles are especially useful for large codebases where loading all context at once is impractical.

**Note**: This pattern originated from project feedback. See [feedback/symposium.md](../feedback/symposium.md) for a real-world example.

---

## 🔗 Related Documentation

- [SETUP_GUIDE.md](../SETUP_GUIDE.md)
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [templates/memory/](../templates/memory/) - Memory system templates

---

**Questions?** See [FAQ.md](./FAQ.md)
