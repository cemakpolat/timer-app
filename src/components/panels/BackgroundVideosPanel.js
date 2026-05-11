import React, { useState, useRef } from 'react';
import { Film, Plus, Trash2, Play } from 'lucide-react';

const MAX_VIDEO_SIZE = 52_428_800; // 50 MB

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const mb = bytes / 1_048_576;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
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
}) {
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const videos = getAllBackgroundVideos ? getAllBackgroundVideos() : [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');

    // Client-side validation before touching IndexedDB
    if (!['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
      setUploadError('Unsupported format. Use MP4, WebM, or OGG.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      const mb = (file.size / 1_048_576).toFixed(1);
      setUploadError(`Too large (${mb} MB). Max allowed: 50 MB.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const newVideo = await uploadBackgroundVideo(file);
      setSelectedVideoId(newVideo.id);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: '✅ Video uploaded successfully!', type: 'success', ttl: 3000 },
      }));
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

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
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: uploading ? 'rgba(255,255,255,0.1)' : theme.accent,
            border: 'none',
            borderRadius: theme.borderRadius,
            padding: '6px 10px',
            color: '#fff',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <Plus size={13} /> {uploading ? 'Uploading…' : 'Add'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
      </div>

      {/* Size hint */}
      <p style={{ fontSize: 11, color: getTextOpacity(theme, 0.45), margin: '0 0 10px', lineHeight: 1.4 }}>
        MP4 · WebM · OGG &nbsp;|&nbsp; Max 50 MB per video.
        Videos are stored locally in your browser.
      </p>

      {/* Error */}
      {uploadError && (
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: theme.borderRadius,
          padding: '8px 10px',
          color: '#ef4444',
          fontSize: 12,
          marginBottom: 10,
        }}>
          {uploadError}
        </div>
      )}

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
                {formatBytes(video.size)}
              </div>
            </div>
            {isSelected && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />
            )}
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
          </div>
        );
      })}

      {videos.filter(v => v.id !== 'None').length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: getTextOpacity(theme, 0.35), fontSize: 12 }}>
          No videos uploaded yet.
          <br />Click <strong>Add</strong> to upload your first background video.
        </div>
      )}
    </div>
  );
}
