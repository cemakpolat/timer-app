import React from 'react';

const baseLayerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'hidden',
};

const hexToRgb = (color) => {
  if (!color || typeof color !== 'string' || !color.startsWith('#')) {
    return null;
  }

  const normalized = color.length === 4
    ? color.slice(1).split('').map((character) => character + character).join('')
    : color.slice(1);

  if (normalized.length !== 6) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 16);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const withAlpha = (color, alpha) => {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const getAnimationDuration = (seconds, velocity = 1, minSeconds = 4) => {
  const adjustedSeconds = seconds / Math.max(0.4, velocity || 1);
  return `${Math.max(minSeconds, adjustedSeconds).toFixed(1)}s`;
};

const COMMON_EFFECT_KEYFRAMES = `
  .weather-cloud {
    width: 300px;
    height: 100px;
    background: var(--cloud-color, #fff);
    border-radius: 100px;
    position: absolute;
    filter: url(#weather-cloud-filter);
    box-shadow:
      80px -20px 0 20px var(--cloud-color, #fff),
      150px 10px 0 10px var(--cloud-color, #fff),
      40px 20px 0 15px var(--cloud-color, #fff);
  }
  @keyframes weather-cloud-float {
    0% { transform: translateX(-400px) scale(var(--scale, 1)); }
    100% { transform: translateX(100vw) scale(var(--scale, 1)); }
  }
  @keyframes weather-sun-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes weather-sun-pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 0.8; }
  }
  @keyframes weather-flare-float {
    0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.3; }
    50% { transform: translate3d(-20px, 20px, 0); opacity: 0.5; }
  }
  @keyframes weather-ambient-drift {
    0% { transform: translate3d(-4%, -2%, 0) scale(1); }
    50% { transform: translate3d(6%, 4%, 0) scale(1.08); }
    100% { transform: translate3d(-2%, 3%, 0) scale(1.02); }
  }
  @keyframes weather-ambient-sway {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.65; }
    50% { transform: translate3d(4%, -3%, 0) scale(1.06); opacity: 1; }
  }
  @keyframes weather-shimmer {
    0% { transform: translateX(-4%) translateY(0); opacity: 0.5; }
    50% { transform: translateX(4%) translateY(2%); opacity: 0.9; }
    100% { transform: translateX(-2%) translateY(-1%); opacity: 0.55; }
  }
  @keyframes weather-grid-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes weather-scanlines {
    0% { transform: translateY(0); }
    100% { transform: translateY(18px); }
  }
  @keyframes weather-heat-shimmer {
    0%, 100% { transform: translateY(0) scaleX(1); opacity: 0.35; }
    50% { transform: translateY(-10px) scaleX(1.06); opacity: 0.65; }
  }
  @keyframes weather-lantern-pulse {
    0%, 100% { transform: scale(1); opacity: 0.78; }
    50% { transform: scale(1.08); opacity: 1; }
  }
  @keyframes weather-slow-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes weather-watercolor-breathe {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.62; }
    50% { transform: translate3d(3%, -2%, 0) scale(1.08); opacity: 0.94; }
  }
  @keyframes weather-ink-drift {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.4; }
    50% { transform: translate3d(-3%, 4%, 0) scale(1.06); opacity: 0.72; }
  }
  @keyframes weather-prism-sweep {
    0% { transform: translate3d(-10%, 0, 0) skewX(-18deg); opacity: 0.28; }
    50% { transform: translate3d(8%, -3%, 0) skewX(-12deg); opacity: 0.72; }
    100% { transform: translate3d(-6%, 2%, 0) skewX(-16deg); opacity: 0.32; }
  }
  @keyframes weather-orbit-drift {
    0%, 100% { transform: translate3d(0, 0, 0); }
    25% { transform: translate3d(8px, -12px, 0); }
    50% { transform: translate3d(-6px, -18px, 0); }
    75% { transform: translate3d(-14px, 8px, 0); }
  }
  @keyframes weather-film-flicker {
    0%, 100% { opacity: 0.62; }
    12% { opacity: 0.7; }
    18% { opacity: 0.56; }
    46% { opacity: 0.76; }
    52% { opacity: 0.6; }
    80% { opacity: 0.72; }
  }
  @keyframes weather-noise-shift {
    0% { transform: translate3d(0, 0, 0) scale(1); }
    25% { transform: translate3d(-1%, 1%, 0) scale(1.02); }
    50% { transform: translate3d(1%, -1%, 0) scale(1.01); }
    75% { transform: translate3d(-0.5%, 1.5%, 0) scale(1.03); }
    100% { transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes weather-brutalist-sweep {
    0% { transform: translate3d(-14%, 0, 0) skewX(-18deg); opacity: 0.18; }
    50% { transform: translate3d(8%, -6%, 0) skewX(-10deg); opacity: 0.68; }
    100% { transform: translate3d(-6%, 2%, 0) skewX(-16deg); opacity: 0.24; }
  }
`;

const SharedEffectStyles = () => <style>{COMMON_EFFECT_KEYFRAMES}</style>;

const EffectLayer = ({ config, style, children }) => (
  <div
    style={{
      ...baseLayerStyle,
      opacity: config?.opacity ?? 1,
      ...style,
    }}
  >
    <SharedEffectStyles />
    {children}
  </div>
);

const GlowOrbs = ({ orbs }) => (
  <>
    {orbs.map((orb, index) => (
      <div
        key={`orb-${index}`}
        style={{
          position: 'absolute',
          borderRadius: '50%',
          pointerEvents: 'none',
          background: `radial-gradient(circle, ${orb.color} 0%, ${orb.midColor || 'rgba(255,255,255,0.04)'} 42%, transparent 72%)`,
          filter: orb.filter || 'blur(40px)',
          animation: orb.animation,
          animationDelay: orb.animationDelay,
          mixBlendMode: orb.blendMode || 'screen',
          ...orb.style,
        }}
      />
    ))}
  </>
);

const SparkleField = ({ sparkles }) => (
  <>
    {sparkles.map((sparkle, index) => (
      <div
        key={`sparkle-${index}`}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${sparkle.color} 0%, transparent 72%)`,
          filter: sparkle.filter || 'blur(2px)',
          mixBlendMode: sparkle.blendMode || 'screen',
          animation: sparkle.animation,
          animationDelay: sparkle.animationDelay,
          opacity: sparkle.opacity ?? 1,
          boxShadow: sparkle.boxShadow,
          ...sparkle.style,
        }}
      />
    ))}
  </>
);

const CloudyEffect = ({ config }) => (
  <EffectLayer
    config={config}
    style={{
      '--cloud-color': config?.color || '#fff',
    }}
  >
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <filter id="weather-cloud-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="0" />
        <feDisplacementMap in="SourceGraphic" scale="40" />
        <feGaussianBlur stdDeviation="4" />
      </filter>
    </svg>

    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(to bottom, ${config?.color || 'rgba(200,210,220,0.1)'} 0%, rgba(220,230,240,0.02) 100%)`,
        opacity: (config?.opacity ?? 1) * 0.15,
      }}
    />

    {[
      {
        top: '10%',
        left: '-10%',
        '--scale': 0.5,
        opacity: 0.8 * (config?.opacity ?? 1),
        animation: `weather-cloud-float ${getAnimationDuration(50, config?.velocity)} linear infinite`,
      },
      {
        top: '25%',
        left: '-20%',
        '--scale': 0.4,
        opacity: 0.7 * (config?.opacity ?? 1),
        width: '400px',
        height: '80px',
        boxShadow: `120px -10px 0 10px ${config?.color || '#fff'}, 200px 5px 0 15px ${config?.color || '#fff'}, 60px 15px 0 10px ${config?.color || '#fff'}`,
        animation: `weather-cloud-float ${getAnimationDuration(65, config?.velocity)} linear infinite reverse`,
        animationDelay: '-20s',
      },
      {
        top: '15%',
        left: '-15%',
        '--scale': 0.6,
        opacity: 0.75 * (config?.opacity ?? 1),
        width: '250px',
        height: '120px',
        boxShadow: `60px -40px 0 30px ${config?.color || '#fff'}, 120px -10px 0 20px ${config?.color || '#fff'}, 30px 30px 0 15px ${config?.color || '#fff'}`,
        animation: `weather-cloud-float ${getAnimationDuration(55, config?.velocity)} linear infinite`,
        animationDelay: '-10s',
      },
      {
        top: '40%',
        left: '-25%',
        '--scale': 0.3,
        opacity: 0.6 * (config?.opacity ?? 1),
        width: '200px',
        height: '70px',
        boxShadow: `50px -10px 0 10px ${config?.color || '#fff'}, 100px 0px 0 8px ${config?.color || '#fff'}`,
        animation: `weather-cloud-float ${getAnimationDuration(80, config?.velocity)} linear infinite`,
        animationDelay: '-5s',
      },
    ].map((cloud, index) => (
      <div key={`cloud-${index}`} className="weather-cloud" style={cloud} />
    ))}
  </EffectLayer>
);

const SunnyEffect = ({ config }) => (
  <EffectLayer
    config={config}
    style={{
      background: `linear-gradient(135deg, ${config?.color || 'rgba(255,200,100,0.15)'} 0%, rgba(255,255,255,0) 100%)`,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255,250,220,0.95) 0%, rgba(255,200,50,0.5) 30%, rgba(255,140,0,0.15) 60%, transparent 70%)',
        filter: 'blur(40px)',
        animation: `weather-sun-pulse ${getAnimationDuration(4, config?.velocity)} ease-in-out infinite`,
      }}
    />

    <div
      style={{
        position: 'absolute',
        top: '50px',
        right: '50px',
        width: 0,
        height: 0,
        animation: `weather-sun-rotate ${getAnimationDuration(60, config?.velocity, 16)} linear infinite`,
      }}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={`sun-ray-${index}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            height: '1000px',
            width: '80px',
            background: 'linear-gradient(to bottom, rgba(255,210,100,0.2) 0%, transparent 70%)',
            transformOrigin: 'top center',
            transform: `translate(-50%, 0) rotate(${index * 30}deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          }}
        />
      ))}
    </div>

    <GlowOrbs
      orbs={[
        {
          color: 'rgba(255,255,255,0.08)',
          style: { top: '25%', right: '25%', width: '200px', height: '200px' },
          animation: `weather-flare-float ${getAnimationDuration(10, config?.velocity)} ease-in-out infinite`,
        },
        {
          color: 'rgba(255,255,255,0.12)',
          filter: 'blur(8px)',
          style: { top: '40%', right: '40%', width: '50px', height: '50px' },
          animation: `weather-flare-float ${getAnimationDuration(10, config?.velocity)} ease-in-out infinite`,
          animationDelay: '2s',
        },
      ]}
    />
  </EffectLayer>
);

const ShojiDuskEffect = ({ config }) => {
  const accent = config?.color || '#F7C986';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#4E2A17', 0.12)} 0%, transparent 70%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, ${withAlpha('#2E1A10', 0.08)} 0%, transparent 12%, transparent 88%, ${withAlpha('#2E1A10', 0.08)} 100%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '8%',
          right: '-6%',
          width: '42%',
          height: '62%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha(accent, 0.35)} 0%, ${withAlpha('#FFE9BC', 0.16)} 42%, transparent 72%)`,
          filter: 'blur(30px)',
          animation: `weather-ambient-sway ${getAnimationDuration(16, config?.velocity)} ease-in-out infinite`,
        }}
      />

      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={`shoji-vertical-${index}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${12 + index * 18}%`,
            width: '10px',
            background: withAlpha('#3A2418', 0.18),
            boxShadow: `0 0 0 1px ${withAlpha('#FFE5BD', 0.04)}`,
          }}
        />
      ))}

      {['22%', '54%', '78%'].map((top, index) => (
        <div
          key={`shoji-horizontal-${top}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top,
            height: '8px',
            background: withAlpha('#3A2418', 0.14),
            opacity: index === 1 ? 0.75 : 0.55,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(180deg, ${withAlpha('#FFF3D8', 0.025)} 0 2px, transparent 2px 18px)`,
          opacity: 0.4,
        }}
      />

      <GlowOrbs
        orbs={[
          {
            color: withAlpha('#FFF2D0', 0.22),
            midColor: withAlpha('#FFF2D0', 0.08),
            filter: 'blur(10px)',
            style: { top: '28%', left: '28%', width: '20px', height: '20px' },
            animation: `weather-flare-float ${getAnimationDuration(12, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: withAlpha('#FFF2D0', 0.14),
            filter: 'blur(18px)',
            style: { top: '58%', left: '42%', width: '26px', height: '26px' },
            animation: `weather-flare-float ${getAnimationDuration(18, config?.velocity)} ease-in-out infinite`,
            animationDelay: '-4s',
          },
        ]}
      />
    </EffectLayer>
  );
};

const NordicFrostEffect = ({ config }) => {
  const accent = config?.color || '#D7EEFF';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#CBE6F8', 0.08)} 0%, transparent 70%)`,
      }}
    >
      <GlowOrbs
        orbs={[
          {
            color: withAlpha(accent, 0.24),
            midColor: withAlpha(accent, 0.08),
            style: { top: '-12%', right: '-10%', width: '48%', height: '48%' },
            animation: `weather-ambient-drift ${getAnimationDuration(24, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: 'rgba(255,255,255,0.2)',
            midColor: 'rgba(255,255,255,0.06)',
            style: { bottom: '-12%', left: '-6%', width: '40%', height: '32%' },
            animation: `weather-ambient-drift ${getAnimationDuration(30, config?.velocity)} ease-in-out infinite reverse`,
          },
        ]}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 90px ${withAlpha(accent, 0.18)}, inset 0 0 160px rgba(255,255,255,0.08)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: '-8%',
          background: `repeating-linear-gradient(125deg, rgba(255,255,255,0.12) 0 2px, transparent 2px 18px)`,
          filter: 'blur(8px)',
          opacity: 0.12,
          animation: `weather-shimmer ${getAnimationDuration(18, config?.velocity)} ease-in-out infinite`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: '0 0 58% 0',
          background: `linear-gradient(180deg, rgba(255,255,255,0.12), transparent)`,
          mixBlendMode: 'screen',
          opacity: 0.4,
        }}
      />
    </EffectLayer>
  );
};

const UnderwaterCausticsEffect = ({ config }) => {
  const accent = config?.color || '#69D5FF';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#062133', 0.2)} 0%, ${withAlpha('#03111C', 0.12)} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${withAlpha('#FFFFFF', 0.12)} 0%, transparent 28%)`,
          opacity: 0.3,
        }}
      />

      {[
        { inset: '-8%', duration: 14, opacity: 0.42 },
        { inset: '-12%', duration: 18, opacity: 0.32 },
        { inset: '-6%', duration: 22, opacity: 0.24 },
      ].map((layer, index) => (
        <div
          key={`caustics-${index}`}
          style={{
            position: 'absolute',
            inset: layer.inset,
            background: `radial-gradient(circle at 20% 30%, ${withAlpha('#FFFFFF', 0.2)} 0%, transparent 24%), radial-gradient(circle at 70% 58%, ${withAlpha(accent, 0.16)} 0%, transparent 28%), radial-gradient(circle at 48% 12%, ${withAlpha('#FFFFFF', 0.12)} 0%, transparent 22%), linear-gradient(120deg, ${withAlpha(accent, 0.12)} 0%, transparent 60%)`,
            filter: 'blur(26px)',
            mixBlendMode: 'screen',
            opacity: layer.opacity,
            animation: `weather-ambient-drift ${getAnimationDuration(layer.duration, config?.velocity)} ease-in-out infinite`,
            animationDelay: `${index * -3}s`,
          }}
        />
      ))}
    </EffectLayer>
  );
};

const MediterraneanCourtyardEffect = ({ config }) => {
  const accent = config?.color || '#FFD38A';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#FFF4DE', 0.1)} 0%, transparent 72%)`,
      }}
    >
      <GlowOrbs
        orbs={[
          {
            color: withAlpha('#FFF2C7', 0.3),
            midColor: withAlpha(accent, 0.12),
            style: { top: '-16%', left: '-8%', width: '52%', height: '56%' },
            animation: `weather-ambient-drift ${getAnimationDuration(24, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: withAlpha('#E38B5B', 0.18),
            midColor: withAlpha('#E38B5B', 0.08),
            style: { bottom: '-8%', right: '14%', width: '32%', height: '24%' },
            animation: `weather-ambient-drift ${getAnimationDuration(28, config?.velocity)} ease-in-out infinite reverse`,
          },
        ]}
      />

      <div
        style={{
          position: 'absolute',
          inset: '-12%',
          background: 'repeating-linear-gradient(118deg, rgba(34,49,63,0.18) 0 34px, transparent 34px 120px)',
          filter: 'blur(8px)',
          opacity: 0.3,
          transform: 'translateX(8%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: '0 0 42% 0',
          background: `linear-gradient(180deg, ${withAlpha('#FFFFFF', 0.08)} 0%, transparent 100%)`,
        }}
      />
    </EffectLayer>
  );
};

const LanternBazaarEffect = ({ config }) => {
  const accent = config?.color || '#FFB347';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#1A1024', 0.24)} 0%, ${withAlpha('#05040A', 0.16)} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '0 0 62% 0',
          background: `linear-gradient(180deg, ${withAlpha('#2C1835', 0.32)} 0%, transparent 100%)`,
          opacity: 0.7,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.16) 0 18px, transparent 18px 42px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.1) 0 18px, transparent 18px 42px)',
          opacity: 0.28,
        }}
      />

      <GlowOrbs
        orbs={[
          {
            color: withAlpha('#FFF0C1', 0.18),
            style: { top: '-12%', left: '8%', width: '64%', height: '34%' },
            animation: `weather-ambient-drift ${getAnimationDuration(24, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: withAlpha(accent, 0.22),
            style: { bottom: '-10%', left: '28%', width: '40%', height: '22%' },
            animation: `weather-ambient-drift ${getAnimationDuration(26, config?.velocity)} ease-in-out infinite reverse`,
          },
        ]}
      />

      {[
        { top: '12%', left: '18%', size: 96, color: accent },
        { top: '24%', left: '44%', size: 82, color: '#FF7A59' },
        { top: '18%', left: '68%', size: 104, color: '#FFD166' },
      ].map((lantern, index) => (
        <React.Fragment key={`lantern-${index}`}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `calc(${lantern.left} + ${lantern.size / 2}px)`,
              width: '2px',
              height: `calc(${lantern.top} + 6px)`,
              background: withAlpha('#433022', 0.48),
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: lantern.top,
              left: lantern.left,
              width: `${lantern.size}px`,
              height: `${Math.round(lantern.size * 1.18)}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${withAlpha('#FFF6D5', 0.9)} 0%, ${withAlpha(lantern.color, 0.42)} 38%, transparent 72%)`,
              filter: 'blur(8px)',
              mixBlendMode: 'screen',
              animation: `weather-lantern-pulse ${getAnimationDuration(5 + index, config?.velocity)} ease-in-out infinite`,
            }}
          />
        </React.Fragment>
      ))}

      <SparkleField
        sparkles={[
          {
            color: withAlpha('#FFF6D5', 0.6),
            style: { top: '20%', left: '26%', width: '6px', height: '6px' },
            animation: `weather-lantern-pulse ${getAnimationDuration(6, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: withAlpha('#FFD166', 0.5),
            style: { top: '30%', left: '61%', width: '5px', height: '5px' },
            animation: `weather-lantern-pulse ${getAnimationDuration(5, config?.velocity)} ease-in-out infinite`,
            animationDelay: '-2s',
          },
          {
            color: withAlpha('#FFF6D5', 0.42),
            style: { top: '64%', left: '76%', width: '4px', height: '4px' },
            animation: `weather-flare-float ${getAnimationDuration(12, config?.velocity)} ease-in-out infinite`,
          },
        ]}
      />

      <GlowOrbs
        orbs={[
          {
            color: withAlpha(accent, 0.24),
            style: { top: '54%', left: '-8%', width: '32%', height: '30%' },
            animation: `weather-ambient-drift ${getAnimationDuration(22, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: withAlpha('#FF5F5F', 0.18),
            style: { bottom: '-8%', right: '6%', width: '36%', height: '24%' },
            animation: `weather-ambient-drift ${getAnimationDuration(26, config?.velocity)} ease-in-out infinite reverse`,
          },
        ]}
      />
    </EffectLayer>
  );
};

const DesertMirageEffect = ({ config }) => {
  const accent = config?.color || '#F1C27D';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#5A3318', 0.08)} 0%, transparent 70%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-6%',
          width: '36%',
          height: '42%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#FFF2B8', 0.28)} 0%, ${withAlpha(accent, 0.12)} 42%, transparent 76%)`,
          filter: 'blur(30px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '58%',
          left: '-4%',
          width: '108%',
          height: '18%',
          background: `linear-gradient(180deg, ${withAlpha('#FFF2C4', 0.2)} 0%, ${withAlpha(accent, 0.16)} 34%, transparent 100%)`,
          filter: 'blur(18px)',
          animation: `weather-heat-shimmer ${getAnimationDuration(8, config?.velocity)} ease-in-out infinite`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 16px)',
          opacity: 0.18,
          mixBlendMode: 'screen',
        }}
      />
    </EffectLayer>
  );
};

const TropicalNightMarketEffect = ({ config }) => {
  const accent = config?.color || '#FF7CB6';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#081423', 0.16)} 0%, ${withAlpha('#041018', 0.12)} 100%)`,
      }}
    >
      <GlowOrbs
        orbs={[
          {
            color: withAlpha(accent, 0.28),
            style: { bottom: '-10%', left: '-10%', width: '38%', height: '34%' },
            animation: `weather-ambient-drift ${getAnimationDuration(18, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: withAlpha('#35F0FF', 0.24),
            style: { bottom: '-14%', right: '-4%', width: '34%', height: '34%' },
            animation: `weather-ambient-drift ${getAnimationDuration(22, config?.velocity)} ease-in-out infinite reverse`,
          },
        ]}
      />

      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={`market-light-${index}`}
          style={{
            position: 'absolute',
            top: '12%',
            left: `${8 + index * 11}%`,
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${withAlpha(index % 2 === 0 ? accent : '#35F0FF', 0.95)} 0%, transparent 72%)`,
            filter: 'blur(4px)',
            animation: `weather-lantern-pulse ${getAnimationDuration(4 + (index % 3), config?.velocity)} ease-in-out infinite`,
            animationDelay: `${index * -0.6}s`,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          top: '12.5%',
          left: '5%',
          width: '90%',
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${withAlpha('#FFE4BF', 0.3)} 12%, ${withAlpha('#FFE4BF', 0.3)} 88%, transparent 100%)`,
          opacity: 0.4,
        }}
      />
    </EffectLayer>
  );
};

const StarrySwirlEffect = ({ config }) => {
  const accent = config?.color || '#7FA7FF';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#0A1232', 0.24)} 0%, ${withAlpha('#050813', 0.14)} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-12%',
          background: `conic-gradient(from 110deg at 58% 52%, transparent 0deg, ${withAlpha('#6A7DFF', 0.18)} 44deg, transparent 82deg, ${withAlpha(accent, 0.16)} 126deg, transparent 190deg, ${withAlpha('#FFD166', 0.14)} 240deg, transparent 320deg)`,
          filter: 'blur(24px)',
          mixBlendMode: 'screen',
          animation: `weather-slow-rotate ${getAnimationDuration(56, config?.velocity, 22)} linear infinite`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '16%',
          left: '14%',
          width: '46%',
          height: '46%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#FFF5C4', 0.18)} 0%, ${withAlpha(accent, 0.22)} 22%, transparent 72%)`,
          filter: 'blur(18px)',
          animation: `weather-ambient-sway ${getAnimationDuration(20, config?.velocity)} ease-in-out infinite`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-radial-gradient(circle at 58% 52%, ${withAlpha('#B5C8FF', 0.08)} 0 2px, transparent 2px 26px)`,
          opacity: 0.16,
          mixBlendMode: 'screen',
        }}
      />

      <SparkleField
        sparkles={[
          { color: withAlpha('#FFF8D8', 0.78), style: { top: '16%', left: '24%', width: '6px', height: '6px' }, animation: `weather-lantern-pulse ${getAnimationDuration(6, config?.velocity)} ease-in-out infinite` },
          { color: withAlpha('#FFF8D8', 0.62), style: { top: '22%', left: '70%', width: '5px', height: '5px' }, animation: `weather-lantern-pulse ${getAnimationDuration(4, config?.velocity)} ease-in-out infinite`, animationDelay: '-1.8s' },
          { color: withAlpha('#CFE0FF', 0.6), style: { top: '38%', left: '12%', width: '4px', height: '4px' }, animation: `weather-flare-float ${getAnimationDuration(14, config?.velocity)} ease-in-out infinite` },
          { color: withAlpha('#FFF8D8', 0.72), style: { top: '44%', left: '82%', width: '7px', height: '7px' }, animation: `weather-lantern-pulse ${getAnimationDuration(5.5, config?.velocity)} ease-in-out infinite`, animationDelay: '-2.5s' },
          { color: withAlpha('#9FBCFF', 0.56), style: { top: '68%', left: '66%', width: '4px', height: '4px' }, animation: `weather-flare-float ${getAnimationDuration(11, config?.velocity)} ease-in-out infinite`, animationDelay: '-3.5s' },
        ]}
      />
    </EffectLayer>
  );
};

const WatercolorBloomEffect = ({ config }) => {
  const accent = config?.color || '#F39AC5';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#FFF7EE', 0.3)} 0%, ${withAlpha('#F9F2EA', 0.18)} 100%)`,
      }}
    >
      <GlowOrbs
        orbs={[
          {
            color: withAlpha(accent, 0.34),
            midColor: withAlpha('#F7B267', 0.12),
            style: { top: '-8%', left: '-10%', width: '46%', height: '48%' },
            filter: 'blur(42px)',
            blendMode: 'multiply',
            animation: `weather-watercolor-breathe ${getAnimationDuration(18, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: withAlpha('#7AD3C5', 0.28),
            midColor: withAlpha('#7AD3C5', 0.12),
            style: { top: '18%', right: '-8%', width: '38%', height: '40%' },
            filter: 'blur(48px)',
            blendMode: 'multiply',
            animation: `weather-watercolor-breathe ${getAnimationDuration(22, config?.velocity)} ease-in-out infinite reverse`,
          },
          {
            color: withAlpha('#F7D794', 0.22),
            midColor: withAlpha(accent, 0.08),
            style: { bottom: '-14%', left: '18%', width: '54%', height: '42%' },
            filter: 'blur(52px)',
            blendMode: 'multiply',
            animation: `weather-watercolor-breathe ${getAnimationDuration(26, config?.velocity)} ease-in-out infinite`,
            animationDelay: '-6s',
          },
        ]}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 12px), repeating-linear-gradient(90deg, rgba(0,0,0,0.025) 0 1px, transparent 1px 8px)',
          mixBlendMode: 'multiply',
          opacity: 0.24,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: '14% 18% 18% 12%',
          borderRadius: '48% 52% 54% 46% / 58% 42% 56% 44%',
          background: `radial-gradient(circle at 42% 36%, ${withAlpha('#FFFFFF', 0.18)} 0%, transparent 62%)`,
          filter: 'blur(24px)',
          animation: `weather-watercolor-breathe ${getAnimationDuration(20, config?.velocity)} ease-in-out infinite`,
        }}
      />
    </EffectLayer>
  );
};

const SurrealDreamEffect = ({ config }) => {
  const accent = config?.color || '#FFCB77';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#1F1432', 0.24)} 0%, ${withAlpha('#070710', 0.14)} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '14%',
          width: '28%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#FFF2C1', 0.88)} 0%, ${withAlpha(accent, 0.44)} 36%, transparent 74%)`,
          filter: 'blur(8px)',
          boxShadow: `0 0 50px ${withAlpha(accent, 0.18)}`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '12%',
          right: '20%',
          width: '24%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#19111E', 0.96)} 0%, ${withAlpha('#120B17', 0.9)} 54%, transparent 76%)`,
          filter: 'blur(2px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '14%',
          right: '14%',
          bottom: '18%',
          height: '18%',
          borderTop: `2px solid ${withAlpha('#F7B267', 0.26)}`,
          borderRadius: '50% / 100% 100% 0 0',
          transform: 'scaleX(1.08)',
          opacity: 0.7,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '20%',
          bottom: '25%',
          width: '16%',
          height: '28%',
          borderRadius: '48% 52% 45% 55% / 40% 60% 40% 60%',
          background: `linear-gradient(180deg, ${withAlpha('#A855F7', 0.24)} 0%, ${withAlpha('#2B1836', 0.08)} 100%)`,
          filter: 'blur(4px)',
          animation: `weather-ambient-sway ${getAnimationDuration(16, config?.velocity)} ease-in-out infinite`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '36%',
          left: '36%',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#FFF2C1', 0.9)} 0%, ${withAlpha('#F472B6', 0.42)} 42%, transparent 78%)`,
          filter: 'blur(2px)',
          animation: `weather-orbit-drift ${getAnimationDuration(14, config?.velocity)} ease-in-out infinite`,
        }}
      />

      <GlowOrbs
        orbs={[
          {
            color: withAlpha('#A855F7', 0.22),
            style: { bottom: '-12%', left: '-10%', width: '48%', height: '34%' },
            animation: `weather-ambient-drift ${getAnimationDuration(24, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: withAlpha(accent, 0.2),
            style: { bottom: '-14%', right: '-6%', width: '38%', height: '24%' },
            animation: `weather-ambient-drift ${getAnimationDuration(20, config?.velocity)} ease-in-out infinite reverse`,
          },
        ]}
      />
    </EffectLayer>
  );
};

const InkWashEffect = ({ config }) => {
  const accent = config?.color || '#D6DEE7';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#F2F3F1', 0.34)} 0%, ${withAlpha('#D7DAD7', 0.18)} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '-10%',
          width: '48%',
          height: '44%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#111214', 0.28)} 0%, ${withAlpha('#3A3F46', 0.12)} 44%, transparent 74%)`,
          filter: 'blur(34px)',
          mixBlendMode: 'multiply',
          animation: `weather-ink-drift ${getAnimationDuration(20, config?.velocity)} ease-in-out infinite`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          right: '-6%',
          width: '44%',
          height: '36%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#222428', 0.24)} 0%, ${withAlpha(accent, 0.08)} 42%, transparent 76%)`,
          filter: 'blur(42px)',
          mixBlendMode: 'multiply',
          animation: `weather-ink-drift ${getAnimationDuration(26, config?.velocity)} ease-in-out infinite reverse`,
        }}
      />

      {[
        { top: '18%', left: '18%', rotate: -12, width: '38%', opacity: 0.18 },
        { top: '42%', left: '30%', rotate: 8, width: '44%', opacity: 0.14 },
        { top: '64%', left: '12%', rotate: -6, width: '34%', opacity: 0.12 },
      ].map((stroke, index) => (
        <div
          key={`ink-stroke-${index}`}
          style={{
            position: 'absolute',
            top: stroke.top,
            left: stroke.left,
            width: stroke.width,
            height: '8%',
            borderRadius: '999px',
            background: `linear-gradient(90deg, transparent 0%, ${withAlpha('#17181B', stroke.opacity)} 18%, ${withAlpha('#434850', stroke.opacity * 0.6)} 72%, transparent 100%)`,
            filter: 'blur(6px)',
            transform: `rotate(${stroke.rotate}deg)`,
            mixBlendMode: 'multiply',
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 10px), repeating-linear-gradient(90deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 7px)',
          opacity: 0.26,
          mixBlendMode: 'multiply',
        }}
      />
    </EffectLayer>
  );
};

const PrismStageEffect = ({ config }) => {
  const accent = config?.color || '#8D7CFF';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#090C18', 0.24)} 0%, ${withAlpha('#04060C', 0.16)} 100%)`,
      }}
    >
      {[
        { left: '10%', width: '26%', color: accent, duration: 10 },
        { left: '34%', width: '18%', color: '#FF5ED7', duration: 12 },
        { left: '58%', width: '22%', color: '#35F0FF', duration: 11 },
      ].map((beam, index) => (
        <div
          key={`prism-beam-${index}`}
          style={{
            position: 'absolute',
            top: '-12%',
            left: beam.left,
            width: beam.width,
            height: '92%',
            background: `linear-gradient(180deg, ${withAlpha(beam.color, 0.34)} 0%, ${withAlpha(beam.color, 0.12)} 36%, transparent 86%)`,
            filter: 'blur(6px)',
            transform: 'skewX(-16deg)',
            transformOrigin: 'top center',
            mixBlendMode: 'screen',
            animation: `weather-prism-sweep ${getAnimationDuration(beam.duration, config?.velocity)} ease-in-out infinite`,
            animationDelay: `${index * -1.5}s`,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          width: '34%',
          height: '22%',
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#FFFFFF', 0.24)} 0%, ${withAlpha(accent, 0.16)} 36%, transparent 78%)`,
          filter: 'blur(16px)',
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '-8%',
          right: '-8%',
          bottom: '-6%',
          height: '26%',
          background: `linear-gradient(180deg, transparent 0%, ${withAlpha('#0D1220', 0.16)} 20%, ${withAlpha('#1C2940', 0.26)} 100%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '0',
          right: '0',
          bottom: '8%',
          height: '12%',
          background: `repeating-linear-gradient(90deg, ${withAlpha('#FFFFFF', 0.04)} 0 1px, transparent 1px 42px)`,
          opacity: 0.36,
        }}
      />

      <SparkleField
        sparkles={[
          { color: withAlpha('#FFFFFF', 0.8), style: { top: '14%', left: '28%', width: '10px', height: '10px' }, filter: 'blur(4px)', animation: `weather-lantern-pulse ${getAnimationDuration(5, config?.velocity)} ease-in-out infinite` },
          { color: withAlpha('#FF8AE2', 0.72), style: { top: '20%', left: '62%', width: '8px', height: '8px' }, filter: 'blur(3px)', animation: `weather-flare-float ${getAnimationDuration(9, config?.velocity)} ease-in-out infinite` },
          { color: withAlpha('#35F0FF', 0.72), style: { top: '28%', left: '74%', width: '7px', height: '7px' }, filter: 'blur(3px)', animation: `weather-flare-float ${getAnimationDuration(11, config?.velocity)} ease-in-out infinite`, animationDelay: '-2s' },
        ]}
      />
    </EffectLayer>
  );
};

const StainedGlassEffect = ({ config }) => {
  const accent = config?.color || '#F6B73C';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#120F1A', 0.28)} 0%, ${withAlpha('#040407', 0.16)} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-8%',
          left: '14%',
          width: '34%',
          height: '32%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#FFF4D1', 0.28)} 0%, ${withAlpha(accent, 0.14)} 42%, transparent 76%)`,
          filter: 'blur(20px)',
          mixBlendMode: 'screen',
          animation: `weather-ambient-sway ${getAnimationDuration(22, config?.velocity)} ease-in-out infinite`,
        }}
      />

      {[
        {
          clipPath: 'polygon(6% 0%, 46% 0%, 58% 44%, 14% 52%)',
          background: `linear-gradient(160deg, ${withAlpha('#58C4DD', 0.7)} 0%, ${withAlpha('#2D9CDB', 0.42)} 100%)`,
        },
        {
          clipPath: 'polygon(48% 0%, 88% 0%, 82% 38%, 60% 44%)',
          background: `linear-gradient(150deg, ${withAlpha('#FF7F50', 0.72)} 0%, ${withAlpha('#F6B73C', 0.48)} 100%)`,
        },
        {
          clipPath: 'polygon(10% 54%, 58% 46%, 54% 100%, 0% 100%)',
          background: `linear-gradient(170deg, ${withAlpha('#7ED957', 0.66)} 0%, ${withAlpha('#2EB67D', 0.42)} 100%)`,
        },
        {
          clipPath: 'polygon(60% 46%, 82% 40%, 100% 68%, 90% 100%, 56% 100%)',
          background: `linear-gradient(160deg, ${withAlpha('#9D7CFF', 0.68)} 0%, ${withAlpha('#5B4BDB', 0.4)} 100%)`,
        },
      ].map((pane, index) => (
        <div
          key={`stained-pane-${index}`}
          style={{
            position: 'absolute',
            inset: '8%',
            clipPath: pane.clipPath,
            background: pane.background,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 24px ${withAlpha(accent, 0.12)}, inset 0 0 20px rgba(255,255,255,0.08)`,
            mixBlendMode: 'screen',
          }}
        />
      ))}

      {[
        { left: '24%', top: '8%', width: '10px', height: '84%', rotate: 0 },
        { left: '50%', top: '8%', width: '10px', height: '84%', rotate: 6 },
        { left: '76%', top: '8%', width: '10px', height: '84%', rotate: -4 },
        { left: '8%', top: '34%', width: '84%', height: '10px', rotate: 0 },
        { left: '8%', top: '58%', width: '84%', height: '10px', rotate: 0 },
      ].map((lead, index) => (
        <div
          key={`stained-lead-${index}`}
          style={{
            position: 'absolute',
            left: lead.left,
            top: lead.top,
            width: lead.width,
            height: lead.height,
            background: `linear-gradient(180deg, ${withAlpha('#191919', 0.84)} 0%, ${withAlpha('#4E4E4E', 0.48)} 100%)`,
            filter: 'blur(1px)',
            transform: `rotate(${lead.rotate}deg)`,
            transformOrigin: 'center',
            boxShadow: `0 0 12px ${withAlpha('#000000', 0.18)}`,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${withAlpha('#FFF6D5', 0.12)} 0%, transparent 38%, ${withAlpha(accent, 0.08)} 68%, transparent 100%)`,
          mixBlendMode: 'screen',
        }}
      />
    </EffectLayer>
  );
};

const MonochromeFilmEffect = ({ config }) => {
  const accent = config?.color || '#F3F0E8';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#111214', 0.42)} 0%, ${withAlpha('#050505', 0.2)} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 140px rgba(0,0,0,0.38), inset 0 0 220px rgba(0,0,0,0.18)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: '-8%',
          background: `radial-gradient(circle at 52% 38%, ${withAlpha(accent, 0.18)} 0%, transparent 48%), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px)`,
          mixBlendMode: 'screen',
          animation: `weather-film-flicker ${getAnimationDuration(3.4, config?.velocity, 1.8)} steps(2, end) infinite`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: '-12%',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 0 0.7px, transparent 0.8px)',
          backgroundSize: '4px 4px',
          opacity: 0.18,
          mixBlendMode: 'screen',
          animation: `weather-noise-shift ${getAnimationDuration(1.6, config?.velocity, 0.8)} steps(3, end) infinite`,
        }}
      />

      {[
        { top: '14%', left: '18%', height: '44%', opacity: 0.1 },
        { top: '24%', left: '62%', height: '36%', opacity: 0.08 },
        { top: '48%', left: '40%', height: '28%', opacity: 0.06 },
      ].map((scratch, index) => (
        <div
          key={`film-scratch-${index}`}
          style={{
            position: 'absolute',
            top: scratch.top,
            left: scratch.left,
            width: '1px',
            height: scratch.height,
            background: `linear-gradient(180deg, transparent 0%, ${withAlpha('#FFFFFF', scratch.opacity)} 18%, transparent 100%)`,
            filter: 'blur(0.2px)',
          }}
        />
      ))}

      <SparkleField
        sparkles={[
          { color: withAlpha('#FFFFFF', 0.44), style: { top: '18%', left: '26%', width: '3px', height: '3px' }, animation: `weather-film-flicker ${getAnimationDuration(4.8, config?.velocity, 2)} steps(2, end) infinite` },
          { color: withAlpha('#FFFFFF', 0.34), style: { top: '64%', left: '72%', width: '2px', height: '2px' }, animation: `weather-film-flicker ${getAnimationDuration(3.8, config?.velocity, 2)} steps(2, end) infinite`, animationDelay: '-1.6s' },
        ]}
      />
    </EffectLayer>
  );
};

const BrutalistLightEffect = ({ config }) => {
  const accent = config?.color || '#E9DED0';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `linear-gradient(180deg, ${withAlpha('#141517', 0.34)} 0%, ${withAlpha('#070809', 0.18)} 100%)`,
      }}
    >
      {[
        { top: '10%', left: '8%', width: '24%', height: '30%' },
        { top: '18%', left: '38%', width: '22%', height: '42%' },
        { top: '6%', left: '66%', width: '20%', height: '54%' },
        { top: '60%', left: '12%', width: '30%', height: '20%' },
      ].map((block, index) => (
        <div
          key={`brutalist-block-${index}`}
          style={{
            position: 'absolute',
            top: block.top,
            left: block.left,
            width: block.width,
            height: block.height,
            background: `linear-gradient(145deg, ${withAlpha('#5C5B57', 0.22)} 0%, ${withAlpha('#2E2D2A', 0.3)} 100%)`,
            boxShadow: `inset 0 0 0 1px ${withAlpha('#8D8A83', 0.08)}`,
            filter: 'blur(0.4px)',
          }}
        />
      ))}

      {[
        { left: '12%', width: '18%', color: accent, duration: 14 },
        { left: '44%', width: '14%', color: '#FFFFFF', duration: 12 },
        { left: '70%', width: '16%', color: '#D9C7B1', duration: 16 },
      ].map((beam, index) => (
        <div
          key={`brutalist-beam-${index}`}
          style={{
            position: 'absolute',
            top: '-12%',
            left: beam.left,
            width: beam.width,
            height: '88%',
            background: `linear-gradient(180deg, ${withAlpha(beam.color, 0.3)} 0%, ${withAlpha(beam.color, 0.12)} 42%, transparent 88%)`,
            transform: 'skewX(-16deg)',
            filter: 'blur(4px)',
            mixBlendMode: 'screen',
            animation: `weather-brutalist-sweep ${getAnimationDuration(beam.duration, config?.velocity)} ease-in-out infinite`,
            animationDelay: `${index * -2.2}s`,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 36px), repeating-linear-gradient(180deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 32px)',
          opacity: 0.16,
        }}
      />

      <GlowOrbs
        orbs={[
          {
            color: withAlpha('#FFFFFF', 0.14),
            style: { top: '4%', left: '24%', width: '28%', height: '18%' },
            filter: 'blur(20px)',
            animation: `weather-ambient-sway ${getAnimationDuration(18, config?.velocity)} ease-in-out infinite`,
          },
        ]}
      />
    </EffectLayer>
  );
};

const NeonGridEffect = ({ config }) => {
  const accent = config?.color || '#35F0FF';

  return (
    <EffectLayer
      config={config}
      style={{
        background: `radial-gradient(circle at 50% 26%, ${withAlpha('#FF4FD8', 0.18)} 0%, ${withAlpha('#050510', 0.14)} 42%, transparent 80%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '0 0 48% 0',
          background: `linear-gradient(180deg, ${withAlpha('#0F1225', 0.42)} 0%, transparent 100%)`,
          opacity: 0.72,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '50%',
          width: '28%',
          height: '22%',
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#FF7AE8', 0.26)} 0%, ${withAlpha('#FF4FD8', 0.12)} 42%, transparent 76%)`,
          filter: 'blur(16px)',
          mixBlendMode: 'screen',
        }}
      />

      {[
        { left: '12%', color: '#FF4FD8', width: '18%', duration: 12 },
        { left: '68%', color: accent, width: '16%', duration: 10 },
      ].map((beam, index) => (
        <div
          key={`grid-beam-${index}`}
          style={{
            position: 'absolute',
            top: '-10%',
            left: beam.left,
            width: beam.width,
            height: '48%',
            background: `linear-gradient(180deg, ${withAlpha(beam.color, 0.22)} 0%, transparent 88%)`,
            filter: 'blur(6px)',
            transform: 'skewX(-18deg)',
            mixBlendMode: 'screen',
            animation: `weather-prism-sweep ${getAnimationDuration(beam.duration, config?.velocity)} ease-in-out infinite`,
            animationDelay: `${index * -2}s`,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          left: '-10%',
          right: '-10%',
          bottom: '-8%',
          height: '54%',
          transformOrigin: 'center bottom',
          transform: 'perspective(900px) rotateX(78deg) scale(1.8)',
          backgroundImage: `linear-gradient(to right, ${withAlpha(accent, 0.55)} 1px, transparent 1px), linear-gradient(to bottom, ${withAlpha(accent, 0.35)} 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          boxShadow: `0 0 40px ${withAlpha(accent, 0.16)}`,
          animation: `weather-grid-pulse ${getAnimationDuration(6, config?.velocity)} ease-in-out infinite`,
        }}
      />

      <GlowOrbs
        orbs={[
          {
            color: withAlpha('#35F0FF', 0.18),
            style: { bottom: '-18%', left: '-8%', width: '34%', height: '26%' },
            animation: `weather-ambient-drift ${getAnimationDuration(22, config?.velocity)} ease-in-out infinite`,
          },
          {
            color: withAlpha('#FF4FD8', 0.16),
            style: { bottom: '-16%', right: '-4%', width: '30%', height: '24%' },
            animation: `weather-ambient-drift ${getAnimationDuration(18, config?.velocity)} ease-in-out infinite reverse`,
          },
        ]}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 18px)',
          opacity: 0.16,
          animation: `weather-scanlines ${getAnimationDuration(1.2, config?.velocity, 0.6)} linear infinite`,
        }}
      />
    </EffectLayer>
  );
};

const DOM_EFFECT_REGISTRY = {
  cloudy: CloudyEffect,
  sunny: SunnyEffect,
  'shoji-dusk': ShojiDuskEffect,
  'nordic-frost': NordicFrostEffect,
  'underwater-caustics': UnderwaterCausticsEffect,
  'mediterranean-courtyard': MediterraneanCourtyardEffect,
  'lantern-bazaar': LanternBazaarEffect,
  'desert-mirage': DesertMirageEffect,
  'tropical-night-market': TropicalNightMarketEffect,
  'starry-swirl': StarrySwirlEffect,
  'watercolor-bloom': WatercolorBloomEffect,
  'surreal-dream': SurrealDreamEffect,
  'ink-wash': InkWashEffect,
  'prism-stage': PrismStageEffect,
  'stained-glass': StainedGlassEffect,
  'monochrome-film': MonochromeFilmEffect,
  'brutalist-light': BrutalistLightEffect,
  'neon-grid': NeonGridEffect,
};

export const renderDomWeatherEffect = (type, config) => {
  const EffectComponent = DOM_EFFECT_REGISTRY[type];
  return EffectComponent ? <EffectComponent config={config} /> : null;
};