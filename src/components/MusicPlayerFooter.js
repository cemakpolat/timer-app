import React from 'react';
import { Play, Pause, X, SkipBack, SkipForward } from 'lucide-react';
import useMusicPlayerState from '../hooks/useMusicPlayerState';

const MusicPlayerFooter = ({ theme, ambientSound }) => {
  const { isPlaying, repeatMode, currentTime, duration } = useMusicPlayerState();

  if (!ambientSound || ambientSound === 'None') return null;

  const formatSongName = (name) => {
    if (!name) return '';
    // Strip "custom_" prefix if present
    const clean = name.startsWith('custom_') ? name.slice(7) : name;
    // Remove file extension
    const noExt = clean.replace(/\.[^.]+$/, '');
    return noExt
      .split(/[-_]/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'repeat-one') return '🔂';
    if (repeatMode === 'random') return '🔀';
    return '🔁';
  };

  const formatTime = (value) => {
    if (!Number.isFinite(value) || value <= 0) {
      return '0:00';
    }

    const totalSeconds = Math.floor(value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const controls = window.__musicPlayerControls;
  const cycleRepeat = () => {
    const modes = ['sequential', 'random', 'repeat-one'];
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    controls?.setRepeatMode(next);
  };

  const hasDuration = Number.isFinite(duration) && duration > 0;
  const progressPercent = hasDuration ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const btnBase = {
    background: 'transparent',
    border: 'none',
    color: theme.text || '#ffffff',
    cursor: 'pointer',
    padding: '7px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    transition: 'background 0.15s',
    opacity: 0.85
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: 64,
        background: theme.card || 'rgba(18, 18, 28, 0.97)',
        borderTop: `1px solid rgba(255,255,255,0.08)`,
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '6px 16px',
        gap: 6,
        zIndex: 999,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
      }}
    >
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Song Name */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: theme.text,
            opacity: 0.9
          }}
        >
          {formatSongName(ambientSound)}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

        {/* Previous */}
        <button
          style={btnBase}
          title="Previous song"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={() => controls?.skipPrev()}
        >
          <SkipBack size={18} />
        </button>

        {/* Play / Pause */}
        <button
          style={{
            ...btnBase,
            background: theme.accent || '#60a5fa',
            color: '#000',
            opacity: 1,
            borderRadius: '50%',
            width: 36,
            height: 36,
            padding: 0
          }}
          title={isPlaying ? 'Pause' : 'Play'}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onClick={() => controls?.playPause()}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {/* Next */}
        <button
          style={btnBase}
          title="Next song"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={() => controls?.skipNext()}
        >
          <SkipForward size={18} />
        </button>

        {/* Repeat mode */}
        <button
          style={{
            ...btnBase,
            color: repeatMode !== 'sequential' ? theme.accent : theme.text,
            opacity: repeatMode !== 'sequential' ? 1 : 0.6,
            fontSize: 15
          }}
          title={`Repeat: ${repeatMode}`}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={cycleRepeat}
        >
          {getRepeatIcon()}
        </button>

        {/* Stop */}
        <button
          style={btnBase}
          title="Stop music"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={() => controls?.stop()}
        >
          <X size={18} />
        </button>

        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: theme.text, opacity: 0.7, minWidth: 34, textAlign: 'right' }}>
          {formatTime(currentTime)}
        </span>
        <div
          style={{
            flex: 1,
            height: 4,
            background: 'rgba(255,255,255,0.16)',
            borderRadius: 2,
            overflow: 'hidden',
            cursor: hasDuration ? 'pointer' : 'default'
          }}
          onClick={(e) => {
            if (!hasDuration) {
              return;
            }

            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            controls?.seekToPercent?.(percent);
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: theme.accent || '#60a5fa',
              transition: 'width 0.2s ease-out'
            }}
          />
        </div>
        <span style={{ fontSize: 10, color: theme.text, opacity: 0.7, minWidth: 34 }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default MusicPlayerFooter;

