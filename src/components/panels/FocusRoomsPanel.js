import React, { useState } from 'react';
import { Users, Plus, Clock, Calendar, Play, Send, Search, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import RoomSettingsModal from '../FocusRooms/RoomSettingsModal';
import RoomExpirationModal from '../FocusRooms/RoomExpirationModal';
import RealtimeServiceFactory from '../../services/RealtimeServiceFactory';

/**
 * FocusRoomsPanel Component
 * Displays list of focus rooms or active room details with participants, timer, and chat
 * 
 * Props:
 * - theme: Current theme object
 * - currentRoom: Currently joined room or null
 * - rooms: Array of available rooms
 * - roomsLoading: Boolean indicating if rooms are loading
 * - messages: Array of chat messages
 * - showRoomSettings: Boolean to show/hide settings modal
 * - showRoomExpirationModal: Boolean to show room expiration warning
 * - calendarExportRoom: Room to export to calendar or null
 * - chatInputRef: Ref for chat input element
 * - handleJoinRoom: Function to join a room
 * - leaveRoom: Function to leave current room
 * - deleteRoom: Function to delete a room (owner only)
 * - setShowRoomSettings: Function to toggle room settings
 * - setCalendarExportRoom: Function to set room for calendar export
 * - handleSaveRoomSettings: Function to save room settings
 * - sendMessage: Function to send chat message
 * - startRoomTimer: Function to start timer in room
 * - handleExtendTimer: Function to extend room timer
 * - handleCloseRoom: Function to close room
 * - handleExportToICS: Function to export to .ics file
 * - handleExportToGoogleCalendar: Function to export to Google Calendar
 * - formatTime: Function to format seconds as HH:MM:SS
 * - getParticipantCount: Function to get number of participants
 * - isRoomFull: Function to check if room is full
 */

const ROOM_TAGS = [
  { id: 'work', label: 'Work', color: '#ef4444', emoji: '💼' },
  { id: 'study', label: 'Study', color: '#3b82f6', emoji: '📚' },
  { id: 'creative', label: 'Creative', color: '#f59e0b', emoji: '🎨' },
  { id: 'fitness', label: 'Fitness', color: '#10b981', emoji: '💪' },
  { id: 'wellness', label: 'Wellness', color: '#8b5cf6', emoji: '🧘' },
  { id: 'other', label: 'Other', color: '#6b7280', emoji: '⭐' }
];

function FocusRoomsPanel({
  theme,
  currentRoom,
  rooms,
  roomsLoading,
  messages,
  showRoomSettings,
  showRoomExpirationModal,
  calendarExportRoom,
  chatInputRef,
  handleJoinRoom,
  leaveRoom,
  deleteRoom,
  setShowRoomSettings,
  setCalendarExportRoom,
  setShowCreateRoomModal,
  handleSaveRoomSettings,
  sendMessage,
  startRoomTimer,
  handleExtendTimer,
  handleCloseRoom,
  handleExportToICS,
  handleExportToGoogleCalendar,
  formatTime,
  getParticipantCount,
  isRoomFull
}) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const sortBy = 'participants'; // Default sort by participants

  // Filter and sort rooms
  const filteredRooms = rooms
    .filter(room => {
      // Filter by search term
      const matchesSearch = !searchTerm ||
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || selectedTags.includes(room.tag || 'other');

      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'participants':
        default:
          return (getParticipantCount(b) || 0) - (getParticipantCount(a) || 0);
      }
    });

  return (
    <>
      {!currentRoom ? (
        <>
          {/* Room List */}
          <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} /> Focus Rooms
              </h2>
              <button
                onClick={() => setShowCreateRoomModal?.(true)}
                style={{
                  background: theme.accent,
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: theme.text,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center'
                }}
              >
                <Plus size={16} /> Create Room
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div style={{ marginBottom: 24 }}>
              {/* Search Input */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                <input
                  type="text"
                  placeholder="Search rooms by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '12px 12px 12px 40px',
                    color: theme.text,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Tag Filters */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ROOM_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(selectedTags.filter(t => t !== tag.id));
                          } else {
                            setSelectedTags([...selectedTags, tag.id]);
                          }
                        }}
                        style={{
                          background: isSelected ? tag.color + '20' : 'transparent',
                          border: `1px solid ${isSelected ? tag.color : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: 9999,
                          padding: '4px 10px',
                          color: isSelected ? '#000' : theme.text,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s'
                        }}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Room Count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                  {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>

            {roomsLoading && rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' }}>
                Loading rooms...
              </div>
            ) : roomsLoading && rooms.length > 0 ? (
              <div style={{ textAlign: 'center', padding: 12, color: 'rgba(255,255,255,0.5)' }}>
                Updating rooms...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' }}>
                {rooms.length === 0 ? 'No active rooms. Create one to get started!' : 'No rooms match your search criteria.'}
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gap: 12,
                maxHeight: '500px',
                overflowY: 'auto',
                paddingRight: 4
              }}>
                {filteredRooms.map(room => (
                  <div
                    key={room.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 16,
                      padding: 20,
                      border: `1px solid rgba(255,255,255,0.1)`,
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {room.name}
                          {room.status === 'scheduled' && (
                            <span style={{ fontSize: 12, background: 'rgba(255,193,7,0.2)', color: '#ffc107', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
                              📅 Scheduled
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Users size={14} />
                            {getParticipantCount(room)}/{room.maxParticipants}
                          </div>
                          {room.status === 'scheduled' && room.scheduledFor ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={14} />
                              Available: {new Date(room.scheduledFor).toLocaleString()}
                            </div>
                          ) : room.timer ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={14} />
                              {formatTime(Math.max(0, Math.floor((room.timer.endsAt - Date.now()) / 1000)))} remaining
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {room.status === 'scheduled' && room.scheduledFor && (
                          <button
                            onClick={() => setCalendarExportRoom(room)}
                            style={{
                              background: 'rgba(34,197,94,0.2)',
                              border: '1px solid rgba(34,197,94,0.5)',
                              borderRadius: 12,
                              padding: '10px 16px',
                              color: '#22c55e',
                              cursor: 'pointer',
                              fontSize: 14,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(34,197,94,0.3)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(34,197,94,0.2)'}
                            title="Export to calendar"
                          >
                            <Calendar size={16} /> Export
                          </button>
                        )}
                        <button
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={isRoomFull(room) || room.status === 'scheduled'}
                          style={{
                            background: (isRoomFull(room) || room.status === 'scheduled') ? 'rgba(255,255,255,0.1)' : theme.accent,
                            border: 'none',
                            borderRadius: 12,
                            padding: '10px 20px',
                            color: theme.text,
                            cursor: (isRoomFull(room) || room.status === 'scheduled') ? 'not-allowed' : 'pointer',
                            fontSize: 14,
                            fontWeight: 600,
                            opacity: (isRoomFull(room) || room.status === 'scheduled') ? 0.5 : 1
                          }}
                        >
                          {isRoomFull(room) ? 'Full' : room.status === 'scheduled' ? 'Not Ready' : 'Join'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Active Room View */}
          <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, margin: 0 }}>{currentRoom.name}</h2>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                  Host: {currentRoom.creatorName || currentRoom.createdBy}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={leaveRoom}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    color: theme.text,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  Leave Room
                </button>
                {currentRoom && RealtimeServiceFactory.getServiceSafe()?.currentUserId === currentRoom.createdBy && (
                  <button
                    onClick={async () => {
                      try {
                        await deleteRoom(currentRoom.id);
                        showToast('Room deleted', 'success', 3000);
                        await leaveRoom();
                      } catch (err) {
                        const msg = err?.message || 'Failed to delete room';
                        showToast(msg, 'error', 5000);
                      }
                    }}
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    Delete Room
                  </button>
                )}
                {currentRoom && RealtimeServiceFactory.getServiceSafe()?.currentUserId === currentRoom.createdBy && (
                  <button
                    onClick={() => setShowRoomSettings(true)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    Room Settings
                  </button>
                )}
              </div>
            </div>

            {/* Participants */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Participants ({getParticipantCount(currentRoom)}/{currentRoom.maxParticipants})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(currentRoom.participants || {}).map(([userId, participant]) => (
                  <div
                    key={userId}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img 
                        src={participant.avatarUrl || `https://api.dicebear.com/8.x/identicon/svg?seed=${encodeURIComponent(userId)}`}
                        alt={participant.displayName}
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>{participant.displayName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Timer */}
            {currentRoom.timer && (
              <div
                key={`timer-${currentRoom.currentStep}-${currentRoom.timerType}`}
                style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'center', position: 'relative' }}
              >
                {currentRoom.timerType === 'composite' && currentRoom.compositeTimer?.steps && currentRoom.compositeTimer.steps.length > 0 && (
                  <>
                    <div style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {currentRoom.compositeTimer.steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <div style={{ width: idx === (currentRoom.currentStep || 0) ? 12 : 8, height: idx === (currentRoom.currentStep || 0) ? 12 : 8, borderRadius: '50%', background: idx === (currentRoom.currentStep || 0) ? step.color : idx < (currentRoom.currentStep || 0) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', border: idx === (currentRoom.currentStep || 0) ? `2px solid ${step.color}40` : 'none', transition: 'all 0.3s', boxShadow: idx === (currentRoom.currentStep || 0) ? `0 0 15px ${step.color}60` : 'none', margin: '0 auto' }} />
                          {idx < currentRoom.compositeTimer.steps.length - 1 && <div style={{ width: 2, height: 12, background: idx < (currentRoom.currentStep || 0) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', margin: '0 auto' }} />}
                        </React.Fragment>
                      ))}
                    </div>
                    <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 100 }}>
                      {currentRoom.compositeTimer.steps.map((step, idx) => (
                        <div key={idx} style={{ fontSize: 10, color: idx === (currentRoom.currentStep || 0) ? step.color : idx < (currentRoom.currentStep || 0) ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)', fontWeight: idx === (currentRoom.currentStep || 0) ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.name}</div>
                      ))}
                    </div>
                  </>
                )}
                {currentRoom.timerType === 'composite' && currentRoom.compositeTimer?.steps && currentRoom.compositeTimer.steps.length > 0 && (
                  <div style={{ fontSize: 14, color: currentRoom.compositeTimer.steps[currentRoom.currentStep || 0]?.color || theme.accent, marginBottom: 8, fontWeight: 600 }}>
                    {currentRoom.compositeTimer.steps[currentRoom.currentStep || 0]?.name}
                  </div>
                )}
                <div style={{ fontSize: 48, fontWeight: 700, color: theme.accent, marginBottom: 8 }}>
                  {formatTime(Math.max(0, Math.floor((currentRoom.timer.endsAt - Date.now()) / 1000)))}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  {currentRoom.timerType === 'composite' ? `Step ${(currentRoom.currentStep || 0) + 1} of ${currentRoom.compositeTimer?.steps?.length || 0}` : 'Time Remaining'}
                </div>
              </div>
            )}

            {showRoomSettings && currentRoom && (
              <RoomSettingsModal
                theme={theme}
                room={currentRoom}
                onClose={() => setShowRoomSettings(false)}
                onSave={handleSaveRoomSettings}
              />
            )}

            <RoomExpirationModal
              isOpen={showRoomExpirationModal}
              roomId={currentRoom?.id}
              isOwner={currentRoom?.createdBy === RealtimeServiceFactory.getService()?.currentUserId}
              onExtend={handleExtendTimer}
              onClose={handleCloseRoom}
              gracePeriodSec={120}
              maxExtensionMinutes={30}
            />

            {/* Calendar Export Modal */}
            {calendarExportRoom && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  padding: 20
                }}
                onClick={() => setCalendarExportRoom(null)}
              >
                <div
                  style={{
                    background: theme.card,
                    borderRadius: 24,
                    padding: 32,
                    maxWidth: 500,
                    width: '100%'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 style={{ margin: 0, marginBottom: 24, fontSize: 20, fontWeight: 700 }}>
                    📅 Export "{calendarExportRoom.name}" to Calendar
                  </h2>
                  <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                      📆 Scheduled for: <strong>{new Date(calendarExportRoom.scheduledFor).toLocaleString()}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                      ⏱️ Duration: <strong>{Math.floor(calendarExportRoom.duration / 60)} minutes</strong>
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 24 }}>
                    Choose how to export this room to your calendar:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                      onClick={() => handleExportToICS(calendarExportRoom)}
                      style={{
                        background: 'rgba(34,197,94,0.2)',
                        border: '1px solid rgba(34,197,94,0.5)',
                        borderRadius: 12,
                        padding: 16,
                        color: '#22c55e',
                        cursor: 'pointer',
                        fontSize: 15,
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(34,197,94,0.3)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(34,197,94,0.2)'}
                    >
                      📥 Download .ics File
                    </button>
                    <button
                      onClick={() => handleExportToGoogleCalendar(calendarExportRoom)}
                      style={{
                        background: 'rgba(59,130,246,0.2)',
                        border: '1px solid rgba(59,130,246,0.5)',
                        borderRadius: 12,
                        padding: 16,
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: 15,
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(59,130,246,0.3)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(59,130,246,0.2)'}
                    >
                      📅 Add to Google Calendar
                    </button>
                    <button
                      onClick={() => setCalendarExportRoom(null)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        padding: 16,
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        fontSize: 15,
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Start Timer Button */}
            {!currentRoom.timer && (
              <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <button
                  onClick={() => startRoomTimer(currentRoom.duration)}
                  style={{
                    background: theme.accent,
                    border: 'none',
                    borderRadius: 12,
                    padding: '16px 32px',
                    color: theme.text,
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${theme.accent}40`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <Play size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Start {currentRoom.timerType === 'composite' ? 'Sequence' : 'Timer'}
                </button>
                {currentRoom.timerType === 'composite' && currentRoom.compositeTimer && (
                  <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    {currentRoom.compositeTimer.steps.length} steps • {Math.floor(currentRoom.duration / 60)} min total
                  </div>
                )}
              </div>
            )}

            {/* Chat */}
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Chat
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  maxHeight: 300,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                    No messages yet. Say hi! 👋
                  </div>
                ) : (
                  messages.map((msg) => {
                    const participant = currentRoom.participants?.[msg.userId];
                    const isMe = msg.userId === RealtimeServiceFactory.getService().currentUserId;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img 
                            src={participant?.avatarUrl || `https://api.dicebear.com/8.x/identicon/svg?seed=${encodeURIComponent(msg.userId)}`}
                            alt={participant?.displayName || 'Unknown'}
                            style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                            {participant?.displayName || 'Unknown'}
                          </div>
                        </div>
                        <div
                          style={{
                            background: isMe ? theme.accent : 'rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            padding: '8px 12px',
                            maxWidth: '70%',
                            wordBreak: 'break-word'
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: 12,
                    color: theme.text,
                    fontSize: 14
                  }}
                />
                <button
                  onClick={() => {
                    if (chatInputRef.current && chatInputRef.current.value.trim()) {
                      sendMessage(chatInputRef.current.value);
                      chatInputRef.current.value = '';
                    }
                  }}
                  style={{
                    background: theme.accent,
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 20px',
                    color: theme.text,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default FocusRoomsPanel;
