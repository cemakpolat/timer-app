import React from 'react';
import { Play, Save, ChevronUp, ChevronDown, ChevronRight, X } from 'lucide-react';

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
  return (
    <div style={{ background: theme.card, borderRadius: 10, padding: 15, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Composite Timers</h2>
        <button 
          onClick={() => setShowBuilder(!showBuilder)} 
          style={{ 
            background: theme.accent, 
            border: 'none', 
            borderRadius: 8, 
            padding: '8px 16px', 
            color: 'white', 
            cursor: 'pointer', 
            fontSize: 14, 
            fontWeight: 600 
          }}
        >
          {showBuilder ? 'Close' : 'Build'}
        </button>
      </div>

      {showBuilder && (
        <>
          <input 
            type="text" 
            placeholder="Sequence name" 
            value={seqName} 
            onChange={(e) => setSeqName(e.target.value)} 
            style={inputStyle(theme.accent)} 
          />
          
          {sequence.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {sequence.map((timer, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: 10, 
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
                  
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                    {idx + 1}.
                  </div>
                  
                  <div 
                    style={{ 
                      width: 4, 
                      height: 24, 
                      borderRadius: 2, 
                      background: timer.color 
                    }} 
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {timer.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      {timer.duration} {timer.unit}
                    </div>
                  </div>
                  
                  {idx < sequence.length - 1 && (
                    <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  )}
                  
                  <button 
                    onClick={() => setSequence(prev => prev.filter((_, i) => i !== idx))} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'rgba(255,255,255,0.5)', 
                      cursor: 'pointer', 
                      padding: 4 
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={startSequence} 
                  style={{ 
                    flex: 1, 
                    background: theme.accent, 
                    border: 'none', 
                    borderRadius: 10, 
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
                  onClick={saveSequence} 
                  disabled={!seqName} 
                  style={{ 
                    flex: 1, 
                    background: seqName ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', 
                    border: 'none', 
                    borderRadius: 10, 
                    padding: 15, 
                    color: theme.text, 
                    cursor: seqName ? 'pointer' : 'not-allowed', 
                    fontSize: 14, 
                    fontWeight: 600, 
                    opacity: seqName ? 1 : 0.5 
                  }}
                >
                  <Save size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Save
                </button>
              </div>
            </div>
          )}
          
          <div 
            style={{ 
              padding: 15, 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: 10, 
              fontSize: 13, 
              color: 'rgba(255,255,255,0.6)' 
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
