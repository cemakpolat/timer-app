import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Film, Globe, Image as ImageIcon, LoaderCircle, ShieldCheck, X } from 'lucide-react';
import { previewRemoteMediaSource } from '../../services/remoteMediaLibraryService';

const INITIAL_FORM = {
  provider: 'generic-manifest',
  name: '',
  manifestUrl: '',
  owner: '',
  repo: '',
  ref: 'main',
  path: 'catalog/manifest.json',
  allowedHostnames: '',
};

function formatBytes(bytes) {
  if (!bytes) {
    return 'Unknown size';
  }

  const mb = bytes / 1_048_576;
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function parseAllowedHostnames(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSourceInput(form, assetType) {
  if (form.provider === 'github') {
    return {
      provider: 'github',
      name: form.name.trim() || `${form.repo || 'GitHub'} ${assetType}s`,
      owner: form.owner.trim(),
      repo: form.repo.trim(),
      ref: form.ref.trim() || 'main',
      path: form.path.trim(),
      assetTypes: [assetType],
    };
  }

  return {
    provider: 'generic-manifest',
    name: form.name.trim(),
    manifestUrl: form.manifestUrl.trim(),
    allowedHostnames: parseAllowedHostnames(form.allowedHostnames),
    assetTypes: [assetType],
  };
}

function getBlockedReasonSummary(rejectedAssets = []) {
  const counts = new Map();

  rejectedAssets.forEach((asset) => {
    (asset.policyErrors || []).forEach((reason) => {
      counts.set(reason, (counts.get(reason) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
}

function inputStyle(theme, getTextOpacity) {
  return {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${getTextOpacity(theme, 0.12)}`,
    borderRadius: theme.borderRadius,
    padding: '10px 12px',
    color: theme.text,
    fontSize: 13,
    boxSizing: 'border-box',
  };
}

function selectStyle(theme, getTextOpacity) {
  return {
    ...inputStyle(theme, getTextOpacity),
    appearance: 'none',
    cursor: 'pointer',
  };
}

export default function RemoteSourceConfigurator({
  theme,
  getTextOpacity,
  assetType,
  onConnect,
  onCancel,
  embedded = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [preview, setPreview] = useState({
    status: 'idle',
    approvedAssets: [],
    rejectedAssets: [],
    errors: [],
  });

  const titleLabel = assetType === 'video'
    ? 'Remote Video Source'
    : assetType === 'audio'
      ? 'Remote Music Source'
      : 'Remote Image Source';
  const sourceInput = useMemo(() => getSourceInput(form, assetType), [assetType, form]);
  const blockedReasons = useMemo(() => getBlockedReasonSummary(preview.rejectedAssets), [preview.rejectedAssets]);
  const isCompactLayout = embedded || (typeof window !== 'undefined' && window.innerWidth < 760);

  useEffect(() => {
    setPreview({
      status: 'idle',
      approvedAssets: [],
      rejectedAssets: [],
      errors: [],
    });
  }, [assetType, form]);

  const canPreview = form.provider === 'github'
    ? Boolean(form.owner.trim() && form.repo.trim() && form.path.trim())
    : Boolean(form.manifestUrl.trim());

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const result = await previewRemoteMediaSource(sourceInput, assetType);
      setPreview(result);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConnect = async () => {
    await onConnect(sourceInput);
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: getTextOpacity(theme, 0.58),
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div
      style={{
        width: '100%',
        maxHeight: embedded ? 'none' : 'min(88vh, 920px)',
        background: embedded ? 'rgba(255,255,255,0.04)' : theme.card,
        borderRadius: theme.borderRadius,
        border: `1px solid ${getTextOpacity(theme, 0.12)}`,
        boxShadow: embedded ? 'none' : '0 20px 60px rgba(0,0,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        padding: '16px 16px 12px',
        borderBottom: `1px solid ${getTextOpacity(theme, 0.08)}`,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
            {titleLabel}
          </div>
          <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.55), lineHeight: 1.45 }}>
            Choose a source provider, fill in only the fields it needs, preview approved assets, and connect the source once it passes policy.
          </div>
        </div>
        {typeof onCancel === 'function' && (
          <button
            onClick={onCancel}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: theme.borderRadius,
              color: theme.text,
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isCompactLayout ? '1fr' : 'minmax(0, 280px) minmax(0, 1fr)',
        gap: 0,
        flex: 1,
        minHeight: 0,
      }}>
        <div style={{
          padding: 16,
          borderRight: isCompactLayout ? 'none' : `1px solid ${getTextOpacity(theme, 0.08)}`,
          borderBottom: isCompactLayout ? `1px solid ${getTextOpacity(theme, 0.08)}` : 'none',
          overflowY: 'auto',
        }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Provider</label>
            <select
              value={form.provider}
              onChange={(event) => setForm((current) => ({ ...current, provider: event.target.value }))}
              style={selectStyle(theme, getTextOpacity)}
            >
              <option value="generic-manifest">HTTPS manifest</option>
              <option value="github">GitHub repository</option>
            </select>
            <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.48), marginTop: 6, lineHeight: 1.4 }}>
              Switch providers to reveal the exact fields required for that source type.
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Source name</label>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder={assetType === 'video' ? 'Calm loop videos' : assetType === 'audio' ? 'Focus music library' : 'Focus image library'}
              style={inputStyle(theme, getTextOpacity)}
            />
          </div>

          {form.provider === 'generic-manifest' && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Manifest URL</label>
                <input
                  value={form.manifestUrl}
                  onChange={(event) => setForm((current) => ({ ...current, manifestUrl: event.target.value }))}
                  placeholder="https://cdn.example.com/catalog/manifest.json"
                  style={inputStyle(theme, getTextOpacity)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Extra asset hostnames</label>
                <input
                  value={form.allowedHostnames}
                  onChange={(event) => setForm((current) => ({ ...current, allowedHostnames: event.target.value }))}
                  placeholder="cdn.example.com, images.example.com"
                  style={inputStyle(theme, getTextOpacity)}
                />
              </div>
            </>
          )}

          {form.provider === 'github' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Owner</label>
                  <input
                    value={form.owner}
                    onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                    placeholder="acme"
                    style={inputStyle(theme, getTextOpacity)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Repository</label>
                  <input
                    value={form.repo}
                    onChange={(event) => setForm((current) => ({ ...current, repo: event.target.value }))}
                    placeholder="media-library"
                    style={inputStyle(theme, getTextOpacity)}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Branch or ref</label>
                  <input
                    value={form.ref}
                    onChange={(event) => setForm((current) => ({ ...current, ref: event.target.value }))}
                    placeholder="main"
                    style={inputStyle(theme, getTextOpacity)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Manifest path</label>
                  <input
                    value={form.path}
                    onChange={(event) => setForm((current) => ({ ...current, path: event.target.value }))}
                    placeholder="catalog/manifest.json"
                    style={inputStyle(theme, getTextOpacity)}
                  />
                </div>
              </div>
            </>
          )}

          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${getTextOpacity(theme, 0.08)}`,
            borderRadius: theme.borderRadius,
            padding: 12,
            color: getTextOpacity(theme, 0.55),
            fontSize: 11,
            lineHeight: 1.45,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.text, fontWeight: 700, marginBottom: 6 }}>
              <ShieldCheck size={13} /> Policy preview
            </div>
            Only approved {assetType === 'video' ? 'videos' : assetType === 'audio' ? 'tracks' : 'images'} appear in the preview. Blocked files stay hidden and are summarized below.
          </div>
        </div>

        <div style={{ padding: 16, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 3 }}>
                Preview approved assets
              </div>
              <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.5) }}>
                Review what users will actually see before connecting this source.
              </div>
            </div>
            <button
              onClick={handlePreview}
              disabled={!canPreview || isPreviewing}
              style={{
                background: !canPreview || isPreviewing ? 'rgba(255,255,255,0.08)' : theme.accent,
                border: 'none',
                borderRadius: theme.borderRadius,
                color: !canPreview || isPreviewing ? getTextOpacity(theme, 0.45) : '#fff',
                padding: '9px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: !canPreview || isPreviewing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isPreviewing ? <LoaderCircle size={14} className="spin" /> : (assetType === 'video' ? <Film size={14} /> : assetType === 'audio' ? <Globe size={14} /> : <ImageIcon size={14} />)}
              {isPreviewing ? 'Checking…' : 'Preview'}
            </button>
          </div>

          {preview.errors.length > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: theme.borderRadius,
              padding: 12,
              color: '#fca5a5',
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 6 }}>
                <AlertCircle size={14} /> Source check failed
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.45 }}>
                {preview.errors.join(' ')}
              </div>
            </div>
          )}

          {preview.status === 'ready' && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <div style={{
                  background: 'rgba(34,197,94,0.12)',
                  color: '#86efac',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 999,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <CheckCircle2 size={12} /> {preview.approvedAssets.length} approved
                </div>
                <div style={{
                  background: 'rgba(239,68,68,0.12)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 999,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <AlertCircle size={12} /> {preview.rejectedAssets.length} blocked
                </div>
              </div>

              {blockedReasons.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                  borderRadius: theme.borderRadius,
                  padding: 10,
                  marginBottom: 12,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginBottom: 6 }}>
                    Most common blocked reasons
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {blockedReasons.map(([reason, count]) => (
                      <span
                        key={reason}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          color: getTextOpacity(theme, 0.62),
                          borderRadius: 999,
                          padding: '4px 8px',
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {count} x {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10,
          }}>
            {preview.approvedAssets.map((asset) => (
              <div
                key={asset.id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                  borderRadius: theme.borderRadius,
                  overflow: 'hidden',
                }}
              >
                <div style={{ aspectRatio: '1', background: 'rgba(0,0,0,0.18)', position: 'relative' }}>
                  {asset.assetType === 'image' ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : asset.assetType === 'audio' ? (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getTextOpacity(theme, 0.45),
                      flexDirection: 'column',
                      gap: 8,
                    }}>
                      <Globe size={24} />
                      <span style={{ fontSize: 11 }}>Streamed audio</span>
                    </div>
                  ) : asset.posterUrl ? (
                    <img
                      src={asset.posterUrl}
                      alt={asset.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getTextOpacity(theme, 0.45),
                      flexDirection: 'column',
                      gap: 8,
                    }}>
                      <Film size={24} />
                      <span style={{ fontSize: 11 }}>Poster not provided</span>
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: `${theme.accent}e6`,
                    color: '#fff',
                    borderRadius: 999,
                    padding: '3px 6px',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    {asset.assetType}
                  </div>
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {asset.name}
                  </div>
                  <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.48), lineHeight: 1.4 }}>
                    {formatBytes(asset.size)}
                    {(asset.assetType === 'video' || asset.assetType === 'audio') && asset.duration ? ` · ${asset.duration}s` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {preview.status === 'ready' && preview.approvedAssets.length === 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${getTextOpacity(theme, 0.08)}`,
              borderRadius: theme.borderRadius,
              padding: 18,
              color: getTextOpacity(theme, 0.5),
              textAlign: 'center',
              fontSize: 12,
            }}>
              Nothing passed the current rules. Adjust the source or fix the manifest and preview again.
            </div>
          )}

          {preview.status === 'idle' && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px dashed ${getTextOpacity(theme, 0.14)}`,
              borderRadius: theme.borderRadius,
              padding: 18,
              color: getTextOpacity(theme, 0.48),
              textAlign: 'center',
              fontSize: 12,
            }}>
              Preview the source to see which {assetType === 'video' ? 'videos' : assetType === 'audio' ? 'tracks' : 'images'} are approved and visible to users.
            </div>
          )}
        </div>
      </div>

      <div style={{
        padding: 14,
        borderTop: `1px solid ${getTextOpacity(theme, 0.08)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), lineHeight: 1.45 }}>
          Mobile-safe flow: connect only after preview. The saved source will expose approved assets only.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {typeof onCancel === 'function' && (
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: `1px solid ${getTextOpacity(theme, 0.12)}`,
                borderRadius: theme.borderRadius,
                color: theme.text,
                padding: '9px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConnect}
            disabled={preview.status !== 'ready' || preview.approvedAssets.length === 0}
            style={{
              background: preview.status !== 'ready' || preview.approvedAssets.length === 0 ? 'rgba(255,255,255,0.08)' : theme.accent,
              border: 'none',
              borderRadius: theme.borderRadius,
              color: preview.status !== 'ready' || preview.approvedAssets.length === 0 ? getTextOpacity(theme, 0.45) : '#fff',
              padding: '9px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: preview.status !== 'ready' || preview.approvedAssets.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Connect source
          </button>
        </div>
      </div>
    </div>
  );
}