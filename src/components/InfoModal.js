import React from 'react';
import { X, Users, Clock, Zap, Gift, Award, Music, Palette, Eye } from 'lucide-react';

// Utility function to get contrasting text color
const getContrastColor = (bgColor) => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  const [rs, gs, bs] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Get semi-transparent text color based on theme
const getTextOpacity = (theme, opacity = 0.7) => {
  const baseColor = theme.text;
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * InfoModal Component
 * Explains the main features of the Timer App
 * - Multiple Timer Visualizations
 * - Focus Rooms & Collaboration
 * - Advanced Timer Modes
 * - Themes & Visual Effects
 * - Achievements & Gamification
 * - Custom Music & Scenes
 */
export default function InfoModal({ theme, onClose }) {
	const features = [
		{
			icon: Clock,
			title: 'Multiple Timer Visualizations',
			description: 'Choose from 5 different timer displays: Default (classic), Compact (minimal), Minimal (immersive), Card Stack (modern), and Timeline (split-screen). Each visualization adapts to your current timer mode.'
		},
		{
			icon: Users,
			title: 'Focus Rooms & Collaboration',
			description: 'Create or join collaborative focus spaces. Set shared goals, track time together, and stay accountable as a group for workouts, work sessions, or study. Real-time presence indicators show who\'s active.'
		},
		{
			icon: Zap,
			title: 'Advanced Timer Modes',
			description: 'Simple timers, interval training (work/rest cycles), sequences (multi-step routines), and stopwatch mode. Perfect for HIIT workouts, Pomodoro sessions, or complex training programs.'
		},
		{
			icon: Award,
			title: 'Achievements & Gamification',
			description: 'Unlock badges for milestones: first timer completion, 7-day streaks, 100 sessions, and more. Track your progress in fitness, focus, and productivity with detailed statistics.'
		},
		{
			icon: Gift,
			title: 'Time Capsule',
			description: 'Write messages to your future self. Set them to open after days or weeks. Receive encouragement, motivation, and reminders from your past self at the perfect moment.'
		},
		{
			icon: Music,
			title: 'Custom Music & Scenes',
			description: 'Upload your own background music (MP3/WAV/OGG/AAC/FLAC) and choose from immersive scenes like coffee shop, fireplace, or nature. Files are stored locally in your browser.'
		},
		{
			icon: Palette,
			title: 'Themes & Customization',
			description: 'Choose from multiple themes including Minimal Light, Clean Mode, and custom color schemes. Themes adapt automatically to light/dark modes and can be customized per timer type.'
		},
		{
			icon: Eye,
			title: 'Visual Effects & Scenes',
			description: 'Immerse yourself with particle effects like realistic coffee steam, crackling fireplaces, and weather animations. Choose from various scenes to enhance your focus environment.'
		}
	];

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				background: 'rgba(0,0,0,0.8)',
				display: 'flex',
				alignItems: 'flex-start',
				justifyContent: 'center',
				zIndex: 2000,
				padding: '20px 16px',
				overflowY: 'auto'
			}}
			onClick={onClose}
		>
			<div
				className="info-modal-content"
				style={{
					background: theme.card,
					borderRadius: theme.borderRadius,
					padding: 15,
					maxWidth: 700,
					width: '100%',
					maxHeight: 'clamp(500px, 85vh, 92vh)',
					boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
					border: `1px solid ${getTextOpacity(theme, 0.1)}`,
					position: 'relative',
					marginBottom: '20px',
					display: 'flex',
					flexDirection: 'column',
					overflowY: 'hidden'
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					style={{
						position: 'absolute',
						top: 16,
						right: 16,
						background: 'rgba(255,255,255,0.1)',
						border: 'none',
						borderRadius: theme.borderRadius,
						padding: 8,
						color: getTextOpacity(theme, 0.6),
						cursor: 'pointer',
						fontSize: 20,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1
					}}
					onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
					onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
				>
					<X size={20} />
				</button>

				{/* Scrollable Content */}
				<div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 12 }}>
				{/* Header */}
				<h2
					style={{
						margin: 0,
						marginBottom: 12,
						fontSize: 28,
						fontWeight: 700,
						background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.text} 100%)`,
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						backgroundClip: 'text'
					}}
				>
					Welcome to Timer App
				</h2>

				<p
					style={{
						margin: '0 0 32px 0',
						fontSize: 14,
						color: getTextOpacity(theme, 0.6),
						lineHeight: 1.6
					}}
				>
					A comprehensive timer application with multiple visualization modes, collaborative focus rooms, advanced timer features, and immersive scenes. Perfect for workouts, work sessions, study, or any timed activity. Here's what you can do:
				</p>

				{/* Features Grid */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: window.innerWidth <= 600 ? '1fr' : 'repeat(2, 1fr)',
						gap: 20,
						marginBottom: 24
					}}
				>
					{features.map((feature, idx) => {
						const Icon = feature.icon;
						return (
							<div
								key={idx}
								style={{
									background: 'rgba(255,255,255,0.03)',
									borderRadius: theme.borderRadius,
									padding: 20,
									border: `1px solid ${getTextOpacity(theme, 0.05)}`,
									transition: 'all 0.3s'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
									e.currentTarget.style.borderColor = `rgba(${parseInt(theme.accent.slice(1, 3), 16)},${parseInt(theme.accent.slice(3, 5), 16)},${parseInt(theme.accent.slice(5, 7), 16)},0.3)`;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
									e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
								}}
							>
								<div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
									<div
										style={{
											minWidth: 40,
											height: 40,
											borderRadius: theme.borderRadius,
											background: `${theme.accent}20`,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: theme.accent
										}}
									>
										<Icon size={20} />
									</div>
									<div style={{ flex: 1 }}>
										<h3
											style={{
												margin: '0 0 6px 0',
												fontSize: 16,
												fontWeight: 600,
												color: theme.text
											}}
										>
											{feature.title}
										</h3>
										<p
											style={{
												margin: 0,
												fontSize: 13,
												color: getTextOpacity(theme, 0.6),
												lineHeight: 1.5
											}}
										>
											{feature.description}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Footer */}
				<div
					style={{
						padding: 16,
						background: 'rgba(255,255,255,0.02)',
						borderRadius: theme.borderRadius,
						borderTop: '1px solid rgba(255,255,255,0.05)',
						fontSize: 12,
						color: getTextOpacity(theme, 0.5),
						textAlign: 'center',
						lineHeight: 1.5
					}}
				>
					<p style={{ margin: 0 }}>
						💡 <strong>Tip:</strong> Try different timer visualizations in Settings! The Minimal mode is perfect for immersive focus, while Card Stack works great for sequences. Join Focus Rooms to collaborate with others!
					</p>
					<p style={{ margin: '8px 0 0 0', fontSize: 12, color: getTextOpacity(theme, 0.55) }}>
						<strong>Note on exports:</strong> World clocks, custom themes, uploaded music, and timer visualizations are currently stored locally and are not included in the app export/import feature. Uploaded music is saved in your browser (IndexedDB) and is device-specific.
					</p>
				</div>
				</div>

				{/* Close Button (Bottom) - Sticky */}
				<div style={{
					paddingTop: 16,
					paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
					background: theme.card,
					borderTop: '1px solid rgba(255,255,255,0.1)'
				}}>
				<button
					onClick={onClose}
					style={{
						width: '100%',
						background: theme.accent,
						border: 'none',
						borderRadius: theme.borderRadius,
						padding: 14,
						color: getContrastColor(theme.accent),
						cursor: 'pointer',
						fontSize: 16,
						fontWeight: 600,
						transition: 'all 0.2s'
					}}
					onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
					onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
				>
					Got it!
				</button>
				</div>
			</div>
		</div>
	);
}

