import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ExplorerNodeData } from '../data/nodes';

const categoryClass: Record<string, string> = {
  'config': 'node-config',
  'workflow': 'node-workflow',
  'task': 'node-task',
};

const categoryIcon: Record<string, string> = {
  'config': '\u{1F4C4}',   // page
  'workflow': '\u{1F504}',  // arrows
  'task': '\u{1F4CB}',      // clipboard
};

export function ConfigNode({ data, selected }: NodeProps) {
  const d = data as ExplorerNodeData;
  const cls = categoryClass[d.category] || 'node-config';
  const icon = categoryIcon[d.category] || '\u{1F4C4}';

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
