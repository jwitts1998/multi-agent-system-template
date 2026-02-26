import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DomainNodeData } from '../data/domain-nodes';

const tierColors: Record<
  string,
  { bg: string; border: string; text: string; badge: string; badgeText: string }
> = {
  foundation: {
    bg: '#1c1407',
    border: '#f59e0b',
    text: '#fef3c7',
    badge: '#d97706',
    badgeText: '#fffbeb',
  },
  feature: {
    bg: '#172554',
    border: '#3b82f6',
    text: '#bfdbfe',
    badge: '#2563eb',
    badgeText: '#eff6ff',
  },
  experience: {
    bg: '#2e1065',
    border: '#a78bfa',
    text: '#ede9fe',
    badge: '#7c3aed',
    badgeText: '#f5f3ff',
  },
  orchestration: {
    bg: '#052e16',
    border: '#34d399',
    text: '#d1fae5',
    badge: '#059669',
    badgeText: '#ecfdf5',
  },
};

const tierLabels: Record<number, string> = {
  0: 'Orchestration',
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
};

const tierIcons: Record<string, string> = {
  foundation: '\u{1F3D7}',
  feature: '\u2B50',
  experience: '\u2728',
  orchestration: '\u{1F3AF}',
};

export function DomainNode({ data, selected }: NodeProps) {
  const d = data as DomainNodeData;
  const colors = tierColors[d.phase] || tierColors.feature;
  const icon = tierIcons[d.phase] || '';
  const tierLabel = tierLabels[d.tier] || '';
  const aiCount = d.aiApplications.builder.length + d.aiApplications.consumer.length;
  const depCount = d.dependencies.length;

  const cal = d.calibration;
  const calibrationClass = cal
    ? cal.isAiDifferentiator
      ? 'domain-node-ai-differentiator'
      : cal.relevance === 'core'
        ? 'domain-node-calibrated-core'
        : cal.relevance === 'not-applicable'
          ? 'domain-node-calibrated-na'
          : 'domain-node-calibrated-supporting'
    : '';

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: colors.border, width: 8, height: 8 }}
      />
      <div
        className={`domain-node domain-node-${d.phase} ${selected ? 'selected' : ''} ${calibrationClass}`}
        style={{
          background: colors.bg,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <div className="domain-header">
          <div
            className="domain-tier-badge"
            style={{ background: colors.badge, color: colors.badgeText }}
          >
            {tierLabel}
          </div>
          <div className="domain-title">
            <span style={{ marginRight: 6 }}>{icon}</span>
            {d.name}
          </div>
        </div>

        <div className="domain-scope">{d.scope}</div>

        <div className="domain-indicators">
          {aiCount > 0 && (
            <span
              className="domain-indicator-pill"
              style={{ borderColor: colors.border, color: colors.border }}
            >
              {aiCount} AI use{aiCount > 1 ? 's' : ''}
            </span>
          )}
          {depCount > 0 && (
            <span
              className="domain-indicator-pill"
              style={{ borderColor: '#64748b', color: '#94a3b8' }}
            >
              {depCount} dep{depCount > 1 ? 's' : ''}
            </span>
          )}
          {d.monitoringHooks.length > 0 && (
            <span
              className="domain-indicator-pill"
              style={{ borderColor: '#64748b', color: '#94a3b8' }}
            >
              {d.monitoringHooks.length} hooks
            </span>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: colors.border, width: 8, height: 8 }}
      />
    </>
  );
}
