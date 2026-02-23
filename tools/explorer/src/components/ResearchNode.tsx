import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ExplorerNodeData } from '../data/nodes';

export function ResearchNode({ data, selected }: NodeProps) {
  const d = data as ExplorerNodeData;
  const tierClass = d.tier === 1 ? 'node-research-t1' : d.tier === 2 ? 'node-research-t2' : 'node-research-t3';
  const tierBadgeClass = d.tier === 1 ? 'tier-1' : d.tier === 2 ? 'tier-2' : 'tier-3';
  const tierLabel = d.tier === 1 ? 'Primary' : d.tier === 2 ? 'Alternative' : 'Reference';

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: '#475569' }} />
      <div className={`explorer-node ${tierClass} ${selected ? 'selected' : ''}`}>
        <div className="node-title">{d.name}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
          <span className={`tier-badge ${tierBadgeClass}`}>{tierLabel}</span>
          {d.license && <span className="license-badge">{d.license}</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#475569' }} />
    </>
  );
}
