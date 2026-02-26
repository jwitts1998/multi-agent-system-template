import { categoryMeta, type NodeCategory } from '../data/nodes';
import type { ViewMode } from '../App';

interface LegendProps {
  viewMode: ViewMode;
  hiddenCategories: Set<NodeCategory>;
  onToggleCategory: (category: NodeCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onShowArchDocs?: () => void;
  onShowCalibration?: () => void;
  hasCalibration?: boolean;
}

const newIdeaPhases = [
  { label: 'Setup (Stage 1)', color: '#94a3b8' },
  { label: 'Ideate (Stages 2-5)', color: '#2dd4bf' },
  { label: 'Operate (Stages 6, 11, 14)', color: '#c084fc' },
  { label: 'Build (Stages 7-8)', color: '#3b82f6' },
  { label: 'Verify (Stages 9-10)', color: '#f59e0b' },
  { label: 'Ship (Stages 12-13)', color: '#22c55e' },
];

const existingRepoPhases = [
  { label: 'Setup (Stage 1)', color: '#94a3b8' },
  { label: 'Ingest (Stages 2-5)', color: '#f59e0b' },
  { label: 'Ideate (Stages 6-7)', color: '#2dd4bf' },
  { label: 'Operate (Stages 8, 12-13)', color: '#c084fc' },
  { label: 'Build (Stages 9-10)', color: '#3b82f6' },
  { label: 'Ship (Stage 11)', color: '#22c55e' },
];

const contextToMvpPhases = [
  { label: 'Ingest (Stage 1)', color: '#f59e0b' },
  { label: 'Ideate (Stages 2-5)', color: '#2dd4bf' },
  { label: 'Build (Stages 6-7)', color: '#3b82f6' },
  { label: 'Verify (Stages 8-9)', color: '#f59e0b' },
  { label: 'Ship (Stage 10)', color: '#22c55e' },
  { label: 'Operate (Stage 11)', color: '#c084fc' },
];

const domainArchitecturePhases = [
  { label: 'Orchestration (coordination)', color: '#34d399' },
  { label: 'Tier 1 — Foundation (shared substrate)', color: '#f59e0b' },
  { label: 'Tier 2 — Feature (user-facing)', color: '#3b82f6' },
  { label: 'Tier 3 — Experience (cross-cutting)', color: '#a78bfa' },
];

const viewTitles: Record<ViewMode, string> = {
  system: 'Multi-Agent System Explorer',
  newIdea: 'New Idea Workflow',
  existingRepo: 'Existing Repo Workflow',
  contextToMvp: 'Context to MVP Workflow',
  domainArchitecture: 'Domain Micro-Agents',
  monitor: 'Session Monitor',
};

const viewDescriptions: Record<ViewMode, string> = {
  system: '',
  newIdea: 'Clone the template, flush your idea into a PDB, decompose into tasks, build with agents',
  existingRepo: 'Copy template files into your project, audit code, generate a PDB, fix gaps, then build',
  contextToMvp: 'Ingest stakeholder context, fill gaps, generate a PDB, build a demo, and iterate with feedback',
  domainArchitecture: 'Domain-expertise agents organized by software craft area. Each owns a vertical, applies modern practices, and evaluates where AI fits.',
  monitor: 'Visualize agent session transcripts — see agent flow, tool usage, and token consumption',
};

export function Legend({ viewMode, hiddenCategories, onToggleCategory, searchQuery, onSearchChange, onShowArchDocs, onShowCalibration, hasCalibration }: LegendProps) {
  const categories = Object.entries(categoryMeta) as [NodeCategory, { label: string; color: string }][];
  const isPipeline = viewMode === 'newIdea' || viewMode === 'existingRepo' || viewMode === 'contextToMvp' || viewMode === 'domainArchitecture';
  const phases = viewMode === 'newIdea'
    ? newIdeaPhases
    : viewMode === 'contextToMvp'
      ? contextToMvpPhases
      : viewMode === 'domainArchitecture'
        ? domainArchitecturePhases
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

          {viewMode !== 'domainArchitecture' && (
            <>
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
                  ? 'Stages 8-10 form an iterative cycle. Issues found in Quality Review are sent back to Feature Development. Stage 5 calibrates domain agents for your product vertical. System agents (purple) handle routing, monitoring, and memory.'
                  : viewMode === 'contextToMvp'
                    ? 'Quality Review routes issues back to Feature Development. Stakeholder Review feeds new context back to Gap Analysis for iterative refinement toward a demo-ready MVP.'
                    : 'Stages 10-11 repeat for each development cycle. System agents (purple) handle routing, monitoring, and memory across the workflow.'
                }
              </div>

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

          {viewMode === 'domainArchitecture' && (
            <>
              <div style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid #334155',
              }}>
                <div className="workflow-legend-feedback">
                  <span className="workflow-legend-dash" />
                  Dependency (solid) / Consultation (dashed)
                </div>
              </div>

              <div style={{
                marginTop: 8,
                fontSize: 10,
                color: '#64748b',
                lineHeight: 1.5,
              }}>
                Tier 2 depends on Tier 1 foundations. Tier 3 consults Tier 2 for craft quality. The Product Orchestrator resolves cross-domain conflicts.
              </div>

              <div style={{
                marginTop: 8,
                padding: '6px 8px',
                background: '#0f172a',
                borderRadius: 6,
                border: '1px solid #334155',
              }}>
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
                  Click any domain to see scope, AI applications, dependencies, and monitoring hooks.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {onShowArchDocs && (
                  <button
                    onClick={onShowArchDocs}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      background: '#172554',
                      border: '1px solid #3b82f6',
                      borderRadius: 6,
                      color: '#93c5fd',
                      cursor: 'pointer',
                    }}
                  >
                    Architecture Guide
                  </button>
                )}
                {onShowCalibration && (
                  <button
                    onClick={onShowCalibration}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      background: hasCalibration ? '#1c1407' : '#0f172a',
                      border: `1px solid ${hasCalibration ? '#f59e0b' : '#334155'}`,
                      borderRadius: 6,
                      color: hasCalibration ? '#fcd34d' : '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {hasCalibration ? 'Product Calibration Active' : 'Calibrate for Product'}
                  </button>
                )}
              </div>
            </>
          )}
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
