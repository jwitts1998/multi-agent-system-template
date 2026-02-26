# Multi-Agent Development Guide for {{PROJECT_NAME}}

## 🎯 Overview

This document defines specialized **development agents** for full-stack application development. These agents collaborate on frontend, backend, database, testing, and integration concerns.

**Type**: Full-Stack Application  
**Frontend**: {{FRONTEND_FRAMEWORK}}  
**Backend**: {{BACKEND_FRAMEWORK}}  
**Database**: {{DATABASE_TYPE}}  
**Key Philosophy**: Specialized agents ensure quality across the entire stack with clear API contracts.

---

## 🤖 Agent Roles

### Frontend Agent
**Primary Role**: Client-side components, state management, and API integration

**Responsibilities**: Build UI components, implement state management, integrate APIs, handle routing, ensure responsive design

**When to Use**: Component implementation, state management, API client creation, routing

**Key Knowledge Areas**: {{FRONTEND_FRAMEWORK}}, {{STATE_MANAGEMENT}}, API integration, responsive design

---

### Backend Agent
**Primary Role**: Server-side logic, API endpoints, and business logic

**Responsibilities**: Implement API endpoints, business logic services, authentication, error handling

**When to Use**: API implementation, business logic, service layer, middleware

**Key Knowledge Areas**: {{BACKEND_FRAMEWORK}}, API design, authentication, error handling

---

### Database Agent
**Primary Role**: Schema design, migrations, and data access

**Responsibilities**: Design schemas, create migrations, implement repositories, optimize queries

**When to Use**: Schema design, migrations, database queries, data modeling

**Key Knowledge Areas**: {{DATABASE_TYPE}}, migrations, query optimization, ORM patterns

---

### API Contract Agent
**Primary Role**: Shared types and API contract definition

**Responsibilities**: Define request/response types in `shared/types/`, ensure type safety across stack, document API contracts

**When to Use**: New API endpoints, type updates, API contract changes

**Key Knowledge Areas**: TypeScript types, API contracts, request/response schemas

---

### Testing Agent (Full-Stack)
**Primary Role**: Testing across the entire stack

**Responsibilities**: Unit tests, component tests, API tests, E2E tests, integration tests

**When to Use**: Test creation, coverage validation, E2E testing, integration testing

**Key Knowledge Areas**: Frontend testing, backend testing, E2E testing, integration testing

---

## 🔄 Full-Stack Workflow

### Sequential Full-Stack Implementation
1. **API Contract Agent** → Define shared types in `shared/types/`
2. **Backend Agent** → Implement API endpoint
3. **Database Agent** → Create schema, migration, repository
4. **Frontend Agent** → Build API client and UI components
5. **Testing Agent** → Write tests (unit, integration, E2E)

### Example Task
```yaml
- id: FULLSTACK_T1_user_profile
  title: "Implement user profile feature"
  agent_roles: [api_contract, backend, database, frontend, testing]
  description: >
    Full-stack feature: API contract → backend → database → frontend → tests
```

### Role Mapping

Task files use short `agent_roles` values. This table maps each value to the role (and checklist) the agent should adopt:

| `agent_roles` value | Role to adopt | Notes |
|----------------------|---------------|-------|
| `api_contract` | API Contract Agent | Define shared types and contracts |
| `backend` | Backend Agent | Server-side logic and endpoints |
| `database` | Database Agent | Schema, migrations, repositories |
| `frontend` | Frontend Agent | Client-side components and UI |
| `testing` | Testing Agent | Tests across the full stack |
| `implementation` | Backend Agent | Generic implementation — defaults to Backend; use Frontend if task is clearly UI-only |
| `ui_ux` | Frontend Agent | UI/UX focus — use Frontend checklist plus design review |
| `quality_assurance` | Backend Agent | Code review — apply QA lens to the relevant stack layer |
| `documentation` | Backend Agent | Documentation — apply docs lens to the relevant stack layer |
| `security` | Backend Agent | Security focus — apply security lens to auth, input validation, etc. |

When `agent_roles` lists multiple values, prefer the full-stack workflow order (API Contract → Backend → Database → Frontend → Testing) unless the task explicitly sequences them differently.

---

## 📋 Task Execution Protocol

When you pick up a task with multiple `agent_roles`, follow this protocol:

1. **Read the task** — review `agent_roles`, `spec_refs`, `description`, and `acceptance_criteria`
2. **Resolve roles** — map each `agent_roles` value to a role using the Role Mapping table above
3. **Execute in order** — work through the roles in the order they are listed in `agent_roles` (default to the full-stack workflow order if ambiguous)
4. **Per role** — complete that role's checklist, then add a handoff note to the task before moving to the next role
5. **Final role** — after completing the last role's work, validate all `acceptance_criteria` and propose `status: done`
6. **Single role** — if only one role is listed, complete its checklist and propose status when done

---

## 🔌 Plugins and MCP Tools

Agents have access to MCP tools and skills provided by installed Cursor plugins. See `docs/CURSOR_PLUGINS.md` for the full list. Use them when relevant to the task.

**Stack-relevant examples**:
- **Context7**: Look up current docs for {{FRONTEND_FRAMEWORK}}, {{BACKEND_FRAMEWORK}}, or any dependency before implementing unfamiliar APIs
- **BrowserStack**: Cross-browser and cross-device testing for frontend work
- **Figma skills**: Translate Figma designs to frontend code with 1:1 fidelity
- **Supabase Postgres**: Database optimization guidance for {{DATABASE_TYPE}} queries
- **parallel-web-search**: Verify best practices when introducing new patterns, libraries, or security-sensitive code

Flag gaps: if agents are doing work manually that a plugin, skill, or MCP server could handle, recommend installing or creating one and update `docs/CURSOR_PLUGINS.md`.

---

## ✅ Full-Stack Checklists

### API Contract Checklist
- [ ] Types defined in `shared/types/`
- [ ] Request/response shapes documented
- [ ] Types shared between client and server
- [ ] Relevant MCP tools and skills used where applicable (see `docs/CURSOR_PLUGINS.md`)

### Backend Checklist
- [ ] Endpoint follows REST conventions
- [ ] Validation implemented
- [ ] Error handling consistent
- [ ] Relevant MCP tools and skills used where applicable (see `docs/CURSOR_PLUGINS.md`)

### Database Checklist
- [ ] Schema designed
- [ ] Migration created
- [ ] Repository implemented
- [ ] Relevant MCP tools and skills used where applicable (see `docs/CURSOR_PLUGINS.md`)

### Frontend Checklist
- [ ] API client created
- [ ] UI components built
- [ ] State management integrated
- [ ] Relevant MCP tools and skills used where applicable (see `docs/CURSOR_PLUGINS.md`)

### Testing Checklist
- [ ] Backend tests (unit, integration)
- [ ] Frontend tests (component, integration)
- [ ] E2E test for critical flow
- [ ] Relevant MCP tools and skills used where applicable (see `docs/CURSOR_PLUGINS.md`)

---

**Last Updated**: {{LAST_UPDATED_DATE}}  
**Maintainer**: {{MAINTAINER}}  
**Purpose**: Define specialized agents for full-stack development
