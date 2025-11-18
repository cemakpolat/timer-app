import React, { useState, useEffect } from 'react';
import '../shared/Button.module.css';

/**
 * RoomExpirationModal
 * Shown when room timer expires. Owner can:
 * - Extend timer (max 30 min per extension)
 * - Close room immediately
 * - Do nothing (auto-closes after grace period)
 */
const RoomExpirationModal = ({ 
  isOpen, 
  roomId, 
  isOwner, 
  onExtend, 
  onClose, 
  gracePeriodSec = 120,
  maxExtensionMinutes = 30
}) => {
  const [secondsLeft, setSecondsLeft] = useState(gracePeriodSec);
  const [extensionMinutes, setExtensionMinutes] = useState(5);
  const [isExtending, setIsExtending] = useState(false);
  const [error, setError] = useState(null);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Auto-close when time expires
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  const handleExtend = async () => {
    if (!isOwner) return;
    
    setIsExtending(true);
    setError(null);

    try {
      const extensionMs = extensionMinutes * 60 * 1000;
      await onExtend(extensionMs);
      // Modal will close automatically when room updates
    } catch (err) {
      console.error('Failed to extend timer:', err);
      setError(err.message || 'Failed to extend timer');
    } finally {
      setIsExtending(false);
    }
  };

  if (!isOpen) return null;

  const minutesLeft = Math.floor(secondsLeft / 60);
  const secondsLeftInMin = secondsLeft % 60;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>⏱️ Timer Expired</h2>
          <p style={styles.subtitle}>Room will auto-close in {minutesLeft}:{secondsLeftInMin.toString().padStart(2, '0')}</p>
        </div>

        <div style={styles.content}>
          {isOwner ? (
            <>
              <p style={styles.text}>
                Your focus session has ended. What would you like to do?
              </p>

              <div style={styles.extensionSection}>
                <label style={styles.label}>
                  Extend timer by:
                  <select 
                    value={extensionMinutes} 
                    onChange={(e) => setExtensionMinutes(Number(e.target.value))}
                    style={styles.select}
                    disabled={isExtending}
                  >
                    {[5, 10, 15, 20, 25, 30].map(min => (
                      <option key={min} value={min}>{min} min</option>
                    ))}
                  </select>
                </label>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <div style={styles.buttonGroup}>
                <button
                  onClick={handleExtend}
                  disabled={isExtending}
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    opacity: isExtending ? 0.6 : 1
                  }}
                >
                  {isExtending ? 'Extending...' : '✅ Extend Timer'}
                </button>

                <button
                  onClick={onClose}
                  disabled={isExtending}
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    opacity: isExtending ? 0.6 : 1
                  }}
                >
                  ❌ Close Room Now
                </button>
              </div>

              <p style={styles.hint}>
                You can extend up to {maxExtensionMinutes} minutes at a time.
              </p>
            </>
          ) : (
            <>
              <p style={styles.text}>
                The room owner will decide whether to close or extend. Please wait...
              </p>
              <div style={styles.buttonGroup}>
                <button
                  onClick={onClose}
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton
                  }}
                >
                  Leave Room
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  header: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#333',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
  },
  content: {
    marginBottom: '24px',
  },
  text: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  extensionSection: {
    backgroundColor: '#f5f5f5',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#333',
  },
  select: {
    display: 'block',
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '8px',
    cursor: 'pointer',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexDirection: 'column',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    marginTop: '16px',
    fontStyle: 'italic',
  },
};

export default RoomExpirationModal;
