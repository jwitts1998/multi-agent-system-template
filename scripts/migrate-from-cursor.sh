#!/usr/bin/env bash
# Migrate Cursor multi-agent template to Claude Code format
# Usage: ./scripts/migrate-from-cursor.sh <target-project-path> [--dry-run]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory and migration template
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Usage
usage() {
    cat << EOF
${BLUE}Cursor → Claude Code Migration Script${NC}

Migrates a Cursor-based multi-agent project to Claude Code format.

${YELLOW}Usage:${NC}
    $0 <target-project-path> [--dry-run]

${YELLOW}Arguments:${NC}
    <target-project-path>    Path to the project to migrate
    --dry-run               Show what would change without making changes

${YELLOW}What this script does:${NC}
    1. Creates a backup (.pre-migration-backup/)
    2. Renames .cursor/ → .claude/
    3. Renames .cursorrules → CLAUDE.md
    4. Moves .cursor/mcp.json → .mcp.json
    5. Converts *.mdc → *.md (rules)
    6. Renames templates/cursorrules/ → templates/claude-config/
    7. Updates headers: "Cursor AI" → "Claude Code"
    8. Adds "type": "stdio" to MCP config
    9. Adds new files: hooks, logs, token-efficiency.md
   10. Validates migration

${YELLOW}Example:${NC}
    $0 ~/projects/my-app                  # Migrate my-app
    $0 ~/projects/my-app --dry-run        # Preview changes

EOF
    exit 1
}

# Validate arguments
if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    usage
fi

TARGET_DIR="${1%/}"  # Remove trailing slash
DRY_RUN=false

if [ $# -eq 2 ]; then
    if [ "$2" = "--dry-run" ]; then
        DRY_RUN=true
    else
        echo -e "${RED}Error: Invalid argument '$2'${NC}"
        usage
    fi
fi

# Validate target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}Error: Target directory does not exist: $TARGET_DIR${NC}"
    exit 1
fi

# Check if it's already migrated
if [ -d "$TARGET_DIR/.claude" ] && [ ! -d "$TARGET_DIR/.cursor" ]; then
    echo -e "${YELLOW}Warning: Project appears to already be migrated (.claude/ exists, .cursor/ does not)${NC}"
    echo -e "Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Summary counters
FILES_RENAMED=0
FILES_UPDATED=0
FILES_CREATED=0
ERRORS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Cursor → Claude Code Migration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Target:${NC} $TARGET_DIR"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Mode:${NC} DRY RUN (no changes will be made)"
else
    echo -e "${YELLOW}Mode:${NC} LIVE (changes will be applied)"
fi
echo ""

# ============================================================================
# STEP 1: Create Backup
# ============================================================================
echo -e "${GREEN}[1/10]${NC} Creating backup..."

if [ "$DRY_RUN" = false ]; then
    BACKUP_DIR="$TARGET_DIR/.pre-migration-backup"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

    if [ -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}  Backup directory already exists, creating timestamped backup${NC}"
        BACKUP_DIR="${BACKUP_DIR}_${TIMESTAMP}"
    fi

    mkdir -p "$BACKUP_DIR"

    # Backup key directories/files
    [ -d "$TARGET_DIR/.cursor" ] && cp -r "$TARGET_DIR/.cursor" "$BACKUP_DIR/" 2>/dev/null || true
    [ -f "$TARGET_DIR/.cursorrules" ] && cp "$TARGET_DIR/.cursorrules" "$BACKUP_DIR/" 2>/dev/null || true
    [ -d "$TARGET_DIR/templates/cursorrules" ] && cp -r "$TARGET_DIR/templates/cursorrules" "$BACKUP_DIR/" 2>/dev/null || true

    echo -e "  ${GREEN}✓${NC} Backup created at: ${BACKUP_DIR##*/}"
else
    echo -e "  ${BLUE}→${NC} Would create backup at: .pre-migration-backup/"
fi

# ============================================================================
# STEP 2: Rename .cursor/ → .claude/
# ============================================================================
echo -e "${GREEN}[2/10]${NC} Renaming .cursor/ → .claude/..."

if [ -d "$TARGET_DIR/.cursor" ]; then
    if [ "$DRY_RUN" = false ]; then
        if [ -d "$TARGET_DIR/.claude" ]; then
            echo -e "${YELLOW}  Warning: .claude/ already exists, merging...${NC}"
            cp -r "$TARGET_DIR/.cursor/"* "$TARGET_DIR/.claude/" 2>/dev/null || true
            rm -rf "$TARGET_DIR/.cursor"
        else
            mv "$TARGET_DIR/.cursor" "$TARGET_DIR/.claude"
        fi
        echo -e "  ${GREEN}✓${NC} Renamed .cursor/ → .claude/"
        FILES_RENAMED=$((FILES_RENAMED + 1))
    else
        echo -e "  ${BLUE}→${NC} Would rename: .cursor/ → .claude/"
    fi
elif [ -d "$TARGET_DIR/.claude" ]; then
    echo -e "  ${YELLOW}○${NC} .claude/ already exists (skipping)"
else
    echo -e "  ${YELLOW}○${NC} .cursor/ not found (skipping)"
fi

# ============================================================================
# STEP 3: Rename .cursorrules → CLAUDE.md
# ============================================================================
echo -e "${GREEN}[3/10]${NC} Renaming .cursorrules → CLAUDE.md..."

if [ -f "$TARGET_DIR/.cursorrules" ]; then
    if [ "$DRY_RUN" = false ]; then
        if [ -f "$TARGET_DIR/CLAUDE.md" ]; then
            echo -e "${YELLOW}  Warning: CLAUDE.md already exists, backing up to CLAUDE.md.old${NC}"
            mv "$TARGET_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.md.old"
        fi
        mv "$TARGET_DIR/.cursorrules" "$TARGET_DIR/CLAUDE.md"
        echo -e "  ${GREEN}✓${NC} Renamed .cursorrules → CLAUDE.md"
        FILES_RENAMED=$((FILES_RENAMED + 1))
    else
        echo -e "  ${BLUE}→${NC} Would rename: .cursorrules → CLAUDE.md"
    fi
elif [ -f "$TARGET_DIR/CLAUDE.md" ]; then
    echo -e "  ${YELLOW}○${NC} CLAUDE.md already exists (skipping)"
else
    echo -e "  ${YELLOW}○${NC} .cursorrules not found (skipping)"
fi

# ============================================================================
# STEP 4: Move .claude/mcp.json → .mcp.json
# ============================================================================
echo -e "${GREEN}[4/10]${NC} Moving .claude/mcp.json → .mcp.json..."

if [ -f "$TARGET_DIR/.claude/mcp.json" ]; then
    if [ "$DRY_RUN" = false ]; then
        if [ -f "$TARGET_DIR/.mcp.json" ]; then
            echo -e "${YELLOW}  Warning: .mcp.json already exists, backing up to .mcp.json.old${NC}"
            mv "$TARGET_DIR/.mcp.json" "$TARGET_DIR/.mcp.json.old"
        fi
        mv "$TARGET_DIR/.claude/mcp.json" "$TARGET_DIR/.mcp.json"
        echo -e "  ${GREEN}✓${NC} Moved .claude/mcp.json → .mcp.json"
        FILES_RENAMED=$((FILES_RENAMED + 1))
    else
        echo -e "  ${BLUE}→${NC} Would move: .claude/mcp.json → .mcp.json"
    fi
elif [ -f "$TARGET_DIR/.mcp.json" ]; then
    echo -e "  ${YELLOW}○${NC} .mcp.json already exists (skipping)"
else
    echo -e "  ${YELLOW}○${NC} .claude/mcp.json not found (skipping)"
fi

# ============================================================================
# STEP 5: Rename *.mdc → *.md in .claude/rules/
# ============================================================================
echo -e "${GREEN}[5/10]${NC} Converting .claude/rules/*.mdc → *.md..."

if [ -d "$TARGET_DIR/.claude/rules" ]; then
    MDC_COUNT=$(find "$TARGET_DIR/.claude/rules" -name "*.mdc" 2>/dev/null | wc -l | tr -d ' ')

    if [ "$MDC_COUNT" -gt 0 ]; then
        if [ "$DRY_RUN" = false ]; then
            find "$TARGET_DIR/.claude/rules" -name "*.mdc" | while read -r file; do
                newfile="${file%.mdc}.md"
                mv "$file" "$newfile"
                FILES_RENAMED=$((FILES_RENAMED + 1))
            done
            echo -e "  ${GREEN}✓${NC} Renamed $MDC_COUNT .mdc files → .md"
        else
            echo -e "  ${BLUE}→${NC} Would rename $MDC_COUNT .mdc files → .md"
        fi
    else
        echo -e "  ${YELLOW}○${NC} No .mdc files found (skipping)"
    fi
else
    echo -e "  ${YELLOW}○${NC} .claude/rules/ not found (skipping)"
fi

# ============================================================================
# STEP 6: Rename templates/cursorrules/ → templates/claude-config/
# ============================================================================
echo -e "${GREEN}[6/10]${NC} Renaming templates/cursorrules/ → templates/claude-config/..."

if [ -d "$TARGET_DIR/templates/cursorrules" ]; then
    if [ "$DRY_RUN" = false ]; then
        if [ -d "$TARGET_DIR/templates/claude-config" ]; then
            echo -e "${YELLOW}  Warning: templates/claude-config/ already exists, merging...${NC}"
            cp -r "$TARGET_DIR/templates/cursorrules/"* "$TARGET_DIR/templates/claude-config/" 2>/dev/null || true
            rm -rf "$TARGET_DIR/templates/cursorrules"
        else
            mv "$TARGET_DIR/templates/cursorrules" "$TARGET_DIR/templates/claude-config"
        fi
        echo -e "  ${GREEN}✓${NC} Renamed templates/cursorrules/ → templates/claude-config/"
        FILES_RENAMED=$((FILES_RENAMED + 1))
    else
        echo -e "  ${BLUE}→${NC} Would rename: templates/cursorrules/ → templates/claude-config/"
    fi
elif [ -d "$TARGET_DIR/templates/claude-config" ]; then
    echo -e "  ${YELLOW}○${NC} templates/claude-config/ already exists (skipping)"
else
    echo -e "  ${YELLOW}○${NC} templates/cursorrules/ not found (skipping)"
fi

# ============================================================================
# STEP 7: Rename *.cursorrules → *.md in templates/claude-config/
# ============================================================================
echo -e "${GREEN}[7/10]${NC} Converting templates/claude-config/*.cursorrules → *.md..."

if [ -d "$TARGET_DIR/templates/claude-config" ]; then
    CURSORRULES_COUNT=$(find "$TARGET_DIR/templates/claude-config" -name "*.cursorrules" 2>/dev/null | wc -l | tr -d ' ')

    if [ "$CURSORRULES_COUNT" -gt 0 ]; then
        if [ "$DRY_RUN" = false ]; then
            find "$TARGET_DIR/templates/claude-config" -name "*.cursorrules" | while read -r file; do
                newfile="${file%.cursorrules}.md"
                mv "$file" "$newfile"
                FILES_RENAMED=$((FILES_RENAMED + 1))
            done

            # Also rename .mdc → .md in templates/claude-config/rules/
            if [ -d "$TARGET_DIR/templates/claude-config/rules" ]; then
                find "$TARGET_DIR/templates/claude-config/rules" -name "*.mdc" | while read -r file; do
                    newfile="${file%.mdc}.md"
                    mv "$file" "$newfile"
                    FILES_RENAMED=$((FILES_RENAMED + 1))
                done
            fi

            echo -e "  ${GREEN}✓${NC} Renamed $CURSORRULES_COUNT template files"
        else
            echo -e "  ${BLUE}→${NC} Would rename $CURSORRULES_COUNT template files"
        fi
    else
        echo -e "  ${YELLOW}○${NC} No .cursorrules files found (skipping)"
    fi
else
    echo -e "  ${YELLOW}○${NC} templates/claude-config/ not found (skipping)"
fi

# ============================================================================
# STEP 8: Update headers: "Cursor AI" → "Claude Code"
# ============================================================================
echo -e "${GREEN}[8/10]${NC} Updating headers..."

if [ "$DRY_RUN" = false ]; then
    # Update CLAUDE.md
    if [ -f "$TARGET_DIR/CLAUDE.md" ]; then
        if grep -q "Cursor" "$TARGET_DIR/CLAUDE.md" 2>/dev/null; then
            sed -i.bak 's/Cursor AI Agent Rules/Claude Code Agent Rules/g' "$TARGET_DIR/CLAUDE.md"
            sed -i.bak 's/Cursor plugins and skills/Claude Code capabilities/g' "$TARGET_DIR/CLAUDE.md"
            rm -f "$TARGET_DIR/CLAUDE.md.bak"
            FILES_UPDATED=$((FILES_UPDATED + 1))
            echo -e "  ${GREEN}✓${NC} Updated CLAUDE.md headers"
        fi
    fi

    # Update template files
    if [ -d "$TARGET_DIR/templates/claude-config" ]; then
        find "$TARGET_DIR/templates/claude-config" -name "*.md" | while read -r file; do
            if grep -q "Cursor" "$file" 2>/dev/null; then
                sed -i.bak 's/Cursor AI Agent Rules/Claude Code Agent Rules/g' "$file"
                sed -i.bak 's/Cursor plugins and skills/Claude Code capabilities/g' "$file"
                rm -f "${file}.bak"
                FILES_UPDATED=$((FILES_UPDATED + 1))
            fi
        done
        echo -e "  ${GREEN}✓${NC} Updated template headers"
    fi
else
    echo -e "  ${BLUE}→${NC} Would update headers in CLAUDE.md and templates"
fi

# ============================================================================
# STEP 9: Update .mcp.json format (add "type": "stdio")
# ============================================================================
echo -e "${GREEN}[9/10]${NC} Updating .mcp.json format..."

if [ -f "$TARGET_DIR/.mcp.json" ]; then
    if [ "$DRY_RUN" = false ]; then
        # Check if jq is available
        if command -v jq &> /dev/null; then
            # Add "type": "stdio" to all mcpServers
            jq '.mcpServers |= with_entries(.value.type = "stdio")' "$TARGET_DIR/.mcp.json" > "$TARGET_DIR/.mcp.json.tmp"
            mv "$TARGET_DIR/.mcp.json.tmp" "$TARGET_DIR/.mcp.json"
            FILES_UPDATED=$((FILES_UPDATED + 1))
            echo -e "  ${GREEN}✓${NC} Updated .mcp.json format"
        else
            echo -e "  ${YELLOW}○${NC} jq not installed, skipping .mcp.json format update"
            echo -e "  ${YELLOW}  Manual action required: Add '\"type\": \"stdio\"' to each server in .mcp.json${NC}"
        fi
    else
        echo -e "  ${BLUE}→${NC} Would add 'type': 'stdio' to .mcp.json servers"
    fi
else
    echo -e "  ${YELLOW}○${NC} .mcp.json not found (skipping)"
fi

# ============================================================================
# STEP 10: Add new files
# ============================================================================
echo -e "${GREEN}[10/10]${NC} Adding new Claude Code files..."

if [ "$DRY_RUN" = false ]; then
    # Create .claude/hooks/ directory
    mkdir -p "$TARGET_DIR/.claude/hooks"

    # Copy session-logger.sh from template
    if [ -f "$TEMPLATE_DIR/.claude/hooks/session-logger.sh" ]; then
        cp "$TEMPLATE_DIR/.claude/hooks/session-logger.sh" "$TARGET_DIR/.claude/hooks/"
        FILES_CREATED=$((FILES_CREATED + 1))
        echo -e "  ${GREEN}✓${NC} Added .claude/hooks/session-logger.sh"
    fi

    # Copy hooks README
    if [ -f "$TEMPLATE_DIR/.claude/hooks/README.md" ]; then
        cp "$TEMPLATE_DIR/.claude/hooks/README.md" "$TARGET_DIR/.claude/hooks/"
        FILES_CREATED=$((FILES_CREATED + 1))
        echo -e "  ${GREEN}✓${NC} Added .claude/hooks/README.md"
    fi

    # Create .claude/logs/ directory with .gitkeep
    mkdir -p "$TARGET_DIR/.claude/logs"
    touch "$TARGET_DIR/.claude/logs/.gitkeep"
    FILES_CREATED=$((FILES_CREATED + 1))
    echo -e "  ${GREEN}✓${NC} Added .claude/logs/ directory"

    # Copy settings.local.json
    if [ -f "$TEMPLATE_DIR/.claude/settings.local.json" ]; then
        if [ ! -f "$TARGET_DIR/.claude/settings.local.json" ]; then
            cp "$TEMPLATE_DIR/.claude/settings.local.json" "$TARGET_DIR/.claude/"
            FILES_CREATED=$((FILES_CREATED + 1))
            echo -e "  ${GREEN}✓${NC} Added .claude/settings.local.json"
        else
            echo -e "  ${YELLOW}○${NC} settings.local.json already exists (skipping)"
        fi
    fi

    # Copy token-efficiency.md
    if [ -f "$TEMPLATE_DIR/.claude/rules/token-efficiency.md" ]; then
        if [ ! -f "$TARGET_DIR/.claude/rules/token-efficiency.md" ]; then
            cp "$TEMPLATE_DIR/.claude/rules/token-efficiency.md" "$TARGET_DIR/.claude/rules/"
            FILES_CREATED=$((FILES_CREATED + 1))
            echo -e "  ${GREEN}✓${NC} Added .claude/rules/token-efficiency.md"
        else
            echo -e "  ${YELLOW}○${NC} token-efficiency.md already exists (skipping)"
        fi
    fi
else
    echo -e "  ${BLUE}→${NC} Would add:"
    echo -e "      - .claude/hooks/session-logger.sh"
    echo -e "      - .claude/hooks/README.md"
    echo -e "      - .claude/logs/.gitkeep"
    echo -e "      - .claude/settings.local.json"
    echo -e "      - .claude/rules/token-efficiency.md"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Migration Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
    echo -e "${GREEN}✓ Migration complete!${NC}"
    echo ""
    echo -e "  Files renamed:  $FILES_RENAMED"
    echo -e "  Files updated:  $FILES_UPDATED"
    echo -e "  Files created:  $FILES_CREATED"

    if [ $ERRORS -gt 0 ]; then
        echo -e "  ${RED}Errors: $ERRORS${NC}"
    fi

    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Review changes in: $TARGET_DIR"
    echo -e "  2. Test with Claude Code CLI"
    echo -e "  3. If issues occur, restore from: ${BACKUP_DIR##*/}"
    echo -e "  4. Delete backup when satisfied: rm -rf ${BACKUP_DIR##*/}"
else
    echo -e "${BLUE}Dry run complete - no changes made${NC}"
    echo ""
    echo -e "  Would rename:  $((FILES_RENAMED)) files/dirs"
    echo -e "  Would update:  $((FILES_UPDATED)) files"
    echo -e "  Would create:  5 new files"
    echo ""
    echo -e "${YELLOW}To apply these changes, run without --dry-run:${NC}"
    echo -e "  $0 $TARGET_DIR"
fi

echo ""
