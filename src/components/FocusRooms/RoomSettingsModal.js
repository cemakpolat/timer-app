import React, { useState, useRef } from 'react';
import { useModal } from '../../context/ModalContext';
import { Play, Pause, X, Repeat2, Shuffle } from 'lucide-react';

const RoomSettingsModal = ({ theme, room, onClose, onSave, customMusicFiles = [], AMBIENT_SOUNDS = [] }) => {
  const initialMinutes = room && typeof room.emptyRoomRemovalDelaySec === 'number' ? Math.round(room.emptyRoomRemovalDelaySec / 60) : 2;
  const [emptyRoomDelay, setEmptyRoomDelay] = useState(initialMinutes);
  const [roomName, setRoomName] = useState(room?.name || '');
  const { alert } = useModal();
  
  // Music playback state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState(null);
  const [repeatMode, setRepeatMode] = useState('orderly'); // orderly, random, repeat-one
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const getTextOpacity = (opacity = 0.7) => {
    const baseColor = theme.text;
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const selectedMusic = customMusicFiles.find(f => f.id === selectedMusicId);
  
  // Combine custom music files and built-in ambient sounds
  const allAvailableMusic = [
    ...customMusicFiles.map(file => ({ ...file, type: 'custom' })),
    ...AMBIENT_SOUNDS.filter(sound => sound.name !== 'None').map(sound => ({ 
      id: `builtin_${sound.name}`, 
      name: sound.name, 
      file: sound.file,
      type: 'builtin'
    }))
  ];
  
  const firstAvailableMusic = allAvailableMusic.length > 0 ? allAvailableMusic[0] : null;

  const handlePlayClick = () => {
    if (!audioRef.current) return;

    const music = selectedMusic || firstAvailableMusic;
    if (!music) {
      alert('No music files available');
      return;
    }

    if (isPlaying && selectedMusicId === music.id) {
      // Already playing this track, pause it
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Play the selected (or first) track
      if (!selectedMusicId || selectedMusicId !== music.id) {
        setSelectedMusicId(music.id);
        // Handle both custom music (with url/blob) and built-in sounds (with file)
        const url = music.url || (music.blob ? URL.createObjectURL(music.blob) : music.file);
        audioRef.current.src = url;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStopClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleRepeatClick = () => {
    const modes = ['orderly', 'random', 'repeat-one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.currentTarget.duration);
  };

  const handleAudioEnd = () => {
    if (repeatMode === 'repeat-one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRepeatLabel = () => {
    switch (repeatMode) {
      case 'repeat-one': return '🔁 Repeat';
      case 'random': return '🔀 Random';
      case 'orderly': return '▶️ Orderly';
      default: return 'Repeat';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      await alert('Room name cannot be empty');
      return;
    }
    
    // Convert minutes to seconds; use null to remove the field (disable)
    const payload = { name: roomName.trim() };
    if (emptyRoomDelay && !Number.isNaN(parseInt(emptyRoomDelay, 10)) && parseInt(emptyRoomDelay, 10) > 0) {
      payload.emptyRoomRemovalDelaySec = parseInt(emptyRoomDelay, 10) * 60;
    } else {
      // explicitly remove the field by setting null
      payload.emptyRoomRemovalDelaySec = null;
    }

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      const msg = err?.message || 'Failed to save settings';
      // fallback: use modal alert to inform user
      await alert(msg);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
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
        style={{
          background: theme.card,
          borderRadius: theme.borderRadius,
          padding: 15,
          maxWidth: 480,
          width: '100%',
          maxHeight: 'clamp(400px, 85vh, 92vh)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
          marginBottom: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: 20 }}>Room Settings</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: theme.borderRadius,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: 'white',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
              placeholder="Enter room name"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Empty-room removal delay (minutes)</label>
            <input
              type="number"
              min="0"
              max="1440"
              value={emptyRoomDelay}
              onChange={(e) => setEmptyRoomDelay(Math.max(0, Math.min(1440, parseInt(e.target.value) || 0)))}
              style={{
                width: 120,
                padding: 10,
                borderRadius: theme.borderRadius,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: 'white'
              }}
            />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Set to 0 to disable automatic empty-room removal.</div>
          </div>

          {/* Music Playback Controls */}
          <div style={{ marginBottom: 16, borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>🎵 Session Music Control</label>
            
            {allAvailableMusic.length === 0 ? (
              <div style={{ fontSize: 12, color: getTextOpacity(0.6), padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: theme.borderRadius, textAlign: 'center' }}>
                No music available.<br/>
                Upload custom music files in Settings → Music or check if built-in sounds are configured.
              </div>
            ) : (
              <>
              {/* Music Selection */}
              <div style={{ marginBottom: 12 }}>
                <select
                  value={selectedMusicId || ''}
                  onChange={(e) => setSelectedMusicId(e.target.value || null)}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: theme.borderRadius,
                    border: `1px solid rgba(255,255,255,0.1)`,
                    background: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    marginBottom: 8
                  }}
                >
                  <option value="">
                    {firstAvailableMusic ? `Default: ${firstAvailableMusic.name}` : 'Select music...'}
                  </option>
                  {customMusicFiles.length > 0 && (
                    <optgroup label="🎵 Your Music">
                      {customMusicFiles.map(music => (
                        <option key={music.id} value={music.id}>
                          {music.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {AMBIENT_SOUNDS.filter(sound => sound.name !== 'None').length > 0 && (
                    <optgroup label="🎼 Built-in Sounds">
                      {AMBIENT_SOUNDS.filter(sound => sound.name !== 'None').map(sound => (
                        <option key={`builtin_${sound.name}`} value={`builtin_${sound.name}`}>
                          {sound.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                
                {/* Progress Bar */}
                {isPlaying && duration > 0 && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: getTextOpacity(0.6), minWidth: 30 }}>
                      {formatTime(currentTime)}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => {
                        const newTime = parseFloat(e.target.value);
                        if (audioRef.current) {
                          audioRef.current.currentTime = newTime;
                          setCurrentTime(newTime);
                        }
                      }}
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                        height: 4,
                        borderRadius: 2,
                        background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${(currentTime/duration)*100}%, rgba(255,255,255,0.1) ${(currentTime/duration)*100}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                    <div style={{ fontSize: 11, color: getTextOpacity(0.6), minWidth: 30, textAlign: 'right' }}>
                      {formatTime(duration)}
                    </div>
                  </div>
                )}
              </div>

              {/* Playback Controls */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handlePlayClick}
                  disabled={allAvailableMusic.length === 0}
                  title={isPlaying ? 'Pause' : 'Play'}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: 10,
                    borderRadius: theme.borderRadius,
                    border: 'none',
                    background: isPlaying ? theme.accent : 'rgba(255,255,255,0.08)',
                    color: isPlaying ? '#ffffff' : theme.text,
                    cursor: allAvailableMusic.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    opacity: allAvailableMusic.length === 0 ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>

                <button
                  type="button"
                  onClick={handleStopClick}
                  disabled={!isPlaying}
                  title="Stop music completely"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: 10,
                    borderRadius: theme.borderRadius,
                    border: 'none',
                    background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: isPlaying ? '#ef4444' : getTextOpacity(0.5),
                    cursor: isPlaying ? 'pointer' : 'not-allowed',
                    fontSize: 13,
                    fontWeight: 600,
                    opacity: isPlaying ? 1 : 0.5,
                    transition: 'all 0.2s'
                  }}
                >
                  <X size={16} />
                  Stop
                </button>

                <button
                  type="button"
                  onClick={handleRepeatClick}
                  disabled={allAvailableMusic.length === 0}
                  title={`Repeat mode: ${repeatMode}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: 10,
                    borderRadius: theme.borderRadius,
                    border: 'none',
                    background: repeatMode !== 'orderly' ? `${theme.accent}30` : 'rgba(255,255,255,0.05)',
                    color: repeatMode !== 'orderly' ? theme.accent : getTextOpacity(0.7),
                    cursor: allAvailableMusic.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    opacity: allAvailableMusic.length === 0 ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {repeatMode === 'random' ? <Shuffle size={16} /> : <Repeat2 size={16} />}
                  {getRepeatLabel()}
                </button>
              </div>

              <div style={{ fontSize: 11, color: getTextOpacity(0.5), marginTop: 8 }}>
                {repeatMode === 'repeat-one' && '🔁 Repeat: Play same song again'}
                {repeatMode === 'random' && '🔀 Random: Play songs in random order'}
                {repeatMode === 'orderly' && '▶️ Orderly: Play songs one after another'}
              </div>
              </>
            )}
          </div>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleAudioEnd}
            style={{ display: 'none' }}
          />

          <div style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            paddingTop: 16,
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            background: theme.card,
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 14px', borderRadius: theme.borderRadius, background: 'rgba(255,255,255,0.06)', color: 'white', border: 'none' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 14px', borderRadius: theme.borderRadius, background: theme.accent, color: 'white', border: 'none' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomSettingsModal;
