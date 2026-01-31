import {
  inputStyle,
  buttonStyle,
  cardStyle,
  selectStyle,
  textAreaStyle,
  checkboxStyle
} from '../utils/styleHelpers';

describe('styleHelpers', () => {
  const mockTheme = {
    card: '#ffffff',
    text: '#000000',
    accent: '#007bff'
  };

  describe('inputStyle', () => {
    test('returns object with required properties', () => {
      const style = inputStyle(mockTheme);
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius');
      expect(style).toHaveProperty('backgroundColor');
      expect(style).toHaveProperty('color');
    });

    test('uses theme card color for background', () => {
      const style = inputStyle(mockTheme);
      expect(style.backgroundColor).toContain('255, 255, 255'); // rgba of #ffffff
    });

    test('uses theme text color', () => {
      const style = inputStyle(mockTheme);
      expect(style.color).toBe(mockTheme.text);
    });

    test('uses theme accent for border color', () => {
      const style = inputStyle(mockTheme);
      expect(style.borderColor).toContain('0, 123, 255'); // rgba of #007bff
    });

    test('includes focus styles', () => {
      const style = inputStyle(mockTheme);
      expect(style.outline).toBe('none');
      expect(style.boxShadow).toContain(mockTheme.accent);
    });

    test('has proper dimensions', () => {
      const style = inputStyle(mockTheme);
      expect(style.width).toBe('100%');
      expect(style.fontSize).toBe('14px');
    });
  });

  describe('buttonStyle', () => {
    test('returns object with button-specific properties', () => {
      const style = buttonStyle(mockTheme);
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('backgroundColor');
      expect(style).toHaveProperty('color');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('cursor');
    });

    test('uses theme accent for background', () => {
      const style = buttonStyle(mockTheme);
      expect(style.backgroundColor).toBe(mockTheme.accent);
    });

    test('has cursor pointer', () => {
      const style = buttonStyle(mockTheme);
      expect(style.cursor).toBe('pointer');
    });

    test('has proper border radius', () => {
      const style = buttonStyle(mockTheme);
      expect(style.borderRadius).toBe('8px');
    });

    test('includes transition', () => {
      const style = buttonStyle(mockTheme);
      expect(style.transition).toContain('all');
    });

    test('has no border', () => {
      const style = buttonStyle(mockTheme);
      expect(style.border).toBe('none');
    });
  });

  describe('cardStyle', () => {
    test('returns object with card-specific properties', () => {
      const style = cardStyle(mockTheme);
      expect(style).toHaveProperty('backgroundColor');
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('borderRadius');
      expect(style).toHaveProperty('boxShadow');
    });

    test('uses theme card color for background', () => {
      const style = cardStyle(mockTheme);
      expect(style.backgroundColor).toContain('255, 255, 255'); // rgba of #ffffff
    });

    test('has proper border radius', () => {
      const style = cardStyle(mockTheme);
      expect(style.borderRadius).toBe('12px');
    });

    test('includes box shadow', () => {
      const style = cardStyle(mockTheme);
      expect(style.boxShadow).toBeDefined();
      expect(style.boxShadow).toContain('rgba');
    });

    test('has adequate padding', () => {
      const style = cardStyle(mockTheme);
      expect(style.padding).toBe('20px');
    });
  });

  describe('selectStyle', () => {
    test('returns object with select-specific properties', () => {
      const style = selectStyle(mockTheme);
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius');
      expect(style).toHaveProperty('backgroundColor');
      expect(style).toHaveProperty('color');
      expect(style).toHaveProperty('cursor');
    });

    test('uses theme card color for background', () => {
      const style = selectStyle(mockTheme);
      expect(style.backgroundColor).toContain('255, 255, 255'); // rgba of #ffffff
    });

    test('has cursor pointer', () => {
      const style = selectStyle(mockTheme);
      expect(style.cursor).toBe('pointer');
    });

    test('has full width', () => {
      const style = selectStyle(mockTheme);
      expect(style.width).toBe('100%');
    });

    test('uses theme accent for border', () => {
      const style = selectStyle(mockTheme);
      expect(style.borderColor).toContain('0, 123, 255'); // rgba of #007bff
    });
  });

  describe('textAreaStyle', () => {
    test('returns object with textarea-specific properties', () => {
      const style = textAreaStyle(mockTheme);
      expect(style).toHaveProperty('padding');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius');
      expect(style).toHaveProperty('backgroundColor');
      expect(style).toHaveProperty('color');
      expect(style).toHaveProperty('resize');
    });

    test('uses theme card color for background', () => {
      const style = textAreaStyle(mockTheme);
      expect(style.backgroundColor).toContain('255, 255, 255'); // rgba of #ffffff
    });

    test('uses theme text color', () => {
      const style = textAreaStyle(mockTheme);
      expect(style.color).toBe(mockTheme.text);
    });

    test('has proper resize setting', () => {
      const style = textAreaStyle(mockTheme);
      expect(style.resize).toBe('vertical');
    });

    test('has minimum height', () => {
      const style = textAreaStyle(mockTheme);
      expect(style.minHeight).toBe('100px');
    });

    test('has full width', () => {
      const style = textAreaStyle(mockTheme);
      expect(style.width).toBe('100%');
    });

    test('uses monospace font family', () => {
      const style = textAreaStyle(mockTheme);
      expect(style.fontFamily).toContain('monospace');
    });
  });

  describe('checkboxStyle', () => {
    test('returns object with checkbox-specific properties', () => {
      const style = checkboxStyle(mockTheme);
      expect(style).toHaveProperty('width');
      expect(style).toHaveProperty('height');
      expect(style).toHaveProperty('cursor');
      expect(style).toHaveProperty('accentColor');
    });

    test('has cursor pointer', () => {
      const style = checkboxStyle(mockTheme);
      expect(style.cursor).toBe('pointer');
    });

    test('uses theme accent color', () => {
      const style = checkboxStyle(mockTheme);
      expect(style.accentColor).toBe(mockTheme.accent);
    });

    test('has proper dimensions', () => {
      const style = checkboxStyle(mockTheme);
      expect(style.width).toBe('18px');
      expect(style.height).toBe('18px');
    });
  });

  describe('Theme variations', () => {
    test('handles dark theme', () => {
      const darkTheme = {
        card: '#1a1a1a',
        text: '#ffffff',
        accent: '#00ff00'
      };
      
      const inputStyles = inputStyle(darkTheme);
      expect(inputStyles.color).toBe('#ffffff');
      expect(inputStyles.backgroundColor).toContain('26, 26, 26'); // rgba of #1a1a1a
    });

    test('handles light theme', () => {
      const lightTheme = {
        card: '#f5f5f5',
        text: '#333333',
        accent: '#ff6b6b'
      };
      
      const buttonStyles = buttonStyle(lightTheme);
      expect(buttonStyles.backgroundColor).toBe('#ff6b6b');
    });

    test('all helpers accept theme parameter', () => {
      const customTheme = {
        card: '#123456',
        text: '#abcdef',
        accent: '#fedcba'
      };

      expect(() => inputStyle(customTheme)).not.toThrow();
      expect(() => buttonStyle(customTheme)).not.toThrow();
      expect(() => cardStyle(customTheme)).not.toThrow();
      expect(() => selectStyle(customTheme)).not.toThrow();
      expect(() => textAreaStyle(customTheme)).not.toThrow();
      expect(() => checkboxStyle(customTheme)).not.toThrow();
    });
  });

  describe('Consistency across styles', () => {
    test('input and select have similar structure', () => {
      const input = inputStyle(mockTheme);
      const select = selectStyle(mockTheme);
      
      expect(input.borderRadius).toBe(select.borderRadius);
      expect(input.fontSize).toBe(select.fontSize);
      expect(input.color).toBe(select.color);
    });

    test('all styles use rgba for transparency', () => {
      const styles = [
        inputStyle(mockTheme),
        cardStyle(mockTheme),
        selectStyle(mockTheme),
        textAreaStyle(mockTheme)
      ];

      styles.forEach(style => {
        if (style.backgroundColor) {
          expect(style.backgroundColor).toContain('rgba');
        }
      });
    });
  });
});
