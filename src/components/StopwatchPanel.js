import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

/**
 * Stopwatch panel: simple elapsed time display with start/pause/reset
 */
const StopwatchPanel = ({
  time,
  isRunning,
  onStart,
  onPause,
  onReset,
  theme
}) => {
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const ms = Math.floor((sec % 1) * 100);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  return (
    <div style={{ textAlign: 'center', padding: 15 }}>
      {/* Display */}
      <div
        style={{
          fontSize: 72,
          fontWeight: '700',
          marginBottom: 40,
          fontVariantNumeric: 'tabular-nums',
          color: theme.text
        }}
      >
        {formatTime(time)}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {isRunning ? (
          <button
            onClick={onPause}
            style={{
              background: theme.accent,
              border: 'none',
              borderRadius: 10,
              padding: '12px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: theme.text,
              fontSize: 16,
              fontWeight: 600
            }}
          >
            <Pause size={20} /> Pause
          </button>
        ) : (
          <button
            onClick={onStart}
            style={{
              background: theme.accent,
              border: 'none',
              borderRadius: 10,
              padding: '12px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: theme.text,
              fontSize: 16,
              fontWeight: 600
            }}
          >
            <Play size={20} /> Start
          </button>
        )}
        <button
          onClick={onReset}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: `1px solid rgba(255,255,255,0.2)`,
            borderRadius: 10,
            padding: '12px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: theme.text,
            fontSize: 16,
            fontWeight: 600
          }}
        >
          <RotateCcw size={20} /> Reset
        </button>
      </div>
    </div>
  );
};

export default StopwatchPanel;
