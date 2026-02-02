import React, { useState } from 'react';
import { Play, Save, ChevronUp, ChevronDown, ChevronRight, X } from 'lucide-react';
import { WORKOUT_CATEGORIES, WORKOUT_DIFFICULTIES, COMMON_TAGS } from '../../services/routineTemplates';

const SESSION_TYPES = {
  routine: { name: 'Routine', icon: '📝', description: 'Multi-step routines and sequences' },
  timer: { name: 'Timer', icon: '⏱️', description: 'Simple countdown timers' },
  meeting: { name: 'Meeting', icon: '👥', description: 'Meeting and presentation timers' },
  focus: { name: 'Focus Session', icon: '🎯', description: 'Concentration and productivity sessions' }
};

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
 * CompositePanel Component
 * Handles sequence builder for creating multi-step timer sequences
 */
const CompositePanel = ({
  theme,
  showBuilder,
  setShowBuilder,
  seqName,
  setSeqName,
  sequence,
  setSequence,
  moveSequenceStep,
  startSequence,
  saveSequence,
  inputStyle
}) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('mixed');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [sessionType, setSessionType] = useState('routine');
  const [emoji, setEmoji] = useState('⭐');
  const [tagsInput, setTagsInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isRoomCompatible, setIsRoomCompatible] = useState(true);
  const [recommendedParticipants, setRecommendedParticipants] = useState(2);

  const parseTags = (input) => {
    return input.split(',').map(t => t.trim()).filter(Boolean);
  };

  const getTagSuggestions = () => {
    const currentTags = parseTags(tagsInput);
    const lastTag = currentTags[currentTags.length - 1] || '';
    if (lastTag.length < 2) return [];
    
    return COMMON_TAGS.filter(tag => 
      tag.toLowerCase().includes(lastTag.toLowerCase()) && 
      !currentTags.slice(0, -1).includes(tag)
    ).slice(0, 5);
  };

  const addTagSuggestion = (tag) => {
    const currentTags = parseTags(tagsInput);
    currentTags[currentTags.length - 1] = tag;
    setTagsInput(currentTags.join(', ') + ', ');
    setShowTagSuggestions(false);
  };

  const handleSave = () => {
    // Validation: require name and category
    if (!seqName || seqName.trim() === '') {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Please enter a sequence name', type: 'error', ttl: 3000 } }));
      return;
    }
    if (!category || category === 'all') {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Please select a category', type: 'error', ttl: 3000 } }));
      return;
    }

    const metadata = {
      description,
      category,
      difficulty,
      sessionType,
      emoji,
      tags: parseTags(tagsInput),
      isRoomCompatible,
      recommendedParticipants
    };

    saveSequence(metadata);
  };
  return (
    <div style={{ background: theme.card, borderRadius: theme.borderRadius, padding: 15, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Routine Builder</h2>
        <button 
          onClick={() => setShowBuilder(!showBuilder)} 
          style={{ 
            background: theme.accent, 
            border: 'none', 
            borderRadius: theme.borderRadius, 
            padding: '8px 16px', 
            color: 'white', 
            cursor: 'pointer', 
            fontSize: 14, 
            fontWeight: 600 
          }}
        >
          {showBuilder ? 'Close' : 'Build Routine'}
        </button>
      </div>
      <div style={{ fontSize: 13, color: getTextOpacity(theme, 0.7), marginBottom: 10 }}>
        <span>
          <b>Routine</b>: A sequence of timers for multi-step activities (e.g., warm-up → workout → cool-down). For single timers, use the <b>Timers</b> tab.
        </span>
      </div>

      {showBuilder && (
        <>
          <input 
            type="text" 
            placeholder="Sequence name" 
            value={seqName} 
            onChange={(e) => setSeqName(e.target.value)} 
            style={inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.1), theme.borderRadius)} 
          />
          
          {sequence.length > 0 && (
            <div style={{ marginBottom: 16, maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
              {sequence.map((timer, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: theme.borderRadius, 
                    padding: 15, 
                    marginBottom: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12 
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button 
                      onClick={() => moveSequenceStep(idx, -1)} 
                      disabled={idx === 0} 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: idx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)', 
                        cursor: idx === 0 ? 'default' : 'pointer', 
                        padding: 0 
                      }}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button 
                      onClick={() => moveSequenceStep(idx, 1)} 
                      disabled={idx === sequence.length - 1} 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: idx === sequence.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)', 
                        cursor: idx === sequence.length - 1 ? 'default' : 'pointer', 
                        padding: 0 
                      }}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  <div style={{ fontSize: 14, color: getTextOpacity(theme, 0.5) }}>
                    {idx + 1}.
                  </div>
                  
                  <div 
                    style={{ 
                      width: 4, 
                      height: 24, 
                      borderRadius: theme.borderRadius, 
                      background: timer.color 
                    }} 
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {timer.name}
                    </div>
                    <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.5) }}>
                      {timer.duration} {timer.unit}
                    </div>
                  </div>
                  
                  {idx < sequence.length - 1 && (
                    <ChevronRight size={16} style={{ color: getTextOpacity(theme, 0.3) }} />
                  )}
                  
                  <button 
                    onClick={() => setSequence(prev => prev.filter((_, i) => i !== idx))} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: getTextOpacity(theme, 0.5), 
                      cursor: 'pointer', 
                      padding: 4 
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <div style={{ marginTop: 12, marginBottom: 12, display: 'grid', gap: 8 }}>
                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  style={{ ...inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.06), theme.borderRadius), resize: 'vertical' }}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} style={{ ...inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.06), theme.borderRadius), flex: 1 }}>
                    {Object.keys(SESSION_TYPES).map(key => (
                      <option key={key} value={key}>{SESSION_TYPES[key].icon} {SESSION_TYPES[key].name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.06), theme.borderRadius), flex: 1 }}>
                    {Object.keys(WORKOUT_CATEGORIES).map(key => (
                      <option key={key} value={key}>{WORKOUT_CATEGORIES[key].name}</option>
                    ))}
                  </select>

                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ ...inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.06), theme.borderRadius), width: 160 }}>
                    {Object.keys(WORKOUT_DIFFICULTIES).map(key => (
                      <option key={key} value={key}>{WORKOUT_DIFFICULTIES[key].name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} style={{ width: 84, ...inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.06), theme.borderRadius) }} />
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="tags (comma separated)" 
                      value={tagsInput} 
                      onChange={(e) => {
                        setTagsInput(e.target.value);
                        setShowTagSuggestions(true);
                      }}
                      onFocus={() => setShowTagSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                      style={{ width: '100%', ...inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.06), theme.borderRadius) }} 
                    />
                    {showTagSuggestions && getTagSuggestions().length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: theme.card,
                        border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                        borderRadius: theme.borderRadius,
                        zIndex: 10,
                        maxHeight: 120,
                        overflowY: 'auto'
                      }}>
                        {getTagSuggestions().map((tag, idx) => (
                          <div
                            key={tag}
                            onClick={() => addTagSuggestion(tag)}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              color: theme.text,
                              borderBottom: idx < getTagSuggestions().length - 1 ? `1px solid ${getTextOpacity(theme, 0.05)}` : 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.background = getTextOpacity(theme, 0.05)}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: getTextOpacity(theme, 0.7) }}>
                    <input type="checkbox" checked={isRoomCompatible} onChange={(e) => setIsRoomCompatible(e.target.checked)} />
                    Available for Focus Rooms
                  </label>
                  <input type="number" min={1} value={recommendedParticipants} onChange={(e) => setRecommendedParticipants(parseInt(e.target.value || '1'))} style={{ width: 140, ...inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.06), theme.borderRadius) }} placeholder="Recommended participants" />
                </div>

                {/* Preview */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: theme.borderRadius, color: getTextOpacity(theme, 0.8) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ fontSize: 24 }}>{emoji}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{seqName || 'Untitled'}</div>
                        <div style={{ fontSize: 12 }}>{description || 'No description'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 12 }}>
                      <div>{SESSION_TYPES[sessionType]?.name || sessionType}</div>
                      <div>{Object.keys(WORKOUT_CATEGORIES).includes(category) ? WORKOUT_CATEGORIES[category].name : category}</div>
                      <div>{WORKOUT_DIFFICULTIES[difficulty]?.name || difficulty}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12 }}>{sequence.length} steps • {Math.ceil((sequence.reduce((sum, t) => sum + (t.unit === 'sec' ? t.duration : t.duration * 60), 0))/60)} min</div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={startSequence} 
                    style={{ 
                      flex: 1, 
                      background: theme.accent, 
                      border: 'none', 
                      borderRadius: theme.borderRadius, 
                      padding: 15, 
                      color: 'white', 
                      cursor: 'pointer', 
                      fontSize: 14, 
                      fontWeight: 600 
                    }}
                  >
                    <Play size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Start
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={!seqName || !category} 
                    style={{ 
                      flex: 1, 
                      background: seqName && category ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', 
                      border: 'none', 
                      borderRadius: theme.borderRadius, 
                      padding: 15, 
                      color: theme.text, 
                      cursor: seqName && category ? 'pointer' : 'not-allowed', 
                      fontSize: 14, 
                      fontWeight: 600, 
                      opacity: seqName && category ? 1 : 0.5 
                    }}
                  >
                    <Save size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div 
            style={{ 
              padding: 15, 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: theme.borderRadius, 
              fontSize: 13, 
              color: getTextOpacity(theme, 0.6) 
            }}
          >
            💡 Click + on timers below to build sequence
          </div>
        </>
      )}
    </div>
  );
};

export default CompositePanel;
