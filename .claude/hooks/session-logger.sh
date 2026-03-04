#!/usr/bin/env bash
# Claude Code Session Logger
# Logs tool usage, agent activity, and session events to .claude/logs/
#
# Hook events this handles:
# - PreToolUse / PostToolUse: Log tool calls and results
# - Stop: Log session end with summary
#
# Environment variables provided by Claude Code:
# - CLAUDE_SESSION_ID: Current session identifier
# - CLAUDE_TOOL_NAME: Name of tool being called (for tool hooks)
# - CLAUDE_TOOL_INPUT: JSON input to tool
# - CLAUDE_TOOL_OUTPUT: JSON output from tool (PostToolUse only)
# - CLAUDE_PROJECT_DIR: Project root directory

set -euo pipefail

# ── Configuration ──
LOG_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/logs"
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%Y%m%d_%H%M%S)}"
SESSION_LOG="${LOG_DIR}/session_${SESSION_ID}.jsonl"
CURRENT_LOG="${LOG_DIR}/current.jsonl"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# ── Helper Functions ──

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log_event() {
  local event_type="$1"
  local payload="$2"

  # Use jq for proper JSON construction
  local entry
  entry=$(jq -cn \
    --arg ts "$(timestamp)" \
    --arg sid "$SESSION_ID" \
    --arg evt "$event_type" \
    --argjson data "$payload" \
    '{timestamp: $ts, session_id: $sid, event: $evt, data: $data}')

  # Append to session log and current log (for real-time monitoring)
  echo "$entry" >> "$SESSION_LOG"
  echo "$entry" >> "$CURRENT_LOG"
}

# ── Event Handlers ──

# Determine which hook event triggered this
HOOK_EVENT="${1:-unknown}"

case "$HOOK_EVENT" in
  PreToolUse)
    TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
    # Avoid ${VAR:-{}} syntax - bash breaks when value ends with }
    TOOL_INPUT="$CLAUDE_TOOL_INPUT"
    [ -z "$TOOL_INPUT" ] && TOOL_INPUT='{}'

    payload=$(jq -cn --arg tool "$TOOL_NAME" --argjson input "$TOOL_INPUT" '{tool: $tool, input: $input}')
    log_event "tool_start" "$payload"
    ;;

  PostToolUse)
    TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
    TOOL_OUTPUT="$CLAUDE_TOOL_OUTPUT"
    [ -z "$TOOL_OUTPUT" ] && TOOL_OUTPUT='{}'

    # Truncate large outputs for log readability
    if [ ${#TOOL_OUTPUT} -gt 2000 ]; then
      payload=$(jq -cn --arg tool "$TOOL_NAME" --arg len "${#TOOL_OUTPUT}" '{tool: $tool, output: {truncated: true, length: ($len | tonumber)}}')
    else
      payload=$(jq -cn --arg tool "$TOOL_NAME" --argjson output "$TOOL_OUTPUT" '{tool: $tool, output: $output}')
    fi
    log_event "tool_end" "$payload"
    ;;

  SubagentStart)
    AGENT_TYPE="${CLAUDE_SUBAGENT_TYPE:-unknown}"
    AGENT_PROMPT="${CLAUDE_SUBAGENT_PROMPT:-}"

    # Truncate long prompts
    if [ ${#AGENT_PROMPT} -gt 500 ]; then
      AGENT_PROMPT="${AGENT_PROMPT:0:500}..."
    fi

    payload=$(jq -cn --arg type "$AGENT_TYPE" --arg prompt "$AGENT_PROMPT" '{type: $type, prompt: $prompt}')
    log_event "subagent_start" "$payload"
    ;;

  SubagentEnd)
    AGENT_TYPE="${CLAUDE_SUBAGENT_TYPE:-unknown}"
    payload=$(jq -cn --arg type "$AGENT_TYPE" '{type: $type}')
    log_event "subagent_end" "$payload"
    ;;

  Stop)
    log_event "session_end" '{"reason":"stop"}'

    # Generate session summary
    if [ -f "$SESSION_LOG" ]; then
      TOOL_COUNT=$(grep -c '"event":"tool_start"' "$SESSION_LOG" 2>/dev/null || echo 0)
      AGENT_COUNT=$(grep -c '"event":"subagent_start"' "$SESSION_LOG" 2>/dev/null || echo 0)

      payload=$(jq -cn --arg tc "$TOOL_COUNT" --arg ac "$AGENT_COUNT" '{tool_calls: ($tc | tonumber), subagent_calls: ($ac | tonumber)}')
      log_event "session_summary" "$payload"
    fi
    ;;

  SessionStart)
    # Clear current.jsonl for fresh session monitoring
    > "$CURRENT_LOG"

    payload=$(jq -cn --arg dir "${CLAUDE_PROJECT_DIR:-unknown}" '{project_dir: $dir}')
    log_event "session_start" "$payload"
    ;;

  *)
    payload=$(jq -cn --arg hook "$HOOK_EVENT" '{hook: $hook}')
    log_event "unknown" "$payload"
    ;;
esac

exit 0
