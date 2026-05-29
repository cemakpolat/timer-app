const TAU = Math.PI * 2;

const AUTUMN_COLORS = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#FF6347', '#FF8C00', '#DC143C', '#B22222', '#DAA520', '#FF4500'];
const SPRING_COLORS = ['#98FB98', '#90EE90', '#00FF7F', '#32CD32', '#228B22', '#FFB6C1', '#FF69B4', '#FFD700', '#FFA500', '#87CEEB'];
const SAKURA_COLORS = ['#FFB7C5', '#FFB6C1', '#FF69B4', '#FF1493', '#DB7093', '#FFC0CB'];
const BUTTERFLY_COLORS = ['#FF69B4', '#FFB6C1', '#FFA500', '#FF6347', '#FF1493', '#FFD700', '#FF8C00', '#DC143C'];
const LANTERN_COLORS = ['#FF4500', '#FF6347', '#DC143C', '#FF8C00', '#FFD700', '#FF1493'];
const AURORA_COLORS = ['#00FF00', '#00FFFF', '#0000FF', '#FF00FF'];
const DESERT_COLORS = ['#D2B48C', '#DEB887', '#F4A460', '#CD853F'];
const TROPICAL_COLORS = ['#FF1493', '#FFB6C1', '#FFA500', '#FF69B4', '#FF6347', '#FFD700', '#00CED1', '#FF4500'];
const COFFEE_COLORS = ['#F5F5F5', '#E8E8E8', '#D3D3D3', '#B8B8B8', '#A0A0A0', '#888888'];
const FIREPLACE_CORE_COLORS = ['#FFFF00', '#FFD700', '#FFA500', '#FFFF88'];
const FIREPLACE_MID_COLORS = ['#FF6347', '#FF4500', '#FF8C00', '#FF7F50'];
const FIREPLACE_OUTER_COLORS = ['#DC143C', '#B22222', '#8B0000', '#CD5C5C'];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const randomMatrixGlyph = () => String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));

const hexToRgb = (color) => {
  if (!color || typeof color !== 'string' || !color.startsWith('#')) {
    return null;
  }

  const hex = color.replace('#', '');
  const normalized = hex.length === 3
    ? hex.split('').map((chunk) => chunk + chunk).join('')
    : hex;

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

const createBaseParticle = (canvas, index) => ({
  index,
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height - canvas.height,
  rotation: Math.random() * 360,
  rotationSpeed: randomBetween(-1, 1) * 2,
  swayOffset: Math.random() * TAU,
  windDirection: Math.random() > 0.5 ? 1 : -1,
  horizontalDrift: Math.random() * 0.5,
});

const ensureParticleDefaults = (particle) => {
  if (particle.opacity === undefined) particle.opacity = randomBetween(0.4, 1);
  if (particle.size === undefined) particle.size = randomBetween(1, 4);
  if (particle.speed === undefined) particle.speed = randomBetween(0.5, 1.5);
  if (particle.color === undefined) particle.color = '#FFFFFF';
  if (particle.brightness === undefined) particle.brightness = randomBetween(0.4, 1);
  if (particle.glowIntensity === undefined) particle.glowIntensity = randomBetween(0.5, 1);
  return particle;
};

const respawnAboveTop = (particle, canvas, overscan = 50) => {
  particle.y = -randomBetween(overscan * 0.5, overscan * 2);
  particle.x = Math.random() * canvas.width;
};

const drawAtParticle = (ctx, particle, opacityMultiplier, callback, options = {}) => {
  ctx.save();
  ctx.translate(particle.x, particle.y);

  if (!options.skipRotation && particle.rotation) {
    ctx.rotate((particle.rotation * Math.PI) / 180);
  }

  ctx.globalAlpha = (particle.opacity ?? 1) * opacityMultiplier;
  callback();
  ctx.restore();
};

const drawButterfly = (ctx, particle) => {
  const wingAngle = Math.sin(particle.wingBeat) * 25;

  ctx.fillStyle = particle.color;

  ctx.save();
  ctx.rotate((-wingAngle * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(-particle.size / 5, -particle.size / 10);
  ctx.bezierCurveTo(-particle.size / 2.5, -particle.size / 2.2, -particle.size / 3.5, -particle.size / 1.8, -particle.size / 6, -particle.size / 1.2);
  ctx.bezierCurveTo(0, -particle.size / 1.5, particle.size / 8, -particle.size / 2, particle.size / 6, -particle.size / 3);
  ctx.bezierCurveTo(particle.size / 8, -particle.size / 8, particle.size / 10, particle.size / 6, -particle.size / 12, particle.size / 5);
  ctx.bezierCurveTo(-particle.size / 6, particle.size / 8, -particle.size / 4, 0, -particle.size / 5, -particle.size / 10);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.rotate((wingAngle * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(particle.size / 5, -particle.size / 10);
  ctx.bezierCurveTo(particle.size / 2.5, -particle.size / 2.2, particle.size / 3.5, -particle.size / 1.8, particle.size / 6, -particle.size / 1.2);
  ctx.bezierCurveTo(0, -particle.size / 1.5, -particle.size / 8, -particle.size / 2, -particle.size / 6, -particle.size / 3);
  ctx.bezierCurveTo(-particle.size / 8, -particle.size / 8, -particle.size / 10, particle.size / 6, particle.size / 12, particle.size / 5);
  ctx.bezierCurveTo(particle.size / 6, particle.size / 8, particle.size / 4, 0, particle.size / 5, -particle.size / 10);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.rotate((-wingAngle * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(-particle.size / 4.5, particle.size / 12);
  ctx.bezierCurveTo(-particle.size / 2, -particle.size / 4, -particle.size / 2.8, particle.size / 3, -particle.size / 8, particle.size / 1.5);
  ctx.bezierCurveTo(particle.size / 12, particle.size / 1.2, particle.size / 3, particle.size / 1.5, particle.size / 2.5, particle.size / 3);
  ctx.bezierCurveTo(particle.size / 2.2, particle.size / 6, particle.size / 4, -particle.size / 8, particle.size / 8, particle.size / 6);
  ctx.bezierCurveTo(-particle.size / 10, particle.size / 12, -particle.size / 3, particle.size / 10, -particle.size / 4.5, particle.size / 12);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.rotate((wingAngle * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(particle.size / 4.5, particle.size / 12);
  ctx.bezierCurveTo(particle.size / 2, -particle.size / 4, particle.size / 2.8, particle.size / 3, particle.size / 8, particle.size / 1.5);
  ctx.bezierCurveTo(-particle.size / 12, particle.size / 1.2, -particle.size / 3, particle.size / 1.5, -particle.size / 2.5, particle.size / 3);
  ctx.bezierCurveTo(-particle.size / 2.2, particle.size / 6, -particle.size / 4, -particle.size / 8, -particle.size / 8, particle.size / 6);
  ctx.bezierCurveTo(particle.size / 10, particle.size / 12, particle.size / 3, particle.size / 10, particle.size / 4.5, particle.size / 12);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#2d1810';
  ctx.beginPath();
  ctx.ellipse(0, 0, particle.size / 8, particle.size / 1.2, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#4a2c17';
  ctx.beginPath();
  ctx.ellipse(0, -particle.size / 6, particle.size / 6, particle.size / 4, 0, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = '#2d1810';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-particle.size / 12, -particle.size / 3);
  ctx.lineTo(-particle.size / 8, -particle.size / 2);
  ctx.moveTo(particle.size / 12, -particle.size / 3);
  ctx.lineTo(particle.size / 8, -particle.size / 2);
  ctx.stroke();
};

const drawLantern = (ctx, particle, opacityMultiplier) => {
  const safeSize = Number.isFinite(particle.size) ? particle.size : 20;
  const safeGlowIntensity = Number.isFinite(particle.glowIntensity) ? particle.glowIntensity : 0.8;
  const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, safeSize * 1.6);
  outerGlow.addColorStop(0, withAlpha(particle.color, 0.35 * opacityMultiplier));
  outerGlow.addColorStop(1, withAlpha(particle.color, 0));
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(0, 0, safeSize * 1.6, 0, TAU);
  ctx.fill();

  ctx.fillStyle = particle.color;
  ctx.globalAlpha = safeGlowIntensity * opacityMultiplier;
  ctx.beginPath();
  ctx.ellipse(0, 0, safeSize * 0.6, safeSize, 0, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = '#8B0000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-safeSize * 0.6, 0);
  ctx.lineTo(safeSize * 0.6, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -safeSize * 1.1);
  ctx.lineTo(0, -safeSize * 1.6);
  ctx.stroke();
};

const createMatrixParticle = ({ canvas, index }) => {
  const particle = createBaseParticle(canvas, index);
  const fontSize = randomBetween(14, 22);
  const columnWidth = fontSize * randomBetween(0.82, 0.98);
  const columnCount = Math.max(10, Math.floor(canvas.width / columnWidth));
  const columnIndex = index % columnCount;
  const trailLength = randomInt(8, 18);

  particle.fontSize = fontSize;
  particle.columnWidth = columnWidth;
  particle.x = columnIndex * columnWidth + columnWidth * 0.5;
  particle.y = randomBetween(-canvas.height, canvas.height * 0.25);
  particle.speed = randomBetween(1.8, 4.2);
  particle.opacity = randomBetween(0.55, 0.95);
  particle.trailLength = trailLength;
  particle.trail = Array.from({ length: trailLength }, randomMatrixGlyph);
  particle.flickerOffset = Math.random() * TAU;
  particle.glyphCycle = randomBetween(0.08, 0.2);

  return particle;
};

const resetMatrixParticle = (particle, canvas) => {
  const next = createMatrixParticle({ canvas, index: particle.index });
  Object.assign(particle, next, {
    y: -randomBetween(50, canvas.height * 0.5),
  });
};

const createStarfieldParticle = ({ canvas, index, forceComet = false }) => {
  const particle = createBaseParticle(canvas, index);
  const isComet = forceComet || Math.random() > 0.975;

  particle.isComet = isComet;
  particle.opacity = randomBetween(0.35, 0.95);

  if (isComet) {
    particle.x = randomBetween(-canvas.width * 0.1, canvas.width * 0.6);
    particle.y = randomBetween(-canvas.height * 0.2, canvas.height * 0.3);
    particle.speed = randomBetween(7, 11);
    particle.angle = randomBetween(0.18, 0.45);
    particle.tailLength = randomBetween(60, 140);
    particle.size = randomBetween(1.6, 2.8);
    particle.twinkleSpeed = randomBetween(0.02, 0.05);
  } else {
    particle.depth = randomBetween(0.2, 1);
    particle.x = Math.random() * canvas.width;
    particle.y = Math.random() * canvas.height;
    particle.speed = randomBetween(0.15, 0.55) * particle.depth;
    particle.size = randomBetween(0.8, 2.8) * (0.6 + particle.depth * 0.8);
    particle.twinkleOffset = Math.random() * TAU;
    particle.twinkleSpeed = randomBetween(0.01, 0.04);
  }

  return particle;
};

const resetStarfieldParticle = (particle, canvas) => {
  const next = createStarfieldParticle({ canvas, index: particle.index, forceComet: particle.isComet && Math.random() > 0.35 });
  Object.assign(particle, next);
};

export const CANVAS_EFFECT_REGISTRY = {
  rain: {
    baseParticleCount: 150,
    performance: 'heavy',
    canvasOpacity: 0.68,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      speed: randomBetween(8, 13),
      length: randomBetween(12, 34),
      size: randomBetween(0.8, 1.8),
      opacity: randomBetween(0.35, 0.75),
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y += particle.speed * velocityMultiplier;
      if (particle.y > canvas.height + particle.length) {
        particle.y = -randomBetween(20, canvas.height * 0.2);
        particle.x = Math.random() * canvas.width;
      }
    },
    drawParticle: (particle, { ctx, config, opacityMultiplier }) => {
      const color = config?.color || '#4682B4';
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.strokeStyle = withAlpha(color, 0.72);
        ctx.lineWidth = particle.size;
        ctx.lineCap = 'round';
        ctx.shadowColor = withAlpha(color, 0.3);
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, particle.length);
        ctx.stroke();
      }, { skipRotation: true });
    },
  },
  winter: {
    baseParticleCount: 80,
    performance: 'medium',
    canvasOpacity: 0.74,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      speed: randomBetween(0.3, 1.1),
      size: randomBetween(2, 6),
      opacity: randomBetween(0.4, 0.9),
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y += particle.speed * velocityMultiplier;
      particle.x += Math.sin(particle.y * 0.01 + particle.swayOffset) * 0.7 * velocityMultiplier;
      particle.rotation += particle.rotationSpeed * 0.3;

      if (particle.y > canvas.height + particle.size) {
        respawnAboveTop(particle, canvas, 40);
      }

      if (particle.x < -20) particle.x = canvas.width + 20;
      if (particle.x > canvas.width + 20) particle.x = -20;
    },
    drawParticle: (particle, { ctx, config, opacityMultiplier }) => {
      const color = config?.color || '#FFFFFF';
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, TAU);
        ctx.fill();

        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 1.8);
        glow.addColorStop(0, withAlpha(color, 0.4));
        glow.addColorStop(1, withAlpha(color, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 1.8, 0, TAU);
        ctx.fill();
      });
    },
  },
  autumn: {
    baseParticleCount: 40,
    performance: 'medium',
    canvasOpacity: 0.82,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      color: pick(AUTUMN_COLORS),
      speed: randomBetween(0.5, 2),
      size: randomBetween(10, 22),
      opacity: randomBetween(0.35, 0.85),
      swaySpeed: randomBetween(0.01, 0.03),
      swayAmplitude: randomBetween(1, 3),
      rotationSpeed: randomBetween(-1.5, 1.5) * 2,
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y += particle.speed * velocityMultiplier;
      particle.rotation += particle.rotationSpeed * 0.8;
      const sway = Math.sin(particle.y * particle.swaySpeed + particle.swayOffset) * particle.swayAmplitude * particle.windDirection;
      let gust = 0;

      if (Math.random() > 0.995) gust = (Math.random() - 0.5) * 1;
      else if (Math.random() > 0.98) gust = (Math.random() - 0.5) * 0.6;

      const deltaX = clamp((sway + particle.horizontalDrift + gust) * velocityMultiplier, -1.5, 1.5);
      particle.x += deltaX;

      if (particle.y > canvas.height + 50) {
        particle.y = -Math.random() * (canvas.height * 0.18) - 20;
        particle.x = Math.random() * canvas.width;
        particle.windDirection = Math.random() > 0.5 ? 1 : -1;
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.moveTo(0, -particle.size / 2);
        ctx.quadraticCurveTo(particle.size / 2, -particle.size / 4, particle.size / 2, particle.size / 4);
        ctx.quadraticCurveTo(particle.size / 4, particle.size / 2, 0, particle.size / 2);
        ctx.quadraticCurveTo(-particle.size / 4, particle.size / 2, -particle.size / 2, particle.size / 4);
        ctx.quadraticCurveTo(-particle.size / 2, -particle.size / 4, 0, -particle.size / 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -particle.size / 2);
        ctx.lineTo(0, particle.size / 2);
        ctx.stroke();
      });
    },
  },
  spring: {
    baseParticleCount: 50,
    performance: 'medium',
    canvasOpacity: 0.82,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      color: pick(SPRING_COLORS),
      speed: randomBetween(0.5, 1.5),
      size: randomBetween(8, 18),
      opacity: randomBetween(0.4, 0.85),
      swaySpeed: randomBetween(0.01, 0.03),
      swayAmplitude: randomBetween(0.5, 2),
      rotationSpeed: randomBetween(-1, 1) * 2,
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y += particle.speed * velocityMultiplier;
      particle.rotation += particle.rotationSpeed;
      particle.x += Math.sin(particle.y * particle.swaySpeed + particle.swayOffset) * particle.swayAmplitude * particle.windDirection * velocityMultiplier;
      particle.x += Math.cos(particle.y * 0.015) * 0.8 * velocityMultiplier;
      particle.x += particle.horizontalDrift * velocityMultiplier;

      if (particle.y > canvas.height + 50) {
        particle.y = -Math.random() * (canvas.height * 0.18) - 20;
        particle.x = Math.random() * canvas.width;
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.fillStyle = particle.color;
        for (let petal = 0; petal < 5; petal += 1) {
          ctx.save();
          ctx.rotate((petal * TAU) / 5);
          ctx.beginPath();
          ctx.ellipse(0, -particle.size / 3, particle.size / 3, particle.size / 2, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
        }

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 4, 0, TAU);
        ctx.fill();
      });
    },
  },
  sakura: {
    baseParticleCount: 60,
    performance: 'medium',
    canvasOpacity: 0.82,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      color: pick(SAKURA_COLORS),
      speed: randomBetween(0.3, 1.1),
      size: randomBetween(8, 18),
      opacity: randomBetween(0.35, 0.85),
      swaySpeed: randomBetween(0.01, 0.03),
      swayAmplitude: randomBetween(0.5, 2.5),
      rotationSpeed: randomBetween(-1.25, 1.25) * 2,
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y += particle.speed * velocityMultiplier;
      particle.rotation += particle.rotationSpeed;
      particle.x += Math.sin(particle.y * particle.swaySpeed + particle.swayOffset) * particle.swayAmplitude * velocityMultiplier;
      particle.x += Math.cos(particle.y * 0.02) * 1.5 * velocityMultiplier;

      if (particle.y > canvas.height + 50) {
        particle.y = -Math.random() * (canvas.height * 0.18) - 20;
        particle.x = Math.random() * canvas.width;
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.fillStyle = particle.color;
        for (let petal = 0; petal < 5; petal += 1) {
          ctx.save();
          ctx.rotate((petal * TAU) / 5);
          ctx.beginPath();
          ctx.ellipse(0, -particle.size / 3.5, particle.size / 3.5, particle.size / 2.2, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
        }

        ctx.fillStyle = '#FFB7C5';
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 5, 0, TAU);
        ctx.fill();
      });
    },
  },
  fireflies: {
    baseParticleCount: 30,
    performance: 'light',
    canvasOpacity: 0.9,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      color: '#FFD700',
      size: randomBetween(2, 5),
      brightness: randomBetween(0.2, 1),
      pulseSpeed: randomBetween(0.01, 0.03),
      floatAmplitude: randomBetween(1, 3),
      opacity: 0.8,
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y += 0.25 * velocityMultiplier;
      particle.brightness = (Math.sin(particle.y * particle.pulseSpeed) + 1) / 2;
      particle.x += Math.sin(particle.y * 0.03 + particle.swayOffset) * particle.floatAmplitude * velocityMultiplier;
      particle.y += Math.sin(particle.x * 0.02) * 0.5 * velocityMultiplier;

      if (particle.y > canvas.height + 50) particle.y = -50;
      if (particle.y < -50) particle.y = canvas.height + 50;
      if (particle.x > canvas.width + 50) particle.x = -50;
      if (particle.x < -50) particle.x = canvas.width + 50;
    },
    drawParticle: (particle, { ctx, config, opacityMultiplier }) => {
      const coreColor = config?.color || '#FFD700';
      const safeBrightness = Number.isFinite(particle.brightness) ? particle.brightness : 0.5;
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2.5);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${safeBrightness * 0.8})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${safeBrightness * 0.25})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 2.5, 0, TAU);
        ctx.fill();

        ctx.fillStyle = coreColor;
        ctx.globalAlpha = safeBrightness * opacityMultiplier;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, TAU);
        ctx.fill();
      }, { skipRotation: true });
    },
  },
  butterflies: {
    baseParticleCount: 20,
    performance: 'light',
    canvasOpacity: 0.86,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      color: pick(BUTTERFLY_COLORS),
      size: randomBetween(12, 27),
      opacity: randomBetween(0.35, 0.85),
      wingBeat: Math.random() * TAU,
      wingBeatSpeed: randomBetween(0.05, 0.15),
      speed: randomBetween(0.5, 1.5),
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.wingBeat += particle.wingBeatSpeed;
      particle.x += (Math.sin(particle.wingBeat * 0.3) * 0.8 + Math.sin(particle.y * 0.01) * 0.3) * velocityMultiplier;
      particle.y += (Math.cos(particle.wingBeat * 0.2) * 0.4 + Math.sin(particle.x * 0.008) * 0.2) * velocityMultiplier;
      particle.y += particle.speed * 0.15 * velocityMultiplier;
      particle.rotation = Math.sin(particle.wingBeat * 0.8) * 8;

      if (particle.y > canvas.height + 50) particle.y = -50;
      if (particle.y < -50) particle.y = canvas.height + 50;
      if (particle.x > canvas.width + 50) particle.x = -50;
      if (particle.x < -50) particle.x = canvas.width + 50;
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        drawButterfly(ctx, particle);
      });
    },
  },
  lanterns: {
    baseParticleCount: 25,
    performance: 'light',
    canvasOpacity: 0.9,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      color: pick(LANTERN_COLORS),
      size: randomBetween(10, 22),
      glowIntensity: randomBetween(0.5, 1),
      opacity: randomBetween(0.4, 0.8),
      swaySpeed: randomBetween(0.005, 0.02),
      swayAmplitude: randomBetween(0.5, 1.5),
      speed: randomBetween(0.2, 0.7),
      y: canvas.height + randomBetween(0, 120),
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y -= particle.speed * velocityMultiplier;
      particle.x += Math.sin(particle.y * particle.swaySpeed + particle.swayOffset) * particle.swayAmplitude * velocityMultiplier;

      if (particle.y < -50) {
        particle.y = canvas.height + 50;
        particle.x = Math.random() * canvas.width;
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        drawLantern(ctx, particle, opacityMultiplier);
      });
    },
  },
  aurora: {
    baseParticleCount: 50,
    performance: 'heavy',
    canvasOpacity: 0.62,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      x: randomBetween(-80, canvas.width + 80),
      y: randomBetween(0, canvas.height * 0.65),
      color: pick(AURORA_COLORS),
      size: randomBetween(30, 80),
      speed: randomBetween(1, 3),
      opacity: randomBetween(0.2, 0.6),
      pulseSpeed: randomBetween(0.005, 0.02),
      waveSpeed: randomBetween(0.01, 0.03),
      waveAmplitude: randomBetween(10, 30),
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.x += particle.speed * velocityMultiplier;
      if (particle.x > canvas.width + particle.size) {
        particle.x = -particle.size;
      }
      particle.opacity = Math.sin(particle.y * particle.pulseSpeed + particle.swayOffset) * 0.2 + 0.4;
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        const gradient = ctx.createLinearGradient(0, -particle.size, 0, particle.size);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, particle.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        for (let i = -particle.size; i <= particle.size; i += 5) {
          const wave = Math.sin((i + particle.y) * particle.waveSpeed) * particle.waveAmplitude;
          if (i === -particle.size) ctx.moveTo(i, wave);
          else ctx.lineTo(i, wave);
        }
        ctx.lineTo(particle.size, particle.size * 2);
        ctx.lineTo(-particle.size, particle.size * 2);
        ctx.closePath();
        ctx.fill();
      }, { skipRotation: true });
    },
  },
  desert: {
    baseParticleCount: 120,
    performance: 'heavy',
    canvasOpacity: 0.52,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      color: pick(DESERT_COLORS),
      x: randomBetween(-60, canvas.width + 60),
      y: Math.random() * canvas.height,
      size: randomBetween(1, 3),
      opacity: randomBetween(0.2, 0.5),
      speed: randomBetween(1, 3),
      horizontalDrift: randomBetween(0.8, 2),
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y += particle.speed * velocityMultiplier;
      particle.x += particle.horizontalDrift * particle.windDirection * velocityMultiplier;

      if (particle.y > canvas.height + 50) particle.y = -50;
      if (particle.x > canvas.width + 50) {
        particle.x = -50;
        particle.y = Math.random() * canvas.height;
      }
      if (particle.x < -50) {
        particle.x = canvas.width + 50;
        particle.y = Math.random() * canvas.height;
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, TAU);
        ctx.fill();
      }, { skipRotation: true });
    },
  },
  tropical: {
    baseParticleCount: 40,
    performance: 'medium',
    canvasOpacity: 0.82,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      color: pick(TROPICAL_COLORS),
      speed: randomBetween(0.5, 1.7),
      size: randomBetween(10, 22),
      opacity: randomBetween(0.35, 0.85),
      swaySpeed: randomBetween(0.01, 0.03),
      swayAmplitude: randomBetween(0.5, 2),
      rotationSpeed: randomBetween(-1, 1) * 2,
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y += particle.speed * velocityMultiplier;
      particle.rotation += particle.rotationSpeed;
      particle.x += Math.sin(particle.y * particle.swaySpeed + particle.swayOffset) * particle.swayAmplitude * velocityMultiplier;

      if (particle.y > canvas.height + 50) {
        particle.y = -randomBetween(20, canvas.height * 0.18);
        particle.x = Math.random() * canvas.width;
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.fillStyle = particle.color;
        for (let petal = 0; petal < 5; petal += 1) {
          ctx.save();
          ctx.rotate((petal * TAU) / 5);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(particle.size / 2, -particle.size / 3, particle.size / 1.5, 0);
          ctx.quadraticCurveTo(particle.size / 2, particle.size / 3, 0, 0);
          ctx.fill();
          ctx.restore();
        }

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 5, 0, TAU);
        ctx.fill();
      });
    },
  },
  coffee: {
    baseParticleCount: 300,
    performance: 'heavy',
    canvasOpacity: 0.9,
    createParticle: ({ canvas, index }) => ensureParticleDefaults({
      ...createBaseParticle(canvas, index),
      color: pick(COFFEE_COLORS),
      x: canvas.width / 2 + randomBetween(-canvas.width * 0.2, canvas.width * 0.2),
      y: canvas.height + randomBetween(0, 30),
      speed: randomBetween(0.3, 1.1),
      size: randomBetween(25, 65),
      maxSize: randomBetween(100, 220),
      opacity: randomBetween(0.4, 1.2),
      swayAmplitude: randomBetween(2, 6),
      swaySpeed: randomBetween(0.01, 0.03),
      turbulence: randomBetween(0.4, 1.2),
      turbulenceOffset: Math.random() * TAU,
      expansion: randomBetween(0.015, 0.035),
      lifetime: 0,
      maxLifetime: randomBetween(400, 900),
      rotationSpeed: randomBetween(-1, 1) * 2,
    }),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.lifetime += 1;
      particle.y -= particle.speed * velocityMultiplier;

      const swayPrimary = Math.sin(particle.y * particle.swaySpeed + particle.swayOffset) * particle.swayAmplitude;
      const swaySecondary = Math.cos(particle.y * particle.swaySpeed * 0.7 + particle.swayOffset + 1) * (particle.swayAmplitude * 0.6);
      const turbulence = Math.sin(particle.lifetime * 0.05 + particle.turbulenceOffset) * particle.turbulence * 2;

      particle.x += (swayPrimary + swaySecondary + turbulence) * velocityMultiplier;
      particle.size = Math.min(particle.size + particle.expansion, particle.maxSize);
      particle.rotation += particle.rotationSpeed;

      const lifetimeRatio = particle.lifetime / particle.maxLifetime;
      const heightRatio = Math.max(0, (canvas.height - particle.y) / canvas.height);
      particle.opacity = (Math.random() * 0.4 + 0.5) * (1 - lifetimeRatio * 0.6) * Math.max(0.4, 1 - heightRatio * 0.8);

      if (particle.y < -50 || particle.opacity <= 0.08 || particle.lifetime > particle.maxLifetime) {
        Object.assign(particle, CANVAS_EFFECT_REGISTRY.coffee.createParticle({ canvas, index: particle.index }));
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        const baseOpacity = particle.opacity * opacityMultiplier;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, withAlpha(particle.color, baseOpacity));
        gradient.addColorStop(0.5, withAlpha(particle.color, baseOpacity * 0.55));
        gradient.addColorStop(1, withAlpha(particle.color, 0));

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size, particle.size * 0.7, 0, 0, TAU);
        ctx.fill();

        ctx.globalAlpha = baseOpacity * 0.35;
        ctx.beginPath();
        ctx.ellipse(particle.size * 0.3, -particle.size * 0.2, particle.size * 0.6, particle.size * 0.5, Math.PI / 6, 0, TAU);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(-particle.size * 0.2, particle.size * 0.3, particle.size * 0.5, particle.size * 0.6, -Math.PI / 4, 0, TAU);
        ctx.fill();
      });
    },
  },
  fireplace: {
    baseParticleCount: 90,
    performance: 'heavy',
    canvasOpacity: 0.82,
    createParticle: ({ canvas, index }) => {
      const particle = createBaseParticle(canvas, index);
      const tone = Math.random();

      if (tone < 0.3) {
        particle.color = pick(FIREPLACE_CORE_COLORS);
        particle.size = randomBetween(12, 32);
        particle.opacity = randomBetween(0.4, 1.1);
      } else if (tone < 0.7) {
        particle.color = pick(FIREPLACE_MID_COLORS);
        particle.size = randomBetween(15, 40);
        particle.opacity = randomBetween(0.3, 0.9);
      } else {
        particle.color = pick(FIREPLACE_OUTER_COLORS);
        particle.size = randomBetween(18, 48);
        particle.opacity = randomBetween(0.2, 0.7);
      }

      Object.assign(particle, {
        x: Math.random() * canvas.width,
        y: canvas.height + randomBetween(0, 30),
        speed: randomBetween(0.8, 2.8),
        flickerSpeed: randomBetween(0.08, 0.23),
        flickerOffset: Math.random() * TAU,
        flickerIntensity: randomBetween(0.3, 0.7),
        heatWave: randomBetween(0.5, 2),
        heatWaveSpeed: randomBetween(0.04, 0.12),
        lifetime: 0,
        maxLifetime: randomBetween(100, 250),
        rotation: Math.random() * 360,
        rotationSpeed: randomBetween(-1.5, 1.5) * 2,
      });

      return ensureParticleDefaults(particle);
    },
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.lifetime += 1;
      particle.y -= particle.speed * velocityMultiplier;

      const heatWaveX = Math.sin(particle.y * 0.03 + particle.lifetime * particle.heatWaveSpeed) * particle.heatWave;
      const heatWaveY = Math.cos(particle.y * 0.05 + particle.lifetime * particle.heatWaveSpeed * 0.8) * (particle.heatWave * 0.5);
      particle.x += heatWaveX * velocityMultiplier;
      particle.x += (canvas.width / 2 - particle.x) * 0.0004 * velocityMultiplier;

      const flickerPrimary = Math.sin(particle.lifetime * particle.flickerSpeed + particle.flickerOffset) * particle.flickerIntensity;
      const flickerSecondary = Math.cos(particle.lifetime * particle.flickerSpeed * 1.3 + particle.flickerOffset + 1) * (particle.flickerIntensity * 0.6);
      particle.opacity = clamp(particle.opacity + flickerPrimary + flickerSecondary, 0.2, 1);
      particle.rotation += particle.rotationSpeed + heatWaveY;

      const heightRatio = (canvas.height - particle.y) / canvas.height;
      particle.opacity *= Math.max(0.2, 1 - heightRatio * 0.7);

      if (particle.y < canvas.height * 0.3 || particle.lifetime > particle.maxLifetime) {
        Object.assign(particle, CANVAS_EFFECT_REGISTRY.fireplace.createParticle({ canvas, index: particle.index }));
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        const baseOpacity = particle.opacity * opacityMultiplier;
        const safeSize = Number.isFinite(particle.size) ? particle.size : 30;

        const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, safeSize * 1.5);
        outerGlow.addColorStop(0, withAlpha(particle.color, baseOpacity * 0.3));
        outerGlow.addColorStop(0.5, withAlpha(particle.color, baseOpacity * 0.15));
        outerGlow.addColorStop(1, withAlpha(particle.color, 0));
        ctx.fillStyle = outerGlow;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(0, 0, safeSize * 1.5, 0, TAU);
        ctx.fill();

        const flameGradient = ctx.createRadialGradient(0, safeSize * 0.3, 0, 0, -safeSize * 0.2, safeSize * 1.2);
        flameGradient.addColorStop(0, particle.color.includes('FFF') || particle.color.includes('FFD') ? '#FFFFFF' : '#FFD700');
        flameGradient.addColorStop(0.4, particle.color);
        flameGradient.addColorStop(1, particle.color.includes('DC1') || particle.color.includes('B22') ? '#8B0000' : particle.color);
        ctx.fillStyle = flameGradient;
        ctx.globalAlpha = baseOpacity;

        const flicker = Math.sin(particle.lifetime * 0.2) * 0.15;
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * (0.8 + flicker));
        ctx.bezierCurveTo(particle.size * 0.4, -particle.size * 0.9, particle.size * 0.5, -particle.size * 0.3, particle.size * 0.35, particle.size * 0.2);
        ctx.quadraticCurveTo(particle.size * 0.2, particle.size * 0.4, 0, particle.size * 0.3);
        ctx.quadraticCurveTo(-particle.size * 0.2, particle.size * 0.4, -particle.size * 0.35, particle.size * 0.2);
        ctx.bezierCurveTo(-particle.size * 0.5, -particle.size * 0.3, -particle.size * 0.4, -particle.size * 0.9, 0, -particle.size * (0.8 + flicker));
        ctx.fill();

        if (particle.color.includes('FFF') || particle.color.includes('FFD')) {
          const coreGradient = ctx.createRadialGradient(0, safeSize * 0.1, 0, 0, 0, safeSize * 0.4);
          coreGradient.addColorStop(0, `rgba(255, 255, 255, ${baseOpacity * 0.9})`);
          coreGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
          ctx.fillStyle = coreGradient;
          ctx.beginPath();
          ctx.arc(0, particle.size * 0.1, particle.size * 0.4, 0, TAU);
          ctx.fill();
        }
      });
    },
  },
  matrix: {
    baseParticleCount: 110,
    performance: 'heavy',
    canvasOpacity: 0.95,
    prepareFrame: ({ ctx, canvas, config, frame }) => {
      ctx.fillStyle = withAlpha('#020a05', 0.18 + ((config?.opacity ?? 1) * 0.08));
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ambientGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      ambientGradient.addColorStop(0, withAlpha(config?.color || '#00FF41', 0.04));
      ambientGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      ambientGradient.addColorStop(1, withAlpha('#001a0d', 0.08));
      ctx.fillStyle = ambientGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      for (let y = frame % 6; y < canvas.height; y += 6) {
        ctx.fillRect(0, y, canvas.width, 1);
      }
    },
    createParticle: createMatrixParticle,
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.y += particle.speed * particle.fontSize * 0.11 * velocityMultiplier;
      particle.flickerOffset += particle.glyphCycle;

      if (Math.random() > 0.78) {
        particle.trail.unshift(randomMatrixGlyph());
        particle.trail.length = particle.trailLength;
      }

      if (particle.y - particle.trailLength * particle.fontSize > canvas.height + 40) {
        resetMatrixParticle(particle, canvas);
      }
    },
    drawParticle: (particle, { ctx, config, opacityMultiplier }) => {
      const baseColor = config?.color || '#00FF41';
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.font = `${particle.fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let trailIndex = particle.trail.length - 1; trailIndex >= 0; trailIndex -= 1) {
          const glyph = particle.trail[trailIndex];
          const glyphY = -trailIndex * particle.fontSize * 0.92;
          const trailProgress = 1 - (trailIndex / particle.trail.length);
          const alpha = clamp((1 - trailIndex / (particle.trail.length + 2)) * 0.9, 0.05, 1);

          ctx.shadowBlur = trailIndex === 0 ? 18 : 10 * trailProgress;
          ctx.shadowColor = trailIndex === 0 ? withAlpha('#C8FFE3', 0.8) : withAlpha(baseColor, 0.5 * trailProgress);
          ctx.fillStyle = trailIndex === 0
            ? '#ECFFF4'
            : withAlpha(baseColor, alpha * (0.25 + trailProgress * 0.65));

          ctx.fillText(glyph, 0, glyphY);
        }
      }, { skipRotation: true });
    },
  },
  starfield: {
    baseParticleCount: 90,
    performance: 'medium',
    canvasOpacity: 0.88,
    prepareFrame: ({ ctx, canvas, config }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const haze = ctx.createRadialGradient(canvas.width * 0.8, canvas.height * 0.1, 0, canvas.width * 0.8, canvas.height * 0.1, canvas.width * 0.9);
      haze.addColorStop(0, withAlpha(config?.color || '#8AB4FF', 0.09));
      haze.addColorStop(0.55, withAlpha(config?.color || '#8AB4FF', 0.03));
      haze.addColorStop(1, withAlpha('#020817', 0));
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const vignette = ctx.createLinearGradient(0, 0, 0, canvas.height);
      vignette.addColorStop(0, 'rgba(4, 8, 18, 0.12)');
      vignette.addColorStop(0.5, 'rgba(4, 8, 18, 0.02)');
      vignette.addColorStop(1, 'rgba(4, 8, 18, 0.16)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    createParticle: createStarfieldParticle,
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      if (particle.isComet) {
        particle.x += particle.speed * velocityMultiplier;
        particle.y += particle.speed * particle.angle * velocityMultiplier;
        particle.opacity *= 0.996;

        if (particle.x > canvas.width + particle.tailLength || particle.y > canvas.height + particle.tailLength || particle.opacity < 0.2) {
          resetStarfieldParticle(particle, canvas);
        }
        return;
      }

      particle.twinkleOffset += particle.twinkleSpeed;
      particle.x += particle.speed * velocityMultiplier;
      particle.y += particle.speed * 0.08 * velocityMultiplier;

      if (particle.x > canvas.width + 20 || particle.y > canvas.height + 20) {
        resetStarfieldParticle(particle, canvas);
        particle.x = -10;
        particle.y = Math.random() * canvas.height;
      }
    },
    drawParticle: (particle, { ctx, config, opacityMultiplier }) => {
      const starColor = config?.color || '#8AB4FF';

      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        if (particle.isComet) {
          ctx.strokeStyle = withAlpha(starColor, 0.6);
          ctx.lineWidth = particle.size;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 16;
          ctx.shadowColor = withAlpha('#FFFFFF', 0.75);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-particle.tailLength, -particle.tailLength * particle.angle * 0.9);
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * 1.2, 0, TAU);
          ctx.fill();
          return;
        }

        const twinkle = (Math.sin(particle.twinkleOffset) + 1) / 2;
        const radius = particle.size * (0.7 + twinkle * 0.35);
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 3.5);
        glow.addColorStop(0, withAlpha('#FFFFFF', 0.75));
        glow.addColorStop(0.35, withAlpha(starColor, 0.35));
        glow.addColorStop(1, withAlpha(starColor, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 3.5, 0, TAU);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.fill();

        if (particle.depth > 0.75 && twinkle > 0.72) {
          ctx.strokeStyle = withAlpha('#FFFFFF', 0.45);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-radius * 2, 0);
          ctx.lineTo(radius * 2, 0);
          ctx.moveTo(0, -radius * 2);
          ctx.lineTo(0, radius * 2);
          ctx.stroke();
        }
      }, { skipRotation: true });
    },
  },
};

export const getCanvasEffect = (type) => CANVAS_EFFECT_REGISTRY[type] || null;

export const getCanvasOpacity = (type) => {
  const effect = getCanvasEffect(type);
  return effect?.canvasOpacity ?? 0.6;
};

export const getCanvasQuality = (type, width, height) => {
  const effect = getCanvasEffect(type);
  const viewportWidth = width || window.innerWidth;
  const viewportHeight = height || window.innerHeight;
  const viewportArea = Math.max(1, viewportWidth * viewportHeight);
  const baselineArea = 1280 * 720;
  const densityScale = Math.max(0.45, Math.min(1, Math.sqrt(baselineArea / viewportArea)));
  const prefersReducedMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let effectScale = 1;
  let targetFPS = 30;

  if (prefersReducedMotion) {
    effectScale = 0.6;
    targetFPS = 12;
  } else if (effect?.performance === 'heavy') {
    effectScale = 0.72;
    targetFPS = 18;
  } else if (effect?.performance === 'medium') {
    effectScale = 0.85;
    targetFPS = 24;
  }

  const particleCount = Math.max(
    12,
    Math.round((effect?.baseParticleCount || 50) * densityScale * effectScale)
  );

  return {
    particleCount,
    targetFPS,
    viewportWidth,
    viewportHeight,
  };
};