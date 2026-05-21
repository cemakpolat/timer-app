import React, { useState, useEffect } from 'react';
import { Images, Plus, Trash2, ChevronDown, ChevronUp, Play, Square, Clock, Repeat, Film } from 'lucide-react';

/**
 * SlideSetPanel - Manage named collections of background media for slideshow playback.
 *
 * Props:
 *   theme                 - current theme object
 *   getTextOpacity        - fn(theme, opacity) → rgba string
 *   slideSets             - array of slide set objects
 *   activeSlideSetId      - currently active slide set id (null = off)
 *   getAllBackgroundImages - fn() → array of { id, name, isBuiltIn, path }
 *   getAllBackgroundVideos - fn() → array of { id, name }
 *   getBackgroundImageUrl - async fn(id) → url string
 *   getBackgroundVideoUrl - async fn(id) → url string
 *   createSlideSet        - fn(name) → id
 *   deleteSlideSet        - fn(id)
 *   renameSlideSet        - fn(id, name)
 *   setSlideInterval      - fn(id, seconds)
 *   setSlideTransition    - fn(id, 'fade'|'instant')
 *   addImageToSet         - fn(setId, imageId)
 *   addVideoToSet         - fn(setId, videoId)
 *   removeMediaItemFromSet - fn(setId, mediaItemId)
 *   setActiveSlideSetId   - fn(id | null) — activates/deactivates slideshow
 */
export default function SlideSetPanel({
  theme,
  getTextOpacity,
  slideSets,
  activeSlideSetId,
  getAllBackgroundImages,
  getAllBackgroundVideos,
  getBackgroundImageUrl,
  getBackgroundVideoUrl,
  createSlideSet,
  deleteSlideSet,
  renameSlideSet,
  setSlideInterval,
  setSlideTransition,
  addImageToSet,
  addVideoToSet,
  removeMediaItemFromSet,
  setActiveSlideSetId,
}) {
  const [allImages, setAllImages] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [videoUrls, setVideoUrls] = useState({});
  const [expandedSetId, setExpandedSetId] = useState(null);
  const [intervalDrafts, setIntervalDrafts] = useState({});
  const [newSetName, setNewSetName] = useState('');
  const [creatingSet, setCreatingSet] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Load all media and their preview URLs.
  useEffect(() => {
    const load = async () => {
      const images = getAllBackgroundImages().filter(img => img.id !== 'None');
      const videos = (getAllBackgroundVideos ? getAllBackgroundVideos() : []).filter(video => video.id !== 'None');
      setAllImages(images);
      setAllVideos(videos);

      const nextImageUrls = {};
      for (const img of images) {
        try {
          const url = await getBackgroundImageUrl(img.id);
          if (url) nextImageUrls[img.id] = url;
        } catch {}
      }

      const nextVideoUrls = {};
      if (typeof getBackgroundVideoUrl === 'function') {
        for (const video of videos) {
          try {
            const url = await getBackgroundVideoUrl(video.id);
            if (url) nextVideoUrls[video.id] = url;
          } catch {}
        }
      }

      setImageUrls(nextImageUrls);
      setVideoUrls(nextVideoUrls);
    };
    load();
  }, [getAllBackgroundImages, getAllBackgroundVideos, getBackgroundImageUrl, getBackgroundVideoUrl]);

  const handleCreate = () => {
    if (!newSetName.trim()) return;
    const id = createSlideSet(newSetName.trim());
    setExpandedSetId(id);
    setNewSetName('');
    setCreatingSet(false);
  };

  const handleToggleActive = (id) => {
    setActiveSlideSetId(activeSlideSetId === id ? null : id);
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: theme.borderRadius,
    marginBottom: 10,
    overflow: 'hidden',
    border: `1px solid rgba(255,255,255,0.08)`,
  };

  const btnStyle = (accent = false, danger = false) => ({
    background: danger ? '#ef4444' : accent ? theme.accent : 'rgba(255,255,255,0.08)',
    border: 'none',
    borderRadius: theme.borderRadius,
    padding: '5px 10px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'opacity 0.2s',
  });

  const renderMediaTile = (mediaItem, options = {}) => {
    const isImage = mediaItem.type === 'image';
    const previewUrl = isImage ? imageUrls[mediaItem.assetId] : videoUrls[mediaItem.assetId];
    const fallbackLabel = options.label || mediaItem.assetId.slice(0, 4);

    if (isImage && previewUrl) {
      return <img src={previewUrl} alt={options.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    }

    if (!isImage && previewUrl) {
      return (
        <video
          src={previewUrl}
          muted
          playsInline
          loop
          autoPlay
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }

    return (
      <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 9 }}>
        {isImage ? <Images size={14} /> : <Film size={14} />}
        <span>{fallbackLabel}</span>
      </div>
    );
  };

  const commitIntervalDraft = (setId) => {
    const rawDraft = intervalDrafts[setId];
    if (rawDraft === undefined) {
      return;
    }

    const normalized = String(rawDraft).trim();
    if (normalized !== '') {
      setSlideInterval(setId, normalized);
    }

    setIntervalDrafts((prev) => {
      const next = { ...prev };
      delete next[setId];
      return next;
    });
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: theme.text, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Images size={16} /> Slide Sets
        </h3>
        <button
          style={btnStyle(true)}
          onClick={() => { setCreatingSet(v => !v); setNewSetName(''); }}
          title="Create new slide set"
        >
          <Plus size={13} /> New Set
        </button>
      </div>

      {/* New set input */}
      {creatingSet && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <input
            autoFocus
            value={newSetName}
            onChange={e => setNewSetName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreatingSet(false); }}
            placeholder="Slide set name…"
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${theme.accent}`,
              borderRadius: theme.borderRadius,
              padding: '7px 10px',
              color: theme.text,
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button style={btnStyle(true)} onClick={handleCreate}>Create</button>
          <button style={btnStyle()} onClick={() => setCreatingSet(false)}>Cancel</button>
        </div>
      )}

      {/* Empty state */}
      {slideSets.length === 0 && !creatingSet && (
        <div style={{ textAlign: 'center', padding: '28px 0', color: getTextOpacity(theme, 0.4), fontSize: 13 }}>
          No slide sets yet.<br />
          <span style={{ fontSize: 12 }}>Create one and add background images or videos.</span>
        </div>
      )}

      {/* Slide sets list */}
      {slideSets.map(set => {
        const isActive = activeSlideSetId === set.id;
        const isExpanded = expandedSetId === set.id;
        const isRenaming = renamingId === set.id;

        return (
          <div key={set.id} style={{ ...cardStyle, border: isActive ? `1px solid ${theme.accent}` : cardStyle.border }}>
            {/* Set header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
              {/* Active indicator dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isActive ? theme.accent : 'rgba(255,255,255,0.2)',
                flexShrink: 0,
                transition: 'background 0.2s',
              }} />

              {/* Name / rename */}
              {isRenaming ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => { renameSlideSet(set.id, renameValue); setRenamingId(null); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { renameSlideSet(set.id, renameValue); setRenamingId(null); }
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.08)',
                    border: `1px solid ${theme.accent}`, borderRadius: 4,
                    padding: '3px 7px', color: theme.text, fontSize: 13, outline: 'none',
                  }}
                />
              ) : (
                <span
                  style={{ flex: 1, fontSize: 13, fontWeight: 600, color: theme.text, cursor: 'pointer' }}
                  onDoubleClick={() => { setRenamingId(set.id); setRenameValue(set.name); }}
                  title="Double-click to rename"
                >
                  {set.name}
                  <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.5, marginLeft: 6 }}>
                    {set.mediaItems.length} item{set.mediaItems.length !== 1 ? 's' : ''}
                  </span>
                </span>
              )}

              {/* Controls */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {/* Play / Stop */}
                <button
                  style={{ ...btnStyle(isActive), opacity: set.mediaItems.length === 0 ? 0.4 : 1 }}
                  disabled={set.mediaItems.length === 0}
                  onClick={() => handleToggleActive(set.id)}
                  title={isActive ? 'Stop slideshow' : 'Start slideshow'}
                >
                  {isActive ? <Square size={12} /> : <Play size={12} />}
                </button>

                {/* Expand / collapse */}
                <button
                  style={btnStyle()}
                  onClick={() => setExpandedSetId(isExpanded ? null : set.id)}
                  title={isExpanded ? 'Collapse' : 'Manage images'}
                >
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {/* Delete */}
                <button
                  style={btnStyle(false, true)}
                  onClick={() => {
                    if (window.confirm(`Delete slide set "${set.name}"?`)) deleteSlideSet(set.id);
                  }}
                  title="Delete slide set"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Expanded settings + media picker */}
            {isExpanded && (
              <div style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Interval + transition controls */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: getTextOpacity(theme, 0.7) }}>
                    <Clock size={13} /> Image Interval
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={intervalDrafts[set.id] ?? String(set.intervalSec ?? '')}
                      onChange={(e) => {
                        setIntervalDrafts((prev) => ({ ...prev, [set.id]: e.target.value }));
                      }}
                      onBlur={() => commitIntervalDraft(set.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          commitIntervalDraft(set.id);
                          e.currentTarget.blur();
                        }
                        if (e.key === 'Escape') {
                          setIntervalDrafts((prev) => {
                            const next = { ...prev };
                            delete next[set.id];
                            return next;
                          });
                          e.currentTarget.blur();
                        }
                      }}
                      style={{
                        width: 48, background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4,
                        padding: '3px 6px', color: theme.text, fontSize: 12, outline: 'none', textAlign: 'center',
                      }}
                    />
                    <span style={{ opacity: 0.5, fontSize: 11 }}>sec</span>
                  </label>
                  <span style={{ fontSize: 11, color: getTextOpacity(theme, 0.45) }}>
                    Videos play fully, then advance to the next item.
                  </span>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: getTextOpacity(theme, 0.7) }}>
                    <Repeat size={13} /> Transition
                    <select
                      value={set.transition || 'fade'}
                      onChange={e => setSlideTransition(set.id, e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 4, padding: '3px 6px',
                        color: theme.text, fontSize: 12, outline: 'none', cursor: 'pointer',
                      }}
                    >
                      <option value="fade">Fade</option>
                      <option value="instant">Instant</option>
                    </select>
                  </label>
                </div>

                {/* Media in this set */}
                {set.mediaItems.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      In this set
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {set.mediaItems.map((mediaItem) => (
                        <div
                          key={mediaItem.id}
                          style={{ position: 'relative', width: 52, height: 52, borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }}
                          title="Click to remove"
                          onClick={() => removeMediaItemFromSet(set.id, mediaItem.id)}
                        >
                          {renderMediaTile(mediaItem)}
                          {/* Remove overlay */}
                          <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0, transition: 'opacity 0.2s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                          >
                            <Trash2 size={14} color="#fff" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available images to add */}
                <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Add images
                </div>
                {allImages.length === 0 ? (
                  <div style={{ fontSize: 12, opacity: 0.4 }}>Upload background images first to add them here.</div>
                ) : (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 140, overflowY: 'auto' }}>
                    {allImages.filter(img => !set.mediaItems.some(item => item.type === 'image' && item.assetId === img.id)).map(img => (
                      <div
                        key={img.id}
                        onClick={() => addImageToSet(set.id, img.id)}
                        title={`Add "${img.name}"`}
                        style={{ position: 'relative', width: 52, height: 52, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                      >
                        {renderMediaTile({ type: 'image', assetId: img.id }, { alt: img.name, label: img.name.slice(0, 4) })}
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                        >
                          <Plus size={16} color="#fff" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 11, opacity: 0.5, margin: '10px 0 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Add videos
                </div>
                {allVideos.length === 0 ? (
                  <div style={{ fontSize: 12, opacity: 0.4 }}>Upload background videos first to add them here.</div>
                ) : (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 140, overflowY: 'auto' }}>
                    {allVideos.filter(video => !set.mediaItems.some(item => item.type === 'video' && item.assetId === video.id)).map(video => (
                      <div
                        key={video.id}
                        onClick={() => addVideoToSet(set.id, video.id)}
                        title={`Add "${video.name}"`}
                        style={{ position: 'relative', width: 52, height: 52, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                      >
                        {renderMediaTile({ type: 'video', assetId: video.id }, { alt: video.name, label: video.name.slice(0, 4) })}
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                        >
                          <Plus size={16} color="#fff" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
