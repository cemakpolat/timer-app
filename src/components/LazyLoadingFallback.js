import React from 'react';

/**
 * LazyLoadingFallback Component
 * 
 * Fallback UI shown while lazy-loaded components are loading.
 * Displays a simple loading indicator with theme awareness.
 * 
 * Props:
 * - theme: Current theme object with card and text properties (optional)
 */

export default function LazyLoadingFallback({ theme }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px',
      background: theme?.card || 'rgba(255,255,255,0.05)',
      borderRadius: theme.borderRadius,
      minHeight: 200
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          width: 40,
          height: 40,
          border: '3px solid rgba(255,255,255,0.2)',
          borderTop: '3px solid rgba(255,255,255,0.8)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          marginTop: 16,
          fontSize: 14,
          color: theme?.text || 'rgba(255,255,255,0.7)'
        }}>
          Loading...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
