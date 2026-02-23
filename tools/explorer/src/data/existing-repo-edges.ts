import type { Edge } from '@xyflow/react';

export const existingRepoEdges: Edge[] = [
  {
    id: 'er-1-2',
    source: 'existing-1',
    target: 'existing-2',
    animated: true,
    label: 'Configured Project',
  },
  {
    id: 'er-2-3',
    source: 'existing-2',
    target: 'existing-3',
    animated: true,
    label: 'Knowledge Graph',
  },
  {
    id: 'er-3-4',
    source: 'existing-3',
    target: 'existing-4',
    animated: true,
    label: 'Gap Report',
  },
  {
    id: 'er-4-5',
    source: 'existing-4',
    target: 'existing-5',
    animated: true,
    label: 'Generated PDB',
  },
  {
    id: 'er-5-6',
    source: 'existing-5',
    target: 'existing-6',
    animated: true,
    label: 'Validated PDB',
  },
  {
    id: 'er-6-7',
    source: 'existing-6',
    target: 'existing-7',
    animated: true,
    label: 'tasks/*.yml',
  },
  {
    id: 'er-7-8',
    source: 'existing-7',
    target: 'existing-8',
    animated: true,
    label: 'Hardened Codebase',
  },
  {
    id: 'er-8-9',
    source: 'existing-8',
    target: 'existing-9',
    animated: true,
    label: 'Features + Tests',
  },
  // Feedback loop: Quality & Ship back to Feature Development
  {
    id: 'er-feedback',
    source: 'existing-9',
    target: 'existing-8',
    animated: true,
    label: 'Next Cycle',
    type: 'smoothstep',
    style: { stroke: '#f97316', strokeWidth: 2, strokeDasharray: '8 4' },
    labelStyle: { fill: '#fb923c', fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: '#1e293b', fillOpacity: 0.9 },
  },
];
