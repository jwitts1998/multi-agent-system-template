import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ExplorerNodeData } from '../data/nodes';

const categoryClass: Record<string, string> = {
  'agent-role': 'node-agent-role',
  'generic': 'node-generic',
  'specialist': 'node-specialist',
  'ideation': 'node-ideation',
  'ingestion': 'node-ingestion',
};

const categoryIcon: Record<string, string> = {
  'agent-role': '\u2605',  // star
  'generic': '\u2699',     // gear
  'specialist': '\u26A1',  // lightning
  'ideation': '\u{1F4A1}', // bulb
  'ingestion': '\u{1F4E5}',// inbox
};

export function AgentNode({ data, selected }: NodeProps) {
  const d = data as ExplorerNodeData;
  const cls = categoryClass[d.category] || 'node-generic';
  const icon = categoryIcon[d.category] || '\u2699';

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: '#475569' }} />
      <div className={`explorer-node ${cls} ${selected ? 'selected' : ''}`}>
        <div className="node-title">
          <span style={{ marginRight: 6 }}>{icon}</span>
          {d.name}
        </div>
        <div className="node-subtitle">{d.subcategory || d.category}</div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#475569' }} />
    </>
  );
}
