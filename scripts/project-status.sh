#!/usr/bin/env bash
# Generate project status JSON for the Command Center dashboard
# Usage: ./scripts/project-status.sh > status.json

set -euo pipefail

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed. Install with: brew install jq" >&2
    exit 1
fi

# Function to check if a file exists (returns JSON boolean)
file_exists() {
    if [ -f "$1" ]; then
        echo "true"
    else
        echo "false"
    fi
}

# Build docs array
build_docs_json() {
    jq -n '[
        {name: "Product Overview", path: "docs/product_design/00_PRODUCT_OVERVIEW.md", category: "pdb"},
        {name: "User Research", path: "docs/product_design/01_USER_RESEARCH.md", category: "pdb"},
        {name: "Problem Definition", path: "docs/product_design/02_PROBLEM_DEFINITION.md", category: "pdb"},
        {name: "Solution Design", path: "docs/product_design/03_SOLUTION_DESIGN.md", category: "pdb"},
        {name: "User Experience", path: "docs/product_design/04_USER_EXPERIENCE.md", category: "pdb"},
        {name: "Technical Specs", path: "docs/product_design/05_TECHNICAL_SPECIFICATIONS.md", category: "pdb"},
        {name: "Development Plan", path: "docs/product_design/06_DEVELOPMENT_PLAN.md", category: "pdb"},
        {name: "Success Metrics", path: "docs/product_design/07_SUCCESS_METRICS.md", category: "pdb"},
        {name: "Architecture Overview", path: "docs/architecture/ARCHITECTURE.md", category: "architecture"},
        {name: "API Design", path: "docs/architecture/API_DESIGN.md", category: "api"},
        {name: "Data Models", path: "docs/architecture/DATA_MODELS.md", category: "architecture"},
        {name: "CLAUDE.md", path: "CLAUDE.md", category: "other"},
        {name: "README", path: "README.md", category: "other"}
    ]' | jq --arg root "$PROJECT_ROOT" '[.[] | . + {exists: (($root + "/" + .path) | test(".*") and ([$root, .path] | join("/") | . as $p | $p))}]' 2>/dev/null || echo '[]'
}

# Simpler docs check
build_docs_json_simple() {
    local docs="[]"

    # Build docs array by checking each file
    docs=$(jq -n '[]')

    add_doc() {
        local name="$1"
        local path="$2"
        local category="$3"
        local exists
        exists=$(file_exists "$path")
        docs=$(echo "$docs" | jq --arg n "$name" --arg p "$path" --arg c "$category" --argjson e "$exists" '. + [{name: $n, path: $p, category: $c, exists: $e}]')
    }

    add_doc "Product Overview" "docs/product_design/00_PRODUCT_OVERVIEW.md" "pdb"
    add_doc "User Research" "docs/product_design/01_USER_RESEARCH.md" "pdb"
    add_doc "Problem Definition" "docs/product_design/02_PROBLEM_DEFINITION.md" "pdb"
    add_doc "Solution Design" "docs/product_design/03_SOLUTION_DESIGN.md" "pdb"
    add_doc "User Experience" "docs/product_design/04_USER_EXPERIENCE.md" "pdb"
    add_doc "Technical Specs" "docs/product_design/05_TECHNICAL_SPECIFICATIONS.md" "pdb"
    add_doc "Development Plan" "docs/product_design/06_DEVELOPMENT_PLAN.md" "pdb"
    add_doc "Success Metrics" "docs/product_design/07_SUCCESS_METRICS.md" "pdb"
    add_doc "Architecture Overview" "docs/architecture/ARCHITECTURE.md" "architecture"
    add_doc "API Design" "docs/architecture/API_DESIGN.md" "api"
    add_doc "Data Models" "docs/architecture/DATA_MODELS.md" "architecture"
    add_doc "CLAUDE.md" "CLAUDE.md" "other"
    add_doc "README" "README.md" "other"

    echo "$docs"
}

# Build git info
build_git_json() {
    if [ -d ".git" ]; then
        local branch last_commit uncommitted

        branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        last_commit=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "No commits")
        uncommitted=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

        jq -n \
            --arg branch "$branch" \
            --arg lastCommit "$last_commit" \
            --argjson uncommittedChanges "$uncommitted" \
            '{branch: $branch, lastCommit: $lastCommit, uncommittedChanges: $uncommittedChanges}'
    else
        echo "null"
    fi
}

# Build task stats
build_tasks_json() {
    local files=0
    local todo=0
    local in_progress=0
    local done_count=0
    local blocked=0

    if [ -d "tasks" ]; then
        for file in tasks/*.yml tasks/*.yaml; do
            [ -f "$file" ] 2>/dev/null || continue
            files=$((files + 1))

            # Count statuses
            local t i d b
            t=$(grep -c "status: todo" "$file" 2>/dev/null) || t=0
            i=$(grep -c "status: in_progress" "$file" 2>/dev/null) || i=0
            d=$(grep -c "status: done" "$file" 2>/dev/null) || d=0
            b=$(grep -c "status: blocked" "$file" 2>/dev/null) || b=0

            todo=$((todo + t))
            in_progress=$((in_progress + i))
            done_count=$((done_count + d))
            blocked=$((blocked + b))
        done
    fi

    jq -n \
        --argjson files "$files" \
        --argjson todo "$todo" \
        --argjson inProgress "$in_progress" \
        --argjson done "$done_count" \
        --argjson blocked "$blocked" \
        '{files: $files, todo: $todo, inProgress: $inProgress, done: $done, blocked: $blocked}'
}

# Build agent list
build_agents_json() {
    local agents="[]"

    if [ -d ".claude/agents" ]; then
        for file in .claude/agents/*.md; do
            [ -f "$file" ] 2>/dev/null || continue
            local name
            name=$(basename "$file" .md)
            agents=$(echo "$agents" | jq --arg n "$name" '. + [$n]')
        done
    fi

    echo "$agents"
}

# Generate full status JSON
generate_status() {
    local docs_json git_json tasks_json agents_json timestamp

    docs_json=$(build_docs_json_simple)
    git_json=$(build_git_json)
    tasks_json=$(build_tasks_json)
    agents_json=$(build_agents_json)
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    jq -n \
        --argjson docs "$docs_json" \
        --argjson git "$git_json" \
        --argjson tasks "$tasks_json" \
        --argjson agents "$agents_json" \
        --arg timestamp "$timestamp" \
        --arg projectRoot "$PROJECT_ROOT" \
        '{
            timestamp: $timestamp,
            projectRoot: $projectRoot,
            docs: $docs,
            git: $git,
            tasks: $tasks,
            agents: $agents
        }'
}

# Main
generate_status
