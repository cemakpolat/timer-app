import {
  DEFAULT_WEATHER_CONFIG,
  WEATHER_ART_DIRECTIONS,
  WEATHER_EFFECT_CATEGORIES,
  WEATHER_EFFECT_OPTIONS,
  getWeatherArtDirectionLabel,
  getWeatherEffect,
  getWeatherEffectLabel,
  getWeatherEffectsByArtDirection,
  getWeatherEffectsByCategory,
} from '../utils/weatherEffects';
import {
  getCanvasEffect,
  getCanvasQuality,
} from '../components/weather-effects/canvasEffects';

describe('weatherEffects catalog', () => {
  test('exposes shared effect options without leaking default config internals', () => {
    const matrix = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'matrix');
    const starfield = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'starfield');
    const mist = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'mist');
    const shojiDusk = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'shoji-dusk');
    const neonGrid = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'neon-grid');
    const starrySwirl = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'starry-swirl');
    const prismStage = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'prism-stage');
    const stainedGlass = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'stained-glass');
    const monochromeFilm = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'monochrome-film');
    const brutalistLight = WEATHER_EFFECT_OPTIONS.find((effect) => effect.id === 'brutalist-light');

    expect(matrix).toBeDefined();
    expect(matrix.name).toBe('Matrix');
    expect(matrix).not.toHaveProperty('defaultConfig');

    expect(starfield).toBeDefined();
    expect(starfield.description).toContain('comets');
    expect(starfield.renderer).toBe('canvas');

    expect(mist).toBeDefined();
    expect(mist.category).toBe('atmosphere');
    expect(mist.renderer).toBe('canvas');

    expect(shojiDusk).toBeDefined();
    expect(shojiDusk.renderer).toBe('dom');

    expect(neonGrid).toBeDefined();
    expect(neonGrid.category).toBe('digital');

    expect(starrySwirl).toBeDefined();
    expect(starrySwirl.category).toBe('artistic');
    expect(starrySwirl.renderer).toBe('dom');

    expect(prismStage).toBeDefined();
    expect(prismStage.description).toContain('Music-video');

    expect(stainedGlass).toBeDefined();
    expect(stainedGlass.artDirection).toBe('gallery');

    expect(monochromeFilm).toBeDefined();
    expect(monochromeFilm.artDirection).toBe('cinematic');

    expect(brutalistLight).toBeDefined();
    expect(brutalistLight.artDirection).toBe('stage');
  });

  test('builds default config for every effect from the shared catalog', () => {
    expect(DEFAULT_WEATHER_CONFIG.none).toEqual({ color: '#FFFFFF', opacity: 0, velocity: 1 });
    expect(DEFAULT_WEATHER_CONFIG.matrix).toEqual({ color: '#00FF41', opacity: 0.82, velocity: 1 });
    expect(DEFAULT_WEATHER_CONFIG.starfield).toEqual({ color: '#8AB4FF', opacity: 0.78, velocity: 1 });
    expect(DEFAULT_WEATHER_CONFIG['rain-glass']).toEqual({ color: '#8FC3FF', opacity: 0.64, velocity: 0.88 });
    expect(DEFAULT_WEATHER_CONFIG['festival-confetti']).toEqual({ color: '#FF5F5F', opacity: 0.78, velocity: 0.94 });
    expect(DEFAULT_WEATHER_CONFIG['watercolor-bloom']).toEqual({ color: '#F39AC5', opacity: 0.66, velocity: 0.78 });
    expect(DEFAULT_WEATHER_CONFIG['stained-glass']).toEqual({ color: '#F6B73C', opacity: 0.72, velocity: 0.76 });
  });

  test('returns shared labels and a safe fallback for unknown effects', () => {
    expect(getWeatherEffectLabel('sakura')).toBe('Cherry Blossoms');
    expect(getWeatherEffectLabel('neon-grid')).toBe('Neon Grid');
    expect(getWeatherEffectLabel('ink-wash')).toBe('Ink Wash');
    expect(getWeatherArtDirectionLabel('cinematic')).toBe('Cinematic');
    expect(getWeatherEffect('missing-effect').id).toBe('none');
    expect(getWeatherEffectLabel('missing-effect')).toBe('None');
  });

  test('groups effects by shared category order without dropping entries', () => {
    const groupedEffects = getWeatherEffectsByCategory();
    const groupedIds = groupedEffects.flatMap((group) => group.effects.map((effect) => effect.id));
    const optionIds = WEATHER_EFFECT_OPTIONS.map((effect) => effect.id);

    expect(groupedEffects.map((group) => group.id)).toEqual(WEATHER_EFFECT_CATEGORIES.map((category) => category.id));
    expect(groupedEffects.find((group) => group.id === 'places').effects.some((effect) => effect.id === 'lantern-bazaar')).toBe(true);
    expect(groupedEffects.find((group) => group.id === 'celebration').effects.map((effect) => effect.id)).toContain('festival-confetti');
    expect(groupedEffects.find((group) => group.id === 'artistic').effects.map((effect) => effect.id)).toContain('surreal-dream');
    expect(groupedIds).toHaveLength(optionIds.length);
    expect(new Set(groupedIds)).toEqual(new Set(optionIds));
  });

  test('groups effects by art direction for curated browsing', () => {
    const groupedEffects = getWeatherEffectsByArtDirection();

    expect(groupedEffects.map((group) => group.id)).toEqual(WEATHER_ART_DIRECTIONS.map((direction) => direction.id));
    expect(groupedEffects.find((group) => group.id === 'gallery').effects.map((effect) => effect.id)).toContain('stained-glass');
    expect(groupedEffects.find((group) => group.id === 'cinematic').effects.map((effect) => effect.id)).toContain('monochrome-film');
    expect(groupedEffects.find((group) => group.id === 'stage').effects.map((effect) => effect.id)).toContain('brutalist-light');
  });
});

describe('canvas weather effect registry', () => {
  test('contains modular definitions for matrix, starfield, and extended scenic effects', () => {
    const matrix = getCanvasEffect('matrix');
    const starfield = getCanvasEffect('starfield');
    const rainGlass = getCanvasEffect('rain-glass');
    const templeGarden = getCanvasEffect('temple-garden');

    expect(matrix).toBeDefined();
    expect(typeof matrix.createParticle).toBe('function');
    expect(typeof matrix.updateParticle).toBe('function');
    expect(typeof matrix.drawParticle).toBe('function');

    expect(starfield).toBeDefined();
    expect(typeof starfield.prepareFrame).toBe('function');

    expect(rainGlass).toBeDefined();
    expect(typeof rainGlass.drawParticle).toBe('function');

    expect(templeGarden).toBeDefined();
    expect(typeof templeGarden.prepareFrame).toBe('function');
  });

  test('derives reduced particle quality rules from effect performance', () => {
    const matrixQuality = getCanvasQuality('matrix', 1920, 1080);
    const starfieldQuality = getCanvasQuality('starfield', 1280, 720);
    const monsoonQuality = getCanvasQuality('monsoon-veranda', 1920, 1080);
    const confettiQuality = getCanvasQuality('festival-confetti', 1280, 720);

    expect(matrixQuality.targetFPS).toBe(18);
    expect(matrixQuality.particleCount).toBeGreaterThanOrEqual(12);
    expect(starfieldQuality.targetFPS).toBe(24);
    expect(starfieldQuality.viewportWidth).toBe(1280);
    expect(starfieldQuality.viewportHeight).toBe(720);
    expect(monsoonQuality.targetFPS).toBe(18);
    expect(confettiQuality.targetFPS).toBe(24);
  });
});