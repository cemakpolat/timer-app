import { useCallback } from 'react';

export default function useTimerLogic({
	ambientSoundType,
	currentRoom,
	getSoundFile,
	initialTime,
	inputHours,
	inputMinutes,
	inputSeconds,
	sequence,
	setActiveScene,
	setCurrentRound,
	setCurrentStep,
	setCurrentTimerScene,
	setInitialTime,
	setInputHours,
	setInputMinutes,
	setInputSeconds,
	setIsRunning,
	setIsWork,
	setMode,
	setTime,
	startAmbient,
	startRoomTimer,
	stopAmbient,
	work,
}) {
	const startAmbientIfConfigured = useCallback(() => {
		if (ambientSoundType === 'None') {
			return;
		}

		const soundFile = getSoundFile(ambientSoundType);
		if (soundFile) {
			startAmbient(soundFile);
		}
	}, [ambientSoundType, getSoundFile, startAmbient]);

	const startTimer = useCallback((totalSeconds, scene = 'none') => {
		setMode('timer');
		setTime(totalSeconds);
		setInitialTime(totalSeconds);
		setIsRunning(true);
		setCurrentTimerScene(scene);
		setActiveScene(scene);

		if (inputHours || inputMinutes || inputSeconds) {
			setInputHours('');
			setInputMinutes('');
			setInputSeconds('');
		}

		startAmbientIfConfigured();
	}, [
		inputHours,
		inputMinutes,
		inputSeconds,
		setActiveScene,
		setCurrentTimerScene,
		setInitialTime,
		setInputHours,
		setInputMinutes,
		setInputSeconds,
		setIsRunning,
		setMode,
		setTime,
		startAmbientIfConfigured,
	]);

	const startStopwatch = useCallback(() => {
		setMode('stopwatch');
		setTime(0);
		setIsRunning(true);
		setActiveScene('none');
		setCurrentTimerScene('none');
	}, [setActiveScene, setCurrentTimerScene, setIsRunning, setMode, setTime]);

	const startInterval = useCallback(() => {
		setMode('interval');
		setTime(work);
		setCurrentRound(1);
		setIsWork(true);
		setIsRunning(true);
	}, [setCurrentRound, setIsRunning, setIsWork, setMode, setTime, work]);

	const pauseTimer = useCallback(() => {
		setIsRunning(false);
		stopAmbient();
	}, [setIsRunning, stopAmbient]);

	const resetTimer = useCallback(() => {
		setIsRunning(false);
		setTime(initialTime);
		stopAmbient();
	}, [initialTime, setIsRunning, setTime, stopAmbient]);

	const pauseStopwatch = useCallback(() => {
		setIsRunning(false);
	}, [setIsRunning]);

	const resetStopwatch = useCallback(() => {
		setIsRunning(false);
		setTime(0);
	}, [setIsRunning, setTime]);

	const startSequence = useCallback((sequenceData = null) => {
		const seqToUse = sequenceData || sequence;
		if (seqToUse.length === 0) {
			return;
		}

		if (currentRoom) {
			const firstDuration = seqToUse[0].unit === 'sec' ? seqToUse[0].duration : seqToUse[0].duration * 60;
			startRoomTimer(firstDuration, 'composite', { steps: seqToUse, currentStep: 0 });
			return;
		}

		setMode('sequence');
		setCurrentStep(0);
		const firstDuration = seqToUse[0].unit === 'sec' ? seqToUse[0].duration : seqToUse[0].duration * 60;
		setTime(firstDuration);
		setIsRunning(true);

		if (seqToUse[0].scene) {
			setActiveScene(seqToUse[0].scene);
			setCurrentTimerScene(seqToUse[0].scene);
		}

		startAmbientIfConfigured();
	}, [
		currentRoom,
		sequence,
		setActiveScene,
		setCurrentStep,
		setCurrentTimerScene,
		setIsRunning,
		setMode,
		setTime,
		startAmbientIfConfigured,
		startRoomTimer,
	]);

	return {
		startTimer,
		startStopwatch,
		startInterval,
		pauseTimer,
		resetTimer,
		pauseStopwatch,
		resetStopwatch,
		startSequence,
	};
}
