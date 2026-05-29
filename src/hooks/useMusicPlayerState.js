import { useEffect, useState } from 'react';

const DEFAULT_MUSIC_PLAYER_STATE = {
  isPlaying: false,
  repeatMode: 'sequential',
  currentLabel: '',
  currentTime: 0,
  duration: 0,
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
        currentTime: Number.isFinite(detail.currentTime) ? detail.currentTime : 0,
        duration: Number.isFinite(detail.duration) ? detail.duration : 0,
      });
    };

    window.addEventListener('music-player-state', handleMusicPlayerState);
    return () => window.removeEventListener('music-player-state', handleMusicPlayerState);
  }, []);

  return musicPlayerState;
}