import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useModal } from '../context/ModalContext';
import { Info, Award, Lightbulb, Settings, Globe, Palette, Volume2, VolumeX, Trash, ChevronLeft, Edit, Trash2, Plus, Cloud, Download, Upload, Check, Pencil, Image as ImageIcon, Eye, EyeOff, Maximize, Minimize, Clock, Play, Pause, Search, Star, X, Repeat2, Shuffle, Bell, BellOff, BellRing, SkipBack, SkipForward, Square } from 'lucide-react';
import BackgroundImagesPanel from './panels/BackgroundImagesPanel';
import DataBackupPanel from './panels/DataBackupPanel';
import MusicLibraryModal from './MusicLibraryModal';
import TimerVisualizationSelector from './TimerVisualizationSelector';
import { buildMusicPlaylist, CUSTOM_MUSIC_SOURCE, BUILTIN_MUSIC_SOURCE, getNextPlaylistEntry, getPlaylistEntry, getPreviousPlaylistEntry, LIBRARY_MUSIC_SOURCE } from '../utils/musicPlaylist';
import {
  buildSupportCheckoutUrl,
  buildSupportPaymentOptions,
  getPaymentProviderName,
  SUPPORT_DEFAULT_AMOUNTS,
  SUPPORT_PREFERENCES_KEY,
} from '../config/supportPayments.config';
import { WEATHER_ART_DIRECTIONS, getWeatherArtDirectionLabel, getWeatherEffectsByCategory } from '../utils/weatherEffects';

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
  ambientVolume,
  setAmbientVolume,
  getTextOpacity,
  weatherEffect,
  setWeatherEffect,
  weatherEffectFavorites,
  setWeatherEffectFavorites,
  SCENES,
  AMBIENT_SOUNDS,
  ambientSound,
  setAmbientSound,
  setEditingWeather,
  customMusicFiles,
  musicSelections,
  musicSources,
  musicSourceStatuses,
  availableMusicAssets,
  addRemoteMusicSource,
  addLocalMusicSource,
  deleteMusicSource,
  refreshMusicLibrary,
  addMusicSelection,
  removeMusicSelection,
  reorderMusicSelection,
  resolveMusicSelectionUrl,
  releaseMusicSelectionUrl,
  getMusicSelectionStatus,
  supportsLocalMusicFolders,
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
  releaseBackgroundImageUrl,
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
  releaseBackgroundVideoUrl,
  uploadBackgroundVideo,
  deleteBackgroundVideo,
  remoteBackgroundVideoSources,
  remoteBackgroundVideoSourceStatuses,
  addRemoteBackgroundVideoSource,
  deleteRemoteBackgroundVideoSource,
  refreshRemoteBackgroundVideos,
  videoLoopFade,
  setVideoLoopFade,
  videoAudioEnabled,
  setVideoAudioEnabled,
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
  const [showMusicLibraryModal, setShowMusicLibraryModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [weatherSceneSearch, setWeatherSceneSearch] = useState('');
  const [activeWeatherArtDirection, setActiveWeatherArtDirection] = useState('all');
  const [isHeaderMusicPlaying, setIsHeaderMusicPlaying] = useState(false);
  const [headerMusicRepeatMode, setHeaderMusicRepeatMode] = useState('sequential'); // sequential, random, repeat-one
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [isFooterVolumeVisible, setIsFooterVolumeVisible] = useState(false);
  const supportPaymentOptions = useMemo(() => buildSupportPaymentOptions(), []);
  const weatherEffectGroups = useMemo(() => getWeatherEffectsByCategory(), []);
  const weatherEffectArtDirectionCounts = useMemo(() => {
    const counts = {
      all: weatherEffectGroups.reduce((total, group) => total + group.effects.length, 0),
    };

    weatherEffectGroups.forEach((group) => {
      group.effects.forEach((effect) => {
        counts[effect.artDirection] = (counts[effect.artDirection] || 0) + 1;
      });
    });

    return counts;
  }, [weatherEffectGroups]);
  const favoriteWeatherEffectIds = useMemo(
    () => new Set(Array.isArray(weatherEffectFavorites) ? weatherEffectFavorites : []),
    [weatherEffectFavorites]
  );
  const filteredWeatherSceneData = useMemo(() => {
    const normalizedSearch = weatherSceneSearch.trim().toLowerCase();
    const favoriteEffects = [];
    const groupedEffects = [];

    weatherEffectGroups.forEach((group) => {
      const matchingEffects = group.effects.filter((effect) => {
        if (activeWeatherArtDirection !== 'all' && effect.artDirection !== activeWeatherArtDirection) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [
          effect.id,
          effect.name,
          effect.description,
          group.label,
          effect.artDirection,
          getWeatherArtDirectionLabel(effect.artDirection),
        ]
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      });

      if (matchingEffects.length === 0) {
        return;
      }

      const groupFavorites = [];
      const groupRemainder = [];

      matchingEffects.forEach((effect) => {
        if (effect.id !== 'none' && favoriteWeatherEffectIds.has(effect.id)) {
          groupFavorites.push(effect);
        } else {
          groupRemainder.push(effect);
        }
      });

      favoriteEffects.push(...groupFavorites);

      if (groupRemainder.length > 0) {
        groupedEffects.push({
          ...group,
          effects: groupRemainder,
        });
      }
    });

    const resultCount = favoriteEffects.length + groupedEffects.reduce((total, group) => total + group.effects.length, 0);

    return {
      favoriteEffects,
      groupedEffects,
      hasResults: resultCount > 0,
      resultCount,
    };
  }, [activeWeatherArtDirection, favoriteWeatherEffectIds, weatherEffectGroups, weatherSceneSearch]);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedPaymentOptionId, setSelectedPaymentOptionId] = useState(
    supportPaymentOptions.find((option) => option.checkoutUrl)?.id || supportPaymentOptions[0]?.id || ''
  );
  const [selectedAmount, setSelectedAmount] = useState(SUPPORT_DEFAULT_AMOUNTS[0]);
  const [customAmount, setCustomAmount] = useState('');
  const audioRef = useRef(null);
  const currentPlayingIdRef = useRef(null); // Track currently playing ID for auto-advance
  const currentPlayingEntryRef = useRef(null);
  const musicUpdateIntervalRef = useRef(null); // Timer for updating music progress

  const normalizedThemeOpacity = Number.isFinite(Number(themeOpacity))
    ? Math.min(1, Math.max(0, Number(themeOpacity)))
    : 1;

  useEffect(() => {
    if (settingsView !== 'weather') {
      if (weatherSceneSearch) {
        setWeatherSceneSearch('');
      }
      if (activeWeatherArtDirection !== 'all') {
        setActiveWeatherArtDirection('all');
      }
    }
  }, [activeWeatherArtDirection, settingsView, weatherSceneSearch]);

  const handleThemeOpacityChange = useCallback((rawValue) => {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      setThemeOpacity(1);
      return;
    }

    const normalized = parsed > 1 ? parsed / 100 : parsed;
    setThemeOpacity(Math.min(1, Math.max(0, normalized)));
  }, [setThemeOpacity]);

  const resolveAudioDuration = useCallback((audioElement) => {
    if (!audioElement) {
      return 0;
    }

    if (Number.isFinite(audioElement.duration) && audioElement.duration > 0) {
      return audioElement.duration;
    }

    if (audioElement.seekable && audioElement.seekable.length > 0) {
      const seekableEnd = audioElement.seekable.end(audioElement.seekable.length - 1);
      if (Number.isFinite(seekableEnd) && seekableEnd > 0) {
        return seekableEnd;
      }
    }

    return 0;
  }, []);

  const getRepeatModeMeta = useCallback((mode) => {
    if (mode === 'random') {
      return { icon: <Shuffle size={16} />, label: 'Shuffle', title: 'Mode: Shuffle' };
    }

    if (mode === 'repeat-one') {
      return { icon: <Repeat2 size={16} />, label: 'Repeat one', title: 'Mode: Repeat one' };
    }

    return { icon: <Repeat2 size={16} />, label: 'Next track', title: 'Mode: Next track' };
  }, []);

  const handleToggleWeatherEffectFavorite = useCallback((effectId) => {
    if (!setWeatherEffectFavorites || effectId === 'none') {
      return;
    }

    setWeatherEffectFavorites((currentFavorites) => {
      const safeFavorites = Array.isArray(currentFavorites) ? currentFavorites : [];
      if (safeFavorites.includes(effectId)) {
        return safeFavorites.filter((favoriteId) => favoriteId !== effectId);
      }

      return [...safeFavorites, effectId];
    });
  }, [setWeatherEffectFavorites]);

  const renderWeatherEffectCard = useCallback((effect) => {
    const isFavorite = favoriteWeatherEffectIds.has(effect.id);
    const artDirectionLabel = getWeatherArtDirectionLabel(effect.artDirection);

    return (
      <div key={effect.id} style={{ position: 'relative' }}>
        <button
          type="button"
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
            justifyContent: 'flex-start',
            gap: 4,
            transition: 'all 0.2s',
            minHeight: '104px',
            position: 'relative',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            if (weatherEffect !== effect.id) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (weatherEffect !== effect.id) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }
          }}
        >
          <span style={{ fontSize: 20 }}>{effect.icon}</span>
          <span style={{ textAlign: 'center', lineHeight: 1.2, fontWeight: 600 }}>{effect.name}</span>
          <span style={{
            fontSize: 9,
            lineHeight: 1,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 6px',
            borderRadius: 999,
            background: weatherEffect === effect.id ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)',
            color: weatherEffect === effect.id ? 'rgba(255,255,255,0.94)' : getTextOpacity(theme, 0.65)
          }}>{artDirectionLabel}</span>
          <span style={{
            textAlign: 'center',
            lineHeight: 1.25,
            fontSize: 10,
            opacity: weatherEffect === effect.id ? 0.82 : 0.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{effect.description}</span>
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
        {effect.id !== 'none' && (
          <button
            type="button"
            aria-label={`${isFavorite ? 'Remove' : 'Add'} ${effect.name} ${isFavorite ? 'from' : 'to'} favorite scenes`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(event) => {
              event.stopPropagation();
              handleToggleWeatherEffectFavorite(effect.id);
            }}
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              border: 'none',
              borderRadius: 999,
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: weatherEffect === effect.id ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
              color: isFavorite ? '#FFD166' : getTextOpacity(theme, 0.55),
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Star size={12} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    );
  }, [favoriteWeatherEffectIds, getTextOpacity, handleToggleWeatherEffectFavorite, setWeatherEffect, theme, weatherEffect]);

  const syncMusicProgress = useCallback(() => {
    const currentEntry = currentPlayingEntryRef.current;
    if (!currentEntry) {
      setMusicCurrentTime(0);
      setMusicDuration(0);
      return;
    }

    if (currentEntry.type === CUSTOM_MUSIC_SOURCE || currentEntry.type === LIBRARY_MUSIC_SOURCE) {
      const customAudio = audioRef.current;
      if (customAudio && customAudio.src) {
        const nextCurrentTime = Number.isFinite(customAudio.currentTime) ? customAudio.currentTime : 0;
        const nextDuration = resolveAudioDuration(customAudio);
        setMusicCurrentTime(nextCurrentTime);
        setMusicDuration(nextDuration);
      } else {
        setMusicCurrentTime(0);
        setMusicDuration(0);
      }
      return;
    }

    if (currentEntry.type === BUILTIN_MUSIC_SOURCE) {
      const ambientAudio = ambientAudioRef?.current;
      if (ambientAudio && ambientAudio.src) {
        const nextCurrentTime = Number.isFinite(ambientAudio.currentTime) ? ambientAudio.currentTime : 0;
        const nextDuration = resolveAudioDuration(ambientAudio);
        setMusicCurrentTime(nextCurrentTime);
        setMusicDuration(nextDuration);
      } else {
        setMusicCurrentTime(0);
        setMusicDuration(0);
      }
      return;
    }

    setMusicCurrentTime(0);
    setMusicDuration(0);
  }, [ambientAudioRef, resolveAudioDuration]);

  const seekMusicToPercent = useCallback((percent) => {
    const clampedPercent = Math.min(1, Math.max(0, percent));

    if (audioRef.current && audioRef.current.src && Number.isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      audioRef.current.currentTime = clampedPercent * audioRef.current.duration;
      syncMusicProgress();
      return;
    }

    if (ambientAudioRef?.current && ambientAudioRef.current.src && Number.isFinite(ambientAudioRef.current.duration) && ambientAudioRef.current.duration > 0) {
      ambientAudioRef.current.currentTime = clampedPercent * ambientAudioRef.current.duration;
      syncMusicProgress();
    }
  }, [ambientAudioRef, syncMusicProgress]);

  const customAmountValue = Number(customAmount);
  const resolvedSupportAmount = Number.isFinite(customAmountValue) && customAmountValue > 0
    ? customAmountValue
    : selectedAmount;
  const configuredPaymentOptions = useMemo(
    () => supportPaymentOptions.filter((option) => option.checkoutUrl),
    [supportPaymentOptions]
  );
  const selectedPaymentOption = supportPaymentOptions.find((option) => option.id === selectedPaymentOptionId)
    || supportPaymentOptions[0];
  const selectedPaymentProvider = getPaymentProviderName(selectedPaymentOption?.checkoutUrl);
  const isPaymentOptionConfigured = !!selectedPaymentOption?.checkoutUrl;

  useEffect(() => {
    if (!configuredPaymentOptions.length) {
      return;
    }

    if (!configuredPaymentOptions.some((option) => option.id === selectedPaymentOptionId)) {
      setSelectedPaymentOptionId(configuredPaymentOptions[0].id);
    }
  }, [configuredPaymentOptions, selectedPaymentOptionId]);

  useEffect(() => {
    try {
      const query = new URLSearchParams(window.location.search);
      const supportStatus = query.get('support');
      if (!supportStatus) {
        return;
      }

      const amountValue = Number(query.get('amount'));
      const normalizedAmount = Number.isFinite(amountValue) && amountValue > 0
        ? ` $${amountValue.toFixed(2)}`
        : '';

      if (supportStatus === 'success') {
        window.dispatchEvent(new CustomEvent('app-toast', {
          detail: {
            message: `Thank you for your support!${normalizedAmount}`,
            type: 'success',
            ttl: 3600,
          }
        }));
      } else if (supportStatus === 'cancel') {
        window.dispatchEvent(new CustomEvent('app-toast', {
          detail: {
            message: 'Payment was canceled. You can try again any time.',
            type: 'warning',
            ttl: 3000,
          }
        }));
      }

      query.delete('support');
      query.delete('amount');
      const nextQuery = query.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    } catch (_error) {
      // Ignore malformed query string errors.
    }
  }, []);

  useEffect(() => {
    try {
      const rawPreferences = window.localStorage.getItem(SUPPORT_PREFERENCES_KEY);
      if (!rawPreferences) {
        return;
      }

      const parsedPreferences = JSON.parse(rawPreferences);
      if (typeof parsedPreferences?.paymentOptionId === 'string' && supportPaymentOptions.some((option) => option.id === parsedPreferences.paymentOptionId)) {
        setSelectedPaymentOptionId(parsedPreferences.paymentOptionId);
      }
      if (Number.isFinite(parsedPreferences?.amount) && parsedPreferences.amount > 0) {
        setSelectedAmount(parsedPreferences.amount);
      }
      if (typeof parsedPreferences?.customAmount === 'string') {
        setCustomAmount(parsedPreferences.customAmount);
      }
    } catch (_error) {
      // Ignore storage parse errors and keep defaults.
    }
  }, [supportPaymentOptions]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SUPPORT_PREFERENCES_KEY, JSON.stringify({
        paymentOptionId: selectedPaymentOptionId,
        amount: selectedAmount,
        customAmount,
      }));
    } catch (_error) {
      // Ignore storage quota/access errors.
    }
  }, [customAmount, selectedAmount, selectedPaymentOptionId]);

  const openSupportCheckout = useCallback(() => {
    if (!selectedPaymentOption?.checkoutUrl) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `No payment link configured for ${selectedPaymentOption?.label || 'this method'} yet.`,
          type: 'warning',
          ttl: 2600,
        }
      }));
      return;
    }

    try {
      const checkoutUrl = buildSupportCheckoutUrl({
        paymentOption: selectedPaymentOption,
        amount: resolvedSupportAmount,
      });
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    } catch (_error) {
      window.open(selectedPaymentOption.checkoutUrl, '_blank', 'noopener,noreferrer');
    }

    setShowSupportModal(false);
  }, [resolvedSupportAmount, selectedPaymentOption]);

  const truncate = (s, n = 28) => {
    if (!s) return '';
    return s.length > n ? `${s.slice(0, n - 1)}…` : s;
  };

  const getLibrarySelectionByAmbientValue = useCallback((ambientValue) => {
    if (!ambientValue || !ambientValue.startsWith('library_')) {
      return null;
    }

    const selectionId = ambientValue.replace('library_', '');
    return musicSelections.find((selection) => selection.selectionId === selectionId) || null;
  }, [musicSelections]);

  const getAmbientTrackLabel = useCallback((ambientValue) => {
    if (!ambientValue || ambientValue === 'None') {
      return '';
    }

    if (ambientValue.startsWith('custom_')) {
      return customMusicFiles.find((file) => file.id === ambientValue.replace('custom_', ''))?.name || 'Custom Track';
    }

    if (ambientValue.startsWith('library_')) {
      return getLibrarySelectionByAmbientValue(ambientValue)?.name || 'Library Track';
    }

    return ambientValue;
  }, [customMusicFiles, getLibrarySelectionByAmbientValue]);

  const getMusicPlaylist = useCallback(() => buildMusicPlaylist(AMBIENT_SOUNDS, customMusicFiles, musicSelections), [AMBIENT_SOUNDS, customMusicFiles, musicSelections]);

  const libraryMusicEntries = [
    ...musicSelections.map((selection) => {
      const selectionStatus = getMusicSelectionStatus(selection);
      return {
        key: selection.selectionId,
        ambientValue: `library_${selection.selectionId}`,
        name: selection.name,
        type: LIBRARY_MUSIC_SOURCE,
        status: selectionStatus,
        isReady: selectionStatus === 'ready',
        badgeLabel: selectionStatus === 'ready'
          ? (selection.sourceType === 'local-folder' ? 'Local' : 'Cloud')
          : 'Unavailable',
      };
    }),
    ...customMusicFiles.map((file) => ({
      key: `custom_${file.id}`,
      ambientValue: `custom_${file.id}`,
      name: file.name,
      type: CUSTOM_MUSIC_SOURCE,
      status: 'ready',
      isReady: true,
      badgeLabel: 'Stored',
      fileId: file.id,
    })),
  ];

  const releaseCurrentLibraryEntry = useCallback(() => {
    const currentEntry = currentPlayingEntryRef.current;
    if (currentEntry?.type === LIBRARY_MUSIC_SOURCE && currentEntry.selectionId) {
      releaseMusicSelectionUrl(currentEntry.selectionId);
    }

    currentPlayingEntryRef.current = null;
  }, [releaseMusicSelectionUrl]);

  const playMusicEntry = useCallback(async (entry, options = {}) => {
    if (!entry) {
      return false;
    }

    const startTime = options.startTime ?? 0;
    const currentEntry = currentPlayingEntryRef.current;

    // Synchronously pause and zero BOTH audio elements before any await so that
    // the syncMusicProgress interval cannot read a stale position during the
    // async URL-fetch gap and overwrite the 0 we set below.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (ambientAudioRef?.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }
    setMusicCurrentTime(0);
    setMusicDuration(0);

    if (currentEntry?.type === LIBRARY_MUSIC_SOURCE && currentEntry.selectionId !== entry.selectionId) {
      releaseMusicSelectionUrl(currentEntry.selectionId);
    }

    if (entry.type === CUSTOM_MUSIC_SOURCE) {
      stopAmbient();
      if (ambientAudioRef?.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.currentTime = 0;
      }

      const url = await ensureCustomMusicUrl(entry.id) || getCustomMusicUrl(entry.id);
      if (!url || !audioRef.current) {
        return false;
      }

      try {
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.volume = ambientVolume ?? 0.3;
        audioRef.current.currentTime = startTime;
        await audioRef.current.play();
      } catch (error) {
        console.error('Play error:', error);
        return false;
      }

      currentPlayingIdRef.current = entry.id;
      currentPlayingEntryRef.current = entry;
      setSelectedMusicId(entry.id);
      setAmbientSound(entry.ambientValue);
      setIsHeaderMusicPlaying(true);
      return true;
    }

    if (entry.type === LIBRARY_MUSIC_SOURCE) {
      stopAmbient();
      if (ambientAudioRef?.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.currentTime = 0;
      }

      if (!audioRef.current) {
        return false;
      }

      try {
        if (currentEntry?.selectionId !== entry.selectionId) {
          const url = await resolveMusicSelectionUrl(entry.selectionId);
          if (!url) {
            return false;
          }
          audioRef.current.pause();
          audioRef.current.src = url;
        }

        audioRef.current.volume = ambientVolume ?? 0.3;
        audioRef.current.currentTime = startTime;
        await audioRef.current.play();
      } catch (error) {
        console.error('Play error:', error);
        return false;
      }

      currentPlayingIdRef.current = entry.id;
      currentPlayingEntryRef.current = entry;
      setSelectedMusicId(null);
      setAmbientSound(entry.ambientValue);
      setIsHeaderMusicPlaying(true);
      return true;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }

    releaseCurrentLibraryEntry();

    const soundFile = getSoundFile(entry.ambientValue);
    if (!soundFile) {
      return false;
    }

    stopAmbient();
    setAmbientSound(entry.ambientValue);
    startAmbient(soundFile, { loop: false });
    currentPlayingIdRef.current = null;
    currentPlayingEntryRef.current = entry;
    setIsHeaderMusicPlaying(true);
    return true;
  }, [ambientAudioRef, ambientVolume, ensureCustomMusicUrl, getCustomMusicUrl, getSoundFile, releaseCurrentLibraryEntry, releaseMusicSelectionUrl, resolveMusicSelectionUrl, setAmbientSound, startAmbient, stopAmbient]);

  const pauseCurrentPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (ambientAudioRef?.current) {
      ambientAudioRef.current.pause();
    }

    setIsHeaderMusicPlaying(false);
  }, [ambientAudioRef]);

  const clearCurrentPlaybackSelection = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    if (ambientAudioRef?.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }

    releaseCurrentLibraryEntry();
    currentPlayingIdRef.current = null;
    currentPlayingEntryRef.current = null;
    setIsHeaderMusicPlaying(false);
    setMusicCurrentTime(0);
    setMusicDuration(0);
    setAmbientSound('None');
    stopAmbient();
  }, [ambientAudioRef, releaseCurrentLibraryEntry, setAmbientSound, stopAmbient]);

  const stopCurrentPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (ambientAudioRef?.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }

    setIsHeaderMusicPlaying(false);
    setMusicCurrentTime(0);
    stopAmbient();
  }, [ambientAudioRef, stopAmbient]);

  const resumeCurrentEntryIfPossible = useCallback(async (entry) => {
    const currentEntry = currentPlayingEntryRef.current;
    if (!currentEntry || !entry || currentEntry.id !== entry.id || currentEntry.type !== entry.type) {
      return false;
    }

    if (entry.type === CUSTOM_MUSIC_SOURCE || entry.type === LIBRARY_MUSIC_SOURCE) {
      if (!audioRef.current?.src) {
        return false;
      }

      try {
        audioRef.current.volume = ambientVolume ?? 0.3;
        await audioRef.current.play();
        setIsHeaderMusicPlaying(true);
        return true;
      } catch (error) {
        console.error('Resume error:', error);
        return false;
      }
    }

    if (entry.type === BUILTIN_MUSIC_SOURCE) {
      if (!ambientAudioRef?.current?.src) {
        return false;
      }

      try {
        await ambientAudioRef.current.play();
        setIsHeaderMusicPlaying(true);
        return true;
      } catch (error) {
        console.error('Resume error:', error);
        return false;
      }
    }

    return false;
  }, [ambientAudioRef, ambientVolume]);

  const resumeSelectedAmbient = useCallback(async (ambientValue) => {
    if (!ambientValue || ambientValue === 'None') {
      return false;
    }

    const playlist = getMusicPlaylist();
    const entry = getPlaylistEntry(playlist, ambientValue);
    if (!entry) {
      return false;
    }

    const didResume = await resumeCurrentEntryIfPossible(entry);
    if (didResume) {
      return true;
    }

    return playMusicEntry(entry, {
      startTime: 0,
    });
  }, [getMusicPlaylist, playMusicEntry, resumeCurrentEntryIfPossible]);

  // Handle song end - auto-advance based on repeat mode
  const handleSongEnd = useCallback(async () => {
    const playlist = getMusicPlaylist();
    const currentEntry = getPlaylistEntry(playlist, ambientSound);

    if (headerMusicRepeatMode === 'repeat-one') {
      const didRestart = await playMusicEntry(currentEntry || playlist[0]);
      if (!didRestart) {
        setIsHeaderMusicPlaying(false);
      }
      return;
    }

    if (playlist.length === 0) {
      setIsHeaderMusicPlaying(false);
      return;
    }

    const nextEntry = getNextPlaylistEntry(
      playlist,
      currentEntry?.ambientValue || ambientSound,
      headerMusicRepeatMode,
    );

    const didPlay = await playMusicEntry(nextEntry);
    if (!didPlay) {
      setIsHeaderMusicPlaying(false);
    }
  }, [ambientSound, getMusicPlaylist, headerMusicRepeatMode, playMusicEntry]);

  const hasKnownMusicDuration = Number.isFinite(musicDuration) && musicDuration > 0;
  const musicProgressPercent = hasKnownMusicDuration
    ? Math.min(100, Math.max(0, (musicCurrentTime / musicDuration) * 100))
    : 0;
  const musicProgressWidth = musicProgressPercent > 0 ? `${Math.max(musicProgressPercent, 1)}%` : '0%';
  const showIndeterminateMusicProgress = isHeaderMusicPlaying && !hasKnownMusicDuration && musicCurrentTime > 0.5;
  const indeterminateProgressLeft = musicCurrentTime < 0.15
    ? '0%'
    : `${(Math.max(0, musicCurrentTime) * 18) % 78}%`;
  const repeatModeMeta = getRepeatModeMeta(headerMusicRepeatMode);

  const formatMusicTime = useCallback((value, options = {}) => {
    const allowUnknown = options.allowUnknown || false;
    if (!Number.isFinite(value) || value < 0) {
      return allowUnknown ? '--:--' : '0:00';
    }

    const mins = Math.floor(value / 60);
    const secs = String(Math.floor(value % 60)).padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  const selectAndPlayAmbientValue = useCallback(async (ambientValue) => {
    if (!ambientValue || ambientValue === 'None') {
      clearCurrentPlaybackSelection();
      return false;
    }

    const playlist = getMusicPlaylist();
    const entry = getPlaylistEntry(playlist, ambientValue);
    if (!entry) {
      return false;
    }

    return playMusicEntry(entry, { startTime: 0 });
  }, [clearCurrentPlaybackSelection, getMusicPlaylist, playMusicEntry]);

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

  // Keep progress in sync while a track is selected, even if paused.
  useEffect(() => {
    if (!ambientSound || ambientSound === 'None') {
      if (musicUpdateIntervalRef.current) {
        clearInterval(musicUpdateIntervalRef.current);
        musicUpdateIntervalRef.current = null;
      }
      syncMusicProgress();
      return;
    }

    syncMusicProgress();
    musicUpdateIntervalRef.current = setInterval(syncMusicProgress, 400);

    return () => {
      if (musicUpdateIntervalRef.current) {
        clearInterval(musicUpdateIntervalRef.current);
        musicUpdateIntervalRef.current = null;
      }
    };
  }, [ambientSound, syncMusicProgress]);

  // Dispatch music state to footer via custom event whenever state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('music-player-state', {
      detail: {
        isPlaying: isHeaderMusicPlaying,
        repeatMode: headerMusicRepeatMode,
        currentLabel: getAmbientTrackLabel(ambientSound),
        currentTime: musicCurrentTime,
        duration: musicDuration,
      }
    }));
  }, [ambientSound, getAmbientTrackLabel, headerMusicRepeatMode, isHeaderMusicPlaying, musicCurrentTime, musicDuration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = ambientVolume ?? 0.3;
    }
  }, [ambientVolume]);

  useEffect(() => () => {
    releaseCurrentLibraryEntry();
  }, [releaseCurrentLibraryEntry]);

  const stripExtension = (name) => {
    if (!name) return '';
    const idx = name.lastIndexOf('.');
    return idx > 0 ? name.slice(0, idx) : name;
  };

  // Skip to next song in the combined playlist
  const skipToNextSong = useCallback(async () => {
    const playlist = getMusicPlaylist();
    if (playlist.length === 0) {
      console.log('[SKIP] No sounds available');
      return;
    }

    const nextEntry = getNextPlaylistEntry(playlist, ambientSound);
    const didPlay = await playMusicEntry(nextEntry, { startTime: 0 });

    if (!didPlay) {
      console.log('[SKIP NEXT] Failed to play next entry');
    }
  }, [ambientSound, getMusicPlaylist, playMusicEntry]);

  // Skip to previous song in the combined playlist
  const skipToPreviousSong = useCallback(async () => {
    const playlist = getMusicPlaylist();
    if (playlist.length === 0) {
      console.log('[SKIP] No sounds available');
      return;
    }

    const previousEntry = getPreviousPlaylistEntry(playlist, ambientSound);
    const didPlay = await playMusicEntry(previousEntry, { startTime: 0 });

    if (!didPlay) {
      console.log('[SKIP PREV] Failed to play previous entry');
    }
  }, [ambientSound, getMusicPlaylist, playMusicEntry]);

  // Register global music player controls so MusicPlayerFooter can call them
  useEffect(() => {
    const playPause = async () => {
      if (isHeaderMusicPlaying) {
        pauseCurrentPlayback();
        return;
      }

      await resumeSelectedAmbient(ambientSound);
    };

    window.__musicPlayerControls = {
      playPause,
      stop: stopCurrentPlayback,
      skipNext: skipToNextSong,
      skipPrev: skipToPreviousSong,
      setRepeatMode: setHeaderMusicRepeatMode,
      seekToPercent: seekMusicToPercent,
    };

    return () => {
      window.__musicPlayerControls = null;
    };
  }, [
    ambientAudioRef,
    ambientSound,
    getMusicPlaylist,
    isHeaderMusicPlaying,
    pauseCurrentPlayback,
    resumeSelectedAmbient,
    seekMusicToPercent,
    setHeaderMusicRepeatMode,
    skipToNextSong,
    skipToPreviousSong,
    stopCurrentPlayback,
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

  const handleRefreshMusicSources = useCallback(async () => {
    try {
      await refreshMusicLibrary();
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Music sources refreshed.', type: 'success', ttl: 2500 }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to refresh music sources: ${error.message}`, type: 'error', ttl: 3500 }
      }));
    }
  }, [refreshMusicLibrary]);

  const handleConnectRemoteMusicSource = useCallback(async (sourceInput) => {
    try {
      const source = await addRemoteMusicSource(sourceInput);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `Connected remote music source: ${source.name}`, type: 'success', ttl: 3000 }
      }));
      return source;
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to connect remote music source: ${error.message}`, type: 'error', ttl: 3500 }
      }));
      throw error;
    }
  }, [addRemoteMusicSource]);

  const handleAddLocalMusicSource = useCallback(async () => {
    if (!supportsLocalMusicFolders || typeof window.showDirectoryPicker !== 'function') {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Local folders need a compatible browser with File System Access support.', type: 'error', ttl: 3500 }
      }));
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker();
      const source = await addLocalMusicSource(directoryHandle, {
        name: `${directoryHandle.name} music`,
      });
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `Connected local music folder: ${source.name}`, type: 'success', ttl: 3000 }
      }));
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }

      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to connect local music folder: ${error.message}`, type: 'error', ttl: 3500 }
      }));
    }
  }, [addLocalMusicSource, supportsLocalMusicFolders]);

  const handleDeleteMusicSource = useCallback(async (sourceId) => {
    try {
      await deleteMusicSource(sourceId);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Music source removed.', type: 'success', ttl: 2500 }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to remove music source: ${error.message}`, type: 'error', ttl: 3500 }
      }));
    }
  }, [deleteMusicSource]);

  const handleAddMusicLibrarySelection = useCallback((asset) => {
    addMusicSelection(asset);
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { message: `Added to music queue: ${asset.name}`, type: 'success', ttl: 2200 }
    }));
  }, [addMusicSelection]);

  const handleRemoveMusicLibrarySelection = useCallback((selectionId) => {
    const selection = musicSelections.find((item) => item.selectionId === selectionId);
    removeMusicSelection(selectionId);
    if (ambientSound === `library_${selectionId}`) {
      clearCurrentPlaybackSelection();
    }
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { message: selection ? `Removed from queue: ${selection.name}` : 'Track removed from queue', type: 'success', ttl: 2200 }
    }));
  }, [ambientSound, clearCurrentPlaybackSelection, musicSelections, removeMusicSelection]);

  const handleMoveMusicLibrarySelection = useCallback((fromIndex, toIndex) => {
    reorderMusicSelection(fromIndex, toIndex);
  }, [reorderMusicSelection]);

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
    {showMusicLibraryModal && (
      <MusicLibraryModal
        theme={theme}
        getTextOpacity={getTextOpacity}
        onClose={() => setShowMusicLibraryModal(false)}
        customMusicFiles={customMusicFiles}
        sources={musicSources}
        sourceStatuses={musicSourceStatuses}
        availableAssets={availableMusicAssets}
        selectedQueue={musicSelections}
        onUploadCustomMusic={uploadCustomMusic}
        onAddRemoteSource={handleConnectRemoteMusicSource}
        onAddLocalSource={handleAddLocalMusicSource}
        onRefreshSources={handleRefreshMusicSources}
        onRemoveSource={handleDeleteMusicSource}
        onAddSelection={handleAddMusicLibrarySelection}
        onRemoveSelection={handleRemoveMusicLibrarySelection}
        onMoveSelection={handleMoveMusicLibrarySelection}
        getSelectionStatus={getMusicSelectionStatus}
        supportsLocalFolders={supportsLocalMusicFolders}
      />
    )}
    {showSupportModal && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: 16,
        }}
        onClick={() => setShowSupportModal(false)}
      >
        <div
          style={{
            background: theme.card,
            borderRadius: theme.borderRadius,
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: 460,
            width: '100%',
            padding: 20,
            boxShadow: '0 18px 40px rgba(0,0,0,0.4)'
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, color: theme.text, fontSize: 18, fontWeight: 700 }}>Support This App</h3>
              <p style={{ margin: '6px 0 0', color: getTextOpacity(theme, 0.65), fontSize: 13 }}>
                Buy a beer and keep development moving.
              </p>
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              style={{
                border: 'none',
                background: 'transparent',
                color: getTextOpacity(theme, 0.7),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.65), marginBottom: 8 }}>Choose payment method</div>
            <select
              value={configuredPaymentOptions.length ? selectedPaymentOptionId : ''}
              onChange={(event) => setSelectedPaymentOptionId(event.target.value)}
              disabled={!configuredPaymentOptions.length}
              style={{
                width: '100%',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: theme.borderRadius,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.04)',
                color: theme.text,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                opacity: configuredPaymentOptions.length ? 1 : 0.7,
              }}
            >
              {configuredPaymentOptions.length > 0 ? (
                configuredPaymentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))
              ) : (
                <option value="">No payment method configured</option>
              )}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.65), marginBottom: 8 }}>Choose amount</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {SUPPORT_DEFAULT_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  style={{
                    border: selectedAmount === amount && !customAmount ? `1px solid ${theme.accent}` : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: theme.borderRadius,
                    padding: '8px 12px',
                    background: selectedAmount === amount && !customAmount ? `${theme.accent}24` : 'rgba(255,255,255,0.03)',
                    color: theme.text,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              placeholder="Custom amount (USD)"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              style={{
                width: '100%',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: theme.borderRadius,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.04)',
                color: theme.text,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <p style={{ margin: '0 0 12px', color: getTextOpacity(theme, 0.62), fontSize: 12 }}>
            Selected provider: <strong style={{ color: theme.text }}>{selectedPaymentProvider}</strong>
          </p>

          <p style={{ margin: '0 0 12px', color: getTextOpacity(theme, 0.58), fontSize: 12, lineHeight: 1.4 }}>
            To enable thank-you handling after payment, configure your provider success/cancel redirect URLs to include query params like ?support=success&amount=5 or ?support=cancel.
          </p>

          <button
            onClick={openSupportCheckout}
            disabled={!isPaymentOptionConfigured}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: theme.borderRadius,
              padding: '12px 14px',
              background: isPaymentOptionConfigured ? theme.accent : 'rgba(255,255,255,0.16)',
              color: '#ffffff',
              cursor: isPaymentOptionConfigured ? 'pointer' : 'not-allowed',
              fontSize: 14,
              fontWeight: 700,
              opacity: isPaymentOptionConfigured ? 1 : 0.7,
            }}
            title="Open payment page"
          >
            Continue with ${resolvedSupportAmount.toFixed(2)}
          </button>
        </div>
      </div>
    )}
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

        <button
          onClick={() => setShowSupportModal(true)}
          style={{
            border: 'none',
            borderRadius: theme.borderRadius,
            padding: 10,
            background: 'transparent',
            color: '#f59e0b',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(245,158,11,0.18)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          title="Support developers"
          aria-label="Support developers"
        >
          <span role="img" aria-hidden="true">🍺</span>
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
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <Search
                        size={14}
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: getTextOpacity(theme, 0.45)
                        }}
                      />
                      <input
                        aria-label="Search scenes"
                        value={weatherSceneSearch}
                        onChange={(event) => setWeatherSceneSearch(event.target.value)}
                        placeholder="Search scenes"
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                          borderRadius: theme.borderRadius,
                          padding: '10px 36px 10px 36px',
                          color: theme.text,
                          fontSize: 13,
                          outline: 'none'
                        }}
                      />
                      {weatherSceneSearch && (
                        <button
                          type="button"
                          aria-label="Clear scene search"
                          onClick={() => setWeatherSceneSearch('')}
                          style={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            color: getTextOpacity(theme, 0.55),
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 4
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <div
                      role="group"
                      aria-label="Scene art directions"
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginBottom: 8,
                      }}
                    >
                      {[{ id: 'all', label: 'All' }, ...WEATHER_ART_DIRECTIONS].map((artDirection) => {
                        const isActive = activeWeatherArtDirection === artDirection.id;
                        const count = weatherEffectArtDirectionCounts[artDirection.id] || 0;

                        return (
                          <button
                            key={artDirection.id}
                            type="button"
                            aria-label={`Filter scenes by ${artDirection.label}`}
                            onClick={() => setActiveWeatherArtDirection(artDirection.id)}
                            style={{
                              border: 'none',
                              borderRadius: 999,
                              padding: '6px 10px',
                              background: isActive ? theme.accent : 'rgba(255,255,255,0.06)',
                              color: isActive ? '#fff' : theme.text,
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all 0.2s'
                            }}
                          >
                            <span>{artDirection.label}</span>
                            <span style={{ opacity: isActive ? 0.86 : 0.6 }}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      fontSize: 10,
                      color: getTextOpacity(theme, 0.42),
                      marginBottom: 8,
                      paddingLeft: 2,
                      paddingRight: 2
                    }}>
                      <span>{filteredWeatherSceneData.resultCount} scene{filteredWeatherSceneData.resultCount === 1 ? '' : 's'}</span>
                      <span>{activeWeatherArtDirection === 'all' ? 'All directions' : getWeatherArtDirectionLabel(activeWeatherArtDirection)}</span>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      maxHeight: 340,
                      overflowY: 'auto',
                      padding: 4
                    }}>
                      {filteredWeatherSceneData.favoriteEffects.length > 0 && (
                        <div>
                          <div style={{
                            fontSize: 10,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: getTextOpacity(theme, 0.42),
                            marginBottom: 6,
                            paddingLeft: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <Star size={11} fill="currentColor" />
                            Favorites
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 6
                          }}>
                            {filteredWeatherSceneData.favoriteEffects.map(renderWeatherEffectCard)}
                          </div>
                        </div>
                      )}
                      {filteredWeatherSceneData.groupedEffects.map((group) => (
                        <div key={group.id}>
                          <div style={{
                            fontSize: 10,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: getTextOpacity(theme, 0.42),
                            marginBottom: 6,
                            paddingLeft: 2
                          }}>
                            {group.label}
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 6
                          }}>
                            {group.effects.map(renderWeatherEffectCard)}
                          </div>
                        </div>
                      ))}
                      {!filteredWeatherSceneData.hasResults && (
                        <div style={{
                          border: `1px dashed ${getTextOpacity(theme, 0.16)}`,
                          borderRadius: theme.borderRadius,
                          padding: '16px 14px',
                          color: getTextOpacity(theme, 0.6),
                          background: 'rgba(255,255,255,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          alignItems: 'flex-start'
                        }}>
                          <span>No scenes match this search.</span>
                          <button
                            type="button"
                            onClick={() => setWeatherSceneSearch('')}
                            style={{
                              border: 'none',
                              borderRadius: theme.borderRadius,
                              padding: '8px 10px',
                              background: 'rgba(255,255,255,0.08)',
                              color: theme.text,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 500
                            }}
                          >
                            Clear search
                          </button>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: getTextOpacity(theme, 0.4), marginTop: 6 }}>
                      Choose a motion language for your timer sessions
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5) }}>Music & Ambient Sources</label>
                      </div>
                      {/* Global Action Buttons for Custom Music */}
                      <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setShowMusicLibraryModal(true)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: theme.borderRadius, background: 'rgba(255,255,255,0.05)', color: theme.text, cursor: 'pointer', border: `1px solid ${getTextOpacity(theme, 0.2)}` }}
                          title="Open music uploads"
                          aria-label="Open music uploads"
                        >
                          <Upload size={14} />
                        </button>

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
                      maxHeight: 260,
                      overflowY: 'auto'
                    }} ref={soundListRef}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: getTextOpacity(theme, 0.45), textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 2px 0' }}>
                        Built-in ambience
                      </div>
                      {/* Built-in ambient sounds */}
                      {AMBIENT_SOUNDS.map(sound => (
                        <button
                          ref={ambientSound === sound.name ? selectedSoundButtonRef : null}
                          key={sound.name}
                          onClick={async () => {
                            setSelectedMusicId(null);
                            await selectAndPlayAmbientValue(sound.name);
                          }}
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
                      <div style={{ fontSize: 10, fontWeight: 700, color: getTextOpacity(theme, 0.45), textTransform: 'uppercase', letterSpacing: '0.04em', padding: '8px 2px 0 2px' }}>
                        Library music
                      </div>
                      {libraryMusicEntries.length === 0 && (
                        <div style={{
                          borderRadius: theme.borderRadius,
                          padding: '10px 12px',
                          fontSize: 11,
                          color: getTextOpacity(theme, 0.45),
                          background: 'rgba(255,255,255,0.04)',
                        }}>
                          No library tracks yet. Use Manage Library to upload music or build the library queue.
                        </div>
                      )}
                      {libraryMusicEntries.map((entry) => {
                        const isSelected = ambientSound === entry.ambientValue;
                        const badgeBackground = isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)';
                        const badgeColor = isSelected
                          ? '#fff'
                          : entry.isReady
                            ? getTextOpacity(theme, 0.58)
                            : '#fca5a5';

                        return (
                          <button
                            ref={isSelected ? selectedSoundButtonRef : null}
                            key={entry.key}
                            onClick={async () => {
                              if (!entry.isReady) {
                                return;
                              }

                              setSelectedMusicId(entry.type === CUSTOM_MUSIC_SOURCE ? entry.fileId : null);
                              await selectAndPlayAmbientValue(entry.ambientValue);
                            }}
                            disabled={!entry.isReady}
                            style={{
                              background: isSelected ? theme.accent : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                              borderRadius: theme.borderRadius,
                              padding: '8px 12px',
                              color: isSelected ? '#fff' : entry.isReady ? theme.text : getTextOpacity(theme, 0.4),
                              cursor: entry.isReady ? 'pointer' : 'not-allowed',
                              fontSize: 12,
                              textAlign: 'left',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              opacity: entry.isReady ? 1 : 0.65,
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                              {isSelected && <Check size={12} color="#fff" />}
                              <span>🎵 {truncate(entry.name, 24)}</span>
                            </span>
                            <span style={{
                              flexShrink: 0,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '3px 6px',
                              borderRadius: 999,
                              background: badgeBackground,
                              color: badgeColor,
                              textTransform: 'uppercase',
                            }}>
                              {entry.badgeLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Music Playback Controls */}
                  {(customMusicFiles.length > 0 || musicSelections.length > 0 || AMBIENT_SOUNDS.filter(s => s.name !== 'None').length > 0) && (
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
                          seekMusicToPercent(percent);
                        }}>
                          {hasKnownMusicDuration ? (
                            <div style={{
                              height: '100%',
                              width: musicProgressWidth,
                              background: theme.accent,
                              transition: 'width 0.2s ease-out'
                            }} />
                          ) : showIndeterminateMusicProgress ? (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: indeterminateProgressLeft,
                              height: '100%',
                              width: '22%',
                              background: `${theme.accent}cc`,
                              transition: 'left 0.35s linear'
                            }} />
                          ) : null}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: getTextOpacity(theme, 0.6) }}>
                          <span>{formatMusicTime(musicCurrentTime)}</span>
                          <span>{formatMusicTime(musicDuration, { allowUnknown: true })}</span>
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
                            if (isHeaderMusicPlaying) {
                              pauseCurrentPlayback();
                              return;
                            }

                            await resumeSelectedAmbient(ambientSound);
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
                          onClick={stopCurrentPlayback}
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
                          title={repeatModeMeta.title}
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
                          {repeatModeMeta.icon}
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

                      <div style={{
                        textAlign: 'center',
                        marginTop: 6,
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        color: headerMusicRepeatMode === 'sequential' ? getTextOpacity(theme, 0.55) : theme.accent,
                      }}>
                        Mode: {repeatModeMeta.label}
                      </div>
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
                  releaseBackgroundImageUrl={releaseBackgroundImageUrl}
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
                  releaseBackgroundVideoUrl={releaseBackgroundVideoUrl}
                  uploadBackgroundVideo={uploadBackgroundVideo}
                  deleteBackgroundVideo={deleteBackgroundVideo}
                  remoteBackgroundVideoSources={remoteBackgroundVideoSources}
                  remoteBackgroundVideoSourceStatuses={remoteBackgroundVideoSourceStatuses}
                  addRemoteBackgroundVideoSource={addRemoteBackgroundVideoSource}
                  deleteRemoteBackgroundVideoSource={deleteRemoteBackgroundVideoSource}
                  refreshRemoteBackgroundVideos={refreshRemoteBackgroundVideos}
                  videoLoopFade={videoLoopFade}
                  setVideoLoopFade={setVideoLoopFade}
                  videoAudioEnabled={videoAudioEnabled}
                  setVideoAudioEnabled={setVideoAudioEnabled}
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
              Adjust element visibility. 100% means fully visible. Current: {Math.round(normalizedThemeOpacity * 100)}%
            </p>

            {/* Opacity Slider */}
            <div style={{ marginBottom: 24 }}>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(normalizedThemeOpacity * 100)}
                onChange={(e) => handleThemeOpacityChange(e.target.value)}
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
                <span>Hidden</span>
                <span>50%</span>
                <span>Visible</span>
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
                  onClick={() => setThemeOpacity(Math.min(1, Math.max(0, preset.value)))}
                  style={{
                    background: Math.abs(normalizedThemeOpacity - preset.value) < 0.01 ? theme.accent : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                    borderRadius: theme.borderRadius,
                    padding: '10px 12px',
                    color: Math.abs(normalizedThemeOpacity - preset.value) < 0.01 ? getTextOpacity(theme, 1) : theme.text,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (Math.abs(normalizedThemeOpacity - preset.value) >= 0.01) {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (Math.abs(normalizedThemeOpacity - preset.value) >= 0.01) {
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

    <audio
      ref={audioRef}
      data-testid="header-audio-player"
      onEnded={handleSongEnd}
      preload="auto"
      playsInline
      style={{ display: 'none' }}
    />

    {/* Music Mini-Player — floating bar at bottom while a track remains selected */}
    {ambientSound && ambientSound !== 'None' && (
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
            {getAmbientTrackLabel(ambientSound)}
          </div>
          <div style={{ fontSize: 10, color: `${theme.text}80`, marginTop: 1 }}>
            {formatMusicTime(musicCurrentTime)} / {formatMusicTime(musicDuration, { allowUnknown: true })}
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, cursor: hasKnownMusicDuration ? 'pointer' : 'default', flexShrink: 0, position: 'relative', overflow: 'hidden' }}
          onClick={(e) => {
            if (!hasKnownMusicDuration) {
              return;
            }
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seekMusicToPercent(percent);
          }}
        >
          {hasKnownMusicDuration ? (
            <div style={{ height: '100%', width: musicProgressWidth, background: theme.accent, borderRadius: 2, transition: 'width 0.2s ease-out' }} />
          ) : showIndeterminateMusicProgress ? (
            <div style={{ position: 'absolute', top: 0, left: indeterminateProgressLeft, height: '100%', width: '22%', background: `${theme.accent}cc`, transition: 'left 0.35s linear' }} />
          ) : null}
        </div>

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
              pauseCurrentPlayback();
            } else {
              await resumeSelectedAmbient(ambientSound);
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

        <div
          onMouseEnter={() => setIsFooterVolumeVisible(true)}
          onMouseLeave={() => setIsFooterVolumeVisible(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isFooterVolumeVisible ? 8 : 0,
            flexShrink: 0,
            padding: isFooterVolumeVisible ? '0 8px' : 0,
            borderRadius: 999,
            background: isFooterVolumeVisible ? 'rgba(255,255,255,0.08)' : 'transparent',
            transition: 'all 0.2s ease',
            overflow: 'hidden',
            minWidth: isFooterVolumeVisible ? 166 : 34,
            justifyContent: 'flex-end',
          }}
          title="Music volume"
        >
          <button
            type="button"
            aria-label="Toggle music volume controls"
            onFocus={() => setIsFooterVolumeVisible(true)}
            onBlur={() => setIsFooterVolumeVisible(false)}
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
            {(ambientVolume ?? 0.3) > 0 ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {isFooterVolumeVisible && (
            <>
              <input
                aria-label="Music volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ambientVolume ?? 0.3}
                onChange={(event) => setAmbientVolume(parseFloat(event.target.value))}
                style={{
                  width: 84,
                  accentColor: theme.accent,
                  cursor: 'pointer',
                }}
              />
              <div style={{
                minWidth: 38,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 700,
                color: theme.text,
                opacity: 0.88,
              }}>
                {Math.round((ambientVolume ?? 0.3) * 100)}%
              </div>
            </>
          )}
        </div>

        {/* Stop */}
        <button
          onClick={stopCurrentPlayback}
          title="Stop music"
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
          <Square size={14} fill="currentColor" />
        </button>

        <button
          onClick={clearCurrentPlaybackSelection}
          title="Close player"
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
            color: `${theme.text}80`,
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
          title={repeatModeMeta.title}
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