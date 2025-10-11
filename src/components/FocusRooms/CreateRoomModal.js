import React, { useState } from 'react';
import { X, Users, Clock, Zap } from 'lucide-react';

/**
 * Modal for creating a new focus room
 */
const CreateRoomModal = ({ theme, onClose, onCreateRoom, savedTimers = [] }) => {
  const [roomName, setRoomName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [timerType, setTimerType] = useState('single'); // 'single' or 'composite'
  const [duration, setDuration] = useState(25);
  const [selectedComposite, setSelectedComposite] = useState(null);
  const [displayName, setDisplayName] = useState('');

  // Get composite timers (sequences)
  const compositeTimers = savedTimers.filter(t => t.group === 'Sequences');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    if (!displayName.trim()) {
      alert('Please enter your display name');
      return;
    }

    if (timerType === 'composite' && !selectedComposite) {
      alert('Please select a composite timer');
      return;
    }

    const roomData = {
      name: roomName.trim(),
      maxParticipants: parseInt(maxParticipants),
      creatorName: displayName.trim()
    };

    if (timerType === 'single') {
      roomData.duration = parseInt(duration) * 60; // Convert to seconds
      roomData.timerType = 'single';
    } else {
      roomData.timerType = 'composite';
      roomData.compositeTimer = selectedComposite;
      // Calculate total duration from steps
      const totalSeconds = selectedComposite.steps.reduce((sum, step) => {
        return sum + (step.unit === 'sec' ? step.duration : step.duration * 60);
      }, 0);
      roomData.duration = totalSeconds;
    }

    onCreateRoom(roomData);
    onClose();
  };

  const presetDurations = [
    { label: '5 min', value: 5, emoji: '☕' },
    { label: '15 min', value: 15, emoji: '⚡' },
    { label: '25 min', value: 25, emoji: '🍅' },
    { label: '45 min', value: 45, emoji: '📚' },
    { label: '60 min', value: 60, emoji: '🎯' }
  ];

  const presetParticipants = [
    { label: '2', value: 2 },
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        className="create-room-modal-content"
        style={{
          background: theme.card,
          borderRadius: 24,
          padding: 32,
          maxWidth: 500,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Create Focus Room</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Room Name */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>
              Room Name *
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., Deep Work Session, Study Together..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `2px solid ${roomName ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12,
                padding: 14,
                color: 'white',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>

          {/* Your Display Name */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>
              Your Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others will see you..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `2px solid ${displayName ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12,
                padding: 14,
                color: 'white',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Timer Type Selection */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} /> Timer Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => setTimerType('single')}
                style={{
                  background: timerType === 'single' ? theme.accent : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${timerType === 'single' ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12,
                  padding: 14,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Clock size={16} /> Single Timer
              </button>
              <button
                type="button"
                onClick={() => setTimerType('composite')}
                style={{
                  background: timerType === 'composite' ? theme.accent : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${timerType === 'composite' ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12,
                  padding: 14,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Zap size={16} /> Composite Timer
              </button>
            </div>
          </div>

          {/* Single Timer Duration */}
          {timerType === 'single' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> Session Duration
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
                {presetDurations.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setDuration(preset.value)}
                    style={{
                      background: duration === preset.value ? theme.accent : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${duration === preset.value ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 12,
                      padding: '10px 8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{preset.emoji}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Math.min(180, parseInt(e.target.value) || 1)))}
                min="1"
                max="180"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: 10,
                  color: 'white',
                  fontSize: 14,
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6, textAlign: 'center' }}>
                Custom duration (1-180 minutes)
              </div>
            </div>
          )}

          {/* Composite Timer Selection */}
          {timerType === 'composite' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={16} /> Select Composite Timer
              </label>
              {compositeTimers.length === 0 ? (
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 14
                }}>
                  No composite timers available. Create one in the Timer tab first.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {compositeTimers.map((timer) => {
                    const totalSeconds = timer.steps.reduce((sum, step) => {
                      return sum + (step.unit === 'sec' ? step.duration : step.duration * 60);
                    }, 0);
                    const totalMinutes = Math.floor(totalSeconds / 60);
                    const isSelected = selectedComposite?.name === timer.name;

                    return (
                      <button
                        key={timer.name}
                        type="button"
                        onClick={() => setSelectedComposite(timer)}
                        style={{
                          background: isSelected ? theme.accent : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${isSelected ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: 12,
                          padding: 14,
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: 14,
                          transition: 'all 0.2s',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{timer.name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                          {timer.steps.length} steps • {totalMinutes} min total
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Max Participants */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} /> Max Participants
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              {presetParticipants.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setMaxParticipants(preset.value)}
                  style={{
                    background: maxParticipants === preset.value ? theme.accent : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${maxParticipants === preset.value ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 12,
                    padding: 12,
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 15,
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Math.max(2, Math.min(50, parseInt(e.target.value) || 2)))}
              min="2"
              max="50"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: 10,
                color: 'white',
                fontSize: 14,
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6, textAlign: 'center' }}>
              Custom size (2-50 people)
            </div>
          </div>

          {/* Summary */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            border: `1px solid ${theme.accent}40`
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
              Room Summary:
            </div>
            <div style={{ fontSize: 14, color: 'white', lineHeight: 1.6 }}>
              <div><strong>{roomName || 'Unnamed Room'}</strong></div>
              <div>Host: {displayName || 'Anonymous'}</div>
              {timerType === 'single' ? (
                <div>Duration: {duration} minutes</div>
              ) : (
                <>
                  <div>Timer: {selectedComposite?.name || 'Not selected'}</div>
                  {selectedComposite && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      {selectedComposite.steps.length} steps • {Math.floor(selectedComposite.steps.reduce((sum, step) => {
                        return sum + (step.unit === 'sec' ? step.duration : step.duration * 60);
                      }, 0) / 60)} min total
                    </div>
                  )}
                </>
              )}
              <div>Capacity: Up to {maxParticipants} people</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 12,
                padding: 16,
                color: 'white',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                background: theme.accent,
                border: 'none',
                borderRadius: 12,
                padding: 16,
                color: 'white',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
                transition: 'all 0.2s',
                boxShadow: `0 4px 12px ${theme.accent}40`
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
