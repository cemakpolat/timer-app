import { useCallback, useEffect, useRef } from 'react';

const COMPLETION_DELAY_MS = 500;
const SEQUENCE_RESUME_DELAY_MS = 50;
const ROUTINE_RETURN_DELAY_MS = 3000;

export default function useTimerCompletionFlow({
  addToHistory,
  ambientSoundType,
  currentRound,
  currentStepRef,
  formatTime,
  getSoundFile,
  initialTime,
  isWork,
  mode,
  playAlarm,
  repeatEnabled,
  rest,
  rounds,
  saved,
  seqName,
  sequenceRef,
  setActiveFeatureTab,
  setActiveMainTab,
  setActiveScene,
  setCompletedSession,
  setConfettiActiveDuration,
  setCurrentRound,
  setCurrentStep,
  setCurrentTimerScene,
  setIsRunning,
  setIsTransitioning,
  setIsWork,
  setShowCelebration,
  setTheme,
  setTime,
  startAmbient,
  stopAmbient,
  theme,
  work,
}) {
  const completionTimeoutRef = useRef(null);
  const sequenceResumeTimeoutRef = useRef(null);
  const routineReturnTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    if (sequenceResumeTimeoutRef.current) {
      clearTimeout(sequenceResumeTimeoutRef.current);
      sequenceResumeTimeoutRef.current = null;
    }

    if (routineReturnTimeoutRef.current) {
      clearTimeout(routineReturnTimeoutRef.current);
      routineReturnTimeoutRef.current = null;
    }
  }, []);

  const restartAmbientTrack = useCallback(() => {
    if (ambientSoundType === 'None') {
      return;
    }

    const soundFile = getSoundFile(ambientSoundType);
    if (soundFile) {
      startAmbient(soundFile);
    }
  }, [ambientSoundType, getSoundFile, startAmbient]);

  const finishCompletedSession = useCallback((completionData) => {
    setActiveScene('none');
    setCompletedSession(completionData);
    setShowCelebration(true);
    setIsTransitioning(false);
  }, [setActiveScene, setCompletedSession, setShowCelebration, setIsTransitioning]);

  const handleComplete = useCallback(() => {
    setIsTransitioning(true);
    setIsRunning(false);
    stopAmbient();
    playAlarm();
    setConfettiActiveDuration(mode === 'sequence' ? 8 : 5);

    const localMode = mode;
    const localIsWork = isWork;
    const localCurrentRound = currentRound;

    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
    }

    completionTimeoutRef.current = setTimeout(() => {
      completionTimeoutRef.current = null;

      if (localMode === 'interval') {
        if (localIsWork) {
          setIsWork(false);
          setTime(rest);
          setIsRunning(true);
          setIsTransitioning(false);
          return;
        }

        if (localCurrentRound < rounds) {
          setCurrentRound((previousRound) => previousRound + 1);
          setIsWork(true);
          setTime(work);
          setIsRunning(true);
          setIsTransitioning(false);
          return;
        }

        const totalTime = work * rounds + rest * rounds;
        const completionData = {
          type: 'Interval',
          name: `Interval: ${work}s work / ${rest}s rest`,
          totalSeconds: totalTime,
          details: `${rounds} rounds (${work}s work / ${rest}s rest})`,
        };
        addToHistory(completionData);

        if (repeatEnabled) {
          setCurrentRound(1);
          setIsWork(true);
          setTime(work);
          setIsRunning(true);
          setIsTransitioning(false);
          return;
        }

        finishCompletedSession(completionData);
        return;
      }

      if (localMode === 'sequence') {
        const currentSequence = sequenceRef.current;
        const currentStep = currentStepRef.current;

        if (currentStep < currentSequence.length - 1) {
          const nextStep = currentStep + 1;
          const nextTimer = currentSequence[nextStep];
          const nextDuration = nextTimer.unit === 'sec' ? nextTimer.duration : nextTimer.duration * 60;

          if (nextTimer.accent) {
            setTheme((previousTheme) => ({ ...previousTheme, accent: nextTimer.accent }));
          }

          if (nextTimer.scene) {
            setActiveScene(nextTimer.scene);
            setCurrentTimerScene(nextTimer.scene);
          }

          setCurrentStep(nextStep);
          setTime(nextDuration);
          restartAmbientTrack();
          setIsRunning(true);

          if (sequenceResumeTimeoutRef.current) {
            clearTimeout(sequenceResumeTimeoutRef.current);
          }

          sequenceResumeTimeoutRef.current = setTimeout(() => {
            setIsTransitioning(false);
            sequenceResumeTimeoutRef.current = null;
          }, SEQUENCE_RESUME_DELAY_MS);
          return;
        }

        const totalSeconds = currentSequence.reduce((sum, step) => (
          sum + (step.unit === 'sec' ? step.duration : step.duration * 60)
        ), 0);
        const sequenceName = seqName || 'Unnamed Sequence';
        const normalizedSequence = currentSequence.map((step) => ({
          name: step.name || (step.type || 'Step'),
          duration: step.unit === 'sec' ? step.duration : step.duration * 60,
          color: step.color || step.accent || theme?.accent || '#8b5cf6',
        }));

        const completionData = {
          type: 'Sequence',
          name: sequenceName,
          totalSeconds,
          details: `${currentSequence.length} steps`,
          sequence: normalizedSequence,
        };
        addToHistory(completionData);

        if (repeatEnabled) {
          setCurrentStep(0);
          const firstTimer = currentSequence[0];
          const firstDuration = firstTimer.unit === 'sec' ? firstTimer.duration : firstTimer.duration * 60;

          if (firstTimer.accent) {
            setTheme((previousTheme) => ({ ...previousTheme, accent: firstTimer.accent }));
          }

          setTime(firstDuration);
          restartAmbientTrack();
          setIsRunning(true);
          setIsTransitioning(false);
          return;
        }

        finishCompletedSession(completionData);

        if (window.localStorage.getItem('lastRoutineSource') === 'routines') {
          if (routineReturnTimeoutRef.current) {
            clearTimeout(routineReturnTimeoutRef.current);
          }

          routineReturnTimeoutRef.current = setTimeout(() => {
            setActiveMainTab('routines');
            setActiveFeatureTab(null);
            window.localStorage.removeItem('lastRoutineSource');
            routineReturnTimeoutRef.current = null;
          }, ROUTINE_RETURN_DELAY_MS);
        }

        return;
      }

      if (localMode === 'timer') {
        const timerName = saved.find((timer) => (
          timer.isSequence === false
          && timer.duration * (timer.unit === 'min' ? 60 : 1) === initialTime
        ))?.name || 'Quick Timer';

        const completionData = {
          type: 'Timer',
          name: timerName,
          totalSeconds: initialTime,
          details: formatTime(initialTime),
        };
        addToHistory(completionData);

        if (repeatEnabled) {
          setTime(initialTime);
          setIsRunning(true);
          setIsTransitioning(false);
          return;
        }

        finishCompletedSession(completionData);
        return;
      }

      setActiveScene('none');
      setIsTransitioning(false);
    }, COMPLETION_DELAY_MS);
  }, [
    addToHistory,
    currentRound,
    currentStepRef,
    finishCompletedSession,
    formatTime,
    initialTime,
    isWork,
    mode,
    playAlarm,
    repeatEnabled,
    restartAmbientTrack,
    rest,
    rounds,
    saved,
    seqName,
    sequenceRef,
    setActiveFeatureTab,
    setActiveMainTab,
    setActiveScene,
    setConfettiActiveDuration,
    setCurrentRound,
    setCurrentStep,
    setCurrentTimerScene,
    setIsRunning,
    setIsTransitioning,
    setIsWork,
    setTheme,
    setTime,
    stopAmbient,
    theme,
    work,
  ]);

  return handleComplete;
}