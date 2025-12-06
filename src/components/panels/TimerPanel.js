import React from 'react';
import { Play, Share } from 'lucide-react';

/**
 * TimerPanel Component
 * Handles single timer mode with HH:MM:SS input and quick presets
 */
const TimerPanel = ({
  theme,
  inputHours,
  inputMinutes,
  inputSeconds,
  setInputHours,
  setInputMinutes,
  setInputSeconds,
  startTimer,
  shareCurrentTimer
}) => {
  const handleStartTimer = () => {
    const h = parseInt(inputHours) || 0;
    const m = parseInt(inputMinutes) || 0;
    const s = parseInt(inputSeconds) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds > 0) startTimer(totalSeconds);
  };

  return (
    <div style={{ background: theme.card, borderRadius: 10, padding: 15, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Timer</h2>
        {(inputHours || inputMinutes || inputSeconds) && (
          <button 
            onClick={shareCurrentTimer} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: 8, 
              padding: '8px 12px', 
              color: theme.text, 
              cursor: 'pointer', 
              fontSize: 12, 
              display: 'flex', 
              gap: 6, 
              alignItems: 'center' 
            }}
          >
            <Share size={14} /> Share
          </button>
        )}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
        <span>
          <b>Timer</b>: A simple countdown for focused work, exercise, or any single activity. For multi-step routines, use the <b>Routines</b> tab.
        </span>
      </div>

      {/* HH:MM:SS Input Fields and Run Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
        className="flex-wrap-sm hh-mm-ss-input-group"
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="HH"
            value={inputHours}
            onChange={(e) => setInputHours(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              width: '60px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${theme.accent}`,
              borderRadius: 10,
              padding: '12px 6px',
              color: theme.text,
              fontSize: 16,
              fontWeight: 600
            }}
          />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }}>:</span>
          <input
            type="number"
            placeholder="MM"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            style={{
              width: '60px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${theme.accent}`,
              borderRadius: 10,
              padding: '12px 6px',
              color: theme.text,
              fontSize: 16,
              fontWeight: 600
            }}
          />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }}>:</span>
          <input
            type="number"
            placeholder="SS"
            value={inputSeconds}
            onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            style={{
              width: '60px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${theme.accent}`,
              borderRadius: 10,
              padding: '12px 6px',
              color: theme.text,
              fontSize: 16,
              fontWeight: 600
            }}
          />
        </div>
        <button
          onClick={handleStartTimer}
          data-testid="start-timer-button"
          style={{
            background: theme.accent,
            border: 'none',
            borderRadius: 10,
            padding: '12px 20px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '50px',
            flexShrink: 0
          }}
        >
          <Play size={18} />
        </button>
      </div>

      {/* Quick Presets */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
        Quick presets:
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
        {[
          { label: '10s', val: 10, unit: 'sec' }, 
          { label: '30s', val: 30, unit: 'sec' }, 
          { label: '1m', val: 1, unit: 'min' }, 
          { label: '5m', val: 5, unit: 'min' }
        ].map(p => (
          <button 
            key={p.label} 
            onClick={() => startTimer(p.val * (p.unit === 'min' ? 60 : 1))} 
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              borderRadius: 8, 
              padding: 12, 
              color: theme.text, 
              cursor: 'pointer', 
              fontSize: 14 
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[10, 15, 25, 45].map(m => (
          <button 
            key={m} 
            onClick={() => startTimer(m * 60)} 
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              borderRadius: 8, 
              padding: 12, 
              color: theme.text, 
              cursor: 'pointer', 
              fontSize: 14 
            }}
          >
            {m}m
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimerPanel;
