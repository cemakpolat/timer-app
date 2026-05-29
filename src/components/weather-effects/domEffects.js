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

const CloudyEffect = ({ config }) => (
  <div
    style={{
      ...baseLayerStyle,
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

    <div
      className="weather-cloud"
      style={{
        top: '10%',
        left: '-10%',
        '--scale': 0.5,
        opacity: 0.8 * (config?.opacity ?? 1),
        animation: 'weather-cloud-float 50s linear infinite',
      }}
    />
    <div
      className="weather-cloud"
      style={{
        top: '25%',
        left: '-20%',
        '--scale': 0.4,
        opacity: 0.7 * (config?.opacity ?? 1),
        width: '400px',
        height: '80px',
        boxShadow: `120px -10px 0 10px ${config?.color || '#fff'}, 200px 5px 0 15px ${config?.color || '#fff'}, 60px 15px 0 10px ${config?.color || '#fff'}`,
        animation: 'weather-cloud-float 65s linear infinite reverse',
        animationDelay: '-20s',
      }}
    />
    <div
      className="weather-cloud"
      style={{
        top: '15%',
        left: '-15%',
        '--scale': 0.6,
        opacity: 0.75 * (config?.opacity ?? 1),
        width: '250px',
        height: '120px',
        boxShadow: `60px -40px 0 30px ${config?.color || '#fff'}, 120px -10px 0 20px ${config?.color || '#fff'}, 30px 30px 0 15px ${config?.color || '#fff'}`,
        animation: 'weather-cloud-float 55s linear infinite',
        animationDelay: '-10s',
      }}
    />
    <div
      className="weather-cloud"
      style={{
        top: '40%',
        left: '-25%',
        '--scale': 0.3,
        opacity: 0.6 * (config?.opacity ?? 1),
        width: '200px',
        height: '70px',
        boxShadow: `50px -10px 0 10px ${config?.color || '#fff'}, 100px 0px 0 8px ${config?.color || '#fff'}`,
        animation: 'weather-cloud-float 80s linear infinite',
        animationDelay: '-5s',
      }}
    />

    <style>{`
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
    `}</style>
  </div>
);

const SunnyEffect = ({ config }) => (
  <div
    style={{
      ...baseLayerStyle,
      background: `linear-gradient(135deg, ${config?.color || 'rgba(255,200,100,0.15)'} 0%, rgba(255,255,255,0) 100%)`,
      opacity: config?.opacity ?? 1,
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
        animation: 'weather-sun-pulse 4s ease-in-out infinite',
      }}
    />

    <div
      style={{
        position: 'absolute',
        top: '50px',
        right: '50px',
        width: 0,
        height: 0,
        animation: 'weather-sun-rotate 60s linear infinite',
      }}
    >
      {[...Array(12)].map((_, index) => (
        <div
          key={index}
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

    <div
      style={{
        position: 'absolute',
        top: '25%',
        right: '25%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        animation: 'weather-flare-float 10s ease-in-out infinite',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: '40%',
        right: '40%',
        width: '50px',
        height: '50px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(5px)',
        animation: 'weather-flare-float 10s ease-in-out infinite',
        animationDelay: '2s',
      }}
    />

    <style>{`
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
        0%, 100% { transform: translate(0, 0); opacity: 0.3; }
        50% { transform: translate(-20px, 20px); opacity: 0.5; }
      }
    `}</style>
  </div>
);

export const renderDomWeatherEffect = (type, config) => {
  if (type === 'cloudy') {
    return <CloudyEffect config={config} />;
  }

  if (type === 'sunny') {
    return <SunnyEffect config={config} />;
  }

  return null;
};