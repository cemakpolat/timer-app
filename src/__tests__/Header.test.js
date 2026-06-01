import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Header from '../components/Header';
import { ModalProvider } from '../context/ModalContext';

const theme = {
  card: '#111827',
  text: '#f9fafb',
  accent: '#22c55e',
  borderRadius: 12,
};

beforeEach(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

function createProps(overrides = {}) {
  return {
    theme,
    themeOpacity: 1,
    setThemeOpacity: jest.fn(),
    onShowInfo: jest.fn(),
    onShowAchievements: jest.fn(),
    onShowFeedback: jest.fn(),
    onShowSettings: jest.fn(),
    onShowWorldClocks: jest.fn(),
    showSettings: true,
    setShowSettings: jest.fn(),
    settingsView: 'sound',
    setSettingsView: jest.fn(),
    cleanMode: false,
    toggleCleanMode: jest.fn(),
    themes: [],
    setTheme: jest.fn(),
    setEditingTheme: jest.fn(),
    setShowColorPicker: jest.fn(),
    alarmVolume: 0.5,
    setAlarmVolume: jest.fn(),
    ambientVolume: 0.3,
    setAmbientVolume: jest.fn(),
    getTextOpacity: (_theme, opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    weatherEffect: 'none',
    setWeatherEffect: jest.fn(),
    weatherEffectFavorites: [],
    setWeatherEffectFavorites: jest.fn(),
    SCENES: [],
    AMBIENT_SOUNDS: [{ name: 'None' }],
    ambientSound: 'None',
    setAmbientSound: jest.fn(),
    setEditingWeather: jest.fn(),
    customMusicFiles: [],
    musicSelections: [],
    musicSources: [],
    musicSourceStatuses: [],
    availableMusicAssets: [],
    addRemoteMusicSource: jest.fn(),
    addLocalMusicSource: jest.fn(),
    deleteMusicSource: jest.fn(),
    refreshMusicLibrary: jest.fn(),
    addMusicSelection: jest.fn(),
    removeMusicSelection: jest.fn(),
    reorderMusicSelection: jest.fn(),
    resolveMusicSelectionUrl: jest.fn(),
    releaseMusicSelectionUrl: jest.fn(),
    getMusicSelectionStatus: jest.fn(() => 'ready'),
    supportsLocalMusicFolders: true,
    uploadCustomMusic: jest.fn(),
    deleteCustomMusic: jest.fn(),
    getCustomMusicUrl: jest.fn(),
    ensureCustomMusicUrl: jest.fn(),
    getSoundFile: jest.fn(),
    renameCustomMusic: jest.fn(),
    startAmbient: jest.fn(),
    stopAmbient: jest.fn(),
    ambientAudioRef: { current: null },
    selectedBackgroundId: null,
    setSelectedBackgroundId: jest.fn(),
    getAllBackgroundImages: jest.fn(() => []),
    getBackgroundImageUrl: jest.fn(),
    releaseBackgroundImageUrl: jest.fn(),
    uploadBackgroundImage: jest.fn(),
    deleteBackgroundImage: jest.fn(),
    remoteBackgroundImageSources: [],
    remoteBackgroundImageSourceStatuses: [],
    addRemoteBackgroundImageSource: jest.fn(),
    deleteRemoteBackgroundImageSource: jest.fn(),
    refreshRemoteBackgroundImages: jest.fn(),
    slideSets: [],
    activeSlideSetId: null,
    createSlideSet: jest.fn(),
    deleteSlideSet: jest.fn(),
    renameSlideSet: jest.fn(),
    setSlideInterval: jest.fn(),
    setSlideTransition: jest.fn(),
    addImageToSet: jest.fn(),
    addVideoToSet: jest.fn(),
    removeImageFromSet: jest.fn(),
    removeMediaItemFromSet: jest.fn(),
    setActiveSlideSetId: jest.fn(),
    selectedVideoId: null,
    setSelectedVideoId: jest.fn(),
    getAllBackgroundVideos: jest.fn(() => []),
    getBackgroundVideoUrl: jest.fn(),
    releaseBackgroundVideoUrl: jest.fn(),
    uploadBackgroundVideo: jest.fn(),
    deleteBackgroundVideo: jest.fn(),
    remoteBackgroundVideoSources: [],
    remoteBackgroundVideoSourceStatuses: [],
    addRemoteBackgroundVideoSource: jest.fn(),
    deleteRemoteBackgroundVideoSource: jest.fn(),
    refreshRemoteBackgroundVideos: jest.fn(),
    breakReminderSettings: { enabled: false, suppressDuringTimer: false },
    updateBreakReminderSettings: jest.fn(),
    toggleBreakReminders: jest.fn(),
    toggleBreakReminder: jest.fn(),
    setBreakReminderInterval: jest.fn(),
    notificationsGranted: false,
    requestNotificationPermission: jest.fn(),
    BREAK_REMINDERS: [],
    timerVisualization: 'ring',
    setTimerVisualization: jest.fn(),
    customBorderRadius: 12,
    setCustomBorderRadius: jest.fn(),
    ...overrides,
  };
}

function renderHeader(overrides = {}) {
  const props = createProps(overrides);

  return render(
    <ModalProvider theme={theme}>
      <Header {...props} />
    </ModalProvider>
  );
}

test('keeps the playback audio element mounted after closing settings', () => {
  const { rerender } = renderHeader();

  expect(screen.getByTestId('header-audio-player')).toBeInTheDocument();

  rerender(
    <ModalProvider theme={theme}>
      <Header {...createProps({ showSettings: false, settingsView: 'main' })} />
    </ModalProvider>
  );

  expect(screen.getByTestId('header-audio-player')).toBeInTheDocument();
});

test('keeps library playback active after closing the settings panel', async () => {
  const playSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  const pauseSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const resolveMusicSelectionUrl = jest.fn().mockResolvedValue('blob:local-track');
  const selection = {
    selectionId: 'sel-1',
    sourceId: 'local-source',
    sourceType: 'local-folder',
    name: 'Local Loop',
  };

  const { rerender } = renderHeader({
    ambientSound: 'library_sel-1',
    musicSelections: [selection],
    resolveMusicSelectionUrl,
  });

  fireEvent.click(screen.getByTitle('Play music'));

  await waitFor(() => expect(resolveMusicSelectionUrl).toHaveBeenCalledWith('sel-1'));
  await waitFor(() => expect(playSpy).toHaveBeenCalled());

  const pauseCallsBeforeClose = pauseSpy.mock.calls.length;

  rerender(
    <ModalProvider theme={theme}>
      <Header
        {...createProps({
          showSettings: false,
          settingsView: 'main',
          ambientSound: 'library_sel-1',
          musicSelections: [selection],
          resolveMusicSelectionUrl,
        })}
      />
    </ModalProvider>
  );

  const audioElement = screen.getByTestId('header-audio-player');
  expect(audioElement).toBeInTheDocument();
  expect(audioElement.src).toContain('blob:local-track');
  expect(pauseSpy).toHaveBeenCalledTimes(pauseCallsBeforeClose);
  expect(screen.getByText('Local Loop')).toBeInTheDocument();

  playSpy.mockRestore();
  pauseSpy.mockRestore();
});

test('opens the music modal from the sound panel upload icon', () => {
  renderHeader();

  fireEvent.click(screen.getByRole('button', { name: /open music uploads/i }));

  expect(screen.getByText('Music Library')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /library/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /connections/i })).toBeInTheDocument();
});

test('shows uploaded tracks and library selections in one combined music section', () => {
  renderHeader({
    customMusicFiles: [{ id: 'custom-1', name: 'Uploaded Breeze' }],
    musicSelections: [{
      selectionId: 'sel-1',
      sourceId: 'remote-1',
      sourceType: 'remote',
      name: 'Cloud Loop',
    }],
  });

  expect(screen.getByText('Library music')).toBeInTheDocument();
  expect(screen.queryByText('Saved music queue')).not.toBeInTheDocument();
  expect(screen.queryByText('Uploaded tracks')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /cloud loop/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /uploaded breeze/i })).toBeInTheDocument();
});

test('starts playback immediately when selecting a different uploaded track', async () => {
  const playSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  const pauseSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const ensureCustomMusicUrl = jest.fn().mockResolvedValue('blob:uploaded-track');

  renderHeader({
    customMusicFiles: [{ id: 'custom-1', name: 'Uploaded Breeze' }],
    ensureCustomMusicUrl,
  });

  fireEvent.click(screen.getByRole('button', { name: /uploaded breeze/i }));

  await waitFor(() => expect(ensureCustomMusicUrl).toHaveBeenCalledWith('custom-1'));
  await waitFor(() => expect(playSpy).toHaveBeenCalled());

  playSpy.mockRestore();
  pauseSpy.mockRestore();
});

test('reveals and updates the bottom player volume control on hover', async () => {
  const playSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  const pauseSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const ensureCustomMusicUrl = jest.fn().mockResolvedValue('blob:volume-track');
  const setAmbientVolume = jest.fn();

  renderHeader({
    ambientSound: 'custom_custom-1',
    customMusicFiles: [{ id: 'custom-1', name: 'Volume Track' }],
    ensureCustomMusicUrl,
    setAmbientVolume,
    ambientVolume: 0.3,
  });

  fireEvent.click(screen.getByTitle('Play music'));

  await waitFor(() => expect(playSpy).toHaveBeenCalled());
  const musicVolumeButton = await screen.findByTitle('Music volume');

  fireEvent.mouseEnter(musicVolumeButton);

  expect(screen.getByLabelText('Music volume')).toBeInTheDocument();
  expect(screen.getByText('30%')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Music volume'), { target: { value: '0.65' } });
  expect(setAmbientVolume).toHaveBeenCalledWith(0.65);

  playSpy.mockRestore();
  pauseSpy.mockRestore();
});

test('shows favorite scenes first and toggles favorites from the weather picker', () => {
  const setWeatherEffectFavorites = jest.fn();

  renderHeader({
    settingsView: 'weather',
    weatherEffectFavorites: ['matrix'],
    setWeatherEffectFavorites,
  });

  expect(screen.getByText('Favorites')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /remove matrix from favorite scenes/i }));

  expect(setWeatherEffectFavorites).toHaveBeenCalledTimes(1);
  const updateFavorites = setWeatherEffectFavorites.mock.calls[0][0];
  expect(updateFavorites(['matrix', 'mist'])).toEqual(['mist']);
});

test('filters weather scenes with search and exposes a no-results state', () => {
  renderHeader({ settingsView: 'weather' });

  fireEvent.change(screen.getByLabelText('Search scenes'), { target: { value: 'neon grid' } });

  expect(screen.getByText('Neon Grid')).toBeInTheDocument();
  expect(screen.queryByText('Matrix')).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Search scenes'), { target: { value: 'zzzz' } });

  expect(screen.getByText('No scenes match this search.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByLabelText('Search scenes')).toHaveValue('');
});

test('filters weather scenes by art direction chips', () => {
  renderHeader({ settingsView: 'weather' });

  fireEvent.click(screen.getByRole('button', { name: 'Filter scenes by Gallery' }));

  expect(screen.getByText('Watercolor Bloom')).toBeInTheDocument();
  expect(screen.queryByText('Rain')).not.toBeInTheDocument();
});