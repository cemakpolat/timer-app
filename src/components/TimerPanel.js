import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

/**
 * Single timer panel (HH:MM:SS input and display)
 * Handles input parsing, display, and basic controls
 */
const TimerPanel = ({
  time,
  isRunning,
  onStart,
  onPause,
  onReset,
  onInputChange,
  inputHours = '',
  inputMinutes = '',
  inputSeconds = '',
  theme,
  showWarning,
  showCritical
}) => {
  const [localHours, setLocalHours] = useState(inputHours);
  const [localMinutes, setLocalMinutes] = useState(inputMinutes);
  const [localSeconds, setLocalSeconds] = useState(inputSeconds);

  useEffect(() => {
    setLocalHours(inputHours);
    setLocalMinutes(inputMinutes);
    setLocalSeconds(inputSeconds);
  }, [inputHours, inputMinutes, inputSeconds]);

  const handleInputChange = (field, value) => {
    const updated = {
      hours: localHours,
      minutes: localMinutes,
      seconds: localSeconds
    };
    updated[field] = value;
    setLocalHours(updated.hours);
    setLocalMinutes(updated.minutes);
    setLocalSeconds(updated.seconds);
    if (onInputChange) {
      onInputChange(updated.hours, updated.minutes, updated.seconds);
    }
  };

  const formatDisplayTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
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
        {formatDisplayTime(time)}
      </div>

      {/* Input fields and Start button */}
      {!isRunning && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
          <input
            type="number"
            min="0"
            max="23"
            value={localHours}
            onChange={(e) => handleInputChange('hours', e.target.value)}
            placeholder="HH"
            style={{
              width: 60,
              padding: 8,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 8,
              color: theme.text,
              textAlign: 'center',
              fontSize: 16
            }}
          />
          <span style={{ fontSize: 20, color: theme.text }}>:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={localMinutes}
            onChange={(e) => handleInputChange('minutes', e.target.value)}
            placeholder="MM"
            style={{
              width: 60,
              padding: 8,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 8,
              color: theme.text,
              textAlign: 'center',
              fontSize: 16
            }}
          />
          <span style={{ fontSize: 20, color: theme.text }}>:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={localSeconds}
            onChange={(e) => handleInputChange('seconds', e.target.value)}
            placeholder="SS"
            style={{
              width: 60,
              padding: 8,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 8,
              color: theme.text,
              textAlign: 'center',
              fontSize: 16
            }}
          />
          <button
            onClick={onStart}
            style={{
              background: theme.accent,
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.text,
              fontSize: 16,
              fontWeight: 600,
              transition: 'all 0.3s',
              marginLeft: 8
            }}
          >
            <Play size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TimerPanel;
