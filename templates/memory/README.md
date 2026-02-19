# Memory System Templates

**Status**: Optional  
**When to Use**: Multi-session projects, large teams, or projects where decisions and patterns need to persist across AI sessions.

## Overview

A tiered memory system helps AI agents maintain context across sessions and accumulate validated knowledge over time. Without it, each session starts fresh and may repeat mistakes or rediscover patterns.

### Three-Tier Model

| Tier | Purpose | Lifespan | Example |
|------|---------|----------|---------|
| **Working Memory** | Current session context | Single session | Current task, delegation log, open questions |
| **Episodic Memory** | Session logs and decision history | Per-session, archived | "In session 12, we decided to use Repository pattern for data access" |
| **Semantic Memory** | Validated patterns and rules | Permanent | "Always use Secret Manager for API keys" |

### When to Adopt

- **Skip it** if your project is small, single-developer, or short-lived. The task system and `.cursorrules` provide enough context.
- **Adopt working memory** if you find yourself re-explaining context at the start of each session.
- **Adopt all three tiers** if your project has multiple contributors, spans months, or has complex domain rules that agents need to internalize.

## Directory Structure

```
docs/memory/
├── README.md                        # This file (or a project-specific version)
├── working/                         # Working memory (current session)
│   └── current-session.md           # Active session context
├── episodic/                        # Session logs (archived)
│   ├── 2026-02-15-session.md
│   └── 2026-02-17-session.md
└── semantic/                        # Validated patterns (permanent)
    └── validated-patterns.md
```

## Setup

1. Create `docs/memory/` in your project.
2. Copy the examples from this directory as starting points.
3. Reference `docs/memory/` in your `.cursorrules` context rules so agents can read memory files.
4. At the start of each session, update or create a working memory file with the current task and context.
5. At the end of each session, archive the working memory as an episodic entry and extract any new validated patterns into semantic memory.

## Examples

- [working-memory-example.md](./working-memory-example.md) -- Sample working memory file for a single session.
- [semantic-memory-example.md](./semantic-memory-example.md) -- Sample validated patterns that persist across sessions.

## Governance

Consider adding a governance document (`docs/memory/GOVERNANCE.md`) that defines:

- Who can promote patterns from episodic to semantic memory
- How conflicts between patterns are resolved
- How often episodic logs are archived or pruned
- Which memory files agents should read at session start
