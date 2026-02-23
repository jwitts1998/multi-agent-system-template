#!/usr/bin/env bash
set -euo pipefail

# Multi-Agent System Template — Project Setup Script
# Converts this cloned template into a configured project.

BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
  echo ""
  echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}  Multi-Agent System — Project Setup${NC}"
  echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════${NC}"
  echo ""
}

print_step() {
  echo -e "\n${BOLD}${GREEN}[$1/$TOTAL_STEPS]${NC} ${BOLD}$2${NC}"
}

print_info() {
  echo -e "  ${DIM}$1${NC}"
}

print_success() {
  echo -e "  ${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "  ${YELLOW}!${NC} $1"
}

prompt() {
  local var_name=$1
  local prompt_text=$2
  local default=$3
  if [ -n "$default" ]; then
    echo -en "  ${BOLD}$prompt_text${NC} ${DIM}[$default]${NC}: "
    read -r input
    eval "$var_name=\"${input:-$default}\""
  else
    echo -en "  ${BOLD}$prompt_text${NC}: "
    read -r input
    eval "$var_name=\"$input\""
  fi
}

prompt_choice() {
  local var_name=$1
  local prompt_text=$2
  shift 2
  local options=("$@")

  echo -e "\n  ${BOLD}$prompt_text${NC}"
  for i in "${!options[@]}"; do
    echo -e "    ${CYAN}$((i+1)))${NC} ${options[$i]}"
  done
  echo -en "  ${BOLD}Choice${NC}: "
  read -r choice

  if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
    eval "$var_name=\"${options[$((choice-1))]}\""
  else
    echo -e "  ${RED}Invalid choice. Using first option.${NC}"
    eval "$var_name=\"${options[0]}\""
  fi
}

TOTAL_STEPS=6

print_header

# ─── Step 1: Collect project info ───────────────────────────────────────────

print_step 1 "Project Information"

prompt PROJECT_NAME "Project name" ""
while [ -z "$PROJECT_NAME" ]; do
  echo -e "  ${RED}Project name is required.${NC}"
  prompt PROJECT_NAME "Project name" ""
done

prompt PROJECT_DESCRIPTION "One-line description" ""

prompt_choice PROJECT_TYPE "Project type:" \
  "mobile-app" "web-app" "backend-service" "full-stack"

# ─── Step 2: Tech stack ─────────────────────────────────────────────────────

print_step 2 "Technology Stack"

case "$PROJECT_TYPE" in
  mobile-app)
    prompt PRIMARY_LANGUAGE "Primary language" "Dart"
    prompt FRAMEWORK "Framework" "Flutter"
    prompt STATE_MANAGEMENT "State management" "Riverpod"
    prompt ARCHITECTURE_PATTERN "Architecture" "Clean Architecture"
    ;;
  web-app)
    prompt PRIMARY_LANGUAGE "Primary language" "TypeScript"
    prompt FRAMEWORK "Framework" "React"
    prompt STATE_MANAGEMENT "State management" "Redux Toolkit"
    prompt ARCHITECTURE_PATTERN "Architecture" "Feature-First"
    ;;
  backend-service)
    prompt PRIMARY_LANGUAGE "Primary language" "TypeScript"
    prompt FRAMEWORK "Framework" "Express"
    prompt DATABASE_TYPE "Database" "PostgreSQL"
    prompt ARCHITECTURE_PATTERN "Architecture" "Layered Architecture"
    STATE_MANAGEMENT="N/A"
    ;;
  full-stack)
    prompt PRIMARY_LANGUAGE "Primary language" "TypeScript"
    prompt FRAMEWORK "Framework" "Next.js"
    prompt STATE_MANAGEMENT "State management" "React Context"
    prompt DATABASE_TYPE "Database" "PostgreSQL"
    prompt ARCHITECTURE_PATTERN "Architecture" "Feature-First"
    ;;
esac

prompt TEST_FRAMEWORK "Test framework" ""
prompt TEST_COVERAGE_TARGET "Test coverage target (%)" "80"

# ─── Step 3: Copy templates to root ─────────────────────────────────────────

print_step 3 "Configuring project files"

CURSORRULES_SRC="templates/cursorrules/${PROJECT_TYPE}.cursorrules"
AGENTS_SRC="templates/agents/AGENTS-${PROJECT_TYPE%%%-*}.md"

# Map project type to AGENTS template name
case "$PROJECT_TYPE" in
  mobile-app)  AGENTS_SRC="templates/agents/AGENTS-mobile.md" ;;
  web-app)     AGENTS_SRC="templates/agents/AGENTS-web.md" ;;
  backend-service) AGENTS_SRC="templates/agents/AGENTS-backend.md" ;;
  full-stack)  AGENTS_SRC="templates/agents/AGENTS-full-stack.md" ;;
esac

if [ -f "$CURSORRULES_SRC" ]; then
  cp "$CURSORRULES_SRC" .cursorrules
  print_success "Copied ${PROJECT_TYPE}.cursorrules → .cursorrules"
else
  print_warning "Template $CURSORRULES_SRC not found, keeping generic .cursorrules"
fi

if [ -f "$AGENTS_SRC" ]; then
  cp "$AGENTS_SRC" AGENTS.md
  print_success "Copied $(basename $AGENTS_SRC) → AGENTS.md"
else
  print_warning "Template $AGENTS_SRC not found, keeping generic AGENTS.md"
fi

# Set up directories
mkdir -p tasks docs/product_design docs/architecture docs/workflow .cursor/agents/generic .cursor/agents/ideation

# Copy subagents
cp templates/subagents/generic/*.md .cursor/agents/generic/ 2>/dev/null && \
  print_success "Copied generic subagents → .cursor/agents/generic/" || \
  print_warning "Could not copy generic subagents"

cp templates/subagents/ideation/*.md .cursor/agents/ideation/ 2>/dev/null && \
  print_success "Copied ideation subagents → .cursor/agents/ideation/" || \
  print_warning "Could not copy ideation subagents"

# Copy task templates
cp templates/tasks/tasks-schema.yml tasks.yml 2>/dev/null && \
  print_success "Copied tasks-schema.yml → tasks.yml" || true
cp templates/tasks/feature-task-template.yml tasks/ 2>/dev/null && \
  print_success "Copied feature-task-template.yml → tasks/" || true

# Copy specialist if one matches
case "$PROJECT_TYPE" in
  mobile-app)
    if [ "$FRAMEWORK" = "Flutter" ] || [ "$FRAMEWORK" = "flutter" ]; then
      mkdir -p .cursor/agents/specialists
      cp templates/subagents/specialists/flutter-specialist.md .cursor/agents/specialists/ 2>/dev/null && \
        print_success "Copied flutter-specialist → .cursor/agents/specialists/"
    fi
    ;;
  web-app)
    if [ "$FRAMEWORK" = "React" ] || [ "$FRAMEWORK" = "react" ]; then
      mkdir -p .cursor/agents/specialists
      cp templates/subagents/specialists/react-specialist.md .cursor/agents/specialists/ 2>/dev/null && \
        print_success "Copied react-specialist → .cursor/agents/specialists/"
    fi
    ;;
  backend-service)
    if [ "$FRAMEWORK" = "Express" ] || [ "$FRAMEWORK" = "express" ] || [ "$FRAMEWORK" = "Node" ] || [ "$FRAMEWORK" = "Fastify" ]; then
      mkdir -p .cursor/agents/specialists
      cp templates/subagents/specialists/node-specialist.md .cursor/agents/specialists/ 2>/dev/null && \
        print_success "Copied node-specialist → .cursor/agents/specialists/"
    fi
    ;;
esac

# ─── Step 4: Replace variables ──────────────────────────────────────────────

print_step 4 "Replacing template variables"

replace_var() {
  local var_name=$1
  local var_value=$2
  local target_files=("$@")

  # Replace in all project config files (not in templates/ directory)
  local files_to_process=(
    .cursorrules
    AGENTS.md
    tasks.yml
  )

  # Also process files in .cursor/agents/ and tasks/
  while IFS= read -r -d '' f; do
    files_to_process+=("$f")
  done < <(find .cursor/agents tasks -name "*.md" -o -name "*.yml" 2>/dev/null | tr '\n' '\0')

  for f in "${files_to_process[@]}"; do
    if [ -f "$f" ]; then
      if grep -q "{{${var_name}}}" "$f" 2>/dev/null; then
        sed -i '' "s|{{${var_name}}}|${var_value}|g" "$f" 2>/dev/null || \
        sed -i "s|{{${var_name}}}|${var_value}|g" "$f" 2>/dev/null || true
      fi
    fi
  done
}

replace_var "PROJECT_NAME" "$PROJECT_NAME"
print_success "Replaced {{PROJECT_NAME}} → $PROJECT_NAME"

replace_var "PROJECT_DESCRIPTION" "${PROJECT_DESCRIPTION:-$PROJECT_NAME}"
replace_var "PROJECT_TYPE" "$PROJECT_TYPE"
replace_var "PRIMARY_LANGUAGE" "$PRIMARY_LANGUAGE"
replace_var "FRAMEWORK" "$FRAMEWORK"
replace_var "STATE_MANAGEMENT" "${STATE_MANAGEMENT:-N/A}"
replace_var "ARCHITECTURE_PATTERN" "$ARCHITECTURE_PATTERN"
replace_var "TEST_FRAMEWORK" "${TEST_FRAMEWORK:-Jest}"
replace_var "TEST_COVERAGE_TARGET" "$TEST_COVERAGE_TARGET"
replace_var "DATABASE_TYPE" "${DATABASE_TYPE:-}"
replace_var "LAST_UPDATED_DATE" "$(date +%Y-%m-%d)"
replace_var "DATE" "$(date +%Y-%m-%d)"
replace_var "MAINTAINER" "$(git config user.name 2>/dev/null || echo 'Development Team')"

print_success "Replaced core template variables in project files"

# Count remaining variables
REMAINING=$(grep -roh '{{[^}]*}}' .cursorrules AGENTS.md tasks.yml .cursor/agents/ tasks/ 2>/dev/null | sort -u | wc -l | tr -d ' ')
if [ "$REMAINING" -gt 0 ]; then
  print_warning "$REMAINING unique template variables remain — customize these manually or run ./validate.sh to see them"
else
  print_success "All template variables replaced"
fi

# ─── Step 5: Prune unused templates ─────────────────────────────────────────

print_step 5 "Cleaning up template scaffolding"

echo -en "  ${BOLD}Remove template-library files not needed for your project? (y/n)${NC} ${DIM}[y]${NC}: "
read -r do_prune
do_prune="${do_prune:-y}"

if [[ "$do_prune" =~ ^[Yy] ]]; then
  # Remove other project type templates (keep the one we used)
  for type_file in templates/cursorrules/*.cursorrules; do
    if [ "$type_file" != "$CURSORRULES_SRC" ]; then
      rm -f "$type_file"
    fi
  done
  print_success "Removed unused .cursorrules templates"

  for agent_file in templates/agents/AGENTS-*.md; do
    if [ "$agent_file" != "$AGENTS_SRC" ]; then
      rm -f "$agent_file"
    fi
  done
  print_success "Removed unused AGENTS.md templates"

  # Remove example projects (they're reference material)
  rm -rf examples/
  print_success "Removed examples/ (reference material)"

  # Remove feedback directory (template meta)
  rm -rf feedback/
  print_success "Removed feedback/ (template meta)"

  # Remove template-level docs that are now in project root or irrelevant
  rm -f INSTALLATION.md
  rm -f PROJECT_QUESTIONNAIRE.md
  rm -f QUICK_START.md
  print_success "Removed template-only docs (INSTALLATION, QUESTIONNAIRE, QUICK_START)"

  print_info "Kept: templates/ (source reference), docs/ (project docs), SETUP_GUIDE.md (reference)"
else
  print_info "Skipped pruning. You can manually remove unused files later."
fi

# ─── Step 6: Summary ────────────────────────────────────────────────────────

print_step 6 "Setup complete"

echo ""
echo -e "${BOLD}${GREEN}  Project configured successfully!${NC}"
echo ""
echo -e "  ${BOLD}Project${NC}:       $PROJECT_NAME"
echo -e "  ${BOLD}Type${NC}:          $PROJECT_TYPE"
echo -e "  ${BOLD}Language${NC}:      $PRIMARY_LANGUAGE"
echo -e "  ${BOLD}Framework${NC}:     $FRAMEWORK"
echo -e "  ${BOLD}Architecture${NC}:  $ARCHITECTURE_PATTERN"
echo ""
echo -e "${BOLD}  Project structure:${NC}"
echo -e "    .cursorrules          ${DIM}— AI agent rules (configured)${NC}"
echo -e "    AGENTS.md             ${DIM}— Agent role definitions (configured)${NC}"
echo -e "    tasks.yml             ${DIM}— Portfolio-level task tracking${NC}"
echo -e "    tasks/                ${DIM}— Feature task files${NC}"
echo -e "    docs/product_design/  ${DIM}— Product Design Blueprint (PDB)${NC}"
echo -e "    docs/architecture/    ${DIM}— Architecture documentation${NC}"
echo -e "    .cursor/agents/       ${DIM}— Subagent configurations${NC}"
echo ""
echo -e "${BOLD}  Next steps:${NC}"
echo -e "    1. ${CYAN}Open this project in Cursor${NC}"
echo -e "    2. ${CYAN}Invoke @idea-to-pdb to explore your idea and generate a PDB${NC}"
echo -e "    3. ${CYAN}Invoke @pdb-to-tasks to create task files from the PDB${NC}"
echo -e "    4. ${CYAN}Start developing — agents will follow your project conventions${NC}"
echo ""
echo -e "  ${DIM}Run ./validate.sh to check for remaining template variables.${NC}"
echo ""
