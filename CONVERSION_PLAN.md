# Cursor to Claude Code Conversion Plan

**Repository**: claude-multi-agnet
**Execution**: Opus model
**Estimated Scope**: 150+ files
**Date**: 2026-03-03

---

## Overview

This plan converts a comprehensive multi-agent system template from Cursor IDE to Claude Code CLI. Based on research, we now have clear mappings between Cursor and Claude Code architectures.

---

## Architecture Mapping

### File Structure Conversion

| Cursor | Claude Code | Notes |
|--------|-------------|-------|
| `.cursorrules` | `CLAUDE.md` | Main workspace config |
| `.cursor/agents/` | `.claude/agents/` | Subagent definitions |
| `.cursor/rules/*.mdc` | `.claude/rules/*.md` | File-scoped rules |
| `.cursor/skills/` | `.claude/skills/` | Skills system |
| `.cursor/mcp.json` | `.mcp.json` | MCP config (different format) |

### Format Conversions

**Agent Files:**
- **FROM**: YAML frontmatter with `name`, `description`
- **TO**: Same format (compatible!) but add Claude Code fields:
  - `tools` - allowed tools
  - `model` - sonnet/opus/haiku
  - `permissionMode` - default/acceptEdits/dontAsk
  - `maxTurns` - max agentic turns

**Skills Files:**
- **FROM**: Cursor SKILL.md format
- **TO**: Claude Code SKILL.md (similar, add fields):
  - `disable-model-invocation` - prevent auto-trigger
  - `allowed-tools` - tools without permission
  - `context` - fork for isolation
  - `argument-hint` - autocomplete hint

**Rules Files:**
- **FROM**: `.mdc` files with YAML frontmatter (`globs:`)
- **TO**: `.md` files with YAML frontmatter (`paths:`)

**MCP Config:**
- **FROM**: Cursor's mcp.json format
- **TO**: Claude Code's `.mcp.json`:
  ```json
  {
    "mcpServers": {
      "name": {
        "type": "http|stdio",
        "url": "...",
        "command": "...",
        "args": [],
        "env": {}
      }
    }
  }
  ```

---

## Phase 1: Directory Structure Migration

### 1.1 Rename Core Directories

```bash
# Rename .cursor → .claude
mv .cursor .claude

# Within .claude, structure is the same:
# .claude/agents/
# .claude/skills/
# .claude/rules/
```

### 1.2 Update Template Directories

```bash
# Rename template directories
cd templates/

# cursorrules → claude-config
mv cursorrules claude-config

# Within templates, rename files
cd claude-config/
for f in *.cursorrules; do
  mv "$f" "${f%.cursorrules}.md"
done
```

### 1.3 Create Root CLAUDE.md Templates

For each project type template, convert `.cursorrules` to `CLAUDE.md`:
- `templates/claude-config/mobile-app.cursorrules` → `templates/claude-config/mobile-app.md`
- `templates/claude-config/web-app.cursorrules` → `templates/claude-config/web-app.md`
- `templates/claude-config/backend-service.cursorrules` → `templates/claude-config/backend-service.md`
- `templates/claude-config/full-stack.cursorrules` → `templates/claude-config/full-stack.md`
- `templates/claude-config/base-template.cursorrules` → `templates/claude-config/base-template.md`

---

## Phase 2: Agent Conversion

### 2.1 Convert Subagent Files (40+ files)

**Location**: `templates/subagents/`

**Subdirectories to convert**:
- `generic/` (8 agents)
- `ideation/` (4 agents)
- `specialists/` (9 agents)
- `domains/` (15 agents)
- `system/` (5 agents)
- `ingestion/` (3 agents)

**For each agent file**:

1. Keep YAML frontmatter
2. Add Claude Code fields:

```markdown
---
name: code-reviewer
description: Reviews code for style, maintainability, security patterns, and architecture compliance. Use proactively after code implementation to ensure quality standards.
tools: Read, Grep, Glob, Bash
model: sonnet
maxTurns: 10
---

[Rest of agent content remains the same]
```

**Recommended tool permissions by agent type**:

| Agent Type | Tools |
|------------|-------|
| **Reviewers** | `Read, Grep, Glob` |
| **Implementers** | `Read, Grep, Glob, Edit, Write, Bash` |
| **Testers** | `Read, Grep, Glob, Bash` |
| **Researchers** | `Read, Grep, Glob, WebFetch, WebSearch` |
| **System** | `Read, Grep, Glob, Edit, TodoWrite` |

**Special considerations**:
- `code-reviewer`: `Read, Grep, Glob, Bash` (read-only + git diff)
- `test-writer`: `Read, Grep, Glob, Write, Bash` (needs to write tests)
- `debugger`: `Read, Grep, Glob, Bash` (run tests, inspect)
- `designer`: `Read, Grep, Glob, Edit` (modify UI)
- Domain agents: `Read, Grep, Glob, Edit, Write` (specialized work)

### 2.2 Update Agent Invocation References

Replace all references to Cursor-style invocation:
- **FROM**: `@agent-name` or `Invoke @agent-name in Cursor`
- **TO**: `Use the agent-name subagent` or `Claude will auto-delegate to agent-name when appropriate`

**Key messaging change**:
- Cursor: Explicit manual invocation
- Claude Code: Auto-delegation based on descriptions

### 2.3 Add Agent Orchestration Guidance

In system agents (task-orchestrator, product-orchestrator, etc.), add note:
```markdown
## Claude Code Usage

This agent auto-delegates based on task context. Claude determines when to invoke
based on the description field. You can also explicitly request:

"Use the task-orchestrator subagent to analyze the task backlog"
```

---

## Phase 3: Skills Conversion

### 3.1 Convert Skill Files (7 skills)

**Location**: `.claude/skills/` (after directory rename)

**Skills to convert**:
1. `apply-multi-agent-template`
2. `full-pipeline`
3. `calibrate-domains`
4. `domain-routing`
5. `feature-audit`
6. `descript-inspired-captions`
7. Any others

**For each SKILL.md**:

1. Update YAML frontmatter:

```markdown
---
name: apply-multi-agent-template
description: Guides through deploying the multi-agent system template into a target project
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit
---

[Rest of skill content]
```

2. Add Claude Code-specific fields:
- `disable-model-invocation: true` (most template skills should not auto-trigger)
- `allowed-tools` - specify tools available without permission prompt
- `argument-hint` - if skill takes arguments

3. Update skill content to reference Claude Code:
- Replace "Cursor" with "Claude Code"
- Update file paths (`.cursorrules` → `CLAUDE.md`, `.cursor/` → `.claude/`)
- Update invocation syntax (from `@skill` to `/skill`)

### 3.2 Update Skill Invocation References

Throughout documentation:
- **FROM**: `@skill-name`
- **TO**: `/skill-name`

Example:
- `@apply-multi-agent-template` → `/apply-multi-agent-template`
- `@pdb-to-tasks` → `/pdb-to-tasks`

---

## Phase 4: Rules Conversion

### 4.1 Convert .mdc Files to .md (6 files)

**Location**: `.claude/rules/` (after rename)

**Files to convert**:
1. `domain-routing.mdc` → `domain-routing.md`
2. `domain-consultation.mdc` → `domain-consultation.md`
3. `domain-knowledge-freshness.mdc` → `domain-knowledge-freshness.md`
4. `domain-agent-loading.mdc` → `domain-agent-loading.md`
5. `docs-editing.mdc` → `docs-editing.md`
6. `template-editing.mdc` → `template-editing.md`

**For each file**:

1. Rename `.mdc` → `.md`
2. Update YAML frontmatter:

**FROM**:
```yaml
---
description: Auto-suggests domain_agents when editing task files
globs:
  - tasks/*.yml
---
```

**TO**:
```yaml
---
paths:
  - "tasks/*.yml"
---

# Domain Routing Rule

[Description content moved into body]
```

**Key changes**:
- `globs:` → `paths:`
- Paths must be quoted strings
- `description` field removed (put in markdown body)

---

## Phase 5: MCP Configuration

### 5.1 Convert MCP Config

**Location**: `.claude/mcp.json` (root, after rename)

**Current format** (Cursor):
```json
{
  "mcpServers": {
    "idea-reality": {
      "command": "uvx",
      "args": ["idea-reality-mcp"]
    }
  }
}
```

**Convert to** (Claude Code):
```json
{
  "mcpServers": {
    "idea-reality": {
      "type": "stdio",
      "command": "uvx",
      "args": ["idea-reality-mcp"],
      "env": {}
    }
  }
}
```

**Changes**:
- Add `"type": "stdio"` for local command-based servers
- Add `"env": {}` field (even if empty)
- For HTTP servers: `"type": "http"`, `"url": "..."`

### 5.2 Update MCP Documentation

In `docs/CURSOR_PLUGINS.md` → `docs/CLAUDE_CODE_CAPABILITIES.md`:
- Update installation instructions to use `claude mcp add`
- Update config examples to show `.mcp.json` format
- Document scopes (local, project, user, managed)

---

## Phase 6: Documentation Updates

### 6.1 Global Replacements

Throughout ALL markdown files:

| Find | Replace |
|------|---------|
| `Cursor` | `Claude Code` |
| `cursor` | `claude` |
| `.cursorrules` | `CLAUDE.md` |
| `.cursor/` | `.claude/` |
| `@agent-name` | `(agent-name subagent)` or `/skill-name` |
| `Invoke @` | `Use the` (for agents) |

### 6.2 File-Specific Updates

**README.md** (487 lines):
- Update "Quick Start" section → use `claude` command
- Change Cursor IDE references → Claude Code CLI
- Update setup flow to create `CLAUDE.md` instead of `.cursorrules`
- Revise agent invocation examples
- Update workflow diagrams if any mention Cursor

**AGENTS.md** (247 lines):
- Update "Using Cursor Plugins and Skills" → "Using Claude Code Skills and MCP"
- Change agent invocation examples
- Update Practice Validation Protocol to reference Claude Code tools
- Revise Domain Consultation section

**SETUP_GUIDE.md**:
- Rewrite setup instructions for Claude Code CLI
- Update file paths and structure
- Revise validation steps
- Update example commands

**docs/INTEGRATION_GUIDE.md**:
- Update component integration flow
- Revise agent collaboration patterns for auto-delegation
- Update file structure diagrams

**docs/CUSTOMIZATION_GUIDE.md**:
- Update template customization instructions
- Revise file paths and formats
- Update examples for CLAUDE.md format

**docs/TROUBLESHOOTING.md**:
- Replace Cursor-specific issues with Claude Code equivalents
- Update debugging steps for CLI environment
- Revise common issues table

**docs/FAQ.md**:
- Update Q&A for Claude Code context
- Revise setup questions
- Update agent-related FAQs

**docs/IDEA_TO_PDB.md**:
- Update workflow for CLI-based execution
- Revise agent invocation steps
- Update examples

**docs/CURSOR_PLUGINS.md** → **docs/CLAUDE_CODE_CAPABILITIES.md**:
- Rename file
- Complete rewrite for Claude Code ecosystem
- Document subagents, skills, MCP integration
- Update all tool/plugin references

### 6.3 Template Documentation

Update all template files in `templates/`:
- `templates/agents/AGENTS-*.md` (5 files)
- `templates/workflow/*.md` (6 files)
- `templates/memory/*.md` (4 files)
- `templates/research/*.md` (2 files)
- `templates/stakeholder/*.md` (1 file)

Replace Cursor references, update file paths, revise agent invocation patterns.

---

## Phase 7: Scripts Update

### 7.1 Rewrite setup.sh

**Current**: 368 lines configuring Cursor
**Target**: Configure Claude Code

**Major changes**:

1. **File creation**:
```bash
# OLD:
cp "$CURSORRULES_SRC" .cursorrules

# NEW:
cp "$CLAUDE_CONFIG_SRC" CLAUDE.md
```

2. **Directory creation**:
```bash
# OLD:
mkdir -p .cursor/agents/generic .cursor/agents/ideation

# NEW:
mkdir -p .claude/agents/generic .claude/agents/ideation
```

3. **Subagent installation**:
```bash
# OLD:
cp templates/subagents/generic/*.md .cursor/agents/generic/

# NEW:
cp templates/subagents/generic/*.md .claude/agents/generic/
```

4. **Output messaging**:
```bash
# OLD:
echo "Open this project in Cursor"
echo "Invoke @idea-to-pdb..."

# NEW:
echo "Run 'claude' to start a session"
echo "Claude will auto-delegate to agents or use /pdb-to-tasks skill..."
```

5. **Variable replacement**:
```bash
# Update file list to replace variables in:
files_to_process=(
  CLAUDE.md        # was .cursorrules
  AGENTS.md
  tasks.yml
)

# Also process .claude/ (was .cursor/)
while IFS= read -r -d '' f; do
  files_to_process+=("$f")
done < <(find .claude/agents .claude/skills tasks -name "*.md" -o -name "*.yml" 2>/dev/null | tr '\n' '\0')
```

6. **Antigravity Skills**:
- Update path: `.cursor/skills/` → `.claude/skills/`
- Installation command should work the same

### 7.2 Update validate.sh

**Changes**:

1. **File paths**:
```bash
# OLD:
REMAINING=$(grep -roh '{{[^}]*}}' .cursorrules AGENTS.md tasks.yml .cursor/agents/ tasks/ 2>/dev/null | sort -u | wc -l)

# NEW:
REMAINING=$(grep -roh '{{[^}]*}}' CLAUDE.md AGENTS.md tasks.yml .claude/agents/ tasks/ 2>/dev/null | sort -u | wc -l)
```

2. **Output messages**: Reference Claude Code instead of Cursor

### 7.3 Create Migration Script (Optional)

New file: `migrate-from-cursor.sh`

For users converting existing Cursor setups to Claude Code:

```bash
#!/usr/bin/env bash
# Migrate existing Cursor multi-agent setup to Claude Code

echo "Converting Cursor setup to Claude Code..."

# Rename directories
[ -d .cursor ] && mv .cursor .claude

# Rename config
[ -f .cursorrules ] && mv .cursorrules CLAUDE.md

# Rename rule files
if [ -d .claude/rules ]; then
  cd .claude/rules
  for f in *.mdc; do
    [ -f "$f" ] && mv "$f" "${f%.mdc}.md"
  done
  cd ../..
fi

# Update MCP config (manual - requires format changes)
echo "⚠️  Manual action required: Update .mcp.json format for Claude Code"
echo "   See CONVERSION_PLAN.md Phase 5.1 for details"

echo "✓ Basic conversion complete. Run ./validate.sh to check for remaining issues."
```

---

## Phase 8: Examples Conversion

### 8.1 Convert Example Projects (5 projects)

**Projects**:
1. `examples/mobile-app-example/`
2. `examples/web-app-example/`
3. `examples/backend-service-example/`
4. `examples/full-stack-example/`
5. `examples/existing-project-example/`

**For each example**:

1. **Directory structure**:
```bash
cd examples/mobile-app-example/
mv .cursor .claude
mv .cursorrules CLAUDE.md
```

2. **Update README.md**:
- Replace Cursor references
- Update setup instructions
- Revise workflow steps
- Update agent invocation examples

3. **Update task files**: No changes needed (YAML format compatible)

4. **Update docs**: Replace file paths and references

### 8.2 Update Example READMEs

Each example has detailed setup instructions. Update:
- Installation steps
- File structure diagrams
- Workflow examples
- Agent usage patterns

---

## Phase 9: Additional Files

### 9.1 Update Root Files

**CHANGELOG.md**:
- Add entry for "v3.0.0 - Claude Code Conversion"
- Document breaking changes

**INSTALLATION.md** (if kept):
- Update for Claude Code installation
- Revise setup steps

**PROJECT_QUESTIONNAIRE.md** (if kept):
- Update references to Cursor → Claude Code

**QUICK_START.md** (if kept):
- Rewrite for Claude Code CLI workflow

### 9.2 Create New Documentation

**docs/MIGRATION_FROM_CURSOR.md** (new file):
- Guide for users migrating from Cursor version
- Step-by-step conversion instructions
- Common issues during migration

**docs/CLAUDE_CODE_QUICKSTART.md** (new file):
- Getting started with Claude Code CLI
- Session management
- Agent delegation patterns
- Skill usage

---

## Phase 10: Testing and Validation

### 10.1 Validation Checklist

- [ ] All `.cursorrules` files converted to `CLAUDE.md`
- [ ] `.cursor/` renamed to `.claude/`
- [ ] All `.mdc` files converted to `.md`
- [ ] MCP config updated to `.mcp.json` format
- [ ] All agent files have required Claude Code fields
- [ ] All skill files have Claude Code frontmatter
- [ ] All "Cursor" text references replaced
- [ ] All `@agent` references updated
- [ ] Setup script creates correct structure
- [ ] Validate script checks correct files
- [ ] Examples fully converted
- [ ] Documentation thoroughly updated

### 10.2 Manual Testing

1. **Run setup.sh**:
```bash
./setup.sh
# Verify creates .claude/, CLAUDE.md, etc.
```

2. **Check structure**:
```bash
ls -la .claude/
# Should have: agents/, skills/, rules/
```

3. **Validate agents**:
```bash
head .claude/agents/generic/code-reviewer.md
# Check YAML frontmatter has tools, model, etc.
```

4. **Check MCP**:
```bash
cat .mcp.json
# Verify format matches Claude Code spec
```

5. **Test with Claude Code** (if available):
```bash
claude
> Use the code-reviewer subagent
# Verify delegation works
```

---

## Execution Instructions for Opus

### Pre-Execution

1. Read `CURSOR_TO_CLAUDE_AUDIT.md` for context
2. Review this plan thoroughly
3. Create backup: `cp -r . ../claude-multi-agnet-backup`

### Execution Order

Execute phases in order:
1. Phase 1: Directory structure (safest, reversible)
2. Phase 2: Agent conversion (bulk of work)
3. Phase 3: Skills conversion
4. Phase 4: Rules conversion
5. Phase 5: MCP config
6. Phase 6: Documentation (largest volume)
7. Phase 7: Scripts
8. Phase 8: Examples
9. Phase 9: Additional files
10. Phase 10: Validation

### Error Handling

- If unsure about a conversion, flag for human review
- Keep original Cursor terminology in comments if it aids understanding
- Preserve git history (don't delete and recreate files unnecessarily)
- Create a CONVERSION_LOG.md documenting issues encountered

### Quality Standards

- All replacements must be context-aware (not blind find/replace)
- Preserve markdown formatting
- Maintain YAML frontmatter validity
- Keep line lengths reasonable (< 120 chars)
- Ensure all links remain valid after path changes

---

## Post-Conversion

### Human Review Required

1. **MCP configuration**: Verify `.mcp.json` format is correct
2. **Agent descriptions**: Ensure auto-delegation will work properly
3. **Skill arguments**: Verify argument handling is clear
4. **Documentation flow**: Read through main docs for coherence
5. **Examples**: Test at least one example end-to-end

### Testing Recommendations

1. Run `./setup.sh` in a test directory
2. Verify all template variables are replaced
3. Check `.claude/` structure is correct
4. Validate YAML frontmatter in agents and skills
5. Test a Claude Code session if possible

### Final Steps

1. Update version number to 3.0.0
2. Create CONVERSION_LOG.md with summary
3. Update README.md with "Converted for Claude Code CLI" badge
4. Tag release: `git tag v3.0.0-claude-code`

---

## Success Criteria

Conversion is complete when:
- [ ] Zero references to "Cursor" (except in migration docs)
- [ ] All `.cursorrules` → `CLAUDE.md`
- [ ] All `.cursor/` → `.claude/`
- [ ] All `.mdc` → `.md` with updated frontmatter
- [ ] All agents have Claude Code fields
- [ ] All skills have Claude Code frontmatter
- [ ] MCP config uses Claude Code format
- [ ] Documentation reads naturally for Claude Code users
- [ ] Setup script creates correct structure
- [ ] Examples are fully functional
- [ ] Validate script runs without errors

---

## Estimated Effort

- **Phase 1**: 5 minutes (directory structure)
- **Phase 2**: 2 hours (40+ agents)
- **Phase 3**: 30 minutes (7 skills)
- **Phase 4**: 20 minutes (6 rules)
- **Phase 5**: 10 minutes (MCP config)
- **Phase 6**: 3 hours (extensive documentation)
- **Phase 7**: 1 hour (scripts)
- **Phase 8**: 1.5 hours (5 examples)
- **Phase 9**: 30 minutes (additional files)
- **Phase 10**: 1 hour (validation and testing)

**Total**: ~10 hours (for Opus model)

---

## Risk Mitigation

### High-Risk Items

1. **MCP format changes**: Double-check `.mcp.json` format
2. **Agent auto-delegation**: Descriptions must be precise
3. **Script logic**: Test setup.sh thoroughly after conversion

### Rollback Plan

If conversion fails:
1. Restore from backup: `rm -rf claude-multi-agnet && mv claude-multi-agnet-backup claude-multi-agnet`
2. Review errors in CONVERSION_LOG.md
3. Address issues and retry

---

## Questions for User Before Execution

1. Should we keep references to Cursor in migration/conversion docs?
2. Should we maintain backward compatibility or clean break?
3. Do you want examples tested with actual Claude Code, or conversion only?
4. Should we create a separate branch for this work?
5. Do you want to review interim checkpoints (e.g., after Phase 2)?

---

## Appendix: File Inventory

**Total files requiring modification**: ~150

**By category**:
- Configuration: 7 files
- Agents: 40+ files
- Skills: 7 files
- Rules: 6 files
- Documentation: 16 files
- Scripts: 2 files
- Examples: 5 projects (~30 files)
- Templates: ~70 files

**By type**:
- Markdown: ~130 files
- YAML: ~10 files
- Shell scripts: 2 files
- JSON: 1 file
