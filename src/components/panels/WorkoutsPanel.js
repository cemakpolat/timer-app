import React from 'react';
import RoutineBrowser from './RoutineBrowser';


/**
 * RoutinesPanel Component
 * Main interface for browsing and starting routine templates
 */
const RoutinesPanel = ({
  theme,
  savedSequences,
  savedTimers = [],
  onStartRoutine,
  onCreateRoutineRoom,
  onCreateRoomWithTemplate,
  onDeleteRoutine,
  onCloneTemplate,
  onEditRoutine,
  onCreateNewRoutine
}) => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <RoutineBrowser
        theme={theme}
        savedSequences={savedSequences || []}
        savedTimers={savedTimers || []}
        onStartRoutine={onStartRoutine}
        onCreateRoom={onCreateRoutineRoom}
        onCreateRoomWithTemplate={onCreateRoomWithTemplate}
        onDeleteRoutine={onDeleteRoutine}
        onCloneTemplate={onCloneTemplate}
        onEditRoutine={onEditRoutine}
        onCreateNewRoutine={onCreateNewRoutine}
      />
    </div>
  );
};

export default RoutinesPanel;
