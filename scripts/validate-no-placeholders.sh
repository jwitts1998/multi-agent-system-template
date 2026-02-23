#!/usr/bin/env bash
#
# Validates that deployed template files contain no remaining {{VARIABLE}} placeholders.
# Run from a target project root after customizing templates.
#
# Usage:
#   validate-no-placeholders.sh [TARGET_DIR]
#
# TARGET_DIR defaults to the current directory.

set -euo pipefail

TARGET_DIR="${1:-.}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: directory '$TARGET_DIR' does not exist."
  exit 2
fi

FILES_TO_CHECK=()

add_if_exists() {
  local pattern="$1"
  while IFS= read -r -d '' f; do
    FILES_TO_CHECK+=("$f")
  done < <(find "$TARGET_DIR" -path "$pattern" -print0 2>/dev/null || true)
}

# Single files at project root
for f in ".cursorrules" "AGENTS.md" "tasks.yml"; do
  [ -f "$TARGET_DIR/$f" ] && FILES_TO_CHECK+=("$TARGET_DIR/$f")
done

# Glob patterns
add_if_exists "*/.cursor/agents/*.md"
add_if_exists "*/.cursor/rules/*.mdc"
add_if_exists "*/tasks/*.yml"
add_if_exists "*/docs/workflow/*.md"

# Also check via simple find for nested paths
while IFS= read -r -d '' f; do
  FILES_TO_CHECK+=("$f")
done < <(find "$TARGET_DIR/.cursor/agents" -name '*.md' -print0 2>/dev/null || true)

while IFS= read -r -d '' f; do
  FILES_TO_CHECK+=("$f")
done < <(find "$TARGET_DIR/.cursor/rules" -name '*.mdc' -print0 2>/dev/null || true)

while IFS= read -r -d '' f; do
  FILES_TO_CHECK+=("$f")
done < <(find "$TARGET_DIR/tasks" -name '*.yml' -print0 2>/dev/null || true)

while IFS= read -r -d '' f; do
  FILES_TO_CHECK+=("$f")
done < <(find "$TARGET_DIR/docs/workflow" -name '*.md' -print0 2>/dev/null || true)

# De-duplicate
UNIQUE_FILES=($(printf '%s\n' "${FILES_TO_CHECK[@]}" | sort -u))

if [ ${#UNIQUE_FILES[@]} -eq 0 ]; then
  echo "No template files found in '$TARGET_DIR'. Nothing to validate."
  exit 0
fi

FOUND=0
for f in "${UNIQUE_FILES[@]}"; do
  MATCHES=$(grep -nE '\{\{[A-Za-z0-9_]+\}\}' "$f" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    if [ "$FOUND" -eq 0 ]; then
      echo "Unreplaced placeholders found:"
      echo ""
    fi
    FOUND=1
    echo "  $f"
    echo "$MATCHES" | while IFS= read -r line; do
      echo "    $line"
    done
    echo ""
  fi
done

if [ "$FOUND" -eq 1 ]; then
  echo "Validation FAILED: replace all {{VARIABLE}} placeholders before committing."
  exit 1
else
  echo "Validation PASSED: no {{VARIABLE}} placeholders found in $TARGET_DIR."
  exit 0
fi
