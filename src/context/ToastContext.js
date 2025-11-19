import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

let idCounter = 1;

export const ToastProvider = ({ children, theme = {} }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', ttl = 4000) => {
    const id = idCounter++;
    setToasts(t => [...t, { id, message, type }]);
    if (ttl > 0) {
      setTimeout(() => {
        setToasts(t => t.filter(x => x.id !== id));
      }, ttl);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  // Listen for global app-toast events so other modules (e.g., App) can dispatch toasts
  useEffect(() => {
    const handler = (e) => {
      try {
        const { message, type = 'info', ttl = 4000 } = e.detail || {};
        if (message) showToast(message, type, ttl);
      } catch (err) {
        // ignore malformed events
      }
    };
    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            minWidth: 200,
            maxWidth: 420,
            background: theme.card || '#111',
            color: theme.text || '#fff',
            borderRadius: 10,
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ fontSize: 13 }}>
              {t.message}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => removeToast(t.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;
