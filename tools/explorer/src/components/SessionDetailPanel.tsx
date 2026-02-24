import type { Node } from '@xyflow/react';
import type { MonitorNodeData, SessionData } from '../data/transcript-parser';
import { STATUS_COLORS } from '../data/transcript-parser';
import { MODELS, MODEL_IDS, calculateCost, type ModelId } from '../data/model-pricing';

interface SessionDetailPanelProps {
  node: Node | null;
  session: SessionData | null;
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{
        margin: '0 0 8px',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#64748b',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function generateMarkdownExport(session: SessionData, model: ModelId): string {
  const cost = calculateCost(session.inputTokens, session.outputTokens, model);
  const userTurns = session.turns.filter(t => t.role === 'user').length;
  const agentTurns = session.turns.filter(t => t.role === 'assistant').length;

  const toolFrequency: Record<string, number> = {};
  for (const turn of session.turns) {
    for (const tc of turn.toolCalls) {
      toolFrequency[tc.name] = (toolFrequency[tc.name] || 0) + 1;
    }
  }
  const sortedTools = Object.entries(toolFrequency).sort(([, a], [, b]) => b - a);

  let md = `# Session Analysis\n\n`;
  md += `**Generated**: ${new Date().toISOString().slice(0, 10)}\n`;
  md += `**Model**: ${MODELS[model].label}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Total Turns | ${session.turns.length} |\n`;
  md += `| User Messages | ${userTurns} |\n`;
  md += `| Agent Turns | ${agentTurns} |\n`;
  md += `| Estimated Tokens | ~${session.totalTokens.toLocaleString()} |\n`;
  md += `| Input Tokens | ~${session.inputTokens.toLocaleString()} |\n`;
  md += `| Output Tokens | ~${session.outputTokens.toLocaleString()} |\n`;
  md += `| Estimated Cost | $${cost.toFixed(2)} |\n`;
  md += `| Tool Calls | ${session.totalToolCalls} |\n`;
  md += `| Subagent Invocations | ${session.totalSubagents} |\n\n`;

  if (sortedTools.length > 0) {
    md += `## Tool Usage\n\n`;
    md += `| Tool | Count |\n|------|-------|\n`;
    for (const [name, count] of sortedTools) {
      md += `| ${name} | ${count} |\n`;
    }
    md += `\n`;
  }

  if (session.agentTypes.length > 0) {
    md += `## Subagent Types\n\n`;
    md += session.agentTypes.map(t => `- ${t}`).join('\n') + '\n\n';
  }

  md += `## Turn-by-Turn Flow\n\n`;
  for (const turn of session.turns) {
    const icon = turn.role === 'user' ? 'User' : 'Agent';
    md += `### Turn ${turn.index + 1} — ${icon}\n\n`;
    md += `- **Tokens**: ~${turn.estimatedTokens.toLocaleString()}\n`;
    if (turn.toolCalls.length > 0) {
      md += `- **Tools**: ${turn.toolCalls.map(tc => tc.name).join(', ')}\n`;
    }
    if (turn.subagentInvocations.length > 0) {
      md += `- **Subagents**: ${turn.subagentInvocations.map(s => `${s.type} (${s.description})`).join(', ')}\n`;
    }
    md += `- **Summary**: ${turn.summary}\n\n`;
  }

  return md;
}

function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function SessionOverview({ session, selectedModel, onModelChange }: {
  session: SessionData;
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
}) {
  const userTurns = session.turns.filter(t => t.role === 'user').length;
  const agentTurns = session.turns.filter(t => t.role === 'assistant').length;
  const cost = calculateCost(session.inputTokens, session.outputTokens, selectedModel);

  const toolFrequency: Record<string, number> = {};
  for (const turn of session.turns) {
    for (const tc of turn.toolCalls) {
      toolFrequency[tc.name] = (toolFrequency[tc.name] || 0) + 1;
    }
  }
  const sortedTools = Object.entries(toolFrequency)
    .sort(([, a], [, b]) => b - a);

  return (
    <>
      <Section title="Model">
        <select
          value={selectedModel}
          onChange={e => onModelChange(e.target.value as ModelId)}
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 500,
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#e2e8f0',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {MODEL_IDS.map(id => (
            <option key={id} value={id}>{MODELS[id].label}</option>
          ))}
        </select>
      </Section>

      <Section title="Session Stats">
        <div className="monitor-stats-grid">
          <StatCard label="Est. Cost" value={`$${cost.toFixed(2)}`} color="#10b981" />
          <StatCard label="Total Turns" value={session.turns.length} color="#3b82f6" />
          <StatCard label="User Messages" value={userTurns} color="#3b82f6" />
          <StatCard label="Agent Turns" value={agentTurns} color="#22c55e" />
          <StatCard label="Est. Tokens" value={`~${session.totalTokens.toLocaleString()}`} color="#f59e0b" />
          <StatCard label="Input Tokens" value={`~${session.inputTokens.toLocaleString()}`} color="#38bdf8" />
          <StatCard label="Output Tokens" value={`~${session.outputTokens.toLocaleString()}`} color="#fb923c" />
          <StatCard label="Tool Calls" value={session.totalToolCalls} color="#f59e0b" />
          <StatCard label="Subagents" value={session.totalSubagents} color="#a78bfa" />
        </div>
      </Section>

      {sortedTools.length > 0 && (
        <Section title="Tool Usage">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sortedTools.map(([name, count]) => (
              <div key={name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                background: '#0f172a',
                borderRadius: 4,
                fontSize: 12,
              }}>
                <span style={{ color: '#e2e8f0' }}>{name}</span>
                <span style={{
                  color: '#f59e0b',
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {count}x
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {session.agentTypes.length > 0 && (
        <Section title="Subagent Types Used">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {session.agentTypes.map(type => (
              <span key={type} style={{
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 500,
                border: '1px solid #a78bfa',
                color: '#a78bfa',
                background: 'rgba(0,0,0,0.2)',
              }}>
                {type}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section title="Export">
        <button
          onClick={() => {
            const md = generateMarkdownExport(session, selectedModel);
            const filename = `session-analysis-${new Date().toISOString().slice(0, 10)}.md`;
            downloadMarkdown(md, filename);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 500,
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#e2e8f0',
            cursor: 'pointer',
          }}
        >
          Download Session Analysis (.md)
        </button>
      </Section>
    </>
  );
}

function TurnDetail({ node }: { node: Node }) {
  const d = node.data as MonitorNodeData;
  const colors = STATUS_COLORS[d.nodeType === 'tool-cluster' ? 'toolCluster' : d.nodeType];

  return (
    <>
      <Section title="Content">
        <div style={{
          maxHeight: 300,
          overflow: 'auto',
          padding: '10px 12px',
          background: '#0f172a',
          borderRadius: 8,
          border: '1px solid #334155',
          fontSize: 12,
          lineHeight: 1.7,
          color: '#cbd5e1',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {d.turn.text.slice(0, 2000)}
          {d.turn.text.length > 2000 && (
            <span style={{ color: '#64748b' }}>
              {'\n\n'}[... {(d.turn.text.length - 2000).toLocaleString()} more characters]
            </span>
          )}
        </div>
      </Section>

      <Section title="Metrics">
        <div className="monitor-stats-grid">
          <StatCard
            label="Est. Tokens"
            value={`~${d.turn.estimatedTokens.toLocaleString()}`}
            color={colors.border}
          />
          <StatCard
            label="Tool Calls"
            value={d.turn.toolCalls.length}
            color="#f59e0b"
          />
        </div>
      </Section>

      {d.turn.toolCalls.length > 0 && (
        <Section title={`Tool Calls (${d.turn.toolCalls.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {d.turn.toolCalls.map((tc, i) => (
              <div key={i} style={{
                padding: '6px 10px',
                background: '#0f172a',
                borderRadius: 6,
                borderLeft: '3px solid #f59e0b',
              }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fef3c7',
                  marginBottom: 4,
                }}>
                  {tc.name}
                </div>
                {Object.entries(tc.args).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(tc.args).slice(0, 5).map(([k, v]) => (
                      <div key={k} style={{ fontSize: 11, color: '#94a3b8' }}>
                        <span style={{ color: '#7dd3fc' }}>{k}</span>: {v.slice(0, 80)}
                        {v.length > 80 ? '\u2026' : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {d.turn.subagentInvocations.length > 0 && (
        <Section title={`Subagent Invocations (${d.turn.subagentInvocations.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {d.turn.subagentInvocations.map((sub, i) => (
              <div key={i} style={{
                padding: '6px 10px',
                background: '#0f172a',
                borderRadius: 6,
                borderLeft: '3px solid #a78bfa',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e0d4fc' }}>
                  {sub.type}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {sub.description}
                </div>
                {sub.model && (
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                    model: {sub.model}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

export function SessionDetailPanel({ node, session, selectedModel, onModelChange, onClose }: SessionDetailPanelProps) {
  if (!node && !session) return null;

  const isOverview = !node && session;
  const d = node?.data as MonitorNodeData | undefined;
  const colors = d
    ? STATUS_COLORS[d.nodeType === 'tool-cluster' ? 'toolCluster' : d.nodeType]
    : { border: '#3b82f6', text: '#bfdbfe' };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: 420,
      height: '100%',
      background: '#1e293b',
      borderLeft: '1px solid #334155',
      overflow: 'auto',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          {isOverview ? (
            <>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Session Overview
              </div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                {session!.turns.length} Turns
              </h2>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: colors.border, display: 'inline-block',
                }} />
                <span style={{
                  fontSize: 11, color: '#94a3b8',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {d!.nodeType === 'tool-cluster' ? 'Tool Cluster' : d!.turn.role} — Turn #{d!.turn.index + 1}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.text }}>
                {d!.turn.summary}
              </h2>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid #475569',
            borderRadius: 6,
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: 14,
          }}
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', flex: 1, overflow: 'auto' }}>
        {isOverview ? (
          <SessionOverview session={session!} selectedModel={selectedModel} onModelChange={onModelChange} />
        ) : (
          <TurnDetail node={node!} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      padding: '8px 10px',
      background: '#0f172a',
      borderRadius: 6,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{
        fontSize: 18,
        fontWeight: 700,
        color: '#f1f5f9',
        fontFamily: "'SF Mono', 'Fira Code', monospace",
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
        {label}
      </div>
    </div>
  );
}
