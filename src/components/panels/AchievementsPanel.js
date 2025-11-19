import React from 'react';
import { Award, Sparkles, Target, Mail, Download, Upload, History } from 'lucide-react';

/**
 * AchievementsPanel Component
 * Displays achievements, daily challenges, time capsule, and data export/import
 * 
 * Props:
 * - theme: Current theme object
 * - ACHIEVEMENTS: Array of achievement definitions
 * - achievements: Array of unlocked achievement IDs
 * - getSmartSuggestions: Function to get smart suggestions
 * - dailyChallenge: Current daily challenge object
 * - timeCapsules: Array of time capsule messages
 * - showCapsuleInput: Boolean to show/hide capsule input
 * - capsuleMessage: String content of capsule message being written
 * - history: Array of completed timer history entries
 * - setShowCapsuleInput: Function to toggle capsule input
 * - setCapsuleMessage: Function to update capsule message
 * - createTimeCapsule: Function to create and save capsule
 * - exportData: Function to export all data
 * - importData: Function to import data from file
 * - setHistory: Function to update history
 * - formatDate: Function to format dates
 */
function AchievementsPanel({
  theme,
  ACHIEVEMENTS,
  achievements,
  getSmartSuggestions,
  dailyChallenge,
  timeCapsules,
  showCapsuleInput,
  capsuleMessage,
  history,
  setShowCapsuleInput,
  setCapsuleMessage,
  createTimeCapsule,
  exportData,
  importData,
  setHistory,
  formatDate
}) {
  return (
    <>
      {/* Achievements */}
      <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={18} /> Achievements
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = achievements.includes(ach.id);
            return (
              <div key={ach.id} style={{ padding: 16, background: isUnlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: 12, textAlign: 'center', opacity: isUnlocked ? 1 : 0.5, border: isUnlocked ? `2px solid ${theme.accent}40` : 'none', transition: 'all 0.3s' }}>
                <div style={{ fontSize: 32, marginBottom: 8, filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>{ach.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{ach.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{ach.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Insights */}
      {(() => {
        const suggestions = getSmartSuggestions();
        if (suggestions.length === 0) return null;

        return (
          <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginTop: 24 }}>
            <h2 style={{ fontSize: 18, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} /> Your Insights
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestions.map((sug, idx) => (
                <div key={idx} style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>{sug.icon}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{sug.text}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Daily Challenge */}
      <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={18} /> Daily Challenge
        </h2>
        <div style={{ padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: dailyChallenge?.progress >= dailyChallenge?.target ? `2px solid ${theme.accent}` : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 32 }}>{dailyChallenge?.icon || '🎯'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{dailyChallenge?.text || 'No challenge today'}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                Progress: {dailyChallenge?.progress || 0} / {dailyChallenge?.target || 0}
                {dailyChallenge?.progress >= dailyChallenge?.target && ' ✅'}
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, ((dailyChallenge?.progress || 0) / (dailyChallenge?.target || 1)) * 100)}%`, height: '100%', background: theme.accent, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Time Capsule */}
      <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mail size={18} /> Time Capsule
        </h2>
        <div style={{ marginBottom: 16, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
          Write a message to your future self. You'll see it in 30 days!
        </div>
        {!showCapsuleInput ? (
          <button
            onClick={() => setShowCapsuleInput(true)}
            style={{ width: '100%', background: theme.accent, border: 'none', borderRadius: 12, padding: 16, color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            📩 Create Time Capsule
          </button>
        ) : (
          <div>
            <textarea
              value={capsuleMessage}
              onChange={(e) => setCapsuleMessage(e.target.value)}
              placeholder="Write your message here..."
              style={{ width: '100%', minHeight: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: theme.text, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={createTimeCapsule}
                disabled={!capsuleMessage.trim()}
                style={{ flex: 1, background: theme.accent, border: 'none', borderRadius: 12, padding: 12, color: 'white', cursor: capsuleMessage.trim() ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600, opacity: capsuleMessage.trim() ? 1 : 0.5 }}
              >
                Send to Future
              </button>
              <button
                onClick={() => { setShowCapsuleInput(false); setCapsuleMessage(''); }}
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: 12, color: theme.text, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {timeCapsules?.filter(c => !c.opened).length > 0 && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            📦 You have {timeCapsules.filter(c => !c.opened).length} unopened capsule{timeCapsules.filter(c => !c.opened).length > 1 ? 's' : ''} waiting
          </div>
        )}
      </div>

      {/* Export/Import Data */}
      <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, margin: 0, marginBottom: 20 }}>💾 Backup & Restore</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={exportData}
            style={{ flex: 1, minWidth: 200, background: theme.accent, border: 'none', borderRadius: 12, padding: 16, color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Download size={16} /> Export Data
          </button>
          <label style={{ flex: 1, minWidth: 200 }}>
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
            />
            <div style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: 16, color: theme.text, cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Upload size={16} /> Import Data
            </div>
          </label>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          Backup all your timers, stats, and achievements
        </div>
      </div>

      {/* History Log */}
      <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={18} /> Recent History
          </h2>
          {history?.length > 0 && (
            <button 
              onClick={() => setHistory([])} 
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              Clear
            </button>
          )}
        </div>
        {!history || history.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', padding: 20 }}>
            No recently completed timers.
          </div>
        ) : (
          <div>
            {history.map(entry => (
              <div key={entry.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flexGrow: 1, minWidth: '150px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.name || entry.type}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{entry.details}</div>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: typeof window !== 'undefined' && window.innerWidth <= 480 ? 4 : 0 }}>
                  {formatDate(entry.completedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AchievementsPanel;
