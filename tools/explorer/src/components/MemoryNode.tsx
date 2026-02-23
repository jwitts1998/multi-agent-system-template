import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ExplorerNodeData } from '../data/nodes';

export function MemoryNode({ data, selected }: NodeProps) {
  const d = data as ExplorerNodeData;

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: '#475569' }} />
      <div className={`explorer-node node-memory ${selected ? 'selected' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          <div className="node-title">{d.name}</div>
        </div>
        <div className="node-subtitle">{d.subcategory || 'Memory'}</div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#475569' }} />
    </>
  );
}
