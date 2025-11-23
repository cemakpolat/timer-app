import React, { useState } from 'react';
import { Search, Plus, Users, Clock } from 'lucide-react';

/**
 * RoomDiscoveryPanel Component
 * 
 * Displays rooms organized by category/tags with search and filtering capabilities.
 * Features:
 * - Filter rooms by tags (Work, Study, Creative, Fitness, Wellness, Other)
 * - Search rooms by name and description
 * - Display room stats (participants, duration)
 * - Quick join button
 * 
 * Props:
 * - theme: Current theme object
 * - rooms: Array of available rooms
 * - onJoinRoom: Callback when user clicks join
 * - onCreateRoom: Callback to create new room
 * - currentUserId: Current user ID to check ownership
 * - currentRoom: Currently joined room (disable join if in one)
 */

const ROOM_TAGS = [
  { id: 'work', label: 'Work', color: '#ef4444', emoji: '💼' },
  { id: 'study', label: 'Study', color: '#3b82f6', emoji: '📚' },
  { id: 'creative', label: 'Creative', color: '#f59e0b', emoji: '🎨' },
  { id: 'fitness', label: 'Fitness', color: '#10b981', emoji: '💪' },
  { id: 'wellness', label: 'Wellness', color: '#8b5cf6', emoji: '🧘' },
  { id: 'other', label: 'Other', color: '#6b7280', emoji: '⭐' }
];

export default function RoomDiscoveryPanel({
  theme,
  rooms,
  onJoinRoom,
  onCreateRoom,
  currentUserId,
  currentRoom
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('participants'); // 'participants', 'name', 'newest'

  // Filter and sort rooms
  const filteredRooms = rooms
    .filter(room => {
      // Filter by search term
      const matchesSearch = !searchTerm || 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.includes(room.tag || 'other');

      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (sortBy === 'participants') {
        // Sort by participant count (descending)
        const countA = a.participants?.length || 0;
        const countB = b.participants?.length || 0;
        return countB - countA;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const getTagInfo = (tagId) => {
    return ROOM_TAGS.find(t => t.id === tagId) || ROOM_TAGS[ROOM_TAGS.length - 1];
  };

  return (
    <div style={{ padding: '0 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px 0', color: theme.text }}>
          Discover Focus Rooms
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          Find the perfect room to focus with others
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <Search size={18} style={{ 
          position: 'absolute', 
          left: 16, 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.5)'
        }} />
        <input
          type="text"
          placeholder="Search rooms by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            background: theme.card,
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 12,
            padding: '12px 12px 12px 44px',
            color: theme.text,
            fontSize: 14,
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Tag Filters */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
          FILTER BY CATEGORY
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ROOM_TAGS.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                background: selectedTags.includes(tag.id) 
                  ? `${tag.color}20`
                  : 'transparent',
                border: selectedTags.includes(tag.id)
                  ? `1px solid ${tag.color}`
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9999,
                color: selectedTags.includes(tag.id) ? '#000' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tag.color;
                e.currentTarget.style.background = `${tag.color}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = selectedTags.includes(tag.id)
                  ? tag.color
                  : 'rgba(255,255,255,0.08)';
                e.currentTarget.style.background = selectedTags.includes(tag.id)
                  ? `${tag.color}20`
                  : 'transparent';
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Sort by:</span>
        {['participants', 'name', 'newest'].map(option => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            style={{
              padding: '6px 12px',
              background: sortBy === option ? theme.accent : 'rgba(255,255,255,0.05)',
              border: sortBy === option ? `1px solid ${theme.accent}` : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: sortBy === option ? '#000' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            {option === 'participants' && 'Participants'}
            {option === 'name' && 'Name'}
            {option === 'newest' && 'Newest'}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          {filteredRooms.map(room => {
            const tag = getTagInfo(room.tag);
            const participantCount = room.participants?.length || 0;
            const isFull = room.maxParticipants && participantCount >= room.maxParticipants;
            const isCurrentRoom = currentRoom?.id === room.id;

            return (
              <div
                key={room.id}
                style={{
                  background: theme.card,
                  border: `1px solid ${isCurrentRoom ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10,
                  padding: 15,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentRoom) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentRoom) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Tag Badge */}
                <div style={{ marginBottom: 12, display: 'inline-block' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 8px',
                    background: `${tag.color}20`,
                    color: tag.color,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {tag.emoji} {tag.label}
                  </span>
                </div>

                {/* Room Name */}
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: theme.text }}>
                  {room.name}
                </h3>

                {/* Description */}
                {room.description && (
                  <p style={{ 
                    fontSize: 13, 
                    color: 'rgba(255,255,255,0.6)',
                    margin: '0 0 12px 0',
                    lineHeight: 1.4
                  }}>
                    {room.description.substring(0, 80)}
                    {room.description.length > 80 ? '...' : ''}
                  </p>
                )}

                {/* Room Stats */}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={14} />
                    {participantCount}/{room.maxParticipants || '∞'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} />
                    {room.duration ? `${Math.floor(room.duration / 60)}m` : 'Flexible'}
                  </div>
                </div>

                {/* Status Badge */}
                {isCurrentRoom && (
                  <div style={{
                    marginBottom: 12,
                    padding: '6px 12px',
                    background: `${theme.accent}20`,
                    color: theme.accent,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    ✓ You are in this room
                  </div>
                )}

                {/* Join Button */}
                <button
                  onClick={() => onJoinRoom(room.id)}
                  disabled={isFull || isCurrentRoom}
                  style={{
                    width: '100%',
                    padding: 10,
                    background: isCurrentRoom 
                      ? 'rgba(255,255,255,0.1)'
                      : isFull
                      ? 'rgba(255,255,255,0.05)'
                      : theme.accent,
                    color: isCurrentRoom || isFull ? 'rgba(255,255,255,0.5)' : '#000',
                    border: 'none',
                    borderRadius: 8,
                    cursor: isCurrentRoom || isFull ? 'default' : 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {isCurrentRoom ? 'Current Room' : isFull ? 'Room Full' : 'Join Room'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '15px',
          background: theme.card,
          borderRadius: 10,
          border: `1px solid rgba(255,255,255,0.1)`,
          color: 'rgba(255,255,255,0.6)'
        }}>
          <p style={{ fontSize: 14, margin: 0 }}>
            {rooms.length === 0 
              ? 'No rooms available. Create one to get started!'
              : 'No rooms match your filters.'}
          </p>
        </div>
      )}

      {/* Create Room Button */}
      <div style={{ textAlign: 'center', paddingBottom: 40 }}>
        <button
          onClick={onCreateRoom}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            background: theme.accent,
            color: '#000',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <Plus size={18} /> Create New Room
        </button>
      </div>
    </div>
  );
}
