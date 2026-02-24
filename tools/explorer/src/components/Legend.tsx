import { categoryMeta, type NodeCategory } from '../data/nodes';
import type { ViewMode } from '../App';

interface LegendProps {
  viewMode: ViewMode;
  hiddenCategories: Set<NodeCategory>;
  onToggleCategory: (category: NodeCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const newIdeaPhases = [
  { label: 'Setup (Stage 1)', color: '#94a3b8' },
  { label: 'Ideate (Stages 2-4)', color: '#2dd4bf' },
  { label: 'Operate (Stages 5, 10, 13)', color: '#c084fc' },
  { label: 'Build (Stages 6-7)', color: '#3b82f6' },
  { label: 'Verify (Stages 8-9)', color: '#f59e0b' },
  { label: 'Ship (Stages 11-12)', color: '#22c55e' },
];

const existingRepoPhases = [
  { label: 'Setup (Stage 1)', color: '#94a3b8' },
  { label: 'Ingest (Stages 2-5)', color: '#f59e0b' },
  { label: 'Ideate (Stage 6)', color: '#2dd4bf' },
  { label: 'Operate (Stages 7, 11-12)', color: '#c084fc' },
  { label: 'Build (Stages 8-9)', color: '#3b82f6' },
  { label: 'Ship (Stage 10)', color: '#22c55e' },
];

const contextToMvpPhases = [
  { label: 'Ingest (Stage 1)', color: '#f59e0b' },
  { label: 'Ideate (Stages 2-4)', color: '#2dd4bf' },
  { label: 'Build (Stages 5-6)', color: '#3b82f6' },
  { label: 'Verify (Stages 7-8)', color: '#f59e0b' },
  { label: 'Ship (Stage 9)', color: '#22c55e' },
  { label: 'Operate (Stage 10)', color: '#c084fc' },
];

const viewTitles: Record<ViewMode, string> = {
  system: 'Multi-Agent System Explorer',
  newIdea: 'New Idea Workflow',
  existingRepo: 'Existing Repo Workflow',
  contextToMvp: 'Context to MVP Workflow',
  monitor: 'Session Monitor',
};

const viewDescriptions: Record<ViewMode, string> = {
  system: '',
  newIdea: 'Clone the template, flush your idea into a PDB, decompose into tasks, build with agents',
  existingRepo: 'Copy template files into your project, audit code, generate a PDB, fix gaps, then build',
  contextToMvp: 'Ingest stakeholder context, fill gaps, generate a PDB, build a demo, and iterate with feedback',
  monitor: 'Visualize agent session transcripts — see agent flow, tool usage, and token consumption',
};

export function Legend({ viewMode, hiddenCategories, onToggleCategory, searchQuery, onSearchChange }: LegendProps) {
  const categories = Object.entries(categoryMeta) as [NodeCategory, { label: string; color: string }][];
  const isPipeline = viewMode === 'newIdea' || viewMode === 'existingRepo' || viewMode === 'contextToMvp';
  const phases = viewMode === 'newIdea'
    ? newIdeaPhases
    : viewMode === 'contextToMvp'
      ? contextToMvpPhases
      : existingRepoPhases;

  return (
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
      {/* Title */}
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#f1f5f9',
        marginBottom: isPipeline ? 6 : 12,
        letterSpacing: '0.3px',
      }}>
        {viewTitles[viewMode]}
      </div>

      {viewMode === 'system' ? (
        <>
          {/* Search */}
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: 12,
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#e2e8f0',
              outline: 'none',
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
          />

          {/* Category toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {categories.map(([key, meta]) => {
              const hidden = hiddenCategories.has(key);
              return (
                <button
                  key={key}
                  onClick={() => onToggleCategory(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 8px',
                    fontSize: 12,
                    background: 'none',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    color: hidden ? '#475569' : '#cbd5e1',
                    textDecoration: hidden ? 'line-through' : 'none',
                    textAlign: 'left',
                  }}
                >
                  <span
                    className="category-dot"
                    style={{
                      backgroundColor: meta.color,
                      opacity: hidden ? 0.3 : 1,
                    }}
                  />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Workflow description */}
          <div style={{
            fontSize: 11,
            color: '#94a3b8',
            marginBottom: 10,
            lineHeight: 1.5,
          }}>
            {viewDescriptions[viewMode]}
          </div>

          {/* Phase legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {phases.map((phase) => (
              <div key={phase.label} className="workflow-legend-phase">
                <span className="workflow-legend-dot" style={{ backgroundColor: phase.color }} />
                {phase.label}
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid #334155',
          }}>
            <div className="workflow-legend-feedback">
              <span className="workflow-legend-dash" />
              {viewMode === 'contextToMvp' ? 'Feedback loops' : viewMode === 'newIdea' ? 'Feedback loop' : 'Iterative cycle'}
            </div>
          </div>

          <div style={{
            marginTop: 8,
            fontSize: 10,
            color: '#64748b',
            lineHeight: 1.5,
          }}>
            {viewMode === 'newIdea'
              ? 'Stages 7-9 form an iterative cycle. Issues found in Quality Review are sent back to Feature Development. System agents (purple) handle routing, monitoring, and memory.'
              : viewMode === 'contextToMvp'
                ? 'Quality Review routes issues back to Feature Development. Stakeholder Review feeds new context back to Gap Analysis for iterative refinement toward a demo-ready MVP.'
                : 'Stages 9-10 repeat for each development cycle. System agents (purple) handle routing, monitoring, and memory across the workflow.'
            }
          </div>

          {/* Prompt framework hint */}
          <div style={{
            marginTop: 8,
            padding: '6px 8px',
            background: '#0f172a',
            borderRadius: 6,
            border: '1px solid #334155',
          }}>
            <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
              Click any stage to see example prompts for invoking agents at that step.
            </div>
          </div>
        </>
      )}

      {/* Help text */}
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid #334155',
        fontSize: 10,
        color: '#64748b',
        lineHeight: 1.5,
      }}>
        Click a node for details. Drag to pan. Scroll to zoom.{viewMode === 'system' ? ' Click categories to toggle.' : ''}
      </div>
    </div>
  );
}
