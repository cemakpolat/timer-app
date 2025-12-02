import React, { useRef, useEffect } from 'react';
import { Info, Award, Lightbulb, Settings, Globe, Palette, Volume2, VolumeX, Trash, ChevronLeft, Edit, Trash2, Plus, Cloud, Download, Upload } from 'lucide-react';

const Header = ({
  theme,
  onShowInfo,
  onShowAchievements,
  onShowFeedback,
  onShowSettings,
  onShowWorldClocks,
  showSettings,
  setShowSettings,
  settingsView,
  setSettingsView,
  themes,
  setTheme,
  setEditingTheme,
  setShowColorPicker,
  alarmVolume,
  setAlarmVolume,
  getTextOpacity,
  weatherEffect,
  setWeatherEffect,
  SCENES,
  AMBIENT_SOUNDS,
  ambientSound,
  setAmbientSound,
  setEditingWeather
}) => {
  const settingsPanelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(event.target)) {
        setShowSettings(false);
        setSettingsView('main');
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings, setShowSettings, setSettingsView]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0 16px',
      position: 'relative',
      background: 'transparent',
      zIndex: 100
    }}>
      {/* App Name */}
      <h1 style={{
        margin: 0,
        fontSize: 24,
        fontWeight: 600,
        color: theme.text,
        fontFamily: "'Courier New', 'Courier', monospace",
        letterSpacing: '0.05em'
      }}>
        Focus & Fit
      </h1>

      {/* Icon Buttons */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={onShowInfo}
          style={{
            border: 'none',
            borderRadius: 10,
            padding: 10,
            color: theme.accent,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${theme.accent}20`;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          title="App Features"
        >
          <Info size={18} />
        </button>

        <button
          onClick={onShowAchievements}
          style={{
            border: 'none',
            borderRadius: 10,
            padding: 10,
            color: theme.accent,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${theme.accent}20`;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          title="Achievements"
        >
          <Award size={18} />
        </button>

        <button
          onClick={onShowFeedback}
          style={{
            border: 'none',
            borderRadius: 10,
            padding: 10,
            color: theme.accent,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${theme.accent}20`;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          title="Send Feedback"
        >
          <Lightbulb size={18} />
        </button>

        <button
          onClick={onShowWorldClocks}
          style={{
            border: 'none',
            borderRadius: 10,
            padding: 10,
            color: theme.accent,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${theme.accent}20`;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
          title="World Clocks"
        >
          <Globe size={18} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={onShowSettings}
            style={{
              border: 'none',
              borderRadius: 10,
              padding: 10,
              color: theme.text,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `${theme.accent}20`;
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'scale(1)';
            }}
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div 
              ref={settingsPanelRef}
              style={{
                position: 'absolute',
                top: 50,
                right: 0,
                background: theme.card,
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 12,
                padding: settingsView === 'main' ? 4 : 8,
                minWidth: settingsView === 'main' ? 'auto' : 200,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: settingsView === 'main' ? 2 : 4
              }}
            >
              {settingsView === 'main' && (
                <>
                  {/* Theme Option */}
                  <button
                    onClick={() => setSettingsView('themes')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Themes"
                  >
                    <Palette size={18} />
                  </button>

                  {/* Sound Option */}
                  <button
                    onClick={() => setSettingsView('sound')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Sound Settings"
                  >
                    {alarmVolume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>

                  {/* Weather Option */}
                  <button
                    onClick={() => setSettingsView('weather')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Weather Effects"
                  >
                    <Cloud size={18} />
                  </button>

                  {/* Import Settings Option */}
                  <button
                    onClick={() => {
                      // Import settings logic
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const settings = JSON.parse(e.target.result);
                              // Apply imported settings
                              Object.keys(settings).forEach(key => {
                                localStorage.setItem(key, JSON.stringify(settings[key]));
                              });
                              window.location.reload();
                            } catch (error) {
                              alert('Invalid settings file');
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Import Settings"
                  >
                    <Upload size={18} />
                  </button>

                  {/* Export Settings Option */}
                  <button
                    onClick={() => {
                      // Export settings logic
                      const settings = {};
                      for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        try {
                          settings[key] = JSON.parse(localStorage.getItem(key));
                        } catch {
                          settings[key] = localStorage.getItem(key);
                        }
                      }
                      const dataStr = JSON.stringify(settings, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const exportFileDefaultName = 'timer-app-settings.json';
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Export Settings"
                  >
                    <Download size={18} />
                  </button>

                  {/* Clear Cache Option */}
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.15)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.1)'}
                    title="Clear Cache"
                  >
                    <Trash size={18} />
                  </button>
                </>
              )}

              {settingsView === 'themes' && (
                <>
                  {/* Header with Back, Edit, Delete, Add icons */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setSettingsView('main')}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Back"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Edit Icon */}
                    <button
                      onClick={() => {
                        if (!theme.isDefault || theme.name !== 'Midnight') {
                          setEditingTheme(theme);
                          setShowColorPicker(true);
                        }
                      }}
                      disabled={theme.isDefault && theme.name === 'Midnight'}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: theme.isDefault && theme.name === 'Midnight' ? 'rgba(255,255,255,0.3)' : theme.text,
                        cursor: theme.isDefault && theme.name === 'Midnight' ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px',
                        opacity: theme.isDefault && theme.name === 'Midnight' ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => { if (!(theme.isDefault && theme.name === 'Midnight')) e.target.style.background = 'rgba(255,255,255,0.1)' }}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title={theme.isDefault && theme.name === 'Midnight' ? 'Midnight theme cannot be edited' : 'Edit Current Theme'}
                    >
                      <Edit size={18} />
                    </button>

                    {/* Delete Icon */}
                    <button
                      onClick={() => {
                        if (!(theme.isDefault && theme.name === 'Midnight')) {
                          // Handle delete theme
                        }
                      }}
                      disabled={theme.isDefault && theme.name === 'Midnight'}
                      style={{
                        background: (theme.isDefault && theme.name === 'Midnight') ? 'rgba(255,255,255,0.05)' : 'rgba(255, 0, 0, 0.1)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: (theme.isDefault && theme.name === 'Midnight') ? getTextOpacity(theme, 0.3) : '#ff4444',
                        cursor: (theme.isDefault && theme.name === 'Midnight') ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px',
                        opacity: (theme.isDefault && theme.name === 'Midnight') ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => { if (!(theme.isDefault && theme.name === 'Midnight')) e.target.style.background = 'rgba(255, 0, 0, 0.2)' }}
                      onMouseLeave={(e) => { if (!(theme.isDefault && theme.name === 'Midnight')) e.target.style.background = 'rgba(255, 0, 0, 0.1)' }}
                      title={(theme.isDefault && theme.name === 'Midnight') ? 'Midnight theme cannot be deleted' : 'Delete Current Theme'}
                    >
                      <Trash2 size={18} />
                    </button>

                    <div style={{ flex: 1 }} />

                    {/* Add New Theme Icon */}
                    <button
                      onClick={() => {
                        setEditingTheme(null);
                        setShowColorPicker(true);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Create New Theme"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Theme Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 6,
                    maxHeight: 300,
                    overflowY: 'auto',
                    padding: 4
                  }}>
                    {themes.map(t => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setTheme(t);
                          onShowSettings(); // Close settings
                          setSettingsView('main');
                        }}
                        style={{
                          background: t.bg,
                          border: theme.name === t.name ? `2px solid ${t.accent}` : '2px solid transparent',
                          borderRadius: 8,
                          padding: 12,
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                          color: t.text,
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          position: 'relative',
                          minHeight: 48
                        }}
                      >
                        {t.name}
                        {theme.name === t.name && (
                          <div style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            color: t.accent,
                            fontSize: 14
                          }}>✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Weather Settings */}
              {settingsView === 'weather' && (
                <>
                  {/* Header with Back and Edit icons */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setSettingsView('main')}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Back"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Edit Icon */}
                    <button
                      onClick={() => {
                        if (weatherEffect !== 'none') {
                          setEditingWeather && setEditingWeather(weatherEffect);
                        }
                      }}
                      disabled={weatherEffect === 'none'}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: weatherEffect === 'none' ? 'rgba(255,255,255,0.3)' : theme.text,
                        cursor: weatherEffect === 'none' ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px',
                        opacity: weatherEffect === 'none' ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => { if (weatherEffect !== 'none') e.target.style.background = 'rgba(255,255,255,0.1)' }}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title={weatherEffect === 'none' ? 'Select an effect to edit' : 'Edit Current Effect'}
                    >
                      <Edit size={18} />
                    </button>

                    <div style={{ flex: 1 }} />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>Weather Effects</label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: 6,
                      maxHeight: 300,
                      overflowY: 'auto',
                      padding: 4
                    }}>
                      {[
                        { id: 'none', name: 'None', icon: '🚫' },
                        { id: 'rain', name: 'Rain', icon: '🌧️' },
                        { id: 'cloudy', name: 'Cloudy', icon: '☁️' },
                        { id: 'sunny', name: 'Sunny', icon: '☀️' },
                        { id: 'winter', name: 'Winter', icon: '❄️' },
                        { id: 'autumn', name: 'Autumn', icon: '🍂' },
                        { id: 'spring', name: 'Spring', icon: '🌸' },
                        { id: 'sakura', name: 'Cherry Blossoms', icon: '🌸' },
                        { id: 'fireflies', name: 'Fireflies', icon: '✨' },
                        { id: 'butterflies', name: 'Butterflies', icon: '🦋' },
                        { id: 'lanterns', name: 'Lanterns', icon: '🏮' },
                        { id: 'aurora', name: 'Aurora', icon: '🌌' },
                        { id: 'desert', name: 'Desert', icon: '🏜️' },
                        { id: 'tropical', name: 'Tropical', icon: '🌴' }
                      ].map(effect => (
                        <button
                          key={effect.id}
                          onClick={() => setWeatherEffect(effect.id)}
                          style={{
                            background: weatherEffect === effect.id ? theme.accent : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                            borderRadius: 8,
                            padding: '12px 8px',
                            color: weatherEffect === effect.id ? '#fff' : theme.text,
                            cursor: 'pointer',
                            fontSize: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            transition: 'all 0.2s',
                            minHeight: '70px',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            if (weatherEffect !== effect.id) {
                              e.target.style.background = 'rgba(255,255,255,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (weatherEffect !== effect.id) {
                              e.target.style.background = 'rgba(255,255,255,0.05)';
                            }
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{effect.icon}</span>
                          <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{effect.name}</span>
                          {weatherEffect === effect.id && (
                            <div style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              color: '#fff',
                              fontSize: 14
                            }}>✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: getTextOpacity(theme, 0.4), marginTop: 6 }}>
                      Choose a weather effect for your timer sessions
                    </p>
                  </div>
                </>
              )}

              {/* Sound Settings */}
              {settingsView === 'sound' && (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => setSettingsView('main')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 12px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      marginBottom: 4
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>Alarm Volume</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <VolumeX size={16} color={getTextOpacity(theme, 0.5)} />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={alarmVolume}
                        onChange={(e) => setAlarmVolume(parseFloat(e.target.value))}
                        style={{
                          flex: 1,
                          accentColor: theme.accent
                        }}
                      />
                      <Volume2 size={16} color={getTextOpacity(theme, 0.5)} />
                    </div>
                    <p style={{ fontSize: 11, color: getTextOpacity(theme, 0.4), marginTop: 6 }}>
                      Adjust the volume of timer completion sounds
                    </p>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>Ambient Sounds</label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(1, 1fr)', 
                      gap: 6,
                      maxHeight: 200,
                      overflowY: 'auto'
                    }}>
                      {AMBIENT_SOUNDS.map(sound => (
                        <button
                          key={sound.name}
                          onClick={() => setAmbientSound(sound.name)}
                          style={{
                            background: ambientSound === sound.name ? theme.accent : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                            borderRadius: 8,
                            padding: '8px 12px',
                            color: ambientSound === sound.name ? '#fff' : theme.text,
                            cursor: 'pointer',
                            fontSize: 12,
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          {sound.name}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: getTextOpacity(theme, 0.4), marginTop: 6 }}>
                      Choose background music for your sessions
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;