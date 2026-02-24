# Git Branching Strategy

**Date**: February 2026  
**Status**: Active

## Overview

Branch conventions for multi-agent development. Features get isolated branches; agents work on branches to keep `main` stable.

---

## Branch Naming

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features and enhancements | `feature/auth-module` |
| `fix/` | Bug fixes | `fix/token-expiry-race` |
| `refactor/` | Code restructuring | `refactor/db-layer` |
| `docs/` | Documentation only | `docs/api-reference` |
| `chore/` | Tooling, deps, config | `chore/upgrade-deps` |
| `experiment/` | Exploratory work, spikes | `experiment/vector-search` |

Use lowercase, hyphens for spaces. Keep names short but descriptive.

---

## Workflow

### Feature Development

```
main
  └── feature/auth-module    ← agent works here
        ├── commit: feat: add auth service
        ├── commit: feat: add token rotation
        ├── commit: test: auth module tests
        └── PR → main
```

1. **Create branch** from `main`: `git checkout -b feature/<name>`
2. **Implement** on the branch — commit early and often
3. **PR** when acceptance criteria are met
4. **Review** — QA agent reviews on the same branch
5. **Merge** to `main` via squash or merge commit

### Multi-Agent on One Feature

When multiple agents work on the same feature sequentially:

```
feature/user-dashboard
  ├── [Implementation Agent] feat: dashboard components
  ├── [Implementation Agent] feat: data fetching layer
  ├── [QA Agent] fix: address review findings
  ├── [Testing Agent] test: dashboard integration tests
  └── [Documentation Agent] docs: dashboard usage guide
```

All agents commit to the same feature branch. Handoff notes go in commit messages or task file notes.

### Parallel Features

Independent features get independent branches. Merge conflicts are resolved when PRing to `main`.

```
main
  ├── feature/auth-module      ← Agent A
  ├── feature/user-dashboard   ← Agent B
  └── feature/notification-api ← Agent C
```

---

## Commit Message Convention

```
<type>: <short description>

[optional body]
```

**Types**: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `perf`, `security`

Examples:
- `feat: implement JWT auth with refresh rotation`
- `fix: handle expired token edge case`
- `test: add auth service unit tests`
- `refactor: extract token validation to service`

---

## Rules

- **Never push directly to `main`** — always use a feature branch + PR
- **Never force-push to shared branches** unless coordinated
- **Delete branches after merge** — keep the branch list clean
- **One feature per branch** — don't mix unrelated changes
- **Rebase or merge from `main`** before PR to avoid stale conflicts

---

## Agent Integration

Tasks in `tasks/*.yml` should reference their branch:

```yaml
- id: AUTH_T1_jwt_module
  title: "Implement JWT authentication"
  status: in_progress
  branch: "feature/auth-module"
  agent_roles: [implementation, quality_assurance, testing]
```

The `branch` field helps agents know where to work and helps the execution monitor track which branches are active.
