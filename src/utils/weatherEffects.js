export const WEATHER_EFFECTS = [
  {
    id: 'none',
    name: 'None',
    icon: '🚫',
    description: 'Keep the background clean and still.',
    renderer: 'none',
    defaultConfig: { color: '#FFFFFF', opacity: 0, velocity: 1 },
  },
  {
    id: 'rain',
    name: 'Rain',
    icon: '🌧️',
    description: 'Fine cinematic rainfall with layered depth.',
    renderer: 'canvas',
    defaultConfig: { color: '#4682B4', opacity: 0.6, velocity: 1 },
  },
  {
    id: 'cloudy',
    name: 'Cloudy',
    icon: '☁️',
    description: 'Soft atmospheric cloud cover and haze.',
    renderer: 'dom',
    defaultConfig: { color: '#FFFFFF', opacity: 0.8, velocity: 1 },
  },
  {
    id: 'sunny',
    name: 'Sunny',
    icon: '☀️',
    description: 'Warm golden light with drifting flares.',
    renderer: 'dom',
    defaultConfig: { color: '#FFD700', opacity: 0.2, velocity: 1 },
  },
  {
    id: 'winter',
    name: 'Winter',
    icon: '❄️',
    description: 'Layered snowfall with soft bloom.',
    renderer: 'canvas',
    defaultConfig: { color: '#FFFFFF', opacity: 0.6, velocity: 1 },
  },
  {
    id: 'autumn',
    name: 'Autumn',
    icon: '🍂',
    description: 'Tumbling leaves with warm, dry motion.',
    renderer: 'canvas',
    defaultConfig: { color: '#D2691E', opacity: 0.7, velocity: 1 },
  },
  {
    id: 'spring',
    name: 'Spring',
    icon: '🌸',
    description: 'Fresh blooms drifting through the air.',
    renderer: 'canvas',
    defaultConfig: { color: '#FFB6C1', opacity: 0.7, velocity: 1 },
  },
  {
    id: 'sakura',
    name: 'Cherry Blossoms',
    icon: '🌸',
    description: 'Delicate petals with elegant spirals.',
    renderer: 'canvas',
    defaultConfig: { color: '#FFB7C5', opacity: 0.8, velocity: 1 },
  },
  {
    id: 'fireflies',
    name: 'Fireflies',
    icon: '✨',
    description: 'Glowing dots with a slow summer pulse.',
    renderer: 'canvas',
    defaultConfig: { color: '#FFD700', opacity: 0.9, velocity: 1 },
  },
  {
    id: 'butterflies',
    name: 'Butterflies',
    icon: '🦋',
    description: 'Fluttering silhouettes with organic arcs.',
    renderer: 'canvas',
    defaultConfig: { color: '#FF69B4', opacity: 0.85, velocity: 1 },
  },
  {
    id: 'lanterns',
    name: 'Lanterns',
    icon: '🏮',
    description: 'Floating lanterns with a warm dusk glow.',
    renderer: 'canvas',
    defaultConfig: { color: '#FF0000', opacity: 0.85, velocity: 1 },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    icon: '🌌',
    description: 'Diffuse northern lights sweeping overhead.',
    renderer: 'canvas',
    defaultConfig: { color: '#00FF80', opacity: 0.6, velocity: 1 },
  },
  {
    id: 'starfield',
    name: 'Starfield',
    icon: '🌠',
    description: 'Deep-space drift with twinkling comets.',
    renderer: 'canvas',
    defaultConfig: { color: '#8AB4FF', opacity: 0.78, velocity: 1 },
  },
  {
    id: 'desert',
    name: 'Desert',
    icon: '🏜️',
    description: 'Dry sand drift in low-contrast layers.',
    renderer: 'canvas',
    defaultConfig: { color: '#DEB887', opacity: 0.5, velocity: 1 },
  },
  {
    id: 'tropical',
    name: 'Tropical',
    icon: '🌴',
    description: 'Vibrant petals and warm island motion.',
    renderer: 'canvas',
    defaultConfig: { color: '#FF69B4', opacity: 0.8, velocity: 1 },
  },
  {
    id: 'coffee',
    name: 'Coffee Shop',
    icon: '☕',
    description: 'Soft smoke columns and ambient warmth.',
    renderer: 'canvas',
    defaultConfig: { color: '#8B4513', opacity: 0.6, velocity: 1 },
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    icon: '🔥',
    description: 'Ember-rich flame glow with subtle flicker.',
    renderer: 'canvas',
    defaultConfig: { color: '#FF4500', opacity: 0.8, velocity: 1 },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    icon: '💻',
    description: 'Neon code rain with digital afterglow.',
    renderer: 'canvas',
    defaultConfig: { color: '#00FF41', opacity: 0.82, velocity: 1 },
  },
];

export const WEATHER_EFFECT_OPTIONS = WEATHER_EFFECTS.map(({ defaultConfig, ...effect }) => effect);

export const WEATHER_EFFECT_MAP = WEATHER_EFFECTS.reduce((effectMap, effect) => {
  effectMap[effect.id] = effect;
  return effectMap;
}, {});

export const DEFAULT_WEATHER_CONFIG = WEATHER_EFFECTS.reduce((config, effect) => {
  config[effect.id] = effect.defaultConfig;
  return config;
}, {});

export const getWeatherEffect = (effectId) => WEATHER_EFFECT_MAP[effectId] || WEATHER_EFFECT_MAP.none;

export const getWeatherEffectLabel = (effectId) => getWeatherEffect(effectId).name;