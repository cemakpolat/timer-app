import React from 'react';
import { Database, Film, Play, Trash2, Upload } from 'lucide-react';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const mb = bytes / 1_048_576;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function getVideoStorageCopy(video = {}) {
  const stored = !video.isRemote && !video.isLocal;

  return {
    stored,
    title: stored
      ? 'Stored in browser storage'
      : video.isLocal
        ? 'Not stored in browser storage · local folder'
        : 'Not stored in browser storage · remote source',
    subtitle: stored
      ? `Stored in browser · ${formatBytes(video.size)}`
      : video.isLocal
        ? `Local folder${video.sourceName ? ` · ${video.sourceName}` : ''} · ${formatBytes(video.size)}`
        : `Remote source${video.sourceName ? ` · ${video.sourceName}` : ''} · ${formatBytes(video.size)}`,
  };
}

export default function BackgroundVideosPanel({
  theme,
  getTextOpacity,
  selectedVideoId,
  setSelectedVideoId,
  getAllBackgroundVideos,
  getBackgroundVideoUrl,
  uploadBackgroundVideo,
  deleteBackgroundVideo,
  onOpenUploadModal,
  onOpenLocalFolder,
}) {
  const videos = getAllBackgroundVideos ? getAllBackgroundVideos() : [];

  const handleDelete = async (id) => {
    try {
      await deleteBackgroundVideo(id);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: '✅ Video deleted.', type: 'success', ttl: 2500 },
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ ${err.message}`, type: 'error', ttl: 3000 },
      }));
    }
  };

  const rowStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 10px',
    borderRadius: theme.borderRadius,
    background: isSelected ? `${theme.accent}25` : 'rgba(255,255,255,0.04)',
    border: `1px solid ${isSelected ? theme.accent : 'transparent'}`,
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: 5,
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Film size={15} /> Background Videos
        </span>
        <button
          type="button"
          onClick={onOpenUploadModal}
          style={{
            background: theme.accent,
            border: 'none',
            borderRadius: theme.borderRadius,
            padding: '6px 10px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          title="Open video uploads"
          aria-label="Open video uploads"
        >
          <Upload size={13} /> Upload
        </button>
        {typeof onOpenLocalFolder === 'function' && (
          <button
            type="button"
            onClick={onOpenLocalFolder}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: theme.borderRadius,
              padding: '6px 10px',
              color: theme.text,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Open local video folder"
            aria-label="Open local video folder"
          >
            Folder
          </button>
        )}
      </div>

      {/* Size hint */}
      <p style={{ fontSize: 11, color: getTextOpacity(theme, 0.45), margin: '0 0 10px', lineHeight: 1.4 }}>
        MP4 · WebM · OGG &nbsp;|&nbsp; Max 50 MB per video.
        Upload opens browser storage, local folder, and remote source options.
      </p>

      {/* None option */}
      <div
        style={rowStyle(selectedVideoId === 'None')}
        onClick={() => setSelectedVideoId('None')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setSelectedVideoId('None')}
      >
        <div style={{
          width: 38, height: 28, borderRadius: 4,
          background: 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: getTextOpacity(theme, 0.4) }}>None</span>
        </div>
        <span style={{ flex: 1, fontSize: 12, color: theme.text }}>None</span>
        {selectedVideoId === 'None' && (
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />
        )}
      </div>

      {/* Video list */}
      {videos.filter(v => v.id !== 'None').map(video => {
        const isSelected = selectedVideoId === video.id;
        const storageCopy = getVideoStorageCopy(video);

        return (
          <div key={video.id} style={rowStyle(isSelected)} onClick={() => setSelectedVideoId(video.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedVideoId(video.id)}>
            <div style={{
              width: 38, height: 28, borderRadius: 4,
              background: isSelected ? `${theme.accent}30` : 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Play size={12} style={{ color: isSelected ? theme.accent : getTextOpacity(theme, 0.4) }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {video.name}
              </div>
              <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.45) }}>
                {storageCopy.subtitle}
              </div>
            </div>
            <div
              title={storageCopy.title}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: storageCopy.stored ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.08)',
                color: storageCopy.stored ? '#86efac' : getTextOpacity(theme, 0.55),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Database size={13} />
            </div>
            {isSelected && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />
            )}
            {!video.isRemote && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 6px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
                title="Delete video"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        );
      })}

      {videos.filter(v => v.id !== 'None').length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: getTextOpacity(theme, 0.35), fontSize: 12 }}>
          No videos available yet.
          <br />Upload a local file or connect a remote source.
        </div>
      )}
    </div>
  );
}
