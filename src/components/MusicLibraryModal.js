import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Cloud, Database, Music, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import RemoteSourceConfigurator from './shared/RemoteSourceConfigurator';
import RemoteSourcesPanel from './shared/RemoteSourcesPanel';

function statusCopy(status) {
  if (status === 'missing-source') {
    return {
      label: 'Source unavailable',
      color: '#f87171',
      background: 'rgba(248,113,113,0.12)',
    };
  }

  if (status === 'missing-asset') {
    return {
      label: 'Track missing from source',
      color: '#fbbf24',
      background: 'rgba(251,191,36,0.12)',
    };
  }

  return {
    label: 'Ready',
    color: '#4ade80',
    background: 'rgba(74,222,128,0.12)',
  };
}

function formatDuration(duration) {
  if (!duration || duration <= 0) {
    return null;
  }

  const totalSeconds = Math.round(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes) {
    return null;
  }

  const mb = bytes / 1_048_576;
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function getStorageState(item = {}) {
  if (item.isStored) {
    return {
      label: 'Stored',
      detail: 'Stored in browser storage',
      background: 'rgba(34,197,94,0.14)',
      color: '#86efac',
    };
  }

  if (item.isLocal || item.provider === 'local-folder' || item.sourceType === 'local-folder') {
    return {
      label: 'Not stored',
      detail: 'Loaded from a local folder',
      background: 'rgba(250,204,21,0.14)',
      color: '#fde68a',
    };
  }

  return {
    label: 'Not stored',
    detail: 'Streamed from a remote source',
    background: 'rgba(59,130,246,0.14)',
    color: '#93c5fd',
  };
}

function StorageBadge({ item }) {
  const storageState = getStorageState(item);

  return (
    <span
      title={storageState.detail}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        borderRadius: 999,
        padding: '3px 7px',
        fontSize: 10,
        fontWeight: 700,
        background: storageState.background,
        color: storageState.color,
        whiteSpace: 'nowrap',
      }}
    >
      <Database size={11} />
      {storageState.label}
    </span>
  );
}

export default function MusicLibraryModal({
  theme,
  getTextOpacity,
  onClose,
  customMusicFiles = [],
  sources = [],
  sourceStatuses = [],
  availableAssets = [],
  selectedQueue = [],
  onUploadCustomMusic,
  onAddRemoteSource,
  onAddLocalSource,
  onRefreshSources,
  onRemoveSource,
  onAddSelection,
  onRemoveSelection,
  onMoveSelection,
  getSelectionStatus,
  supportsLocalFolders,
}) {
  const [activeTab, setActiveTab] = useState('library');
  const [searchValue, setSearchValue] = useState('');
  const [showRemoteConfigurator, setShowRemoteConfigurator] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const queuedAssetIds = useMemo(() => new Set(selectedQueue.map((item) => `${item.sourceId}:${item.assetId}`)), [selectedQueue]);

  const filteredAssets = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) {
      return availableAssets;
    }

    return availableAssets.filter((asset) => {
      const haystack = [asset.name, asset.sourceName, asset.relativePath]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [availableAssets, searchValue]);

  const tabStyle = (tab) => ({
    flex: 1,
    background: activeTab === tab ? theme.accent : 'transparent',
    border: 'none',
    borderRadius: theme.borderRadius,
    color: activeTab === tab ? '#fff' : theme.text,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  });

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || typeof onUploadCustomMusic !== 'function') {
      event.target.value = '';
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      await onUploadCustomMusic(file);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: '✅ Music file uploaded successfully!', type: 'success', ttl: 3000 },
      }));
    } catch (error) {
      setUploadError(error.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.74)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2200,
          padding: 12,
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: 'min(1040px, 96vw)',
            maxHeight: 'min(90vh, 960px)',
            background: theme.card,
            borderRadius: theme.borderRadius,
            border: `1px solid ${getTextOpacity(theme, 0.12)}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
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
                Music Library
              </div>
              <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.55), lineHeight: 1.45 }}>
                Connect local folders or cloud sources, then curate the exact track order that playback should follow.
              </div>
            </div>
            <button
              onClick={onClose}
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
          </div>

          <div style={{
            padding: '12px 16px 0',
            borderBottom: `1px solid ${getTextOpacity(theme, 0.08)}`,
          }}>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: theme.borderRadius, padding: 4 }}>
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                style={tabStyle('library')}
              >
                <Music size={14} /> Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('connections')}
                style={tabStyle('connections')}
              >
                <Cloud size={14} /> Connections
              </button>
            </div>
          </div>

          {activeTab === 'library' && (
            <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
            gap: 0,
            flex: 1,
            minHeight: 0,
          }}>
            <div style={{ padding: 16, overflowY: 'auto', borderRight: `1px solid ${getTextOpacity(theme, 0.08)}` }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                borderRadius: theme.borderRadius,
                padding: 12,
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
                      Uploaded to Browser
                    </div>
                    <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), lineHeight: 1.45 }}>
                      Upload tracks into browser storage, then select them directly from the sound settings list.
                    </div>
                  </div>
                  <label
                    htmlFor="music-library-upload"
                    style={{
                      background: isUploading ? 'rgba(255,255,255,0.08)' : theme.accent,
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      color: isUploading ? getTextOpacity(theme, 0.45) : '#fff',
                      padding: '8px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Upload size={13} /> {isUploading ? 'Uploading…' : 'Upload Music'}
                  </label>
                </div>
                <input
                  id="music-library-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />

                {uploadError && (
                  <div style={{
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    borderRadius: theme.borderRadius,
                    padding: '8px 10px',
                    color: '#fca5a5',
                    fontSize: 12,
                    marginBottom: 10,
                  }}>
                    {uploadError}
                  </div>
                )}

                <div style={{ display: 'grid', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                  {customMusicFiles.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: theme.borderRadius,
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                      }}
                    >
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: `${theme.accent}22`,
                        color: theme.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Music size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.48), lineHeight: 1.4 }}>
                          {formatBytes(file.size) || 'Stored track'}
                        </div>
                      </div>
                      <StorageBadge item={{ isStored: true }} />
                    </div>
                  ))}

                  {customMusicFiles.length === 0 && (
                    <div style={{
                      borderRadius: theme.borderRadius,
                      padding: '18px 12px',
                      fontSize: 12,
                      color: getTextOpacity(theme, 0.48),
                      background: 'rgba(255,255,255,0.03)',
                      textAlign: 'center',
                    }}>
                      No uploaded tracks yet.
                    </div>
                  )}
                </div>
              </div>

              {!supportsLocalFolders && (
                <div style={{
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.25)',
                  borderRadius: theme.borderRadius,
                  padding: 10,
                  fontSize: 11,
                  color: '#fcd34d',
                  lineHeight: 1.45,
                  marginBottom: 12,
                }}>
                  Local folders need a browser with File System Access support. Cloud sources and uploaded tracks still work here.
                </div>
              )}

              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                borderRadius: theme.borderRadius,
                padding: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
                      Available Tracks
                    </div>
                    <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.5) }}>
                      Browse approved tracks from connected sources and add them to the saved queue.
                    </div>
                  </div>
                  <div style={{ position: 'relative', minWidth: 220, flex: '1 1 220px', maxWidth: 320 }}>
                    <input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="Search tracks or sources"
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${getTextOpacity(theme, 0.12)}`,
                        borderRadius: theme.borderRadius,
                        padding: '9px 10px',
                        color: theme.text,
                        fontSize: 12,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
                  {filteredAssets.map((asset) => {
                    const alreadyQueued = queuedAssetIds.has(`${asset.sourceId}:${asset.id}`);

                    return (
                      <div
                        key={`${asset.sourceId}:${asset.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: theme.borderRadius,
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                        }}
                      >
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: alreadyQueued ? `${theme.accent}25` : 'rgba(255,255,255,0.08)',
                          color: alreadyQueued ? theme.accent : getTextOpacity(theme, 0.55),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Music size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {asset.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.48), lineHeight: 1.4 }}>
                              {asset.sourceName || 'Unknown source'}
                              {formatDuration(asset.duration) ? ` · ${formatDuration(asset.duration)}` : ''}
                            </div>
                            <StorageBadge item={asset} />
                          </div>
                        </div>
                        <button
                          onClick={() => onAddSelection(asset)}
                          disabled={alreadyQueued}
                          style={{
                            background: alreadyQueued ? 'rgba(255,255,255,0.08)' : theme.accent,
                            border: 'none',
                            borderRadius: theme.borderRadius,
                            color: alreadyQueued ? getTextOpacity(theme, 0.45) : '#fff',
                            padding: '7px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: alreadyQueued ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          <Plus size={12} /> {alreadyQueued ? 'Added' : 'Add'}
                        </button>
                      </div>
                    );
                  })}

                  {filteredAssets.length === 0 && (
                    <div style={{
                      borderRadius: theme.borderRadius,
                      padding: '20px 12px',
                      fontSize: 12,
                      color: getTextOpacity(theme, 0.48),
                      background: 'rgba(255,255,255,0.03)',
                      textAlign: 'center',
                    }}>
                      {availableAssets.length === 0
                        ? 'No tracks are available yet. Connect a source and refresh.'
                        : 'No tracks matched the current search.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: 16, overflowY: 'auto' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                borderRadius: theme.borderRadius,
                padding: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
                      Saved Playback Queue
                    </div>
                    <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), lineHeight: 1.45 }}>
                      The player uses this order for selected music sources and streams each track on demand.
                    </div>
                  </div>
                  <div style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `${theme.accent}20`,
                    color: theme.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {selectedQueue.length}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
                  {selectedQueue.map((selection, index) => {
                    const selectionStatus = getSelectionStatus(selection);
                    const copy = statusCopy(selectionStatus);

                    return (
                      <div
                        key={selection.selectionId}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr auto',
                          gap: 10,
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: theme.borderRadius,
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                        }}
                      >
                        <div style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: copy.background,
                          color: copy.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {selectionStatus === 'ready' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selection.name}
                          </div>
                          <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.48), lineHeight: 1.4 }}>
                            {copy.label}
                            {formatDuration(selection.duration) ? ` · ${formatDuration(selection.duration)}` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => onMoveSelection(index, index - 1)}
                            disabled={index === 0}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: 'none',
                              borderRadius: theme.borderRadius,
                              color: index === 0 ? getTextOpacity(theme, 0.35) : theme.text,
                              padding: 6,
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Move up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => onMoveSelection(index, index + 1)}
                            disabled={index === selectedQueue.length - 1}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: 'none',
                              borderRadius: theme.borderRadius,
                              color: index === selectedQueue.length - 1 ? getTextOpacity(theme, 0.35) : theme.text,
                              padding: 6,
                              cursor: index === selectedQueue.length - 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Move down"
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            onClick={() => onRemoveSelection(selection.selectionId)}
                            style={{
                              background: 'rgba(239,68,68,0.12)',
                              border: 'none',
                              borderRadius: theme.borderRadius,
                              color: '#ef4444',
                              padding: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Remove from queue"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {selectedQueue.length === 0 && (
                    <div style={{
                      borderRadius: theme.borderRadius,
                      padding: '22px 12px',
                      fontSize: 12,
                      color: getTextOpacity(theme, 0.48),
                      background: 'rgba(255,255,255,0.03)',
                      textAlign: 'center',
                    }}>
                      Add tracks from the left pane to build the saved music queue.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: 16, overflowY: 'auto' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                borderRadius: theme.borderRadius,
                padding: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
                      Saved Playback Queue
                    </div>
                    <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), lineHeight: 1.45 }}>
                      The player uses this order for selected music sources and streams each track on demand.
                    </div>
                  </div>
                  <div style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `${theme.accent}20`,
                    color: theme.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {selectedQueue.length}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
                  {selectedQueue.map((selection, index) => {
                    const selectionStatus = getSelectionStatus(selection);
                    const copy = statusCopy(selectionStatus);

                    return (
                      <div
                        key={selection.selectionId}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr auto',
                          gap: 10,
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: theme.borderRadius,
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                        }}
                      >
                        <div style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: copy.background,
                          color: copy.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {selectionStatus === 'ready' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selection.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.48), lineHeight: 1.4 }}>
                              {copy.label}
                              {formatDuration(selection.duration) ? ` · ${formatDuration(selection.duration)}` : ''}
                            </div>
                            <StorageBadge item={selection} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => onMoveSelection(index, index - 1)}
                            disabled={index === 0}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: 'none',
                              borderRadius: theme.borderRadius,
                              color: index === 0 ? getTextOpacity(theme, 0.35) : theme.text,
                              padding: 6,
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Move up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => onMoveSelection(index, index + 1)}
                            disabled={index === selectedQueue.length - 1}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: 'none',
                              borderRadius: theme.borderRadius,
                              color: index === selectedQueue.length - 1 ? getTextOpacity(theme, 0.35) : theme.text,
                              padding: 6,
                              cursor: index === selectedQueue.length - 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Move down"
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            onClick={() => onRemoveSelection(selection.selectionId)}
                            style={{
                              background: 'rgba(239,68,68,0.12)',
                              border: 'none',
                              borderRadius: theme.borderRadius,
                              color: '#ef4444',
                              padding: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Remove from queue"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {selectedQueue.length === 0 && (
                    <div style={{
                      borderRadius: theme.borderRadius,
                      padding: '22px 12px',
                      fontSize: 12,
                      color: getTextOpacity(theme, 0.48),
                      background: 'rgba(255,255,255,0.03)',
                      textAlign: 'center',
                    }}>
                      Add tracks from the left pane to build the saved music queue.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'connections' && (
            <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
              <RemoteSourcesPanel
                theme={theme}
                getTextOpacity={getTextOpacity}
                title="Music Sources"
                description="Connect a local folder for browser-picked files or add a public manifest source for streamed music."
                sources={sources}
                sourceStatuses={sourceStatuses}
                onAddSource={() => setShowRemoteConfigurator(true)}
                onAddLocalSource={supportsLocalFolders ? onAddLocalSource : undefined}
                onRefreshSources={onRefreshSources}
                onRemoveSource={onRemoveSource}
                emptyStateText="No music sources connected yet."
              />

                {showRemoteConfigurator && (
                  <div style={{ marginBottom: 12 }}>
                    <RemoteSourceConfigurator
                      embedded
                      theme={theme}
                      getTextOpacity={getTextOpacity}
                      assetType="audio"
                      onCancel={() => setShowRemoteConfigurator(false)}
                      onConnect={async (sourceInput) => {
                        await onAddRemoteSource(sourceInput);
                        setShowRemoteConfigurator(false);
                      }}
                    />
                  </div>
                )}

              {!supportsLocalFolders && (
                <div style={{
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.25)',
                  borderRadius: theme.borderRadius,
                  padding: 10,
                  fontSize: 11,
                  color: '#fcd34d',
                  lineHeight: 1.45,
                  marginBottom: 12,
                }}>
                  Local folders need a browser with File System Access support. Browser-stored uploads still work here.
                </div>
              )}

              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${getTextOpacity(theme, 0.08)}`,
                borderRadius: theme.borderRadius,
                padding: 12,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 6 }}>
                  Storage behavior
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <StorageBadge item={{ isStored: true }} />
                  <StorageBadge item={{ isLocal: true }} />
                  <StorageBadge item={{ isRemote: true }} />
                </div>
              </div>
            </div>
          )}

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
              Browser uploads are stored locally. Folder and cloud sources stay connection-only and stream on demand.
            </div>
            <button
              onClick={onClose}
              style={{
                background: theme.accent,
                border: 'none',
                borderRadius: theme.borderRadius,
                color: '#fff',
                padding: '9px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RefreshCw size={14} /> Done
            </button>
          </div>
        </div>
      </div>
  );
}