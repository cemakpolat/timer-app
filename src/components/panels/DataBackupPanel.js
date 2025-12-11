import React from 'react';
import { Upload, Download, Trash } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const DataBackupPanel = ({ theme, getTextOpacity }) => {
  const modal = useModal();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const settings = JSON.parse(ev.target.result);
            Object.keys(settings).forEach(key => {
              localStorage.setItem(key, JSON.stringify(settings[key]));
            });
            window.location.reload();
          } catch (err) {
            modal.alert('Invalid settings file', 'Import Failed');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
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
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'timer-app-settings.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClear = async () => {
    const ok = await modal.confirm('Clear all stored settings? This will reload the app.', 'Clear Settings');
    if (!ok) return;
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, padding: 4 }}>
      <button
        onClick={handleImport}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: theme.borderRadius,
          padding: '12px',
          textAlign: 'left',
          color: theme.text,
          cursor: 'pointer'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}><Upload size={16} />Import Settings</div>
        <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.6), marginTop: 6 }}>Load settings from a JSON file exported previously.</div>
      </button>

      <button
        onClick={handleExport}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: theme.borderRadius,
          padding: '12px',
          textAlign: 'left',
          color: theme.text,
          cursor: 'pointer'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}><Download size={16} />Export Settings</div>
        <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.6), marginTop: 6 }}>Download your current settings as a JSON file for backup or transfer.</div>
      </button>

      <button
        onClick={handleClear}
        style={{
          background: 'rgba(255,0,0,0.04)',
          border: '1px solid rgba(255,0,0,0.08)',
          borderRadius: theme.borderRadius,
          padding: '12px',
          textAlign: 'left',
          color: '#ff6666',
          cursor: 'pointer'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}><Trash size={16} />Clear All Data</div>
        <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.6), marginTop: 6 }}>Remove all stored data and reload the app.</div>
      </button>

      <div style={{ fontSize: 12, color: getTextOpacity(theme, 0.5), marginTop: 6 }}>More data actions can be added here in future releases (e.g., selective export, cloud sync).</div>
    </div>
  );
};

export default DataBackupPanel;
