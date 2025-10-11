/**
 * Centralized style generators for consistent UI
 */

export const inputBaseStyle = (accentColor, theme) => ({
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid rgba(255,255,255,0.1)`,
  borderRadius: '8px',
  padding: '12px',
  color: 'white',
  fontSize: '14px',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background 0.2s'
});

export const selectBaseStyle = (accentColor, theme) => ({
  ...inputBaseStyle(accentColor, theme),
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  backgroundSize: '16px',
  paddingRight: '32px'
});

export const accentInputStyle = (accentColor, theme) => ({
  ...inputBaseStyle(accentColor, theme),
  border: `2px solid ${accentColor}`,
  fontSize: '18px',
  fontWeight: 600
});

export const buttonBaseStyle = (theme) => ({
  border: 'none',
  borderRadius: '12px',
  padding: '12px 24px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  userSelect: 'none'
});

export const buttonPrimaryStyle = (theme) => ({
  ...buttonBaseStyle(theme),
  background: theme.accent,
  boxShadow: `0 4px 12px ${theme.accent}40`
});

export const buttonSecondaryStyle = (theme) => ({
  ...buttonBaseStyle(theme),
  background: 'rgba(255,255,255,0.1)'
});

export const buttonDangerStyle = (theme) => ({
  ...buttonBaseStyle(theme),
  background: '#ef4444',
  boxShadow: '0 4px 12px #ef444440'
});

export const cardStyle = (theme) => ({
  background: theme.card,
  borderRadius: '24px',
  padding: '32px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  transition: 'transform 0.2s, box-shadow 0.2s'
});

export const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
  animation: 'fadeIn 0.2s ease'
};

export const modalContentStyle = (theme) => ({
  ...cardStyle(theme),
  maxWidth: '500px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  animation: 'slideUp 0.3s ease'
});

// Responsive grid utilities
export const responsiveGrid = (cols = { mobile: 1, tablet: 2, desktop: 3 }) => ({
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: `repeat(${cols.mobile}, 1fr)`,
  '@media (min-width: 768px)': {
    gridTemplateColumns: `repeat(${cols.tablet}, 1fr)`
  },
  '@media (min-width: 1024px)': {
    gridTemplateColumns: `repeat(${cols.desktop}, 1fr)`
  }
});

// Container styles
export const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  width: '100%',
  boxSizing: 'border-box'
};

export const narrowContainerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  width: '100%',
  boxSizing: 'border-box'
};

// Flex utilities
export const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export const flexBetween = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

export const flexColumn = {
  display: 'flex',
  flexDirection: 'column'
};

// Typography
export const headingStyle = {
  fontSize: '32px',
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.2
};

export const subheadingStyle = {
  fontSize: '18px',
  fontWeight: 600,
  margin: 0,
  lineHeight: 1.4
};

export const bodyTextStyle = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: 'rgba(255,255,255,0.7)'
};

// Transitions and animations
export const fadeIn = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const slideUp = `
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const pulse = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

// Focus styles for accessibility
export const focusStyle = (accentColor) => ({
  outline: `2px solid ${accentColor}`,
  outlineOffset: '2px'
});