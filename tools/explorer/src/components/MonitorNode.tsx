import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MonitorNodeData } from '../data/transcript-parser';
import { STATUS_COLORS } from '../data/transcript-parser';

const nodeIcons: Record<string, string> = {
  user: '\u{1F464}',
  agent: '\u{1F916}',
  'tool-cluster': '\u{1F527}',
  subagent: '\u26A1',
};

const toolIcons: Record<string, string> = {
  Read: '\u{1F4C4}',
  Write: '\u270F\uFE0F',
  Shell: '\u{1F4BB}',
  Grep: '\u{1F50D}',
  Glob: '\u{1F4C2}',
  SemanticSearch: '\u{1F9ED}',
  Task: '\u26A1',
  StrReplace: '\u270F\uFE0F',
  WebSearch: '\u{1F310}',
  WebFetch: '\u{1F310}',
  AskQuestion: '\u2753',
  TodoWrite: '\u2705',
  CallMcpTool: '\u{1F50C}',
};

export function MonitorNode({ data, selected }: NodeProps) {
  const d = data as MonitorNodeData;
  const colors = STATUS_COLORS[d.nodeType === 'tool-cluster' ? 'toolCluster' : d.nodeType];
  const icon = nodeIcons[d.nodeType];

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: colors.border }} />
      <div
        className={`monitor-node ${selected ? 'selected' : ''}`}
        style={{
          background: colors.bg,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <div className="monitor-node-header">
          <span className="monitor-node-icon">{icon}</span>
          <span className="monitor-node-role">
            {d.nodeType === 'tool-cluster'
              ? `${d.turn.toolCalls.length} tool${d.turn.toolCalls.length !== 1 ? 's' : ''}`
              : d.nodeType === 'subagent'
                ? 'subagent'
                : d.turn.role}
          </span>
          <span className="monitor-node-tokens" style={{ borderColor: colors.border }}>
            ~{d.turn.estimatedTokens.toLocaleString()} tok
          </span>
        </div>

        <div className="monitor-node-summary">{d.turn.summary}</div>

        {d.nodeType === 'tool-cluster' && (
          <div className="monitor-node-tools">
            {[...new Set(d.turn.toolCalls.map(tc => tc.name))].map(name => (
              <span key={name} className="monitor-tool-pill" style={{ borderColor: colors.border }}>
                {toolIcons[name] || '\u{1F527}'} {name}
              </span>
            ))}
          </div>
        )}

        {d.nodeType === 'agent' && d.turn.toolCalls.length > 0 && (
          <div className="monitor-node-stats">
            <span>{d.turn.toolCalls.length} tool call{d.turn.toolCalls.length !== 1 ? 's' : ''}</span>
            {d.turn.subagentInvocations.length > 0 && (
              <span>{d.turn.subagentInvocations.length} subagent{d.turn.subagentInvocations.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}

        <div className="monitor-node-index" style={{ color: colors.border }}>
          #{d.turn.index + 1}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: colors.border }} />
    </>
  );
}
