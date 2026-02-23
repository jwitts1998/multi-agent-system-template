import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

export interface LayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  direction?: 'LR' | 'TB';
  nodesep?: number;
  ranksep?: number;
}

export function getLayoutedElements<N extends Node>(
  nodes: N[],
  edges: Edge[],
  options: LayoutOptions = {},
): { nodes: N[]; edges: Edge[] } {
  const {
    nodeWidth = NODE_WIDTH,
    nodeHeight = NODE_HEIGHT,
    direction = 'LR',
    nodesep = 60,
    ranksep = 250,
  } = options;

  const g = new dagre.graphlib.Graph();

  g.setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: direction,
    nodesep,
    ranksep,
    marginx: 40,
    marginy: 40,
  });

  for (const node of nodes) {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const layoutedNodes: N[] = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    return {
      ...node,
      position: {
        x: dagreNode.x - nodeWidth / 2,
        y: dagreNode.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
