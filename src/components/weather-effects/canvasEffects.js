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
const MIST_COLORS = ['#D8E3EA', '#C9D7DE', '#E4EEF3'];
const DUST_COLORS = ['#F5D9A8', '#F0C98C', '#FFE8BF'];
const EMBER_COLORS = ['#FF6B35', '#FF8A3D', '#FFC15E', '#FFD166'];
const CONFETTI_COLORS = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FF66C4', '#2EC4B6'];
const TEMPLE_GARDEN_COLORS = ['#7BCF96', '#9AE6B4', '#CFEED6', '#F5C7D9', '#F7E27B'];
const CABIN_EMBER_COLORS = ['#FF7A3D', '#FFAA5C', '#FFD166'];

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

const drawSoftGlow = (ctx, radius, color, options = {}) => {
  const {
    stretchX = 1,
    stretchY = 1,
    innerAlpha = 0.72,
    midAlpha = 0.28,
    outerAlpha = 0,
    haloScale = 2.4,
  } = options;

  ctx.save();
  ctx.scale(stretchX, stretchY);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * haloScale);
  gradient.addColorStop(0, withAlpha(color, innerAlpha));
  gradient.addColorStop(0.45, withAlpha(color, midAlpha));
  gradient.addColorStop(1, withAlpha(color, outerAlpha));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius * haloScale, 0, TAU);
  ctx.fill();
  ctx.restore();
};

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
};

const drawPetalShape = (ctx, size, color, accentColor = '#FFFFFF') => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.72, -size * 0.4, size * 0.58, size * 0.92, 0, size * 1.08);
  ctx.bezierCurveTo(-size * 0.58, size * 0.92, -size * 0.72, -size * 0.4, 0, -size);
  ctx.fill();

  ctx.strokeStyle = withAlpha(accentColor, 0.35);
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.72);
  ctx.quadraticCurveTo(size * 0.08, size * 0.12, 0, size * 0.82);
  ctx.stroke();
};

const drawLeafShape = (ctx, size, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.05);
  ctx.quadraticCurveTo(size * 0.9, -size * 0.2, size * 0.34, size * 1.1);
  ctx.quadraticCurveTo(-size * 0.72, size * 0.56, 0, -size * 1.05);
  ctx.fill();

  ctx.strokeStyle = withAlpha('#2B5D47', 0.45);
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.8);
  ctx.lineTo(0, size * 0.82);
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(size * 0.36, size * 0.12);
  ctx.stroke();
};

const createSoftOrbFieldEffect = ({
  baseParticleCount,
  performance = 'medium',
  canvasOpacity = 0.72,
  colors,
  sizeRange,
  opacityRange,
  driftXRange,
  driftYRange,
  stretchRange,
  haloScale = 2.4,
  wrapPadding = 140,
  blendMode = 'screen',
  prepareFrame,
}) => {
  const seedParticle = (particle, canvas, { wrapFromX = null, wrapFromY = null } = {}) => {
    const depth = randomBetween(0.35, 1);
    const particleSize = randomBetween(sizeRange[0], sizeRange[1]) * (0.65 + depth * 0.45);

    particle.depth = depth;
    particle.size = particleSize;
    particle.opacity = randomBetween(opacityRange[0], opacityRange[1]);
    particle.color = pick(colors);
    particle.driftX = randomBetween(driftXRange[0], driftXRange[1]) * (0.5 + depth * 0.8);
    particle.driftY = randomBetween(driftYRange[0], driftYRange[1]) * (0.5 + depth * 0.8);
    particle.stretchX = randomBetween(stretchRange[0], stretchRange[1]);
    particle.stretchY = randomBetween(stretchRange[0] * 0.7, stretchRange[1] * 0.95);
    particle.pulseOffset = Math.random() * TAU;
    particle.pulseSpeed = randomBetween(0.006, 0.02);
    particle.swayAmplitude = randomBetween(0.05, 0.35) * particleSize;
    particle.swaySpeed = randomBetween(0.005, 0.018);
    particle.x = wrapFromX ?? randomBetween(-wrapPadding, canvas.width + wrapPadding);
    particle.y = wrapFromY ?? randomBetween(-wrapPadding, canvas.height + wrapPadding);
    return particle;
  };

  return {
    baseParticleCount,
    performance,
    canvasOpacity,
    prepareFrame,
    createParticle: ({ canvas, index }) => seedParticle(createBaseParticle(canvas, index), canvas),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.pulseOffset += particle.pulseSpeed;
      particle.x += (particle.driftX + Math.sin(particle.pulseOffset + particle.swayOffset) * particle.swayAmplitude * 0.06) * velocityMultiplier;
      particle.y += (particle.driftY + Math.cos(particle.pulseOffset * 0.8 + particle.swayOffset) * particle.swayAmplitude * 0.035) * velocityMultiplier;

      const margin = particle.size * Math.max(particle.stretchX, particle.stretchY) * haloScale + wrapPadding;

      if (particle.x > canvas.width + margin) seedParticle(particle, canvas, { wrapFromX: -margin });
      if (particle.x < -margin) seedParticle(particle, canvas, { wrapFromX: canvas.width + margin });
      if (particle.y > canvas.height + margin) seedParticle(particle, canvas, { wrapFromY: -margin });
      if (particle.y < -margin) seedParticle(particle, canvas, { wrapFromY: canvas.height + margin });
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      const pulseScale = 0.84 + ((Math.sin(particle.pulseOffset) + 1) * 0.16);

      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.globalCompositeOperation = blendMode;
        drawSoftGlow(ctx, particle.size * pulseScale, particle.color, {
          stretchX: particle.stretchX,
          stretchY: particle.stretchY,
          haloScale,
        });
        ctx.globalCompositeOperation = 'source-over';
      }, { skipRotation: true });
    },
  };
};

const createSparkUpdraftEffect = ({
  baseParticleCount,
  performance = 'medium',
  canvasOpacity = 0.76,
  colors,
  prepareFrame,
}) => {
  const seedParticle = (particle, canvas) => {
    particle.x = randomBetween(canvas.width * 0.08, canvas.width * 0.92);
    particle.y = canvas.height + randomBetween(0, canvas.height * 0.2);
    particle.size = randomBetween(1.6, 4.8);
    particle.opacity = randomBetween(0.35, 0.95);
    particle.speed = randomBetween(0.7, 2.2);
    particle.color = pick(colors);
    particle.horizontalDrift = randomBetween(-0.5, 0.5);
    particle.swayAmplitude = randomBetween(0.4, 1.6);
    particle.glowSize = randomBetween(8, 18);
    particle.tailLength = randomBetween(6, 20);
    particle.flickerOffset = Math.random() * TAU;
    particle.flickerSpeed = randomBetween(0.04, 0.12);
    return particle;
  };

  return {
    baseParticleCount,
    performance,
    canvasOpacity,
    prepareFrame,
    createParticle: ({ canvas, index }) => seedParticle(createBaseParticle(canvas, index), canvas),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.flickerOffset += particle.flickerSpeed;
      particle.y -= particle.speed * velocityMultiplier;
      particle.x += (particle.horizontalDrift + Math.sin(particle.flickerOffset + particle.swayOffset) * particle.swayAmplitude * 0.08) * velocityMultiplier;
      particle.opacity *= 0.996;

      if (particle.y < -particle.glowSize || particle.opacity < 0.12) {
        seedParticle(particle, canvas);
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      const flicker = 0.76 + ((Math.sin(particle.flickerOffset) + 1) * 0.14);

      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = withAlpha(particle.color, 0.35);
        ctx.lineWidth = Math.max(1, particle.size * 0.6);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, particle.tailLength * 0.5);
        ctx.lineTo(0, -particle.tailLength);
        ctx.stroke();

        drawSoftGlow(ctx, particle.size * flicker, particle.color, {
          stretchX: 0.9,
          stretchY: 1.4,
          haloScale: particle.glowSize / Math.max(1, particle.size),
        });

        ctx.fillStyle = '#FFF8E8';
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.5, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }, { skipRotation: true });
    },
  };
};

const createRainSheetEffect = ({
  baseParticleCount,
  performance = 'heavy',
  canvasOpacity = 0.72,
  prepareFrame,
  mode = 'sheet',
  strokeColor = '#7CB8FF',
  velocityScale = 1,
}) => {
  const seedParticle = (particle, canvas) => {
    particle.x = randomBetween(-40, canvas.width + 40);
    particle.y = randomBetween(-canvas.height, canvas.height);
    particle.speed = randomBetween(mode === 'glass' ? 1.2 : 8, mode === 'glass' ? 3.4 : 14) * velocityScale;
    particle.length = randomBetween(mode === 'glass' ? 16 : 18, mode === 'glass' ? 42 : 46);
    particle.size = randomBetween(mode === 'glass' ? 1.4 : 0.8, mode === 'glass' ? 2.8 : 1.8);
    particle.opacity = randomBetween(mode === 'glass' ? 0.18 : 0.28, mode === 'glass' ? 0.58 : 0.78);
    particle.slant = randomBetween(-0.08, 0.14);
    particle.wobble = Math.random() * TAU;
    particle.wobbleSpeed = randomBetween(0.02, 0.08);
    particle.highlight = Math.random() > 0.7;
    return particle;
  };

  return {
    baseParticleCount,
    performance,
    canvasOpacity,
    prepareFrame,
    createParticle: ({ canvas, index }) => seedParticle(createBaseParticle(canvas, index), canvas),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.wobble += particle.wobbleSpeed;
      particle.y += particle.speed * velocityMultiplier;
      particle.x += (particle.slant + Math.sin(particle.wobble) * (mode === 'glass' ? 0.22 : 0.04)) * particle.speed * 0.18 * velocityMultiplier;

      if (particle.y > canvas.height + particle.length) {
        seedParticle(particle, canvas);
        particle.y = -randomBetween(16, canvas.height * 0.2);
      }

      if (particle.x < -80) particle.x = canvas.width + 30;
      if (particle.x > canvas.width + 80) particle.x = -30;
    },
    drawParticle: (particle, { ctx, config, opacityMultiplier }) => {
      const color = config?.color || strokeColor;

      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        if (mode === 'glass') {
          const trailGradient = ctx.createLinearGradient(0, -particle.length, 0, particle.length * 0.35);
          trailGradient.addColorStop(0, withAlpha(color, 0));
          trailGradient.addColorStop(0.35, withAlpha(color, 0.08));
          trailGradient.addColorStop(1, withAlpha(color, particle.highlight ? 0.75 : 0.45));
          ctx.strokeStyle = trailGradient;
          ctx.lineWidth = particle.size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, -particle.length * 0.9);
          ctx.lineTo(0, particle.length * 0.3);
          ctx.stroke();

          ctx.fillStyle = withAlpha('#F4FBFF', particle.highlight ? 0.85 : 0.6);
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size * 1.5, particle.size * 2.4, 0, 0, TAU);
          ctx.fill();

          const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.length * 0.7);
          glow.addColorStop(0, withAlpha(color, 0.12));
          glow.addColorStop(1, withAlpha(color, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, particle.length * 0.7, 0, TAU);
          ctx.fill();
          return;
        }

        ctx.strokeStyle = withAlpha(color, particle.highlight ? 0.82 : 0.58);
        ctx.lineWidth = particle.size;
        ctx.lineCap = 'round';
        ctx.shadowColor = withAlpha(color, 0.28);
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(particle.length * particle.slant, particle.length);
        ctx.stroke();
      }, { skipRotation: true });
    },
  };
};

const createConfettiFieldEffect = ({
  baseParticleCount,
  performance = 'medium',
  canvasOpacity = 0.84,
  prepareFrame,
}) => {
  const seedParticle = (particle, canvas) => {
    particle.x = randomBetween(-40, canvas.width + 40);
    particle.y = randomBetween(-canvas.height, canvas.height * 0.2);
    particle.size = randomBetween(8, 18);
    particle.width = particle.size * randomBetween(0.4, 1);
    particle.height = particle.size * randomBetween(0.8, 1.8);
    particle.color = pick(CONFETTI_COLORS);
    particle.speed = randomBetween(1.4, 3.8);
    particle.opacity = randomBetween(0.45, 0.95);
    particle.rotation = randomBetween(0, 360);
    particle.rotationSpeed = randomBetween(-3.2, 3.2);
    particle.swayAmplitude = randomBetween(0.4, 2.2);
    particle.swaySpeed = randomBetween(0.02, 0.08);
    particle.flipOffset = Math.random() * TAU;
    particle.flipSpeed = randomBetween(0.06, 0.16);
    particle.shape = Math.random() > 0.72 ? 'streamer' : 'card';
    return particle;
  };

  return {
    baseParticleCount,
    performance,
    canvasOpacity,
    prepareFrame,
    createParticle: ({ canvas, index }) => seedParticle(createBaseParticle(canvas, index), canvas),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      particle.flipOffset += particle.flipSpeed;
      particle.rotation += particle.rotationSpeed * velocityMultiplier;
      particle.y += particle.speed * velocityMultiplier;
      particle.x += Math.sin(particle.flipOffset + particle.swayOffset) * particle.swayAmplitude * velocityMultiplier;

      if (particle.y > canvas.height + particle.height * 2) {
        seedParticle(particle, canvas);
        particle.y = -randomBetween(12, canvas.height * 0.15);
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      const flipScale = Math.cos(particle.flipOffset);

      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        ctx.shadowColor = withAlpha(particle.color, 0.25);
        ctx.shadowBlur = 8;
        ctx.fillStyle = particle.color;

        if (particle.shape === 'streamer') {
          drawRoundedRect(ctx, -particle.width * 0.3, -particle.height * 0.5, particle.width * 0.6, particle.height * 1.2, particle.width * 0.22);
          ctx.fill();

          ctx.strokeStyle = withAlpha('#FFF9E8', 0.35);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, particle.height * 0.2);
          ctx.lineTo(0, particle.height * 0.95);
          ctx.stroke();
          return;
        }

        ctx.scale(1, 0.25 + Math.abs(flipScale) * 0.9);
        drawRoundedRect(ctx, -particle.width / 2, -particle.height / 2, particle.width, particle.height, particle.width * 0.28);
        ctx.fill();

        ctx.fillStyle = withAlpha('#FFFFFF', 0.22);
        drawRoundedRect(ctx, -particle.width / 2, -particle.height / 2, particle.width, particle.height * 0.3, particle.width * 0.2);
        ctx.fill();
      });
    },
  };
};

const createTempleGardenEffect = () => {
  const seedParticle = (particle, canvas) => {
    const tone = Math.random();
    particle.type = tone < 0.46 ? 'leaf' : tone < 0.8 ? 'petal' : 'glow';
    particle.x = randomBetween(-40, canvas.width + 40);
    particle.y = randomBetween(-canvas.height * 0.2, canvas.height + 20);
    particle.rotation = randomBetween(0, 360);
    particle.rotationSpeed = randomBetween(-1.4, 1.4);

    if (particle.type === 'glow') {
      particle.size = randomBetween(1.2, 3.8);
      particle.speed = randomBetween(0.08, 0.24);
      particle.opacity = randomBetween(0.4, 0.95);
      particle.color = pick(['#E8FF88', '#F7E27B', '#B6FFBA']);
      particle.driftX = randomBetween(-0.2, 0.2);
      particle.driftY = randomBetween(-0.05, 0.15);
      particle.twinkleOffset = Math.random() * TAU;
      particle.twinkleSpeed = randomBetween(0.03, 0.08);
      return particle;
    }

    particle.size = randomBetween(8, particle.type === 'leaf' ? 16 : 12);
    particle.speed = randomBetween(0.18, 0.8);
    particle.opacity = randomBetween(0.35, 0.85);
    particle.color = particle.type === 'leaf'
      ? pick(TEMPLE_GARDEN_COLORS.slice(0, 3))
      : pick(TEMPLE_GARDEN_COLORS.slice(3));
    particle.swayAmplitude = randomBetween(0.6, 2.2);
    particle.swaySpeed = randomBetween(0.01, 0.03);
    return particle;
  };

  return {
    baseParticleCount: 60,
    performance: 'medium',
    canvasOpacity: 0.7,
    prepareFrame: ({ ctx, canvas, config }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const canopy = ctx.createLinearGradient(0, 0, 0, canvas.height);
      canopy.addColorStop(0, withAlpha('#173322', 0.18));
      canopy.addColorStop(0.45, withAlpha(config?.color || '#8FD8A7', 0.06));
      canopy.addColorStop(1, withAlpha('#0A140F', 0.12));
      ctx.fillStyle = canopy;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const lanternGlow = ctx.createRadialGradient(canvas.width * 0.78, canvas.height * 0.18, 0, canvas.width * 0.78, canvas.height * 0.18, canvas.width * 0.22);
      lanternGlow.addColorStop(0, withAlpha('#F5E7A4', 0.12));
      lanternGlow.addColorStop(1, withAlpha('#F5E7A4', 0));
      ctx.fillStyle = lanternGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    createParticle: ({ canvas, index }) => seedParticle(createBaseParticle(canvas, index), canvas),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      if (particle.type === 'glow') {
        particle.twinkleOffset += particle.twinkleSpeed;
        particle.x += (particle.driftX + Math.sin(particle.twinkleOffset + particle.swayOffset) * 0.2) * velocityMultiplier;
        particle.y += (particle.driftY + Math.cos(particle.twinkleOffset * 0.8) * 0.12) * velocityMultiplier;

        if (particle.x < -30 || particle.x > canvas.width + 30 || particle.y < -30 || particle.y > canvas.height + 30) {
          seedParticle(particle, canvas);
        }
        return;
      }

      particle.y += particle.speed * velocityMultiplier;
      particle.x += Math.sin(particle.y * particle.swaySpeed + particle.swayOffset) * particle.swayAmplitude * velocityMultiplier;
      particle.rotation += particle.rotationSpeed * velocityMultiplier;

      if (particle.y > canvas.height + 40) {
        seedParticle(particle, canvas);
        particle.y = -randomBetween(20, canvas.height * 0.18);
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      if (particle.type === 'glow') {
        const twinkle = 0.82 + ((Math.sin(particle.twinkleOffset) + 1) * 0.12);
        drawAtParticle(ctx, particle, opacityMultiplier, () => {
          ctx.globalCompositeOperation = 'screen';
          drawSoftGlow(ctx, particle.size * twinkle, particle.color, {
            stretchX: 1,
            stretchY: 1,
            haloScale: 5,
          });
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * 0.45, 0, TAU);
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }, { skipRotation: true });
        return;
      }

      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        if (particle.type === 'leaf') {
          drawLeafShape(ctx, particle.size, particle.color);
          return;
        }

        drawPetalShape(ctx, particle.size, particle.color, '#FFF7FB');
      });
    },
  };
};

const createAlpineCabinEffect = () => {
  const seedParticle = (particle, canvas) => {
    particle.type = Math.random() > 0.28 ? 'snow' : 'ember';
    particle.x = randomBetween(-20, canvas.width + 20);
    particle.rotation = randomBetween(0, 360);
    particle.rotationSpeed = randomBetween(-0.8, 0.8);

    if (particle.type === 'snow') {
      particle.y = randomBetween(-canvas.height, canvas.height * 0.4);
      particle.size = randomBetween(1.4, 4.8);
      particle.speed = randomBetween(0.25, 0.9);
      particle.opacity = randomBetween(0.35, 0.88);
      particle.color = '#F8FCFF';
      particle.swayAmplitude = randomBetween(0.6, 1.8);
      particle.swaySpeed = randomBetween(0.01, 0.03);
      return particle;
    }

    particle.y = canvas.height + randomBetween(0, canvas.height * 0.12);
    particle.size = randomBetween(1.2, 3.6);
    particle.speed = randomBetween(0.4, 1.5);
    particle.opacity = randomBetween(0.25, 0.8);
    particle.color = pick(CABIN_EMBER_COLORS);
    particle.flickerOffset = Math.random() * TAU;
    particle.flickerSpeed = randomBetween(0.04, 0.11);
    particle.horizontalDrift = randomBetween(-0.3, 0.3);
    return particle;
  };

  return {
    baseParticleCount: 76,
    performance: 'heavy',
    canvasOpacity: 0.74,
    prepareFrame: ({ ctx, canvas, config }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const night = ctx.createLinearGradient(0, 0, 0, canvas.height);
      night.addColorStop(0, withAlpha('#07111D', 0.18));
      night.addColorStop(0.55, withAlpha(config?.color || '#B9D9FF', 0.06));
      night.addColorStop(1, withAlpha('#04070D', 0.14));
      ctx.fillStyle = night;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const hearth = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.96, 0, canvas.width * 0.5, canvas.height * 0.96, canvas.width * 0.28);
      hearth.addColorStop(0, withAlpha('#FFB46B', 0.16));
      hearth.addColorStop(0.45, withAlpha('#FF7A3D', 0.08));
      hearth.addColorStop(1, withAlpha('#FF7A3D', 0));
      ctx.fillStyle = hearth;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    createParticle: ({ canvas, index }) => seedParticle(createBaseParticle(canvas, index), canvas),
    updateParticle: (particle, { canvas, velocityMultiplier }) => {
      if (particle.type === 'snow') {
        particle.y += particle.speed * velocityMultiplier;
        particle.x += Math.sin(particle.y * particle.swaySpeed + particle.swayOffset) * particle.swayAmplitude * velocityMultiplier;
        particle.rotation += particle.rotationSpeed;

        if (particle.y > canvas.height + particle.size) {
          seedParticle(particle, canvas);
          particle.type = 'snow';
          particle.y = -randomBetween(20, canvas.height * 0.15);
        }
        return;
      }

      particle.flickerOffset += particle.flickerSpeed;
      particle.y -= particle.speed * velocityMultiplier;
      particle.x += (particle.horizontalDrift + Math.sin(particle.flickerOffset + particle.swayOffset) * 0.18) * velocityMultiplier;
      particle.opacity *= 0.994;

      if (particle.y < canvas.height * 0.35 || particle.opacity < 0.1) {
        seedParticle(particle, canvas);
        particle.type = 'ember';
      }
    },
    drawParticle: (particle, { ctx, opacityMultiplier }) => {
      drawAtParticle(ctx, particle, opacityMultiplier, () => {
        if (particle.type === 'snow') {
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * 0.5, 0, TAU);
          ctx.fill();

          const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
          glow.addColorStop(0, withAlpha(particle.color, 0.28));
          glow.addColorStop(1, withAlpha(particle.color, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * 2, 0, TAU);
          ctx.fill();
          return;
        }

        ctx.globalCompositeOperation = 'screen';
        drawSoftGlow(ctx, particle.size, particle.color, {
          stretchX: 0.9,
          stretchY: 1.6,
          haloScale: 5,
        });
        ctx.fillStyle = '#FFF8E8';
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.35, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }, { skipRotation: particle.type !== 'snow' });
    },
  };
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
  mist: createSoftOrbFieldEffect({
    baseParticleCount: 30,
    performance: 'medium',
    canvasOpacity: 0.64,
    colors: MIST_COLORS,
    sizeRange: [34, 92],
    opacityRange: [0.12, 0.32],
    driftXRange: [0.03, 0.14],
    driftYRange: [-0.01, 0.04],
    stretchRange: [1.6, 3.1],
    haloScale: 2.8,
    prepareFrame: ({ ctx, canvas, config }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const haze = ctx.createLinearGradient(0, 0, 0, canvas.height);
      haze.addColorStop(0, withAlpha('#15222B', 0.12));
      haze.addColorStop(0.5, withAlpha(config?.color || '#D8E3EA', 0.05));
      haze.addColorStop(1, withAlpha('#0F161C', 0.08));
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const sideGlow = ctx.createRadialGradient(canvas.width * 0.14, canvas.height * 0.36, 0, canvas.width * 0.14, canvas.height * 0.36, canvas.width * 0.42);
      sideGlow.addColorStop(0, withAlpha(config?.color || '#D8E3EA', 0.08));
      sideGlow.addColorStop(1, withAlpha(config?.color || '#D8E3EA', 0));
      ctx.fillStyle = sideGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
  }),
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
  'rain-glass': createRainSheetEffect({
    baseParticleCount: 82,
    performance: 'heavy',
    canvasOpacity: 0.68,
    mode: 'glass',
    strokeColor: '#8FC3FF',
    prepareFrame: ({ ctx, canvas, config, frame }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const atmosphere = ctx.createLinearGradient(0, 0, 0, canvas.height);
      atmosphere.addColorStop(0, withAlpha('#07111D', 0.14));
      atmosphere.addColorStop(0.58, withAlpha('#102130', 0.1));
      atmosphere.addColorStop(1, withAlpha('#05080D', 0.18));
      ctx.fillStyle = atmosphere;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const reflection = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      reflection.addColorStop(0, withAlpha(config?.color || '#8FC3FF', 0.1));
      reflection.addColorStop(0.35, withAlpha('#FFFFFF', 0.04));
      reflection.addColorStop(1, withAlpha('#FFFFFF', 0));
      ctx.fillStyle = reflection;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
      for (let x = frame % 28; x < canvas.width; x += 28) {
        ctx.fillRect(x, 0, 1, canvas.height);
      }
    },
  }),
  'dust-motes': createSoftOrbFieldEffect({
    baseParticleCount: 44,
    performance: 'medium',
    canvasOpacity: 0.58,
    colors: DUST_COLORS,
    sizeRange: [1.2, 4.8],
    opacityRange: [0.18, 0.6],
    driftXRange: [-0.05, 0.08],
    driftYRange: [-0.02, 0.05],
    stretchRange: [1, 1.3],
    haloScale: 5.2,
    prepareFrame: ({ ctx, canvas, config }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const beam = ctx.createLinearGradient(canvas.width * 0.12, 0, canvas.width * 0.72, canvas.height);
      beam.addColorStop(0, withAlpha(config?.color || '#F5D9A8', 0.22));
      beam.addColorStop(0.35, withAlpha(config?.color || '#F5D9A8', 0.08));
      beam.addColorStop(0.7, withAlpha('#FFFFFF', 0.02));
      beam.addColorStop(1, withAlpha('#FFFFFF', 0));
      ctx.fillStyle = beam;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ambient = ctx.createRadialGradient(canvas.width * 0.2, canvas.height * 0.12, 0, canvas.width * 0.2, canvas.height * 0.12, canvas.width * 0.36);
      ambient.addColorStop(0, withAlpha('#FFF0C7', 0.12));
      ambient.addColorStop(1, withAlpha('#FFF0C7', 0));
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
  }),
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
  'ember-drift': createSparkUpdraftEffect({
    baseParticleCount: 52,
    performance: 'medium',
    canvasOpacity: 0.72,
    colors: EMBER_COLORS,
    prepareFrame: ({ ctx, canvas, config }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const night = ctx.createLinearGradient(0, 0, 0, canvas.height);
      night.addColorStop(0, withAlpha('#120A08', 0.1));
      night.addColorStop(0.6, withAlpha('#1A0F0B', 0.06));
      night.addColorStop(1, withAlpha('#050303', 0.16));
      ctx.fillStyle = night;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const hearthGlow = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.98, 0, canvas.width * 0.5, canvas.height * 0.98, canvas.width * 0.34);
      hearthGlow.addColorStop(0, withAlpha(config?.color || '#FF8A3D', 0.18));
      hearthGlow.addColorStop(0.45, withAlpha('#FF6B35', 0.08));
      hearthGlow.addColorStop(1, withAlpha('#FF6B35', 0));
      ctx.fillStyle = hearthGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
  }),
  'monsoon-veranda': createRainSheetEffect({
    baseParticleCount: 132,
    performance: 'heavy',
    canvasOpacity: 0.72,
    mode: 'sheet',
    strokeColor: '#7CB8FF',
    velocityScale: 0.96,
    prepareFrame: ({ ctx, canvas, config }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const storm = ctx.createLinearGradient(0, 0, 0, canvas.height);
      storm.addColorStop(0, withAlpha('#0A1523', 0.16));
      storm.addColorStop(0.5, withAlpha('#102030', 0.1));
      storm.addColorStop(1, withAlpha('#081018', 0.18));
      ctx.fillStyle = storm;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const verandaGlow = ctx.createRadialGradient(canvas.width * 0.82, canvas.height * 0.88, 0, canvas.width * 0.82, canvas.height * 0.88, canvas.width * 0.26);
      verandaGlow.addColorStop(0, withAlpha('#FFC07A', 0.16));
      verandaGlow.addColorStop(0.45, withAlpha(config?.color || '#7CB8FF', 0.08));
      verandaGlow.addColorStop(1, withAlpha('#FFC07A', 0));
      ctx.fillStyle = verandaGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
  }),
  'alpine-cabin': createAlpineCabinEffect(),
  'temple-garden': createTempleGardenEffect(),
  'festival-confetti': createConfettiFieldEffect({
    baseParticleCount: 68,
    performance: 'medium',
    canvasOpacity: 0.8,
    prepareFrame: ({ ctx, canvas, config }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const celebrationGlow = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.16, 0, canvas.width * 0.5, canvas.height * 0.16, canvas.width * 0.48);
      celebrationGlow.addColorStop(0, withAlpha(config?.color || '#FF5F5F', 0.12));
      celebrationGlow.addColorStop(0.45, withAlpha('#FFD166', 0.08));
      celebrationGlow.addColorStop(1, withAlpha('#FFD166', 0));
      ctx.fillStyle = celebrationGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const wash = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      wash.addColorStop(0, withAlpha('#FFFFFF', 0.03));
      wash.addColorStop(1, withAlpha('#FFFFFF', 0));
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
  }),
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