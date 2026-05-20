import {
  getLuminance,
  isLightColor,
  getContrastColor,
  hexToRgba,
  getTextOpacity,
  isValidHexColor,
  lightenColor,
  darkenColor
} from '../utils/colorUtils';

describe('colorUtils', () => {
  describe('getLuminance', () => {
    test('calculates luminance for pure black', () => {
      expect(getLuminance('#000000')).toBeCloseTo(0, 2);
    });

    test('calculates luminance for pure white', () => {
      expect(getLuminance('#ffffff')).toBeCloseTo(1, 2);
    });

    test('calculates luminance for medium gray', () => {
      const luminance = getLuminance('#808080');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });

    test('calculates luminance for red', () => {
      const luminance = getLuminance('#ff0000');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(0.5);
    });

    test('handles lowercase hex colors', () => {
      expect(getLuminance('#ffffff')).toEqual(getLuminance('#FFFFFF'));
    });
  });

  describe('isLightColor', () => {
    test('identifies white as light', () => {
      expect(isLightColor('#ffffff')).toBe(true);
    });

    test('identifies black as dark', () => {
      expect(isLightColor('#000000')).toBe(false);
    });

    test('identifies light gray as light', () => {
      expect(isLightColor('#cccccc')).toBe(true);
    });

    test('identifies dark gray as dark', () => {
      expect(isLightColor('#333333')).toBe(false);
    });

    test('identifies yellow as light', () => {
      expect(isLightColor('#ffff00')).toBe(true);
    });
  });

  describe('getContrastColor', () => {
    test('returns black for light backgrounds', () => {
      expect(getContrastColor('#ffffff')).toBe('#000000');
    });

    test('returns white for dark backgrounds', () => {
      expect(getContrastColor('#000000')).toBe('#ffffff');
    });

    test('returns black for yellow (light color)', () => {
      expect(getContrastColor('#ffff00')).toBe('#000000');
    });

    test('returns white for blue (dark color)', () => {
      expect(getContrastColor('#0000ff')).toBe('#ffffff');
    });
  });

  describe('hexToRgba', () => {
    test('converts hex to rgba with default opacity', () => {
      expect(hexToRgba('#ff0000')).toBe('rgba(255, 0, 0, 1)');
    });

    test('converts hex to rgba with custom opacity', () => {
      expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    });

    test('handles white color', () => {
      expect(hexToRgba('#ffffff', 0.8)).toBe('rgba(255, 255, 255, 0.8)');
    });

    test('handles black color', () => {
      expect(hexToRgba('#000000', 0.3)).toBe('rgba(0, 0, 0, 0.3)');
    });

    test('handles colors with leading #', () => {
      expect(hexToRgba('#123456', 0.7)).toBe('rgba(18, 52, 86, 0.7)');
    });
  });

  describe('getTextOpacity', () => {
    test('applies default opacity to theme text color', () => {
      const theme = { text: '#ffffff' };
      expect(getTextOpacity(theme)).toBe('rgba(255, 255, 255, 0.7)');
    });

    test('applies custom opacity to theme text color', () => {
      const theme = { text: '#000000' };
      expect(getTextOpacity(theme, 0.5)).toBe('rgba(0, 0, 0, 0.5)');
    });

    test('uses default white if theme.text is missing', () => {
      const theme = {};
      expect(getTextOpacity(theme, 0.9)).toBe('rgba(255, 255, 255, 0.9)');
    });
  });

  describe('isValidHexColor', () => {
    test('validates 6-digit hex colors', () => {
      expect(isValidHexColor('#ffffff')).toBe(true);
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#abc123')).toBe(true);
    });

    test('validates 3-digit hex colors', () => {
      expect(isValidHexColor('#fff')).toBe(true);
      expect(isValidHexColor('#000')).toBe(true);
      expect(isValidHexColor('#a1b')).toBe(true);
    });

    test('rejects invalid hex colors', () => {
      expect(isValidHexColor('ffffff')).toBe(false); // missing #
      expect(isValidHexColor('#gggggg')).toBe(false); // invalid characters
      expect(isValidHexColor('#12345')).toBe(false); // wrong length
      expect(isValidHexColor('#12')).toBe(false); // too short
      expect(isValidHexColor('')).toBe(false); // empty string
    });

    test('handles uppercase hex colors', () => {
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#ABC')).toBe(true);
    });
  });

  describe('lightenColor', () => {
    test('lightens black color', () => {
      const lightened = lightenColor('#000000', 20);
      expect(lightened).not.toBe('#000000');
      expect(getLuminance(lightened)).toBeGreaterThan(getLuminance('#000000'));
    });

    test('lightens by 0% returns same color', () => {
      expect(lightenColor('#ff0000', 0)).toBe('#ff0000');
    });

    test('lightens by 100% approaches white', () => {
      const lightened = lightenColor('#000000', 100);
      expect(lightened).toBe('#ffffff');
    });

    test('maintains hex format', () => {
      const lightened = lightenColor('#123456', 30);
      expect(lightened).toMatch(/^#[0-9a-f]{6}$/);
    });

    test('clamps values at 255', () => {
      const lightened = lightenColor('#f0f0f0', 50);
      expect(lightened).toBe('#ffffff');
    });
  });

  describe('darkenColor', () => {
    test('darkens white color', () => {
      const darkened = darkenColor('#ffffff', 20);
      expect(darkened).not.toBe('#ffffff');
      expect(getLuminance(darkened)).toBeLessThan(getLuminance('#ffffff'));
    });

    test('darkens by 0% returns same color', () => {
      expect(darkenColor('#ff0000', 0)).toBe('#ff0000');
    });

    test('darkens by 100% becomes black', () => {
      const darkened = darkenColor('#ffffff', 100);
      expect(darkened).toBe('#000000');
    });

    test('maintains hex format', () => {
      const darkened = darkenColor('#abcdef', 30);
      expect(darkened).toMatch(/^#[0-9a-f]{6}$/);
    });

    test('clamps values at 0', () => {
      const darkened = darkenColor('#0f0f0f', 50);
      expect(darkened).toBe('#000000');
    });
  });
});
