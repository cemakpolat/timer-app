import { Palette, Plus, X } from 'lucide-react';

/**
 * ThemeManager Component
 * Handles theme selection dropdown and custom theme creation modal
 * 
 * Props:
 * - theme: Current active theme object
 * - themes: Array of available themes (default + custom)
 * - showThemes: Boolean to show/hide theme dropdown
 * - setShowThemes: Function to toggle theme dropdown
 * - setTheme: Function to change active theme
 * - previewTheme: Theme object for hover preview
 * - setPreviewTheme: Function to set preview theme
 * - deleteCustomTheme: Function to delete a custom theme
 * - showColorPicker: Boolean to show/hide color picker modal
 * - setShowColorPicker: Function to toggle color picker modal
 * - newThemeName: String for new theme name input
 * - setNewThemeName: Function to update theme name
 * - newThemeBg: Hex color for background
 * - setNewThemeBg: Function to update background color
 * - newThemeCard: Hex color for card
 * - setNewThemeCard: Function to update card color
 * - newThemeAccent: Hex color for accent
 * - setNewThemeAccent: Function to update accent color
 * - customBorderRadius: Current custom border radius value
 * - setCustomBorderRadius: Function to set custom border radius
 */
function ThemeManager({
  theme,
  themes,
  showThemes,
  setShowThemes,
  setTheme,
  previewTheme,
  setPreviewTheme,
  deleteCustomTheme,
  showColorPicker,
  setShowColorPicker,
  newThemeName,
  setNewThemeName,
  newThemeBg,
  setNewThemeBg,
  newThemeCard,
  setNewThemeCard,
  newThemeAccent,
  setNewThemeAccent,
  newThemeText,
  setNewThemeText,
  createCustomTheme,
  customBorderRadius,
  setCustomBorderRadius
}) {
  return (
    <>
      {/* Theme Dropdown */}
      {showThemes && (
        <div style={{ position: 'fixed', top: 70, right: 20, background: theme.card, borderRadius: theme.borderRadius, padding: 16, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: 220 }}>
          {themes.map(t =>
            <div
              key={t.name}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}
            >
              <button
                onClick={() => { setTheme(t); setShowThemes(false); setPreviewTheme(null); }}
                onMouseEnter={() => setPreviewTheme(t)}
                onMouseLeave={() => setPreviewTheme(null)}
                style={{ flex: 1, background: 'transparent', border: 'none', borderRadius: theme.borderRadius, padding: 12, color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 20, height: 20, borderRadius: theme.borderRadius, background: t.accent }} />
                {t.name}
              </button>
              {!t.isDefault && (
                <button
                  onClick={() => deleteCustomTheme(t.name)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: theme.borderRadius, padding: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Delete theme"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0', paddingTop: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Border Radius</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range"
                min="0"
                max="32"
                value={customBorderRadius !== null ? customBorderRadius : theme.borderRadius || 10}
                onChange={(e) => setCustomBorderRadius(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: theme.accent }}
              />
              <div style={{ fontSize: 12, color: theme.text, minWidth: 24 }}>
                {customBorderRadius !== null ? customBorderRadius : theme.borderRadius || 10}px
              </div>
              <button
                onClick={() => setCustomBorderRadius(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: theme.borderRadius, padding: '4px 8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 11 }}
                title="Reset to theme default"
              >
                Reset
              </button>
            </div>
          </div>
          <button
            onClick={() => { setShowColorPicker(true); setShowThemes(false); }}
            style={{ width: '100%', background: theme.accent, border: 'none', borderRadius: theme.borderRadius, padding: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}
          >
            <Plus size={16} /> Add Theme
          </button>
        </div>
      )}

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '20px 16px' }} onClick={() => setShowColorPicker(false)}>
          <div style={{ background: theme.card, borderRadius: theme.borderRadius, padding: 24, maxWidth: 400, width: '90%', marginTop: '20px', marginBottom: '20px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Palette size={24} /> Create Custom Theme
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>Theme Name</label>
              <input
                type="text"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="My Custom Theme"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: theme.borderRadius, padding: 12, color: theme.text, fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>Background Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={newThemeBg}
                  onChange={(e) => setNewThemeBg(e.target.value)}
                  style={{ width: 50, height: 40, borderRadius: theme.borderRadius, border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={newThemeBg}
                  onChange={(e) => setNewThemeBg(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: theme.borderRadius, padding: 8, color: theme.text, fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>Card Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={newThemeCard}
                  onChange={(e) => setNewThemeCard(e.target.value)}
                  style={{ width: 50, height: 40, borderRadius: theme.borderRadius, border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={newThemeCard}
                  onChange={(e) => setNewThemeCard(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: theme.borderRadius, padding: 8, color: theme.text, fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>Accent Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={newThemeAccent}
                  onChange={(e) => setNewThemeAccent(e.target.value)}
                  style={{ width: 50, height: 40, borderRadius: theme.borderRadius, border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={newThemeAccent}
                  onChange={(e) => setNewThemeAccent(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: theme.borderRadius, padding: 8, color: theme.text, fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>Text Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={newThemeText}
                  onChange={(e) => setNewThemeText(e.target.value)}
                  style={{ width: 50, height: 40, borderRadius: theme.borderRadius, border: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={newThemeText}
                  onChange={(e) => setNewThemeText(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: theme.borderRadius, padding: 8, color: theme.text, fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ background: newThemeBg, borderRadius: theme.borderRadius, padding: 16, marginBottom: 24 }}>
              <div style={{ background: newThemeCard, borderRadius: theme.borderRadius, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: newThemeText, marginBottom: 8 }}>Preview</div>
                <div style={{ width: 60, height: 8, background: newThemeAccent, borderRadius: theme.borderRadius }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowColorPicker(false)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: theme.borderRadius, padding: 16, color: theme.text, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={createCustomTheme}
                disabled={!newThemeName.trim()}
                style={{ flex: 1, background: newThemeName.trim() ? theme.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: theme.borderRadius, padding: 16, color: theme.text, cursor: newThemeName.trim() ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600, opacity: newThemeName.trim() ? 1 : 0.5 }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ThemeManager;
