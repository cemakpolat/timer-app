import React from 'react';
import { CheckCircle2, Link2, Plus, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

const getStatusColor = (status, theme) => {
  if (status === 'ready') {
    return '#22c55e';
  }

  if (status === 'invalid' || status === 'error') {
    return '#ef4444';
  }

  return theme.accent;
};

export default function RemoteSourcesPanel({
  theme,
  getTextOpacity,
  title,
  description,
  sources = [],
  sourceStatuses = [],
  onAddSource,
  onRefreshSources,
  onRemoveSource,
}) {
  const statusBySourceId = new Map(sourceStatuses.map((status) => [status.sourceId, status]));

  return (
    <div style={{
      marginBottom: 14,
      borderRadius: theme.borderRadius,
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${getTextOpacity(theme, 0.08)}`,
      padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: theme.text, fontSize: 12, fontWeight: 700 }}>
            <Link2 size={14} /> {title}
          </div>
          <div style={{ color: getTextOpacity(theme, 0.5), fontSize: 11, lineHeight: 1.4 }}>
            {description}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {typeof onRefreshSources === 'function' && (
            <button
              onClick={onRefreshSources}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: theme.borderRadius,
                color: theme.text,
                padding: '6px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Refresh remote sources"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          )}
          {typeof onAddSource === 'function' && (
            <button
              onClick={onAddSource}
              style={{
                background: theme.accent,
                border: 'none',
                borderRadius: theme.borderRadius,
                color: '#fff',
                padding: '6px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Add remote source"
            >
              <Plus size={12} /> Add Remote
            </button>
          )}
        </div>
      </div>

      {sources.length === 0 && (
        <div style={{
          borderRadius: theme.borderRadius,
          padding: '10px 12px',
          fontSize: 11,
          color: getTextOpacity(theme, 0.45),
          background: 'rgba(255,255,255,0.03)',
        }}>
          No remote sources connected yet.
        </div>
      )}

      {sources.map((source) => {
        const status = statusBySourceId.get(source.id);
        const statusColor = getStatusColor(status?.status, theme);
        const statusLabel = status?.status === 'ready'
          ? `${status.approvedCount} approved${status.rejectedCount ? `, ${status.rejectedCount} blocked` : ''}`
          : status?.errors?.[0] || 'Pending refresh';

        return (
          <div
            key={source.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '9px 10px',
              borderRadius: theme.borderRadius,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${getTextOpacity(theme, 0.08)}`,
              marginTop: 8,
            }}
          >
            <div style={{ flexShrink: 0, color: statusColor, paddingTop: 1 }}>
              {status?.status === 'ready' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                <span style={{ color: theme.text, fontSize: 12, fontWeight: 600 }}>{source.name}</span>
                <span style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: getTextOpacity(theme, 0.6),
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}>
                  {source.provider}
                </span>
              </div>
              <div style={{ color: getTextOpacity(theme, 0.46), fontSize: 11, lineHeight: 1.35 }}>
                {statusLabel}
              </div>
            </div>
            {typeof onRemoveSource === 'function' && (
              <button
                onClick={() => onRemoveSource(source.id)}
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  border: 'none',
                  borderRadius: theme.borderRadius,
                  color: '#ef4444',
                  padding: '5px 7px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Remove source"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}