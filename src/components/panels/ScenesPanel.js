import React from 'react';
import { Sparkles, Palette } from 'lucide-react';

/**
 * ScenesPanel Component
 * 
 * Extracted component for managing immersive scenes and color themes.
 * Allows users to:
 * - Select immersive scene backgrounds (coffee, deep work, exercise, etc.)
 * - Choose color themes for the app interface
 * 
 * Props:
 * - SCENES: Object mapping scene keys to scene definitions with bg, accent, emoji, description
 * - activeScene: Currently selected scene key
 * - setActiveScene: Callback to update active scene
 * - theme: Current theme object with card, accent, and name properties
 * - setTheme: Callback to update theme
 * - themes: Array of available theme objects
 */

export default function ScenesPanel({ SCENES, activeScene, setActiveScene, theme, setTheme, themes }) {
  return (
    <>
      {/* Immersive Scenes */}
      <div style={{ background: theme.card, borderRadius: 10, padding: 15, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} /> Immersive Scenes
        </h2>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
          Choose a scene that matches your timer activity. Scenes change the visual ambiance to help you focus.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {Object.entries(SCENES).map(([key, scene]) => (
            <div
              key={key}
              style={{
                padding: 16,
                background: key === 'none' ? 'rgba(255,255,255,0.05)' : scene.bg,
                borderRadius: 12,
                textAlign: 'center',
                cursor: 'pointer',
                border: activeScene === key ? `2px solid ${theme.accent}` : 'none',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onClick={() => setActiveScene(key)}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{scene.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{scene.name}</div>
              {scene.description && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{scene.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Theme Selector */}
      <div style={{ background: theme.card, borderRadius: 10, padding: 15, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Palette size={18} /> Color Themes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
          {themes.map(t => (
            <div
              key={t.name}
              onClick={() => setTheme(t)}
              style={{
                padding: 20,
                background: t.card,
                borderRadius: 12,
                cursor: 'pointer',
                border: theme.name === t.name ? `2px solid ${t.accent}` : 'none',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.accent, margin: '0 auto 12px' }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
