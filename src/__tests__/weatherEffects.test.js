import {
  DEFAULT_WEATHER_CONFIG,
  WEATHER_EFFECT_OPTIONS,
  getWeatherEffect,
  getWeatherEffectLabel,
} from '../utils/weatherEffects';
import {
  getCanvasEffect,
  getCanvasQuality,
} from '../components/weather-effects/canvasEffects';

describe('weatherEffects catalog', () => {
  test('exposes shared effect options without leaking default config internals', () => {
    const matrix = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'matrix');
    const starfield = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'starfield');

    expect(matrix).toBeDefined();
    expect(matrix.name).toBe('Matrix');
    expect(matrix).not.toHaveProperty('defaultConfig');

    expect(starfield).toBeDefined();
    expect(starfield.description).toContain('comets');
    expect(starfield.renderer).toBe('canvas');
  });

  test('builds default config for every effect from the shared catalog', () => {
    expect(DEFAULT_WEATHER_CONFIG.none).toEqual({ color: '#FFFFFF', opacity: 0, velocity: 1 });
    expect(DEFAULT_WEATHER_CONFIG.matrix).toEqual({ color: '#00FF41', opacity: 0.82, velocity: 1 });
    expect(DEFAULT_WEATHER_CONFIG.starfield).toEqual({ color: '#8AB4FF', opacity: 0.78, velocity: 1 });
  });

  test('returns shared labels and a safe fallback for unknown effects', () => {
    expect(getWeatherEffectLabel('sakura')).toBe('Cherry Blossoms');
    expect(getWeatherEffect('missing-effect').id).toBe('none');
    expect(getWeatherEffectLabel('missing-effect')).toBe('None');
  });
});

describe('canvas weather effect registry', () => {
  test('contains modular definitions for matrix and starfield', () => {
    const matrix = getCanvasEffect('matrix');
    const starfield = getCanvasEffect('starfield');

    expect(matrix).toBeDefined();
    expect(typeof matrix.createParticle).toBe('function');
    expect(typeof matrix.updateParticle).toBe('function');
    expect(typeof matrix.drawParticle).toBe('function');

    expect(starfield).toBeDefined();
    expect(typeof starfield.prepareFrame).toBe('function');
  });

  test('derives reduced particle quality rules from effect performance', () => {
    const matrixQuality = getCanvasQuality('matrix', 1920, 1080);
    const starfieldQuality = getCanvasQuality('starfield', 1280, 720);

    expect(matrixQuality.targetFPS).toBe(18);
    expect(matrixQuality.particleCount).toBeGreaterThanOrEqual(12);
    expect(starfieldQuality.targetFPS).toBe(24);
    expect(starfieldQuality.viewportWidth).toBe(1280);
    expect(starfieldQuality.viewportHeight).toBe(720);
  });
});