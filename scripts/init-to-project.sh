#!/usr/bin/env bash
#
# Bootstrap a multi-agent development system in a target project.
# Copies the appropriate templates based on project type.
#
# Usage:
#   init-to-project.sh [TARGET_DIR] [PROJECT_TYPE]
#
# TARGET_DIR   — path to target project (default: current directory)
# PROJECT_TYPE — mobile-app | web-app | backend | full-stack (prompted if omitted)
#
# The script auto-detects TEMPLATE_DIR from its own location if the env var is not set.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE_DIR="${TEMPLATE_DIR:-$(dirname "$SCRIPT_DIR")}"

TARGET="${1:-.}"
PROJECT_TYPE="${2:-}"

if [ ! -d "$TARGET" ]; then
  echo "Error: target directory '$TARGET' does not exist."
  exit 2
fi

if [ ! -d "$TEMPLATE_DIR/templates" ]; then
  echo "Error: cannot find templates at '$TEMPLATE_DIR/templates'."
  echo "Set TEMPLATE_DIR to the multi-agent-system-template root."
  exit 2
fi

VALID_TYPES=("mobile-app" "web-app" "backend" "full-stack")

if [ -z "$PROJECT_TYPE" ]; then
  echo "Select project type:"
  echo "  1) mobile-app"
  echo "  2) web-app"
  echo "  3) backend"
  echo "  4) full-stack"
  printf "Enter choice [1-4]: "
  read -r choice
  case "$choice" in
    1) PROJECT_TYPE="mobile-app" ;;
    2) PROJECT_TYPE="web-app" ;;
    3) PROJECT_TYPE="backend" ;;
    4) PROJECT_TYPE="full-stack" ;;
    *) echo "Invalid choice."; exit 1 ;;
  esac
fi

TYPE_VALID=false
for t in "${VALID_TYPES[@]}"; do
  [ "$t" = "$PROJECT_TYPE" ] && TYPE_VALID=true
done
if [ "$TYPE_VALID" = false ]; then
  echo "Error: invalid project type '$PROJECT_TYPE'. Must be one of: ${VALID_TYPES[*]}"
  exit 1
fi

echo ""
echo "Template dir  : $TEMPLATE_DIR"
echo "Target project: $(cd "$TARGET" && pwd)"
echo "Project type  : $PROJECT_TYPE"
echo ""

CURSORRULES_SRC="$TEMPLATE_DIR/templates/cursorrules/${PROJECT_TYPE}.cursorrules"
if [ "$PROJECT_TYPE" = "backend" ]; then
  CURSORRULES_SRC="$TEMPLATE_DIR/templates/cursorrules/backend-service.cursorrules"
fi

AGENTS_MAP=""
case "$PROJECT_TYPE" in
  mobile-app)  AGENTS_MAP="AGENTS-mobile.md" ;;
  web-app)     AGENTS_MAP="AGENTS-web.md" ;;
  backend)     AGENTS_MAP="AGENTS-backend.md" ;;
  full-stack)  AGENTS_MAP="AGENTS-full-stack.md" ;;
esac

echo "Copying .cursorrules..."
cp "$CURSORRULES_SRC" "$TARGET/.cursorrules"

echo "Copying AGENTS.md..."
cp "$TEMPLATE_DIR/templates/agents/$AGENTS_MAP" "$TARGET/AGENTS.md"

echo "Copying task schema..."
cp "$TEMPLATE_DIR/templates/tasks/tasks-schema.yml" "$TARGET/tasks.yml"
mkdir -p "$TARGET/tasks"
cp "$TEMPLATE_DIR/templates/tasks/feature-task-template.yml" "$TARGET/tasks/"

echo "Copying workflow docs..."
mkdir -p "$TARGET/docs/workflow"
cp "$TEMPLATE_DIR/templates/workflow/"*.md "$TARGET/docs/workflow/"

echo "Copying subagents..."
mkdir -p "$TARGET/.cursor/agents"
cp "$TEMPLATE_DIR/templates/subagents/generic/"*.md "$TARGET/.cursor/agents/"

SPECIALISTS_DIR="$TEMPLATE_DIR/templates/subagents/specialists"
case "$PROJECT_TYPE" in
  mobile-app)
    [ -f "$SPECIALISTS_DIR/flutter-specialist.md" ] && cp "$SPECIALISTS_DIR/flutter-specialist.md" "$TARGET/.cursor/agents/"
    ;;
  web-app)
    [ -f "$SPECIALISTS_DIR/react-specialist.md" ] && cp "$SPECIALISTS_DIR/react-specialist.md" "$TARGET/.cursor/agents/"
    ;;
  backend)
    [ -f "$SPECIALISTS_DIR/node-specialist.md" ] && cp "$SPECIALISTS_DIR/node-specialist.md" "$TARGET/.cursor/agents/"
    ;;
  full-stack)
    [ -f "$SPECIALISTS_DIR/react-specialist.md" ] && cp "$SPECIALISTS_DIR/react-specialist.md" "$TARGET/.cursor/agents/"
    [ -f "$SPECIALISTS_DIR/node-specialist.md" ] && cp "$SPECIALISTS_DIR/node-specialist.md" "$TARGET/.cursor/agents/"
    ;;
esac

echo ""
echo "Setup complete. Files copied to $(cd "$TARGET" && pwd):"
echo ""
echo "  .cursorrules           — Workspace rules"
echo "  AGENTS.md              — Agent role definitions"
echo "  tasks.yml              — Portfolio-level task schema"
echo "  tasks/                 — Feature task directory"
echo "  docs/workflow/         — Workflow documentation"
echo "  .cursor/agents/        — Subagent configurations"
echo ""
echo "Next steps:"
echo "  1. Replace all {{VARIABLE}} placeholders in .cursorrules and AGENTS.md"
echo "  2. Customize task schema and subagent prompts for your project"
echo "  3. Validate: $TEMPLATE_DIR/scripts/validate-no-placeholders.sh $(cd "$TARGET" && pwd)"
echo "  4. (Optional) Copy .cursor/rules/ templates:"
echo "     mkdir -p .cursor/rules && cp $TEMPLATE_DIR/templates/cursorrules/rules/*.mdc .cursor/rules/"
echo "  5. Commit .cursorrules, AGENTS.md, .cursor/agents/, and tasks.yml"
