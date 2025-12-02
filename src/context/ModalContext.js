import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children, theme = {} }) => {
  const [modal, setModal] = useState(null);

  const hide = useCallback(() => setModal(null), []);

  const alert = useCallback((message, title = 'Info') => {
    return new Promise((resolve) => {
      setModal({ type: 'alert', title, message, resolve, theme });
    });
  }, [theme]);

  const confirm = useCallback((message, title = 'Confirm') => {
    return new Promise((resolve) => {
      setModal({ type: 'confirm', title, message, resolve, theme });
    });
  }, [theme]);

  const prompt = useCallback((message, defaultValue = '', title = 'Input') => {
    return new Promise((resolve) => {
      setModal({ type: 'prompt', title, message, defaultValue, resolve, theme });
    });
  }, [theme]);

  const value = { alert, confirm, prompt, hide };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'relative', zIndex: 1210, width: 'min(540px, 92%)' }}>
            <div style={{ background: modal.theme?.card || '#111', borderRadius: 12, padding: 18, color: modal.theme?.text || '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{modal.title}</div>
              <div style={{ fontSize: 14, marginBottom: 12, color: 'rgba(255,255,255,0.85)' }}>{modal.message}</div>

              {modal.type === 'prompt' && (
                <input
                  autoFocus
                  defaultValue={modal.defaultValue}
                  id="modal-prompt-input"
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#fff', boxSizing: 'border-box', marginBottom: 12 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      modal.resolve(e.target.value);
                      setModal(null);
                    }
                    if (e.key === 'Escape') {
                      modal.resolve(null);
                      setModal(null);
                    }
                  }}
                  onBlur={(e) => { /* keep focus behavior implicit */ }}
                />
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {modal.type === 'confirm' && (
                  <button
                    onClick={() => { modal.resolve(false); setModal(null); }}
                    style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                  >
                    Cancel
                  </button>
                )}
                {modal.type === 'prompt' && (
                  <button
                    onClick={() => { modal.resolve(null); setModal(null); }}
                    style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    if (modal.type === 'alert') {
                      modal.resolve(true);
                      setModal(null);
                    } else if (modal.type === 'confirm') {
                      modal.resolve(true);
                      setModal(null);
                    } else if (modal.type === 'prompt') {
                      // find the prompt input by ID and return its value
                      const input = document.getElementById('modal-prompt-input');
                      const value = input ? input.value : modal.defaultValue;
                      modal.resolve(value);
                      setModal(null);
                    }
                  }}
                  style={{ padding: '8px 12px', borderRadius: 8, background: modal.theme?.accent || '#3b82f6', border: 'none', color: '#000', fontWeight: 700 }}
                >
                  {modal.type === 'alert' ? 'OK' : modal.type === 'confirm' ? 'Yes' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};

export default ModalContext;
