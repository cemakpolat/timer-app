import React, { useEffect, useRef } from 'react';

const WeatherEffect = ({ type, config, width, height }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (type === 'rain' || type === 'winter' || type === 'autumn' || type === 'spring' || type === 'sakura' || type === 'fireflies' || type === 'butterflies' || type === 'lanterns' || type === 'aurora' || type === 'desert' || type === 'tropical' || type === 'coffee' || type === 'fireplace') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = width || window.innerWidth;
      canvas.height = height || window.innerHeight;

      let particles = [];

      const particleCount = type === 'rain' ? 150 : type === 'winter' ? 80 : type === 'autumn' ? 40 : type === 'spring' ? 50 : type === 'sakura' ? 60 : type === 'fireflies' ? 30 : type === 'butterflies' ? 20 : type === 'lanterns' ? 25 : type === 'aurora' ? 50 : type === 'desert' ? 120 : type === 'tropical' ? 40 : type === 'coffee' ? 300 : type === 'fireplace' ? 90 : 50;

      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height - canvas.height;
          
          // Coffee Smoke
          if (type === 'coffee') {
            // More realistic coffee smoke colors - lighter greys and whites
            const colors = ['#F5F5F5', '#E8E8E8', '#D3D3D3', '#B8B8B8', '#A0A0A0', '#888888'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speed = Math.random() * 0.8 + 0.3; // Slightly faster rise
            this.size = Math.random() * 40 + 25; // Bigger initial size
            this.maxSize = Math.random() * 120 + 100; // Allow bigger expansion
            this.opacity = Math.random() * 0.8 + 0.4; // Higher initial opacity
            this.swayAmplitude = Math.random() * 4 + 2; // More sway
            this.swaySpeed = Math.random() * 0.02 + 0.01; // Slower, more natural sway
            this.swayOffset = Math.random() * Math.PI * 2;
            this.turbulence = Math.random() * 0.8 + 0.4; // More turbulence
            this.turbulenceOffset = Math.random() * Math.PI * 2;
            this.expansion = Math.random() * 0.02 + 0.015; // Faster expansion
            this.lifetime = 0;
            this.maxLifetime = Math.random() * 500 + 400; // Longer lifetime
            this.y = canvas.height + Math.random() * 30; // Start closer to bottom
            // Spread smoke across more area, not just center
            this.x = (canvas.width / 2) + (Math.random() - 0.5) * (canvas.width * 0.4);
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 2;
          }

          // Fireplace Flames
          if (type === 'fireplace') {
            const rand = Math.random();
            // Core flames (hot - yellow/white)
            if (rand < 0.3) {
              const coreColors = ['#FFFF00', '#FFD700', '#FFA500', '#FFFF88'];
              this.color = coreColors[Math.floor(Math.random() * coreColors.length)];
              this.size = Math.random() * 20 + 12; // Bigger core flames
              this.opacity = Math.random() * 0.7 + 0.4;
            }
            // Mid flames (orange/red)
            else if (rand < 0.7) {
              const midColors = ['#FF6347', '#FF4500', '#FF8C00', '#FF7F50'];
              this.color = midColors[Math.floor(Math.random() * midColors.length)];
              this.size = Math.random() * 25 + 15; // Bigger mid flames
              this.opacity = Math.random() * 0.6 + 0.3;
            }
            // Outer flames (darker red/ember)
            else {
              const outerColors = ['#DC143C', '#B22222', '#8B0000', '#CD5C5C'];
              this.color = outerColors[Math.floor(Math.random() * outerColors.length)];
              this.size = Math.random() * 30 + 18; // Bigger outer flames
              this.opacity = Math.random() * 0.5 + 0.2;
            }
            this.speed = Math.random() * 2 + 0.8;
            this.flickerSpeed = Math.random() * 0.15 + 0.08;
            this.flickerOffset = Math.random() * Math.PI * 2;
            this.flickerIntensity = Math.random() * 0.4 + 0.3;
            this.heatWave = Math.random() * 1.5 + 0.5;
            this.heatWaveSpeed = Math.random() * 0.08 + 0.04;
            this.lifetime = 0;
            this.maxLifetime = Math.random() * 150 + 100;
            this.y = canvas.height + Math.random() * 30;
            // Distribute flames across bottom width, not just center
            this.x = Math.random() * canvas.width;
            this.baseX = this.x;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 3;
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
          } else if (type === 'coffee') {
            // Coffee smoke rises and swirls with turbulence
            this.lifetime++;
            this.y -= this.speed;
            
            // Multi-layered swaying motion
            const sway1 = Math.sin(this.y * this.swaySpeed + this.swayOffset) * this.swayAmplitude;
            const sway2 = Math.cos(this.y * this.swaySpeed * 0.7 + this.swayOffset + 1) * (this.swayAmplitude * 0.6);
            const turbulence = Math.sin(this.lifetime * 0.05 + this.turbulenceOffset) * this.turbulence * 2;
            this.x += sway1 + sway2 + turbulence;
            
            // Smoke expands as it rises (limited expansion)
            this.size = Math.min(this.size + this.expansion, this.maxSize);
            
            // Gentle rotation
            this.rotation += this.rotationSpeed;
            
            // Fade based on lifetime and height - maintain higher visibility
            const lifetimeRatio = this.lifetime / this.maxLifetime;
            const heightRatio = Math.max(0, (canvas.height - this.y) / canvas.height);
            this.opacity = (Math.random() * 0.4 + 0.5) * (1 - lifetimeRatio * 0.6) * Math.max(0.4, 1 - heightRatio * 0.8);
            
            if (this.y < -50 || this.opacity <= 0.08 || this.lifetime > this.maxLifetime) {
              this.y = canvas.height + Math.random() * 30;
              // Spread respawn across wider area
              this.x = (canvas.width / 2) + (Math.random() - 0.5) * (canvas.width * 0.4);
              this.size = Math.random() * 40 + 25;
              this.opacity = Math.random() * 0.8 + 0.4; // Higher respawn opacity
              this.lifetime = 0;
              this.rotation = Math.random() * 360;
            }
          } else if (type === 'fireplace') {
            // Fireplace flames rise and flicker dynamically
            this.lifetime++;
            this.y -= this.speed;
            
            // Heat wave distortion effect
            const heatWaveX = Math.sin(this.y * 0.03 + this.lifetime * this.heatWaveSpeed) * this.heatWave;
            const heatWaveY = Math.cos(this.y * 0.05 + this.lifetime * this.heatWaveSpeed * 0.8) * (this.heatWave * 0.5);
            this.x += heatWaveX;
            
            // Gentle sway, reduced center pull for wider distribution
            const centerPull = (canvas.width / 2 - this.x) * 0.0004;
            this.x += centerPull;
            
            // Dynamic flickering
            const flicker1 = Math.sin(this.lifetime * this.flickerSpeed + this.flickerOffset) * this.flickerIntensity;
            const flicker2 = Math.cos(this.lifetime * this.flickerSpeed * 1.3 + this.flickerOffset + 1) * (this.flickerIntensity * 0.6);
            this.opacity = Math.max(0.2, Math.min(1, this.opacity + flicker1 + flicker2));
            
            // Size stays constant - no growth over time
            
            // Rotation for dynamic flame shape
            this.rotation += this.rotationSpeed + heatWaveY;
            
            // Fade as flames rise
            const heightRatio = (canvas.height - this.y) / canvas.height;
            this.opacity *= Math.max(0.2, 1 - (heightRatio * 0.7));
            
            if (this.y < canvas.height * 0.3 || this.lifetime > this.maxLifetime) {
              this.y = canvas.height + Math.random() * 30;
              this.x = Math.random() * canvas.width; // Distribute across full width
              this.baseX = this.x;
              this.lifetime = 0;
              this.opacity = Math.random() * 0.8 + 0.3;
            }
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
            let safeSize = Number.isFinite(this.size) ? this.size : 5;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, safeSize * 2);
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
            // Ensure this.size is a finite number
            let safeSize = Number.isFinite(this.size) ? this.size : 20;
            // Outer glow
            const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, safeSize * 1.5);
            outerGlow.addColorStop(0, `${this.color}80`);
            outerGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, safeSize * 1.5, 0, 2 * Math.PI);
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
            let safeSize = Number.isFinite(this.size) ? this.size : 20;
            const gradient = ctx.createLinearGradient(0, -safeSize, 0, safeSize);
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
          } else if (type === 'coffee') {
            // Draw layered coffee smoke cloud with soft gradient
            let safeSize = Number.isFinite(this.size) ? this.size : 30;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, safeSize);
            
            // Add color with proper transparency
            const baseOpacity = this.opacity * (config?.opacity ?? 0.6);
            gradient.addColorStop(0, `${this.color}${Math.floor(baseOpacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(0.5, `${this.color}${Math.floor(baseOpacity * 0.6 * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${this.color}00`);
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 1; // Alpha is in gradient
            
            // Draw multiple overlapping ellipses for wispy smoke effect
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.7, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add secondary wispy layer
            ctx.globalAlpha = baseOpacity * 0.4;
            ctx.beginPath();
            ctx.ellipse(this.size * 0.3, -this.size * 0.2, this.size * 0.6, this.size * 0.5, Math.PI / 6, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(-this.size * 0.2, this.size * 0.3, this.size * 0.5, this.size * 0.6, -Math.PI / 4, 0, 2 * Math.PI);
            ctx.fill();
          } else if (type === 'fireplace') {
            // Draw fireplace flame with glow and gradient
            const baseOpacity = this.opacity * (config?.opacity ?? 0.8);
            let safeSize = Number.isFinite(this.size) ? this.size : 30;
            // Outer glow
            const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, safeSize * 1.5);
            outerGlow.addColorStop(0, `${this.color}${Math.floor(baseOpacity * 0.3 * 255).toString(16).padStart(2, '0')}`);
            outerGlow.addColorStop(0.5, `${this.color}${Math.floor(baseOpacity * 0.15 * 255).toString(16).padStart(2, '0')}`);
            outerGlow.addColorStop(1, `${this.color}00`);
            ctx.fillStyle = outerGlow;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1.5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Main flame body with gradient
            const flameGradient = ctx.createRadialGradient(0, safeSize * 0.3, 0, 0, -safeSize * 0.2, safeSize * 1.2);
            flameGradient.addColorStop(0, this.color.includes('FFF') || this.color.includes('FFD') ? '#FFFFFF' : '#FFD700');
            flameGradient.addColorStop(0.4, this.color);
            flameGradient.addColorStop(1, this.color.includes('DC1') || this.color.includes('B22') ? '#8B0000' : this.color);
            
            ctx.fillStyle = flameGradient;
            ctx.globalAlpha = baseOpacity;
            
            // Organic flame shape
            ctx.beginPath();
            const flicker = Math.sin(this.lifetime * 0.2) * 0.15;
            ctx.moveTo(0, -this.size * (0.8 + flicker));
            ctx.bezierCurveTo(
              this.size * 0.4, -this.size * 0.9,
              this.size * 0.5, -this.size * 0.3,
              this.size * 0.35, this.size * 0.2
            );
            ctx.quadraticCurveTo(this.size * 0.2, this.size * 0.4, 0, this.size * 0.3);
            ctx.quadraticCurveTo(-this.size * 0.2, this.size * 0.4, -this.size * 0.35, this.size * 0.2);
            ctx.bezierCurveTo(
              -this.size * 0.5, -this.size * 0.3,
              -this.size * 0.4, -this.size * 0.9,
              0, -this.size * (0.8 + flicker)
            );
            ctx.fill();
            
            // Add bright core
            if (this.color.includes('FFF') || this.color.includes('FFD')) {
              const coreGradient = ctx.createRadialGradient(0, safeSize * 0.1, 0, 0, 0, safeSize * 0.4);
              coreGradient.addColorStop(0, `rgba(255, 255, 255, ${baseOpacity * 0.9})`);
              coreGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
              ctx.fillStyle = coreGradient;
              ctx.beginPath();
              ctx.arc(0, this.size * 0.1, this.size * 0.4, 0, 2 * Math.PI);
              ctx.fill();
            }
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
      {(type === 'rain' || type === 'winter' || type === 'autumn' || type === 'spring' || type === 'sakura' || type === 'fireflies' || type === 'butterflies' || type === 'lanterns' || type === 'aurora' || type === 'desert' || type === 'tropical' || type === 'coffee' || type === 'fireplace') && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: type === 'autumn' || type === 'spring' || type === 'sakura' || type === 'tropical' ? 0.8 : type === 'fireflies' || type === 'lanterns' ? 0.9 : type === 'butterflies' ? 0.85 : type === 'aurora' ? 0.6 : type === 'desert' ? 0.5 : type === 'coffee' ? 0.9 : type === 'fireplace' ? 0.8 : 0.6
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