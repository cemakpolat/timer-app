import React from 'react';
import { Users, Clock } from 'lucide-react';
import TimerPanel from './panels/TimerPanel';
import IntervalPanel from './panels/IntervalPanel';
import StopwatchPanel from './StopwatchPanel';
import CompositePanel from './panels/CompositePanel';
import FocusRoomsPanel from './panels/FocusRoomsPanel';
import AchievementsPanel from './panels/AchievementsPanel';

const MainContent = ({
  theme,
  activeMainTab,
  activeFeatureTab,
  setActiveMainTab,
  setActiveFeatureTab,
  // Timer state
  mode,
  time,
  isRunning,
  inputHours,
  inputMinutes,
  inputSeconds,
  initialTime,
  work,
  rest,
  rounds,
  currentRound,
  isWork,
  sequence,
  currentStep,
  showBuilder,
  seqName,
  saved,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onInputChange,
  onWorkChange,
  onRestChange,
  onRoundsChange,
  onStartInterval,
  onPauseInterval,
  onResetInterval,
  onStartSequence,
  onPauseSequence,
  onResetSequence,
  onAddStep,
  onRemoveStep,
  onSaveSequence,
  onLoadTimer,
  onDeleteTimer,
  // Other props
  serviceReady,
  realActiveUsers,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  getParticipantCount,
  isRoomFull,
  showTemplateSelector,
  setShowTemplateSelector,
  selectedTemplate,
  setSelectedTemplate,
  handleCreateRoom,
  // Theme and settings
  themes,
  setTheme,
  showColorPicker,
  setShowColorPicker,
  editingTheme,
  setEditingTheme,
  newThemeName,
  setNewThemeName,
  newThemeBg,
  setNewThemeBg,
  newThemeCard,
  setNewThemeCard,
  newThemeAccent,
  setNewThemeAccent,
  newThemeText,
  setNewThemeText,
  showDeleteThemeModal,
  setShowDeleteThemeModal,
  themeToDelete,
  setThemeToDelete,
  createCustomTheme,
  deleteCustomTheme,
  // Other
  collapsedGroups,
  setCollapsedGroups,
  weatherEffect,
  weatherConfig,
  animationsEnabled,
  alarmSoundType,
  setAlarmSoundType,
  alarmVolume,
  setAlarmVolume,
  ambientSoundType,
  setAmbientSoundType,
  ambientVolume,
  setAmbientVolume,
  showShareModal,
  setShowShareModal,
  shareLink,
  showDeleteModal,
  setShowDeleteModal,
  timerToDelete,
  setTimerToDelete,
  executeDelete,
  showCreateRoomModal,
  setShowCreateRoomModal,
  showFeedbackModal,
  setShowFeedbackModal,
  showInfoModal,
  setShowInfoModal,
  // Add more as needed
}) => {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 12px' }}>
      {/* Primary Navigation Tabs */}
      {!isRunning && time === 0 && (
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          background: theme.card,
          borderRadius: 12,
          padding: 6
        }}>
          {[
            { label: 'Focus Rooms', value: 'rooms', icon: Users },
            { label: 'Timer', value: 'timer', icon: Clock }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveMainTab(tab.value);
                setActiveFeatureTab(null);
              }}
              style={{
                flex: 1,
                background: activeMainTab === tab.value ? theme.accent : 'transparent',
                border: 'none',
                borderRadius: 10,
                padding: '8px 6px',
                color: activeMainTab === tab.value ? getContrastColor(theme.accent) : theme.text,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.2s'
              }}
            >
              <tab.icon className="tab-icon" size={16} />
              <span className="tab-label" style={{ marginTop: 4, fontSize: 11 }}>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content based on activeMainTab */}
      {activeMainTab === 'rooms' && (
        <FocusRoomsPanel
          theme={theme}
          serviceReady={serviceReady}
          realActiveUsers={realActiveUsers}
          onCreateRoom={onCreateRoom}
          onJoinRoom={onJoinRoom}
          onLeaveRoom={onLeaveRoom}
          getParticipantCount={getParticipantCount}
          isRoomFull={isRoomFull}
          showTemplateSelector={showTemplateSelector}
          setShowTemplateSelector={setShowTemplateSelector}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          handleCreateRoom={handleCreateRoom}
          showCreateRoomModal={showCreateRoomModal}
          setShowCreateRoomModal={setShowCreateRoomModal}
        />
      )}

      {activeMainTab === 'timer' && (
        <div>
          {/* Feature Tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            marginBottom: 16,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 10,
            padding: 4
          }}>
            {[
              { label: 'Timer', value: 'timer' },
              { label: 'Interval', value: 'interval' },
              { label: 'Stopwatch', value: 'stopwatch' },
              { label: 'Sequence', value: 'composite' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveFeatureTab(tab.value)}
                style={{
                  flex: 1,
                  background: activeFeatureTab === tab.value ? theme.accent : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px',
                  color: activeFeatureTab === tab.value ? getContrastColor(theme.accent) : theme.text,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panels */}
          {activeFeatureTab === 'timer' && (
            <TimerPanel
              time={time}
              isRunning={isRunning}
              inputHours={inputHours}
              inputMinutes={inputMinutes}
              inputSeconds={inputSeconds}
              theme={theme}
              onStart={onStartTimer}
              onPause={onPauseTimer}
              onReset={onResetTimer}
              onInputChange={onInputChange}
            />
          )}

          {activeFeatureTab === 'interval' && (
            <IntervalPanel
              work={work}
              rest={rest}
              rounds={rounds}
              currentRound={currentRound}
              isWork={isWork}
              isRunning={isRunning}
              time={time}
              theme={theme}
              onWorkChange={onWorkChange}
              onRestChange={onRestChange}
              onRoundsChange={onRoundsChange}
              onStart={onStartInterval}
              onPause={onPauseInterval}
              onReset={onResetInterval}
            />
          )}

          {activeFeatureTab === 'stopwatch' && (
            <StopwatchPanel
              time={time}
              isRunning={isRunning}
              theme={theme}
              onStart={onStartTimer}
              onPause={onPauseTimer}
              onReset={onResetTimer}
            />
          )}

          {activeFeatureTab === 'composite' && (
            <CompositePanel
              sequence={sequence}
              currentStep={currentStep}
              time={time}
              isRunning={isRunning}
              theme={theme}
              showBuilder={showBuilder}
              seqName={seqName}
              saved={saved}
              onAddStep={onAddStep}
              onRemoveStep={onRemoveStep}
              onStart={onStartSequence}
              onPause={onPauseSequence}
              onReset={onResetSequence}
              onSave={onSaveSequence}
              onLoadTimer={onLoadTimer}
              onDeleteTimer={onDeleteTimer}
            />
          )}
        </div>
      )}

      {activeMainTab === 'stats' && (
        <AchievementsPanel theme={theme} />
      )}
    </div>
  );
};

// Utility function (move to utils if needed)
const getContrastColor = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default MainContent;