import { useCallback, useState } from 'react';

function dispatchRoomToast(message, type = 'info', ttl = 3000) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type, ttl } }));
}

function getCompositeTimerDuration(sequence) {
  if (!Array.isArray(sequence) || sequence.length === 0) {
    return null;
  }

  const [firstStep] = sequence;
  return firstStep.unit === 'sec' ? firstStep.duration : firstStep.duration * 60;
}

function getOrCreateDisplayName() {
  let displayName = localStorage.getItem('userDisplayName');
  if (displayName) {
    return displayName;
  }

  const adjectives = ['Swift', 'Bright', 'Calm', 'Bold', 'Wise', 'Quick', 'Gentle', 'Sharp'];
  const nouns = ['Eagle', 'Wolf', 'Bear', 'Fox', 'Owl', 'Lion', 'Tiger', 'Hawk'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.random().toString(36).substring(2, 5);
  displayName = `${adj}${noun}${suffix}`;
  localStorage.setItem('userDisplayName', displayName);
  return displayName;
}

export default function useRoomFlow({
  currentRoom,
  updateRoomSettings,
  fetchRooms,
  extendRoomTimer,
  leaveRoom,
  joinRoom,
  createRoom,
  rooms,
  mode,
  isRunning,
  sequence,
  currentStep,
  startRoomTimer,
  selectedTemplate,
  setSelectedTemplate,
  setShowTemplateSelector,
}) {
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [showRoomExpirationModal, setShowRoomExpirationModal] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [prefillTemplateId, setPrefillTemplateId] = useState(null);

  const showRealtimeErrorToast = useCallback((err, action = 'Operation') => {
    const raw = err && err.message ? err.message : String(err || 'Unknown error');
    let message = raw;

    if (/already in (another )?room|you are already in a room/i.test(raw)) {
      message = 'You are already in a room. Leave your current room before joining another.';
    } else if (/room name already in use|duplicate|already exists/i.test(raw)) {
      message = 'Room name already in use. Please choose a different name.';
    } else if (/permission_denied|permission denied/i.test(raw)) {
      message = `${action} failed: permission denied. Please enable Anonymous Auth and update your Realtime DB rules (see FIREBASE-SETUP.md).`;
    } else if (/auth|not-authorized/i.test(raw)) {
      message = `${action} failed: authentication error. Check Firebase Auth settings and authorized domains.`;
    } else {
      message = `${action} failed: ${raw}`;
    }

    dispatchRoomToast(message, 'error', 6000);
  }, []);

  const startCompositeRoomTimer = useCallback(() => {
    if (mode !== 'sequence' || !isRunning) {
      return;
    }

    const firstDuration = getCompositeTimerDuration(sequence);
    if (firstDuration === null) {
      return;
    }

    startRoomTimer(firstDuration, 'composite', { steps: sequence, currentStep });
  }, [mode, isRunning, sequence, currentStep, startRoomTimer]);

  const handleSaveRoomSettings = useCallback(async (updates) => {
    if (!currentRoom) {
      return;
    }

    try {
      await updateRoomSettings(currentRoom.id, updates);
      await fetchRooms();
      dispatchRoomToast('Room settings saved', 'success');
    } catch (err) {
      showRealtimeErrorToast(err, 'Save settings');
      throw err;
    } finally {
      setShowRoomSettings(false);
    }
  }, [currentRoom, updateRoomSettings, fetchRooms, showRealtimeErrorToast]);

  const handleExtendTimer = useCallback(async (extensionMs) => {
    try {
      await extendRoomTimer(extensionMs);
      setTimerExpired(false);
      setShowRoomExpirationModal(false);
      dispatchRoomToast('Timer extended successfully', 'success');
    } catch (err) {
      console.error('Failed to extend timer:', err);
      showRealtimeErrorToast(err, 'Extend timer');
    }
  }, [extendRoomTimer, showRealtimeErrorToast]);

  const handleCloseRoom = useCallback(async () => {
    try {
      setShowRoomExpirationModal(false);
      await leaveRoom();
      setTimerExpired(false);
    } catch (err) {
      console.error('Failed to close room:', err);
      showRealtimeErrorToast(err, 'Close room');
    }
  }, [leaveRoom, showRealtimeErrorToast]);

  const handleJoinRoom = useCallback(async (roomId) => {
    try {
      const displayName = getOrCreateDisplayName();
      await joinRoom(roomId, { displayName });
      startCompositeRoomTimer();
    } catch (err) {
      console.error('Join room error (UI):', err);
      showRealtimeErrorToast(err, 'Joining room');
    }
  }, [joinRoom, startCompositeRoomTimer, showRealtimeErrorToast]);

  const handleCreateRoom = useCallback(async (roomData) => {
    if (rooms.some((room) => room.name && roomData.name && room.name.trim().toLowerCase() === roomData.name.trim().toLowerCase())) {
      const message = 'Room name already in use. Please choose a different name.';
      dispatchRoomToast(message, 'error', 4000);
      throw new Error(message);
    }

    try {
      await createRoom(roomData);
      dispatchRoomToast('Room created', 'success');
      startCompositeRoomTimer();
    } catch (err) {
      console.error('Create room error (UI):', err);
      showRealtimeErrorToast(err, 'Creating room');
      throw err;
    }
  }, [rooms, createRoom, startCompositeRoomTimer, showRealtimeErrorToast]);

  const handleSelectTemplate = useCallback((template) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    dispatchRoomToast(`Selected template: ${template.name}`, 'info', 2000);
  }, [setSelectedTemplate, setShowTemplateSelector]);

  const handleCreateRoomFromTemplate = useCallback(async () => {
    if (!selectedTemplate) {
      return;
    }

    try {
      const roomData = {
        name: selectedTemplate.name,
        duration: selectedTemplate.duration,
        maxParticipants: selectedTemplate.maxParticipants,
        goal: selectedTemplate.goal,
        breakDuration: selectedTemplate.breakDuration,
        cycles: selectedTemplate.cycles,
        tag: selectedTemplate.tag,
        template: selectedTemplate.id,
        creatorName: 'You',
      };

      await handleCreateRoom(roomData);
      setShowTemplateSelector(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Template room creation error:', err);
    }
  }, [selectedTemplate, handleCreateRoom, setShowTemplateSelector, setSelectedTemplate]);

  return {
    showRoomSettings,
    setShowRoomSettings,
    showRoomExpirationModal,
    setShowRoomExpirationModal,
    timerExpired,
    setTimerExpired,
    showCreateRoomModal,
    setShowCreateRoomModal,
    prefillTemplateId,
    setPrefillTemplateId,
    handleSaveRoomSettings,
    handleExtendTimer,
    handleCloseRoom,
    handleJoinRoom,
    handleCreateRoom,
    handleSelectTemplate,
    handleCreateRoomFromTemplate,
  };
}