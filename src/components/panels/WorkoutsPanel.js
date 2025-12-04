import React from 'react';
import WorkoutBrowser from './WorkoutBrowser';

/**
 * WorkoutsPanel Component
 * Main interface for browsing and starting workout templates
 */
const WorkoutsPanel = ({
  theme,
  savedSequences,
  onStartWorkout,
  onCreateWorkoutRoom,
  onCreateRoomWithTemplate,
  onDeleteWorkout
}) => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <WorkoutBrowser
        theme={theme}
        savedSequences={savedSequences || []}
        onStartWorkout={onStartWorkout}
        onCreateRoom={onCreateWorkoutRoom}
        onCreateRoomWithTemplate={onCreateRoomWithTemplate}
        onDeleteWorkout={onDeleteWorkout}
      />
    </div>
  );
};

export default WorkoutsPanel;
