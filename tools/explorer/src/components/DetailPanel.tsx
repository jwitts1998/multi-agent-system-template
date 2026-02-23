import type { Edge, Node } from '@xyflow/react';
import type { ExplorerNodeData } from '../data/nodes';
import type { PipelineNodeData } from '../data/workflow-nodes';
import { categoryMeta } from '../data/nodes';

interface DetailPanelProps {
  node: Node | null;
  viewMode: 'system' | 'workflow';
  allNodes: Node[];
  allEdges: Edge[];
  onClose: () => void;
}

const phaseLabels: Record<string, { label: string; color: string }> = {
  ideate: { label: 'Ideate', color: '#2dd4bf' },
  build: { label: 'Build', color: '#3b82f6' },
  verify: { label: 'Verify', color: '#f59e0b' },
  ship: { label: 'Ship', color: '#22c55e' },
};

const agentRoleColors: Record<string, string> = {
  ideation: '#2dd4bf',
  generic: '#60a5fa',
  specialist: '#818cf8',
  'agent-role': '#3b82f6',
  ingestion: '#f59e0b',
};

export function DetailPanel({ node, viewMode, allNodes, allEdges, onClose }: DetailPanelProps) {
  if (!node) return null;

  if (viewMode === 'workflow' && node.type === 'pipelineNode') {
    return <PipelineDetail node={node} allNodes={allNodes} allEdges={allEdges} onClose={onClose} />;
  }

  return <SystemDetail node={node} allNodes={allNodes} allEdges={allEdges} onClose={onClose} />;
}

function PipelineDetail({
  node,
  allNodes,
  allEdges,
  onClose,
}: {
  node: Node;
  allNodes: Node[];
  allEdges: Edge[];
  onClose: () => void;
}) {
  const d = node.data as PipelineNodeData;
  const phase = phaseLabels[d.phase] || phaseLabels.build;

  const connectedEdges = allEdges.filter(e => e.source === node.id || e.target === node.id);
  const incomingEdge = connectedEdges.find(e => e.target === node.id && e.id !== 'wf-feedback');
  const outgoingEdge = connectedEdges.find(e => e.source === node.id && e.id !== 'wf-feedback');
  const hasFeedbackIn = connectedEdges.some(e => e.id === 'wf-feedback' && e.target === node.id);
  const hasFeedbackOut = connectedEdges.some(e => e.id === 'wf-feedback' && e.source === node.id);

  const prevNode = incomingEdge ? allNodes.find(n => n.id === incomingEdge.source) : null;
  const nextNode = outgoingEdge ? allNodes.find(n => n.id === outgoingEdge.target) : null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: 380,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: phase.color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {d.stageNumber}
            </span>
            <span style={{
              fontSize: 10,
              color: phase.color,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 600,
            }}>
              {phase.label} Phase
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
            {d.title}
          </h2>
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
        <Section title="What Happens">
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: '#cbd5e1' }}>
            {d.description}
          </p>
        </Section>

        <Section title={`Agents Involved (${d.agents.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {d.agents.map((agent, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '5px 8px',
                background: '#0f172a',
                borderRadius: 6,
                borderLeft: `3px solid ${agentRoleColors[agent.role] || '#64748b'}`,
              }}>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{agent.name}</span>
                <span style={{ color: '#64748b', marginLeft: 'auto', fontSize: 10, textTransform: 'uppercase' }}>
                  {agent.role}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Sub-Steps">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.substeps.map((step, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
                fontSize: 13,
                color: '#cbd5e1',
                lineHeight: 1.6,
              }}>
                <span style={{
                  color: phase.color,
                  fontWeight: 700,
                  fontSize: 11,
                  width: 16,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Output Artifact">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '8px 10px',
            background: '#0f172a',
            borderRadius: 6,
          }}>
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#f1f5f9',
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}>
              {d.artifact}
            </span>
            {d.artifactPath && (
              <code style={{ fontSize: 11, color: '#7dd3fc' }}>
                {d.artifactPath}
              </code>
            )}
          </div>
        </Section>

        <Section title="Template Files">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.templateFiles.map((file, i) => (
              <code key={i} style={{
                fontSize: 11,
                background: '#0f172a',
                padding: '4px 8px',
                borderRadius: 4,
                color: '#7dd3fc',
                display: 'block',
                wordBreak: 'break-all',
              }}>
                {file}
              </code>
            ))}
          </div>
        </Section>

        <Section title="Handoff">
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: '#94a3b8' }}>
            {d.handoff}
          </p>
        </Section>

        {/* Flow context */}
        <Section title="Pipeline Position">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {prevNode && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '4px 8px',
                background: '#0f172a',
                borderRadius: 4,
              }}>
                <span style={{ color: '#64748b' }}>{'\u2190'}</span>
                <span style={{ color: '#e2e8f0' }}>
                  {(prevNode.data as PipelineNodeData).title}
                </span>
                <span style={{ color: '#64748b', marginLeft: 'auto', fontSize: 10 }}>
                  {incomingEdge?.label?.toString() || ''}
                </span>
              </div>
            )}
            {nextNode && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '4px 8px',
                background: '#0f172a',
                borderRadius: 4,
              }}>
                <span style={{ color: '#64748b' }}>{'\u2192'}</span>
                <span style={{ color: '#e2e8f0' }}>
                  {(nextNode.data as PipelineNodeData).title}
                </span>
                <span style={{ color: '#64748b', marginLeft: 'auto', fontSize: 10 }}>
                  {outgoingEdge?.label?.toString() || ''}
                </span>
              </div>
            )}
            {hasFeedbackIn && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '4px 8px',
                background: '#1a1200',
                borderRadius: 4,
                borderLeft: '3px solid #f97316',
              }}>
                <span style={{ color: '#fb923c' }}>{'\u21A9'}</span>
                <span style={{ color: '#fb923c' }}>Receives feedback from Quality Review</span>
              </div>
            )}
            {hasFeedbackOut && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                padding: '4px 8px',
                background: '#1a1200',
                borderRadius: 4,
                borderLeft: '3px solid #f97316',
              }}>
                <span style={{ color: '#fb923c' }}>{'\u21AA'}</span>
                <span style={{ color: '#fb923c' }}>Sends issues back to Development</span>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

function SystemDetail({
  node,
  allNodes,
  allEdges,
  onClose,
}: {
  node: Node;
  allNodes: Node[];
  allEdges: Edge[];
  onClose: () => void;
}) {
  const d = node.data as ExplorerNodeData;
  const meta = categoryMeta[d.category];

  const connectedEdges = allEdges.filter(e => e.source === node.id || e.target === node.id);
  const connectedNodeIds = new Set(
    connectedEdges.flatMap(e => [e.source, e.target]).filter(id => id !== node.id)
  );
  const connectedNodes = allNodes.filter(n => connectedNodeIds.has(n.id));

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: 360,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="category-dot" style={{ backgroundColor: meta?.color }} />
            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {meta?.label}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
            {d.name}
          </h2>
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
        <Section title="Description">
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#cbd5e1' }}>
            {d.description}
          </p>
        </Section>

        {d.filePath && (
          <Section title="File Path">
            <code style={{
              fontSize: 12,
              background: '#0f172a',
              padding: '4px 8px',
              borderRadius: 4,
              color: '#7dd3fc',
              display: 'block',
              wordBreak: 'break-all',
            }}>
              {d.filePath}
            </code>
          </Section>
        )}

        {d.category === 'research' && (
          <>
            {d.tier && (
              <Section title="Recommendation Tier">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`tier-badge tier-${d.tier}`}>
                    {d.tier === 1 ? 'Tier 1 -- Primary' : d.tier === 2 ? 'Tier 2 -- Alternative' : 'Tier 3 -- Reference'}
                  </span>
                </div>
              </Section>
            )}
            {d.license && (
              <Section title="License">
                <span className="license-badge" style={{ fontSize: 12 }}>{d.license}</span>
              </Section>
            )}
            {d.repoUrl && (
              <Section title="Repository">
                <a
                  href={d.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#60a5fa', fontSize: 13, wordBreak: 'break-all' }}
                >
                  {d.repoUrl}
                </a>
              </Section>
            )}
            {d.subcategory && (
              <Section title="Research Category">
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{d.subcategory}</span>
              </Section>
            )}
          </>
        )}

        {connectedNodes.length > 0 && (
          <Section title={`Connected (${connectedNodes.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {connectedNodes.map(cn => {
                const cnData = cn.data as ExplorerNodeData;
                const cnMeta = categoryMeta[cnData.category];
                const edge = connectedEdges.find(
                  e => (e.source === node.id && e.target === cn.id) || (e.target === node.id && e.source === cn.id)
                );
                const direction = edge && edge.source === node.id ? '\u2192' : '\u2190';
                return (
                  <div key={cn.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    padding: '4px 8px',
                    background: '#0f172a',
                    borderRadius: 4,
                  }}>
                    <span className="category-dot" style={{ backgroundColor: cnMeta?.color }} />
                    <span style={{ color: '#e2e8f0' }}>{cnData.name}</span>
                    <span style={{ color: '#64748b', marginLeft: 'auto', fontSize: 11 }}>
                      {direction} {edge?.label || ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
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
