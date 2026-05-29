import React, { useState } from 'react';
import { Database, Film, Play, Trash2, Upload, Volume2, VolumeX } from 'lucide-react';

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
  deleteBackgroundVideo,
  onOpenUploadModal,
  onOpenLocalFolder,
  videoLoopFade,
  setVideoLoopFade,
  videoAudioEnabled = false,
  setVideoAudioEnabled,
}) {
  const [loopFadeOpen, setLoopFadeOpen] = useState(false);
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
    gap: 6,
    padding: '7px 8px',
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
          width: 32, height: 24, borderRadius: 4,
          background: 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 9, color: getTextOpacity(theme, 0.4) }}>None</span>
        </div>
        <span style={{ flex: 1, fontSize: 11, color: theme.text }}>None</span>
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
              width: 32, height: 24, borderRadius: 4,
              background: isSelected ? `${theme.accent}30` : 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Play size={10} style={{ color: isSelected ? theme.accent : getTextOpacity(theme, 0.4) }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {video.name}
              </div>
              <div style={{ fontSize: 9, color: getTextOpacity(theme, 0.45) }}>
                {storageCopy.subtitle}
              </div>
            </div>
            <div
              title={storageCopy.title}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: storageCopy.stored ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.08)',
                color: storageCopy.stored ? '#86efac' : getTextOpacity(theme, 0.55),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Database size={11} />
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
                  padding: '3px 5px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
                title="Delete video"
              >
                <Trash2 size={10} />
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

      {selectedVideoId && selectedVideoId !== 'None' && typeof setVideoAudioEnabled === 'function' && (
        <div style={{
          marginTop: 16,
          borderRadius: theme.borderRadius,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: videoAudioEnabled ? `${theme.accent}25` : 'rgba(255,255,255,0.08)',
              color: videoAudioEnabled ? theme.accent : getTextOpacity(theme, 0.55),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {videoAudioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>
                Video Audio
              </div>
              <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.45), lineHeight: 1.5 }}>
                Play the video's original sound, or keep it muted so the app's own music stays in control.
              </div>
            </div>

            <div
              role="switch"
              aria-checked={videoAudioEnabled}
              aria-label="Background video audio"
              onClick={() => setVideoAudioEnabled(!videoAudioEnabled)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setVideoAudioEnabled(!videoAudioEnabled);
                }
              }}
              tabIndex={0}
              title={videoAudioEnabled ? 'Video audio on' : 'Video audio off'}
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: videoAudioEnabled ? theme.accent : 'rgba(255,255,255,0.15)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: 3,
                left: videoAudioEnabled ? 18 : 3,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Loop-fade settings — only shown when a video is active */}
      {selectedVideoId && selectedVideoId !== 'None' && videoLoopFade && setVideoLoopFade && (
        <div style={{
          marginTop: 16,
          borderRadius: theme.borderRadius,
          border: `1px solid rgba(255,255,255,0.07)`,
          overflow: 'hidden',
        }}>
          {/* Collapsible header row */}
          <button
            type="button"
            onClick={() => setLoopFadeOpen((v) => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: 'none',
              cursor: 'pointer',
              gap: 8,
            }}
            aria-expanded={loopFadeOpen}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>Loop Transition Fade</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* On/off toggle */}
              <div
                role="switch"
                aria-checked={videoLoopFade.enabled}
                onClick={(e) => { e.stopPropagation(); setVideoLoopFade((s) => ({ ...s, enabled: !s.enabled })); }}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.stopPropagation(); setVideoLoopFade((s) => ({ ...s, enabled: !s.enabled })); } }}
                tabIndex={0}
                title={videoLoopFade.enabled ? 'Loop fade on' : 'Loop fade off'}
                style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: videoLoopFade.enabled ? theme.accent : 'rgba(255,255,255,0.15)',
                  position: 'relative', cursor: 'pointer',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3,
                  left: videoLoopFade.enabled ? 18 : 3,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                }} />
              </div>
              {/* Chevron */}
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ transform: loopFadeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
              >
                <path d="M2 4l4 4 4-4" stroke={getTextOpacity(theme, 0.5)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {/* Collapsible body */}
          {loopFadeOpen && (
            <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ fontSize: 10, color: getTextOpacity(theme, 0.4), margin: '0 0 10px', lineHeight: 1.5 }}>
                Briefly fades the video at the loop point so the cut from end→start is invisible.
                Recommended off for very short loops (&lt;2 s).
              </p>

              {videoLoopFade.enabled && (
                <>
                  {/* Fade color */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: getTextOpacity(theme, 0.7), flex: 1 }}>Fade color</span>
                    <input
                      type="color"
                      value={videoLoopFade.color}
                      onChange={(e) => setVideoLoopFade((s) => ({ ...s, color: e.target.value }))}
                      style={{ width: 30, height: 22, border: 'none', borderRadius: 4, padding: 1, cursor: 'pointer', background: 'transparent' }}
                      title="Fade-to color"
                      aria-label="Loop fade color"
                    />
                    <span style={{ fontSize: 10, color: getTextOpacity(theme, 0.45), fontFamily: 'monospace', minWidth: 52 }}>
                      {videoLoopFade.color.toUpperCase()}
                    </span>
                  </div>

                  {/* Fade depth */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: getTextOpacity(theme, 0.7), flex: 1 }}>Depth</span>
                    <input
                      type="range" min={0} max={1} step={0.05}
                      value={videoLoopFade.opacity}
                      onChange={(e) => setVideoLoopFade((s) => ({ ...s, opacity: parseFloat(e.target.value) }))}
                      style={{ width: 80, accentColor: theme.accent, cursor: 'pointer' }}
                      title={`Fade depth: ${Math.round(videoLoopFade.opacity * 100)}%`}
                      aria-label="Loop fade depth"
                    />
                    <span style={{ fontSize: 10, color: getTextOpacity(theme, 0.45), minWidth: 28, textAlign: 'right' }}>
                      {Math.round(videoLoopFade.opacity * 100)}%
                    </span>
                  </div>

                  {/* Transition duration */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: getTextOpacity(theme, 0.7), flex: 1 }}>Duration</span>
                    <input
                      type="range" min={100} max={3000} step={100}
                      value={videoLoopFade.duration}
                      onChange={(e) => setVideoLoopFade((s) => ({ ...s, duration: parseInt(e.target.value, 10) }))}
                      style={{ width: 80, accentColor: theme.accent, cursor: 'pointer' }}
                      title={`Fade duration: ${videoLoopFade.duration} ms`}
                      aria-label="Loop fade duration"
                    />
                    <span style={{ fontSize: 10, color: getTextOpacity(theme, 0.45), minWidth: 36, textAlign: 'right' }}>
                      {videoLoopFade.duration} ms
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
