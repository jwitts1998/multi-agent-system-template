# Cursor to Claude Code Conversion Audit

**Date**: 2026-03-03
**Repository**: claude-multi-agnet
**Original**: multi-agent-system-template (Cursor-based)
**Target**: Claude Code CLI compatibility

---

## Executive Summary

This repository is a comprehensive multi-agent development system template originally designed for Cursor IDE. It contains:
- 5 project-type-specific .cursorrules templates
- 5 AGENTS.md templates for different project types
- 40+ subagent configuration files
- Extensive documentation (16 MD files in docs/)
- 5 example projects
- Interactive setup and validation scripts
- Cursor-specific features: skills system, .mdc rules, MCP integrations

**Scope**: Complete replacement of all Cursor-specific components with Claude Code equivalents.

---

## Audit Findings

### 1. File Structure Changes Required

#### Current Cursor-Specific Structure
```
.cursorrules                    # Cursor workspace rules
.cursor/
  ├── agents/                   # Subagent configs (YAML frontmatter + markdown)
  │   ├── generic/              # 8 generic agents
  │   ├── ideation/             # 4 ideation agents
  │   ├── specialists/          # 9 specialist agents
  │   ├── domains/              # 15 domain micro-agents
  │   ├── system/               # 5 system orchestration agents
  │   └── ingestion/            # 3 codebase ingestion agents
  ├── skills/                   # Cursor skills (SKILL.md format)
  │   ├── apply-multi-agent-template/
  │   ├── full-pipeline/
  │   ├── calibrate-domains/
  │   ├── domain-routing/
  │   ├── feature-audit/
  │   └── descript-inspired-captions/
  ├── rules/                    # File-scoped rules (.mdc format)
  │   ├── domain-routing.mdc
  │   ├── domain-consultation.mdc
  │   ├── domain-knowledge-freshness.mdc
  │   ├── domain-agent-loading.mdc
  │   ├── docs-editing.mdc
  │   └── template-editing.mdc
  └── mcp.json                  # MCP server configs
```

#### Required Claude Code Structure
```
.claudeconfig                   # Claude Code workspace config (research needed)
.claude/                        # Claude Code directory (TBD)
  ├── agents/                   # Agent definitions (format TBD)
  ├── skills/                   # Skills (format compatibility TBD)
  ├── mcp.json                  # MCP servers (likely compatible)
  └── ...
```

### 2. Files Containing "Cursor" References

**Core Configuration**:
- `.cursorrules` (1 file)
- `templates/cursorrules/*.cursorrules` (5 files)

**Scripts**:
- `setup.sh` - 18 mentions of Cursor
- `validate.sh` - References .cursorrules

**Documentation** (grep found 20+ files):
- `README.md` - Multiple Cursor workflow references
- `AGENTS.md` - Cursor plugin references
- `docs/CURSOR_PLUGINS.md` - Entire file dedicated to Cursor
- `docs/CUSTOMIZATION_GUIDE.md`
- `docs/INTEGRATION_GUIDE.md`
- `docs/TROUBLESHOOTING.md`
- `docs/FAQ.md`
- `docs/IDEA_TO_PDB.md`

**Skills**:
- `.cursor/skills/*/SKILL.md` (7 skill files)

**Templates**:
- `templates/subagents/**/*.md` (40+ agent files)
- `templates/agents/AGENTS-*.md` (5 files)

**Examples**:
- `examples/*/README.md` (5 example projects)

### 3. Agent Invocation Patterns

**Cursor Pattern**: `@agent-name` in chat
- `@idea-to-pdb`
- `@pdb-to-tasks`
- `@code-reviewer`
- `@test-writer`
- etc.

**Claude Code Pattern**: Research needed
- May use similar `@` syntax
- May use slash commands
- May use skill invocation via different mechanism

### 4. Features Requiring Mapping

#### .cursorrules → Claude Code Config
- Project standards and conventions
- Agent behavior rules
- Task workflow integration
- Architecture patterns
- Security requirements
- Testing standards

#### Cursor Skills → Claude Code Skills
Current skills:
1. `apply-multi-agent-template` - Template deployment
2. `full-pipeline` - Complete workflow automation
3. `calibrate-domains` - Domain agent configuration
4. `domain-routing` - Task → domain mapping
5. `feature-audit` - Feature analysis
6. `descript-inspired-captions` - Domain-specific skill

**Format**: Cursor uses YAML frontmatter + markdown
```yaml
---
name: skill-name
description: What it does
---
# Skill content
```

#### Cursor .mdc Rules → Claude Code Equivalent
File-scoped rules for context-aware behavior:
- `domain-routing.mdc` - Auto-suggest domains in task files
- `domain-consultation.mdc` - Multi-agent consultation
- `domain-knowledge-freshness.mdc` - Practice validation
- `domain-agent-loading.mdc` - Efficient agent loading
- `docs-editing.mdc` - Documentation standards
- `template-editing.mdc` - Template modification rules

**Format**: MDC (Markdown Context) with YAML frontmatter
```yaml
---
description: Rule description
globs:
  - pattern/*.ext
---
# Rule implementation
```

#### Subagents → Claude Code Agents
40+ agent definitions with structure:
```yaml
---
name: agent-name
description: Agent purpose
---
# Agent instructions
- Mission
- When to Invoke
- Technology Context
- Process
- Checklists
```

### 5. MCP Integration

**Current**: `.cursor/mcp.json`
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

**Expected**: Claude Code supports MCP - this should be compatible or minimally adapted.

### 6. Template Variables System

Used throughout all templates:
- `{{PROJECT_NAME}}`
- `{{PROJECT_TYPE}}`
- `{{PRIMARY_LANGUAGE}}`
- `{{FRAMEWORK}}`
- `{{ARCHITECTURE_PATTERN}}`
- `{{STATE_MANAGEMENT}}`
- `{{DATABASE_TYPE}}`
- `{{TEST_FRAMEWORK}}`
- And more...

**Status**: Should remain compatible - just needs to populate Claude Code config files instead of .cursorrules.

### 7. Documentation References

Files heavily referencing Cursor workflows:
1. `README.md` - 487 lines, setup instructions, Cursor-specific workflow
2. `SETUP_GUIDE.md` - Cursor IDE setup steps
3. `docs/CURSOR_PLUGINS.md` - Entire file dedicated to Cursor plugins
4. `docs/INTEGRATION_GUIDE.md` - How components work in Cursor
5. `docs/IDEA_TO_PDB.md` - Workflow using Cursor agents
6. `docs/CUSTOMIZATION_GUIDE.md` - Customizing Cursor templates
7. `docs/TROUBLESHOOTING.md` - Cursor-specific issues

### 8. Setup and Validation Scripts

**setup.sh** (368 lines):
- Prompts for project configuration
- Copies `.cursorrules` templates
- Creates `.cursor/` directory structure
- Installs subagents to `.cursor/agents/`
- Offers Antigravity Skills installation
- References Cursor IDE in output

**validate.sh**:
- Checks for template variables in `.cursorrules`, `AGENTS.md`, `.cursor/`

### 9. Example Projects

5 complete examples showing Cursor workflow:
- `examples/mobile-app-example/`
- `examples/web-app-example/`
- `examples/backend-service-example/`
- `examples/full-stack-example/`
- `examples/existing-project-example/`

Each contains:
- Configured `.cursorrules`
- `AGENTS.md`
- Task files
- PDB (Product Design Blueprint)
- Cursor-specific instructions

---

## Critical Questions for Claude Code Compatibility

### Configuration System
1. What is Claude Code's equivalent to `.cursorrules`?
2. Does Claude Code have a project configuration file format?
3. How does Claude Code define workspace-level AI behavior?

### Agent System
4. How are agents/subagents defined in Claude Code?
5. What is the file format for agent definitions?
6. Where are agent files stored?
7. How are agents invoked (@ syntax, slash commands, etc.)?

### Skills System
8. Does Claude Code have a skills system?
9. What format do skills use?
10. How are skills invoked and managed?

### Context Rules
11. Does Claude Code support file-scoped or pattern-based rules (like .mdc)?
12. How does Claude Code handle context-aware behavior?

### MCP Integration
13. Is Claude Code's MCP configuration compatible with Cursor's format?
14. Are there any differences in how MCP servers are configured?

### CLI vs IDE
15. Since Claude Code is CLI-based, how does the workflow differ from Cursor IDE?
16. Are there terminal-specific considerations for agent invocation?
17. How does the setup process differ for CLI usage?

---

## Conversion Strategy

### Phase 1: Research Claude Code Architecture
- [ ] Determine Claude Code configuration system
- [ ] Understand agent definition format
- [ ] Map skills system
- [ ] Identify context rule equivalent
- [ ] Verify MCP compatibility

### Phase 2: Core Template Conversion
- [ ] Convert `.cursorrules` templates to Claude Code config
- [ ] Migrate agent definitions (40+ files)
- [ ] Convert skills (7 skills)
- [ ] Adapt or remove file-scoped rules
- [ ] Update MCP configuration if needed

### Phase 3: Documentation Update
- [ ] Update README.md (487 lines)
- [ ] Rewrite setup instructions
- [ ] Convert CURSOR_PLUGINS.md → CLAUDE_CODE_CAPABILITIES.md
- [ ] Update all workflow documentation
- [ ] Revise troubleshooting guide
- [ ] Update integration guide
- [ ] Update customization guide

### Phase 4: Scripts and Automation
- [ ] Rewrite setup.sh for Claude Code
- [ ] Update validate.sh for new structure
- [ ] Test installation flow
- [ ] Update any helper scripts

### Phase 5: Examples
- [ ] Convert 5 example projects
- [ ] Update example READMEs
- [ ] Test example workflows

### Phase 6: Testing and Validation
- [ ] Test agent invocation
- [ ] Verify MCP integration
- [ ] Validate workflow patterns
- [ ] Ensure template variable replacement works
- [ ] Test setup script end-to-end

---

## Risk Assessment

### High Risk
- **Unknown Claude Code API**: If agent/config system differs significantly, major redesign needed
- **Skills compatibility**: Skills system may not exist or may be incompatible
- **File-scoped rules**: .mdc pattern may have no Claude Code equivalent

### Medium Risk
- **Workflow differences**: CLI vs IDE may require different invocation patterns
- **Documentation scope**: Extensive docs may need complete rewrite
- **Agent complexity**: 40+ agents need careful conversion

### Low Risk
- **Template variables**: Core templating should remain compatible
- **MCP integration**: Likely compatible as MCP is a standard protocol
- **Task schema**: YAML task files should work unchanged

---

## Next Steps

1. **Research Claude Code**: Answer the 17 critical questions above
2. **Create prototype**: Convert one simple agent to validate approach
3. **Build conversion plan**: Step-by-step instructions for Opus model
4. **Execute conversion**: Let Opus handle the bulk work
5. **Manual review**: Human validation of critical components
6. **Testing**: Verify converted system works end-to-end

---

## Files Inventory

**Total file count by category**:
- Configuration: 7 files (.cursorrules templates + mcp.json)
- Agent definitions: 40+ .md files
- Skills: 7 SKILL.md files
- Rules: 6 .mdc files
- Documentation: 16 .md files in docs/
- Examples: 5 complete example projects
- Scripts: 2 major scripts (setup.sh, validate.sh)
- Templates: 70+ files across all categories

**Estimated conversion scope**: 150+ files requiring modification
