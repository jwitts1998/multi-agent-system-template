# Claude Code Hooks

This directory contains hooks that integrate Claude Code sessions with the Command Center dashboard.

## Session Logger

**File:** `session-logger.sh`

Logs all tool usage, subagent activity, and session events to `.claude/logs/` in JSONL format for real-time monitoring.

### Events Captured

| Event | Description | Data Logged |
|-------|-------------|-------------|
| `session_start` | Session begins | Project directory |
| `tool_start` | Tool call initiated | Tool name, input args |
| `tool_end` | Tool call completed | Tool name, output (truncated) |
| `subagent_start` | Subagent delegated | Agent type, prompt |
| `subagent_end` | Subagent completed | Agent type |
| `session_end` | Session stops | Reason |
| `session_summary` | End-of-session stats | Tool count, subagent count |

### Log Files

```
.claude/logs/
├── current.jsonl          # Real-time log (cleared each session)
├── session_<id>.jsonl     # Per-session archive
└── .gitkeep
```

### Log Format (JSONL)

Each line is a JSON object:

```json
{"timestamp":"2026-03-03T20:30:00Z","session_id":"abc123","event":"tool_start","data":{"tool":"Read","input":{"file_path":"/src/app.ts"}}}
```

### Activation

Hooks are configured in `.claude/settings.local.json` (gitignored, user-specific):

```json
{
  "hooks": {
    "PreToolUse": [{"matcher": "*", "hooks": [".claude/hooks/session-logger.sh PreToolUse"]}],
    "PostToolUse": [{"matcher": "*", "hooks": [".claude/hooks/session-logger.sh PostToolUse"]}],
    "Stop": [{"matcher": "*", "hooks": [".claude/hooks/session-logger.sh Stop"]}]
  }
}
```

### Dashboard Integration

The Command Center dashboard (`tools/explorer/`) reads these logs to display:
- Real-time session activity
- Tool usage patterns
- Subagent delegation flow
- Token usage estimates

To enable live monitoring, run the dashboard and the logs will auto-refresh.
