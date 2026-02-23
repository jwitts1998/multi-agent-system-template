import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type Node,
  BackgroundVariant,
} from '@xyflow/react';
import { nodes as rawNodes, categoryMeta, type ExplorerNode, type ExplorerNodeData, type NodeCategory } from './data/nodes';
import { edges as allEdges } from './data/edges';
import { workflowNodes as rawWorkflowNodes } from './data/workflow-nodes';
import { workflowEdges } from './data/workflow-edges';
import { getLayoutedElements } from './data/layout';
import { AgentNode } from './components/AgentNode';
import { MemoryNode } from './components/MemoryNode';
import { ResearchNode } from './components/ResearchNode';
import { ConfigNode } from './components/ConfigNode';
import { PipelineNode } from './components/PipelineNode';
import { DetailPanel } from './components/DetailPanel';
import { Legend } from './components/Legend';

type ViewMode = 'system' | 'workflow';

const nodeTypes: NodeTypes = {
  agentNode: AgentNode,
  memoryNode: MemoryNode,
  researchNode: ResearchNode,
  configNode: ConfigNode,
  pipelineNode: PipelineNode,
};

const { nodes: systemNodes } = getLayoutedElements(rawNodes, allEdges);
const { nodes: pipelineNodes } = getLayoutedElements(rawWorkflowNodes, workflowEdges, {
  nodeWidth: 280,
  nodeHeight: 280,
  ranksep: 180,
  nodesep: 50,
});

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('system');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<Set<NodeCategory>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const toggleCategory = useCallback((category: NodeCategory) => {
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const filteredSystemNodes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return systemNodes.filter(n => {
      const d = n.data as ExplorerNodeData;
      if (hiddenCategories.has(d.category)) return false;
      if (query && !d.name.toLowerCase().includes(query) && !d.description.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [hiddenCategories, searchQuery]);

  const visibleSystemNodeIds = useMemo(() => new Set(filteredSystemNodes.map(n => n.id)), [filteredSystemNodes]);

  const filteredSystemEdges = useMemo(() => {
    return allEdges.filter(e => visibleSystemNodeIds.has(e.source) && visibleSystemNodeIds.has(e.target));
  }, [visibleSystemNodeIds]);

  const activeNodes = viewMode === 'system' ? filteredSystemNodes : pipelineNodes;
  const activeEdges = viewMode === 'system' ? filteredSystemEdges : workflowEdges;

  const minimapNodeColor = useCallback((node: Node) => {
    if (viewMode === 'workflow') {
      const phase = (node.data as Record<string, unknown>).phase as string;
      const phaseColorMap: Record<string, string> = {
        ideate: '#2dd4bf',
        build: '#3b82f6',
        verify: '#f59e0b',
        ship: '#22c55e',
      };
      return phaseColorMap[phase] || '#64748b';
    }
    const d = node.data as ExplorerNodeData;
    return categoryMeta[d.category]?.color || '#64748b';
  }, [viewMode]);

  const handleViewChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setSelectedNode(null);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={activeNodes}
        edges={activeEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { stroke: '#475569', strokeWidth: 1.5 },
          labelStyle: { fill: '#94a3b8', fontSize: 10 },
          labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 3,
        }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={20} size={1} />
        <Controls position="bottom-right" />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(15, 23, 42, 0.7)"
          position="bottom-left"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* View toggle tabs */}
      <div className="view-toggle">
        <button
          className={viewMode === 'system' ? 'active' : ''}
          onClick={() => handleViewChange('system')}
        >
          System Map
        </button>
        <button
          className={viewMode === 'workflow' ? 'active' : ''}
          onClick={() => handleViewChange('workflow')}
        >
          Example Workflow
        </button>
      </div>

      <Legend
        viewMode={viewMode}
        hiddenCategories={hiddenCategories}
        onToggleCategory={toggleCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <DetailPanel
        node={selectedNode}
        viewMode={viewMode}
        allNodes={viewMode === 'system' ? systemNodes : pipelineNodes}
        allEdges={activeEdges}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
