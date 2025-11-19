import React from 'react';
import { Share, Zap } from 'lucide-react';

/**
 * IntervalPanel Component
 * Handles Pomodoro/interval timer with work/rest cycles
 */
const IntervalPanel = ({
  theme,
  work,
  rest,
  rounds,
  setWork,
  setRest,
  setRounds,
  startInterval,
  shareCurrentTimer
}) => {
  const inputStyle = (accentColor) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: 8,
    padding: 12,
    color: theme.text,
    fontSize: 14
  });

  return (
    <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Interval Timer</h2>
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
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 12, 
          marginBottom: 16 
        }} 
        className="grid-col-sm-3-to-1"
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>
            Work (sec)
          </label>
          <input 
            type="number" 
            value={work} 
            onChange={(e) => setWork(Math.max(0, parseInt(e.target.value) || 0))} 
            style={inputStyle(theme.accent)} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>
            Rest (sec)
          </label>
          <input 
            type="number" 
            value={rest} 
            onChange={(e) => setRest(Math.max(0, parseInt(e.target.value) || 0))} 
            style={inputStyle(theme.accent)} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>
            Rounds
          </label>
          <input 
            type="number" 
            value={rounds} 
            onChange={(e) => setRounds(Math.max(0, parseInt(e.target.value) || 0))} 
            style={inputStyle(theme.accent)} 
          />
        </div>
      </div>

      <button 
        onClick={startInterval} 
        style={{ 
          width: '100%', 
          background: theme.accent, 
          border: 'none', 
          borderRadius: 12, 
          padding: 16, 
          color: 'white', 
          cursor: 'pointer', 
          fontSize: 16, 
          fontWeight: 600, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 8 
        }}
      >
        <Zap size={20} />Start Interval
      </button>
    </div>
  );
};

export default IntervalPanel;
