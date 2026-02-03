import React from 'react';
import { ROOM_TEMPLATES } from '../../services/roomTemplates';
import { Clock, Users, Target } from 'lucide-react';

/**
 * RoomTemplateSelector Component
 * 
 * Displays available room templates with details and selection option.
 * Used in room creation flow to help users pick a pre-configured template.
 * 
 * Props:
 * - theme: Current theme object
 * - onSelectTemplate: Callback when template is selected
 * - onSkip: Callback to skip templates and create custom room
 */

export default function RoomTemplateSelector({ theme, onSelectTemplate, onSkip }) {
  const categoryEmojis = {
    work: '💼',
    study: '📚',
    creative: '🎨',
    fitness: '💪',
    wellness: '🧘'
  };

  // Group templates by category
  const grouped = {};
  ROOM_TEMPLATES.forEach(template => {
    if (!grouped[template.tag]) {
      grouped[template.tag] = [];
    }
    grouped[template.tag].push(template);
  });

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px 0', color: theme.text }}>
          Create a New Room
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          Choose a template or create a custom room
        </p>
      </div>

      {/* Templates by Category */}
      <div style={{ marginBottom: 32 }}>
        {Object.entries(grouped).map(([category, templates]) => (
          <div key={category} style={{ marginBottom: 32 }}>
            {/* Category Header */}
            <div style={{ 
              fontSize: 14, 
              fontWeight: 700, 
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>{categoryEmojis[category] || '⭐'}</span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>

            {/* Template Cards */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16
            }}>
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  style={{
                    background: theme.card,
                    border: `1px solid rgba(255,255,255,0.1)`,
                    borderRadius: theme.borderRadius,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 24px rgba(0,0,0,0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Icon & Name */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>
                      {template.emoji}
                    </div>
                    <h3 style={{ 
                      fontSize: 16, 
                      fontWeight: 700, 
                      margin: '0 0 8px 0',
                      color: theme.text 
                    }}>
                      {template.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.6)',
                    margin: '0 0 16px 0',
                    lineHeight: 1.4
                  }}>
                    {template.description}
                  </p>

                  {/* Template Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    marginBottom: 16,
                    fontSize: 13
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                      <Clock size={14} />
                      {Math.floor(template.duration / 60)}m
                      {template.breakDuration > 0 && ` + ${Math.floor(template.breakDuration / 60)}m breaks`}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                      <Users size={14} />
                      Up to {template.maxParticipants}
                    </div>
                  </div>

                  {/* Goal */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    padding: 12,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: theme.borderRadius,
                    marginBottom: 16
                  }}>
                    <Target size={14} style={{ marginTop: 2, color: theme.accent, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      {template.goal}
                    </div>
                  </div>

                  {/* Use Template Button */}
                  <button
                    style={{
                      width: '100%',
                      padding: 10,
                      background: theme.accent,
                      color: '#000',
                      border: 'none',
                      borderRadius: theme.borderRadius,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Use This Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Skip / Create Custom */}
      <div style={{ 
        textAlign: 'center', 
        paddingTop: 20,
        borderTop: `1px solid rgba(255,255,255,0.1)`
      }}>
        <button
          onClick={onSkip}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: theme.borderRadius,
            padding: '10px 20px',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.1)';
            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.05)';
            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          Create Custom Room
        </button>
      </div>
    </div>
  );
}
