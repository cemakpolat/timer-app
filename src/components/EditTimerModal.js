import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';

const inputStyleSimple = (theme, accentColor, textColor = '#ffffff') => ({
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: theme.borderRadius,
  padding: 10,
  color: textColor,
  boxSizing: 'border-box'
});

const smallInput = (theme, accentColor, textColor = '#ffffff') => ({
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: theme.borderRadius,
  padding: 8,
  color: textColor,
  boxSizing: 'border-box'
});

const EditTimerModal = ({ theme, timer, onSave, onClose }) => {
  const [local, setLocal] = useState(timer || {});
  const [openAccordion, setOpenAccordion] = useState(null);

  useEffect(() => setLocal(timer || {}), [timer]);

  if (!timer) return null;

  const updateStep = (index, changes) => {
    const steps = (local.exercises || []).slice();
    steps[index] = { ...steps[index], ...changes };
    setLocal(prev => ({ ...prev, exercises: steps }));
  };

  const addStep = () => {
    const newStep = { name: 'New Step', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' };
    setLocal(prev => ({ ...prev, exercises: [...(prev.exercises || []), newStep] }));
  };

  const removeStep = (index) => {
    const steps = (local.exercises || []).slice();
    steps.splice(index, 1);
    setLocal(prev => ({ ...prev, exercises: steps }));
  };

  const moveStep = (index, dir) => {
    const steps = (local.exercises || []).slice();
    const target = index + dir;
    if (target < 0 || target >= steps.length) return;
    const tmp = steps[target];
    steps[target] = steps[index];
    steps[index] = tmp;
    setLocal(prev => ({ ...prev, exercises: steps }));
  };

  const totalDuration = (local.exercises || []).reduce((sum, s) => {
    const dur = s.unit === 'min' ? (s.duration || 0) * 60 : (s.duration || 0);
    return sum + dur;
  }, 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '10px' }}>
      <div style={{ width: '100%', maxWidth: 980, background: theme.bg, borderRadius: theme.borderRadius, padding: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Edit Workout</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: theme.text, cursor: 'pointer', fontSize: '1.5rem', padding: '4px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Basic Info - Stack on mobile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={local.name || ''} onChange={(e) => setLocal(prev => ({ ...prev, name: e.target.value }))} placeholder="Name" style={inputStyleSimple(theme, theme.accent, theme.text)} />
              <input value={local.emoji || ''} onChange={(e) => setLocal(prev => ({ ...prev, emoji: e.target.value }))} placeholder="Emoji" style={inputStyleSimple(theme, theme.accent, theme.text)} />
            </div>

            <textarea value={local.description || ''} onChange={(e) => setLocal(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={2} style={inputStyleSimple(theme, theme.accent, theme.text)} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={local.category || ''} onChange={(e) => setLocal(prev => ({ ...prev, category: e.target.value }))} placeholder="Category" style={inputStyleSimple(theme, theme.accent, theme.text)} />
              <input value={local.difficulty || ''} onChange={(e) => setLocal(prev => ({ ...prev, difficulty: e.target.value }))} placeholder="Difficulty" style={inputStyleSimple(theme, theme.accent, theme.text)} />
            </div>

            <input value={(local.tags || []).join(', ')} onChange={(e) => setLocal(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="Tags (comma separated)" style={inputStyleSimple(theme, theme.accent, theme.text)} />
          </div>

          {/* Room settings - Stack on mobile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: theme.borderRadius }}>
            <label style={{ color: theme.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={!!local.metadata?.isRoomCompatible} onChange={(e) => setLocal(prev => ({ ...prev, metadata: { ...(prev.metadata||{}), isRoomCompatible: e.target.checked } }))} />
              <span>Available for Focus Rooms</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="number" min={1} value={local.metadata?.recommendedParticipants || ''} onChange={(e) => setLocal(prev => ({ ...prev, metadata: { ...(prev.metadata||{}), recommendedParticipants: parseInt(e.target.value || '0') } }))} placeholder="Recommended participants" style={inputStyleSimple(theme, theme.accent, theme.text)} />
              <div style={{ color: theme.text, fontSize: 13, textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: theme.borderRadius }}>{local.exercises?.length || 0} steps • {Math.ceil(totalDuration/60)} min</div>
            </div>
          </div>

          {/* Exercise editor list - Mobile responsive */}
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: theme.borderRadius, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <strong style={{ color: theme.text }}>Exercises / Steps</strong>
              <button onClick={addStep} style={{ background: theme.accent, border: 'none', color: '#000', borderRadius: theme.borderRadius, padding: '8px 12px', cursor: 'pointer', fontSize: '0.9rem' }}>+ Add Step</button>
            </div>

            {(local.exercises || []).map((step, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div key={idx} style={{ marginBottom: 8, border: '1px solid rgba(255,255,255,0.05)', borderRadius: theme.borderRadius, overflow: 'hidden' }}>
                  {/* Accordion Header */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.01)',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onClick={() => setOpenAccordion(isOpen ? null : idx)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                  >
                    {/* Left side: Move up/down arrows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 12 }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveStep(idx, -1); }} 
                        disabled={idx === 0} 
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: idx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', 
                          cursor: idx === 0 ? 'default' : 'pointer', 
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveStep(idx, 1); }} 
                        disabled={idx === (local.exercises || []).length - 1} 
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: idx === (local.exercises || []).length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', 
                          cursor: idx === (local.exercises || []).length - 1 ? 'default' : 'pointer', 
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Step number and color indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 12 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', minWidth: '20px' }}>{idx + 1}.</span>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: step.color || '#ef4444' }} />
                    </div>

                    {/* Step name and summary */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.text, fontWeight: 500 }}>{step.name || 'Unnamed Step'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                          {step.duration || 0} {step.unit || 'sec'} • {step.type || 'work'}
                        </span>
                        <ChevronRight 
                          size={16} 
                          style={{ 
                            color: 'rgba(255,255,255,0.4)', 
                            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isOpen && (
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.005)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                      {/* Step name */}
                      <div style={{ marginBottom: 12 }}>
                        <input value={step.name || ''} onChange={(e) => updateStep(idx, { name: e.target.value })} placeholder="Step name" style={{ width: '100%', ...inputStyleSimple(theme, theme.accent, theme.text) }} />
                      </div>

                      {/* Step details - responsive grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: theme.text, marginBottom: 4 }}>Duration</label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="number" value={step.duration || 0} onChange={(e) => updateStep(idx, { duration: parseInt(e.target.value || '0') })} style={{ flex: 1, minWidth: 0, ...smallInput(theme, theme.accent, theme.text) }} />
                            <select value={step.unit || 'sec'} onChange={(e) => updateStep(idx, { unit: e.target.value })} style={{ width: '80px', flexShrink: 0, ...smallInput(theme, theme.accent, theme.text) }}>
                              <option value="sec">sec</option>
                              <option value="min">min</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: theme.text, marginBottom: 4 }}>Type</label>
                          <select value={step.type || 'work'} onChange={(e) => updateStep(idx, { type: e.target.value })} style={{ width: '100%', ...smallInput(theme, theme.accent, theme.text) }}>
                            <option value="warmup">warmup</option>
                            <option value="work">work</option>
                            <option value="rest">rest</option>
                            <option value="cooldown">cooldown</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: theme.text, marginBottom: 4 }}>Color</label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="color" value={step.color || '#ef4444'} onChange={(e) => updateStep(idx, { color: e.target.value })} style={{ width: '50px', height: '36px', border: 'none', borderRadius: theme.borderRadius, cursor: 'pointer', flexShrink: 0, background: 'none' }} />
                            <input value={step.color || ''} onChange={(e) => updateStep(idx, { color: e.target.value })} placeholder="#ef4444" style={{ flex: 1, ...smallInput(theme, theme.accent, theme.text) }} />
                          </div>
                        </div>
                      </div>

                      {/* Remove button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => removeStep(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', padding: '4px 8px', borderRadius: theme.borderRadius, transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>Remove Step</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons - responsive */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            <button onClick={() => onSave(local)} style={{ background: theme.accent, border: 'none', borderRadius: theme.borderRadius, padding: '12px', color: '#000', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
            <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: theme.borderRadius, padding: '12px', color: theme.text, fontSize: '1rem', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTimerModal;
