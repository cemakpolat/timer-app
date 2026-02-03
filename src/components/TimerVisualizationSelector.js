import React from 'react';
import { Circle, BarChart3, Clock, Layers } from 'lucide-react';

const TimerVisualizationSelector = ({
  currentVisualization,
  onVisualizationChange,
  theme,
  getTextOpacity
}) => {
  const visualizations = [
    {
      id: 'default',
      name: 'Classic Digital',
      icon: Circle
    },
    {
      id: 'compact',
      name: 'Apple Style',
      icon: Circle
    },
    {
      id: 'minimal',
      name: 'Minimalist',
      icon: BarChart3
    },
    {
      id: 'cardStack',
      name: 'Card Stack',
      icon: Layers
    },
    {
      id: 'timeline',
      name: 'Timeline',
      icon: Clock
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'grid', gap: 12 }}>
        {visualizations.map((viz) => {
          const Icon = viz.icon;
          const isSelected = currentVisualization === viz.id;

          return (
            <button
              key={viz.id}
              onClick={() => onVisualizationChange(viz.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                background: isSelected ? theme.accent + '20' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isSelected ? theme.accent : getTextOpacity(theme, 0.1)}`,
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: theme.borderRadius,
                background: isSelected ? theme.accent : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon
                  size={20}
                  color={isSelected ? 'white' : getTextOpacity(theme, 0.6)}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.text
                }}>
                  {viz.name}
                </div>
              </div>

              {isSelected && (
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: theme.accent
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimerVisualizationSelector;