import React from 'react';
import { X, Users, Clock, Zap, Gift, Award, Repeat } from 'lucide-react';

/**
 * InfoModal Component
 * Explains the main features of the Timer App
 * - Focus Rooms
 * - Timer Blocks
 * - Composite Timers
 * - Time Capsule
 * - Achievements
 * - Interval Timer
 */
export default function InfoModal({ theme, onClose }) {
  const features = [
    {
      icon: Users,
      title: 'Focus Rooms',
      description: 'Create or join collaborative focus spaces with others. Set goals, track time together, and stay accountable as a group.'
    },
    {
      icon: Clock,
      title: 'Timer Blocks',
      description: 'Build a collection of custom timers (5 min, 15 min, 25 min, etc.) and organize them by category. Quick access to your favorite durations.'
    },
    {
      icon: Zap,
      title: 'Composite Timers',
      description: 'Combine multiple timers into sequences. Perfect for complex work sessions: deep work → break → review → repeat.'
    },
    {
      icon: Gift,
      title: 'Time Capsule',
      description: 'Write messages to your future self. Set them to open after days or weeks. Receive encouragement and reminders from your past.'
    },
    {
      icon: Award,
      title: 'Achievements',
      description: 'Unlock badges as you hit milestones: first completion, 7-day streak, 100 sessions, and more. Celebrate your progress!'
    },
    {
      icon: Repeat,
      title: 'Interval Timer',
      description: 'Alternate between work and rest cycles. Set work duration, rest time, and number of rounds. Ideal for HIIT or pomodoro sessions.'
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 20,
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.card,
          borderRadius: 24,
          padding: 32,
          maxWidth: 700,
          width: '100%',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 8,
            padding: 8,
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2
          style={{
            margin: 0,
            marginBottom: 12,
            fontSize: 28,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.text} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Welcome to T2Get
        </h2>

        <p
          style={{
            margin: '0 0 32px 0',
            fontSize: 14,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6
          }}
        >
          A powerful productivity app to help you focus, track time, collaborate with others, and celebrate your wins. Here's what you can do:
        </p>

        {/* Features Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 600 ? '1fr' : 'repeat(2, 1fr)',
            gap: 20,
            marginBottom: 24
          }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 16,
                  padding: 20,
                  border: `1px solid rgba(255,255,255,0.05)`,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = `rgba(${parseInt(theme.accent.slice(1, 3), 16)},${parseInt(theme.accent.slice(3, 5), 16)},${parseInt(theme.accent.slice(5, 7), 16)},0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${theme.accent}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.accent
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: 16,
                        fontWeight: 600,
                        color: theme.text
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.5
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 16,
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 12,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            lineHeight: 1.5
          }}
        >
          <p style={{ margin: 0 }}>
            💡 <strong>Tip:</strong> Start with Focus Rooms to collaborate, or dive into Timer Blocks to build your perfect session. Use Achievements to track your progress!
          </p>
        </div>

        {/* Close Button (Bottom) */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 20,
            background: theme.accent,
            border: 'none',
            borderRadius: 12,
            padding: 14,
            color: 'white',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
