import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useModal } from '../context/ModalContext';
import { Info, Award, Lightbulb, Settings, Globe, Palette, Volume2, VolumeX, Trash, ChevronLeft, Edit, Trash2, Plus, Cloud, Download, Upload, Check, Pencil, Image as ImageIcon, Eye, EyeOff, Maximize, Minimize, Clock, Play, Pause, X, Repeat2, Shuffle, Bell, BellOff, BellRing, SkipBack, SkipForward } from 'lucide-react';
import BackgroundImagesPanel from './panels/BackgroundImagesPanel';
import DataBackupPanel from './panels/DataBackupPanel';
import TimerVisualizationSelector from './TimerVisualizationSelector';

const Header = ({
  theme,
  themeOpacity,
  setThemeOpacity,
  onShowInfo,
  onShowAchievements,
  onShowFeedback,
  onShowSettings,
  onShowWorldClocks,
  showSettings,
  setShowSettings,
  settingsView,
  setSettingsView,
  cleanMode,
  toggleCleanMode,
  themes,
  setTheme,
  setEditingTheme,
  setShowColorPicker,
  alarmVolume,
  setAlarmVolume,
  getTextOpacity,
  weatherEffect,
  setWeatherEffect,
  SCENES,
  AMBIENT_SOUNDS,
  ambientSound,
  setAmbientSound,
  setEditingWeather,
  customMusicFiles,
  uploadCustomMusic,
  deleteCustomMusic,
  getCustomMusicUrl,
  ensureCustomMusicUrl,
  getSoundFile,
  renameCustomMusic,
  startAmbient,
  stopAmbient,
  ambientAudioRef,
  // Background images
  selectedBackgroundId,
  setSelectedBackgroundId,
  getAllBackgroundImages,
  getBackgroundImageUrl,
  uploadBackgroundImage,
  deleteBackgroundImage,
  remoteBackgroundImageSources,
  remoteBackgroundImageSourceStatuses,
  addRemoteBackgroundImageSource,
  deleteRemoteBackgroundImageSource,
  refreshRemoteBackgroundImages,
  // Slide sets
  slideSets,
  activeSlideSetId,
  createSlideSet,
  deleteSlideSet,
  renameSlideSet,
  setSlideInterval,
  setSlideTransition,
  addImageToSet,
  addVideoToSet,
  removeImageFromSet,
  removeMediaItemFromSet,
  setActiveSlideSetId,
  // Video background
  selectedVideoId,
  setSelectedVideoId,
  getAllBackgroundVideos,
  getBackgroundVideoUrl,
  uploadBackgroundVideo,
  deleteBackgroundVideo,
  remoteBackgroundVideoSources,
  remoteBackgroundVideoSourceStatuses,
  addRemoteBackgroundVideoSource,
  deleteRemoteBackgroundVideoSource,
  refreshRemoteBackgroundVideos,
  // Break reminders
  breakReminderSettings,
  updateBreakReminderSettings,
  toggleBreakReminders,
  toggleBreakReminder,
  setBreakReminderInterval,
  notificationsGranted,
  requestNotificationPermission,
  BREAK_REMINDERS,
  // Timer visualization
  timerVisualization,
  setTimerVisualization,
  // Border radius
  customBorderRadius,
  setCustomBorderRadius

}) => {
  const settingsPanelRef = useRef(null);
  const soundListRef = useRef(null);
  const selectedSoundButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(event.target)) {
        setShowSettings(false);
        setSettingsView('main');
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings, setShowSettings, setSettingsView]);

  // Scroll selected sound into view
  useEffect(() => {
    if (selectedSoundButtonRef.current && soundListRef.current) {
      selectedSoundButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [ambientSound]);

  const modal = useModal();
  const [selectedMusicId, setSelectedMusicId] = useState(null);
  const [showOpacityModal, setShowOpacityModal] = useState(false);
  const [showBorderRadiusModal, setShowBorderRadiusModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [isHeaderMusicPlaying, setIsHeaderMusicPlaying] = useState(false);
  const [headerMusicRepeatMode, setHeaderMusicRepeatMode] = useState('sequential'); // sequential, random, repeat-one
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [savedPlaybackPositions, setSavedPlaybackPositions] = useState({}); // Track playback position for each song
  const audioRef = useRef(null);
  const currentPlayingIdRef = useRef(null); // Track currently playing ID for auto-advance
  const playbackCheckIntervalRef = useRef(null); // Timer for checking playback end
  const musicUpdateIntervalRef = useRef(null); // Timer for updating music progress

  const truncate = (s, n = 28) => {
    if (!s) return '';
    return s.length > n ? `${s.slice(0, n - 1)}…` : s;
  };

  // Handle song end - auto-advance based on repeat mode
  const handleSongEnd = useCallback(async () => {
    console.log('[DEBUG SONG END] Mode:', headerMusicRepeatMode, 'currentId:', currentPlayingIdRef.current, 'ambientSound:', ambientSound);
    console.log('[DEBUG] customFiles:', customMusicFiles.map(f => f.id), 'AMBIENT_SOUNDS:', AMBIENT_SOUNDS.map(s => s.name));
    
    if (headerMusicRepeatMode === 'repeat-one') {
      console.log('[DEBUG] Repeat-one mode, restarting current sound');
      // For repeat-one, just restart whatever is currently playing
      if (audioRef.current && ambientSound && ambientSound.startsWith('custom_')) {
        // Custom file repeat
        audioRef.current.currentTime = 0;
        await audioRef.current.play().catch(e => console.error('Repeat play error:', e));
      } else if (ambientSound && !ambientSound.startsWith('custom_') && ambientSound !== 'None') {
        // Built-in sound repeat - restart via ambient system
        stopAmbient();
        startAmbient(getSoundFile(ambientSound));
      }
      return;
    }

    // Determine if playing custom or built-in sound
    const isPlayingCustom = ambientSound && ambientSound.startsWith('custom_');
    let soundList = [];
    let currentSoundName = '';

    if (isPlayingCustom) {
      // Custom music files list
      soundList = customMusicFiles.map(f => f.id);
      currentSoundName = currentPlayingIdRef.current;
    } else {
      // Built-in ambient sounds list
      soundList = AMBIENT_SOUNDS.filter(s => s.name !== 'None').map(s => s.name);
      currentSoundName = ambientSound && ambientSound !== 'None' ? ambientSound : soundList[0];
    }

    console.log('[DEBUG] Sound list:', soundList, 'current:', currentSoundName);

    if (soundList.length === 0) {
      console.log('[DEBUG] No sounds available, stopping');
      setIsHeaderMusicPlaying(false);
      return;
    }

    let nextId = null;
    
    if (headerMusicRepeatMode === 'random') {
      // Random: pick any random sound
      const randomIndex = Math.floor(Math.random() * soundList.length);
      nextId = soundList[randomIndex];
      console.log('[DEBUG] Random mode, picked index:', randomIndex, 'id:', nextId);
    } else {
      // Sequential: play next sound in order (default mode)
      const currentIndex = soundList.findIndex(s => s === currentSoundName);
      console.log('[DEBUG] Sequential mode, currentIndex:', currentIndex, 'total:', soundList.length);
      if (currentIndex >= 0 && currentIndex < soundList.length - 1) {
        nextId = soundList[currentIndex + 1];
        console.log('[DEBUG] Playing next sound at index', currentIndex + 1);
      } else {
        // Loop back to first sound
        nextId = soundList[0];
        console.log('[DEBUG] Looping back to first sound');
      }
    }

    if (nextId) {
      console.log('[DEBUG] Auto-advancing to sound:', nextId);
      
      if (isPlayingCustom) {
        // Play next custom file
        const url = await ensureCustomMusicUrl(nextId) || getCustomMusicUrl(nextId);
        console.log('[DEBUG] Got URL for next custom file:', url);
        if (url && audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.currentTime = 0;
          console.log('[DEBUG] Playing next custom file');
          await audioRef.current.play().catch(e => console.error('Auto-advance play error:', e));
          currentPlayingIdRef.current = nextId;
          setSelectedMusicId(nextId);
          setAmbientSound(`custom_${nextId}`);
          startAmbient(getSoundFile(`custom_${nextId}`));
        }
      } else {
        // Play next built-in sound
        console.log('[DEBUG] Playing next built-in sound:', nextId);
        const soundFile = getSoundFile(nextId);
        console.log('[DEBUG] getSoundFile result:', soundFile);
        stopAmbient();
        setAmbientSound(nextId);
        if (soundFile) {
          startAmbient(soundFile);
        } else {
          console.error('[ERROR] getSoundFile returned null/undefined for:', nextId);
        }
      }
    } else {
      console.log('[DEBUG] No next sound found, stopping');
      setIsHeaderMusicPlaying(false);
    }
  }, [headerMusicRepeatMode, customMusicFiles, AMBIENT_SOUNDS, ambientSound, ensureCustomMusicUrl, getCustomMusicUrl, setAmbientSound, startAmbient, getSoundFile, stopAmbient]);

  // Attach onEnded handler to ambientAudioRef for built-in sounds
  useEffect(() => {
    const audioElement = ambientAudioRef?.current;
    if (audioElement) {
      audioElement.onended = handleSongEnd;
      console.log('[SETUP] Attached onended handler to ambientAudioRef');
      return () => {
        if (audioElement) {
          audioElement.onended = null;
        }
      };
    }
  }, [handleSongEnd, ambientAudioRef]);

  // Update music progress for both custom and built-in sounds
  useEffect(() => {
    if (!isHeaderMusicPlaying) {
      if (musicUpdateIntervalRef.current) {
        clearInterval(musicUpdateIntervalRef.current);
        musicUpdateIntervalRef.current = null;
      }
      return;
    }

    musicUpdateIntervalRef.current = setInterval(() => {
      // Check custom music on audioRef
      if (audioRef.current && audioRef.current.src) {
        setMusicCurrentTime(audioRef.current.currentTime);
        setMusicDuration(audioRef.current.duration || 0);
      }
      // Check built-in sounds on ambientAudioRef
      else if (ambientAudioRef?.current && ambientAudioRef.current.src) {
        setMusicCurrentTime(ambientAudioRef.current.currentTime);
        setMusicDuration(ambientAudioRef.current.duration || 0);
      }
    }, 500); // Update every 500ms

    return () => {
      if (musicUpdateIntervalRef.current) {
        clearInterval(musicUpdateIntervalRef.current);
        musicUpdateIntervalRef.current = null;
      }
    };
  }, [isHeaderMusicPlaying, ambientAudioRef]);

  // Monitor playback and trigger auto-advance when song ends
  useEffect(() => {
    if (!isHeaderMusicPlaying) {
      if (playbackCheckIntervalRef.current) {
        clearInterval(playbackCheckIntervalRef.current);
        playbackCheckIntervalRef.current = null;
      }
      return;
    }

    console.log('[INIT] Starting playback monitor');
    playbackCheckIntervalRef.current = setInterval(() => {
      // Check custom music on audioRef
      if (audioRef.current && audioRef.current.src) {
        const audio = audioRef.current;
        const isEnded = audio.ended;
        const duration = audio.duration;
        const currentTime = audio.currentTime;
        
        if (isEnded || (duration > 0 && currentTime >= duration - 0.5)) {
          console.log('[MONITOR CUSTOM] Song ended detected. Duration:', duration, 'CurrentTime:', currentTime);
          handleSongEnd();
          return;
        }
      }
      
      // Check built-in sounds on ambientAudioRef
      if (ambientAudioRef?.current && ambientAudioRef.current.src) {
        const audio = ambientAudioRef.current;
        const isEnded = audio.ended;
        const duration = audio.duration;
        const currentTime = audio.currentTime;
        
        if (isEnded || (duration > 0 && currentTime >= duration - 0.5)) {
          console.log('[MONITOR AMBIENT] Song ended detected. Duration:', duration, 'CurrentTime:', currentTime);
          handleSongEnd();
          return;
        }
      }
    }, 1000); // Check every 1 second

    return () => {
      if (playbackCheckIntervalRef.current) {
        clearInterval(playbackCheckIntervalRef.current);
        playbackCheckIntervalRef.current = null;
      }
    };
  }, [isHeaderMusicPlaying, handleSongEnd, ambientAudioRef]);

  // Dispatch music state to footer via custom event whenever state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('music-player-state', {
      detail: { isPlaying: isHeaderMusicPlaying, repeatMode: headerMusicRepeatMode }
    }));
  }, [isHeaderMusicPlaying, headerMusicRepeatMode]);

  const stripExtension = (name) => {
    if (!name) return '';
    const idx = name.lastIndexOf('.');
    return idx > 0 ? name.slice(0, idx) : name;
  };

  // Get list of available sounds based on current type (custom or built-in)
  const getSoundList = useCallback(() => {
    const isPlayingCustom = ambientSound && ambientSound.startsWith('custom_');
    let soundList = [];

    if (isPlayingCustom) {
      soundList = customMusicFiles.map(f => f.id);
    } else {
      soundList = AMBIENT_SOUNDS.filter(s => s.name !== 'None').map(s => s.name);
    }

    return soundList;
  }, [ambientSound, customMusicFiles, AMBIENT_SOUNDS]);

  // Skip to next song in current playlist
  const skipToNextSong = useCallback(async () => {
    const soundList = getSoundList();
    if (soundList.length === 0) {
      console.log('[SKIP] No sounds available');
      return;
    }

    const isPlayingCustom = ambientSound && ambientSound.startsWith('custom_');
    const currentSoundName = isPlayingCustom ? ambientSound.replace('custom_', '') : ambientSound;
    const currentIndex = soundList.findIndex(s => s === currentSoundName);
    const nextIndex = currentIndex >= 0 && currentIndex < soundList.length - 1 ? currentIndex + 1 : 0;
    const nextId = soundList[nextIndex];

    console.log('[SKIP NEXT] currentIndex:', currentIndex, 'nextIndex:', nextIndex, 'nextId:', nextId);

    if (isPlayingCustom) {
      // Custom file skip
      const url = await ensureCustomMusicUrl(nextId) || getCustomMusicUrl(nextId);
      if (url && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.currentTime = savedPlaybackPositions[nextId] || 0;
        await audioRef.current.play().catch(e => console.error('Play error:', e));
        currentPlayingIdRef.current = nextId;
        setSelectedMusicId(nextId);
        setAmbientSound(`custom_${nextId}`);
        setIsHeaderMusicPlaying(true);
      }
    } else {
      // Built-in sound skip
      const soundFile = getSoundFile(nextId);
      if (soundFile && ambientAudioRef?.current) {
        stopAmbient();
        setAmbientSound(nextId);
        startAmbient(soundFile);
        setIsHeaderMusicPlaying(true);
      }
    }
  }, [ambientSound, ambientAudioRef, ensureCustomMusicUrl, getCustomMusicUrl, getSoundFile, getSoundList, startAmbient, stopAmbient, savedPlaybackPositions, setAmbientSound]);

  // Skip to previous song in current playlist
  const skipToPreviousSong = useCallback(async () => {
    const soundList = getSoundList();
    if (soundList.length === 0) {
      console.log('[SKIP] No sounds available');
      return;
    }

    const isPlayingCustom = ambientSound && ambientSound.startsWith('custom_');
    const currentSoundName = isPlayingCustom ? ambientSound.replace('custom_', '') : ambientSound;
    const currentIndex = soundList.findIndex(s => s === currentSoundName);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : soundList.length - 1;
    const prevId = soundList[prevIndex];

    console.log('[SKIP PREV] currentIndex:', currentIndex, 'prevIndex:', prevIndex, 'prevId:', prevId);

    if (isPlayingCustom) {
      // Custom file skip
      const url = await ensureCustomMusicUrl(prevId) || getCustomMusicUrl(prevId);
      if (url && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.currentTime = savedPlaybackPositions[prevId] || 0;
        await audioRef.current.play().catch(e => console.error('Play error:', e));
        currentPlayingIdRef.current = prevId;
        setSelectedMusicId(prevId);
        setAmbientSound(`custom_${prevId}`);
        setIsHeaderMusicPlaying(true);
      }
    } else {
      // Built-in sound skip
      const soundFile = getSoundFile(prevId);
      if (soundFile && ambientAudioRef?.current) {
        stopAmbient();
        setAmbientSound(prevId);
        startAmbient(soundFile);
        setIsHeaderMusicPlaying(true);
      }
    }
  }, [ambientSound, ambientAudioRef, ensureCustomMusicUrl, getCustomMusicUrl, getSoundFile, getSoundList, startAmbient, stopAmbient, savedPlaybackPositions, setAmbientSound]);

  // Register global music player controls so MusicPlayerFooter can call them
  useEffect(() => {
    const playPause = async () => {
      const active = ambientSound;
      if (isHeaderMusicPlaying) {
        if (audioRef.current) {
          const id = currentPlayingIdRef.current;
          if (id) {
            setSavedPlaybackPositions(prev => ({
              ...prev,
              [id]: audioRef.current.currentTime
            }));
          }
          audioRef.current.pause();
        }
        if (ambientAudioRef?.current) {
          ambientAudioRef.current.pause();
        }
        setIsHeaderMusicPlaying(false);
        return;
      }
      if (!active || active === 'None') return;
      if (active.startsWith('custom_')) {
        const id = active.replace('custom_', '');
        const url = await ensureCustomMusicUrl(id) || getCustomMusicUrl(id);
        if (url && audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.currentTime = savedPlaybackPositions[id] || 0;
          await audioRef.current.play().catch(e => console.error('Play error:', e));
          currentPlayingIdRef.current = id;
          setSelectedMusicId(id);
          startAmbient(getSoundFile(`custom_${id}`));
          setIsHeaderMusicPlaying(true);
        }
        return;
      }
      const soundFile = getSoundFile(active);
      if (soundFile && ambientAudioRef?.current) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        startAmbient(soundFile);
        setIsHeaderMusicPlaying(true);
      }
    };

    const stop = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsHeaderMusicPlaying(false);
      }
      setAmbientSound('None');
      stopAmbient();
    };

    window.__musicPlayerControls = {
      playPause,
      stop,
      skipNext: skipToNextSong,
      skipPrev: skipToPreviousSong,
      setRepeatMode: setHeaderMusicRepeatMode
    };

    return () => {
      window.__musicPlayerControls = null;
    };
  }, [
    ambientSound, isHeaderMusicPlaying, savedPlaybackPositions,
    audioRef, ambientAudioRef, currentPlayingIdRef,
    ensureCustomMusicUrl, getCustomMusicUrl, getSoundFile, startAmbient, stopAmbient,
    setAmbientSound, setSavedPlaybackPositions, setSelectedMusicId, setIsHeaderMusicPlaying,
    setHeaderMusicRepeatMode, skipToNextSong, skipToPreviousSong
  ]);

  const onGlobalDelete = async (fileId) => {
    const id = fileId || selectedMusicId;
    if (!id) {
      modal.alert('Please select a custom music file first.', 'No Selection');
      return;
    }
    const file = customMusicFiles.find(f => f.id === id);
    if (!file) {
      modal.alert('Selected file not found.', 'Error');
      return;
    }
    const ok = await modal.confirm(`Delete "${file.name}"? This will remove it from your browser.`, 'Delete File');
    if (ok) {
      deleteCustomMusic(id);
      if (ambientSound === `custom_${id}`) setAmbientSound('None');
      if (selectedMusicId === id) setSelectedMusicId(null);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: '✅ File deleted', type: 'success', ttl: 2000 } }));
    }
  };

  const onGlobalRename = async () => {
    if (!selectedMusicId) {
      modal.alert('Please select a custom music file first.', 'No Selection');
      return;
    }
    const file = customMusicFiles.find(f => f.id === selectedMusicId);
    if (!file) return modal.alert('Selected file not found.', 'Error');
    const newName = await modal.prompt('Enter new name (without extension):', stripExtension(file.name), 'Rename File');
    if (!newName) return; // cancelled
    const clean = newName.trim();
    if (!clean) return modal.alert('Name cannot be empty.', 'Invalid Name');
    if (customMusicFiles.some(f => f.name.toLowerCase() === clean.toLowerCase() && f.id !== selectedMusicId)) {
      return modal.alert('A file with this name already exists.', 'Duplicate Name');
    }
    // preserve extension
    const displayWithExt = clean + (file.ext || '');
    renameCustomMusic(selectedMusicId, displayWithExt);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: '✅ File renamed', type: 'success', ttl: 2000 } }));
  };

  const onGlobalDownload = async () => {
    if (!selectedMusicId) {
      modal.alert('Please select a custom music file first.', 'No Selection');
      return;
    }
    const file = customMusicFiles.find(f => f.id === selectedMusicId);
    if (!file) return modal.alert('Selected file not found.', 'Error');
    const url = (typeof getCustomMusicUrl === 'function') ? getCustomMusicUrl(selectedMusicId) : null;
    if (!url) return modal.alert('File not available for download yet.', 'Unavailable');
    try {
      const a = document.createElement('a');
      a.href = url;
      const base = stripExtension(file.name);
      a.download = `${base}${file.ext || ''}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Download failed', err);
      modal.alert('Download failed.', 'Error');
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      setIsFullscreen(!!document.fullscreenElement);
    } catch (err) {
      console.warn('Fullscreen toggle failed', err);
    }
  };

  return (
    <>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0 16px',
      position: 'relative',
      background: 'transparent',
      zIndex: 100
    }}>
      {/* App Name */}
      <h1 style={{
        margin: 0,
        fontSize: 24,
        fontWeight: 600,
        color: theme.text,
        fontFamily: "'Courier New', 'Courier', monospace",
        letterSpacing: '0.05em'
      }}>
        Focus & Fit
      </h1>

      {/* Icon Buttons */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>

        {/* Clean Mode Toggle — always visible */}
        <button
          onClick={toggleCleanMode}
          style={{
            border: 'none',
            borderRadius: theme.borderRadius,
            padding: 10,
            background: cleanMode ? `${theme.accent}30` : 'transparent',
            color: cleanMode ? theme.accent : getTextOpacity(theme, 0.5),
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={cleanMode ? 'Exit Clean Mode' : 'Clean Mode (hide UI)'}
        >
          {cleanMode ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {/* All other icons hidden in clean mode */}
        {!cleanMode && (<>
        <button
          onClick={onShowInfo}
          style={{
            border: 'none',
            borderRadius: theme.borderRadius,
            padding: 10,
            color: theme.accent,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${theme.accent}20`;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          title="App Features"
        >
          <Info size={18} />
        </button>

        <button
          onClick={onShowAchievements}
          style={{
            border: 'none',
            borderRadius: theme.borderRadius,
            padding: 10,
            color: theme.accent,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${theme.accent}20`;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          title="Achievements"
        >
          <Award size={18} />
        </button>

        <button
          onClick={onShowFeedback}
          style={{
            border: 'none',
            borderRadius: theme.borderRadius,
            padding: 10,
            color: theme.accent,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${theme.accent}20`;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          title="Send Feedback"
        >
          <Lightbulb size={18} />
        </button>

        <button
          onClick={onShowWorldClocks}
          style={{
            border: 'none',
            borderRadius: theme.borderRadius,
            padding: 10,
            color: theme.accent,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${theme.accent}20`;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          title="World Clocks"
        >
          <Globe size={18} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={onShowSettings}
            style={{
              border: 'none',
              borderRadius: theme.borderRadius,
              padding: 10,
              color: theme.accent,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `${theme.accent}20`;
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'scale(1)';
            }}
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div 
              ref={settingsPanelRef}
              style={{
                position: 'absolute',
                top: 50,
                right: 0,
                background: theme.card,
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: theme.borderRadius,
                padding: settingsView === 'main' ? 4 : 8,
                minWidth: settingsView === 'main' ? 'auto' : 200,
                width: settingsView === 'backgroundImages' ? '360px' : 'auto',
                maxWidth: 'calc(100vw - 24px)',
                maxHeight: settingsView === 'backgroundImages' ? 'calc(100vh - 84px)' : 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: settingsView === 'main' ? 2 : 4,
                overflowY: settingsView === 'backgroundImages' ? 'auto' : 'visible',
                overflowX: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              {settingsView === 'main' && (
                <>
                  {/* Theme Option */}
                  <button
                    onClick={() => setSettingsView('themes')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Themes"
                  >
                    <Palette size={18} />
                  </button>

                  {/* Sound Option */}
                  <button
                    onClick={() => setSettingsView('sound')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Sound Settings"
                  >
                    {alarmVolume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>

                  {/* Weather Option */}
                  <button
                    onClick={() => setSettingsView('weather')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Scenes"
                  >
                    <Cloud size={18} />
                  </button>

                  {/* Background Images Option */}
                  <button
                    onClick={() => setSettingsView('backgroundImages')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
              justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Background Images"
                  >
                    <ImageIcon size={18} />
                  </button>

                  {/* Timer Visualization Option */}
                  <button
                    onClick={() => setSettingsView('timerVisualization')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Timer Visualization"
                  >
                    <Clock size={18} />
                  </button>

                  {/* Fullscreen Option */}
                  <button
                    onClick={() => toggleFullscreen()}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>

                  {/* Data & Backup Option */}
                  <button
                    onClick={() => setSettingsView('data')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Data & Backup"
                  >
                    <Settings size={18} />
                  </button>

                  {/* Break Reminders Option */}
                  <button
                    onClick={() => setSettingsView('breakReminders')}
                    style={{
                      background: breakReminderSettings?.enabled ? `${theme.accent}20` : 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      padding: '12px 16px',
                      color: breakReminderSettings?.enabled ? theme.accent : theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = breakReminderSettings?.enabled ? `${theme.accent}20` : 'rgba(255,255,255,0.05)'}
                    title="Break Reminders"
                  >
                    {breakReminderSettings?.enabled ? <BellRing size={18} /> : <Bell size={18} />}
                  </button>

                  {/* (Import/Export/Clear moved to Data & Backup panel) */}
                </>
              )}

              {settingsView === 'data' && (
                <>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setSettingsView('main')}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Back"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </div>

                  <div style={{ padding: 4 }}>
                    <DataBackupPanel modal={modal} theme={theme} getTextOpacity={getTextOpacity} />
                  </div>
                </>
              )}

              {settingsView === 'themes' && (
                <>
                  {/* Header with Back, Edit, Delete, Add icons */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setSettingsView('main')}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Back"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Edit Icon */}
                    <button
                      onClick={() => {
                        if (!theme.isDefault || theme.name !== 'Midnight') {
                          setEditingTheme(theme);
                          setShowColorPicker(true);
                        }
                      }}
                      disabled={theme.isDefault && theme.name === 'Midnight'}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: theme.isDefault && theme.name === 'Midnight' ? 'rgba(255,255,255,0.3)' : theme.text,
                        cursor: theme.isDefault && theme.name === 'Midnight' ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px',
                        opacity: theme.isDefault && theme.name === 'Midnight' ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => { if (!(theme.isDefault && theme.name === 'Midnight')) e.target.style.background = 'rgba(255,255,255,0.1)' }}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title={theme.isDefault && theme.name === 'Midnight' ? 'Midnight theme cannot be edited' : 'Edit Current Theme'}
                    >
                      <Edit size={18} />
                    </button>

                    {/* Delete Icon */}
                    <button
                      onClick={() => {
                        if (!(theme.isDefault && theme.name === 'Midnight')) {
                          // Handle delete theme
                        }
                      }}
                      disabled={theme.isDefault && theme.name === 'Midnight'}
                      style={{
                        background: (theme.isDefault && theme.name === 'Midnight') ? 'rgba(255,255,255,0.05)' : 'rgba(255, 0, 0, 0.1)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: (theme.isDefault && theme.name === 'Midnight') ? getTextOpacity(theme, 0.3) : '#ff4444',
                        cursor: (theme.isDefault && theme.name === 'Midnight') ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px',
                        opacity: (theme.isDefault && theme.name === 'Midnight') ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => { if (!(theme.isDefault && theme.name === 'Midnight')) e.target.style.background = 'rgba(255, 0, 0, 0.2)' }}
                      onMouseLeave={(e) => { if (!(theme.isDefault && theme.name === 'Midnight')) e.target.style.background = 'rgba(255, 0, 0, 0.1)' }}
                      title={(theme.isDefault && theme.name === 'Midnight') ? 'Midnight theme cannot be deleted' : 'Delete Current Theme'}
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Opacity Control Button */}
                    <button
                      onClick={() => setShowOpacityModal(true)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Adjust Theme Opacity"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Border Radius Control Button */}
                    <button
                      onClick={() => setShowBorderRadiusModal(true)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Adjust Border Radius"
                    >
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: customBorderRadius !== null ? `${customBorderRadius}px` : `${theme.borderRadius || 10}px`,
                        background: theme.accent,
                        border: '1px solid rgba(255,255,255,0.3)'
                      }} />
                    </button>

                    <div style={{ flex: 1 }} />

                    {/* Add New Theme Icon */}
                    <button
                      onClick={() => {
                        setEditingTheme(null);
                        setShowColorPicker(true);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Create New Theme"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Theme Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 6,
                    maxHeight: 300,
                    overflowY: 'auto',
                    padding: 4
                  }}>
                    {themes.map(t => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setTheme(t);
                          onShowSettings(); // Close settings
                          setSettingsView('main');
                        }}
                        style={{
                          background: t.bg,
                          border: theme.name === t.name ? `2px solid ${t.accent}` : '2px solid transparent',
                          borderRadius: theme.borderRadius,
                          padding: 12,
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                          color: t.text,
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          position: 'relative',
                          minHeight: 48
                        }}
                      >
                        {t.name}
                        {theme.name === t.name && (
                          <div style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            color: t.accent,
                            fontSize: 14
                          }}>✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Weather Settings */}
              {settingsView === 'weather' && (
                <>
                  {/* Header with Back and Edit icons */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setSettingsView('main')}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Back"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Edit Icon */}
                    <button
                      onClick={() => {
                        if (weatherEffect !== 'none') {
                          setEditingWeather && setEditingWeather(weatherEffect);
                        }
                      }}
                      disabled={weatherEffect === 'none'}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: weatherEffect === 'none' ? 'rgba(255,255,255,0.3)' : theme.text,
                        cursor: weatherEffect === 'none' ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px',
                        opacity: weatherEffect === 'none' ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => { if (weatherEffect !== 'none') e.target.style.background = 'rgba(255,255,255,0.1)' }}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title={weatherEffect === 'none' ? 'Select an effect to edit' : 'Edit Current Effect'}
                    >
                      <Edit size={18} />
                    </button>

                    <div style={{ flex: 1 }} />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>Scenes</label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: 6,
                      maxHeight: 300,
                      overflowY: 'auto',
                      padding: 4
                    }}>
                      {[
                        { id: 'none', name: 'None', icon: '🚫' },
                        { id: 'rain', name: 'Rain', icon: '🌧️' },
                        { id: 'cloudy', name: 'Cloudy', icon: '☁️' },
                        { id: 'sunny', name: 'Sunny', icon: '☀️' },
                        { id: 'winter', name: 'Winter', icon: '❄️' },
                        { id: 'autumn', name: 'Autumn', icon: '🍂' },
                        { id: 'spring', name: 'Spring', icon: '🌸' },
                        { id: 'sakura', name: 'Cherry Blossoms', icon: '🌸' },
                        { id: 'fireflies', name: 'Fireflies', icon: '✨' },
                        { id: 'butterflies', name: 'Butterflies', icon: '🦋' },
                        { id: 'lanterns', name: 'Lanterns', icon: '🏮' },
                        { id: 'aurora', name: 'Aurora', icon: '🌌' },
                        { id: 'desert', name: 'Desert', icon: '🏜️' },
                        { id: 'tropical', name: 'Tropical', icon: '🌴' },
                        { id: 'coffee', name: 'Coffee Shop', icon: '☕' },
                        { id: 'fireplace', name: 'Fireplace', icon: '🔥' }
                      ].map(effect => (
                        <button
                          key={effect.id}
                          onClick={() => setWeatherEffect(effect.id)}
                          style={{
                            background: weatherEffect === effect.id ? theme.accent : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                            borderRadius: theme.borderRadius,
                            padding: '12px 8px',
                            color: weatherEffect === effect.id ? '#fff' : theme.text,
                            cursor: 'pointer',
                            fontSize: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            transition: 'all 0.2s',
                            minHeight: '70px',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            if (weatherEffect !== effect.id) {
                              e.target.style.background = 'rgba(255,255,255,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (weatherEffect !== effect.id) {
                              e.target.style.background = 'rgba(255,255,255,0.05)';
                            }
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{effect.icon}</span>
                          <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{effect.name}</span>
                          {weatherEffect === effect.id && (
                            <div style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              color: '#fff',
                              fontSize: 14
                            }}>✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: getTextOpacity(theme, 0.4), marginTop: 6 }}>
                      Choose a scene for your timer sessions
                    </p>
                  </div>
                </>
              )}

              {/* Sound Settings */}
              {settingsView === 'sound' && (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => setSettingsView('main')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      padding: '10px 12px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      marginBottom: 4
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>Alarm Volume</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <VolumeX size={16} color={getTextOpacity(theme, 0.5)} />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={alarmVolume ?? 0.5}
                        onChange={(e) => setAlarmVolume(parseFloat(e.target.value))}
                        style={{
                          flex: 1,
                          accentColor: theme.accent
                        }}
                      />
                      <Volume2 size={16} color={getTextOpacity(theme, 0.5)} />
                    </div>
                    <p style={{ fontSize: 11, color: getTextOpacity(theme, 0.4), marginTop: 6 }}>
                      Adjust the volume of timer completion sounds
                    </p>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5) }}>Ambient Sounds</label>
                      {/* Global Action Buttons for Custom Music */}
                      <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            try {
                              await uploadCustomMusic(file);
                              window.dispatchEvent(new CustomEvent('app-toast', {
                                detail: { message: '✅ Music file uploaded successfully!', type: 'success', ttl: 3000 }
                              }));
                            } catch (error) {
                              window.dispatchEvent(new CustomEvent('app-toast', {
                                detail: { message: `❌ ${error.message}`, type: 'error', ttl: 5000 }
                              }));
                            }
                            e.target.value = '';
                          }}
                          style={{ display: 'none' }}
                          id="custom-music-upload"
                        />
                        <label htmlFor="custom-music-upload" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: theme.borderRadius, background: 'rgba(255,255,255,0.05)', color: theme.text, cursor: 'pointer', border: `1px solid ${getTextOpacity(theme, 0.2)}` }} title="Upload music">
                          <Upload size={14} />
                        </label>

                        <button
                          onClick={(e) => { e.stopPropagation(); onGlobalDownload(); }}
                          title="Download selected"
                          style={{ background: 'none', border: 'none', color: getTextOpacity(theme, 0.7), cursor: selectedMusicId ? 'pointer' : 'not-allowed', padding: 6, borderRadius: theme.borderRadius, opacity: selectedMusicId ? 1 : 0.4 }}
                          disabled={!selectedMusicId}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onGlobalRename(); }}
                          title="Rename selected"
                          style={{ background: 'none', border: 'none', color: getTextOpacity(theme, 0.7), cursor: selectedMusicId ? 'pointer' : 'not-allowed', padding: 6, borderRadius: theme.borderRadius, opacity: selectedMusicId ? 1 : 0.4 }}
                          disabled={!selectedMusicId}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onGlobalDelete(); }}
                          title="Delete selected"
                          style={{ background: 'none', border: 'none', color: getTextOpacity(theme, 0.7), cursor: selectedMusicId ? 'pointer' : 'not-allowed', padding: 6, borderRadius: theme.borderRadius, opacity: selectedMusicId ? 1 : 0.4 }}
                          disabled={!selectedMusicId}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(1, 1fr)', 
                      gap: 6,
                      maxHeight: 200,
                      overflowY: 'auto'
                    }} ref={soundListRef}>
                      {/* Built-in ambient sounds */}
                      {AMBIENT_SOUNDS.map(sound => (
                        <button
                          ref={ambientSound === sound.name ? selectedSoundButtonRef : null}
                          key={sound.name}
                          onClick={() => setAmbientSound(sound.name)}
                          style={{
                            background: ambientSound === sound.name ? theme.accent : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                            borderRadius: theme.borderRadius,
                            padding: '8px 12px',
                            color: ambientSound === sound.name ? '#fff' : theme.text,
                            cursor: 'pointer',
                            fontSize: 12,
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          {sound.name}
                        </button>
                      ))}
                      {/* Custom music files merged into Ambient Sounds list */}
                      {customMusicFiles.map(file => (
                        <button
                          ref={ambientSound === `custom_${file.id}` ? selectedSoundButtonRef : null}
                          key={`custom_${file.id}`}
                          onClick={() => { setAmbientSound(`custom_${file.id}`); setSelectedMusicId(file.id); }}
                          style={{
                            background: ambientSound === `custom_${file.id}` ? theme.accent : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                            borderRadius: theme.borderRadius,
                            padding: '8px 12px',
                            color: ambientSound === `custom_${file.id}` ? '#fff' : theme.text,
                            cursor: 'pointer',
                            fontSize: 12,
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          {selectedMusicId === file.id && <Check size={12} color={ambientSound === `custom_${file.id}` ? '#fff' : theme.accent} />}
                          🎵 {truncate(file.name, 28)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Music Playback Controls */}
                  {(customMusicFiles.length > 0 || AMBIENT_SOUNDS.filter(s => s.name !== 'None').length > 0) && (
                    <div style={{ marginTop: 16, borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: 12 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: theme.text }}>🎵 Music Playback</label>
                      
                      {/* Progress Bar */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{
                          position: 'relative',
                          width: '100%',
                          height: 4,
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }} onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = (e.clientX - rect.left) / rect.width;
                          if (audioRef.current && audioRef.current.src) {
                            audioRef.current.currentTime = percent * audioRef.current.duration;
                          } else if (ambientAudioRef?.current && ambientAudioRef.current.src) {
                            ambientAudioRef.current.currentTime = percent * ambientAudioRef.current.duration;
                          }
                        }}>
                          <div style={{
                            height: '100%',
                            width: musicDuration > 0 ? `${(musicCurrentTime / musicDuration) * 100}%` : '0%',
                            background: theme.accent,
                            transition: 'width 0.2s ease-out'
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: getTextOpacity(theme, 0.6) }}>
                          <span>{Math.floor(musicCurrentTime / 60)}:{String(Math.floor(musicCurrentTime % 60)).padStart(2, '0')}</span>
                          <span>{Math.floor(musicDuration / 60)}:{String(Math.floor(musicDuration % 60)).padStart(2, '0')}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
                        <button
                          type="button"
                          onClick={skipToPreviousSong}
                          disabled={false}
                          title="Previous song"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255,255,255,0.05)',
                            color: getTextOpacity(theme, 0.7),
                            cursor: 'pointer',
                            fontSize: 16,
                            opacity: 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                          onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                        >
                          <SkipBack size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            // Play/pause based on currently selected ambientSound (supports built-in and custom)
                            const active = ambientSound;
                            console.log('[DEBUG] Play clicked. active=', active, 'isHeaderMusicPlaying=', isHeaderMusicPlaying);

                            // If currently playing, pause it and save position
                            if (isHeaderMusicPlaying) {
                              console.log('[DEBUG] Pausing playback');
                              if (audioRef.current) {
                                // Save custom music position
                                const id = currentPlayingIdRef.current;
                                if (id) {
                                  setSavedPlaybackPositions(prev => ({
                                    ...prev,
                                    [id]: audioRef.current.currentTime
                                  }));
                                }
                                audioRef.current.pause();
                              }
                              if (ambientAudioRef?.current) {
                                ambientAudioRef.current.pause();
                              }
                              setIsHeaderMusicPlaying(false);
                              return;
                            }

                            // If not playing, start playback of selected sound
                            if (active === 'None' || !active) {
                              console.log('[DEBUG] No sound selected');
                              return;
                            }

                            // Handle custom music
                            if (active.startsWith('custom_')) {
                              const id = active.replace('custom_', '');
                              console.log('[DEBUG] Playing custom music id=', id);
                              const url = await ensureCustomMusicUrl(id) || getCustomMusicUrl(id);
                              if (url && audioRef.current) {
                                console.log('[DEBUG] Starting custom file:', url);
                                audioRef.current.src = url;
                                // Resume from saved position or start at 0
                                audioRef.current.currentTime = savedPlaybackPositions[id] || 0;
                                await audioRef.current.play().catch(e => console.error('Play error:', e));
                                currentPlayingIdRef.current = id;
                                setSelectedMusicId(id);
                                startAmbient(getSoundFile(`custom_${id}`));
                                setIsHeaderMusicPlaying(true);
                              }
                              return;
                            }

                            // Handle built-in sounds
                            const soundFile = getSoundFile(active);
                            if (soundFile && ambientAudioRef?.current) {
                              console.log('[DEBUG] Starting built-in sound:', active, 'file:', soundFile);
                              // Stop any custom audio
                              if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                              }
                              // Start the built-in sound
                              startAmbient(soundFile);
                              setIsHeaderMusicPlaying(true);
                            }
                          }}
                          disabled={false}
                          title={isHeaderMusicPlaying ? 'Pause music' : 'Play music'}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: 'none',
                            background: isHeaderMusicPlaying ? theme.accent : 'rgba(255,255,255,0.08)',
                            color: isHeaderMusicPlaying ? '#ffffff' : theme.text,
                            cursor: 'pointer',
                            fontSize: 16,
                            opacity: 1,
                            transition: 'all 0.2s'
                          }}
                        >
                          {isHeaderMusicPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (audioRef.current) {
                              audioRef.current.pause();
                              audioRef.current.currentTime = 0;
                              setIsHeaderMusicPlaying(false);
                            }
                            setAmbientSound('None');
                            stopAmbient();
                          }}
                          title="Stop music"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: 'none',
                            background: !isHeaderMusicPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: !isHeaderMusicPlaying ? '#ef4444' : getTextOpacity(theme, 0.7),
                            cursor: 'pointer',
                            fontSize: 16,
                            transition: 'all 0.2s'
                          }}
                        >
                          <X size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const modes = ['sequential', 'random', 'repeat-one'];
                            const currentIndex = modes.indexOf(headerMusicRepeatMode);
                            const nextMode = modes[(currentIndex + 1) % modes.length];
                            setHeaderMusicRepeatMode(nextMode);
                          }}
                          disabled={false}
                          title={`Repeat mode: ${headerMusicRepeatMode}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: 'none',
                            background: headerMusicRepeatMode !== 'sequential' ? `${theme.accent}30` : 'rgba(255,255,255,0.05)',
                            color: headerMusicRepeatMode !== 'sequential' ? theme.accent : getTextOpacity(theme, 0.7),
                            cursor: 'pointer',
                            fontSize: 16,
                            opacity: 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.target.style.background = headerMusicRepeatMode !== 'sequential' ? `${theme.accent}30` : 'rgba(255,255,255,0.1)'; }}
                          onMouseLeave={(e) => { e.target.style.background = headerMusicRepeatMode !== 'sequential' ? `${theme.accent}30` : 'rgba(255,255,255,0.05)'; }}
                        >
                          {headerMusicRepeatMode === 'random' ? <Shuffle size={16} /> : <Repeat2 size={16} />}
                        </button>

                        <button
                          type="button"
                          onClick={skipToNextSong}
                          disabled={false}
                          title="Next song"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255,255,255,0.05)',
                            color: getTextOpacity(theme, 0.7),
                            cursor: 'pointer',
                            fontSize: 16,
                            opacity: 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                          onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                        >
                          <SkipForward size={16} />
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), textAlign: 'center' }}>
                        {headerMusicRepeatMode === 'sequential' && '▶️ Sequential'}
                        {headerMusicRepeatMode === 'random' && '🔀 Random'}
                        {headerMusicRepeatMode === 'repeat-one' && '🔁 Repeat One'}
                      </div>
                      
                      {/* Hidden Audio Element */}
                      <audio
                        ref={audioRef}
                        onEnded={handleSongEnd}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Background Images Settings */}
              {settingsView === 'backgroundImages' && (
                <BackgroundImagesPanel
                  theme={theme}
                  getTextOpacity={getTextOpacity}
                  selectedBackgroundId={selectedBackgroundId}
                  setSelectedBackgroundId={setSelectedBackgroundId}
                  getAllBackgroundImages={getAllBackgroundImages}
                  getBackgroundImageUrl={getBackgroundImageUrl}
                  uploadBackgroundImage={uploadBackgroundImage}
                  deleteBackgroundImage={deleteBackgroundImage}
                  remoteBackgroundImageSources={remoteBackgroundImageSources}
                  remoteBackgroundImageSourceStatuses={remoteBackgroundImageSourceStatuses}
                  addRemoteBackgroundImageSource={addRemoteBackgroundImageSource}
                  deleteRemoteBackgroundImageSource={deleteRemoteBackgroundImageSource}
                  refreshRemoteBackgroundImages={refreshRemoteBackgroundImages}
                  onBack={() => setSettingsView('main')}
                  slideSets={slideSets}
                  activeSlideSetId={activeSlideSetId}
                  createSlideSet={createSlideSet}
                  deleteSlideSet={deleteSlideSet}
                  renameSlideSet={renameSlideSet}
                  setSlideInterval={setSlideInterval}
                  setSlideTransition={setSlideTransition}
                  addImageToSet={addImageToSet}
                  addVideoToSet={addVideoToSet}
                  removeImageFromSet={removeImageFromSet}
                  removeMediaItemFromSet={removeMediaItemFromSet}
                  setActiveSlideSetId={setActiveSlideSetId}
                  selectedVideoId={selectedVideoId}
                  setSelectedVideoId={setSelectedVideoId}
                  getAllBackgroundVideos={getAllBackgroundVideos}
                  getBackgroundVideoUrl={getBackgroundVideoUrl}
                  uploadBackgroundVideo={uploadBackgroundVideo}
                  deleteBackgroundVideo={deleteBackgroundVideo}
                  remoteBackgroundVideoSources={remoteBackgroundVideoSources}
                  remoteBackgroundVideoSourceStatuses={remoteBackgroundVideoSourceStatuses}
                  addRemoteBackgroundVideoSource={addRemoteBackgroundVideoSource}
                  deleteRemoteBackgroundVideoSource={deleteRemoteBackgroundVideoSource}
                  refreshRemoteBackgroundVideos={refreshRemoteBackgroundVideos}
                />
              )}

              {/* Break Reminders Settings */}
              {settingsView === 'breakReminders' && (
                <div style={{ minWidth: 260 }}>
                  {/* Back */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
                    <button
                      onClick={() => setSettingsView('main')}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: theme.borderRadius, padding: '8px 10px', color: theme.text, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, flex: 1 }}>Break Reminders</span>
                    {/* Master toggle */}
                    <button
                      onClick={toggleBreakReminders}
                      style={{
                        background: breakReminderSettings?.enabled ? theme.accent : 'rgba(255,255,255,0.08)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '6px 12px',
                        color: breakReminderSettings?.enabled ? '#fff' : getTextOpacity(theme, 0.7),
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.2s',
                      }}
                    >
                      {breakReminderSettings?.enabled ? <BellRing size={13} /> : <BellOff size={13} />}
                      {breakReminderSettings?.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Notification permission prompt */}
                  {!notificationsGranted && breakReminderSettings?.enabled && (
                    <div style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}40`, borderRadius: theme.borderRadius, padding: '8px 10px', marginBottom: 10, fontSize: 11, color: theme.text, lineHeight: 1.45 }}>
                      <div style={{ fontWeight: 600, marginBottom: 3 }}>Enable browser notifications for reminders</div>
                      <div style={{ color: getTextOpacity(theme, 0.65), marginBottom: 6 }}>Without permission, reminders appear as in-app banners only.</div>
                      <button
                        onClick={requestNotificationPermission}
                        style={{ background: theme.accent, border: 'none', borderRadius: theme.borderRadius, padding: '5px 10px', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                      >
                        Allow notifications
                      </button>
                    </div>
                  )}

                  {/* Suppress during timer toggle */}
                  {breakReminderSettings?.enabled && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '6px 2px' }}>
                      <span style={{ fontSize: 11, color: getTextOpacity(theme, 0.65) }}>Pause during active timer</span>
                      <button
                        onClick={() => updateBreakReminderSettings({ suppressDuringTimer: !breakReminderSettings.suppressDuringTimer })}
                        style={{
                          background: breakReminderSettings.suppressDuringTimer ? theme.accent : 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: 20,
                          width: 40,
                          height: 22,
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: 3, left: breakReminderSettings.suppressDuringTimer ? 20 : 3,
                          width: 16, height: 16,
                          borderRadius: '50%',
                          background: '#fff',
                          transition: 'left 0.2s',
                        }} />
                      </button>
                    </div>
                  )}

                  {/* Reminder list */}
                  {breakReminderSettings?.enabled && (BREAK_REMINDERS || []).map(def => {
                    const cfg = breakReminderSettings.reminders?.find(r => r.id === def.id);
                    if (!cfg) return null;
                    const categories = { eyes: '#06b6d4', posture: '#8b5cf6', health: '#10b981', movement: '#f59e0b', mental: '#ec4899' };
                    const catColor = categories[def.category] || theme.accent;
                    return (
                      <div key={def.id} style={{
                        background: cfg.active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${cfg.active ? catColor + '40' : 'transparent'}`,
                        borderRadius: theme.borderRadius,
                        padding: '9px 10px',
                        marginBottom: 6,
                        opacity: cfg.active ? 1 : 0.5,
                        transition: 'all 0.2s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: cfg.active ? 7 : 0 }}>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>{def.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, lineHeight: 1.2 }}>{def.label}</div>
                            <div style={{ fontSize: 10, color: getTextOpacity(theme, 0.5), lineHeight: 1.3, marginTop: 1 }}>{def.description}</div>
                          </div>
                          <button
                            onClick={() => toggleBreakReminder(def.id)}
                            style={{
                              background: cfg.active ? catColor : 'rgba(255,255,255,0.1)',
                              border: 'none',
                              borderRadius: 12,
                              width: 36,
                              height: 20,
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.2s',
                              flexShrink: 0,
                            }}
                          >
                            <span style={{
                              position: 'absolute',
                              top: 2, left: cfg.active ? 18 : 2,
                              width: 16, height: 16,
                              borderRadius: '50%',
                              background: '#fff',
                              transition: 'left 0.2s',
                            }} />
                          </button>
                        </div>
                        {cfg.active && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={11} style={{ color: getTextOpacity(theme, 0.45), flexShrink: 0 }} />
                            <span style={{ fontSize: 10, color: getTextOpacity(theme, 0.5), flexShrink: 0 }}>Every</span>
                            <input
                              type="range"
                              min={5}
                              max={120}
                              step={5}
                              value={cfg.intervalMin ?? 30}
                              onChange={(e) => setBreakReminderInterval(def.id, parseInt(e.target.value, 10))}
                              style={{ flex: 1, accentColor: catColor, cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: 11, fontWeight: 600, color: catColor, minWidth: 34, textAlign: 'right' }}>
                              {cfg.intervalMin ?? 30}m
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!breakReminderSettings?.enabled && (
                    <div style={{ textAlign: 'center', padding: '18px 0', color: getTextOpacity(theme, 0.35), fontSize: 12, lineHeight: 1.5 }}>
                      Enable reminders to protect your<br />eyes, posture, and focus.
                    </div>
                  )}
                </div>
              )}

              {/* Timer Visualization Settings */}
              {settingsView === 'timerVisualization' && (
                <>
                  {/* Back Button and Title */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setSettingsView('main')}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: theme.borderRadius,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Back"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div style={{ fontSize: 16, fontWeight: 600, color: theme.text }}>
                      Timer Visualization
                    </div>
                  </div>
                  <TimerVisualizationSelector
                    currentVisualization={timerVisualization}
                    onVisualizationChange={setTimerVisualization}
                    theme={theme}
                    getTextOpacity={getTextOpacity}
                  />
                </>
              )}
            </div>
          )}
        </div>
        </>)}
      </div>

      {/* Opacity Modal */}
      {showOpacityModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => setShowOpacityModal(false)}
        >
          <div
            style={{
              background: theme.card,
              borderRadius: theme.borderRadius,
              padding: 24,
              minWidth: 300,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              border: `1px solid rgba(255,255,255,0.1)`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600, color: theme.text }}>
              Theme Opacity
            </h2>

            <p style={{ fontSize: 13, color: getTextOpacity(theme, 0.6), marginBottom: 16 }}>
              Adjust the opacity of theme elements. Current: {Math.round(themeOpacity * 100)}%
            </p>

            {/* Opacity Slider */}
            <div style={{ marginBottom: 24 }}>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Number.isFinite(themeOpacity) ? themeOpacity * 100 : 100}
                onChange={(e) => setThemeOpacity(e.target.value / 100)}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: theme.borderRadius,
                  background: getTextOpacity(theme, 0.2),
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: theme.accent
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: getTextOpacity(theme, 0.5) }}>
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Preset Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Low', value: 0.5 },
                { label: 'Medium', value: 0.75 },
                { label: 'Full', value: 1 }
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setThemeOpacity(preset.value)}
                  style={{
                    background: Math.abs(themeOpacity - preset.value) < 0.01 ? theme.accent : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                    borderRadius: theme.borderRadius,
                    padding: '10px 12px',
                    color: Math.abs(themeOpacity - preset.value) < 0.01 ? getTextOpacity(theme, 1) : theme.text,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (Math.abs(themeOpacity - preset.value) >= 0.01) {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (Math.abs(themeOpacity - preset.value) >= 0.01) {
                      e.target.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowOpacityModal(false)}
              style={{
                width: '100%',
                background: theme.accent,
                border: 'none',
                borderRadius: theme.borderRadius,
                padding: '12px 16px',
                color: getTextOpacity(theme, 1),
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Border Radius Modal */}
      {showBorderRadiusModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowBorderRadiusModal(false)}
        >
          <div
            style={{
              background: theme.card,
              borderRadius: theme.borderRadius,
              padding: 24,
              minWidth: 300,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              border: `1px solid rgba(255,255,255,0.1)`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600, color: theme.text }}>
              Border Radius
            </h2>

            <p style={{ fontSize: 13, color: getTextOpacity(theme, 0.6), marginBottom: 16 }}>
              Adjust the corner rounding of UI elements. Current: {customBorderRadius}px
            </p>

            {/* Border Radius Slider */}
            <div style={{ marginBottom: 24 }}>
              <input
                type="range"
                min="0"
                max="32"
                step="2"
                value={customBorderRadius ?? 12}
                onChange={(e) => setCustomBorderRadius(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: theme.borderRadius,
                  background: getTextOpacity(theme, 0.2),
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: theme.accent
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: getTextOpacity(theme, 0.5) }}>
                <span>0px</span>
                <span>16px</span>
                <span>32px</span>
              </div>
            </div>

            {/* Preset Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Sharp', value: 0 },
                { label: 'Medium', value: 12 },
                { label: 'Rounded', value: 24 }
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setCustomBorderRadius(preset.value)}
                  style={{
                    background: customBorderRadius === preset.value ? theme.accent : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                    borderRadius: theme.borderRadius,
                    padding: '10px 12px',
                    color: customBorderRadius === preset.value ? getTextOpacity(theme, 1) : theme.text,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (customBorderRadius !== preset.value) {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (customBorderRadius !== preset.value) {
                      e.target.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowBorderRadiusModal(false)}
              style={{
                width: '100%',
                background: theme.accent,
                border: 'none',
                borderRadius: theme.borderRadius,
                padding: '12px 16px',
                color: getTextOpacity(theme, 1),
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Music Mini-Player — floating bar at bottom, visible only when actively playing */}
    {ambientSound && ambientSound !== 'None' && isHeaderMusicPlaying && (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 52,
        background: `${theme.card}ee`,
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid rgba(255,255,255,0.1)`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 20px',
        zIndex: 9999,
      }}>
        {/* Track name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ambientSound.startsWith('custom_')
              ? (customMusicFiles.find(f => f.id === ambientSound.replace('custom_', ''))?.name || 'Custom Track')
              : ambientSound}
          </div>
          {musicDuration > 0 && (
            <div style={{ fontSize: 10, color: `${theme.text}80`, marginTop: 1 }}>
              {Math.floor(musicCurrentTime / 60)}:{String(Math.floor(musicCurrentTime % 60)).padStart(2, '0')} / {Math.floor(musicDuration / 60)}:{String(Math.floor(musicDuration % 60)).padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {musicDuration > 0 && (
          <div
            style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, cursor: 'pointer', flexShrink: 0 }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              if (audioRef.current) audioRef.current.currentTime = percent * audioRef.current.duration;
              if (ambientAudioRef?.current) ambientAudioRef.current.currentTime = percent * ambientAudioRef.current.duration;
            }}
          >
            <div style={{ height: '100%', width: `${(musicCurrentTime / musicDuration) * 100}%`, background: theme.accent, borderRadius: 2, transition: 'width 0.2s ease-out' }} />
          </div>
        )}

        {/* Previous */}
        <button
          onClick={skipToPreviousSong}
          title="Previous song"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: theme.text,
            flexShrink: 0,
          }}
        >
          <SkipBack size={14} />
        </button>

        {/* Play/Pause */}
        <button
          onClick={async () => {
            if (isHeaderMusicPlaying) {
              // Save position before pausing
              if (audioRef.current) {
                const id = currentPlayingIdRef.current;
                if (id) {
                  setSavedPlaybackPositions(prev => ({
                    ...prev,
                    [id]: audioRef.current.currentTime
                  }));
                }
                audioRef.current.pause();
              }
              if (ambientAudioRef?.current) ambientAudioRef.current.pause();
              setIsHeaderMusicPlaying(false);
            } else {
              if (ambientSound.startsWith('custom_')) {
                const id = ambientSound.replace('custom_', '');
                const url = await ensureCustomMusicUrl(id) || getCustomMusicUrl(id);
                if (url && audioRef.current) {
                  // Only reload src if track changed, otherwise just resume
                  if (!audioRef.current.src || currentPlayingIdRef.current !== id) {
                    audioRef.current.src = url;
                    audioRef.current.currentTime = savedPlaybackPositions[id] || 0;
                  }
                  await audioRef.current.play().catch(() => {});
                  currentPlayingIdRef.current = id;
                  setIsHeaderMusicPlaying(true);
                }
              } else {
                // Resume built-in sound from where it was paused
                if (ambientAudioRef?.current && ambientAudioRef.current.src && ambientAudioRef.current.paused) {
                  await ambientAudioRef.current.play().catch(() => {});
                  setIsHeaderMusicPlaying(true);
                } else {
                  const soundFile = getSoundFile(ambientSound);
                  if (soundFile && ambientAudioRef?.current) {
                    startAmbient(soundFile);
                    setIsHeaderMusicPlaying(true);
                  }
                }
              }
            }
          }}
          style={{
            background: isHeaderMusicPlaying ? theme.accent : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isHeaderMusicPlaying ? '#fff' : theme.text,
            flexShrink: 0,
          }}
        >
          {isHeaderMusicPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        {/* Next */}
        <button
          onClick={skipToNextSong}
          title="Next song"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: theme.text,
            flexShrink: 0,
          }}
        >
          <SkipForward size={14} />
        </button>

        {/* Stop */}
        <button
          onClick={() => {
            if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
            stopAmbient();
            setAmbientSound('None');
            setIsHeaderMusicPlaying(false);
          }}
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ef4444',
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>

        {/* Repeat mode */}
        <button
          onClick={() => {
            const modes = ['sequential', 'random', 'repeat-one'];
            const next = modes[(modes.indexOf(headerMusicRepeatMode) + 1) % modes.length];
            setHeaderMusicRepeatMode(next);
          }}
          title={`Mode: ${headerMusicRepeatMode}`}
          style={{
            background: headerMusicRepeatMode !== 'sequential' ? `${theme.accent}30` : 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: headerMusicRepeatMode !== 'sequential' ? theme.accent : `${theme.text}80`,
            flexShrink: 0,
          }}
        >
          {headerMusicRepeatMode === 'random' ? <Shuffle size={14} /> : <Repeat2 size={14} />}
        </button>
      </div>
    )}
    </>
  );
};

export default Header;