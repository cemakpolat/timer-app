import React, { useState } from 'react';
import { Play, Users, Clock, TrendingUp, Filter, Search, X, Trash2 } from 'lucide-react';
import {
  WORKOUT_CATEGORIES,
  WORKOUT_DIFFICULTIES,
  filterWorkouts,
  formatDuration,
  getExerciseStats
} from '../../services/workoutTemplates';
import { useTimers } from '../../hooks/useTimers';

// Get semi-transparent text color based on theme
const getTextOpacity = (theme, opacity = 0.7) => {
  const baseColor = theme.text;
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * WorkoutBrowser Component
 * Displays workout templates in a browsable grid with filters
 * Uses unified timerService via useTimers hook
 */
const WorkoutBrowser = ({ theme, savedSequences, onStartWorkout, onCreateRoom, onCreateRoomWithTemplate, onDeleteWorkout }) => {
  // Use unified timer hook to get templates + custom timers
  const { templates, customTimers, isLoading } = useTimers('workout');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSource, setShowSource] = useState('all'); // all, templates, custom

  // Convert custom timers to workout format (from timerService)
  const customWorkoutsFromService = customTimers.map(timer => ({
    id: timer.id,
    name: timer.name,
    description: timer.description || `Custom workout with ${timer.exercises?.length || 0} exercises`,
    category: timer.category || 'mixed',
    difficulty: timer.difficulty || 'intermediate',
    duration: timer.duration || (timer.exercises?.reduce((sum, ex) => sum + ex.duration, 0) || 0),
    exercises: timer.exercises || [],
    emoji: timer.emoji || '⭐',
    tags: timer.tags || ['custom'],
    metadata: {
      source: 'custom',
      isCustom: true
    }
  }));

  // Also convert legacy savedSequences for backward compatibility
  const legacyCustomWorkouts = (savedSequences || []).map(seq => ({
    id: `custom-${seq.name}`,
    name: seq.name,
    description: seq.description || `Custom workout with ${seq.exerciseCount || seq.steps?.length || 0} exercises`,
    category: seq.category || 'mixed',
    difficulty: seq.difficulty || 'intermediate',
    duration: seq.totalSeconds || (seq.duration * 60),
    exercises: seq.steps || [],
    emoji: seq.emoji || '⭐',
    tags: seq.tags || ['custom'],
    metadata: {
      source: 'custom',
      isCustom: true,
      isLegacy: true
    }
  }));

  // Combine all custom workouts
  const allCustomWorkouts = [...customWorkoutsFromService];
  
  // Merge templates and custom workouts with filters
  const allWorkouts = [
    ...templates.filter(w => {
      if (selectedCategory !== 'all' && w.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && w.difficulty !== selectedDifficulty) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return w.name.toLowerCase().includes(search) ||
               w.description.toLowerCase().includes(search) ||
               w.tags.some(t => t.toLowerCase().includes(search));
      }
      return true;
    }).map(w => ({
      ...w,
      metadata: { ...w.metadata, source: 'template', isCustom: false }
    })),
    ...allCustomWorkouts.filter(w => {
      if (selectedCategory !== 'all' && w.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && w.difficulty !== selectedDifficulty) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return w.name.toLowerCase().includes(search) ||
               w.description.toLowerCase().includes(search) ||
               w.tags.some(t => t.toLowerCase().includes(search));
      }
      return true;
    })
  ];

  // Apply source filter
  const filteredWorkouts = allWorkouts.filter(w => {
    if (showSource === 'templates' && w.metadata.source !== 'template') return false;
    if (showSource === 'custom' && w.metadata.source !== 'custom') return false;
    return true;
  });

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchTerm !== '';

  return (
    <div>
      {/* Source Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: theme.card, borderRadius: 10, padding: 6 }}>
        {[
          { label: 'All Workouts', value: 'all' },
          { label: 'Templates', value: 'templates' },
          { label: 'My Workouts', value: 'custom' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setShowSource(tab.value)}
            style={{
              flex: 1,
              background: showSource === tab.value ? theme.accent : 'transparent',
              border: 'none',
              borderRadius: 8,
              padding: '10px',
              color: showSource === tab.value ? '#ffffff' : theme.text,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {/* Search Input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 10,
                padding: '12px 40px 12px 12px',
                color: theme.text,
                fontSize: 14
              }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: getTextOpacity(theme, 0.5)
              }}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? theme.accent : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: 10,
              padding: '12px 16px',
              color: showFilters ? '#ffffff' : theme.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 500
            }}
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 10,
              padding: 16,
              marginBottom: 12
            }}
          >
            {/* Category Filter */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: getTextOpacity(theme, 0.7), display: 'block', marginBottom: 8 }}>
                Category
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    background: selectedCategory === 'all' ? theme.accent : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: selectedCategory === 'all' ? '#ffffff' : theme.text,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  All
                </button>
                {Object.entries(WORKOUT_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    style={{
                      background: selectedCategory === key ? cat.color : 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: selectedCategory === key ? '#ffffff' : theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div style={{ marginBottom: hasActiveFilters ? 16 : 0 }}>
              <label style={{ fontSize: 12, color: getTextOpacity(theme, 0.7), display: 'block', marginBottom: 8 }}>
                Difficulty
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedDifficulty('all')}
                  style={{
                    background: selectedDifficulty === 'all' ? theme.accent : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: selectedDifficulty === 'all' ? '#ffffff' : theme.text,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  All
                </button>
                {Object.entries(WORKOUT_DIFFICULTIES).map(([key, diff]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDifficulty(key)}
                    style={{
                      background: selectedDifficulty === key ? diff.color : 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: selectedDifficulty === key ? '#ffffff' : theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {diff.icon} {diff.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: theme.text,
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div style={{ fontSize: 13, color: getTextOpacity(theme, 0.6), marginBottom: 12 }}>
        {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''} found
      </div>

      {/* Workout Cards Grid */}
      {filteredWorkouts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10
          }}
        >
          <p style={{ color: getTextOpacity(theme, 0.6), marginBottom: 8 }}>No workouts found</p>
          <button
            onClick={handleClearFilters}
            style={{
              background: theme.accent,
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12
          }}
        >
          {filteredWorkouts.map((workout) => {
            const stats = getExerciseStats(workout.exercises);
            const category = WORKOUT_CATEGORIES[workout.category];
            const difficulty = WORKOUT_DIFFICULTIES[workout.difficulty];

            return (
              <div
                key={workout.id}
                style={{
                  background: theme.card,
                  borderRadius: 12,
                  padding: 16,
                  border: `1px solid rgba(255,255,255,0.05)`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = `1px solid ${theme.accent}`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 32 }}>{workout.emoji}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <span
                      style={{
                        background: category.color,
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {category.icon} {category.name}
                    </span>
                    <span
                      style={{
                        background: difficulty.color,
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                    >
                      {difficulty.icon} {difficulty.name}
                    </span>
                  </div>
                </div>

                {/* Workout Name */}
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: theme.text }}>
                  {workout.name}
                </h3>

                {/* Description */}
                <p style={{ fontSize: 13, color: getTextOpacity(theme, 0.7), marginBottom: 12, lineHeight: 1.5 }}>
                  {workout.description}
                </p>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 12, color: getTextOpacity(theme, 0.6) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} />
                    {formatDuration(workout.duration)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} />
                    {stats.work} exercises
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onStartWorkout(workout)}
                    style={{
                      flex: 1,
                      background: theme.accent,
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Play size={14} /> Start Solo
                  </button>
                  <button
                    onClick={() => {
                      if (onCreateRoomWithTemplate) {
                        onCreateRoomWithTemplate(workout);
                      } else if (onCreateRoom) {
                        onCreateRoom(workout);
                      }
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Users size={14} />
                  </button>
                  {workout.metadata?.isCustom && onDeleteWorkout && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${workout.name}"?`)) {
                          onDeleteWorkout(workout.name.replace('custom-', ''));
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkoutBrowser;
