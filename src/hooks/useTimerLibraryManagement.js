import { useCallback, useState } from 'react';
import { saveCustomTimer } from '../services/timerService';

const DEFAULT_TIMER_COLOR = '#3b82f6';
const DEFAULT_TIMER_UNIT = 'min';
const DEFAULT_TIMER_SCENE = 'none';

function dispatchTimerToast(message, type = 'info', ttl = 3000) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type, ttl } }));
}

export default function useTimerLibraryManagement({
  seqName,
  sequence,
  setSaved,
  setSequence,
  setSeqName,
  setShowBuilder,
}) {
  const [showCreateTimer, setShowCreateTimer] = useState(false);
  const [editingTimer, setEditingTimer] = useState(null);
  const [showEditTimerModal, setShowEditTimerModal] = useState(false);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerMin, setNewTimerMin] = useState('');
  const [newTimerUnit, setNewTimerUnit] = useState(DEFAULT_TIMER_UNIT);
  const [newTimerColor, setNewTimerColor] = useState(DEFAULT_TIMER_COLOR);
  const [newTimerGroup, setNewTimerGroup] = useState('');
  const [newTimerScene, setNewTimerScene] = useState(DEFAULT_TIMER_SCENE);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  const resetNewTimerForm = useCallback(() => {
    setNewTimerName('');
    setNewTimerMin('');
    setNewTimerUnit(DEFAULT_TIMER_UNIT);
    setNewTimerColor(DEFAULT_TIMER_COLOR);
    setNewTimerGroup('');
    setNewTimerScene(DEFAULT_TIMER_SCENE);
    setShowGroupDropdown(false);
  }, []);

  const closeEditTimer = useCallback(() => {
    setShowEditTimerModal(false);
    setEditingTimer(null);
  }, []);

  const resetTimerLibraryState = useCallback(() => {
    resetNewTimerForm();
    setShowCreateTimer(false);
    closeEditTimer();
  }, [closeEditTimer, resetNewTimerForm]);

  const createTimer = useCallback(() => {
    if (!newTimerName || !newTimerMin) {
      return false;
    }

    const durationValue = parseInt(newTimerMin, 10);
    if (Number.isNaN(durationValue) || durationValue < 0) {
      return false;
    }

    setSaved((previousTimers) => [{
      name: newTimerName,
      duration: durationValue,
      unit: newTimerUnit,
      min: newTimerUnit === 'min' ? durationValue : Math.ceil(durationValue / 60),
      color: newTimerColor,
      group: newTimerGroup || 'Custom',
      scene: newTimerScene,
    }, ...previousTimers]);

    resetNewTimerForm();
    setShowCreateTimer(false);
    return true;
  }, [
    newTimerColor,
    newTimerGroup,
    newTimerMin,
    newTimerName,
    newTimerScene,
    newTimerUnit,
    resetNewTimerForm,
    setSaved,
  ]);

  const cancelCreateTimer = useCallback(() => {
    resetNewTimerForm();
    setShowCreateTimer(false);
  }, [resetNewTimerForm]);

  const saveSequence = useCallback((metadata = {}) => {
    if (sequence.length === 0 || !seqName) {
      return false;
    }

    const totalMinutes = sequence.reduce((sum, timer) => {
      const minutes = timer.unit === 'sec' ? timer.duration / 60 : timer.duration;
      return sum + minutes;
    }, 0);

    const totalSeconds = sequence.reduce((sum, timer) => (
      sum + (timer.unit === 'sec' ? timer.duration : timer.duration * 60)
    ), 0);

    const roomMetadata = {
      isRoomCompatible: !!metadata.isRoomCompatible,
      recommendedParticipants: metadata.recommendedParticipants || null,
    };

    const newRoutine = {
      name: seqName,
      duration: Math.ceil(totalMinutes),
      unit: 'min',
      min: Math.ceil(totalMinutes),
      color: sequence[0].color,
      group: metadata.group || 'Sequences',
      isSequence: true,
      steps: sequence,
      exercises: sequence,
      templateType: metadata.sessionType || 'routine',
      category: metadata.category || 'mixed',
      difficulty: metadata.difficulty || 'intermediate',
      emoji: metadata.emoji || '⭐',
      description: metadata.description || '',
      tags: metadata.tags || [],
      isRoomCompatible: roomMetadata.isRoomCompatible,
      recommendedParticipants: roomMetadata.recommendedParticipants,
      totalSeconds,
      exerciseCount: sequence.filter((step) => step.type === 'work').length,
      createdAt: Date.now(),
      metadata: {
        source: 'custom',
        isCustom: true,
        ...roomMetadata,
      },
    };

    setSaved((previousTimers) => [newRoutine, ...previousTimers]);
    saveCustomTimer(newRoutine);
    window.dispatchEvent(new CustomEvent('timers-updated'));

    setSequence([]);
    setSeqName('');
    setShowBuilder(false);
    dispatchTimerToast(`✅ "${seqName}" saved successfully!`, 'success');
    return true;
  }, [seqName, sequence, setSaved, setSequence, setSeqName, setShowBuilder]);

  const openEditTimer = useCallback((timer) => {
    setEditingTimer(timer);
    setShowEditTimerModal(true);
  }, []);

  const saveEditedTimer = useCallback((updated) => {
    try {
      const cleanExercises = updated.exercises ? JSON.parse(JSON.stringify(updated.exercises)) : updated.exercises;
      const finalUpdated = {
        ...updated,
        exercises: cleanExercises,
        steps: cleanExercises || updated.steps,
        isRoomCompatible: !!updated.metadata?.isRoomCompatible,
        recommendedParticipants: updated.metadata?.recommendedParticipants || null,
        metadata: {
          ...updated.metadata,
          source: 'custom',
          isCustom: true,
        },
      };

      saveCustomTimer(finalUpdated);
      window.dispatchEvent(new CustomEvent('timers-updated'));
      dispatchTimerToast('Workout updated', 'success');
      return true;
    } catch (error) {
      console.error('Failed to save edited timer:', error);
      dispatchTimerToast('Failed to save workout', 'error');
      return false;
    } finally {
      closeEditTimer();
    }
  }, [closeEditTimer]);

  const cloneTemplateForEditing = useCallback(async (cloneData) => {
    try {
      const newTimer = saveCustomTimer({
        ...cloneData,
        metadata: {
          ...cloneData.metadata,
          source: 'custom',
          isCustom: true,
        },
      });
      window.dispatchEvent(new CustomEvent('timers-updated'));
      openEditTimer(newTimer);
      return newTimer;
    } catch (error) {
      console.error('Failed to clone template:', error);
      throw error;
    }
  }, [openEditTimer]);

  return {
    showCreateTimer,
    setShowCreateTimer,
    editingTimer,
    showEditTimerModal,
    newTimerName,
    setNewTimerName,
    newTimerMin,
    setNewTimerMin,
    newTimerUnit,
    setNewTimerUnit,
    newTimerColor,
    setNewTimerColor,
    newTimerGroup,
    setNewTimerGroup,
    newTimerScene,
    setNewTimerScene,
    showGroupDropdown,
    setShowGroupDropdown,
    createTimer,
    cancelCreateTimer,
    saveSequence,
    openEditTimer,
    closeEditTimer,
    saveEditedTimer,
    cloneTemplateForEditing,
    resetTimerLibraryState,
  };
}