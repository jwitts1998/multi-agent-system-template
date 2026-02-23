import type { Edge } from '@xyflow/react';

export const workflowEdges: Edge[] = [
  {
    id: 'wf-1-2',
    source: 'pipeline-1',
    target: 'pipeline-2',
    animated: true,
    label: 'Idea Summary',
  },
  {
    id: 'wf-2-3',
    source: 'pipeline-2',
    target: 'pipeline-3',
    animated: true,
    label: 'PDB Document',
  },
  {
    id: 'wf-3-4',
    source: 'pipeline-3',
    target: 'pipeline-4',
    animated: true,
    label: 'tasks/*.yml',
  },
  {
    id: 'wf-4-5',
    source: 'pipeline-4',
    target: 'pipeline-5',
    animated: true,
    label: 'Scaffolding',
  },
  {
    id: 'wf-5-6',
    source: 'pipeline-5',
    target: 'pipeline-6',
    animated: true,
    label: 'Production Code',
  },
  {
    id: 'wf-6-7',
    source: 'pipeline-6',
    target: 'pipeline-7',
    animated: true,
    label: 'Test Suites',
  },
  {
    id: 'wf-7-8',
    source: 'pipeline-7',
    target: 'pipeline-8',
    animated: true,
    label: 'Approved',
  },
  {
    id: 'wf-8-9',
    source: 'pipeline-8',
    target: 'pipeline-9',
    animated: true,
    label: 'docs/',
  },
  // Feedback loop: Quality Review back to Feature Development
  {
    id: 'wf-feedback',
    source: 'pipeline-7',
    target: 'pipeline-5',
    animated: true,
    label: 'Issues Found',
    type: 'smoothstep',
    style: { stroke: '#f97316', strokeWidth: 2, strokeDasharray: '8 4' },
    labelStyle: { fill: '#fb923c', fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: '#1e293b', fillOpacity: 0.9 },
  },
];
