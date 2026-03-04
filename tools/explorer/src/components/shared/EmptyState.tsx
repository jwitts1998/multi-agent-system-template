interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
}

export function EmptyState({ icon = '\u{1F50D}', title, description }: EmptyStateProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      zIndex: 5,
      pointerEvents: 'none',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#64748b', maxWidth: 280, lineHeight: 1.6 }}>{description}</div>
    </div>
  );
}
