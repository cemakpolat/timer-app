import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';

const RoomSettingsModal = ({ theme, room, onClose, onSave }) => {
  const initialMinutes = room && typeof room.emptyRoomRemovalDelaySec === 'number' ? Math.round(room.emptyRoomRemovalDelaySec / 60) : 2;
  const [emptyRoomDelay, setEmptyRoomDelay] = useState(initialMinutes);
  const { alert } = useModal();

  const handleSave = async (e) => {
    e.preventDefault();
    // Convert minutes to seconds; use null to remove the field (disable)
    const payload = {};
    if (emptyRoomDelay && !Number.isNaN(parseInt(emptyRoomDelay, 10)) && parseInt(emptyRoomDelay, 10) > 0) {
      payload.emptyRoomRemovalDelaySec = parseInt(emptyRoomDelay, 10) * 60;
    } else {
      // explicitly remove the field by setting null
      payload.emptyRoomRemovalDelaySec = null;
    }

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      const msg = err?.message || 'Failed to save settings';
      // fallback: use modal alert to inform user
      await alert(msg);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.card,
          borderRadius: 20,
          padding: 24,
          maxWidth: 480,
          width: '100%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>Room Settings</h3>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Empty-room removal delay (minutes)</label>
            <input
              type="number"
              min="0"
              max="1440"
              value={emptyRoomDelay}
              onChange={(e) => setEmptyRoomDelay(Math.max(0, Math.min(1440, parseInt(e.target.value) || 0)))}
              style={{
                width: 120,
                padding: 10,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: 'white'
              }}
            />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Set to 0 to disable automatic empty-room removal.</div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'white', border: 'none' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 14px', borderRadius: 8, background: theme.accent, color: 'white', border: 'none' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomSettingsModal;
