import type { Node, Edge } from '@xyflow/react';
import type { DomainNodeData } from '../data/domain-nodes';
import { Section } from './shared/Section';
import { DetailPanelWrapper } from './shared/DetailPanelWrapper';
import { CopyButton } from './shared/CopyButton';
import { Badge } from './ui/badge';

interface DomainDetailPanelProps {
  node: Node;
  allNodes: Node[];
  allEdges: Edge[];
  onClose: () => void;
}

const tierColors: Record<string, { label: string; color: string }> = {
  foundation: { label: 'Foundation', color: '#f59e0b' },
  feature: { label: 'Feature', color: '#3b82f6' },
  experience: { label: 'Experience', color: '#a78bfa' },
  orchestration: { label: 'Orchestration', color: '#34d399' },
};

export function DomainDetailPanel({ node, allNodes, allEdges, onClose }: DomainDetailPanelProps) {
  const d = node.data as DomainNodeData;
  const tier = tierColors[d.phase] || tierColors.feature;

  const connectedEdges = allEdges.filter(e => e.source === node.id || e.target === node.id);
  const dependencyEdges = connectedEdges.filter(e => e.source === node.id && e.label === 'uses');
  const consultEdges = connectedEdges.filter(
    e => (e.source === node.id && e.label === 'consults') || (e.target === node.id && e.label === 'consults')
  );
  const governsEdges = connectedEdges.filter(e => e.source === node.id && e.label === 'governs');

  const findNode = (id: string) => allNodes.find(n => n.id === id);

  const header = (
    <>
      <div className="flex items-center gap-2 mb-1.5">
        <Badge
          className="text-[10px] uppercase tracking-wider font-semibold"
          style={{ backgroundColor: tier.color, color: '#fff', border: 'none' }}
        >
          {d.tierLabel}
        </Badge>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider" style={{ color: tier.color, borderColor: tier.color }}>
          Tier {d.tier}
        </Badge>
      </div>
      <h2 className="m-0 text-lg font-bold text-slate-100">
        {d.name}
      </h2>
    </>
  );

  return (
    <DetailPanelWrapper onClose={onClose} header={header} ariaLabel={`Domain agent: ${d.name}`}>
      <Section title="Scope">
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: '#cbd5e1' }}>
          {d.scope}
        </p>
      </Section>

      {d.modernPractices.length > 0 && (
        <Section title="Modern Practices">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.modernPractices.map((practice, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                fontSize: 12,
                color: '#cbd5e1',
                lineHeight: 1.6,
              }}>
                <span style={{ color: tier.color, fontSize: 8, flexShrink: 0, marginTop: 4 }}>
                  {'\u25CF'}
                </span>
                {practice}
              </div>
            ))}
          </div>
        </Section>
      )}

      {(d.aiApplications.builder.length > 0 || d.aiApplications.consumer.length > 0) && (
        <Section title="AI Applications">
          {d.aiApplications.builder.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 10,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 6,
                fontWeight: 600,
              }}>
                Builder AI
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {d.aiApplications.builder.map((app, i) => (
                  <div key={i} style={{
                    fontSize: 12,
                    color: '#cbd5e1',
                    lineHeight: 1.5,
                    padding: '4px 8px',
                    background: '#0f172a',
                    borderRadius: 4,
                    borderLeft: '2px solid #818cf8',
                  }}>
                    {app}
                  </div>
                ))}
              </div>
            </div>
          )}
          {d.aiApplications.consumer.length > 0 && (
            <div>
              <div style={{
                fontSize: 10,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 6,
                fontWeight: 600,
              }}>
                Consumer AI
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {d.aiApplications.consumer.map((app, i) => (
                  <div key={i} style={{
                    fontSize: 12,
                    color: '#cbd5e1',
                    lineHeight: 1.5,
                    padding: '4px 8px',
                    background: '#0f172a',
                    borderRadius: 4,
                    borderLeft: '2px solid #34d399',
                  }}>
                    {app}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {dependencyEdges.length > 0 && (
        <Section title={`Dependencies (${dependencyEdges.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dependencyEdges.map(edge => {
              const target = findNode(edge.target);
              if (!target) return null;
              const td = target.data as DomainNodeData;
              const tc = tierColors[td.phase];
              return (
                <div key={edge.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  padding: '5px 8px',
                  background: '#0f172a',
                  borderRadius: 4,
                  borderLeft: `3px solid ${tc?.color || '#64748b'}`,
                }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{td.name}</span>
                  <span style={{ color: '#64748b', marginLeft: 'auto', fontSize: 10, textTransform: 'uppercase' }}>
                    {td.tierLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {governsEdges.length > 0 && (
        <Section title={`Governs (${governsEdges.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {governsEdges.map(edge => {
              const target = findNode(edge.target);
              if (!target) return null;
              const td = target.data as DomainNodeData;
              const tc = tierColors[td.phase];
              return (
                <div key={edge.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  padding: '5px 8px',
                  background: '#0f172a',
                  borderRadius: 4,
                  borderLeft: `3px solid ${tc?.color || '#64748b'}`,
                }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{td.name}</span>
                  <span style={{ color: '#64748b', marginLeft: 'auto', fontSize: 10, textTransform: 'uppercase' }}>
                    {td.tierLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {consultEdges.length > 0 && (
        <Section title={`Consulting Relationships (${consultEdges.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {consultEdges.map(edge => {
              const isConsulter = edge.source === node.id;
              const otherId = isConsulter ? edge.target : edge.source;
              const other = findNode(otherId);
              if (!other) return null;
              const od = other.data as DomainNodeData;
              const oc = tierColors[od.phase];
              return (
                <div key={edge.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  padding: '5px 8px',
                  background: '#0f172a',
                  borderRadius: 4,
                  borderLeft: `3px solid ${oc?.color || '#64748b'}`,
                }}>
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>
                    {isConsulter ? '\u2192' : '\u2190'}
                  </span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{od.name}</span>
                  <span style={{ color: '#64748b', marginLeft: 'auto', fontSize: 10 }}>
                    {isConsulter ? 'consults' : 'consulted by'}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {d.monitoringHooks.length > 0 && (
        <Section title={`Monitoring Hooks (${d.monitoringHooks.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.monitoringHooks.map((hook, i) => (
              <div key={i} style={{
                fontSize: 12,
                color: '#94a3b8',
                lineHeight: 1.5,
                padding: '3px 8px',
                background: '#0f172a',
                borderRadius: 4,
              }}>
                {hook}
              </div>
            ))}
          </div>
        </Section>
      )}

      {d.maintenanceTriggers.length > 0 && (
        <Section title={`Maintenance Triggers (${d.maintenanceTriggers.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.maintenanceTriggers.map((trigger, i) => (
              <div key={i} style={{
                fontSize: 12,
                color: '#94a3b8',
                lineHeight: 1.5,
                padding: '3px 8px',
                background: '#0f172a',
                borderRadius: 4,
              }}>
                {trigger}
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Agent File">
        <div className="copyable-code">
          <code>{d.filePath}</code>
          <CopyButton text={d.filePath} label="Copy agent file path" />
        </div>
      </Section>
    </DetailPanelWrapper>
  );
}
