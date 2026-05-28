export const BUILTIN_MUSIC_SOURCE = 'builtin';
export const CUSTOM_MUSIC_SOURCE = 'custom';
export const LIBRARY_MUSIC_SOURCE = 'library';

export const buildMusicPlaylist = (ambientSounds = [], customMusicFiles = [], musicSelections = []) => [
  ...ambientSounds
    .filter((sound) => sound?.name && sound.name !== 'None')
    .map((sound) => ({
      id: sound.name,
      ambientValue: sound.name,
      type: BUILTIN_MUSIC_SOURCE,
    })),
  ...musicSelections
    .filter((selection) => selection?.selectionId)
    .map((selection) => ({
      id: selection.selectionId,
      selectionId: selection.selectionId,
      ambientValue: `library_${selection.selectionId}`,
      type: LIBRARY_MUSIC_SOURCE,
    })),
  ...customMusicFiles
    .filter((file) => file?.id)
    .map((file) => ({
      id: file.id,
      ambientValue: `custom_${file.id}`,
      type: CUSTOM_MUSIC_SOURCE,
    })),
];

export const findPlaylistIndex = (playlist = [], ambientSound) => (
  playlist.findIndex((entry) => entry.ambientValue === ambientSound)
);

export const getPlaylistEntry = (playlist = [], ambientSound) => {
  const currentIndex = findPlaylistIndex(playlist, ambientSound);
  return currentIndex >= 0 ? playlist[currentIndex] : null;
};

export const getAdjacentPlaylistEntry = (playlist = [], ambientSound, direction = 1) => {
  if (playlist.length === 0) {
    return null;
  }

  const currentIndex = findPlaylistIndex(playlist, ambientSound);
  if (currentIndex === -1) {
    return direction >= 0 ? playlist[0] : playlist[playlist.length - 1];
  }

  const nextIndex = (currentIndex + direction + playlist.length) % playlist.length;
  return playlist[nextIndex];
};

export const getNextPlaylistEntry = (
  playlist = [],
  ambientSound,
  repeatMode = 'sequential',
  randomFn = Math.random,
) => {
  if (playlist.length === 0) {
    return null;
  }

  if (repeatMode === 'random') {
    const randomIndex = Math.floor(randomFn() * playlist.length);
    return playlist[randomIndex] || playlist[0];
  }

  return getAdjacentPlaylistEntry(playlist, ambientSound, 1);
};

export const getPreviousPlaylistEntry = (playlist = [], ambientSound) => (
  getAdjacentPlaylistEntry(playlist, ambientSound, -1)
);