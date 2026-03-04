import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { nodes as rawNodes, categoryMeta, type ExplorerNodeData, type NodeCategory } from './data/nodes';
import { edges as allEdges } from './data/edges';
import { workflowNodes as rawWorkflowNodes } from './data/workflow-nodes';
import { workflowEdges } from './data/workflow-edges';
import { existingRepoNodes as rawExistingRepoNodes } from './data/existing-repo-nodes';
import { existingRepoEdges } from './data/existing-repo-edges';
import { contextWorkflowNodes as rawContextNodes } from './data/context-workflow-nodes';
import { contextWorkflowEdges } from './data/context-workflow-edges';
import { domainNodes as rawDomainNodes, type CalibrationState, type DomainNodeData } from './data/domain-nodes';
import { domainEdges } from './data/domain-edges';
import { getLayoutedElements } from './data/layout';
import { parseTranscript, parseTxtTranscript, sessionToNodes, type SessionData, type MonitorNodeData, STATUS_COLORS } from './data/transcript-parser';
import { DEMO_TRANSCRIPT } from './data/demo-transcript';
import { type ModelId } from './data/model-pricing';
import { AgentNode } from './components/AgentNode';
import { MemoryNode } from './components/MemoryNode';
import { ResearchNode } from './components/ResearchNode';
import { ConfigNode } from './components/ConfigNode';
import { PipelineNode } from './components/PipelineNode';
import { MonitorNode } from './components/MonitorNode';
import { DomainNode } from './components/DomainNode';
import { DetailPanel } from './components/DetailPanel';
import { DomainDetailPanel } from './components/DomainDetailPanel';
import { Legend } from './components/Legend';
import { ArchitectureDocsPanel } from './components/ArchitectureDocsPanel';
import { FileDropZone } from './components/FileDropZone';
import { SessionDetailPanel } from './components/SessionDetailPanel';
import { MonitorLegend } from './components/MonitorLegend';
import { ViewToggle } from './components/ViewToggle';
import { Timeline } from './components/Timeline';
import { EmptyState } from './components/shared/EmptyState';
import { useDebounce } from './hooks/useDebounce';

export type ViewMode = 'system' | 'newIdea' | 'existingRepo' | 'contextToMvp' | 'domainArchitecture' | 'monitor';

const VALID_VIEWS = new Set<ViewMode>(['system', 'newIdea', 'existingRepo', 'contextToMvp', 'domainArchitecture', 'monitor']);

function getInitialView(): ViewMode {
  const hash = window.location.hash.replace('#', '');
  return VALID_VIEWS.has(hash as ViewMode) ? (hash as ViewMode) : 'system';
}

const nodeTypes: NodeTypes = {
  agentNode: AgentNode,
  memoryNode: MemoryNode,
  researchNode: ResearchNode,
  configNode: ConfigNode,
  pipelineNode: PipelineNode,
  monitorNode: MonitorNode,
  domainNode: DomainNode,
};

const { nodes: systemNodes } = getLayoutedElements(rawNodes, allEdges);
const { nodes: newIdeaNodes } = getLayoutedElements(rawWorkflowNodes, workflowEdges, {
  nodeWidth: 280, nodeHeight: 280, ranksep: 180, nodesep: 50,
});
const { nodes: existingRepoLayoutNodes } = getLayoutedElements(rawExistingRepoNodes, existingRepoEdges, {
  nodeWidth: 280, nodeHeight: 280, ranksep: 180, nodesep: 50,
});
const { nodes: contextMvpLayoutNodes } = getLayoutedElements(rawContextNodes, contextWorkflowEdges, {
  nodeWidth: 280, nodeHeight: 280, ranksep: 180, nodesep: 50,
});
const { nodes: domainLayoutNodes } = getLayoutedElements(rawDomainNodes, domainEdges, {
  nodeWidth: 240, nodeHeight: 140, direction: 'TB', ranksep: 160, nodesep: 80,
});

interface LoadedSession {
  session: SessionData;
  nodes: Node[];
  edges: Edge[];
  filename: string;
}

const DEMO_CALIBRATION: Record<string, CalibrationState> = {
  'domain-maps-geo': { relevance: 'core', isAiDifferentiator: true },
  'domain-messaging': { relevance: 'core' },
  'domain-search-discovery': { relevance: 'supporting' },
  'domain-payments-billing': { relevance: 'supporting' },
  'domain-notifications': { relevance: 'core' },
  'domain-media-content': { relevance: 'not-applicable' },
  'domain-schema-data': { relevance: 'core' },
  'domain-api-connections': { relevance: 'core' },
  'domain-auth-identity': { relevance: 'core' },
  'domain-infrastructure': { relevance: 'core' },
  'domain-animation-motion': { relevance: 'not-applicable' },
  'domain-accessibility': { relevance: 'supporting' },
  'domain-internationalization': { relevance: 'not-applicable' },
  'domain-performance': { relevance: 'supporting' },
  'domain-analytics-telemetry': { relevance: 'supporting' },
};

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialView);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<Set<NodeCategory>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchDocs, setShowArchDocs] = useState(false);
  const [calibrationActive, setCalibrationActive] = useState(false);

  const [sysNodes, setSysNodes] = useState<Node[]>(systemNodes);
  const [ideaNodes, setIdeaNodes] = useState<Node[]>(newIdeaNodes);
  const [repoNodes, setRepoNodes] = useState<Node[]>(existingRepoLayoutNodes);
  const [contextMvpNodes, setContextMvpNodes] = useState<Node[]>(contextMvpLayoutNodes);
  const [domainNodes, setDomainNodes] = useState<Node[]>(domainLayoutNodes);

  const [sessions, setSessions] = useState<LoadedSession[]>([]);
  const [activeSessionIndex, setActiveSessionIndex] = useState(-1);
  const [showAddSessionOverlay, setShowAddSessionOverlay] = useState(false);
  const [showSessionOverview, setShowSessionOverview] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>('claude-sonnet-4');
  const [monitorSearchQuery, setMonitorSearchQuery] = useState('');
  const [sessionsRestored, setSessionsRestored] = useState(false);

  const activeLoadedSession = activeSessionIndex >= 0 ? sessions[activeSessionIndex] ?? null : null;
  const monitorSession = activeLoadedSession?.session ?? null;
  const monitorNodes = activeLoadedSession?.nodes ?? [];
  const monitorEdges = activeLoadedSession?.edges ?? [];

  // --- Session persistence (raw content stored for reload) ---

  const sessionSourcesRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('explorer-sessions');
      if (saved) {
        const parsed = JSON.parse(saved) as { content: string; filename: string }[];
        const loaded: LoadedSession[] = [];
        for (const { content, filename } of parsed) {
          const isJsonl = filename.endsWith('.jsonl') || content.trim().startsWith('{');
          const session = isJsonl ? parseTranscript(content) : parseTxtTranscript(content);
          const { nodes: rawMonNodes, edges: monEdges } = sessionToNodes(session);
          const { nodes: layoutedMonNodes } = getLayoutedElements(rawMonNodes, monEdges, {
            nodeWidth: 260, nodeHeight: 160, ranksep: 120, nodesep: 80,
          });
          sessionSourcesRef.current.set(session.id, content);
          loaded.push({ session, nodes: layoutedMonNodes, edges: monEdges, filename });
        }
        if (loaded.length > 0) {
          setSessions(loaded);
          setActiveSessionIndex(0);
        }
      }
    } catch {
      // corrupted storage
    }
    setSessionsRestored(true);
  }, []);

  const persistSessions = useCallback((currentSessions: LoadedSession[]) => {
    try {
      const data = currentSessions
        .map(s => {
          const content = sessionSourcesRef.current.get(s.session.id);
          return content ? { content, filename: s.filename } : null;
        })
        .filter(Boolean);
      localStorage.setItem('explorer-sessions', JSON.stringify(data));
    } catch {
      // storage full
    }
  }, []);

  // --- Session management ---

  const loadSession = useCallback((content: string, filename: string) => {
    const isJsonl = filename.endsWith('.jsonl') || content.trim().startsWith('{');
    const session = isJsonl ? parseTranscript(content) : parseTxtTranscript(content);
    const { nodes: rawMonNodes, edges: monEdges } = sessionToNodes(session);
    const { nodes: layoutedMonNodes } = getLayoutedElements(rawMonNodes, monEdges, {
      nodeWidth: 260, nodeHeight: 160, ranksep: 120, nodesep: 80,
    });
    sessionSourcesRef.current.set(session.id, content);
    const newEntry: LoadedSession = { session, nodes: layoutedMonNodes, edges: monEdges, filename };
    setSessions(prev => {
      const next = [...prev, newEntry];
      setActiveSessionIndex(next.length - 1);
      persistSessions(next);
      return next;
    });
    setSelectedNode(null);
    setShowSessionOverview(true);
    setShowAddSessionOverlay(false);
  }, [persistSessions]);

  const loadDemoSession = useCallback(() => {
    loadSession(DEMO_TRANSCRIPT, 'demo-session.jsonl');
  }, [loadSession]);

  const removeSession = useCallback((index: number) => {
    setSessions(prev => {
      const removed = prev[index];
      if (removed) sessionSourcesRef.current.delete(removed.session.id);
      const next = prev.filter((_, i) => i !== index);
      setActiveSessionIndex(prevIdx => {
        if (next.length === 0) return -1;
        if (index === prevIdx) return Math.min(index, next.length - 1);
        if (index < prevIdx) return prevIdx - 1;
        return prevIdx;
      });
      persistSessions(next);
      return next;
    });
    setSelectedNode(null);
    setShowSessionOverview(false);
  }, [persistSessions]);

  // --- Node interaction ---

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    if (viewMode === 'system') setSysNodes(prev => applyNodeChanges(changes, prev));
    else if (viewMode === 'newIdea') setIdeaNodes(prev => applyNodeChanges(changes, prev));
    else if (viewMode === 'existingRepo') setRepoNodes(prev => applyNodeChanges(changes, prev));
    else if (viewMode === 'contextToMvp') setContextMvpNodes(prev => applyNodeChanges(changes, prev));
    else if (viewMode === 'domainArchitecture') setDomainNodes(prev => applyNodeChanges(changes, prev));
    else {
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

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const toggleCategory = useCallback((category: NodeCategory) => {
    setHiddenCategories(prev => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }, []);

  const handleViewChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setSelectedNode(null);
    window.history.pushState(null, '', `#${mode}`);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (VALID_VIEWS.has(hash as ViewMode)) {
        setViewMode(hash as ViewMode);
        setSelectedNode(null);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // --- Keyboard shortcuts ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (e.key === 'Escape') {
        if (showArchDocs) setShowArchDocs(false);
        else if (showAddSessionOverlay) setShowAddSessionOverlay(false);
        else if (selectedNode) setSelectedNode(null);
        else if (showSessionOverview) setShowSessionOverview(false);
        return;
      }

      if (isInput) return;

      const viewKeys: Record<string, ViewMode> = {
        '1': 'system', '2': 'newIdea', '3': 'existingRepo',
        '4': 'contextToMvp', '5': 'domainArchitecture', '6': 'monitor',
      };
      if (viewKeys[e.key]) {
        handleViewChange(viewKeys[e.key]);
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="text"][placeholder*="Search"]');
        searchInput?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showArchDocs, showAddSessionOverlay, selectedNode, showSessionOverview, handleViewChange]);

  // --- Derived data ---

  const calibratedDomainNodes = useMemo(() => {
    if (!calibrationActive) return domainNodes;
    return domainNodes.map(n => {
      const cal = DEMO_CALIBRATION[n.id];
      if (!cal) return n;
      return { ...n, data: { ...n.data as DomainNodeData, calibration: cal } };
    });
  }, [domainNodes, calibrationActive]);

  const filteredSystemNodes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return sysNodes.filter(n => {
      const d = n.data as ExplorerNodeData;
      if (hiddenCategories.has(d.category)) return false;
      if (query && !d.name.toLowerCase().includes(query) && !d.description.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [sysNodes, hiddenCategories, searchQuery]);

  const visibleSystemNodeIds = useMemo(() => new Set(filteredSystemNodes.map(n => n.id)), [filteredSystemNodes]);
  const filteredSystemEdges = useMemo(() => allEdges.filter(e => visibleSystemNodeIds.has(e.source) && visibleSystemNodeIds.has(e.target)), [visibleSystemNodeIds]);

  const debouncedMonitorSearch = useDebounce(monitorSearchQuery, 200);

  const { filteredMonitorNodes, monitorMatchCount } = useMemo(() => {
    const query = debouncedMonitorSearch.toLowerCase().trim();
    if (!query) return { filteredMonitorNodes: monitorNodes, monitorMatchCount: null };
    let matching = 0;
    const filtered = monitorNodes.map(node => {
      const d = node.data as MonitorNodeData;
      const hit = d.turn.summary.toLowerCase().includes(query) ||
        d.turn.text.toLowerCase().includes(query) ||
        d.turn.toolCalls.some(tc => tc.name.toLowerCase().includes(query)) ||
        d.nodeType.toLowerCase().includes(query);
      if (hit) { matching++; return node; }
      return { ...node, style: { ...node.style, opacity: 0.25 } };
    });
    return { filteredMonitorNodes: filtered, monitorMatchCount: { matching, total: monitorNodes.length } };
  }, [monitorNodes, debouncedMonitorSearch]);

  // Apply search filter across workflow and domain views
  const searchFilteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();

    const filterNodes = (nodes: Node[]) => nodes.map(node => {
      const d = node.data as Record<string, unknown>;
      const name = ((d.name || d.title || '') as string).toLowerCase();
      const desc = ((d.description || d.scope || '') as string).toLowerCase();
      const hit = name.includes(query) || desc.includes(query);
      return hit ? node : { ...node, style: { ...node.style, opacity: 0.2 } };
    });

    if (viewMode === 'newIdea') return filterNodes(ideaNodes);
    if (viewMode === 'existingRepo') return filterNodes(repoNodes);
    if (viewMode === 'contextToMvp') return filterNodes(contextMvpNodes);
    if (viewMode === 'domainArchitecture') return filterNodes(calibratedDomainNodes);
    return null;
  }, [searchQuery, viewMode, ideaNodes, repoNodes, contextMvpNodes, calibratedDomainNodes]);

  const activeNodes = viewMode === 'system' ? filteredSystemNodes
    : viewMode === 'newIdea' ? (searchFilteredNodes ?? ideaNodes)
    : viewMode === 'existingRepo' ? (searchFilteredNodes ?? repoNodes)
    : viewMode === 'contextToMvp' ? (searchFilteredNodes ?? contextMvpNodes)
    : viewMode === 'domainArchitecture' ? (searchFilteredNodes ?? calibratedDomainNodes)
    : filteredMonitorNodes;

  const activeEdges = viewMode === 'system' ? filteredSystemEdges
    : viewMode === 'newIdea' ? workflowEdges
    : viewMode === 'existingRepo' ? existingRepoEdges
    : viewMode === 'contextToMvp' ? contextWorkflowEdges
    : viewMode === 'domainArchitecture' ? domainEdges
    : monitorEdges;

  const minimapNodeColor = useCallback((node: Node) => {
    if (viewMode === 'monitor') {
      const d = node.data as MonitorNodeData;
      return STATUS_COLORS[d.nodeType === 'tool-cluster' ? 'toolCluster' : d.nodeType]?.border || '#64748b';
    }
    if (viewMode !== 'system') {
      const phase = (node.data as Record<string, unknown>).phase as string;
      const map: Record<string, string> = {
        setup: '#94a3b8', ingest: '#f59e0b', ideate: '#2dd4bf', build: '#3b82f6',
        verify: '#f59e0b', ship: '#22c55e', operate: '#c084fc', foundation: '#f59e0b',
        feature: '#3b82f6', experience: '#a78bfa', orchestration: '#34d399',
      };
      return map[phase] || '#64748b';
    }
    return categoryMeta[(node.data as ExplorerNodeData).category]?.color || '#64748b';
  }, [viewMode]);

  const showMonitorDropZone = viewMode === 'monitor' && sessions.length === 0;

  // --- Render ---

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showMonitorDropZone ? (
        <div style={{ width: '100%', height: '100%', background: '#0f172a', position: 'relative' }}>
          <FileDropZone onFileLoaded={loadSession} />
          <button
            onClick={loadDemoSession}
            style={{
              position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
              padding: '8px 20px', fontSize: 13, fontWeight: 500, background: '#1e293b',
              border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', zIndex: 6,
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

      {/* Empty state when filters hide everything */}
      {!showMonitorDropZone && activeNodes.length === 0 && (
        <EmptyState
          title="No nodes visible"
          description={viewMode === 'system'
            ? 'All categories are hidden or no nodes match your search. Try clearing the search or enabling more categories.'
            : 'No nodes match the current filter. Try adjusting your search query.'}
        />
      )}

      {/* Add session overlay */}
      {viewMode === 'monitor' && showAddSessionOverlay && (
        <div
          role="dialog" aria-modal="true" aria-label="Add session transcript"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, background: 'rgba(15, 23, 42, 0.9)' }}
        >
          <FileDropZone onFileLoaded={loadSession} />
          <button
            onClick={() => setShowAddSessionOverlay(false)}
            style={{
              position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
              padding: '8px 20px', fontSize: 13, fontWeight: 500, background: '#1e293b',
              border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', zIndex: 21,
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* View toggle */}
      <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />

      {/* Monitor legend */}
      {viewMode === 'monitor' && monitorSession && (
        <MonitorLegend
          sessions={sessions}
          activeSessionIndex={activeSessionIndex}
          monitorSession={monitorSession}
          selectedModel={selectedModel}
          monitorSearchQuery={monitorSearchQuery}
          monitorMatchCount={monitorMatchCount}
          onSelectSession={(i) => { setActiveSessionIndex(i); setSelectedNode(null); setShowSessionOverview(true); }}
          onRemoveSession={removeSession}
          onAddSession={() => setShowAddSessionOverlay(true)}
          onShowOverview={() => { setSelectedNode(null); setShowSessionOverview(true); }}
          onSearchChange={setMonitorSearchQuery}
        />
      )}

      {/* Non-monitor legend and detail panels */}
      {viewMode !== 'monitor' && (
        <>
          <Legend
            viewMode={viewMode}
            hiddenCategories={hiddenCategories}
            onToggleCategory={toggleCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onShowArchDocs={viewMode === 'domainArchitecture' ? () => setShowArchDocs(true) : undefined}
            onShowCalibration={viewMode === 'domainArchitecture' ? () => setCalibrationActive(prev => !prev) : undefined}
            hasCalibration={calibrationActive}
          />

          {viewMode === 'domainArchitecture' && selectedNode && selectedNode.type === 'domainNode' ? (
            <DomainDetailPanel node={selectedNode} allNodes={activeNodes} allEdges={activeEdges} onClose={() => setSelectedNode(null)} />
          ) : (
            <DetailPanel node={selectedNode} viewMode={viewMode} allNodes={activeNodes} allEdges={activeEdges} onClose={() => setSelectedNode(null)} />
          )}
        </>
      )}

      {/* Architecture docs overlay */}
      {showArchDocs && viewMode === 'domainArchitecture' && (
        <ArchitectureDocsPanel onClose={() => setShowArchDocs(false)} />
      )}

      {/* Session detail panel */}
      {viewMode === 'monitor' && monitorSession && (selectedNode || showSessionOverview) && (
        <SessionDetailPanel
          node={selectedNode}
          session={selectedNode ? null : monitorSession}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onClose={() => { setSelectedNode(null); setShowSessionOverview(false); }}
        />
      )}

      {/* Timeline */}
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
            if (target) { setSelectedNode(target); setShowSessionOverview(false); }
          }}
        />
      )}
    </div>
  );
}
