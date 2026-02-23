import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { PipelineNodeData } from '../data/workflow-nodes';

const phaseColors: Record<
  string,
  { bg: string; border: string; text: string; badge: string; badgeText: string }
> = {
  setup: {
    bg: '#1e293b',
    border: '#94a3b8',
    text: '#e2e8f0',
    badge: '#64748b',
    badgeText: '#f8fafc',
  },
  ingest: {
    bg: '#2a1a04',
    border: '#f59e0b',
    text: '#fef3c7',
    badge: '#d97706',
    badgeText: '#fffbeb',
  },
  ideate: {
    bg: '#0f2d2b',
    border: '#2dd4bf',
    text: '#ccfbf1',
    badge: '#0d9488',
    badgeText: '#f0fdfa',
  },
  build: {
    bg: '#172554',
    border: '#3b82f6',
    text: '#bfdbfe',
    badge: '#2563eb',
    badgeText: '#eff6ff',
  },
  verify: {
    bg: '#2a1a04',
    border: '#f59e0b',
    text: '#fef3c7',
    badge: '#d97706',
    badgeText: '#fffbeb',
  },
  ship: {
    bg: '#052e16',
    border: '#22c55e',
    text: '#dcfce7',
    badge: '#16a34a',
    badgeText: '#f0fdf4',
  },
};

const agentRoleColors: Record<string, string> = {
  ideation: '#2dd4bf',
  generic: '#60a5fa',
  specialist: '#818cf8',
  'agent-role': '#3b82f6',
  ingestion: '#f59e0b',
};

export function PipelineNode({ data, selected }: NodeProps) {
  const d = data as PipelineNodeData;
  const colors = phaseColors[d.phase] || phaseColors.build;
  const promptCount = d.examplePrompts?.length || 0;
  const hasCommands = d.commands && d.commands.length > 0;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: colors.border, width: 8, height: 8 }}
      />
      <div
        className={`pipeline-node ${selected ? 'selected' : ''}`}
        style={{
          background: colors.bg,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <div className="pipeline-header">
          <div
            className="pipeline-stage-badge"
            style={{ background: colors.badge, color: colors.badgeText }}
          >
            {d.stageNumber}
          </div>
          <div className="pipeline-title">{d.title}</div>
        </div>

        {d.agents.length > 0 && (
          <div className="pipeline-agents">
            {d.agents.map((agent, i) => (
              <span
                key={i}
                className="pipeline-agent-pill"
                style={{
                  borderColor: agentRoleColors[agent.role] || '#64748b',
                  color: agentRoleColors[agent.role] || '#94a3b8',
                }}
              >
                {agent.name}
              </span>
            ))}
          </div>
        )}

        <div className="pipeline-substeps">
          {d.substeps.map((step, i) => (
            <div key={i} className="pipeline-substep">
              <span
                className="pipeline-substep-num"
                style={{ color: colors.badge }}
              >
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>

        {(promptCount > 0 || hasCommands) && (
          <div className="pipeline-indicators">
            {hasCommands && (
              <span className="pipeline-indicator-pill" style={{ borderColor: '#64748b', color: '#94a3b8' }}>
                {d.commands!.length} cmd{d.commands!.length > 1 ? 's' : ''}
              </span>
            )}
            {promptCount > 0 && (
              <span className="pipeline-indicator-pill" style={{ borderColor: colors.border, color: colors.border }}>
                {promptCount} prompt{promptCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        <div className="pipeline-artifact" style={{ borderColor: colors.border }}>
          <span className="pipeline-artifact-label">Output</span>
          <span className="pipeline-artifact-value">{d.artifact}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: colors.border, width: 8, height: 8 }}
      />
    </>
  );
}
