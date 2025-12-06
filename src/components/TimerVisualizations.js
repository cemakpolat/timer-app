import React, { useEffect, useRef } from 'react';
import { formatTime } from '../utils/formatters';

// Utility function for text opacity
const getTextOpacity = (theme, opacity) => {
  // Extract RGB from theme.text if it's a hex color
  const hex = theme.text.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Compact Timer Visualization - Clean & Simple
const CompactTimerVisualization = ({ time, totalTime, sequence, currentStep, mode, theme, isRunning, currentRound, isWork, rounds }) => {
  const progress = totalTime > 0 ? ((totalTime - time) / totalTime) * 100 : 0;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 16, 
      maxWidth: 400, 
      margin: '0 auto',
      padding: '16px 0'
    }}>
      {/* Center: Time with simple progress circle */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <svg width="120" height="120" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke={theme.accent}
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 - (progress / 100) * 2 * Math.PI * 50}`}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
                filter: isRunning ? `drop-shadow(0 0 8px ${theme.accent}60)` : 'none'
              }}
            />
          </svg>

          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 500,
              color: theme.text,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              lineHeight: 1
            }}>
              {formatTime(time)}
            </div>
            {mode === 'sequence' && sequence?.length > 1 && (
              <div style={{ 
                fontSize: 11, 
                color: 'rgba(255,255,255,0.6)', 
                marginTop: 4
              }}>
                {currentStep + 1}/{sequence.length}
              </div>
            )}
            {mode === 'interval' && rounds > 1 && (
              <div style={{ 
                fontSize: 11, 
                color: 'rgba(255,255,255,0.6)', 
                marginTop: 4
              }}>
                R{currentRound}/{rounds}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Session name */}
      <div style={{ 
        flexShrink: 0, 
        minWidth: 80, 
        textAlign: 'left'
      }}>
        {mode === 'sequence' && sequence?.[currentStep] && (
          <div>
            <div style={{
              fontSize: 13,
              color: sequence[currentStep].color,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: 4
            }}>
              {sequence[currentStep].name}
            </div>
            {sequence.length > currentStep + 1 && (
              <div style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Next: {sequence[currentStep + 1].name}
              </div>
            )}
          </div>
        )}
        {mode === 'interval' && (
          <div style={{
            fontSize: 13,
            color: isWork ? '#ef4444' : '#10b981',
            fontWeight: 600
          }}>
            {isWork ? 'Work' : 'Rest'}
          </div>
        )}
      </div>
    </div>
  );
};

// Minimalist Digital Display - Immersive Focus Mode
const MinimalTimerVisualization = ({ time, totalTime, sequence, currentStep, mode, theme, isRunning, currentRound, rounds }) => {
  const progress = totalTime > 0 ? ((totalTime - time) / totalTime) * 100 : 0;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '32px 20px',
      gap: 24
    }}>
      {/* Top: Current exercise/session name - Large and Bold */}
      <div style={{
        fontSize: 24,
        fontWeight: 700,
        color: theme.accent,
        textAlign: 'center',
        letterSpacing: '0.5px'
      }}>
        {mode === 'sequence' && sequence?.[currentStep] ? sequence[currentStep].name : 'Timer'}
      </div>

      {/* Center: Giant Timer with Circular Progress Ring */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          {/* SVG Circular Progress Ring */}
          <svg 
            width="200" 
            height="200" 
            style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
            viewBox="0 0 200 200"
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
              fill="none"
            />
            
            {/* Progress ring */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke={theme.accent}
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 - (progress / 100) * 2 * Math.PI * 90}`}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
                filter: isRunning ? `drop-shadow(0 0 16px ${theme.accent}80)` : 'none'
              }}
            />
          </svg>

          {/* Giant Time Display in Center */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 72,
              fontWeight: 300,
              color: theme.text,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              lineHeight: 1,
              letterSpacing: '-2px'
            }}>
              {formatTime(time)}
            </div>
          </div>
        </div>
      </div>

      {/* Below Center: Next session info - Smaller, dimmer */}
      <div style={{
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        fontWeight: 400
      }}>
        {mode === 'sequence' && sequence?.length > currentStep + 1 && (
          <>
            Next: <span style={{ color: theme.accent, fontWeight: 500 }}>
              {sequence[currentStep + 1].name}
            </span>
          </>
        )}
        {mode === 'interval' && (
          <span>
            {currentRound ? `Round ${currentRound}` : 'Ready'}
          </span>
        )}
      </div>
    </div>
  );
};

// Card Stack Visualization - Modern & Clean
const CardStackTimerVisualization = ({ time, totalTime, sequence, currentStep, mode, theme, isRunning, currentRound, rounds }) => {
  const progress = totalTime > 0 ? ((totalTime - time) / totalTime) * 100 : 0;

  if (mode !== 'sequence' || !sequence?.length) {
    // Fallback for non-sequence modes
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100%',
        padding: '32px 20px'
      }}>
        <div style={{
          fontSize: 72,
          fontWeight: 300,
          color: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          textAlign: 'center'
        }}>
          {formatTime(time)}
        </div>
      </div>
    );
  }

  const currentExercise = sequence[currentStep];
  const nextExercise = sequence[currentStep + 1];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Current Card */}
      <div style={{
        width: '100%',
        maxWidth: 320,
        background: theme.card,
        borderRadius: 16,
        padding: 24,
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${theme.accent}40`,
        border: `2px solid ${theme.accent}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        zIndex: 2,
        position: 'relative'
      }}>
        {/* Exercise Name */}
        <div style={{
          fontSize: 20,
          fontWeight: 600,
          color: theme.accent,
          textAlign: 'center'
        }}>
          {currentExercise.name}
        </div>

        {/* Timer */}
        <div style={{
          fontSize: 64,
          fontWeight: 300,
          color: theme.text,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          textAlign: 'center'
        }}>
          {formatTime(time)}
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: 4,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: currentExercise.color,
            width: `${progress}%`,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Next Card (peeking from bottom) */}
      {nextExercise && (
        <div style={{
          width: '100%',
          maxWidth: 320,
          background: theme.card,
          borderRadius: 16,
          padding: 20,
          boxShadow: `0 4px 16px rgba(0,0,0,0.2)`,
          border: `1px solid rgba(255,255,255,0.1)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          position: 'absolute',
          bottom: 20,
          opacity: 0.6,
          transform: 'scale(0.9)',
          zIndex: 1
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 500,
            color: theme.accent,
            textAlign: 'center'
          }}>
            Next: {nextExercise.name}
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center'
          }}>
            {formatTime(nextExercise.duration)}
          </div>
        </div>
      )}
    </div>
  );
};

// Timeline Visualization - Split Screen
const TimelineTimerVisualization = ({ time, totalTime, sequence, currentStep, mode, theme, isRunning, currentRound, rounds }) => {
  const progress = totalTime > 0 ? ((totalTime - time) / totalTime) * 100 : 0;
  const listRef = useRef(null);
  const currentItemRef = useRef(null);

  useEffect(() => {
    if (currentItemRef.current && listRef.current) {
      const listElement = listRef.current;
      const currentElement = currentItemRef.current;
      
      // Calculate the position to scroll to center the current item
      const listHeight = listElement.clientHeight;
      const itemTop = currentElement.offsetTop;
      const itemHeight = currentElement.offsetHeight;
      const scrollTop = itemTop - (listHeight / 2) + (itemHeight / 2);
      
      listElement.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

  if (mode !== 'sequence' || !sequence?.length) {
    // Fallback
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100%',
        padding: '32px 20px'
      }}>
        <div style={{
          fontSize: 72,
          fontWeight: 300,
          color: theme.text,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          textAlign: 'center'
        }}>
          {formatTime(time)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Top 40%: Timer and Current Status */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        borderBottom: `1px solid rgba(255,255,255,0.1)`
      }}>
        {/* Current Exercise Name */}
        <div style={{
          fontSize: 24,
          fontWeight: 600,
          color: theme.accent,
          textAlign: 'center',
          marginBottom: 16
        }}>
          {sequence[currentStep].name}
        </div>

        {/* Timer */}
        <div style={{
          fontSize: 72,
          fontWeight: 300,
          color: theme.text,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          textAlign: 'center'
        }}>
          {formatTime(time)}
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          maxWidth: 300,
          height: 6,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
          overflow: 'hidden',
          marginTop: 16
        }}>
          <div style={{
            height: '100%',
            background: theme.accent,
            width: `${progress}%`,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Bottom 60%: Timeline List */}
      <div
        ref={listRef}
        style={{
          overflow: 'auto',
          padding: '20px 0'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '0 20px'
        }}>
          {sequence.map((step, idx) => {
            const isCurrent = idx === currentStep;
            const isCompleted = idx < currentStep;
            const isUpcoming = idx > currentStep;

            return (
              <div 
                key={idx} 
                ref={isCurrent ? currentItemRef : null}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '8px 0',
                  opacity: isCompleted ? 0.3 : isUpcoming ? 0.6 : 1,
                  transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Timeline Dot */}
                <div style={{
                  flexShrink: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: isCompleted ? getTextOpacity(theme, 0.3) : isCurrent ? theme.accent : getTextOpacity(theme, 0.2),
                  border: isCurrent ? `2px solid ${theme.accent}` : 'none',
                  boxShadow: isCurrent ? `0 0 12px ${theme.accent}80` : 'none'
                }} />

                {/* Step Info */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: isCurrent ? 18 : 16,
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? theme.text : isCompleted ? getTextOpacity(theme, 0.5) : getTextOpacity(theme, 0.7)
                  }}>
                    {step.name}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: isCurrent ? theme.accent : getTextOpacity(theme, 0.5),
                    fontWeight: isCurrent ? 500 : 400
                  }}>
                    {formatTime(step.duration)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export {
  CompactTimerVisualization,
  MinimalTimerVisualization,
  CardStackTimerVisualization,
  TimelineTimerVisualization
};