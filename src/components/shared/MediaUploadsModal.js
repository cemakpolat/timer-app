import React, { useState } from 'react';
import { Cloud, Database, Film, Image as ImageIcon, Upload, X } from 'lucide-react';
import RemoteSourcesPanel from './RemoteSourcesPanel';
import RemoteSourceConfigurator from './RemoteSourceConfigurator';

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

function getAssetCopy(assetType) {
  return assetType === 'video'
    ? {
        title: 'Video Uploads',
        plural: 'videos',
        singular: 'Video',
        icon: Film,
        accept: 'video/mp4,video/webm,video/ogg',
        emptyStoredText: 'No browser-stored videos yet.',
        sourcesTitle: 'Video Sources',
        sourcesDescription: 'Connect a local folder or a public manifest source for streamed videos.',
        noSourcesText: 'No video sources connected yet.',
      }
    : {
        title: 'Image Uploads',
        plural: 'images',
        singular: 'Image',
        icon: ImageIcon,
        accept: 'image/*',
        emptyStoredText: 'No browser-stored images yet.',
        sourcesTitle: 'Image Sources',
        sourcesDescription: 'Connect a local folder or a public manifest source for streamed images.',
        noSourcesText: 'No image sources connected yet.',
      };
}

function getStorageState(item = {}) {
  if (item.isStored) {
    return {
      label: 'Stored',
      detail: 'Stored in browser storage',
      color: '#86efac',
      background: 'rgba(34,197,94,0.14)',
    };
  }

  if (item.isLocal || item.provider === 'local-folder') {
    return {
      label: 'Not stored',
      detail: 'Loaded from a local folder',
      color: '#fde68a',
      background: 'rgba(250,204,21,0.14)',
    };
  }

  return {
    label: 'Not stored',
    detail: 'Streamed from a remote source',
    color: '#93c5fd',
    background: 'rgba(59,130,246,0.14)',
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

export default function MediaUploadsModal({
  theme,
  getTextOpacity,
  assetType,
  onClose,
  uploadedItems = [],
  onUploadFile,
  sources = [],
  sourceStatuses = [],
  onAddRemoteSource,
  onAddLocalSource,
  onRefreshSources,
  onRemoveSource,
  supportsLocalFolders,
}) {
  const assetCopy = getAssetCopy(assetType);
  const TitleIcon = assetCopy.icon;
  const [activeTab, setActiveTab] = useState('stored');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showRemoteConfigurator, setShowRemoteConfigurator] = useState(false);

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
    if (!file || typeof onUploadFile !== 'function') {
      event.target.value = '';
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      await onUploadFile(file);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `✅ ${assetCopy.singular} uploaded successfully!`,
          type: 'success',
          ttl: 3000,
        },
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
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2250,
        padding: 12,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(860px, 96vw)',
          maxHeight: 'min(88vh, 920px)',
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
              {assetCopy.title}
            </div>
            <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.55), lineHeight: 1.45 }}>
              Upload files into browser storage or manage local-folder and remote-source connections from one place.
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

        <div style={{ padding: '12px 16px 0', borderBottom: `1px solid ${getTextOpacity(theme, 0.08)}` }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: theme.borderRadius, padding: 4 }}>
            <button type="button" onClick={() => setActiveTab('stored')} style={tabStyle('stored')}>
              <TitleIcon size={14} /> Stored
            </button>
            <button type="button" onClick={() => setActiveTab('connections')} style={tabStyle('connections')}>
              <Cloud size={14} /> Connections
            </button>
          </div>
        </div>

        {activeTab === 'stored' && (
          <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${getTextOpacity(theme, 0.08)}`,
              borderRadius: theme.borderRadius,
              padding: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
                    Browser-stored {assetCopy.plural}
                  </div>
                  <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), lineHeight: 1.45 }}>
                    These files live in browser storage and stay available even when the original file is gone.
                  </div>
                </div>
                <label
                  htmlFor={`media-upload-${assetType}`}
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
                  <Upload size={13} /> {isUploading ? 'Uploading…' : `Upload ${assetCopy.singular}`}
                </label>
              </div>
              <input
                id={`media-upload-${assetType}`}
                type="file"
                accept={assetCopy.accept}
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

              <div style={{ display: 'grid', gap: 8, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                {uploadedItems.map((item) => (
                  <div
                    key={item.id}
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
                      <TitleIcon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.48), lineHeight: 1.4 }}>
                        {formatBytes(item.size) || 'Stored asset'}
                      </div>
                    </div>
                    <StorageBadge item={{ ...item, isStored: true }} />
                  </div>
                ))}

                {uploadedItems.length === 0 && (
                  <div style={{
                    borderRadius: theme.borderRadius,
                    padding: '18px 12px',
                    fontSize: 12,
                    color: getTextOpacity(theme, 0.48),
                    background: 'rgba(255,255,255,0.03)',
                    textAlign: 'center',
                  }}>
                    {assetCopy.emptyStoredText}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
            <RemoteSourcesPanel
              theme={theme}
              getTextOpacity={getTextOpacity}
              title={assetCopy.sourcesTitle}
              description={assetCopy.sourcesDescription}
              sources={sources}
              sourceStatuses={sourceStatuses}
              onAddSource={typeof onAddRemoteSource === 'function' ? () => setShowRemoteConfigurator(true) : undefined}
              onAddLocalSource={supportsLocalFolders ? onAddLocalSource : undefined}
              onRefreshSources={onRefreshSources}
              onRemoveSource={onRemoveSource}
              emptyStateText={assetCopy.noSourcesText}
            />

            {showRemoteConfigurator && typeof onAddRemoteSource === 'function' && (
              <div style={{ marginBottom: 12 }}>
                <RemoteSourceConfigurator
                  embedded
                  theme={theme}
                  getTextOpacity={getTextOpacity}
                  assetType={assetType}
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
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 8 }}>
                Storage legend
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 11, color: getTextOpacity(theme, 0.55) }}>Uploaded into browser storage</span>
                  <StorageBadge item={{ isStored: true }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 11, color: getTextOpacity(theme, 0.55) }}>Connected local folder</span>
                  <StorageBadge item={{ isLocal: true }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 11, color: getTextOpacity(theme, 0.55) }}>Remote manifest source</span>
                  <StorageBadge item={{ isRemote: true }} />
                </div>
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
            Browser uploads use IndexedDB. Local folders and remote manifests stay outside browser storage and load on demand.
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
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}