import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * StatsPanel Component
 * Displays user statistics and monthly comparison
 * 
 * Props:
 * - theme: Current theme object
 * - currentStreak: Current consecutive days streak
 * - totalCompletions: Total number of completed timers
 * - saved: Array of saved timers
 * - monthlyStats: Object with monthly statistics keyed by 'YYYY-MM'
 */
function StatsPanel({
  theme,
  currentStreak,
  totalCompletions,
  saved,
  monthlyStats
}) {
  return (
    <>
      {/* Stats Card */}
      <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, margin: 0, marginBottom: 20 }}>📊 Your Progress</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: theme.accent }}>{currentStreak}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>🔥 Day Streak</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: theme.accent }}>{totalCompletions}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>✅ Completed</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: theme.accent }}>{saved?.length || 0}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>⏱️ Saved Timers</div>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      {(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
        const currentStats = monthlyStats?.[currentMonth] || { completions: 0, totalSeconds: 0, bestStreak: 0 };
        const lastStats = monthlyStats?.[lastMonth] || { completions: 0, totalSeconds: 0, bestStreak: 0 };
        const hasLastMonth = lastStats.completions > 0;

        if (!hasLastMonth && currentStats.completions === 0) return null;

        const calcChange = (current, last) => {
          if (last === 0) return current > 0 ? 100 : 0;
          return Math.round(((current - last) / last) * 100);
        };

        return (
          <div style={{ background: theme.card, borderRadius: 24, padding: 32, marginTop: 24 }}>
            <h2 style={{ fontSize: 18, margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} /> This Month vs Last Month
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Completions</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: theme.accent }}>{currentStats.completions}</div>
                {hasLastMonth && (
                  <div style={{ fontSize: 12, color: calcChange(currentStats.completions, lastStats.completions) >= 0 ? '#10b981' : '#ef4444', marginTop: 4 }}>
                    {calcChange(currentStats.completions, lastStats.completions) >= 0 ? '↑' : '↓'} {Math.abs(calcChange(currentStats.completions, lastStats.completions))}%
                  </div>
                )}
              </div>
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Total Time</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: theme.accent }}>{Math.floor(currentStats.totalSeconds / 3600)}h</div>
                {hasLastMonth && (
                  <div style={{ fontSize: 12, color: calcChange(currentStats.totalSeconds, lastStats.totalSeconds) >= 0 ? '#10b981' : '#ef4444', marginTop: 4 }}>
                    {calcChange(currentStats.totalSeconds, lastStats.totalSeconds) >= 0 ? '↑' : '↓'} {Math.abs(calcChange(currentStats.totalSeconds, lastStats.totalSeconds))}%
                  </div>
                )}
              </div>
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Best Streak</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: theme.accent }}>{currentStats.bestStreak} days</div>
                {hasLastMonth && (
                  <div style={{ fontSize: 12, color: calcChange(currentStats.bestStreak, lastStats.bestStreak) >= 0 ? '#10b981' : '#ef4444', marginTop: 4 }}>
                    {calcChange(currentStats.bestStreak, lastStats.bestStreak) >= 0 ? '↑' : '↓'} {Math.abs(calcChange(currentStats.bestStreak, lastStats.bestStreak))}%
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

export default StatsPanel;
