import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type Node,
  type Edge,
  type NodeChange,
  applyNodeChanges,
  BackgroundVariant,
} from '@xyflow/react';
import { nodes as rawNodes, categoryMeta, type ExplorerNode, type ExplorerNodeData, type NodeCategory } from './data/nodes';
import { edges as allEdges } from './data/edges';
import { workflowNodes as rawWorkflowNodes } from './data/workflow-nodes';
import { workflowEdges } from './data/workflow-edges';
import { existingRepoNodes as rawExistingRepoNodes } from './data/existing-repo-nodes';
import { existingRepoEdges } from './data/existing-repo-edges';
import { contextWorkflowNodes as rawContextNodes } from './data/context-workflow-nodes';
import { contextWorkflowEdges } from './data/context-workflow-edges';
import { getLayoutedElements } from './data/layout';
import { parseTranscript, parseTxtTranscript, sessionToNodes, type SessionData, type MonitorNodeData, STATUS_COLORS } from './data/transcript-parser';
import { DEMO_TRANSCRIPT } from './data/demo-transcript';
import { calculateCost, type ModelId } from './data/model-pricing';
import { AgentNode } from './components/AgentNode';
import { MemoryNode } from './components/MemoryNode';
import { ResearchNode } from './components/ResearchNode';
import { ConfigNode } from './components/ConfigNode';
import { PipelineNode } from './components/PipelineNode';
import { MonitorNode } from './components/MonitorNode';
import { DetailPanel } from './components/DetailPanel';
import { Legend } from './components/Legend';
import { FileDropZone } from './components/FileDropZone';
import { SessionDetailPanel } from './components/SessionDetailPanel';
import { Timeline } from './components/Timeline';

export type ViewMode = 'system' | 'newIdea' | 'existingRepo' | 'contextToMvp' | 'monitor';

const nodeTypes: NodeTypes = {
  agentNode: AgentNode,
  memoryNode: MemoryNode,
  researchNode: ResearchNode,
  configNode: ConfigNode,
  pipelineNode: PipelineNode,
  monitorNode: MonitorNode,
};

const { nodes: systemNodes } = getLayoutedElements(rawNodes, allEdges);
const { nodes: newIdeaNodes } = getLayoutedElements(rawWorkflowNodes, workflowEdges, {
  nodeWidth: 280,
  nodeHeight: 280,
  ranksep: 180,
  nodesep: 50,
});
const { nodes: existingRepoLayoutNodes } = getLayoutedElements(rawExistingRepoNodes, existingRepoEdges, {
  nodeWidth: 280,
  nodeHeight: 280,
  ranksep: 180,
  nodesep: 50,
});
const { nodes: contextMvpLayoutNodes } = getLayoutedElements(rawContextNodes, contextWorkflowEdges, {
  nodeWidth: 280,
  nodeHeight: 280,
  ranksep: 180,
  nodesep: 50,
});

interface LoadedSession {
  session: SessionData;
  nodes: Node[];
  edges: Edge[];
  filename: string;
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('system');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<Set<NodeCategory>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const [sysNodes, setSysNodes] = useState<Node[]>(systemNodes);
  const [ideaNodes, setIdeaNodes] = useState<Node[]>(newIdeaNodes);
  const [repoNodes, setRepoNodes] = useState<Node[]>(existingRepoLayoutNodes);
  const [contextMvpNodes, setContextMvpNodes] = useState<Node[]>(contextMvpLayoutNodes);

  const [sessions, setSessions] = useState<LoadedSession[]>([]);
  const [activeSessionIndex, setActiveSessionIndex] = useState(-1);
  const [showAddSessionOverlay, setShowAddSessionOverlay] = useState(false);
  const [showSessionOverview, setShowSessionOverview] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>('claude-sonnet-4');
  const [monitorSearchQuery, setMonitorSearchQuery] = useState('');

  const activeLoadedSession = activeSessionIndex >= 0 ? sessions[activeSessionIndex] ?? null : null;
  const monitorSession = activeLoadedSession?.session ?? null;
  const monitorNodes = activeLoadedSession?.nodes ?? [];
  const monitorEdges = activeLoadedSession?.edges ?? [];
  const sessionFilename = activeLoadedSession?.filename ?? null;

  const loadSession = useCallback((content: string, filename: string) => {
    const isJsonl = filename.endsWith('.jsonl') || content.trim().startsWith('{');
    const session = isJsonl ? parseTranscript(content) : parseTxtTranscript(content);

    const { nodes: rawMonNodes, edges: monEdges } = sessionToNodes(session);
    const { nodes: layoutedMonNodes } = getLayoutedElements(rawMonNodes, monEdges, {
      nodeWidth: 260,
      nodeHeight: 160,
      ranksep: 120,
      nodesep: 80,
    });

    const newEntry: LoadedSession = { session, nodes: layoutedMonNodes, edges: monEdges, filename };
    setSessions(prev => {
      const next = [...prev, newEntry];
      setActiveSessionIndex(next.length - 1);
      return next;
    });
    setSelectedNode(null);
    setShowSessionOverview(true);
    setShowAddSessionOverlay(false);
  }, []);

  const loadDemoSession = useCallback(() => {
    loadSession(DEMO_TRANSCRIPT, 'demo-session.jsonl');
  }, [loadSession]);

  const removeSession = useCallback((index: number) => {
    setSessions(prev => {
      const next = prev.filter((_, i) => i !== index);
      setActiveSessionIndex(prevIdx => {
        if (next.length === 0) return -1;
        if (index === prevIdx) return Math.min(index, next.length - 1);
        if (index < prevIdx) return prevIdx - 1;
        return prevIdx;
      });
      return next;
    });
    setSelectedNode(null);
    setShowSessionOverview(false);
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    if (viewMode === 'system') {
      setSysNodes(prev => applyNodeChanges(changes, prev));
    } else if (viewMode === 'newIdea') {
      setIdeaNodes(prev => applyNodeChanges(changes, prev));
    } else if (viewMode === 'existingRepo') {
      setRepoNodes(prev => applyNodeChanges(changes, prev));
    } else if (viewMode === 'contextToMvp') {
      setContextMvpNodes(prev => applyNodeChanges(changes, prev));
    } else {
      setSessions(prev => {
        if (activeSessionIndex < 0 || activeSessionIndex >= prev.length) return prev;
        const updated = [...prev];
        updated[activeSessionIndex] = {
          ...updated[activeSessionIndex],
          nodes: applyNodeChanges(changes, updated[activeSessionIndex].nodes),
        };
        return updated;
      });
    }
  }, [viewMode, activeSessionIndex]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowSessionOverview(false);
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
    return sysNodes.filter(n => {
      const d = n.data as ExplorerNodeData;
      if (hiddenCategories.has(d.category)) return false;
      if (query && !d.name.toLowerCase().includes(query) && !d.description.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [sysNodes, hiddenCategories, searchQuery]);

  const visibleSystemNodeIds = useMemo(() => new Set(filteredSystemNodes.map(n => n.id)), [filteredSystemNodes]);

  const filteredSystemEdges = useMemo(() => {
    return allEdges.filter(e => visibleSystemNodeIds.has(e.source) && visibleSystemNodeIds.has(e.target));
  }, [visibleSystemNodeIds]);

  const { filteredMonitorNodes, monitorMatchCount } = useMemo(() => {
    const query = monitorSearchQuery.toLowerCase().trim();
    if (!query) return { filteredMonitorNodes: monitorNodes, monitorMatchCount: null };

    let matching = 0;
    const filtered = monitorNodes.map(node => {
      const d = node.data as MonitorNodeData;
      const hit =
        d.turn.summary.toLowerCase().includes(query) ||
        d.turn.text.toLowerCase().includes(query) ||
        d.turn.toolCalls.some(tc => tc.name.toLowerCase().includes(query)) ||
        d.nodeType.toLowerCase().includes(query);

      if (hit) {
        matching++;
        return node;
      }
      return { ...node, style: { ...node.style, opacity: 0.25 } };
    });

    return {
      filteredMonitorNodes: filtered,
      monitorMatchCount: { matching, total: monitorNodes.length },
    };
  }, [monitorNodes, monitorSearchQuery]);

  const activeNodes = viewMode === 'system'
    ? filteredSystemNodes
    : viewMode === 'newIdea'
      ? ideaNodes
      : viewMode === 'existingRepo'
        ? repoNodes
        : viewMode === 'contextToMvp'
          ? contextMvpNodes
          : filteredMonitorNodes;

  const activeEdges = viewMode === 'system'
    ? filteredSystemEdges
    : viewMode === 'newIdea'
      ? workflowEdges
      : viewMode === 'existingRepo'
        ? existingRepoEdges
        : viewMode === 'contextToMvp'
          ? contextWorkflowEdges
          : monitorEdges;

  const minimapNodeColor = useCallback((node: Node) => {
    if (viewMode === 'monitor') {
      const d = node.data as MonitorNodeData;
      const key = d.nodeType === 'tool-cluster' ? 'toolCluster' : d.nodeType;
      return STATUS_COLORS[key]?.border || '#64748b';
    }
    if (viewMode !== 'system') {
      const phase = (node.data as Record<string, unknown>).phase as string;
      const phaseColorMap: Record<string, string> = {
        setup: '#94a3b8',
        ingest: '#f59e0b',
        ideate: '#2dd4bf',
        build: '#3b82f6',
        verify: '#f59e0b',
        ship: '#22c55e',
        operate: '#c084fc',
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

  const showMonitorDropZone = viewMode === 'monitor' && sessions.length === 0;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showMonitorDropZone ? (
        <div style={{ width: '100%', height: '100%', background: '#0f172a', position: 'relative' }}>
          <FileDropZone onFileLoaded={loadSession} />
          <button
            onClick={loadDemoSession}
            style={{
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 500,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: '#94a3b8',
              cursor: 'pointer',
              zIndex: 6,
            }}
          >
            Load demo session
          </button>
        </div>
      ) : (
        <ReactFlow
          nodes={activeNodes}
          edges={activeEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
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
      )}

      {viewMode === 'monitor' && showAddSessionOverlay && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 20,
          background: 'rgba(15, 23, 42, 0.9)',
        }}>
          <FileDropZone onFileLoaded={loadSession} />
          <button
            onClick={() => setShowAddSessionOverlay(false)}
            style={{
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 500,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: '#94a3b8',
              cursor: 'pointer',
              zIndex: 21,
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* View toggle tabs */}
      <div className="view-toggle">
        <button
          className={viewMode === 'system' ? 'active' : ''}
          onClick={() => handleViewChange('system')}
        >
          System Map
        </button>
        <button
          className={viewMode === 'newIdea' ? 'active' : ''}
          onClick={() => handleViewChange('newIdea')}
        >
          New Idea
        </button>
        <button
          className={viewMode === 'existingRepo' ? 'active' : ''}
          onClick={() => handleViewChange('existingRepo')}
        >
          Existing Repo
        </button>
        <button
          className={viewMode === 'contextToMvp' ? 'active' : ''}
          onClick={() => handleViewChange('contextToMvp')}
        >
          Context to MVP
        </button>
        <button
          className={viewMode === 'monitor' ? 'active' : ''}
          onClick={() => handleViewChange('monitor')}
          style={viewMode === 'monitor' ? {} : { borderLeft: '1px solid #334155' }}
        >
          Session Monitor
        </button>
      </div>

      {viewMode === 'monitor' && monitorSession && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 10,
          padding: 16,
          maxWidth: 220,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            Session Monitor
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sessions ({sessions.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 120, overflowY: 'auto' }}>
              {sessions.map((s, i) => (
                <div
                  key={s.session.id}
                  onClick={() => {
                    setActiveSessionIndex(i);
                    setSelectedNode(null);
                    setShowSessionOverview(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    fontSize: 11,
                    borderRadius: 4,
                    cursor: 'pointer',
                    background: i === activeSessionIndex ? '#0f172a' : 'transparent',
                    borderLeft: i === activeSessionIndex ? '3px solid #3b82f6' : '3px solid transparent',
                    color: i === activeSessionIndex ? '#e2e8f0' : '#94a3b8',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.filename.length > 20 ? s.filename.slice(0, 20) + '\u2026' : s.filename}
                    </span>
                    <span style={{ fontSize: 9, color: '#64748b', flexShrink: 0 }}>
                      {s.session.turns.length}t
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSession(i);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: 13,
                      padding: '0 2px',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAddSessionOverlay(true)}
              style={{
                marginTop: 6,
                width: '100%',
                padding: '4px 8px',
                fontSize: 11,
                background: '#0f172a',
                border: '1px dashed #334155',
                borderRadius: 6,
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              + Add Session
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
            <div className="monitor-legend-item">
              <span className="monitor-legend-dot" style={{ background: '#3b82f6' }} />
              User Input
            </div>
            <div className="monitor-legend-item">
              <span className="monitor-legend-dot" style={{ background: '#22c55e' }} />
              Agent Turn
            </div>
            <div className="monitor-legend-item">
              <span className="monitor-legend-dot" style={{ background: '#f59e0b' }} />
              Tool Calls
            </div>
            <div className="monitor-legend-item">
              <span className="monitor-legend-dot" style={{ background: '#a78bfa' }} />
              Subagent
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Search nodes..."
              value={monitorSearchQuery}
              onChange={e => setMonitorSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                paddingRight: monitorSearchQuery ? 28 : 10,
                fontSize: 12,
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#e2e8f0',
                outline: 'none',
                boxSizing: 'border-box' as const,
              }}
            />
            {monitorSearchQuery && (
              <button
                onClick={() => setMonitorSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: '0 2px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
          {monitorMatchCount && (
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>
              {monitorMatchCount.matching} of {monitorMatchCount.total} nodes match
            </div>
          )}

          <div className="monitor-session-bar">
            <div className="monitor-session-stat">
              <strong>{monitorSession.turns.length}</strong> turns
            </div>
            <div className="monitor-session-stat">
              <strong>~{monitorSession.totalTokens.toLocaleString()}</strong> tok
            </div>
            <div className="monitor-session-stat">
              <strong style={{ color: '#10b981' }}>
                ${calculateCost(monitorSession.inputTokens, monitorSession.outputTokens, selectedModel).toFixed(2)}
              </strong> est.
            </div>
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
            <button
              onClick={() => { setSelectedNode(null); setShowSessionOverview(true); }}
              style={{
                flex: 1,
                padding: '5px 8px',
                fontSize: 11,
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              Overview
            </button>
            <button
              onClick={() => removeSession(activeSessionIndex)}
              style={{
                flex: 1,
                padding: '5px 8px',
                fontSize: 11,
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              Close Session
            </button>
          </div>

          <div style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #334155',
            fontSize: 10,
            color: '#64748b',
            lineHeight: 1.5,
          }}>
            Click a node for details. Click Overview for session summary.
          </div>
        </div>
      )}

      {viewMode !== 'monitor' && (
        <>
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
            allNodes={activeNodes}
            allEdges={activeEdges}
            onClose={() => setSelectedNode(null)}
          />
        </>
      )}

      {viewMode === 'monitor' && monitorSession && (selectedNode || showSessionOverview) && (
        <SessionDetailPanel
          node={selectedNode}
          session={selectedNode ? null : monitorSession}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onClose={() => { setSelectedNode(null); setShowSessionOverview(false); }}
        />
      )}

      {viewMode === 'monitor' && monitorSession && (
        <Timeline
          session={monitorSession}
          selectedTurnIndex={
            selectedNode && (selectedNode.data as MonitorNodeData).turn
              ? (selectedNode.data as MonitorNodeData).turn.index
              : null
          }
          onTurnClick={(turnIndex) => {
            const target = monitorNodes.find(n => {
              const d = n.data as MonitorNodeData;
              return d.turn && d.turn.index === turnIndex && (d.nodeType === 'user' || d.nodeType === 'agent');
            });
            if (target) {
              setSelectedNode(target);
              setShowSessionOverview(false);
            }
          }}
        />
      )}
    </div>
  );
}
