import React, { useEffect, useRef } from 'react';

const WeatherEffect = ({ type, config }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (type === 'rain' || type === 'winter') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let particles = [];
      const particleCount = type === 'rain' ? 150 : 80;

      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.speed = type === 'rain' ? Math.random() * 8 + 3 : Math.random() * 3 + 1;
          this.size = type === 'rain' ? Math.random() * 2 + 1 : Math.random() * 3 + 2;
          this.opacity = Math.random() * 0.6 + 0.3;
        }

        update() {
          this.y += this.speed;
          if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
          }
          if (type === 'winter') {
            this.x += Math.sin(this.y * 0.01) * 1;
          }
        }

        draw() {
          ctx.globalAlpha = this.opacity * (config?.opacity ?? 1);
          ctx.fillStyle = config?.color || (type === 'rain' ? '#4682B4' : '#FFFFFF');
          ctx.fillRect(this.x, this.y, this.size, this.size * (type === 'rain' ? 12 : 1));
        }
      }

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
          particle.update();
          particle.draw();
        });
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [type, config]);

  if (type === 'none') return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      {(type === 'rain' || type === 'winter') && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.6
          }}
        />
      )}
      {type === 'cloudy' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
          '--cloud-color': config?.color || '#fff'
        }}>
          {/* SVG Filter for organic cloud texture */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <filter id="cloud-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="0" />
              <feDisplacementMap in="SourceGraphic" scale="40" />
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </svg>

          {/* Atmospheric overlay - Reduced opacity for better background visibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, ${config?.color || 'rgba(200,210,220,0.1)'} 0%, rgba(220,230,240,0.02) 100%)`,
            opacity: config?.opacity ?? 1
          }} />
          
          {/* Cloud 1 - Standard Puffy */}
          <div className="cloud" style={{ 
            top: '10%', 
            left: '-10%', 
            '--scale': 0.5,
            opacity: 0.8 * (config?.opacity ?? 1),
            animation: 'cloudFloat 50s linear infinite'
          }}></div>
          
          {/* Cloud 2 - Long & Flat */}
          <div className="cloud" style={{ 
            top: '25%', 
            left: '-20%', 
            '--scale': 0.4,
            opacity: 0.7 * (config?.opacity ?? 1),
            width: '400px',
            height: '80px',
            boxShadow: `120px -10px 0 10px ${config?.color || '#fff'}, 200px 5px 0 15px ${config?.color || '#fff'}, 60px 15px 0 10px ${config?.color || '#fff'}`,
            animation: 'cloudFloat 65s linear infinite reverse', 
            animationDelay: '-20s'
          }}></div>
          
          {/* Cloud 3 - Tall & Big */}
          <div className="cloud" style={{ 
            top: '15%', 
            left: '-15%', 
            '--scale': 0.6,
            opacity: 0.75 * (config?.opacity ?? 1),
            width: '250px',
            height: '120px',
            boxShadow: `60px -40px 0 30px ${config?.color || '#fff'}, 120px -10px 0 20px ${config?.color || '#fff'}, 30px 30px 0 15px ${config?.color || '#fff'}`,
            animation: 'cloudFloat 55s linear infinite', 
            animationDelay: '-10s'
          }}></div>
          
          {/* Cloud 4 - Small Fragment */}
          <div className="cloud" style={{ 
            top: '40%', 
            left: '-25%', 
            '--scale': 0.3,
            opacity: 0.6 * (config?.opacity ?? 1),
            width: '200px',
            height: '70px',
            boxShadow: `50px -10px 0 10px ${config?.color || '#fff'}, 100px 0px 0 8px ${config?.color || '#fff'}`,
            animation: 'cloudFloat 80s linear infinite', 
            animationDelay: '-5s'
          }}></div>
        </div>
      )}
      {type === 'sunny' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
          // Subtle warm tint for the whole screen - Even more yellow/golden
          background: `linear-gradient(135deg, ${config?.color || 'rgba(255,200,100,0.15)'} 0%, rgba(255,255,255,0) 100%)`,
          opacity: config?.opacity ?? 1
        }}>
          {/* Sun Body - Richer golden glow */}
          <div style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,250,220,0.95) 0%, rgba(255,200,50,0.5) 30%, rgba(255,140,0,0.15) 60%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'sunPulse 4s ease-in-out infinite'
          }} />
          
          {/* Rotating Rays Container - Warmer rays */}
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '50px',
            width: '0',
            height: '0',
            animation: 'sunRotate 60s linear infinite'
          }}>
             {[...Array(12)].map((_, i) => (
               <div key={i} style={{
                 position: 'absolute',
                 top: '50%',
                 left: '50%',
                 height: '1000px',
                 width: '80px',
                 background: 'linear-gradient(to bottom, rgba(255,210,100,0.2) 0%, transparent 70%)',
                 transformOrigin: 'top center',
                 transform: `translate(-50%, 0) rotate(${i * 30}deg)`,
                 clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
               }} />
             ))}
          </div>

          {/* Lens Flare / Glare - Adjusted position and look */}
          <div style={{
            position: 'absolute',
            top: '25%',
            right: '25%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(30px)',
            animation: 'flareFloat 10s ease-in-out infinite'
          }} />
          
          {/* Secondary smaller flare */}
           <div style={{
            position: 'absolute',
            top: '40%',
            right: '40%',
            width: '50px',
            height: '50px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(5px)',
            animation: 'flareFloat 10s ease-in-out infinite',
            animationDelay: '2s'
          }} />
        </div>
      )}
      <style>{`
        .cloud {
          width: 300px; 
          height: 100px;
          background: var(--cloud-color, #fff);
          border-radius: 100px;
          position: absolute;
          filter: url(#cloud-filter);
          box-shadow: 
            80px -20px 0 20px var(--cloud-color, #fff), 
            150px 10px 0 10px var(--cloud-color, #fff),
            40px 20px 0 15px var(--cloud-color, #fff);
        }
        @keyframes cloudFloat {
          0% { transform: translateX(-400px) scale(var(--scale, 1)); }
          100% { transform: translateX(100vw) scale(var(--scale, 1)); }
        }
        @keyframes sunRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sunPulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes flareFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(-20px, 20px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default WeatherEffect;