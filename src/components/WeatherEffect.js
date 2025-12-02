import React, { useEffect, useRef } from 'react';

const WeatherEffect = ({ type, config, width, height }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (type === 'rain' || type === 'winter' || type === 'autumn' || type === 'spring' || type === 'sakura' || type === 'fireflies' || type === 'butterflies' || type === 'lanterns' || type === 'aurora' || type === 'desert' || type === 'tropical') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = width || window.innerWidth;
      canvas.height = height || window.innerHeight;

      let particles = [];

      const particleCount = type === 'rain' ? 150 : type === 'winter' ? 80 : type === 'autumn' ? 40 : type === 'spring' ? 50 : type === 'sakura' ? 60 : type === 'fireflies' ? 30 : type === 'butterflies' ? 20 : type === 'lanterns' ? 25 : type === 'aurora' ? 50 : type === 'desert' ? 120 : type === 'tropical' ? 40 : 50;

      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height - canvas.height;
          // Normalize speeds to be more consistent - reduced variance for all types
          this.speed = type === 'rain' ? Math.random() * 2 + 3 : type === 'autumn' ? Math.random() * 0.4 + 0.8 : type === 'spring' ? Math.random() * 0.3 + 0.6 : Math.random() * 0.5 + 1;
          this.size = type === 'rain' ? Math.random() * 1.5 + 0.8 : type === 'autumn' ? Math.random() * 10 + 8 : type === 'spring' ? Math.random() * 7 + 5 : Math.random() * 3 + 2;
          this.opacity = type === 'rain' ? Math.random() * 0.4 + 0.3 : Math.random() * 0.7 + 0.3;
          this.rotation = Math.random() * 360;
          this.rotationSpeed = type === 'autumn' ? (Math.random() - 0.5) * 5 : type === 'spring' ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 3;
          
          // Enhanced wind parameters for autumn and spring
          this.windDirection = Math.random() > 0.5 ? 1 : -1;
          this.swayAmplitude = type === 'autumn' ? Math.random() * 0.7 + 0.8 : type === 'spring' ? Math.random() * 2.5 + 1.5 : Math.random() * 2 + 1;
          this.swaySpeed = type === 'autumn' ? Math.random() * 0.015 + 0.008 : type === 'spring' ? Math.random() * 0.012 + 0.006 : Math.random() * 0.02 + 0.01;
          this.swayOffset = Math.random() * Math.PI * 2;
          this.horizontalDrift = type === 'autumn' ? (Math.random() - 0.5) * 0.4 : type === 'spring' ? (Math.random() - 0.3) * 0.5 : 0;
          
          // Rain droplet length
          this.length = type === 'rain' ? Math.random() * 15 + 10 : 0;
          
          // Colors for autumn leaves
          if (type === 'autumn') {
            const colors = ['#D2691E', '#FF8C00', '#CD853F', '#B22222', '#FFD700', '#8B4513', '#A0522D', '#DC143C'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
          }
          
          // Colors for spring flowers
          if (type === 'spring') {
            const colors = ['#FFB6C1', '#FF69B4', '#FFC0CB', '#FFE4E1', '#DB7093', '#FFDAB9', '#F0E68C', '#E6E6FA', '#DDA0DD'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
          }
          
          // Sakura petals
          if (type === 'sakura') {
            const colors = ['#FFB7C5', '#FFC0CB', '#FFE4E1', '#FADADD'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speed = Math.random() * 1 + 0.3;
            this.swayAmplitude = Math.random() * 3 + 2;
            this.swaySpeed = Math.random() * 0.01 + 0.005;
          }
          
          // Fireflies
          if (type === 'fireflies') {
            this.color = '#FFD700';
            this.speed = Math.random() * 0.5 + 0.2;
            this.brightness = Math.random();
            this.pulseSpeed = Math.random() * 0.05 + 0.02;
            this.size = Math.random() * 3 + 2;
            this.floatAmplitude = Math.random() * 2 + 1;
          }
          
          // Butterflies
          if (type === 'butterflies') {
            // More realistic butterfly wing colors
            const colors = ['#FF6B9D', '#FF1493', '#FFB6C1', '#FFA07A', '#FFD700', '#87CEEB', '#9370DB', '#FF6347', '#32CD32', '#FF4500'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speed = Math.random() * 0.8 + 0.3; // Slower, more graceful movement
            this.size = Math.random() * 6 + 8; // Slightly smaller for realism
            this.wingBeat = Math.random() * Math.PI * 2; // Random starting phase
            this.wingBeatSpeed = Math.random() * 0.15 + 0.08; // Varied wing beat speeds
            this.floatAmplitude = Math.random() * 2 + 1; // Gentler floating
          }
          
          // Asian Lanterns
          if (type === 'lanterns') {
            const colors = ['#FF0000', '#FFD700', '#FF4500', '#FFA500', '#DC143C'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speed = Math.random() * 0.8 + 0.3;
            this.size = Math.random() * 15 + 20;
            this.swayAmplitude = Math.random() * 1.5 + 0.5;
            this.swaySpeed = Math.random() * 0.01 + 0.005;
            this.swayOffset = Math.random() * Math.PI * 2;
            this.glowIntensity = Math.random() * 0.4 + 0.6;
          }
          
          // Northern Lights / Aurora Borealis
          if (type === 'aurora') {
            const colors = ['#00FF00', '#00FFFF', '#0080FF', '#8000FF', '#FF00FF', '#00FF80'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.y = Math.random() * canvas.height * 0.4;
            this.x = Math.random() * canvas.width;
            this.speed = Math.random() * 0.3 + 0.1;
            this.size = Math.random() * 100 + 50;
            this.waveSpeed = Math.random() * 0.02 + 0.01;
            this.waveAmplitude = Math.random() * 50 + 30;
            this.opacity = Math.random() * 0.3 + 0.2;
            this.pulseSpeed = Math.random() * 0.03 + 0.01;
          }
          
          // Desert Sand
          if (type === 'desert') {
            const colors = ['#EDC9AF', '#F4A460', '#DEB887', '#D2B48C', '#BC987E'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speed = Math.random() * 2 + 1;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.4 + 0.2;
            this.horizontalDrift = Math.random() * 3 + 1;
            this.windDirection = Math.random() > 0.5 ? 1 : -1;
          }
          
          // Tropical Flowers (Caribbean/Pacific)
          if (type === 'tropical') {
            const colors = ['#FF1493', '#FF69B4', '#FF6347', '#FFA500', '#FFFF00', '#00CED1', '#9370DB'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speed = Math.random() * 1.5 + 0.5;
            this.size = Math.random() * 10 + 12;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 3;
            this.swayAmplitude = Math.random() * 3 + 2;
            this.swaySpeed = Math.random() * 0.015 + 0.01;
            this.swayOffset = Math.random() * Math.PI * 2;
          }

        }

        update() {
          this.y += this.speed;
          // Defensive clamp: ensure vertical speed for autumn doesn't exceed expected bounds
          if (type === 'autumn') {
            const maxVy = 2.0; // pixels per frame
            if (this.speed > maxVy) this.speed = maxVy;
            if (this.speed < 0.2) this.speed = 0.2; // prevent near-zero stalls
            }
          
          
          if (type === 'fireflies' || type === 'butterflies') {
            // Wrap around for floating effects
            if (this.y > canvas.height + 50) this.y = -50;
            if (this.y < -50) this.y = canvas.height + 50;
            if (this.x > canvas.width + 50) this.x = -50;
            if (this.x < -50) this.x = canvas.width + 50;
          } else if (this.y > canvas.height + 50) {
            // When particles exit the bottom, respawn them slightly above the top
            // For leaf-like particles, respawn a bit further off-screen so they don't pop into view
            if (type === 'autumn' || type === 'spring' || type === 'sakura') {
              this.y = -Math.random() * (canvas.height * 0.18) - 20; // respawn up to ~18% of height above
              this.x = Math.random() * canvas.width;
              this.windDirection = Math.random() > 0.5 ? 1 : -1;
            } else {
              this.y = -50;
              this.x = Math.random() * canvas.width;
            }
          }
          
          // Enhanced movement for different types
          if (type === 'rain') {
            // Rain falls straight down
            // No horizontal movement for realistic straight rain
          } else if (type === 'winter') {
            // Snow drifts gently
            this.x += Math.sin(this.y * 0.01) * 1;
            this.rotation += this.rotationSpeed * 0.3;
          } else if (type === 'autumn') {
            // Leaves tumble with varied wind
            // Compute horizontal delta and clamp it to avoid extreme outliers
            this.rotation += this.rotationSpeed * 0.8;
            const sway = Math.sin(this.y * this.swaySpeed + this.swayOffset) * this.swayAmplitude * this.windDirection;
            // Occasional gentle gusts (rare and small)
            let gust = 0;
            if (Math.random() > 0.995) {
              gust = (Math.random() - 0.5) * 1; // very rare small gust
            } else if (Math.random() > 0.98) {
              gust = (Math.random() - 0.5) * 0.6; // occasional smaller gust
            }
            let dx = sway + this.horizontalDrift + gust;
            const maxDx = 1.5; // limit horizontal movement per frame
            dx = Math.max(-maxDx, Math.min(maxDx, dx));
            this.x += dx;
          } else if (type === 'spring') {
            // Flowers float gracefully with gentle spiral
            this.rotation += this.rotationSpeed;
            this.x += Math.sin(this.y * this.swaySpeed + this.swayOffset) * this.swayAmplitude * this.windDirection;
            this.x += Math.cos(this.y * 0.015) * 0.8;
            this.x += this.horizontalDrift;
          } else if (type === 'sakura') {
            // Cherry blossoms spiral down
            this.rotation += this.rotationSpeed;
            this.x += Math.sin(this.y * this.swaySpeed + this.swayOffset) * this.swayAmplitude;
            this.x += Math.cos(this.y * 0.02) * 1.5;
          } else if (type === 'fireflies') {
            // Fireflies float randomly
            this.brightness = (Math.sin(this.y * this.pulseSpeed) + 1) / 2;
            this.x += Math.sin(this.y * 0.03) * this.floatAmplitude;
            this.y += Math.sin(this.x * 0.02) * 0.5;
          } else if (type === 'butterflies') {
            // Butterflies flutter with more natural movement
            this.wingBeat += this.wingBeatSpeed;
            // Gentle forward movement with occasional direction changes
            this.x += Math.sin(this.wingBeat * 0.3) * 0.8 + Math.sin(this.y * 0.01) * 0.3;
            // Subtle up/down floating motion
            this.y += Math.cos(this.wingBeat * 0.2) * 0.4 + Math.sin(this.x * 0.008) * 0.2;
            // Gentle body rotation for realism
            this.rotation = Math.sin(this.wingBeat * 0.8) * 8;
          } else if (type === 'lanterns') {
            // Lanterns float upward gently
            this.x += Math.sin(this.y * this.swaySpeed + this.swayOffset) * this.swayAmplitude;
            if (this.y < -50) {
              this.y = canvas.height + 50;
              this.x = Math.random() * canvas.width;
            }
          } else if (type === 'aurora') {
            // Aurora waves
            this.x += this.speed;
            if (this.x > canvas.width + this.size) {
              this.x = -this.size;
            }
            this.opacity = (Math.sin(this.y * this.pulseSpeed) * 0.2 + 0.4);
          } else if (type === 'desert') {
            // Sand blows horizontally
            this.x += this.horizontalDrift * this.windDirection;
            if (this.x > canvas.width + 50) {
              this.x = -50;
              this.y = Math.random() * canvas.height;
            }
            if (this.x < -50) {
              this.x = canvas.width + 50;
              this.y = Math.random() * canvas.height;
            }
          } else if (type === 'tropical') {
            // Tropical flowers drift down
            this.rotation += this.rotationSpeed;
            this.x += Math.sin(this.y * this.swaySpeed + this.swayOffset) * this.swayAmplitude;
          }
        }

        draw() {
          ctx.save();
          ctx.translate(this.x, this.y);
          
          // Don't rotate rain - keep it vertical
          if (type !== 'rain') {
            ctx.rotate((this.rotation * Math.PI) / 180);
          }
          
          ctx.globalAlpha = this.opacity * (config?.opacity ?? 1);
          
          if (type === 'rain') {
            // Draw rain as vertical streaks/droplets
            ctx.strokeStyle = config?.color || '#4682B4';
            ctx.lineWidth = this.size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, this.length);
            ctx.stroke();
          } else if (type === 'winter') {
            ctx.fillStyle = config?.color || '#FFFFFF';
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
          } else if (type === 'autumn') {
            // Draw leaf shape
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.quadraticCurveTo(this.size / 2, -this.size / 4, this.size / 2, this.size / 4);
            ctx.quadraticCurveTo(this.size / 4, this.size / 2, 0, this.size / 2);
            ctx.quadraticCurveTo(-this.size / 4, this.size / 2, -this.size / 2, this.size / 4);
            ctx.quadraticCurveTo(-this.size / 2, -this.size / 4, 0, -this.size / 2);
            ctx.fill();
            
            // Add leaf vein
            ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(0, this.size / 2);
            ctx.stroke();
          } else if (type === 'spring') {
            // Draw flower with petals
            ctx.fillStyle = this.color;
            const petals = 5;
            for (let i = 0; i < petals; i++) {
              ctx.save();
              ctx.rotate((i * 2 * Math.PI) / petals);
              ctx.beginPath();
              ctx.ellipse(0, -this.size / 3, this.size / 3, this.size / 2, 0, 0, 2 * Math.PI);
              ctx.fill();
              ctx.restore();
            }
            
            // Draw flower center
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 4, 0, 2 * Math.PI);
            ctx.fill();
          } else if (type === 'sakura') {
            // Draw cherry blossom with 5 delicate petals
            ctx.fillStyle = this.color;
            const petals = 5;
            for (let i = 0; i < petals; i++) {
              ctx.save();
              ctx.rotate((i * 2 * Math.PI) / petals);
              ctx.beginPath();
              ctx.ellipse(0, -this.size / 3.5, this.size / 3.5, this.size / 2.2, 0, 0, 2 * Math.PI);
              ctx.fill();
              ctx.restore();
            }
            
            // Draw small pink center
            ctx.fillStyle = '#FFB7C5';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 5, 0, 2 * Math.PI);
            ctx.fill();
          } else if (type === 'fireflies') {
            // Draw glowing firefly with radial gradient
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
            gradient.addColorStop(0, `rgba(255, 215, 0, ${this.brightness * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 215, 0, ${this.brightness * 0.3})`);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw core
            ctx.fillStyle = config?.color || '#FFD700';
            ctx.globalAlpha = this.brightness * (config?.opacity ?? 0.8);
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
            ctx.fill();
          } else if (type === 'butterflies') {
            // Draw realistic butterfly wings
            const wingAngle = Math.sin(this.wingBeat) * 25;
            ctx.fillStyle = this.color;

            // Left upper wing (forewing) - more tapered and elegant
            ctx.save();
            ctx.rotate((-wingAngle * Math.PI) / 180);
            ctx.beginPath();
            ctx.moveTo(-this.size / 5, -this.size / 10);
            // Top curve
            ctx.bezierCurveTo(-this.size / 2.5, -this.size / 2.2, -this.size / 3.5, -this.size / 1.8, -this.size / 6, -this.size / 1.2);
            // Right side - leading edge
            ctx.bezierCurveTo(0, -this.size / 1.5, this.size / 8, -this.size / 2, this.size / 6, -this.size / 3);
            // Bottom curve
            ctx.bezierCurveTo(this.size / 8, -this.size / 8, this.size / 10, this.size / 6, -this.size / 12, this.size / 5);
            // Trailing edge back to start
            ctx.bezierCurveTo(-this.size / 6, this.size / 8, -this.size / 4, 0, -this.size / 5, -this.size / 10);
            ctx.fill();
            ctx.restore();

            // Right upper wing (forewing) - mirror of left
            ctx.save();
            ctx.rotate((wingAngle * Math.PI) / 180);
            ctx.beginPath();
            ctx.moveTo(this.size / 5, -this.size / 10);
            // Top curve
            ctx.bezierCurveTo(this.size / 2.5, -this.size / 2.2, this.size / 3.5, -this.size / 1.8, this.size / 6, -this.size / 1.2);
            // Left side - leading edge
            ctx.bezierCurveTo(0, -this.size / 1.5, -this.size / 8, -this.size / 2, -this.size / 6, -this.size / 3);
            // Bottom curve
            ctx.bezierCurveTo(-this.size / 8, -this.size / 8, -this.size / 10, this.size / 6, this.size / 12, this.size / 5);
            // Trailing edge back to start
            ctx.bezierCurveTo(this.size / 6, this.size / 8, this.size / 4, 0, this.size / 5, -this.size / 10);
            ctx.fill();
            ctx.restore();

            // Left lower wing (hindwing) - more rounded and organic
            ctx.save();
            ctx.rotate((-wingAngle * Math.PI) / 180);
            ctx.beginPath();
            ctx.moveTo(-this.size / 4.5, this.size / 12);
            // Top/inner curve
            ctx.bezierCurveTo(-this.size / 2, -this.size / 4, -this.size / 2.8, this.size / 3, -this.size / 8, this.size / 1.5);
            // Bottom curve - more rounded
            ctx.bezierCurveTo(this.size / 12, this.size / 1.2, this.size / 3, this.size / 1.5, this.size / 2.5, this.size / 3);
            // Back side - trailing edge
            ctx.bezierCurveTo(this.size / 2.2, this.size / 6, this.size / 4, -this.size / 8, this.size / 8, this.size / 6);
            // Curve back to center
            ctx.bezierCurveTo(-this.size / 10, this.size / 12, -this.size / 3, this.size / 10, -this.size / 4.5, this.size / 12);
            ctx.fill();
            ctx.restore();

            // Right lower wing (hindwing) - mirror of left
            ctx.save();
            ctx.rotate((wingAngle * Math.PI) / 180);
            ctx.beginPath();
            ctx.moveTo(this.size / 4.5, this.size / 12);
            // Top/inner curve
            ctx.bezierCurveTo(this.size / 2, -this.size / 4, this.size / 2.8, this.size / 3, this.size / 8, this.size / 1.5);
            // Bottom curve - more rounded
            ctx.bezierCurveTo(-this.size / 12, this.size / 1.2, -this.size / 3, this.size / 1.5, -this.size / 2.5, this.size / 3);
            // Back side - trailing edge
            ctx.bezierCurveTo(-this.size / 2.2, this.size / 6, -this.size / 4, -this.size / 8, -this.size / 8, this.size / 6);
            // Curve back to center
            ctx.bezierCurveTo(this.size / 10, this.size / 12, this.size / 3, this.size / 10, this.size / 4.5, this.size / 12);
            ctx.fill();
            ctx.restore();

            // Body - more elongated and segmented
            ctx.fillStyle = '#2d1810'; // Dark brown body
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size / 8, this.size / 1.2, 0, 0, 2 * Math.PI);
            ctx.fill();

            // Thorax (middle segment)
            ctx.fillStyle = '#4a2c17';
            ctx.beginPath();
            ctx.ellipse(0, -this.size / 6, this.size / 6, this.size / 4, 0, 0, 2 * Math.PI);
            ctx.fill();

            // Antennae
            ctx.strokeStyle = '#2d1810';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-this.size / 12, -this.size / 3);
            ctx.lineTo(-this.size / 8, -this.size / 2);
            ctx.moveTo(this.size / 12, -this.size / 3);
            ctx.lineTo(this.size / 8, -this.size / 2);
            ctx.stroke();

            // Add subtle wing veins/patterns
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 0.5;
            ctx.save();
            ctx.rotate((-wingAngle * Math.PI) / 180);
            // Left wing veins
            ctx.beginPath();
            ctx.moveTo(-this.size / 4, -this.size / 6);
            ctx.lineTo(-this.size / 8, this.size / 6);
            ctx.moveTo(-this.size / 6, -this.size / 4);
            ctx.lineTo(0, this.size / 8);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.rotate((wingAngle * Math.PI) / 180);
            // Right wing veins
            ctx.beginPath();
            ctx.moveTo(this.size / 4, -this.size / 6);
            ctx.lineTo(this.size / 8, this.size / 6);
            ctx.moveTo(this.size / 6, -this.size / 4);
            ctx.lineTo(0, this.size / 8);
            ctx.stroke();
            ctx.restore();
          } else if (type === 'lanterns') {
            // Draw Asian-style lantern
            ctx.globalAlpha = this.opacity * (config?.opacity ?? 0.85);
            
            // Outer glow
            const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 1.5);
            outerGlow.addColorStop(0, `${this.color}80`);
            outerGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1.5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Lantern body
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.glowIntensity * (config?.opacity ?? 0.85);
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Lantern details
            ctx.strokeStyle = '#8B0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-this.size * 0.6, 0);
            ctx.lineTo(this.size * 0.6, 0);
            ctx.stroke();
          } else if (type === 'aurora') {
            // Draw aurora waves
            ctx.globalAlpha = this.opacity * (config?.opacity ?? 0.6);
            const gradient = ctx.createLinearGradient(0, -this.size, 0, this.size);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.5, this.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            for (let i = -this.size; i <= this.size; i += 5) {
              const wave = Math.sin((i + this.y) * this.waveSpeed) * this.waveAmplitude;
              if (i === -this.size) {
                ctx.moveTo(i, wave);
              } else {
                ctx.lineTo(i, wave);
              }
            }
            ctx.lineTo(this.size, this.size * 2);
            ctx.lineTo(-this.size, this.size * 2);
            ctx.closePath();
            ctx.fill();
          } else if (type === 'desert') {
            // Draw sand particle
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity * (config?.opacity ?? 0.5);
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
            ctx.fill();
          } else if (type === 'tropical') {
            // Draw tropical flower (hibiscus-style)
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity * (config?.opacity ?? 0.8);
            const petals = 5;
            for (let i = 0; i < petals; i++) {
              ctx.save();
              ctx.rotate((i * 2 * Math.PI) / petals);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.quadraticCurveTo(this.size / 2, -this.size / 3, this.size / 1.5, 0);
              ctx.quadraticCurveTo(this.size / 2, this.size / 3, 0, 0);
              ctx.fill();
              ctx.restore();
            }
            
            // Center pistil
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 5, 0, 2 * Math.PI);
            ctx.fill();
          }
          
          ctx.restore();
        }
      }

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw all particles
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];

          
          particle.update();
          particle.draw();
        }
        
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
  }, [type, config, width, height]);

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
      {(type === 'rain' || type === 'winter' || type === 'autumn' || type === 'spring' || type === 'sakura' || type === 'fireflies' || type === 'butterflies' || type === 'lanterns' || type === 'aurora' || type === 'desert' || type === 'tropical') && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: type === 'autumn' || type === 'spring' || type === 'sakura' || type === 'tropical' ? 0.8 : type === 'fireflies' || type === 'lanterns' ? 0.9 : type === 'butterflies' ? 0.85 : type === 'aurora' ? 0.6 : type === 'desert' ? 0.5 : 0.6
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
            opacity: (config?.opacity ?? 1) * 0.15
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