import { useEffect, useState } from 'react';

const DEFAULT_MUSIC_PLAYER_STATE = {
  isPlaying: false,
  repeatMode: 'sequential',
  currentLabel: '',
};

export default function useMusicPlayerState() {
  const [musicPlayerState, setMusicPlayerState] = useState(DEFAULT_MUSIC_PLAYER_STATE);

  useEffect(() => {
    const handleMusicPlayerState = (event) => {
      const detail = event?.detail || {};

      setMusicPlayerState({
        isPlaying: Boolean(detail.isPlaying),
        repeatMode: detail.repeatMode || 'sequential',
        currentLabel: detail.currentLabel || '',
      });
    };

    window.addEventListener('music-player-state', handleMusicPlayerState);
    return () => window.removeEventListener('music-player-state', handleMusicPlayerState);
  }, []);

  return musicPlayerState;
}