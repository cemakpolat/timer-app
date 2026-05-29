export const DEFAULT_SLIDE_TRANSITION = 'fade';

export const SLIDE_TRANSITION_OPTIONS = [
  {
    value: 'fade',
    label: 'Soft Crossfade',
    description: 'Classic blend between slides with no directional motion.',
  },
  {
    value: 'dissolve',
    label: 'Slow Dissolve',
    description: 'Longer fade for extra calm transitions.',
  },
  {
    value: 'dip-neutral',
    label: 'Dip to Neutral',
    description: 'Briefly softens brightness/contrast to reduce harsh color jumps.',
  },
  {
    value: 'luma-fade',
    label: 'Luma Fade',
    description: 'Brightness-balanced fade that smooths light/dark changes.',
  },
  {
    value: 'blur-blend',
    label: 'Blur Blend',
    description: 'Tiny blur while blending for a softer handoff.',
  },
  {
    value: 'zoom-in-soft',
    label: 'Micro Zoom In',
    description: 'Incoming slide settles from a very slight zoom-in.',
  },
  {
    value: 'zoom-out-soft',
    label: 'Micro Zoom Out',
    description: 'Incoming slide settles from a very slight zoom-out.',
  },
  {
    value: 'drift-up-soft',
    label: 'Soft Vertical Drift',
    description: 'Subtle upward drift during the fade.',
  },
  {
    value: 'drift-side-soft',
    label: 'Soft Horizontal Drift',
    description: 'Subtle sideways drift during the fade.',
  },
  {
    value: 'contrast-soft',
    label: 'Opacity + Contrast Normalize',
    description: 'Gently normalizes contrast/saturation as the slide appears.',
  },
  {
    value: 'mask-soft',
    label: 'Gentle Mask Reveal',
    description: 'Feathered reveal with soft edges and minimal movement.',
  },
  {
    value: 'adaptive-soft',
    label: 'Smart Adaptive',
    description: 'Automatically picks a smooth profile for image/video combinations.',
  },
];

const SLIDE_TRANSITION_LOOKUP = Object.fromEntries(
  SLIDE_TRANSITION_OPTIONS.map((option) => [option.value, option])
);

const SLIDE_TRANSITION_VALUES = new Set(SLIDE_TRANSITION_OPTIONS.map((option) => option.value));

export const isValidSlideTransition = (value) => SLIDE_TRANSITION_VALUES.has(value);

export const getSlideTransitionOption = (value) => {
  const normalized = normalizeSlideTransition(value);
  return SLIDE_TRANSITION_LOOKUP[normalized] || SLIDE_TRANSITION_LOOKUP[DEFAULT_SLIDE_TRANSITION];
};

export const normalizeSlideTransition = (value) => (
  isValidSlideTransition(value) ? value : DEFAULT_SLIDE_TRANSITION
);
