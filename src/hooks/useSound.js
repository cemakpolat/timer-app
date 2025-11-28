import { useRef, useEffect, useCallback } from 'react';
import { COUNTDOWN_NOISE_SOUND } from '../utils/constants';

/**
 * Custom hook for sound management (alarm and ambient sounds)
 * @param {Object} options - Sound options
 * @returns {Object} Sound controls
 */
export const useSound = ({
  alarmType = 'bell',
  alarmVolume = 0.5,
  ambientType = 'None',
  ambientVolume = 0.3,
  countdownEnabled = false
} = {}) => {
  const ambientAudioRef = useRef(null);
  const countdownAudioRef = useRef(null);

  // Initialize audio objects
  useEffect(() => {
    ambientAudioRef.current = new Audio();
    ambientAudioRef.current.loop = true;

    try {
      countdownAudioRef.current = new Audio(COUNTDOWN_NOISE_SOUND);
    } catch (e) {
      console.error('Failed to load countdown sound:', e);
      countdownAudioRef.current = {
        play: () => Promise.resolve(),
        pause: () => {},
        volume: 0,
        currentTime: 0
      };
    }

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.src = '';
      }
      if (countdownAudioRef.current && countdownAudioRef.current.pause) {
        countdownAudioRef.current.pause();
      }
    };
  }, []);

  // Play alarm sound using Web Audio API
  const playAlarm = useCallback(() => {
    if (alarmType === 'silent') return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(alarmVolume, ctx.currentTime);

      if (alarmType === 'bell') {
        osc.frequency.value = 800;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (alarmType === 'chime') {
        // First chime
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(alarmVolume * 0.7, ctx.currentTime);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);

        // Second chime
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 900;
        gain2.gain.setValueAtTime(alarmVolume, ctx.currentTime + 0.2);
        osc2.start(ctx.currentTime + 0.2);
        osc2.stop(ctx.currentTime + 0.5);
      }
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  }, [alarmType, alarmVolume]);

  // Play countdown tick
  const playCountdownTick = useCallback(() => {
    if (!countdownEnabled || !countdownAudioRef.current) return;

    try {
      countdownAudioRef.current.volume = alarmVolume;
      countdownAudioRef.current.currentTime = 0;
      countdownAudioRef.current.play().catch(e => {
        console.error('Countdown sound playback error:', e);
      });
    } catch (error) {
      console.error('Error playing countdown tick:', error);
    }
  }, [countdownEnabled, alarmVolume]);

  // Start ambient sound
  const startAmbient = useCallback((soundFile) => {
    if (!soundFile) return;

    try {
      // Handle regular audio files (including our new jazz files)
      if (!ambientAudioRef.current) return;
      ambientAudioRef.current.src = soundFile;
      ambientAudioRef.current.volume = ambientVolume;
      ambientAudioRef.current.play().catch(e => {
        console.log('Ambient audio play blocked:', e);
      });
    } catch (error) {
      console.error('Error starting ambient sound:', error);
    }
  }, [ambientVolume]);

  // Stop ambient sound
  const stopAmbient = useCallback(() => {
    try {
      // Stop regular audio
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.currentTime = 0;
      }
    } catch (error) {
      console.error('Error stopping ambient sound:', error);
    }
  }, []);

  // Update ambient volume
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  return {
    playAlarm,
    playCountdownTick,
    startAmbient,
    stopAmbient,
    ambientAudioRef,
    countdownAudioRef
  };
};