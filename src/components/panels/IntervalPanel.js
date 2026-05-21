import React, { useEffect, useState } from 'react';
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
  const [workInput, setWorkInput] = useState(String(work ?? ''));
  const [restInput, setRestInput] = useState(String(rest ?? ''));
  const [roundsInput, setRoundsInput] = useState(String(rounds ?? ''));

  useEffect(() => {
    setWorkInput(String(work ?? ''));
  }, [work]);

  useEffect(() => {
    setRestInput(String(rest ?? ''));
  }, [rest]);

  useEffect(() => {
    setRoundsInput(String(rounds ?? ''));
  }, [rounds]);

  const applyNumber = (raw, setter, fallback = 0) => {
    const parsed = parseInt(raw, 10);
    setter(Number.isNaN(parsed) ? fallback : Math.max(0, parsed));
  };

  const inputStyle = (accentColor) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: theme.borderRadius,
    padding: 15,
    color: theme.text,
    fontSize: 14
  });

  return (
    <div style={{ background: theme.card, borderRadius: theme.borderRadius, padding: 15, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Interval Timer</h2>
        <button 
          onClick={shareCurrentTimer} 
          style={{ 
            background: `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`, 
            border: 'none', 
            borderRadius: theme.borderRadius, 
            padding: '10px 15px', 
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
            value={workInput}
            onChange={(e) => {
              const raw = e.target.value;
              setWorkInput(raw);
              if (raw !== '') applyNumber(raw, setWork);
            }}
            onBlur={() => {
              if (workInput === '') {
                setWorkInput('0');
                setWork(0);
                return;
              }
              applyNumber(workInput, setWork);
            }}
            style={inputStyle(theme.accent)} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>
            Rest (sec)
          </label>
          <input 
            type="number" 
            value={restInput}
            onChange={(e) => {
              const raw = e.target.value;
              setRestInput(raw);
              if (raw !== '') applyNumber(raw, setRest);
            }}
            onBlur={() => {
              if (restInput === '') {
                setRestInput('0');
                setRest(0);
                return;
              }
              applyNumber(restInput, setRest);
            }}
            style={inputStyle(theme.accent)} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>
            Rounds
          </label>
          <input 
            type="number" 
            value={roundsInput}
            onChange={(e) => {
              const raw = e.target.value;
              setRoundsInput(raw);
              if (raw !== '') applyNumber(raw, setRounds);
            }}
            onBlur={() => {
              if (roundsInput === '') {
                setRoundsInput('0');
                setRounds(0);
                return;
              }
              applyNumber(roundsInput, setRounds);
            }}
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
          borderRadius: theme.borderRadius, 
          padding: 15, 
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
