import { categoryMeta, type NodeCategory } from '../data/nodes';

interface LegendProps {
  viewMode: 'system' | 'workflow';
  hiddenCategories: Set<NodeCategory>;
  onToggleCategory: (category: NodeCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const workflowPhases = [
  { label: 'Ideate (Stages 1-3)', color: '#2dd4bf' },
  { label: 'Build (Stages 4-5)', color: '#3b82f6' },
  { label: 'Verify (Stages 6-7)', color: '#f59e0b' },
  { label: 'Ship (Stages 8-9)', color: '#22c55e' },
];

export function Legend({ viewMode, hiddenCategories, onToggleCategory, searchQuery, onSearchChange }: LegendProps) {
  const categories = Object.entries(categoryMeta) as [NodeCategory, { label: string; color: string }][];

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
        marginBottom: 12,
        letterSpacing: '0.3px',
      }}>
        {viewMode === 'system' ? 'Multi-Agent System Explorer' : 'Idea to Production'}
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
          {/* Workflow phase legend */}
          <div style={{
            fontSize: 11,
            color: '#94a3b8',
            marginBottom: 10,
            lineHeight: 1.5,
          }}>
            End-to-end pipeline from raw idea to production-ready system
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {workflowPhases.map((phase) => (
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
              Feedback loop
            </div>
          </div>

          <div style={{
            marginTop: 8,
            fontSize: 10,
            color: '#64748b',
            lineHeight: 1.5,
          }}>
            Stages 5-7 form an iterative cycle. Issues found in Quality Review are sent back to Development.
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
