import { useState, useMemo } from 'react';
import type { SessionData } from '../data/transcript-parser';

export interface TimelineProps {
  session: SessionData;
  selectedTurnIndex: number | null;
  onTurnClick: (turnIndex: number) => void;
}

const ROLE_COLORS: Record<string, string> = {
  user: '#3b82f6',
  assistant: '#22c55e',
};

const MIN_SEGMENT_WIDTH = 4;

export function Timeline({ session, selectedTurnIndex, onTurnClick }: TimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const segments = useMemo(() => {
    const total = session.totalTokens || 1;
    return session.turns.map(turn => ({
      turn,
      fraction: turn.estimatedTokens / total,
    }));
  }, [session]);

  const cumulativeTokens = useMemo(
    () => session.turns.reduce((sum, t) => sum + t.estimatedTokens, 0),
    [session.turns],
  );

  return (
    <div className="timeline-bar">
      <span className="timeline-label">TIMELINE</span>

      <div className="timeline-track">
        {segments.map(({ turn, fraction }, i) => {
          const color = ROLE_COLORS[turn.role] || '#64748b';
          const isActive = selectedTurnIndex === turn.index;
          const isHovered = hoveredIndex === turn.index;
          const isFirst = i === 0;
          const isLast = i === segments.length - 1;

          return (
            <div
              key={turn.id}
              className={`timeline-segment${isActive ? ' active' : ''}`}
              style={{
                flex: `${fraction} 0 ${MIN_SEGMENT_WIDTH}px`,
                backgroundColor: color,
                borderRadius: `${isFirst ? '3px' : '0'} ${isLast ? '3px' : '0'} ${isLast ? '3px' : '0'} ${isFirst ? '3px' : '0'}`,
              }}
              onClick={() => onTurnClick(turn.index)}
              onMouseEnter={() => setHoveredIndex(turn.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {isHovered && (
                <div className="timeline-tooltip">
                  <strong>Turn {turn.index + 1}</strong> ({turn.role})
                  <br />
                  {turn.summary}
                  <br />
                  <span style={{ opacity: 0.7 }}>~{turn.estimatedTokens.toLocaleString()} tokens</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <span className="timeline-total">~{cumulativeTokens.toLocaleString()} tokens</span>
    </div>
  );
}
