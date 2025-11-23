import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';
import { X, Send, Lightbulb } from 'lucide-react';

/**
 * Modal for submitting feedback and suggestions
 */
const FeedbackModal = ({ theme, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  const { alert } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!suggestion.trim()) {
      await alert('Please enter your suggestion');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create mailto link as backend fallback
      const subject = encodeURIComponent('Suggestion');
      const body = encodeURIComponent(
        `Name: ${name || 'Anonymous'}\nEmail: ${email || 'Not provided'}\n\nSuggestion:\n${suggestion}`
      );

      // Open mailto link (fallback)
      window.location.href = `mailto:suggestion@support.local?subject=${subject}&body=${body}`;

      // Non-blocking toast to inform the user
      try { window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Email client opened', type: 'info', ttl: 3000 } })); } catch (e) {}

      setSubmitStatus('success');

      // Reset form after short delay
      setTimeout(() => {
        setName('');
        setEmail('');
        setSuggestion('');
        setTimeout(onClose, 1500);
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px 16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="feedback-modal-content"
        style={{
          background: theme.card,
          borderRadius: 10,
          padding: 15,
          maxWidth: 600,
          width: '100%',
          maxHeight: 'clamp(500px, 85vh, 92vh)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
          marginBottom: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: `${theme.accent}20`,
              padding: 10,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lightbulb size={24} color={theme.accent} />
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Share Your Ideas</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Scrollable content area */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 12 }}>
          {/* About Section */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
            border: `1px solid ${theme.accent}20`
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600, color: theme.accent }}>
              About
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              This app is a focus and productivity tool designed to help you achieve your goals.
              With Pomodoro timers, interval training, collaborative focus rooms, and achievement tracking,
              we're building tools that help you stay motivated and productive.
            </p>
            <p style={{ margin: '12px 0 0 0', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              We're constantly improving based on your feedback. Share your ideas, report bugs,
              or suggest new features below!
            </p>
          </div>
          {/* Name (Optional) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: 14,
                color: 'white',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Email (Optional) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>
              Your Email (Optional - for follow-up)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: 14,
                color: 'white',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Suggestion */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>
              Your Suggestion or Feedback *
            </label>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="I think it would be great if..."
              required
              rows={6}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: `2px solid ${suggestion ? theme.accent : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 10,
                padding: 14,
                color: 'white',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
              Share your ideas, report bugs, or suggest improvements
            </div>
          </div>
          </div>

          {/* Status Messages and Submit Button - Sticky at bottom */}
          <div style={{
            paddingTop: 16,
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            background: theme.card,
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div style={{
              background: `${theme.accent}20`,
              border: `2px solid ${theme.accent}`,
              borderRadius: 10,
              padding: 16,
              marginBottom: 20,
              textAlign: 'center',
              color: theme.accent,
              fontSize: 14,
              fontWeight: 600
            }}>
              ✓ Thank you! Your email client should open now. Send the email to complete your submission.
            </div>
          )}

          {submitStatus === 'error' && (
            <div style={{
              background: 'rgba(255,0,0,0.1)',
              border: '2px solid rgba(255,0,0,0.5)',
              borderRadius: 10,
              padding: 16,
              marginBottom: 20,
              textAlign: 'center',
              color: 'rgba(255,100,100,1)',
              fontSize: 14,
              fontWeight: 600
            }}>
              ✗ Something went wrong. Please try again or email us directly at suggestion@support.local
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !suggestion.trim()}
            style={{
              width: '100%',
              background: suggestion.trim() ? theme.accent : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 10,
              padding: 16,
              color: 'white',
              cursor: suggestion.trim() ? 'pointer' : 'not-allowed',
              fontSize: 16,
              fontWeight: 600,
              transition: 'all 0.2s',
              boxShadow: suggestion.trim() ? `0 4px 12px ${theme.accent}40` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isSubmitting ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (suggestion.trim() && !isSubmitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 6px 16px ${theme.accent}60`;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = suggestion.trim() ? `0 4px 12px ${theme.accent}40` : 'none';
            }}
          >
            <Send size={18} />
            {isSubmitting ? 'Opening Email...' : 'Send Suggestion'}
          </button>

          <div style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 12,
            textAlign: 'center'
          }}>
            Your feedback will be sent to suggestion@support.local
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
