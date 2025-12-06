import React, { useState } from 'react';
import { Play, Users, Clock, TrendingUp, Filter, Search, X, Trash2, Plus, Edit3, Copy } from 'lucide-react';
import {
  WORKOUT_CATEGORIES,
  WORKOUT_DIFFICULTIES,
  formatDuration,
  getExerciseStats
} from '../../services/routineTemplates';
import { useTimers } from '../../hooks/useTimers';
import { deleteCustomTimer } from '../../services/timerService';
import { WORKOUT_TEMPLATES } from '../../services/workoutTemplates';
import { useModal } from '../../context/ModalContext';

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
 * RoutineBrowser Component
 * Displays routine templates in a browsable grid with filters
 * Uses unified timerService via useTimers hook
 */
const RoutineBrowser = ({ theme, savedSequences, savedTimers = [], onStartRoutine, onCreateRoom, onCreateRoomWithTemplate, onDeleteRoutine, onCloneTemplate, onEditRoutine, onCreateNewRoutine }) => {
  // Use unified timer hook to get templates + custom timers
  const { routineTemplates, customTimers, createTimer } = useTimers('routine');
  const modal = useModal();
  const templates = [...(routineTemplates || []), ...WORKOUT_TEMPLATES].filter((t, index, self) => 
    index === self.findIndex(r => r.id === t.id)
  );

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSource, setShowSource] = useState('templates'); // templates, my-routines
  const [selectedTags, setSelectedTags] = useState([]);

  // Convert custom timers to routine format (from timerService)
  const customRoutinesFromService = customTimers.map(timer => {
    const hasSteps = timer.steps && timer.steps.length > 0;
    const hasExercises = timer.exercises && timer.exercises.length > 0;
    const isSequence = timer.isSequence || hasSteps || (!hasExercises && hasSteps);
    const itemCount = isSequence ? (timer.steps?.length || 0) : (timer.exercises?.length || 0);
    const itemType = isSequence ? 'steps' : 'exercises';
    
    return {
      id: timer.id,
      name: timer.name,
      description: timer.description || `Custom routine with ${itemCount} ${itemType}`,
      category: timer.category || 'mixed',
      difficulty: timer.difficulty || 'intermediate',
      duration: timer.duration || (timer.exercises?.reduce((sum, ex) => sum + ex.duration, 0) || 0),
      exercises: timer.exercises || timer.steps || [],
      emoji: timer.emoji || '⭐',
      tags: timer.tags || ['custom'],
      metadata: {
        source: timer.metadata?.source || 'custom',
        isCustom: timer.metadata?.isCustom !== undefined ? timer.metadata.isCustom : true,
        isSequence: isSequence
      }
    };
  });

  // Combine all custom routines from timerService
  const allCustomRoutines = [...customRoutinesFromService];
  
  // Map legacy/simple saved timers (from App.js `saved`) into routine-like entries so they appear in the browser
  const savedTimerRoutines = (Array.isArray(savedTimers) ? savedTimers : []).map(t => ({
    id: t.id || `saved-${(t.name || '').replace(/\s+/g, '-').toLowerCase()}`,
    name: t.name || 'Timer',
    description: t.description || `${t.duration || t.min || 0} ${t.unit || (t.min ? 'min' : 'sec')}`,
    category: t.group || 'mixed',
    difficulty: t.difficulty || 'beginner',
    duration: (t.unit === 'min' ? (t.duration || t.min || 0) * 60 : (t.duration || t.min || 0)),
    exercises: [],
    emoji: t.emoji || (t.group === 'Fitness' ? '💪' : '⏱️'),
    tags: t.tags || ['saved-timer'],
    templateType: t.templateType || 'timer',
    metadata: {
      source: t.metadata?.source || 'legacy',
      isCustom: true,
      isTimer: true,
      templateType: t.templateType || 'timer'
    }
  }));
  
  // Helper to filter routines by category, difficulty, and search term
  const filterRoutinesList = (routines) => {
    return routines.filter(w => {
      if (selectedCategory !== 'all' && w.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && w.difficulty !== selectedDifficulty) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return w.name.toLowerCase().includes(search) ||
               w.description.toLowerCase().includes(search) ||
               w.tags.some(t => t.toLowerCase().includes(search));
      }
      return true;
    });
  };

  // Map saved sequences (from App) into routine-like entries
  const savedSequenceRoutines = (Array.isArray(savedSequences) ? savedSequences : [])
    .filter(s => {
      // Exclude routines with exact names (case-insensitive, trimmed)
      const name = (s.name || '').toLowerCase().trim();
      const excludeNames = [
        'morning yoga flow 2',
        'morning yoga flow 3',
        'morning yoga flow 4',
        'morning yoga flow 33'
      ];
      return !excludeNames.some(exclude => name === exclude);
    })
    .map(s => ({
      id: s.id || `seq-${(s.name || '').replace(/\s+/g, '-').toLowerCase()}`,
      name: s.name,
      description: s.description || `Sequence with ${s.steps?.length || 0} steps`,
      category: s.category || 'mixed',
      difficulty: s.difficulty || 'intermediate',
      duration: s.totalSeconds || (s.duration ? (s.duration * 60) : 0),
      exercises: s.steps || s.exercises || [],
      emoji: s.emoji || '⭐',
      tags: s.tags || ['sequence'],
      templateType: 'routine',
      metadata: {
        source: s.metadata?.source === 'custom' ? 'custom' : 'template',
        isCustom: s.metadata?.source === 'custom',
        isSequence: true,
        isRoomCompatible: !!s.isRoomCompatible
      }
    }))
    // Remove duplicates by name, but keep only one 'morning yoga flow'
    .filter((routine, index, self) => {
      const name = routine.name ? routine.name.toLowerCase() : '';
      if (name.includes('morning yoga flow')) {
        // Only keep the first occurrence
        return index === self.findIndex(r => (r.name ? r.name.toLowerCase() : '') === name);
      }
      // For all others, keep only the first occurrence by name
      return index === self.findIndex(r => r.name === routine.name);
    });

  // Merge templates, saved sequences, custom routines and saved timers with filters
  const allRoutines = [
    ...filterRoutinesList(templates).map(w => ({
      ...w,
      // Preserve existing metadata source if it's custom, otherwise mark as template
      metadata: { ...w.metadata, source: w.metadata?.source === 'custom' ? 'custom' : 'template', isCustom: w.metadata?.source === 'custom' }
    })),
    ...filterRoutinesList(savedSequenceRoutines),
    ...filterRoutinesList(allCustomRoutines).map(r => ({
      ...r,
      metadata: { ...r.metadata, source: r.metadata?.source === 'custom' ? 'custom' : 'template', isCustom: r.metadata?.source === 'custom' }
    })),
    ...filterRoutinesList(savedTimerRoutines).map(r => ({
      ...r,
      metadata: { ...r.metadata, source: 'template', isCustom: false }
    }))
  ];

  // Remove duplicates by name (keep first occurrence)
  const deduplicatedRoutines = allRoutines.filter((routine, index, self) => 
    index === self.findIndex(r => r.name === routine.name)
  );

  // Filter to only include multi-step routines (exclude single timers)
  const multiStepRoutines = deduplicatedRoutines.filter(routine => 
    routine.exercises && Array.isArray(routine.exercises) && routine.exercises.length > 0
  );

  // Collect all unique tags for filtering
  const allTags = [...new Set(multiStepRoutines.flatMap(r => r.tags || []))].sort();

  // Apply source filter: Show only templates in Template Routines, only custom in My Routines
  const filteredRoutines = multiStepRoutines.filter(routine => {
    if (showSource === 'templates' && routine.metadata?.source !== 'template') return false;
    if (showSource === 'my-routines' && routine.metadata?.source !== 'custom') return false;
    if (selectedTags.length > 0 && !selectedTags.some(tag => routine.tags?.includes(tag))) return false;
    return true;
  });

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSearchTerm('');
    setSelectedTags([]);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchTerm !== '' || selectedTags.length > 0;

  return (
    <div>
      {/* Source Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: theme.card, borderRadius: 10, padding: 6 }}>
        {[
            { label: 'Template Routines', value: 'templates' },
            { label: 'My Routines', value: 'my-routines' }
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
              placeholder="Search routines..."
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

          {/* Create New Routine Button */}
          <button
            onClick={() => {
              if (onCreateNewRoutine) {
                onCreateNewRoutine();
              }
            }}
            style={{
              background: theme.accent,
              border: 'none',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Plus size={16} />
            New Routine
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

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div style={{ marginBottom: hasActiveFilters ? 16 : 0 }}>
                <label style={{ fontSize: 12, color: getTextOpacity(theme, 0.7), display: 'block', marginBottom: 8 }}>
                  Tags
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {allTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(prev => prev.filter(t => t !== tag));
                          } else {
                            setSelectedTags(prev => [...prev, tag]);
                          }
                        }}
                        style={{
                          background: isSelected ? theme.accent : 'rgba(255,255,255,0.05)',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 12px',
                          color: isSelected ? '#ffffff' : theme.text,
                          cursor: 'pointer',
                          fontSize: 13
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
        {filteredRoutines.length} routine{filteredRoutines.length !== 1 ? 's' : ''} found
      </div>

      {/* Routine Cards Grid */}
      {filteredRoutines.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10
          }}
        >
          <p style={{ color: getTextOpacity(theme, 0.6), marginBottom: 8 }}>No routines found</p>
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
          {filteredRoutines.map((routine) => {
            const stats = getExerciseStats(routine.exercises);
            const category = WORKOUT_CATEGORIES[routine.category] || { name: routine.category || 'Other', color: '#6b7280', icon: '❓' };
            const difficulty = WORKOUT_DIFFICULTIES[routine.difficulty] || { name: routine.difficulty || 'Unknown', color: '#9ca3af', icon: '⭐' };

            return (
              <div
                key={routine.id}
                style={{
                  background: theme.card,
                  borderRadius: 12,
                  padding: 16,
                  border: `1px solid rgba(255,255,255,0.05)`,
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 280
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
                  <div style={{ fontSize: 32 }}>{routine.emoji}</div>
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

                {/* Routine Name */}
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: theme.text }}>
                  {routine.name}
                </h3>

                {/* Description */}
                <p style={{ fontSize: 13, color: getTextOpacity(theme, 0.7), marginBottom: 12, lineHeight: 1.5, flex: 1 }}>
                  {routine.description}
                </p>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 12, color: getTextOpacity(theme, 0.6) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} />
                    {formatDuration(routine.duration)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} />
                    {stats.work} {routine.metadata?.isSequence ? 'steps' : 'exercises'}
                  </div>
                </div>

                {/* Action Buttons - Always at bottom */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => onStartRoutine(routine)}
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
                        onCreateRoomWithTemplate(routine);
                      } else if (onCreateRoom) {
                        onCreateRoom(routine);
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
                    {routine.metadata?.source === 'template' && (
                    <button
                      onClick={async () => {
                        try {
                          const cloneData = {
                            ...routine,
                            id: `custom-${Date.now()}`,
                            name: `${routine.name} (Copy)`,
                            metadata: { 
                              source: 'custom', 
                              isCustom: true,
                              isTemplate: false
                            },
                            templateType: routine.templateType || 'routine'
                          };
                          if (typeof onCloneTemplate === 'function') {
                            await onCloneTemplate(cloneData);
                          } else {
                            // Fallback to local create if parent didn't provide handler
                            await createTimer(cloneData);
                          }
                          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Template copied to My Routines', type: 'success', ttl: 3000 } }));
                        } catch (err) {
                          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Failed to copy template', type: 'error', ttl: 3000 } }));
                        }
                      }}
                      title="Copy template to My Routines"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  )}
                  {routine.metadata?.isCustom && (
                    <button
                      onClick={() => {
                        if (onEditRoutine) {
                          onEditRoutine(routine);
                        }
                      }}
                      title="Edit routine"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                  {routine.metadata?.source === 'custom' && (
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          const confirmed = modal ? await modal.confirm(`Delete "${routine.name}"?`, 'Delete Routine') : window.confirm(`Delete "${routine.name}"?`);
                          if (confirmed) {
                            // Delete from customTimers localStorage
                            deleteCustomTimer(routine.id);
                            
                            // Also delete from legacy saved state if onDeleteRoutine is provided
                            if (onDeleteRoutine) {
                              onDeleteRoutine(routine.name);
                            }
                            
                            // Trigger immediate update for same-tab listeners
                            window.dispatchEvent(new CustomEvent('timers-updated'));
                            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Routine deleted', type: 'success', ttl: 2000 } }));
                          }
                        } catch (error) {
                          console.error('Error deleting routine:', error);
                          // Fallback to window.confirm if modal fails
                          if (window.confirm(`Delete "${routine.name}"?`)) {
                            deleteCustomTimer(routine.id);
                            if (onDeleteRoutine) {
                              onDeleteRoutine(routine.name);
                            }
                            window.dispatchEvent(new CustomEvent('timers-updated'));
                            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Routine deleted', type: 'success', ttl: 2000 } }));
                          }
                        }
                      }}
                      title="Delete routine"
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

export default RoutineBrowser;
