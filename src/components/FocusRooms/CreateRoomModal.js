import React, { useState } from 'react';
import { X, Users, Clock } from 'lucide-react';
// import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useTimers } from '../../hooks/useTimers';

// Utility function to get contrasting text color
const getContrastColor = (bgColor) => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  const [rs, gs, bs] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Get semi-transparent text color based on theme
const getTextOpacity = (theme, opacity = 0.7) => {
  const baseColor = theme.text;
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Helper component to render a timer button
 */
const TimerButton = ({ timer, isSelected, onSelect, theme }) => {
  const isComposite = timer.isSequence || timer.exercises || timer.group === 'Sequences';
  let displayDuration = `${timer.duration} ${timer.unit || 'min'}`;

  if (isComposite) {
    if (timer.steps) {
      const totalSec = timer.steps.reduce((sum, step) => {
        return sum + (step.unit === 'sec' ? step.duration : step.duration * 60);
      }, 0);
      displayDuration = `${Math.floor(totalSec / 60)}m`;
    } else if (timer.exercises) {
      const totalSec = timer.exercises.reduce((sum, ex) => {
        return sum + (ex.unit === 'sec' || ex.unit === 'seconds' ? ex.duration : ex.duration * 60);
      }, 0);
      displayDuration = `${Math.floor(totalSec / 60)}m`;
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        background: isSelected ? theme.accent : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isSelected ? theme.accent : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`}`,
        borderRadius: theme.borderRadius,
        padding: '8px 10px',
        color: isSelected ? getContrastColor(theme.accent) : theme.text,
        cursor: 'pointer',
        fontSize: 12,
        transition: 'all 0.2s',
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          {timer.emoji && <span>{timer.emoji} </span>}
          {timer.name}
        </div>
        <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.6) }}>
          {timer.group || timer.category || 'Other'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isComposite && (
          <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: theme.borderRadius, whiteSpace: 'nowrap' }}>
            Composite
          </span>
        )}
        {timer.exercises && (
          <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: theme.borderRadius, whiteSpace: 'nowrap' }}>
            Template
          </span>
        )}
        <span style={{ fontSize: 11, fontWeight: 600 }}>{displayDuration}</span>
      </div>
    </button>
  );
};

/**
 * Modal for creating a new focus room
 */
const CreateRoomModal = ({ theme, onClose, onCreateRoom, savedTimers = [], prefillTemplateId = null }) => {
  // Get unified timer list from timerService via useTimers hook
  // This includes both built-in templates and custom timers
  const { allTimers } = useTimers('workout');

  // Merge templates and custom timers for display, and include legacy `savedTimers` (backward-compat)
  const legacyTimers = Array.isArray(savedTimers)
    ? savedTimers.map((t) => ({
        ...t,
        id: t.id || `legacy-${(t.name || '').replace(/\s+/g, '-').toLowerCase()}`,
        metadata: {
          ...(t.metadata || {}),
          source: t.metadata?.source || 'legacy',
          isEditable: !!t.id && !!t.metadata?.isEditable,
          isTemplate: !!t.metadata?.isTemplate
        }
      }))
    : [];

  // Merge avoiding duplicates by id or name
  const merged = [
    ...allTimers,
    ...legacyTimers.filter((lt) => !allTimers.find(at => at.id === lt.id || (at.name && at.name === lt.name)))
  ];

  const combinedTimers = merged.length > 0 ? merged : (Array.isArray(savedTimers) ? savedTimers : []);
  const availableTimers = combinedTimers.filter(t => t !== null && t !== undefined);

  // Separate templates and custom timers for optgroup display (include legacy as custom)
  const templateTimers = availableTimers.filter(t => t.metadata?.source === 'template');
  const customTimersList = availableTimers.filter(t => t.metadata?.source === 'custom' || t.metadata?.source === 'legacy');

  const [roomName, setRoomName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [timerTab, setTimerTab] = useState(prefillTemplateId ? 'available' : 'new'); // 'new' or 'available'
  const [duration, setDuration] = useState(25);
  const [selectedTimer, setSelectedTimer] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [emptyRoomDelay, setEmptyRoomDelay] = useState(2); // minutes
  const [scheduleRoom, setScheduleRoom] = useState(false); // Phase 2a: enable scheduling
  const [scheduledDate, setScheduledDate] = useState(''); // Date in YYYY-MM-DD format
  const [scheduledTime, setScheduledTime] = useState(''); // Time in HH:mm format
  const [selectedTag, setSelectedTag] = useState('other'); // Tag for room categorization
  const [prefillTemplate, setPrefillTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false); // Prevent double submission

  /**
   * Generate a unique display name by combining user input with a generated suffix
   */
  const generateUniqueDisplayName = (userInput) => {
    if (!userInput || userInput.trim() === '') {
      // Generate a random name if no input
      const adjectives = ['Swift', 'Bright', 'Calm', 'Bold', 'Wise', 'Quick', 'Gentle', 'Sharp'];
      const nouns = ['Eagle', 'Wolf', 'Bear', 'Fox', 'Owl', 'Lion', 'Tiger', 'Hawk'];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const suffix = Math.random().toString(36).substring(2, 5);
      return `${adj}${noun}${suffix}`;
    }

    // Clean the user input
    const cleanInput = userInput.trim();
    
    // Generate a short unique suffix (3 characters)
    const suffix = Math.random().toString(36).substring(2, 5);
    
    // Combine user input with suffix
    return `${cleanInput}${suffix}`;
  };

  // Get all available timers (including composite timers)
  // const availableTimers = savedTimers.filter(t => t !== null && t !== undefined);

  // Available tags for rooms (with colors matching FocusRoomsPanel)
  const availableTags = [
    { value: 'work', label: 'Work', color: '#ef4444' },
    { value: 'study', label: 'Study', color: '#3b82f6' },
    { value: 'fitness', label: 'Fitness', color: '#10b981' },
    { value: 'meditation', label: 'Meditation', color: '#8b5cf6' },
    { value: 'creative', label: 'Creative', color: '#f59e0b' },
    { value: 'social', label: 'Social', color: '#ec4899' },
    { value: 'other', label: 'Other', color: '#6b7280' }
  ];

  // const { alert } = useModal();
  const { showToast } = useToast();

  // Load prefill template on mount or when prefillTemplateId changes
  React.useEffect(() => {
    if (prefillTemplateId && availableTimers.length > 0) {
      const template = availableTimers.find(t => t.id === prefillTemplateId);
      if (template) {
        setPrefillTemplate(template);
        setSelectedTimer(template);
        setTimerTab('available');
        setRoomName(`${template.emoji || ''} ${template.name} session`.trim());
      }
    }
  }, [prefillTemplateId, availableTimers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomName.trim()) {
      showToast('Please enter a room name', 'error', 4000);
      return;
    }

    if (!displayName.trim()) {
      // Generate a unique name if none provided
      const generatedName = generateUniqueDisplayName('');
      setDisplayName(generatedName);
    }

    if (timerTab === 'available' && !selectedTimer) {
      showToast('Please select a timer', 'error', 4000);
      return;
    }

    // Phase 2a: Validate scheduling inputs if enabled
    if (scheduleRoom) {
      if (!scheduledDate || !scheduledTime) {
        showToast('Please select both date and time for scheduling', 'error', 4000);
        return;
      }
      // Parse date and time into a timestamp
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (isNaN(scheduledDateTime.getTime())) {
        showToast('Invalid date or time', 'error', 4000);
        return;
      }
      if (scheduledDateTime.getTime() <= Date.now()) {
        showToast('Scheduled time must be in the future', 'error', 4000);
        return;
      }
    }

    const finalDisplayName = displayName.trim() || generateUniqueDisplayName('');
    if (!displayName.trim()) {
      setDisplayName(finalDisplayName);
    }
    
    const roomData = {
      name: roomName.trim(),
      maxParticipants: parseInt(maxParticipants),
      creatorName: finalDisplayName,
      tag: selectedTag // Add tag to room data
    };

    // emptyRoomDelay is in minutes; convert to seconds for the service
    if (emptyRoomDelay && !Number.isNaN(parseInt(emptyRoomDelay, 10))) {
      roomData.emptyRoomRemovalDelaySec = parseInt(emptyRoomDelay, 10) * 60;
    }

    // Phase 2a: Add scheduledFor if scheduling is enabled
    if (scheduleRoom && scheduledDate && scheduledTime) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      roomData.scheduledFor = scheduledDateTime.getTime();
    }

    if (timerTab === 'new') {
      roomData.duration = parseInt(duration) * 60; // Convert to seconds
      roomData.timerType = 'single';
    } else {
      // Using an available timer
      const isComposite = selectedTimer.isSequence || selectedTimer.exercises;
      roomData.timerType = isComposite ? 'composite' : 'single';
      if (selectedTimer.isSequence) {
        roomData.compositeTimer = selectedTimer;
        const totalSeconds = selectedTimer.steps.reduce((sum, step) => {
          return sum + (step.unit === 'sec' ? step.duration : step.duration * 60);
        }, 0);
        roomData.duration = totalSeconds;
      } else if (selectedTimer.exercises) {
        // Normalize exercises -> steps so room storage uses a consistent composite shape
        const steps = selectedTimer.exercises.map(ex => ({
          name: ex.name || 'Unnamed Exercise',
          duration: ex.duration || 60,
          unit: (ex.unit === 'seconds' || ex.unit === 'sec') ? 'sec' : (ex.unit || 'min'),
          type: ex.type || 'work',
          color: ex.color || '#3b82f6',
          accent: ex.accent || ex.color || '#3b82f6'
        }));
        roomData.compositeTimer = { ...selectedTimer, steps };
        roomData.timerType = 'composite';
        const totalSeconds = steps.reduce((sum, ex) => {
          return sum + (ex.unit === 'sec' ? ex.duration : ex.duration * 60);
        }, 0);
        roomData.duration = totalSeconds;
      } else {
        const timerDurationSec = selectedTimer.unit === 'sec' ? selectedTimer.duration : selectedTimer.duration * 60;
        roomData.duration = timerDurationSec;
      }
    }

    try {
      setIsCreating(true);
      await onCreateRoom(roomData);
      onClose();
    } catch (err) {
      // Show inline feedback if creation failed (e.g., duplicate name or permission error)
      const msg = err?.message || 'Failed to create room';
      showToast(msg, 'error', 5000);
    } finally {
      setIsCreating(false);
    }
  };

  // 3 presets + an editable custom slot (4 boxes total)
  const presetDurations = [
    { label: '5m', value: 5 },
    { label: '15m', value: 15 },
    { label: '25m', value: 25 }
  ];

  // 3 presets + editable last box
  const presetParticipants = [
    { label: '2', value: 2 },
    { label: '5', value: 5 },
    { label: '10', value: 10 }
  ];

  // In-modal custom editors (replace window.prompt)
  const [showDurationEditor, setShowDurationEditor] = useState(false);
  const [tempDuration, setTempDuration] = useState(duration);
  const [showParticipantsEditor, setShowParticipantsEditor] = useState(false);
  const [tempParticipants, setTempParticipants] = useState(maxParticipants);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px 16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="create-room-modal-content"
        style={{
          background: theme.card,
          position: 'relative',
          borderRadius: theme.borderRadius,
          padding: 15,
          maxWidth: 500,
          width: '100%',
          maxHeight: 'clamp(500px, 85vh, 92vh)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
          marginBottom: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Create Focus Room</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: getTextOpacity(theme, 0.6),
              cursor: 'pointer',
              padding: 8,
              borderRadius: theme.borderRadius,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          {/* Template Preview (if prefilled) */}
          {prefillTemplate && (
            <div style={{
              background: `rgba(${parseInt(theme.accent.slice(1,3),16)},${parseInt(theme.accent.slice(3,5),16)},${parseInt(theme.accent.slice(5,7),16)},0.1)`,
              border: `1px solid ${theme.accent}`,
              borderRadius: theme.borderRadius,
              padding: 12,
              marginBottom: 16,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start'
            }}>
              <div style={{ fontSize: 24 }}>{prefillTemplate.emoji || '⏱️'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
                  {prefillTemplate.name}
                </div>
                <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.7), marginBottom: 6 }}>
                  {prefillTemplate.description}
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: getTextOpacity(theme, 0.6) }}>
                  {prefillTemplate.duration && <span>⏱️ {Math.floor(prefillTemplate.duration / 60)}m</span>}
                  {prefillTemplate.difficulty && <span>📊 {prefillTemplate.difficulty}</span>}
                  {prefillTemplate.category && <span>🏷️ {prefillTemplate.category}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Scrollable content area */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 16 }}>
          {/* Room Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: getTextOpacity(theme, 0.9) }}>
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
                border: `2px solid ${roomName ? theme.accent : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`}`,
                borderRadius: theme.borderRadius,
                padding: 12,
                color: theme.text,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>

          {/* Your Display Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: getTextOpacity(theme, 0.9) }}>
              Your Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={(e) => {
                // Generate unique name when user finishes typing
                if (e.target.value.trim()) {
                  setDisplayName(generateUniqueDisplayName(e.target.value));
                }
              }}
              placeholder="Enter your name (we'll make it unique)..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `2px solid ${displayName ? theme.accent : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`}`,
                borderRadius: theme.borderRadius,
                padding: 12,
                color: theme.text,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.6), marginTop: 4 }}>
              A unique suffix will be added to ensure your name is unique
            </div>
          </div>

          {/* Room Tag */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: getTextOpacity(theme, 0.9), display: 'block' }}>
              Room Category
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {availableTags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => setSelectedTag(tag.value)}
                  style={{
                    background: selectedTag === tag.value ? tag.color + '20' : 'transparent',
                    border: `1px solid ${selectedTag === tag.value ? tag.color : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.08)`}`,
                    borderRadius: 9999,
                    padding: '6px 12px',
                    color: selectedTag === tag.value ? tag.color : theme.text,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    transition: 'all 0.15s'
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Selection Tabs */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: getTextOpacity(theme, 0.9), display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} /> Session Timer
            </label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
              <button
                type="button"
                onClick={() => setTimerTab('new')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: timerTab === 'new' ? `2px solid ${theme.accent}` : `2px solid transparent`,
                  padding: '6px 10px',
                  color: timerTab === 'new' ? theme.accent : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                New Timer
              </button>
              <button
                type="button"
                onClick={() => setTimerTab('available')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: timerTab === 'available' ? `2px solid ${theme.accent}` : `2px solid transparent`,
                  padding: '8px 12px',
                  color: timerTab === 'available' ? theme.accent : getTextOpacity(theme, 0.6),
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                Available Timers
              </button>
            </div>

            {/* New Timer Tab */}
            {timerTab === 'new' && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {presetDurations.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setDuration(preset.value)}
                        style={{
                          background: duration === preset.value ? theme.accent : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.06)`,
                          border: `1px solid ${duration === preset.value ? theme.accent : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.08)`}`,
                          borderRadius: theme.borderRadius,
                          padding: '10px 6px',
                          minHeight: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: duration === preset.value ? getContrastColor(theme.accent) : theme.text,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600,
                          transition: 'all 0.15s'
                        }}
                      >
                        <span>{preset.label}</span>
                      </button>
                    ))}
                    {/* Editable Custom Time Box (last) - opens in-modal editor */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => { setTempDuration(duration); setShowDurationEditor(true); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTempDuration(duration); setShowDurationEditor(true); } }}
                      style={{
                        background: !presetDurations.some(p => p.value === duration) ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${!presetDurations.some(p => p.value === duration) ? 'rgba(59,130,246,0.5)' : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`}`,
                        borderRadius: theme.borderRadius,
                        padding: '10px 6px',
                        minHeight: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{!presetDurations.some(p => p.value === duration) ? `${duration}m` : 'Custom'}</span>
                    </div>
                </div>
              </div>
            )}

            {/* Available Timers Tab */}
            {timerTab === 'available' && (
              <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {availableTimers.length === 0 ? (
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                    borderRadius: theme.borderRadius,
                    padding: 12,
                    textAlign: 'center',
                    color: getTextOpacity(theme, 0.6),
                    fontSize: 12
                  }}>
                    No timers available yet. Create timers in the Timer tab first.
                  </div>
                ) : (
                  <>
                    {/* Templates Group */}
                    {templateTimers.length > 0 && (
                      <div>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: getTextOpacity(theme, 0.5),
                          textTransform: 'uppercase',
                          padding: '8px 10px 4px 10px',
                          letterSpacing: 0.5
                        }}>
                          📋 Templates
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {templateTimers.map((timer, idx) => (
                            <TimerButton
                              key={idx}
                              timer={timer}
                              isSelected={selectedTimer?.id === timer.id}
                              onSelect={() => setSelectedTimer(timer)}
                              theme={theme}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Timers Group */}
                    {customTimersList.length > 0 && (
                      <div>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: getTextOpacity(theme, 0.5),
                          textTransform: 'uppercase',
                          padding: '8px 10px 4px 10px',
                          letterSpacing: 0.5,
                          marginTop: templateTimers.length > 0 ? 4 : 0
                        }}>
                          ⭐ My Timers
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {customTimersList.map((timer, idx) => (
                            <TimerButton
                              key={idx}
                              timer={timer}
                              isSelected={selectedTimer?.id === timer.id}
                              onSelect={() => setSelectedTimer(timer)}
                              theme={theme}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legacy Saved Timers (for backward compatibility) */}
                    {savedTimers.length > 0 && availableTimers.filter(t => !t.metadata?.source).length > 0 && (
                      <div>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: getTextOpacity(theme, 0.5),
                          textTransform: 'uppercase',
                          padding: '8px 10px 4px 10px',
                          letterSpacing: 0.5
                        }}>
                          📌 Other
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {availableTimers.filter(t => !t.metadata?.source).map((timer, idx) => (
                            <TimerButton
                              key={idx}
                              timer={timer}
                              isSelected={selectedTimer?.name === timer.name}
                              onSelect={() => setSelectedTimer(timer)}
                              theme={theme}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Max Participants */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: getTextOpacity(theme, 0.9), display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={14} /> Max Participants
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {presetParticipants.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setMaxParticipants(preset.value)}
                  style={{
                      background: maxParticipants === preset.value ? theme.accent : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${maxParticipants === preset.value ? theme.accent : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`}`,
                      borderRadius: theme.borderRadius,
                      padding: '10px 6px',
                      minHeight: 44,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: maxParticipants === preset.value ? getContrastColor(theme.accent) : theme.text,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                >
                  {preset.label}
                </button>
              ))}
              {/* Editable participants box (last) - opens in-modal editor */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => { setTempParticipants(maxParticipants); setShowParticipantsEditor(true); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTempParticipants(maxParticipants); setShowParticipantsEditor(true); } }}
                style={{
                  background: !presetParticipants.some(p => p.value === maxParticipants) ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${!presetParticipants.some(p => p.value === maxParticipants) ? 'rgba(59, 130, 246, 0.5)' : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`}`,
                  borderRadius: theme.borderRadius,
                  padding: '10px 6px',
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{!presetParticipants.some(p => p.value === maxParticipants) ? String(maxParticipants) : 'Custom'}</span>
              </div>
            </div>
          </div>

          {/* Phase 2a: Room Scheduling */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: getTextOpacity(theme, 0.9), display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} /> Schedule Room (Optional)
            </label>
            <button
              type="button"
              onClick={() => setScheduleRoom(!scheduleRoom)}
              style={{
                width: '100%',
                background: scheduleRoom ? theme.accent : 'rgba(255,255,255,0.05)',
                border: `2px solid ${scheduleRoom ? theme.accent : `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`}`,
                borderRadius: theme.borderRadius,
                padding: 14,
                color: theme.text,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s',
                marginBottom: 12
              }}
            >
              {scheduleRoom ? '📅 Room Scheduled' : '🔔 Schedule for Later'}
            </button>
            {scheduleRoom && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: getTextOpacity(theme, 0.6), marginBottom: 6, display: 'block' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                      borderRadius: theme.borderRadius,
                      padding: 10,
                      color: theme.text,
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: getTextOpacity(theme, 0.6), marginBottom: 6, display: 'block' }}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                      borderRadius: theme.borderRadius,
                      padding: 10,
                      color: theme.text,
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: getTextOpacity(theme, 0.9), display: 'flex', alignItems: 'center', gap: 6 }}>
              Empty-room removal delay (minutes)
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                value={emptyRoomDelay}
                onChange={(e) => setEmptyRoomDelay(Math.max(0, Math.min(1440, parseInt(e.target.value) || 0)))}
                min="0"
                max="1440"
                style={{
                  width: 120,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                  borderRadius: theme.borderRadius,
                  padding: 10,
                  color: theme.text,
                  fontSize: 14,
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.5) }}>Set to 0 to disable automatic empty-room removal.</div>
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: theme.borderRadius,
            padding: 16,
            marginBottom: 24,
            border: `1px solid ${theme.accent}40`
          }}>
            <div style={{ fontSize: 13, color: getTextOpacity(theme, 0.7), marginBottom: 8 }}>
              Room Summary:
            </div>
            <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
              <div><strong>{roomName || 'Unnamed Room'}</strong></div>
              <div>Host: {displayName || 'Anonymous'}</div>
              {timerTab === 'new' ? (
                <div>Duration: {duration} minutes</div>
              ) : selectedTimer ? (
                <>
                  <div>Timer: {selectedTimer.name}</div>
                  {selectedTimer.isSequence || selectedTimer.exercises || selectedTimer.group === 'Sequences' ? (
                    <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.7) }}>
                      {selectedTimer.isSequence ? `Composite • ${selectedTimer.steps?.length} steps` : `Routine • ${selectedTimer.exercises?.length} exercises`}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.7) }}>
                      {selectedTimer.duration} {selectedTimer.unit || 'min'}
                    </div>
                  )}
                </>
              ) : (
                <div>Timer: Not selected</div>
              )}
              <div>Capacity: Up to {maxParticipants} people</div>
              {scheduleRoom && scheduledDate && scheduledTime && (
                <div style={{ marginTop: 8, padding: 8, background: `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`, borderRadius: theme.borderRadius, fontSize: 13 }}>
                  📅 Scheduled: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Actions - Sticky at bottom */}
          <div style={{
            display: 'flex',
            gap: 12,
            paddingTop: 16,
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            background: theme.card,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginTop: 'auto'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`,
                border: 'none',
                borderRadius: theme.borderRadius,
                padding: 16,
                color: theme.text,
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.target.style.background = `rgba(${parseInt(theme.text.slice(1,3),16)},${parseInt(theme.text.slice(3,5),16)},${parseInt(theme.text.slice(5,7),16)},0.1)`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              style={{
                flex: 1,
                background: isCreating ? 'rgba(255,255,255,0.3)' : theme.accent,
                border: 'none',
                borderRadius: theme.borderRadius,
                padding: 16,
                color: isCreating ? 'rgba(255,255,255,0.5)' : getContrastColor(theme.accent),
                cursor: isCreating ? 'not-allowed' : 'pointer',
                fontSize: 15,
                fontWeight: 600,
                transition: 'all 0.2s',
                boxShadow: isCreating ? 'none' : `0 4px 12px ${theme.accent}40`
              }}
              onMouseEnter={(e) => !isCreating && (e.target.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => !isCreating && (e.target.style.transform = 'translateY(0)')}
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>

        {/* In-modal editors (rendered inside modal content) */}
        {showDurationEditor && (
          <div style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%, -50%)', zIndex: 1100, minWidth: 280 }}>
            <div style={{ background: theme.card, borderRadius: theme.borderRadius, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Custom Session Length</div>
              <div style={{ fontSize: 13, color: getTextOpacity(theme, 0.8), marginBottom: 8 }}>Enter duration in minutes (max 720)</div>
              <input
                type="number"
                value={tempDuration}
                onChange={(e) => setTempDuration(Math.max(1, Math.min(720, parseInt(e.target.value || 0))))}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowDurationEditor(false);
                  if (e.key === 'Enter') {
                    const val = parseInt(tempDuration, 10);
                    if (!Number.isNaN(val) && val > 0) setDuration(Math.min(720, val));
                    setShowDurationEditor(false);
                  }
                }}
                style={{ width: '100%', padding: 10, borderRadius: theme.borderRadius, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: theme.text, boxSizing: 'border-box', marginBottom: 12 }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowDurationEditor(false)} style={{ padding: '8px 12px', borderRadius: theme.borderRadius, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: theme.text }}>Cancel</button>
                <button type="button" onClick={() => { const val = parseInt(tempDuration, 10); if (!Number.isNaN(val) && val > 0) setDuration(Math.min(720, val)); setShowDurationEditor(false); }} style={{ padding: '8px 12px', borderRadius: theme.borderRadius, background: theme.accent, border: 'none', color: getContrastColor(theme.accent) }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {showParticipantsEditor && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 1100, minWidth: 280 }}>
            <div style={{ background: theme.card, borderRadius: theme.borderRadius, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Custom Max Participants</div>
              <div style={{ fontSize: 13, color: getTextOpacity(theme, 0.8), marginBottom: 8 }}>Enter a number between 2 and 100</div>
              <input
                type="number"
                value={tempParticipants}
                onChange={(e) => setTempParticipants(Math.max(2, Math.min(100, parseInt(e.target.value || 0))))}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowParticipantsEditor(false);
                  if (e.key === 'Enter') {
                    const val = parseInt(tempParticipants, 10);
                    if (!Number.isNaN(val) && val >= 2) setMaxParticipants(Math.min(100, val));
                    setShowParticipantsEditor(false);
                  }
                }}
                style={{ width: '100%', padding: 10, borderRadius: theme.borderRadius, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: theme.text, boxSizing: 'border-box', marginBottom: 12 }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowParticipantsEditor(false)} style={{ padding: '8px 12px', borderRadius: theme.borderRadius, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: theme.text }}>Cancel</button>
                <button type="button" onClick={() => { const val = parseInt(tempParticipants, 10); if (!Number.isNaN(val) && val >= 2) setMaxParticipants(Math.min(100, val)); setShowParticipantsEditor(false); }} style={{ padding: '8px 12px', borderRadius: theme.borderRadius, background: theme.accent, border: 'none', color: getContrastColor(theme.accent) }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoomModal;
