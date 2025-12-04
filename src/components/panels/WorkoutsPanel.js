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
  onDeleteWorkout
}) => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <WorkoutBrowser
        theme={theme}
        savedSequences={savedSequences || []}
        onStartWorkout={onStartWorkout}
        onCreateRoom={onCreateWorkoutRoom}
        onDeleteWorkout={onDeleteWorkout}
      />
    </div>
  );
};

export default WorkoutsPanel;
