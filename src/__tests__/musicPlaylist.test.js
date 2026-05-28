import {
  BUILTIN_MUSIC_SOURCE,
  CUSTOM_MUSIC_SOURCE,
  LIBRARY_MUSIC_SOURCE,
  buildMusicPlaylist,
  getNextPlaylistEntry,
  getPreviousPlaylistEntry,
} from '../utils/musicPlaylist';

describe('musicPlaylist', () => {
  const ambientSounds = [
    { name: 'None', file: null },
    { name: 'TimerApp Track 1', file: '/sounds/one.wav' },
    { name: 'TimerApp Track 2', file: '/sounds/two.wav' },
  ];

  const customMusicFiles = [
    { id: 'upload-1', name: 'My Upload 1.mp3' },
    { id: 'upload-2', name: 'My Upload 2.mp3' },
  ];

  const musicSelections = [
    { selectionId: 'queue-1', name: 'Focus Loop' },
    { selectionId: 'queue-2', name: 'Ocean Wave' },
  ];

  it('builds one merged playlist in the same order as the picker', () => {
    expect(buildMusicPlaylist(ambientSounds, customMusicFiles, musicSelections)).toEqual([
      { id: 'TimerApp Track 1', ambientValue: 'TimerApp Track 1', type: BUILTIN_MUSIC_SOURCE },
      { id: 'TimerApp Track 2', ambientValue: 'TimerApp Track 2', type: BUILTIN_MUSIC_SOURCE },
      { id: 'queue-1', selectionId: 'queue-1', ambientValue: 'library_queue-1', type: LIBRARY_MUSIC_SOURCE },
      { id: 'queue-2', selectionId: 'queue-2', ambientValue: 'library_queue-2', type: LIBRARY_MUSIC_SOURCE },
      { id: 'upload-1', ambientValue: 'custom_upload-1', type: CUSTOM_MUSIC_SOURCE },
      { id: 'upload-2', ambientValue: 'custom_upload-2', type: CUSTOM_MUSIC_SOURCE },
    ]);
  });

  it('moves from built-in tracks into uploaded tracks and back again', () => {
    const playlist = buildMusicPlaylist(ambientSounds, customMusicFiles, musicSelections);

    expect(getNextPlaylistEntry(playlist, 'TimerApp Track 2')?.ambientValue).toBe('library_queue-1');
    expect(getPreviousPlaylistEntry(playlist, 'library_queue-1')?.ambientValue).toBe('TimerApp Track 2');
  });

  it('wraps across the combined playlist edges', () => {
    const playlist = buildMusicPlaylist(ambientSounds, customMusicFiles, musicSelections);

    expect(getNextPlaylistEntry(playlist, 'custom_upload-2')?.ambientValue).toBe('TimerApp Track 1');
    expect(getPreviousPlaylistEntry(playlist, 'TimerApp Track 1')?.ambientValue).toBe('custom_upload-2');
  });

  it('falls back to the start or end when nothing is currently selected', () => {
    const playlist = buildMusicPlaylist(ambientSounds, customMusicFiles, musicSelections);

    expect(getNextPlaylistEntry(playlist, 'None')?.ambientValue).toBe('TimerApp Track 1');
    expect(getPreviousPlaylistEntry(playlist, 'None')?.ambientValue).toBe('custom_upload-2');
  });
});