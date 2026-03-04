# Migrating from Cursor IDE to Claude Code CLI

**Last Updated**: March 2026

This guide helps users who have been using the multi-agent system with Cursor IDE transition to Claude Code CLI.

## Overview

The multi-agent development system was originally designed for Cursor IDE and has been fully converted to work with Claude Code CLI. This migration guide covers the key differences and how to adapt your workflows.

## Key Differences

### Directory Structure

| Cursor IDE | Claude Code CLI |
|------------|-----------------|
| `.cursor/` | `.claude/` |
| `.cursor/agents/` | `.claude/agents/` |
| `.cursor/skills/` | `.claude/skills/` |
| `.cursor/rules/` | `.claude/rules/` |
| `.cursorrules` | `CLAUDE.md` |

### Agent Invocation

| Cursor IDE | Claude Code CLI |
|------------|-----------------|
| `@idea-to-pdb` | `idea-to-pdb subagent` |
| `@code-reviewer` | `code-reviewer subagent` |
| `@debugger` | `debugger subagent` |

In Claude Code, you describe which subagent you want to use in natural language rather than using `@` mentions.

### Skill Invocation

| Cursor IDE | Claude Code CLI |
|------------|-----------------|
| `@brainstorming` | `/brainstorming` |
| `@writing-plans` | `/writing-plans` |

Skills in Claude Code are invoked using the `/skill-name` slash command syntax.

### Rule Files

| Cursor IDE | Claude Code CLI |
|------------|-----------------|
| `.mdc` extension | `.md` extension |
| `globs:` frontmatter | `paths:` frontmatter |
| `alwaysApply:` | (handled differently) |

### Agent Frontmatter

Claude Code agents support additional frontmatter fields:

```yaml
---
name: agent-name
description: Agent description
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet  # or opus
maxTurns: 15
---
```

## Migration Steps

### 1. Rename Directories and Files

```bash
# Rename .cursor to .claude
mv .cursor .claude

# Rename .cursorrules to CLAUDE.md
mv .cursorrules CLAUDE.md
```

### 2. Update Rule Files

1. Rename `.mdc` files to `.md`
2. Change `globs:` to `paths:` in frontmatter

**Before (Cursor):**
```yaml
---
description: Rule description
globs:
  - "src/**/*.ts"
---
```

**After (Claude Code):**
```yaml
---
description: Rule description
paths:
  - src/**/*.ts
---
```

### 3. Update Agent Files

Add Claude Code frontmatter fields to all agent files:

**Before (Cursor):**
```yaml
---
name: code-reviewer
description: Reviews code for quality and security
---
```

**After (Claude Code):**
```yaml
---
name: code-reviewer
description: Reviews code for quality and security
tools: Read, Grep, Glob, Bash
model: sonnet
maxTurns: 10
---
```

### 4. Update Skill Files

Add Claude Code skill fields to skill frontmatter:

**Before (Cursor):**
```yaml
---
name: brainstorming
description: Explore approaches before implementation
---
```

**After (Claude Code):**
```yaml
---
name: brainstorming
description: Explore approaches before implementation
disable-model-invocation: true
allowed-tools: Read, Write, Grep
---
```

### 5. Update Content References

Search and replace throughout your files:

| Find | Replace |
|------|---------|
| `.cursorrules` | `CLAUDE.md` |
| `.cursor/` | `.claude/` |
| `@agent-name` | `agent-name subagent` |
| `in Cursor` | `in Claude Code` |
| `Cursor IDE` | `Claude Code CLI` |

### 6. Update Scripts

If you have setup scripts, update them to use Claude Code paths:

```bash
# Instead of
mkdir -p .cursor/agents
cp templates/subagents/*.md .cursor/agents/

# Use
mkdir -p .claude/agents
cp templates/subagents/*.md .claude/agents/
```

## Workflow Changes

### Agent Invocation

**Cursor:**
```
Use @code-reviewer to review the changes in src/api/
```

**Claude Code:**
```
Use the code-reviewer subagent to review the changes in src/api/
```

### Skill Invocation

**Cursor:**
```
@brainstorming Let's explore the authentication approach
```

**Claude Code:**
```
/brainstorming Let's explore the authentication approach
```

Or run the skill directly:
```bash
claude --skill brainstorming
```

### File-Scoped Rules

Rules now use `.md` extension and `paths:` for file matching:

```yaml
---
description: TypeScript conventions
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Conventions
...
```

## MCP Configuration

MCP configuration remains the same format between Cursor and Claude Code:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["server-package"]
    }
  }
}
```

The file location changes from `.cursor/mcp.json` to `.mcp.json` at the project root.

## Available Tools

Claude Code agents can use these tools:
- `Read` - Read file contents
- `Write` - Write file contents
- `Edit` - Edit existing files
- `Grep` - Search file contents
- `Glob` - Find files by pattern
- `Bash` - Execute shell commands
- `WebSearch` - Search the web
- `WebFetch` - Fetch web content
- `TodoWrite` - Manage task lists

Specify available tools in agent frontmatter:
```yaml
tools: Read, Grep, Glob, Edit, Write, Bash
```

## Model Selection

Claude Code supports multiple models:
- `sonnet` - Fast, efficient for most tasks
- `opus` - More capable for complex reasoning

Specify in agent frontmatter:
```yaml
model: sonnet
```

## Troubleshooting

### Agent Not Found
- Ensure agent file exists in `.claude/agents/`
- Check frontmatter is valid YAML
- Verify `name:` field matches the expected name

### Skill Not Invoking
- Check skill file is in `.claude/skills/skill-name/SKILL.md`
- Ensure frontmatter is valid
- Try using `/skill-name` syntax

### Rules Not Applying
- Verify rule file uses `.md` extension
- Check `paths:` patterns are correct
- Ensure rule file is in `.claude/rules/`

## Getting Help

- See `docs/TROUBLESHOOTING.md` for common issues
- See `docs/FAQ.md` for frequently asked questions
- See `docs/CLAUDE_CODE_CAPABILITIES.md` for available capabilities
