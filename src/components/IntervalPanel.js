import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

/**
 * Interval timer panel: work/rest cycles with rounds
 */
const IntervalPanel = ({
  work,
  rest,
  rounds,
  currentRound,
  isWork,
  isRunning,
  time,
  onWorkChange,
  onRestChange,
  onRoundsChange,
  onStart,
  onPause,
  onReset,
  theme,
  showWarning,
  showCritical
}) => {
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      {/* Taxonomy Help */}
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
        <span>
          <b>Interval Timer</b>: Alternate between work and rest cycles for a set number of rounds. Ideal for HIIT, pomodoro, or interval training. For single timers or multi-step routines, use the <b>Timers</b> or <b>Routines</b> tabs.
        </span>
      </div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, color: theme.text }}>
          {isWork ? '💪 Work' : '😌 Rest'} - Round {currentRound}/{rounds}
        </div>
      </div>

      {/* Display */}
      <div
        style={{
          fontSize: 72,
          fontWeight: '700',
          marginBottom: 40,
          fontVariantNumeric: 'tabular-nums',
          color: showCritical ? '#ef4444' : showWarning ? '#f59e0b' : theme.text,
          textShadow: showCritical ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none'
        }}
      >
        {formatTime(time)}
      </div>

      {/* Input fields */}
      {!isRunning && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>Work</label>
            <input
              type="number"
              min="1"
              value={work}
              onChange={(e) => onWorkChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: 8,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 8,
                color: theme.text,
                textAlign: 'center',
                fontSize: 16
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>Rest</label>
            <input
              type="number"
              min="1"
              value={rest}
              onChange={(e) => onRestChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: 8,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 8,
                color: theme.text,
                textAlign: 'center',
                fontSize: 16
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>Rounds</label>
            <input
              type="number"
              min="1"
              value={rounds}
              onChange={(e) => onRoundsChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: 8,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 8,
                color: theme.text,
                textAlign: 'center',
                fontSize: 16
              }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {isRunning ? (
          <button
            onClick={onPause}
            style={{
              background: theme.accent,
              border: 'none',
              borderRadius: 12,
              padding: '16px 32px',
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
              borderRadius: 12,
              padding: '16px 32px',
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
            borderRadius: 12,
            padding: '16px 32px',
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

export default IntervalPanel;
